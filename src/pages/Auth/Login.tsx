import { AxiosError } from "axios"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Separator } from "../../components/ui/separator"
import { Mail, Lock, Sparkles } from "lucide-react"
import axiosInstance from "../../core/axiosInstance"
import { getUserByToken, useAuth } from "../../core/authProvider"
import AuthLayout from "./AuthLayout"

export default function LoginScreen() {
  const navigate = useNavigate()
  const { saveAuth, setCurrentUser } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleLogin = async () => {
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

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const formData = new URLSearchParams()
      formData.append("username", email)
      formData.append("password", password)
      const response = await axiosInstance.post("/auth/jwt/login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      })
      const data = response.data
      if (data.access_token) {
        saveAuth({ access_token: data.access_token })

        // Get user data
        try {
          const { data: user } = await getUserByToken(data.access_token)

          if (!user) {
            throw new Error("Failed to get user data")
          }

          setCurrentUser(user)

          // Check if email is verified first
          if (!user.is_verified) {
            toast.error("Please verify your email before accessing the dashboard. Redirecting to verification page...")
            localStorage.setItem("pending-verification-email", user.email)
            setTimeout(() => {
              navigate(`/verify-email?email=${encodeURIComponent(user.email)}`)
            }, 1000)
            return
          }

          // Check if payment method exists
          try {
            const paymentResponse = await axiosInstance.get("/billing/payment-methods")
            const paymentMethods = paymentResponse.data.payment_methods || []

            if (paymentMethods.length === 0) {
              // No payment method - redirect to payment setup
              toast.info("Please add a payment method to continue")
              navigate("/setup-payment")
            } else {
              // Payment method exists - go to dashboard
              const onboardingComplete = localStorage.getItem('onboarding-complete')
              if (!onboardingComplete) {
                navigate("/onboarding")
              } else {
                navigate("/")
              }
            }
          } catch (paymentErr) {
            // If we can't check payment methods, redirect to payment setup
            console.error("Failed to check payment methods:", paymentErr)
            toast.info("Please add a payment method to continue")
            navigate("/setup-payment")
          }
        } catch (userErr) {
          console.error("Failed to get user data:", userErr)
          toast.error("Failed to get user data. Please try again.")
        }
      } else {
        throw new Error("Access token not found")
      }
    } catch (e) {
      const error = e as Error
      if (error.name === "AxiosError") {
        const axiosError = e as AxiosError
        const detail = (axiosError.response?.data as any)?.detail
        if (detail === "LOGIN_BAD_CREDENTIALS") {
          toast.error("Failed to login: Bad credentials")
        } else if (axiosError.response?.status === 403) {
          toast.error("Please verify your email before logging in. Redirecting to verification page...")
          // Store email for verification page
          localStorage.setItem("pending-verification-email", email)
          setTimeout(() => {
            navigate(`/verify-email?email=${encodeURIComponent(email)}`)
          }, 1000)
        } else {
          toast.error(`Failed to login: ${detail || "Please try again"}`)
        }
      } else {
        toast.error(`Failed to login: ${(e as Error).message}`)
      }
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout title="Welcome to Spark" description="Create powerful AI voice agents in minutes">
      {(theme, isDarkMode) => (
        <>
          <Button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className={`
              w-full h-12 flex items-center justify-center font-semibold rounded-lg
              transition-all duration-200 shadow-md border
              ${isDarkMode
                ? "bg-[#111827]! hover:bg-[#1f2937]! text-white! border-gray-700"
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
                Signing in...
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
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

          <div className="space-y-4">
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
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`pl-10 ${theme.inputBg} ${theme.inputText} ${theme.inputPlaceholder}`}
                  style={{ border: `2px solid ${theme.inputBorder}`, boxShadow: theme.inputShadow }}
                  required
                />
              </div>
              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className={`text-xs ${theme.textColor} hover:underline`}
                  style={{ textShadow: theme.textShadow }}
                >
                  Forgot password?
                </Link>
              </div>
            </div>
            <Button
              onClick={(e) => {
                e.preventDefault()
                handleEmailLogin(e)
              }}
              disabled={isLoading || !email || !password}
              className="w-full h-12 text-white border-0 transition-all duration-200 disabled:opacity-50"
              style={{ background: theme.buttonGradient, boxShadow: theme.buttonShadow, animation: "neon-pulse 2s ease-in-out infinite" }}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Sign In
                </div>
              )}
            </Button>
          </div>

          <p className={`text-center text-sm ${theme.textColor}`} style={{ textShadow: theme.textShadow }}>
            Don't have an account? <Link to="/signup" className="underline">Create one</Link>
          </p>
        </>
      )}
    </AuthLayout>
  )
}