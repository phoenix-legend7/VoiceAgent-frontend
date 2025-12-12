import { AxiosError } from "axios"
import { useState } from "react"
import { toast } from "react-toastify"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Separator } from "../../components/ui/separator"
import { Mail, Lock, Sparkles, User } from "lucide-react"
import axiosInstance from "../../core/axiosInstance"
import { Link, useNavigate } from "react-router-dom"
import AuthLayout from "./AuthLayout"

export default function SignupScreen() {
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const hasMinLength = password.length >= 12
  const hasNumber = /\d/.test(password)
  const hasSymbol = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password)
  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  const isStrongPassword = hasMinLength && hasNumber && hasSymbol && hasUpper && hasLower

  const handleGoogleSignup = async () => {
    try {
      setIsLoading(true)
      const response = await axiosInstance.get("/auth/google/authorize")
      const data = response.data
      const url = data.authorization_url
      if (!url) {
        toast.error("Failed to get authentication url");
        return;
      }
      window.location.assign(url);
    } catch (e) {
      toast.error("Failed to get authentication url");
    } finally {
      setIsLoading(false);
    }
  }

  const handleAccountInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName || !lastName || !email || !password) return
    if (!isStrongPassword) {
      toast.error("Password must meet all strength requirements")
      return
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setIsLoading(true)
    try {
      await axiosInstance.post("/auth/register", {
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      })

      // User is created but not verified - don't auto-login
      // Store email for verification page
      localStorage.setItem("pending-verification-email", email)
      toast.success("Account created! Redirecting to email verification...")
      setTimeout(() => {
        navigate(`/verify-email?email=${encodeURIComponent(email)}`)
      }, 500)
    } catch (err) {
      const error = err as AxiosError
      if ((error.response?.data as any)?.detail) {
        const detail = (error.response?.data as any).detail
        if (detail === "REGISTER_USER_ALREADY_EXISTS") {
          // User already exists - check if email is verified
          // If not verified, redirect to verification page (allow them to signup again)
          toast.info("Account already exists. Redirecting to email verification...")
          localStorage.setItem("pending-verification-email", email)
          setTimeout(() => {
            navigate(`/verify-email?email=${encodeURIComponent(email)}`)
          }, 1000)
        } else {
          toast.error(`Failed to sign up: ${detail}`)
        }
      } else {
        toast.error("Failed to sign up. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Create your Spark account"
      description="Build powerful AI voice agents in minutes"
    >
      {(theme, isDarkMode) => (
        <div className="space-y-6">
          <Button
            onClick={handleGoogleSignup}
            disabled={isLoading}
            className={`
                    w-full h-12 flex items-center justify-center font-semibold rounded-lg
                    transition-all duration-200 shadow-md border
                    ${isDarkMode
                ? "bg-[#111827]! hover:bg[#1f2937]! text-white! border-gray-700"
                : "bg-white! hover:bg-gray-100! text-gray-900! border-gray-300"
              }
                  `}
            style={{
              boxShadow: isDarkMode
                ? "0 4px 24px 0 rgba(0,0,0,0.85),0 0 0 3px rgba(66,133,244,.12)"
                : "0 4px 16px 0 rgba(60,64,67,.08),0 0 0 3px rgba(66,133,244,.15)"
            }}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                Signing up...
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign up with Google
              </div>
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator
                className="w-full"
                style={{
                  background: `linear-gradient(90deg, transparent, ${theme.cardBorder}, transparent)`,
                  height: "2px",
                  boxShadow: `0 0 10px ${theme.cardBorder}`,
                }}
              />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className={`${isDarkMode ? 'bg-black' : 'bg-white'} px-2 ${theme.descColor}`} style={{ textShadow: theme.descShadow }}>
                Or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleAccountInfoSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className={theme.labelColor} style={{ textShadow: theme.labelShadow }}>
                  First name
                </Label>
                <div className="relative">
                  <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4`} style={{ color: theme.cardBorder }} />
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Enter your first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={`pl-10 ${theme.inputBg} ${theme.inputText} ${theme.inputPlaceholder}`}
                    style={{ border: `2px solid ${theme.inputBorder}`, boxShadow: theme.inputShadow }}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className={theme.labelColor} style={{ textShadow: theme.labelShadow }}>
                  Last name
                </Label>
                <div className="relative">
                  <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4`} style={{ color: theme.cardBorder }} />
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Enter your last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={`pl-10 ${theme.inputBg} ${theme.inputText} ${theme.inputPlaceholder}`}
                    style={{ border: `2px solid ${theme.inputBorder}`, boxShadow: theme.inputShadow }}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className={theme.labelColor} style={{ textShadow: theme.labelShadow }}>
                Email
              </Label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4`} style={{ color: theme.cardBorder }} />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`pl-10 ${theme.inputBg} ${theme.inputText} ${theme.inputPlaceholder}`}
                  style={{ border: `2px solid ${theme.inputBorder}`, boxShadow: theme.inputShadow }}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className={theme.labelColor} style={{ textShadow: theme.labelShadow }}>
                Password
              </Label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4`} style={{ color: theme.cardBorder }} />
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`pl-10 ${theme.inputBg} ${theme.inputText} ${theme.inputPlaceholder}`}
                  style={{ border: `2px solid ${theme.inputBorder}`, boxShadow: theme.inputShadow }}
                  required
                  aria-invalid={!isStrongPassword && password.length > 0}
                />
              </div>
              <ul className="text-xs space-y-1 mt-1">
                <li className={`${hasMinLength ? 'text-green-500' : theme.descColor}`}>• At least 12 characters</li>
                <li className={`${hasNumber ? 'text-green-500' : theme.descColor}`}>• At least one number</li>
                <li className={`${hasSymbol ? 'text-green-500' : theme.descColor}`}>• At least one symbol</li>
                <li className={`${hasUpper ? 'text-green-500' : theme.descColor}`}>• At least one uppercase letter</li>
                <li className={`${hasLower ? 'text-green-500' : theme.descColor}`}>• At least one lowercase letter</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className={theme.labelColor} style={{ textShadow: theme.labelShadow }}>
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4`} style={{ color: theme.cardBorder }} />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`pl-10 ${theme.inputBg} ${theme.inputText} ${theme.inputPlaceholder}`}
                  style={{ border: `2px solid ${theme.inputBorder}`, boxShadow: theme.inputShadow }}
                  required
                  aria-invalid={confirmPassword.length > 0 && confirmPassword !== password}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={
                isLoading ||
                !firstName ||
                !lastName ||
                !email ||
                !password ||
                !confirmPassword ||
                !isStrongPassword ||
                confirmPassword !== password
              }
              className="w-full h-12 text-white border-0 transition-all duration-200 disabled:opacity-50"
              style={{ background: theme.buttonGradient, boxShadow: theme.buttonShadow, animation: "neon-pulse 2s ease-in-out infinite" }}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                {isLoading ? "Creating account..." : "Create Account"}
              </div>
            </Button>
          </form>

          <p className={`text-center text-sm ${theme.textColor}`} style={{ textShadow: theme.textShadow }}>
            Already have an account? <Link to="/login" className="underline">Sign in</Link>
          </p>
        </div>
      )}
    </AuthLayout>
  )
}


