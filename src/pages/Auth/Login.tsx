import { AxiosError } from "axios"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast, ToastContainer } from "react-toastify"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Separator } from "../../components/ui/separator"
import { Mail, Lock, Sparkles, Phone, Zap, Link2, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import axiosInstance from "../../core/axiosInstance"
import { getUserByToken, useAuth } from "../../core/authProvider"
import FloatingElements from "../../components/FloatingElements"

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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      <FloatingElements />

      {/* Main content */}
      <div className="relative z-30 flex items-center justify-center min-h-screen p-6 lg:p-12">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left side - Product info */}
          <div className="space-y-10">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl xl:text-7xl leading-[1.1] tracking-tight font-bold relative">
                {/* Glow layer behind - blurred duplicate */}
                <span
                  className="absolute inset-0 text-cyan-400 blur-md opacity-80"
                  aria-hidden="true"
                  style={{
                    textShadow: "0 0 30px #00b8d4, 0 0 60px #00b8d4, 0 0 90px #00b8d4",
                  }}
                >
                  Meet Spark
                </span>
                {/* Main readable text */}
                <span
                  className="relative text-cyan-500"
                  style={{
                    textShadow: "0 0 10px rgba(0, 184, 212, 0.5), 0 0 20px rgba(0, 184, 212, 0.3)",
                  }}
                >
                  Meet Spark
                </span>
              </h1>
              <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed font-light max-w-xl">
                Your AI voice agent that answers calls, qualifies leads, books appointments, and follows up
                automatically.
              </p>
            </div>

            {/* Benefit bubbles */}
            <div className="space-y-4">
              {[
                { icon: Phone, text: "Never miss a call — answers instantly, 24/7" },
                { icon: Zap, text: "Handles inbound & outbound conversations" },
                { icon: Link2, text: "Integrates with CRMs, calendars, and tools" },
                { icon: CheckCircle2, text: "Scales infinitely — no hiring required" },
              ].map((benefit, index) => (
                <div key={index} className="relative group">
                  <div
                    className="relative px-6 py-4 rounded-2xl backdrop-blur-sm transition-all duration-300 group-hover:scale-[1.02]"
                    style={{
                      background: "rgba(0, 184, 212, 0.06)",
                      border: "1.5px solid rgba(0, 184, 212, 0.2)",
                      boxShadow: "0 0 15px rgba(0, 184, 212, 0.08)",
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                          background: "#00b8d4",
                          boxShadow: "0 0 20px rgba(0, 184, 212, 0.4)",
                        }}
                      >
                        <benefit.icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                      </div>
                      <p className="text-lg font-medium text-gray-800">{benefit.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing badge */}
            <div
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full"
              style={{
                background: "linear-gradient(135deg, rgba(0, 184, 212, 0.1), rgba(0, 184, 212, 0.05))",
                border: "1.5px solid rgba(0, 184, 212, 0.25)",
              }}
            >
              <Sparkles className="w-5 h-5 text-cyan-500" />
              <span className="text-gray-700 font-medium">
                <span className="text-cyan-600 font-bold">3-day free trial</span>
                {" · "}
                <span className="text-gray-600">then $499/month AUD</span>
              </span>
            </div>
          </div>

          {/* Right side - Login card */}
          <Card
            className="w-full max-w-md mx-auto border-0 shadow-2xl"
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(20px)",
              borderRadius: "28px",
              boxShadow: "0 0 50px rgba(0, 184, 212, 0.12), 0 15px 50px rgba(0, 0, 0, 0.08)",
            }}
          >
            <CardHeader className="text-center space-y-6 pt-10 pb-6">
              <div
                className="mx-auto w-20 h-20 flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #00b8d4, #0097a7)",
                  borderRadius: "20px",
                  boxShadow: "0 0 30px rgba(0, 184, 212, 0.4), 0 15px 30px rgba(0, 0, 0, 0.1)",
                }}
              >
                <Zap className="w-10 h-10 text-white" strokeWidth={2.5} />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-3xl font-bold text-gray-900 tracking-tight">Welcome to Spark</CardTitle>
                <CardDescription className="text-base text-gray-500">
                  Create powerful AI voice agents in minutes
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 px-10 pb-10">
              <Button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full h-12 bg-white hover:bg-gray-50 text-gray-800! border border-gray-200 hover:border-gray-300 font-medium text-base transition-all duration-200 shadow-sm hover:shadow-md"
                style={{ borderRadius: "14px" }}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </div>
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-gray-400 font-medium">Or continue with email</span>
                </div>
              </div>

              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-11 h-12 bg-gray-50 border-gray-200 focus:border-cyan-400 focus:ring-cyan-400 text-gray-900 placeholder:text-gray-400"
                      style={{ borderRadius: "14px" }}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-11 h-12 bg-gray-50 border-gray-200 focus:border-cyan-400 focus:ring-cyan-400 text-gray-900 placeholder:text-gray-400"
                      style={{ borderRadius: "14px" }}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-cyan-600 hover:text-cyan-700 font-medium transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !email || !password}
                  className="w-full h-12 text-white font-semibold text-base transition-all duration-200 disabled:opacity-50"
                  style={{
                    background: "linear-gradient(135deg, #00b8d4, #0097a7)",
                    borderRadius: "14px",
                    boxShadow: "0 0 20px rgba(0, 184, 212, 0.3), 0 4px 15px rgba(0, 0, 0, 0.1)",
                  }}
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
              </form>

              <p className="text-center text-sm text-gray-500">
                Don't have an account?{" "}
                <Link to="/signup" className="font-semibold text-cyan-600 hover:text-cyan-700 transition-colors">
                  Create one
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <ToastContainer newestOnTop limit={3} />
    </div>
  )
}