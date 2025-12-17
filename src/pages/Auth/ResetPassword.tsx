import { useState, useEffect } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "react-toastify"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Lock, ArrowLeft, Sparkles, Eye, EyeOff } from "lucide-react"
import axiosInstance from "../../core/axiosInstance"
import AuthLayout from "./AuthLayout"

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordError, setPasswordError] = useState("")

  useEffect(() => {
    if (!token) {
      toast.error("Invalid reset link")
      navigate("/login")
    }
  }, [token, navigate])

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) {
      return "Password must be at least 8 characters long"
    }
    return ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate password
    const error = validatePassword(password)
    if (error) {
      setPasswordError(error)
      return
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setIsLoading(true)
    try {
      await axiosInstance.post("/auth/reset-password", {
        token,
        new_password: password
      })
      toast.success("Password reset successfully! You can now login with your new password.")
      setTimeout(() => {
        navigate("/login")
      }, 2000)
    } catch (error: any) {
      console.error("Failed to reset password:", error)
      const errorMessage = error?.response?.data?.detail || "Failed to reset password. The link may be invalid or expired."
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    if (passwordError) {
      setPasswordError(validatePassword(value))
    }
  }

  return (
    <AuthLayout title="Set New Password" description="Enter your new password below">
      {(theme, _isDarkMode) => (
        <>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className={theme.labelColor} style={{ textShadow: theme.labelShadow }}>
                New Password
              </Label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4`} style={{ color: theme.cardBorder }} />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className={`pl-10 pr-10 ${theme.inputBg} ${theme.inputText} ${theme.inputPlaceholder}`}
                  style={{ border: `2px solid ${passwordError ? '#ef4444' : theme.inputBorder}`, boxShadow: theme.inputShadow }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  style={{ color: theme.cardBorder }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordError && (
                <p className="text-xs text-red-500">{passwordError}</p>
              )}
              <p className={`text-xs ${theme.descColor}`} style={{ textShadow: theme.descShadow }}>
                Password must be at least 8 characters long
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className={theme.labelColor} style={{ textShadow: theme.labelShadow }}>
                Confirm New Password
              </Label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4`} style={{ color: theme.cardBorder }} />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`pl-10 pr-10 ${theme.inputBg} ${theme.inputText} ${theme.inputPlaceholder}`}
                  style={{ border: `2px solid ${theme.inputBorder}`, boxShadow: theme.inputShadow }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  style={{ color: theme.cardBorder }}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isLoading || !password || !confirmPassword}
              className="w-full h-12 text-white border-0 transition-all duration-200 disabled:opacity-50"
              style={{ background: theme.buttonGradient, boxShadow: theme.buttonShadow, animation: "neon-pulse 2s ease-in-out infinite" }}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Resetting Password...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Reset Password
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
      )}
    </AuthLayout>
  )
}
