import { useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Mail, ArrowLeft, Sparkles } from "lucide-react"
import axiosInstance from "../../core/axiosInstance"
import AuthLayout from "./AuthLayout"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await axiosInstance.post("/auth/forgot-password", { email })
      setIsSuccess(true)
      toast.success("Password reset link sent! Please check your email.")
    } catch (error) {
      console.error("Failed to send reset email:", error)
      // Show success message anyway for security (don't reveal if email exists)
      setIsSuccess(true)
      toast.success("If an account exists with this email, a password reset link has been sent.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout title="Reset Your Password" description="Enter your email to receive a password reset link">
      {(theme, _isDarkMode) => (
        <>
          {!isSuccess ? (
            <>
              <div className="space-y-4">
                <p className={`text-center text-sm ${theme.descColor}`} style={{ textShadow: theme.descShadow }}>
                  Enter your email address and we'll send you a link to reset your password.
                </p>
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
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || !email}
                  className="w-full h-12 text-white border-0 transition-all duration-200 disabled:opacity-50"
                  style={{ background: theme.buttonGradient, boxShadow: theme.buttonShadow, animation: "neon-pulse 2s ease-in-out infinite" }}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Send Reset Link
                    </div>
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-center">
                <Link
                  to="/login"
                  className={`flex items-center gap-2 text-sm ${theme.textColor} hover:underline`}
                  style={{ textShadow: theme.textShadow }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </Link>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className={`text-center space-y-2 ${theme.textColor}`} style={{ textShadow: theme.textShadow }}>
                <div className="flex justify-center mb-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ background: theme.buttonGradient, boxShadow: theme.iconShadow }}
                  >
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold">Check Your Email</h3>
                <p className={`text-sm ${theme.descColor}`} style={{ textShadow: theme.descShadow }}>
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
                <p className={`text-sm ${theme.descColor}`} style={{ textShadow: theme.descShadow }}>
                  The link will expire in 1 hour. If you don't see the email, check your spam folder.
                </p>
              </div>

              <div className="flex items-center justify-center pt-4">
                <Link
                  to="/login"
                  className={`flex items-center gap-2 text-sm ${theme.textColor} hover:underline`}
                  style={{ textShadow: theme.textShadow }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </AuthLayout>
  )
}
