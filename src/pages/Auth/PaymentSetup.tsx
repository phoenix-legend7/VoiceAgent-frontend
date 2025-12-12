import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { Button } from "../../components/ui/button"
import { CreditCard, CheckCircle2, Shield, Zap, Loader2 } from "lucide-react"
import axiosInstance from "../../core/axiosInstance"
import { getUserByToken, useAuth } from "../../core/authProvider"
import AuthLayout from "./AuthLayout"
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(import.meta.env.VITE_APP_STRIPE_PUBLISHABLE_KEY || '')

const PaymentMethodForm = ({
  onSuccess,
  theme,
  isDarkMode
}: {
  onSuccess: () => void
  theme: any
  isDarkMode: boolean
}) => {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        color: isDarkMode ? '#f8fafc' : '#1e293b',
        backgroundColor: 'transparent',
        '::placeholder': {
          color: isDarkMode ? '#94a3b8' : '#64748b',
        },
        ':-webkit-autofill': {
          color: isDarkMode ? '#f8fafc' : '#1e293b',
        },
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
      complete: {
        color: isDarkMode ? '#10b981' : '#059669',
        iconColor: isDarkMode ? '#10b981' : '#059669',
      },
    },
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) return

    setLoading(true)
    setError(null)

    const cardElement = elements.getElement(CardElement)

    if (!cardElement) {
      setError('Card element not found')
      setLoading(false)
      return
    }

    // Create payment method
    const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    })

    if (stripeError) {
      setError(stripeError.message || 'An error occurred')
      setLoading(false)
      return
    }

    if (paymentMethod) {
      try {
        await axiosInstance.post("/billing/setup-payment-method", {
          payment_method_id: paymentMethod.id
        })
        toast.success("Payment method added successfully!")
        onSuccess()
      } catch (err: any) {
        const errorMessage = err.response?.data?.detail || "Failed to setup payment method. Please try again."
        setError(errorMessage)
        toast.error(errorMessage)
        setLoading(false)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Free Trial Banner */}
      <div
        className={`rounded-lg p-4 border-2 ${isDarkMode ? 'bg-green-900/20 border-green-500/50' : 'bg-green-50 border-green-200'}`}
        style={{ boxShadow: isDarkMode ? '0 0 20px rgba(34, 197, 94, 0.2)' : '0 2px 8px rgba(34, 197, 94, 0.1)' }}
      >
        <div className="flex items-start gap-3">
          <Zap className={`w-5 h-5 mt-0.5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
          <div className="flex-1">
            <h3 className={`font-semibold text-base mb-1 ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>
              3-Day Free Trial
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-green-200' : 'text-green-700'}`}>
              Start your free trial today. No charges until your trial ends. Cancel anytime during the trial period.
            </p>
          </div>
        </div>
      </div>

      {/* What You're Signing Up For */}
      <div className={`rounded-lg p-4 ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
        <h4 className={`font-semibold text-sm mb-2 ${theme.labelColor}`} style={{ textShadow: theme.labelShadow }}>
          What's Included
        </h4>
        <ul className={`space-y-1.5 text-sm ${theme.descColor}`} style={{ textShadow: theme.descShadow }}>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span>AI voice agents with natural language processing</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span>Inbound and outbound calling in 4 countries</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span>Pay-as-you-go pricing starting at $0.04/min</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span>Webhook integrations and API access</span>
          </li>
        </ul>
      </div>

      <div className="space-y-2">
        <label className={theme.labelColor} style={{ textShadow: theme.labelShadow }}>
          Payment Method
        </label>
        <div className="relative">
          <CreditCard className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 z-10`} style={{ color: theme.cardBorder }} />
          <div
            className={`pl-10 pr-4 py-3 rounded-lg ${theme.inputBg}`}
            style={{ border: `2px solid ${theme.inputBorder}`, boxShadow: theme.inputShadow }}
          >
            <CardElement options={cardElementOptions} />
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Shield className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          <p className={`text-xs ${theme.descColor}`} style={{ textShadow: theme.descShadow }}>
            Your payment method will be verified but not charged. Powered by <span className="font-semibold">Stripe</span> for secure payment processing.
          </p>
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1 h-12 text-white border-0 transition-all duration-200 disabled:opacity-50"
          style={{ background: theme.buttonGradient, boxShadow: theme.buttonShadow }}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Verify Payment Method
            </div>
          )}
        </Button>
      </div>
    </form>
  )
}

export default function PaymentSetupScreen() {
  const navigate = useNavigate()
  const { setCurrentUser } = useAuth()

  const handlePaymentSuccess = async () => {
    try {
      const authData = localStorage.getItem("spark-auth")
      if (authData) {
        const { access_token } = JSON.parse(authData)
        if (access_token) {
          const { data: user } = await getUserByToken(access_token)
          setCurrentUser(user)
        }
      }
    } catch (err) {
      console.error("Failed to refresh user data:", err)
    }

    const onboardingComplete = localStorage.getItem('onboarding-complete')
    setTimeout(() => {
      if (!onboardingComplete) {
        navigate("/onboarding")
      } else {
        navigate("/")
      }
    }, 500)
  }

  return (
    <Elements stripe={stripePromise}>
      <AuthLayout
        title="Add Payment Method"
        description="Add a payment method to complete your account setup"
      >
        {(theme, isDarkMode) => (
          <PaymentMethodForm
            onSuccess={handlePaymentSuccess}
            theme={theme}
            isDarkMode={isDarkMode}
          />
        )}
      </AuthLayout>
    </Elements>
  )
}

