import { useState, useEffect, useRef, useCallback } from "react"
import clsx from "clsx";
import { useNavigate, Link, useSearchParams } from "react-router-dom"
import { toast } from "react-toastify"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Mail, CheckCircle2, Loader2, KeyRound, Edit2 } from "lucide-react"
import axiosInstance from "../../core/axiosInstance"
import { getUserByToken, useAuth } from "../../core/authProvider"
import AuthLayout from "./AuthLayout"

export default function VerifyEmailScreen() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { saveAuth, setCurrentUser } = useAuth()
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [isEmailEditable, setIsEmailEditable] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const codeInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const emailParam = searchParams.get("email")
    const storedEmail = localStorage.getItem("pending-verification-email")

    if (emailParam) {
      setEmail(emailParam)
    } else if (storedEmail) {
      setEmail(storedEmail)
    }

    setTimeout(() => {
      codeInputRef.current?.focus()
    }, 100)
  }, [searchParams])

  const verifyEmail = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }
    if (!email || !code) {
      toast.error("Please enter both email and verification code")
      return
    }

    if (code.length !== 6) {
      toast.error("Verification code must be 6 digits")
      return
    }

    setIsVerifying(true)
    setError(null)
    try {
      const response = await axiosInstance.post(`/auth/verify-code`, {
        email,
        code
      })
      if (response.status === 200) {
        const data = response.data
        setIsVerified(true)
        localStorage.removeItem("pending-verification-email")

        if (data.access_token) {
          try {
            saveAuth({ access_token: data.access_token })
            const { data: user } = await getUserByToken(data.access_token)
            setCurrentUser(user)
            toast.success("Email verified successfully! Logging you in...")
            navigate("/setup-payment")
          } catch (loginErr) {
            console.error("Auto-login failed:", loginErr)
            toast.success("Email verified successfully! Please log in.")
            setTimeout(() => {
              navigate("/login")
            }, 2000)
          }
        } else {
          toast.success("Email verified successfully! You can now log in.")
          setTimeout(() => {
            navigate("/login")
          }, 2000)
        }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || "Verification failed. The code may be invalid or expired."
      setError(errorMessage)
      toast.error(errorMessage)
      setCode("")
      codeInputRef.current?.focus()
    } finally {
      setIsVerifying(false)
    }
  }, [email, code, saveAuth, setCurrentUser, navigate])

  useEffect(() => {
    if (code.length === 6 && email && !isVerifying && !isVerified) {
      const timer = setTimeout(() => {
        verifyEmail()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [code, email, isVerifying, isVerified, verifyEmail])

  const resendVerificationEmail = async () => {
    if (!email) {
      toast.error("Please enter your email address")
      return
    }

    setIsResending(true)
    setError(null)
    try {
      await axiosInstance.post("/auth/resend-verification", {
        email
      })
      toast.success("Verification code sent! Please check your inbox.")
      setCode("") // Clear the code field
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || "Failed to resend verification code. Please try again."
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsResending(false)
    }
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setCode(value)
    if (error) {
      setError(null)
    }
  }

  return (
    <AuthLayout
      title={isVerified ? "Email Verified!" : "Verify Your Email"}
      description={
        isVerified
          ? "Your email has been successfully verified"
          : email
            ? ""
            : "Enter your email and the 6-digit verification code sent to your inbox"
      }
    >
      {(theme, isDarkMode) => (
        <div className="space-y-6">
          {isVerified ? (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <div className={clsx(
                  "rounded-full p-4",
                  isDarkMode ? "bg-green-900/30" : "bg-green-100"
                )}>
                  <CheckCircle2 className={clsx(
                    "w-12 h-12",
                    isDarkMode ? "text-green-400" : "text-green-600"
                  )} />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className={clsx("text-2xl font-bold", theme.labelColor)} style={{ textShadow: theme.labelShadow }}>
                  Email Verified!
                </h2>
                <p className={clsx("text-base", theme.descColor)} style={{ textShadow: theme.descShadow }}>
                  Your email has been successfully verified. Logging you in...
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {email && (
                <div className={clsx(
                  "rounded-lg p-4 border-2",
                  isDarkMode ? "bg-blue-900/20 border-blue-500/50" : "bg-blue-50 border-blue-200"
                )}>
                  <p className={clsx(
                    "text-sm text-center",
                    isDarkMode ? "text-blue-200" : "text-blue-700"
                  )}>
                    We've sent a 6-digit verification code to <span className="font-semibold">{email}</span>
                  </p>
                </div>
              )}
              {!email && (
                <div className={clsx(
                  "rounded-lg p-4 border-2",
                  isDarkMode ? "bg-blue-900/20 border-blue-500/50" : "bg-blue-50 border-blue-200"
                )}>
                  <p className={clsx(
                    "text-sm",
                    isDarkMode ? "text-blue-200" : "text-blue-700"
                  )}>
                    Check your email for a 6-digit verification code. Enter it below along with your email address.
                  </p>
                </div>
              )}

              <form onSubmit={verifyEmail} className="space-y-4">
                {/* Only show email input if no email is set OR if user clicked "Change email" */}
                {(isEmailEditable || !email) && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email" className={theme.labelColor} style={{ textShadow: theme.labelShadow }}>
                        Email Address
                      </Label>
                      {email && isEmailEditable && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsEmailEditable(false)
                            // Restore original email if user cancels
                            const storedEmail = localStorage.getItem("pending-verification-email")
                            const emailParam = searchParams.get("email")
                            if (emailParam) {
                              setEmail(emailParam)
                            } else if (storedEmail) {
                              setEmail(storedEmail)
                            }
                          }}
                          className={clsx(
                            "text-xs flex items-center gap-1 cursor-pointer",
                            isDarkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-600 hover:text-gray-700"
                          )}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Mail
                        className={clsx(
                          "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                        )}
                        style={{ color: theme.cardBorder }}
                      />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={clsx(
                          "pl-10",
                          theme.inputBg,
                          theme.inputText,
                          theme.inputPlaceholder
                        )}
                        style={{ border: `2px solid ${theme.inputBorder}`, boxShadow: theme.inputShadow }}
                        required
                        disabled={isVerifying}
                      />
                    </div>
                  </div>
                )}

                {/* Show "Change email" button when email is set and input is hidden */}
                {email && !isEmailEditable && (
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => setIsEmailEditable(true)}
                      className={clsx(
                        "text-sm flex items-center gap-1 cursor-pointer",
                        isDarkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
                      )}
                    >
                      <Edit2 className="w-4 h-4" />
                      Change email address
                    </button>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="code" className={theme.labelColor} style={{ textShadow: theme.labelShadow }}>
                    Verification Code
                  </Label>
                  <div className="relative">
                    <KeyRound className={clsx(
                      "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                    )} style={{ color: theme.cardBorder }} />
                    <Input
                      ref={codeInputRef}
                      id="code"
                      type="text"
                      inputMode="numeric"
                      placeholder="000000"
                      value={code}
                      onChange={handleCodeChange}
                      className={clsx(
                        "pl-10 text-center text-2xl tracking-widest font-mono",
                        theme.inputBg,
                        theme.inputText,
                        theme.inputPlaceholder
                      )}
                      style={{ border: `2px solid ${theme.inputBorder}`, boxShadow: theme.inputShadow }}
                      required
                      maxLength={6}
                      disabled={isVerifying}
                      autoComplete="one-time-code"
                    />
                  </div>
                  <p className={clsx(
                    "text-xs", theme.descColor
                  )} style={{ textShadow: theme.descShadow }}>
                    {code.length > 0 && code.length < 6 && (
                      <span className="inline-block mr-1">⏳</span>
                    )}
                    {code.length === 6 && !isVerifying && (
                      <span className="inline-block mr-1">✓</span>
                    )}
                    Enter the 6-digit code sent to your email. {code.length === 6 && !isVerifying && "Verifying automatically..."}
                  </p>
                </div>

                {error && (
                  <div className={clsx(
                    "text-sm",
                    isDarkMode ? "text-red-400" : "text-red-600"
                  )}>
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={!email || !code || code.length !== 6 || isVerifying}
                  className={clsx(
                    "w-full h-12 text-white border-0 transition-all duration-200 disabled:opacity-50"
                  )}
                  style={{ background: theme.buttonGradient, boxShadow: theme.buttonShadow }}
                >
                  {isVerifying ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Verify Email
                    </div>
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" style={{ borderColor: theme.cardBorder }}></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className={clsx(
                    isDarkMode ? "bg-black" : "bg-white",
                    "px-2",
                    theme.descColor
                  )} style={{ textShadow: theme.descShadow }}>
                    Didn't receive a code?
                  </span>
                </div>
              </div>

              <Button
                onClick={resendVerificationEmail}
                disabled={!email || isResending}
                variant="outline"
                className={clsx(
                  "w-full h-12 border-0 transition-all duration-200 disabled:opacity-50"
                )}
                style={{
                  background: isDarkMode ? '#1f2937' : '#f3f4f6',
                  color: isDarkMode ? '#f8fafc' : '#1e293b',
                  boxShadow: theme.inputShadow
                }}
              >
                {isResending ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Resend Verification Code
                  </div>
                )}
              </Button>

              <div className="text-center space-y-2">
                <p className={clsx("text-sm", theme.textColor)} style={{ textShadow: theme.textShadow }}>
                  Already verified? <Link to="/login" className="underline">Sign in</Link>
                </p>
                <p className={clsx("text-sm", theme.textColor)} style={{ textShadow: theme.textShadow }}>
                  Don't have an account? <Link to="/signup" className="underline">Sign up</Link>
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </AuthLayout>
  )
}
