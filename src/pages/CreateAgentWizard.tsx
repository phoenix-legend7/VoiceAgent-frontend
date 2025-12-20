"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Bot,
  Mic,
  Volume2,
  Phone,
  Sun,
  Moon,
  CreditCard,
  Hash,
  Plug,
  CheckCircle2,
  Play,
  Pause,
  Loader2,
  X,
  Building2,
} from "lucide-react"
import clsx from "clsx"
import { countryPhoneOptions } from "../consts/countryPhones"
import { toast, ToastContainer } from "react-toastify"
import VoiceType from "../models/voice"
import { PhoneTypeRead } from "../models/phone"
import { adminAPI } from "../core/adminAPI"
import { useAuth } from "../core/authProvider"
import axiosInstance, { handleAxiosError } from "../core/axiosInstance"
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import { formatCurrency, getSelectedCurrency, convertFromUSDCents } from "../utils/currency"

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_APP_STRIPE_PUBLISHABLE_KEY || '')

interface CreateAgentWizardProps {
  onComplete: (agentData: any) => void
}

interface PaymentMethod {
  id: string;
  type: string;
  card: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  is_default: boolean;
}

// Payment Form Component - Defined outside to prevent recreation on each render
interface PaymentFormProps {
  isDarkMode: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentForm = ({ isDarkMode, onClose, onSuccess }: PaymentFormProps) => {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cardElementOptions = useMemo(() => ({
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
  }), [isDarkMode])

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
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

    try {
      // Send payment method to backend
      const payload = {
        payment_method_id: paymentMethod.id
      }
      await axiosInstance.post("/billing/setup-payment-method", payload)
      toast.success("Payment method added successfully!")
      onClose()
      onSuccess()
    } catch (err) {
      handleAxiosError("Failed to add payment method", err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [stripe, elements, onClose, onSuccess])

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className={clsx(
        "p-4 rounded-lg border-2",
        isDarkMode ? "border-cyan-400 bg-black/30" : "border-cyan-600 bg-white/50"
      )}
        style={{
          boxShadow: isDarkMode
            ? "0 0 10px rgba(0, 255, 255, 0.3)"
            : "0 0 10px rgba(14,165,233,0.2)",
        }}>
        <CardElement options={cardElementOptions} />
      </div>

      {error && (
        <div className={clsx("text-sm p-3 rounded-lg", isDarkMode ? "bg-red-500/20 text-red-300" : "bg-red-50 text-red-700")}>
          {error}
        </div>
      )}

      <div className="flex gap-3 justify-end">
        <Button
          type="button"
          onClick={onClose}
          variant="outline"
          className={clsx(
            "border-2",
            isDarkMode
              ? "text-white border-gray-600 bg-black/50 hover:bg-gray-700 hover:border-cyan-400"
              : "text-gray-900 border-gray-300 bg-white hover:bg-gray-100 hover:border-blue-400"
          )}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || loading}
          className="text-white border-0 transition-all duration-200 disabled:opacity-50"
          style={{
            background: "linear-gradient(45deg, #FF00FF, #00FFFF)",
            boxShadow: "0 0 30px #FF00FF, 0 0 60px #00FFFF",
          }}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Add Card
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

export const voices = [
  {
    id: "21m00Tcm4TlvDq8ikWAM",
    name: "Rachel",
    description: "A calm, young female voice with an American accent, suitable for soothing narration",
    accent: "American",
    personality: "Warm & Professional",
    preview_url: "https://storage.googleapis.com/eleven-public-prod/premade/voices/21m00Tcm4TlvDq8ikWAM/b4928a68-c03b-411f-8533-3d5c299fd451.mp3",
  },
  {
    id: "AZnzlk1XvdvUeBnXmlld",
    name: "Domi",
    description: "A strong, young female voice with an American accent, great for impactful narration",
    accent: "American",
    personality: "Confident & Persuasive",
    preview_url: "https://storage.googleapis.com/eleven-public-prod/premade/voices/AZnzlk1XvdvUeBnXmlld/b3c36b01-f80d-4b16-a698-f83682dee84c.mp3",
  },
  {
    id: "ThT5KcBeYPX3keUQqHPh",
    name: "Dorothy",
    description: "A pleasant, young female voice with a British accent, ideal for storytelling",
    accent: "British",
    personality: "Friendly & Approachable",
    preview_url: "https://storage.googleapis.com/eleven-public-prod/premade/voices/ThT5KcBeYPX3keUQqHPh/981f0855-6598-48d2-9f8f-b6d92fbbe3fc.mp3",
  },
  {
    id: "onwK4e9ZLuTAKqWW03F9",
    name: "Daniel",
    description: "A deep, middle‑aged male voice with a British accent, excellent for news presenter roles",
    accent: "British",
    personality: "Professional & Trustworthy",
    preview_url: "https://storage.googleapis.com/eleven-public-prod/premade/voices/onwK4e9ZLuTAKqWW03F9/7eee0236-1a72-4b86-b303-5dcadc007ba9.mp3",
  },
  {
    id: "D38z5RcWu1voky8WS1ja",
    name: "Fin",
    description: "An older male voice with an Irish accent, characterized as a sailor, brings warmth and wisdom",
    accent: "Irish",
    personality: "Wise & Calming",
    preview_url: "https://storage.googleapis.com/eleven-public-prod/premade/voices/D38z5RcWu1voky8WS1ja/a470ba64-1e72-46d9-ba9d-030c4155e2d2.mp3",
  },
  {
    id: "IKne3meq5aSn9XLyUdCD",
    name: "Charlie",
    description: "Casual, middle‑aged male voice with an Australian accent, ideal for conversational content",
    accent: "Australian",
    personality: "Energetic & Fun",
    preview_url: "https://storage.googleapis.com/eleven-public-prod/premade/voices/IKne3meq5aSn9XLyUdCD/102de6f2-22ed-43e0-a1f1-111fa75c5481.mp3",
  }
]

export const industries = [
  { id: "real-estate", name: "Real Estate", icon: "🏠", description: "Property sales, rentals, and management" },
  { id: "healthcare", name: "Healthcare", icon: "🏥", description: "Medical practices and health services" },
  { id: "ecommerce", name: "E-commerce", icon: "🛒", description: "Online retail and product sales" },
  { id: "finance", name: "Finance", icon: "💰", description: "Banking, loans, and financial services" },
  { id: "education", name: "Education", icon: "🎓", description: "Schools, courses, and training" },
  { id: "technology", name: "Technology", icon: "💻", description: "Software, IT, and tech services" },
  { id: "hospitality", name: "Hospitality", icon: "🏨", description: "Hotels, restaurants, and travel" },
  { id: "automotive", name: "Automotive", icon: "🚗", description: "Car sales, repairs, and services" },
  { id: "insurance", name: "Insurance", icon: "🛡️", description: "Insurance policies and claims" },
  { id: "legal", name: "Legal", icon: "⚖️", description: "Law firms and legal services" },
  { id: "trade", name: "Trade", icon: "🔨", description: "Construction, plumbing, and skilled trades" },
  { id: "solar", name: "Solar", icon: "☀️", description: "Solar energy and renewable solutions" },
  { id: "other", name: "Other", icon: "💼", description: "Other business and services" },
]

export default function CreateAgentWizard({ onComplete }: CreateAgentWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 })
  const [sparkParticles, setSparkParticles] = useState<
    Array<{ id: number; x: number; y: number; size: number; color: string }>
  >([])
  const [electricArcs, setElectricArcs] = useState<
    Array<{ id: number; x1: number; y1: number; x2: number; y2: number }>
  >([])

  // ElevenLabs state
  const [elevenlabsVoices, setElevenlabsVoices] = useState<VoiceType[]>([])
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [isPlayingVoice, setIsPlayingVoice] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { currentUser } = useAuth();

  // Billing state
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)

  // Tools state
  const [connectedTools, setConnectedTools] = useState<Array<{ id: string; tool_id: string; name: string; description: string }>>([])
  const [isLoadingTools, setIsLoadingTools] = useState(false)

  // Phone numbers state
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneTypeRead[]>([])
  const [isLoadingPhoneNumbers, setIsLoadingPhoneNumbers] = useState(false)

  // Default voices state
  const [defaultVoices, setDefaultVoices] = useState<VoiceType[]>([])
  const [isLoadingDefaultVoices, setIsLoadingDefaultVoices] = useState(false)

  // Currency state
  const [selectedCurrency] = useState(getSelectedCurrency())


  const [formData, setFormData] = useState({
    phoneSetup: {
      provider: "twilio", // "twilio", "vanage", "plivo", "exotel"
      region: "us-west",
      country: "US",
      phoneNumber: "",
      // Twilio/Vonage/Exotel fields
      apiKey: "",
      apiSecret: "",
      accountSid: "",
      // Exotel specific
      subdomain: "api.exotel.com",
      appId: "",
      // Plivo specific
      authId: "",
      authToken: "",
    },
    selectedPhoneNumber: "",
    useExistingPhone: false, // Track if user selected existing phone
    existingPhoneId: "", // ID of selected existing phone
    elevenlabsApiKey: "",
    billingConfirmed: false,
    agentName: "",
    industry: "",
    purpose: "",
    voice: "",
    personality: "",
    greeting: "",
    knowledgeBase: {
      files: [] as File[],
    },
    tools: [] as string[], // Array of tool IDs
    selectedTools: [] as string[], // Array of selected tool IDs
  })

  const totalSteps = 6
  const navigate = useNavigate()

  // Get screen dimensions
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (!!savedTheme && savedTheme === "light") {
      setIsDarkMode(false)
    } else {
      setIsDarkMode(!window.matchMedia('(prefers-color-scheme: dark)').matches)
    }
  }, [])

  // Generate electric effects
  useEffect(() => {
    if (dimensions.width === 0) return

    const generateSparks = () => {
      const darkColors = ["#00FFFF", "#FF00FF", "#FFFF00", "#00FF00", "#FF0080"]
      const lightColors = ["#0ea5e9", "#3b82f6", "#8b5cf6", "#06b6d4", "#10b981"]
      const colors = isDarkMode ? darkColors : lightColors

      const newSparks = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        size: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
      }))
      setSparkParticles(newSparks)
    }

    const generateArcs = () => {
      const newArcs = Array.from({ length: 3 }, (_, i) => ({
        id: i,
        x1: Math.random() * dimensions.width,
        y1: Math.random() * dimensions.height * 0.3,
        x2: Math.random() * dimensions.width,
        y2: Math.random() * dimensions.height * 0.7 + dimensions.height * 0.3,
      }))
      setElectricArcs(newArcs)
    }

    generateSparks()
    generateArcs()

    const interval = setInterval(() => {
      generateSparks()
      generateArcs()
    }, 3000)

    return () => clearInterval(interval)
  }, [dimensions, isDarkMode])

  useEffect(() => {
    if (currentUser?.api_keys?.elevenlabs) {
      setFormData({
        ...formData,
        elevenlabsApiKey: currentUser.api_keys.elevenlabs,
      })
    }
  }, [currentUser])

  // Fetch phone numbers when step 1 is shown
  useEffect(() => {
    if (currentStep === 1) {
      fetchPhoneNumbers()
    }
  }, [currentStep])

  // Fetch default voices when step 2 is shown and no ElevenLabs API key
  useEffect(() => {
    if (currentStep === 2 && !formData.elevenlabsApiKey.trim()) {
      fetchDefaultVoices()
    }
  }, [currentStep, formData.elevenlabsApiKey])

  // Automatically fetch ElevenLabs voices when step 2 is shown and API key exists
  useEffect(() => {
    if (currentStep === 2 && formData.elevenlabsApiKey.trim() && elevenlabsVoices.length === 0 && !isTestingConnection) {
      testElevenLabsConnection()
    }
  }, [currentStep, formData.elevenlabsApiKey])

  // Fetch payment methods when step 3 is shown
  useEffect(() => {
    if (currentStep === 3) {
      fetchPaymentMethods()
    }
  }, [currentStep])

  // Fetch connected tools when step 6 is shown
  useEffect(() => {
    if (currentStep === 6) {
      fetchConnectedTools()
    }
  }, [currentStep])

  const fetchPhoneNumbers = useCallback(async () => {
    setIsLoadingPhoneNumbers(true)
    try {
      const response = await axiosInstance.get("/phones")
      setPhoneNumbers(response.data || [])
    } catch (error) {
      console.error('Failed to fetch phone numbers:', error)
      // Don't show error toast here, just log it
    } finally {
      setIsLoadingPhoneNumbers(false)
    }
  }, [])

  const fetchDefaultVoices = useCallback(async () => {
    setIsLoadingDefaultVoices(true)
    try {
      const response = await axiosInstance.get("/voice/custom", {
        params: { lang_code: "en-US" }
      })
      setDefaultVoices(response.data || [])
    } catch (error) {
      console.error('Failed to fetch default voices:', error)
    } finally {
      setIsLoadingDefaultVoices(false)
    }
  }, [])

  const fetchConnectedTools = useCallback(async () => {
    setIsLoadingTools(true)
    try {
      const response = await axiosInstance.get("/tools")
      setConnectedTools(response.data || [])
    } catch (error) {
      console.error('Failed to fetch connected tools:', error)
      // Don't show error toast here, just log it
    } finally {
      setIsLoadingTools(false)
    }
  }, [])

  const fetchPaymentMethods = useCallback(async () => {
    setIsLoadingPaymentMethods(true)
    try {
      const response = await axiosInstance.get("/billing/payment-methods")
      setPaymentMethods(response.data.payment_methods || [])
    } catch (error) {
      console.error('Failed to fetch payment methods:', error)
      // Don't show error toast here, just log it
    } finally {
      setIsLoadingPaymentMethods(false)
    }
  }, [])


  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete({
        ...formData,
        phoneSetup: {
          ...formData.phoneSetup,
          phoneNumber: formData.useExistingPhone
            ? formData.existingPhoneId
            : (formData.selectedPhoneNumber || formData.phoneSetup.phoneNumber),
        },
        useExistingPhone: formData.useExistingPhone,
        existingPhoneId: formData.existingPhoneId,
        voiceType: formData.voice,
        tone: formData.personality,
        primaryGoal: formData.purpose,
        selectedTools: formData.selectedTools,
        description:
          [
            formData.purpose && `Purpose: ${formData.purpose}`,
            formData.personality && `Personality: ${formData.personality}`,
            formData.greeting && `Greeting: ${formData.greeting}`,
          ]
            .filter(Boolean)
            .join("\n"),
      })
    }
  }

  const handleBack = () => {
    if (currentStep === 1) {
      navigate("/")
      return
    }
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const testElevenLabsConnection = async () => {
    if (!formData.elevenlabsApiKey.trim()) {
      toast.warning("Please enter an API key first")
      return
    }

    setIsTestingConnection(true)
    setElevenlabsVoices([])

    try {
      const response = await fetch("https://api.elevenlabs.io/v1/voices", {
        method: "GET",
        headers: {
          "xi-api-key": formData.elevenlabsApiKey.trim(),
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Invalid API key. Please check your ElevenLabs API key.")
        }
        throw new Error(`Failed to fetch voices: ${response.statusText}`)
      }

      const data = await response.json()
      const voices = data.voices || []

      if (voices.length === 0) {
        toast.warning("No ElevenLabs voices found. Please check your API key.")
      } else {
        const elevenlabsVoicesList: VoiceType[] = voices.map((voice: any) => ({
          name: voice.name || voice.voice_id,
          provider: "elevenlabs",
          voice_id: voice.voice_id,
          preview_url: voice.preview_url || undefined,
          language: voice.labels?.language || undefined,
          category: voice.category || undefined,
        }))

        toast.success(`Successfully connected! Found ${elevenlabsVoicesList.length} voices.`)
        setElevenlabsVoices(elevenlabsVoicesList)

        await adminAPI.updateApiKeys({
          elevenlabs: formData.elevenlabsApiKey.trim()
        })
      }
    } catch (error: any) {
      handleAxiosError("Failed to connect to ElevenLabs", error);
      setElevenlabsVoices([])
    } finally {
      setIsTestingConnection(false)
    }
  }

  const playVoicePreview = (voice: VoiceType) => {
    if (!voice.preview_url) return

    if (isPlayingVoice === voice.voice_id) {
      audioRef.current?.pause()
      audioRef.current = null
      setIsPlayingVoice(null)
    } else {
      if (audioRef.current) {
        audioRef.current.pause()
      }

      const audio = new Audio(voice.preview_url)
      audioRef.current = audio
      setIsPlayingVoice(voice.voice_id)

      audio.onended = () => {
        setIsPlayingVoice(null)
        audioRef.current = null
      }

      audio.onerror = () => {
        toast.error("Failed to play voice preview")
        setIsPlayingVoice(null)
        audioRef.current = null
      }

      audio.play()
    }
  }

  const getStepContent = () => {
    const stepConfigs = [
      {
        icon: Phone,
        title: "Connect Phone System",
        subtitle: "Step 1 of 6",
        description: "Connect your phone provider (Twilio, Vonage, Plivo, or Exotel) and phone number to enable calling capabilities for your AI agent.",
        gradient: "from-blue-500 to-cyan-600",
        color: "#00FFFF",
      },
      {
        icon: Mic,
        title: "Connect ElevenLabs",
        subtitle: "Step 2 of 6",
        description: "Connect your ElevenLabs API key to access high-quality voice generation. This step is required to create your agent.",
        gradient: "from-purple-500 to-pink-600",
        color: "#FF00FF",
      },
      {
        icon: CreditCard,
        title: "Verify Billing",
        subtitle: "Step 3 of 6",
        description: "Ensure you have sufficient credit or a payment method set up to keep your agent running smoothly.",
        gradient: "from-orange-500 to-red-600",
        color: "#FFFF00",
      },
      {
        icon: Building2,
        title: "Select Industry",
        subtitle: "Step 4 of 6",
        description: "Choose the industry your AI agent will operate in. This helps optimize the agent's behavior and responses.",
        gradient: "from-teal-500 to-emerald-600",
        color: "#14b8a6",
      },
      {
        icon: Bot,
        title: "Configure Your Agent",
        subtitle: "Step 5 of 6",
        description: "Give your AI agent a name, define its purpose, and select its voice. This is where your agent comes to life!",
        gradient: "from-indigo-500 to-purple-600",
        color: "#8A2BE2",
      },
      {
        icon: Plug,
        title: "Connect Tools (Optional)",
        subtitle: "Step 6 of 6",
        description: "Connect external tools and integrations to extend your agent's capabilities. You can skip this and add tools later.",
        gradient: "from-pink-500 to-rose-600",
        color: "#FF0080",
      },
    ]

    return stepConfigs[currentStep - 1]
  }

  // Theme configuration
  const theme = {
    background: isDarkMode ? "bg-black" : "bg-gradient-to-br from-cyan-50 via-blue-50 to-cyan-50",
    arcColor: isDarkMode ? "#00FFFF" : "#0ea5e9",
    gridColor: isDarkMode ? "rgba(0,255,255,0.3)" : "rgba(14,165,233,0.3)",
    cardBg: isDarkMode ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.9)",
    cardBorder: isDarkMode ? "#00FFFF" : "#0ea5e9",
    cardShadow: isDarkMode
      ? "0 0 40px #00FFFF, inset 0 0 40px rgba(0, 255, 255, 0.1)"
      : "0 0 40px rgba(14,165,233,0.3), inset 0 0 40px rgba(14,165,233,0.05)",
    textPrimary: isDarkMode ? "text-white" : "text-gray-800",
    textSecondary: isDarkMode ? "text-cyan-300" : "text-cyan-600",
    textTertiary: isDarkMode ? "text-gray-300" : "text-gray-600",
    textShadow: isDarkMode ? "0 0 10px #00FFFF" : "none",
    iconBg: isDarkMode ? "linear-gradient(45deg, #FF00FF, #00FFFF)" : "linear-gradient(45deg, #7dd7ff, #0284c7)",
    iconShadow: isDarkMode
      ? "0 0 30px #FF00FF, 0 0 60px #00FFFF, inset 0 0 20px rgba(255, 255, 255, 0.2)"
      : "0 0 30px rgba(14,165,233,0.4), 0 0 60px rgba(2,132,199,0.3), inset 0 0 20px rgba(255, 255, 255, 0.3)",
    inputBg: isDarkMode ? "bg-black/50" : "bg-white/70",
    inputText: isDarkMode ? "text-white" : "text-gray-800",
    inputPlaceholder: isDarkMode ? "placeholder:text-gray-400" : "placeholder:text-gray-600",
    inputBorder: isDarkMode ? "#00FFFF" : "#0ea5e9",
    inputShadow: isDarkMode
      ? "0 0 20px #00FFFF, inset 0 0 20px rgba(0, 255, 255, 0.1)"
      : "0 0 20px rgba(14,165,233,0.2), inset 0 0 20px rgba(14,165,233,0.05)",
    buttonPrimary: isDarkMode ? "linear-gradient(45deg, #FF00FF, #00FFFF)" : "linear-gradient(45deg, #0ea5e9, #3b82f6)",
    buttonShadow: isDarkMode
      ? "0 0 30px #FF00FF, 0 0 60px #00FFFF"
      : "0 0 30px rgba(14,165,233,0.4), 0 0 60px rgba(59,130,246,0.3)",
    progressGradient: isDarkMode
      ? "linear-gradient(90deg, #00FFFF, #FF00FF, #FFFF00)"
      : "linear-gradient(90deg, #0ea5e9, #3b82f6, #8b5cf6)",
    progressShadow: isDarkMode ? "0 0 20px #00FFFF" : "0 0 20px rgba(14,165,233,0.4)",
  }

  const toggleTheme = () => {
    if (isDarkMode) {
      localStorage.setItem("theme", "light")
    } else {
      localStorage.setItem("theme", "dark")
    }
    setIsDarkMode(!isDarkMode)
  }

  const renderStep = () => {
    const stepConfig = getStepContent()

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div
                className={clsx(
                  "w-20 h-20 bg-gradient-to-r rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse",
                  stepConfig.gradient
                )}
                style={{
                  boxShadow: `0 0 30px ${stepConfig.color}, 0 0 60px ${stepConfig.color}`,
                }}
              >
                <stepConfig.icon className="w-10 h-10 text-white" />
              </div>
              <h2
                className={clsx("text-3xl font-bold", theme.textPrimary)}
                style={{ textShadow: isDarkMode ? `0 0 20px ${stepConfig.color}` : 'none' }}
              >
                {stepConfig.title}
              </h2>
              <p
                className={clsx("text-xl", theme.textSecondary)}
                style={{ textShadow: isDarkMode ? `0 0 10px ${stepConfig.color}` : 'none' }}
              >
                {stepConfig.subtitle}
              </p>
              <p className={clsx("max-w-md mx-auto", theme.textTertiary)}>
                {stepConfig.description}
              </p>
            </div>

            <div className="space-y-6">
              {/* Connected Phone Numbers */}
              {phoneNumbers.length > 0 && (
                <div className="space-y-4 mt-6">
                  <Label className={clsx("text-lg", theme.textPrimary)}>
                    Select from Your Connected Phone Numbers
                  </Label>
                  <p className={clsx("text-sm", theme.textTertiary)}>
                    You can select an existing phone number to use, or continue to add a new one in the next step.
                  </p>
                  {isLoadingPhoneNumbers ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin" style={{ color: stepConfig.color }} />
                    </div>
                  ) : (
                    <div className="grid gap-3 max-h-64 overflow-y-auto">
                      {phoneNumbers.map((phone) => {
                        const isSelected = formData.useExistingPhone && formData.existingPhoneId === phone.id
                        return (
                          <Card
                            key={phone.id}
                            className={clsx(
                              "cursor-pointer transition-all duration-300",
                              isSelected
                                ? isDarkMode
                                  ? "bg-green-500/20 border-green-400"
                                  : "bg-green-100 border-green-400"
                                : isDarkMode
                                  ? "bg-black/50 border-gray-600 hover:border-green-400"
                                  : "bg-white/70 border-gray-300 hover:border-green-400"
                            )}
                            style={{
                              boxShadow: isSelected
                                ? isDarkMode
                                  ? "0 0 30px #00FF00"
                                  : "0 0 30px rgba(34,197,94,0.5)"
                                : isDarkMode
                                  ? "0 0 10px rgba(0, 255, 0, 0.3)"
                                  : "0 0 10px rgba(34,197,94,0.2)",
                            }}
                            onClick={() => {
                              if (isSelected) {
                                // Deselect if already selected
                                updateFormData("useExistingPhone", false)
                                updateFormData("existingPhoneId", "")
                              } else {
                                // Select this phone
                                updateFormData("useExistingPhone", true)
                                updateFormData("existingPhoneId", phone.id)
                              }
                            }}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <Phone className={clsx("w-5 h-5", isDarkMode ? 'text-green-400' : 'text-green-600')} />
                                <div className="flex-1">
                                  <h3 className={clsx("font-semibold", theme.textPrimary)}>{phone.id}</h3>
                                  {phone.agent_id && (
                                    <p className={clsx("text-sm", theme.textTertiary)}>
                                      Currently assigned to an agent
                                    </p>
                                  )}
                                </div>
                                {isSelected && (
                                  <CheckCircle2 className={clsx("w-5 h-5", isDarkMode ? 'text-green-400' : 'text-green-600')} />
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  )}
                  <p className={clsx("font-bold", theme.textTertiary)}>
                    Or import a new phone number:
                  </p>
                </div>
              )}

              {/* Provider Selection Tabs */}
              <div className="flex items-center border-b-2" style={{ borderColor: isDarkMode ? "rgba(0, 255, 255, 0.3)" : "rgba(14,165,233,0.3)" }}>
                {["twilio", "vanage", "plivo", "exotel"].map((provider) => {
                  const isActive = formData.phoneSetup.provider === provider
                  return (
                    <button
                      key={provider}
                      onClick={() => updateFormData("phoneSetup", { ...formData.phoneSetup, provider })}
                      className={clsx(
                        "cursor-pointer w-full border-b-2 transition-all duration-300 px-2 py-1 md:px-4 md:py-2",
                        isActive
                          ? isDarkMode
                            ? "border-cyan-400 text-cyan-400"
                            : "border-cyan-600 text-cyan-600"
                          : isDarkMode
                            ? "text-gray-400 border-transparent hover:text-cyan-300"
                            : "text-gray-600 border-transparent hover:text-cyan-500"
                      )}
                      style={isActive ? {
                        textShadow: isDarkMode ? "0 0 10px rgba(0, 255, 255, 0.5)" : "none"
                      } : {}}
                    >
                      {provider.toUpperCase()}
                    </button>
                  )
                })}
              </div>

              {/* Common Fields */}
              <div className="space-y-4">
                <div>
                  <Label
                    className={clsx(
                      "text-sm mb-2 block",
                      isDarkMode ? "text-cyan-300" : "text-cyan-600"
                    )}
                  >
                    Region
                  </Label>
                  <select
                    value={formData.phoneSetup.region}
                    onChange={(e) =>
                      updateFormData("phoneSetup", { ...formData.phoneSetup, region: e.target.value })
                    }
                    className={clsx(
                      "w-full p-3 rounded-lg border-2",
                      isDarkMode ? "border-cyan-400" : "border-cyan-600",
                      theme.inputBg, theme.inputText
                    )}
                    style={{ boxShadow: `0 0 10px rgba(0, 255, 255, ${isDarkMode ? 0.3 : 0.7})` }}
                  >
                    <option value="us-west">US West</option>
                    <option value="us-east">US East</option>
                  </select>
                </div>
                <div>
                  <Label
                    className={clsx(
                      "text-sm mb-2 block",
                      isDarkMode ? "text-cyan-300" : "text-cyan-600"
                    )}
                  >
                    Country
                  </Label>
                  <select
                    value={formData.phoneSetup.country}
                    onChange={(e) =>
                      updateFormData("phoneSetup", { ...formData.phoneSetup, country: e.target.value })
                    }
                    className={clsx(
                      "w-full p-3 rounded-lg border-2",
                      isDarkMode ? "border-cyan-400" : "border-cyan-600",
                      theme.inputBg, theme.inputText
                    )}
                    style={{ boxShadow: `0 0 10px rgba(0, 255, 255, ${isDarkMode ? 0.3 : 0.7})` }}
                  >
                    {countryPhoneOptions.map((country, index) => (
                      <option key={index} value={country.value}>{country.value}</option>
                    ))}
                  </select>
                </div>

                {/* Plivo Fields */}
                {formData.phoneSetup.provider === "plivo" && (
                  <>
                    <div>
                      <Label
                        className={clsx(
                          "text-sm mb-2 block",
                          isDarkMode ? "text-cyan-300" : "text-cyan-600"
                        )}
                      >
                        Auth ID
                      </Label>
                      <Input
                        value={formData.phoneSetup.authId}
                        onChange={(e) =>
                          updateFormData("phoneSetup", { ...formData.phoneSetup, authId: e.target.value })
                        }
                        placeholder="Plivo Auth ID"
                        className={clsx(
                          "border-2",
                          isDarkMode ? "border-cyan-400" : "border-cyan-600",
                          theme.inputBg, theme.inputText
                        )}
                        style={{ boxShadow: `0 0 10px rgba(0, 255, 255, ${isDarkMode ? 0.3 : 0.7})` }}
                      />
                    </div>
                    <div>
                      <Label
                        className={clsx(
                          "text-sm mb-2 block",
                          isDarkMode ? "text-cyan-300" : "text-cyan-600"
                        )}
                      >
                        Auth Token
                      </Label>
                      <Input
                        type="password"
                        value={formData.phoneSetup.authToken}
                        onChange={(e) =>
                          updateFormData("phoneSetup", { ...formData.phoneSetup, authToken: e.target.value })
                        }
                        placeholder="Plivo Auth Token"
                        className={clsx(
                          "border-2",
                          isDarkMode ? "border-cyan-400" : "border-cyan-600",
                          theme.inputBg, theme.inputText
                        )}
                        style={{ boxShadow: `0 0 10px rgba(0, 255, 255, ${isDarkMode ? 0.3 : 0.7})` }}
                      />
                    </div>
                  </>
                )}

                {/* Twilio/Vonage/Exotel Fields */}
                {formData.phoneSetup.provider !== "plivo" && (
                  <>
                    <div>
                      <Label
                        className={clsx(
                          "text-sm mb-2 block",
                          isDarkMode ? "text-cyan-300" : "text-cyan-600"
                        )}
                      >
                        API Key
                      </Label>
                      <Input
                        value={formData.phoneSetup.apiKey}
                        onChange={(e) =>
                          updateFormData("phoneSetup", { ...formData.phoneSetup, apiKey: e.target.value })
                        }
                        placeholder="Provider API Key"
                        className={clsx(
                          "border-2",
                          isDarkMode ? "border-cyan-400" : "border-cyan-600",
                          theme.inputBg, theme.inputText
                        )}
                        style={{ boxShadow: `0 0 10px rgba(0, 255, 255, ${isDarkMode ? 0.3 : 0.7})` }}
                      />
                    </div>
                    <div>
                      <Label
                        className={clsx(
                          "text-sm mb-2 block",
                          isDarkMode ? "text-cyan-300" : "text-cyan-600"
                        )}
                      >
                        API {formData.phoneSetup.provider === "exotel" ? "Token" : "Secret"}
                      </Label>
                      <Input
                        type="password"
                        value={formData.phoneSetup.apiSecret}
                        onChange={(e) =>
                          updateFormData("phoneSetup", { ...formData.phoneSetup, apiSecret: e.target.value })
                        }
                        placeholder={`${formData.phoneSetup.provider === "exotel" ? "API Token" : "API Secret"}`}
                        className={clsx(
                          "border-2",
                          isDarkMode ? "border-cyan-400" : "border-cyan-600",
                          theme.inputBg, theme.inputText
                        )}
                        style={{ boxShadow: `0 0 10px rgba(0, 255, 255, ${isDarkMode ? 0.3 : 0.7})` }}
                      />
                    </div>
                    {formData.phoneSetup.provider !== "vanage" && (
                      <div>
                        <Label
                          className={clsx(
                            "text-sm mb-2 block",
                            isDarkMode ? "text-cyan-300" : "text-cyan-600"
                          )}
                        >
                          Account SID
                        </Label>
                        <Input
                          value={formData.phoneSetup.accountSid}
                          onChange={(e) =>
                            updateFormData("phoneSetup", { ...formData.phoneSetup, accountSid: e.target.value })
                          }
                          placeholder="Account SID"
                          className={clsx(
                            "border-2",
                            isDarkMode ? "border-cyan-400" : "border-cyan-600",
                            theme.inputBg, theme.inputText
                          )}
                          style={{ boxShadow: `0 0 10px rgba(0, 255, 255, ${isDarkMode ? 0.3 : 0.7})` }}
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Exotel Specific Fields */}
                {formData.phoneSetup.provider === "exotel" && (
                  <>
                    <div>
                      <Label
                        className={clsx(
                          "text-sm mb-2 block",
                          isDarkMode ? "text-cyan-300" : "text-cyan-600"
                        )}
                      >
                        Subdomain
                      </Label>
                      <select
                        value={formData.phoneSetup.subdomain}
                        onChange={(e) =>
                          updateFormData("phoneSetup", { ...formData.phoneSetup, subdomain: e.target.value })
                        }
                        className={clsx(
                          "w-full p-3 rounded-lg border-2",
                          isDarkMode ? "border-cyan-400" : "border-cyan-600",
                          theme.inputBg, theme.inputText
                        )}
                        style={{ boxShadow: `0 0 10px rgba(0, 255, 255, ${isDarkMode ? 0.3 : 0.7})` }}
                      >
                        <option value="api.exotel.com">api.exotel.com (Singapore)</option>
                        <option value="api.in.exotel.com">api.in.exotel.com (Mumbai)</option>
                      </select>
                    </div>
                    <div>
                      <Label
                        className={clsx(
                          "text-sm mb-2 block",
                          isDarkMode ? "text-cyan-300" : "text-cyan-600"
                        )}
                      >
                        App ID
                      </Label>
                      <Input
                        value={formData.phoneSetup.appId}
                        onChange={(e) =>
                          updateFormData("phoneSetup", { ...formData.phoneSetup, appId: e.target.value })
                        }
                        placeholder="Exotel App ID"
                        className={clsx(
                          "border-2",
                          isDarkMode ? "border-cyan-400" : "border-cyan-600",
                          theme.inputBg, theme.inputText
                        )}
                        style={{ boxShadow: `0 0 10px rgba(0, 255, 255, ${isDarkMode ? 0.3 : 0.7})` }}
                      />
                    </div>
                  </>
                )}
                <div>
                  <Label
                    className={clsx(
                      "text-sm mb-2 block",
                      isDarkMode ? "text-cyan-300" : "text-cyan-600"
                    )}
                  >
                    Phone Number
                  </Label>
                  <Input
                    value={formData.selectedPhoneNumber}
                    onChange={(e) => updateFormData("selectedPhoneNumber", e.target.value)}
                    placeholder="+12345678990"
                    className={clsx(
                      "border-2",
                      isDarkMode ? "border-cyan-400" : "border-cyan-600",
                      theme.inputBg, theme.inputText
                    )}
                    style={{ boxShadow: `0 0 10px rgba(0, 255, 255, ${isDarkMode ? 0.3 : 0.7})` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div
                className={clsx(
                  "w-20 h-20 bg-gradient-to-r rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse",
                  stepConfig.gradient
                )}
                style={{
                  boxShadow: `0 0 30px ${stepConfig.color}, 0 0 60px ${stepConfig.color}`,
                }}
              >
                <stepConfig.icon className="w-10 h-10 text-white" />
              </div>
              <h2
                className={clsx("text-3xl font-bold", theme.textPrimary)}
                style={{ textShadow: isDarkMode ? `0 0 20px ${stepConfig.color}` : 'none' }}
              >
                {stepConfig.title}
              </h2>
              <p
                className={clsx("text-xl", theme.textSecondary)}
                style={{ textShadow: isDarkMode ? `0 0 10px ${stepConfig.color}` : 'none' }}
              >
                {stepConfig.subtitle}
              </p>
              <p className={clsx("max-w-md mx-auto", theme.textTertiary)}>
                {stepConfig.description}
              </p>
            </div>

            <div className="space-y-6">
              {!currentUser?.api_keys?.elevenlabs && (
                <>
                  <div className="space-y-4">
                    <Label
                      htmlFor="elevenlabsKey"
                      className={clsx("text-lg", theme.textPrimary)}
                      style={{ textShadow: theme.textShadow }}
                    >
                      ElevenLabs API Key
                    </Label>
                    <div className="flex gap-3">
                      <Input
                        id="elevenlabsKey"
                        type="password"
                        placeholder="Enter your ElevenLabs API key"
                        value={formData.elevenlabsApiKey}
                        onChange={(e) => updateFormData("elevenlabsApiKey", e.target.value)}
                        className={clsx(
                          "text-xl h-14 border-2 flex-1",
                          theme.inputBg,
                          theme.inputText,
                          theme.inputPlaceholder
                        )}
                        style={{
                          border: `2px solid ${theme.inputBorder}`,
                          boxShadow: theme.inputShadow,
                        }}
                      />
                      <Button
                        onClick={testElevenLabsConnection}
                        disabled={!formData.elevenlabsApiKey.trim() || isTestingConnection}
                        className="h-14 px-8 text-lg text-white border-0 transition-all duration-200 disabled:opacity-50"
                        style={{
                          background: "linear-gradient(45deg, #FF00FF, #00FFFF)",
                          boxShadow: "0 0 30px #FF00FF, 0 0 60px #00FFFF",
                        }}
                      >
                        {isTestingConnection ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Testing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5 mr-2" />
                            Test Connection
                          </>
                        )}
                      </Button>
                    </div>
                    <p className={clsx("text-sm", theme.textTertiary)}>
                      You can find your API key in your ElevenLabs account settings.
                    </p>
                  </div>

                  {isTestingConnection && (
                    <div className="relative h-32 flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="w-12 h-12 animate-pulse" style={{ color: stepConfig.color }} />
                      </div>
                      <div className="absolute inset-0">
                        {Array.from({ length: 20 }).map((_, i) => (
                          <div
                            key={i}
                            className="absolute w-1 h-1 rounded-full animate-ping"
                            style={{
                              left: `${Math.random() * 100}%`,
                              top: `${Math.random() * 100}%`,
                              backgroundColor: stepConfig.color,
                              animationDelay: `${Math.random() * 2}s`,
                              animationDuration: `${1 + Math.random()}s`,
                            }}
                          />
                        ))}
                      </div>
                      <p className={clsx("text-lg font-semibold relative z-10", theme.textSecondary)}>
                        Fetching available voices...
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Show loading animation if API key exists and voices are being fetched */}
              {currentUser?.api_keys?.elevenlabs && isTestingConnection && (
                <div className="relative h-32 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-12 h-12 animate-pulse" style={{ color: stepConfig.color }} />
                  </div>
                  <div className="absolute inset-0">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-1 h-1 rounded-full animate-ping"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                          backgroundColor: stepConfig.color,
                          animationDelay: `${Math.random() * 2}s`,
                          animationDuration: `${1 + Math.random()}s`,
                        }}
                      />
                    ))}
                  </div>
                  <p className={clsx("text-lg font-semibold relative z-10", theme.textSecondary)}>
                    Fetching available voices...
                  </p>
                </div>
              )}

              {/* Default Voices list (when no ElevenLabs API key) */}
              {!formData.elevenlabsApiKey.trim() && defaultVoices.length > 0 && (
                <div className="space-y-4">
                  <Label className={clsx("text-lg", theme.textPrimary)}>
                    Select a Default Voice
                  </Label>
                  {isLoadingDefaultVoices ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin" style={{ color: stepConfig.color }} />
                    </div>
                  ) : (
                    <div className="grid gap-3 max-h-96 overflow-y-auto">
                      {defaultVoices.map((voice) => {
                        const isSelected = formData.voice === voice.voice_id
                        const isPlaying = isPlayingVoice === voice.voice_id

                        return (
                          <Card
                            key={voice.voice_id}
                            className={clsx(
                              "cursor-pointer transition-all duration-300",
                              isSelected
                                ? isDarkMode
                                  ? "bg-purple-500/20 border-purple-400"
                                  : "bg-purple-100 border-purple-400"
                                : isDarkMode
                                  ? "bg-black/50 border-gray-600 hover:border-purple-400"
                                  : "bg-white/70 border-gray-300 hover:border-purple-400"
                            )}
                            style={{
                              boxShadow: isSelected
                                ? isDarkMode
                                  ? "0 0 30px #FF00FF"
                                  : "0 0 30px rgba(147,51,234,0.5)"
                                : isDarkMode
                                  ? "0 0 10px rgba(255, 0, 255, 0.3)"
                                  : "0 0 10px rgba(147,51,234,0.2)",
                            }}
                            onClick={() => updateFormData("voice", voice.voice_id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1">
                                  <Volume2
                                    className={clsx(
                                      "w-6 h-6",
                                      isDarkMode ? 'text-purple-400' : 'text-purple-600'
                                    )}
                                  />
                                  <div className="flex-1">
                                    <h3 className={clsx("font-bold text-lg", theme.textPrimary)}>
                                      {voice.name}
                                    </h3>
                                    {voice.provider && (
                                      <p className={clsx("text-sm", theme.textTertiary)}>
                                        Provider: {voice.provider}
                                      </p>
                                    )}
                                    {voice.category && (
                                      <p className={clsx("text-sm", theme.textTertiary)}>
                                        {voice.category}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                {voice.preview_url && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      playVoicePreview(voice)
                                    }}
                                    className={clsx(
                                      "ml-4",
                                      isDarkMode
                                        ? 'border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black'
                                        : 'border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white'
                                    )}
                                    style={{
                                      boxShadow: isDarkMode
                                        ? "0 0 15px #FF00FF"
                                        : "0 0 15px rgba(147,51,234,0.4)",
                                    }}
                                  >
                                    {isPlaying ? (
                                      <>
                                        <Pause className="w-4 h-4 mr-2" />
                                        Playing
                                      </>
                                    ) : (
                                      <>
                                        <Play className="w-4 h-4 mr-2" />
                                        Preview
                                      </>
                                    )}
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ElevenLabs Voices list */}
              {elevenlabsVoices.length > 0 && (
                <div className="space-y-4">
                  <Label className={clsx("text-lg", theme.textPrimary)}>
                    Select a Voice
                  </Label>
                  <div className="grid gap-3 max-h-96 overflow-y-auto">
                    {elevenlabsVoices.map((voice) => {
                      const isSelected = formData.voice === voice.voice_id
                      const isPlaying = isPlayingVoice === voice.voice_id

                      return (
                        <Card
                          key={voice.voice_id}
                          className={clsx(
                            "cursor-pointer transition-all duration-300",
                            isSelected
                              ? isDarkMode
                                ? "bg-purple-500/20 border-purple-400"
                                : "bg-purple-100 border-purple-400"
                              : isDarkMode
                                ? "bg-black/50 border-gray-600 hover:border-purple-400"
                                : "bg-white/70 border-gray-300 hover:border-purple-400"
                          )}
                          style={{
                            boxShadow: isSelected
                              ? isDarkMode
                                ? "0 0 30px #FF00FF"
                                : "0 0 30px rgba(147,51,234,0.5)"
                              : isDarkMode
                                ? "0 0 10px rgba(255, 0, 255, 0.3)"
                                : "0 0 10px rgba(147,51,234,0.2)",
                          }}
                          onClick={() => updateFormData("voice", voice.voice_id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 flex-1">
                                <Volume2
                                  className={clsx(
                                    "w-6 h-6",
                                    isDarkMode ? 'text-purple-400' : 'text-purple-600'
                                  )}
                                />
                                <div className="flex-1">
                                  <h3 className={clsx("font-bold text-lg", theme.textPrimary)}>
                                    {voice.name}
                                  </h3>
                                  {voice.category && (
                                    <p className={clsx("text-sm", theme.textTertiary)}>
                                      {voice.category}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {voice.preview_url && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    playVoicePreview(voice)
                                  }}
                                  className={clsx(
                                    "ml-4",
                                    isDarkMode
                                      ? 'border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black'
                                      : 'border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white'
                                  )}
                                  style={{
                                    boxShadow: isDarkMode
                                      ? "0 0 15px #FF00FF"
                                      : "0 0 15px rgba(147,51,234,0.4)",
                                  }}
                                >
                                  {isPlaying ? (
                                    <>
                                      <Pause className="w-4 h-4 mr-2" />
                                      Playing
                                    </>
                                  ) : (
                                    <>
                                      <Play className="w-4 h-4 mr-2" />
                                      Preview
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case 3:
        const creditInCents = (currentUser?.total_credit || 0) - (currentUser?.used_credit || 0)
        const availableCredit = convertFromUSDCents(creditInCents, selectedCurrency)
        const needsPaymentMethod = creditInCents < 100 && paymentMethods.length === 0
        const showPaymentMethods = creditInCents < 100 && paymentMethods.length > 0

        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div
                className={clsx(
                  "w-20 h-20 bg-gradient-to-r rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse",
                  stepConfig.gradient
                )}
                style={{
                  boxShadow: `0 0 30px ${stepConfig.color}, 0 0 60px ${stepConfig.color}`,
                }}
              >
                <stepConfig.icon className="w-10 h-10 text-white" />
              </div>
              <h2
                className={clsx("text-3xl font-bold", theme.textPrimary)}
                style={{ textShadow: isDarkMode ? `0 0 20px ${stepConfig.color}` : 'none' }}
              >
                {stepConfig.title}
              </h2>
              <p
                className={clsx("text-xl", theme.textSecondary)}
                style={{ textShadow: isDarkMode ? `0 0 10px ${stepConfig.color}` : 'none' }}
              >
                {stepConfig.subtitle}
              </p>
              <p className={clsx("max-w-md mx-auto", theme.textTertiary)}>
                {stepConfig.description}
              </p>
            </div>

            <div className="space-y-6">
              {/* Credit Balance Card */}
              <Card
                className={clsx(
                  "transition-all duration-300",
                  isDarkMode ? "bg-black/50 border-gray-600" : "bg-white/70 border-gray-300"
                )}
                style={{
                  boxShadow: isDarkMode
                    ? "0 0 10px rgba(255, 255, 0, 0.3)"
                    : "0 0 10px rgba(245,158,11,0.2)",
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className={clsx("font-bold text-lg mb-1", theme.textPrimary)}>
                        Available Credit
                      </h3>
                      <p className={clsx("text-3xl font-bold", creditInCents < 100 ? "text-red-500" : "text-green-500")}>
                        {formatCurrency(availableCredit, selectedCurrency)}
                      </p>
                    </div>
                    <CreditCard className={clsx("w-12 h-12", isDarkMode ? "text-orange-400" : "text-orange-600")} />
                  </div>
                  {creditInCents < 100 && (
                    <div className={clsx(
                      "p-3 rounded-lg",
                      isDarkMode ? "bg-red-500/20 border border-red-500/50" : "bg-red-50 border border-red-200"
                    )}>
                      <p className={clsx("text-sm", isDarkMode ? "text-red-300" : "text-red-700")}>
                        ⚠️ Your credit is below {formatCurrency(convertFromUSDCents(100, selectedCurrency), selectedCurrency)}. Please add a payment method to continue.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Methods Section - Show if credit < $1 */}
              {showPaymentMethods && (
                <Card
                  className={clsx(
                    "transition-all duration-300",
                    isDarkMode ? "bg-black/50 border-gray-600" : "bg-white/70 border-gray-300"
                  )}
                  style={{
                    boxShadow: isDarkMode
                      ? "0 0 10px rgba(255, 255, 0, 0.3)"
                      : "0 0 10px rgba(245,158,11,0.2)",
                  }}
                >
                  <CardContent className="p-6">
                    <h3 className={clsx("font-bold text-lg mb-4", theme.textPrimary)}>
                      Your Payment Methods
                    </h3>
                    {isLoadingPaymentMethods ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin" style={{ color: stepConfig.color }} />
                      </div>
                    ) : paymentMethods.length > 0 ? (
                      <div className="space-y-3">
                        {paymentMethods.map((method) => (
                          <div
                            key={method.id}
                            className={clsx(
                              "p-4 rounded-lg border-2 flex items-center justify-between",
                              method.is_default
                                ? isDarkMode
                                  ? "bg-orange-500/20 border-orange-400"
                                  : "bg-orange-100 border-orange-400"
                                : isDarkMode
                                  ? "bg-black/30 border-gray-600"
                                  : "bg-gray-50 border-gray-300"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <CreditCard className={clsx("w-5 h-5", isDarkMode ? "text-gray-400" : "text-gray-600")} />
                              <div>
                                <p className={clsx("font-semibold", theme.textPrimary)}>
                                  {method.card.brand.toUpperCase()} •••• {method.card.last4}
                                </p>
                                <p className={clsx("text-sm", theme.textTertiary)}>
                                  Expires {method.card.exp_month}/{method.card.exp_year}
                                  {method.is_default && (
                                    <span className={clsx("ml-2 px-2 py-0.5 rounded text-xs", isDarkMode ? "bg-orange-500/30 text-orange-300" : "bg-orange-200 text-orange-700")}>
                                      Default
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={clsx("text-sm text-center py-4", theme.textTertiary)}>
                        No payment methods found.
                      </p>
                    )}
                    <div className="mt-4 pt-4 border-t" style={{ borderColor: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}>
                      <Button
                        onClick={() => setShowPaymentForm(true)}
                        variant="outline"
                        className={clsx(
                          "w-full border-2",
                          isDarkMode
                            ? "text-white border-cyan-400 bg-black/50 hover:bg-cyan-500/20 hover:border-cyan-300"
                            : "text-gray-900 border-cyan-600 bg-white hover:bg-cyan-50 hover:border-cyan-500"
                        )}
                        style={{
                          boxShadow: isDarkMode
                            ? "0 0 10px rgba(0, 255, 255, 0.3)"
                            : "0 0 10px rgba(14,165,233,0.2)",
                        }}
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Add Payment Method
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Payment Form Card */}
              {showPaymentForm && (
                <Card
                  className={clsx(
                    "transition-all duration-300",
                    isDarkMode ? "bg-black/50 border-gray-600" : "bg-white/70 border-gray-300"
                  )}
                  style={{
                    boxShadow: isDarkMode
                      ? "0 0 10px rgba(255, 255, 0, 0.3)"
                      : "0 0 10px rgba(245,158,11,0.2)",
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={clsx("font-bold text-lg", theme.textPrimary)}>
                        Add Payment Method
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPaymentForm(false)}
                        className={clsx(
                          isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"
                        )}
                      >
                        ×
                      </Button>
                    </div>
                    {showPaymentForm && (
                      <Elements stripe={stripePromise}>
                        <PaymentForm
                          isDarkMode={isDarkMode}
                          onClose={() => setShowPaymentForm(false)}
                          onSuccess={fetchPaymentMethods}
                        />
                      </Elements>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Require Payment Method Message */}
              {needsPaymentMethod && !showPaymentForm && (
                <Card
                  className={clsx(
                    "transition-all duration-300 border-2",
                    isDarkMode ? "bg-red-500/20 border-red-400" : "bg-red-50 border-red-400"
                  )}
                  style={{
                    boxShadow: isDarkMode
                      ? "0 0 20px rgba(239, 68, 68, 0.5)"
                      : "0 0 20px rgba(239, 68, 68, 0.3)",
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={clsx("w-12 h-12 rounded-full flex items-center justify-center", isDarkMode ? "bg-red-500/30" : "bg-red-100")}>
                        <CreditCard className={clsx("w-6 h-6", isDarkMode ? "text-red-400" : "text-red-600")} />
                      </div>
                      <div className="flex-1">
                        <h3 className={clsx("font-bold text-lg mb-1", isDarkMode ? "text-red-300" : "text-red-700")}>
                          Payment Method Required
                        </h3>
                        <p className={clsx("text-sm mb-4", isDarkMode ? "text-red-300" : "text-red-700")}>
                          Your credit is below $1.00 and you don't have a payment method. Please add a payment method to continue.
                        </p>
                        <Button
                          onClick={() => setShowPaymentForm(true)}
                          className={clsx(
                            "text-white border-0",
                            isDarkMode
                              ? "bg-red-500 hover:bg-red-600"
                              : "bg-red-600 hover:bg-red-700"
                          )}
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          Add Payment Method
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Billing Confirmation Card - Only show if credit >= $1 or payment method exists */}
              {!needsPaymentMethod && (
                <Card
                  className={clsx(
                    "cursor-pointer transition-all duration-300",
                    formData.billingConfirmed
                      ? isDarkMode
                        ? "bg-orange-500/20 border-orange-400"
                        : "bg-orange-100 border-orange-400"
                      : isDarkMode
                        ? "bg-black/50 border-gray-600 hover:border-orange-400"
                        : "bg-white/70 border-gray-300 hover:border-orange-400"
                  )}
                  style={{
                    boxShadow: formData.billingConfirmed
                      ? isDarkMode
                        ? "0 0 30px #FFFF00"
                        : "0 0 30px rgba(245,158,11,0.5)"
                      : isDarkMode
                        ? "0 0 10px rgba(255, 255, 0, 0.3)"
                        : "0 0 10px rgba(245,158,11,0.2)",
                  }}
                  onClick={() => updateFormData("billingConfirmed", !formData.billingConfirmed)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <CheckCircle2
                        className={clsx(
                          "w-8 h-8",
                          formData.billingConfirmed
                            ? isDarkMode ? 'text-orange-400' : 'text-orange-600'
                            : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                        )}
                      />
                      <div className="flex-1">
                        <h3 className={clsx("font-bold text-lg mb-1", theme.textPrimary)}>
                          I have verified my billing information
                        </h3>
                        <p className={clsx("text-sm", theme.textTertiary)}>
                          {creditInCents >= 100
                            ? "You have sufficient credit to continue."
                            : paymentMethods.length > 0
                              ? "Your payment method is set up and ready."
                              : "Make sure you have a valid payment method set up to ensure uninterrupted service."}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div
                className={clsx(
                  "w-20 h-20 bg-gradient-to-r rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse",
                  stepConfig.gradient
                )}
                style={{
                  boxShadow: `0 0 30px ${stepConfig.color}, 0 0 60px ${stepConfig.color}`,
                }}
              >
                <stepConfig.icon className="w-10 h-10 text-white" />
              </div>
              <h2
                className={clsx("text-3xl font-bold", theme.textPrimary)}
                style={{ textShadow: isDarkMode ? `0 0 20px ${stepConfig.color}` : 'none' }}
              >
                {stepConfig.title}
              </h2>
              <p
                className={clsx("text-xl", theme.textSecondary)}
                style={{ textShadow: isDarkMode ? `0 0 10px ${stepConfig.color}` : 'none' }}
              >
                {stepConfig.subtitle}
              </p>
              <p className={clsx("max-w-md mx-auto", theme.textTertiary)}>
                {stepConfig.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {industries.map((industry) => {
                const isSelected = formData.industry === industry.id
                return (
                  <Card
                    key={industry.id}
                    className={clsx(
                      "cursor-pointer transition-all duration-300 hover:scale-105 border-2",
                      isSelected
                        ? isDarkMode
                          ? "bg-teal-500/20 border-teal-400"
                          : "bg-teal-100 border-teal-500"
                        : isDarkMode
                          ? "bg-black/50 border-gray-600 hover:border-teal-400"
                          : "bg-white/70 border-gray-300 hover:border-teal-500"
                    )}
                    style={{
                      boxShadow: isSelected
                        ? isDarkMode
                          ? `0 0 30px ${stepConfig.color}`
                          : `0 0 30px rgba(20,184,166,0.5)`
                        : isDarkMode
                          ? `0 0 10px rgba(20,184,166,0.3)`
                          : `0 0 10px rgba(20,184,166,0.2)`,
                    }}
                    onClick={() => updateFormData("industry", industry.id)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl mb-3">{industry.icon}</div>
                      <h3 className={clsx("font-semibold text-lg mb-2", theme.textPrimary)}>
                        {industry.name}
                      </h3>
                      <p className={clsx("text-sm", theme.textTertiary)}>
                        {industry.description}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div
                className={clsx(
                  "w-20 h-20 bg-gradient-to-r rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse",
                  stepConfig.gradient
                )}
                style={{
                  boxShadow: `0 0 30px ${stepConfig.color}, 0 0 60px ${stepConfig.color}`,
                }}
              >
                <stepConfig.icon className="w-10 h-10 text-white" />
              </div>
              <h2
                className={clsx("text-3xl font-bold", theme.textPrimary)}
                style={{ textShadow: isDarkMode ? `0 0 20px ${stepConfig.color}` : 'none' }}
              >
                {stepConfig.title}
              </h2>
              <p
                className={clsx("text-xl", theme.textSecondary)}
                style={{ textShadow: isDarkMode ? `0 0 10px ${stepConfig.color}` : 'none' }}
              >
                {stepConfig.subtitle}
              </p>
              <p className={clsx("max-w-md mx-auto", theme.textTertiary)}>
                {stepConfig.description}
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="agentName" className={clsx("text-lg", theme.textPrimary)}>
                  Agent Name
                </Label>
                <Input
                  id="agentName"
                  placeholder="e.g., Sarah, Alex, or CustomerBot"
                  value={formData.agentName}
                  onChange={(e) => updateFormData("agentName", e.target.value)}
                  className={clsx("h-12 border-2", theme.inputBg, theme.inputText, theme.inputPlaceholder)}
                  style={{ border: `2px solid ${theme.inputBorder}`, boxShadow: theme.inputShadow }}
                />
              </div>
              <div>
                <Label htmlFor="purpose" className={clsx("text-lg", theme.textPrimary)}>
                  Agent Purpose
                </Label>
                <Textarea
                  id="purpose"
                  placeholder="e.g., Answer questions about our products, schedule appointments, qualify leads..."
                  value={formData.purpose}
                  onChange={(e) => updateFormData("purpose", e.target.value)}
                  className={clsx("min-h-[100px] border-2", theme.inputBg, theme.inputText, theme.inputPlaceholder)}
                  style={{ border: `2px solid ${theme.inputBorder}`, boxShadow: theme.inputShadow }}
                />
              </div>
              {/* Only show voice selection if no voice was selected in step 3 */}
              {!formData.voice && (
                <div>
                  <Label htmlFor="voice" className={clsx("text-lg mb-3 block", theme.textPrimary)}>
                    Voice (optional)
                  </Label>
                  <div className="grid gap-3">
                    {voices.slice(0, 3).map((voice) => {
                      const isSelected = formData.voice === voice.id;
                      return (
                        <Card
                          key={voice.id}
                          className={clsx(
                            "cursor-pointer transition-all duration-300",
                            isSelected
                              ? isDarkMode ? "bg-indigo-500/20 border-indigo-400" : "bg-indigo-100 border-indigo-400"
                              : isDarkMode ? "bg-black/50 border-gray-600" : "bg-white/70 border-gray-300"
                          )}
                          onClick={() => updateFormData("voice", voice.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <Volume2 className={clsx("w-5 h-5", isDarkMode ? 'text-indigo-400' : 'text-indigo-600')} />
                              <div className="flex-1">
                                <h3 className={clsx("font-semibold", theme.textPrimary)}>{voice.name}</h3>
                                <p className={clsx("text-sm", theme.textTertiary)}>{voice.accent}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Show selected voice info if voice was selected in step 3 */}
              {formData.voice && (
                <div>
                  <Label className={clsx("text-lg mb-3 block", theme.textPrimary)}>
                    Selected Voice
                  </Label>
                  <Card
                    className={clsx(
                      "transition-all duration-300",
                      isDarkMode ? "bg-indigo-500/20 border-indigo-400" : "bg-indigo-100 border-indigo-400"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Volume2 className={clsx("w-5 h-5", isDarkMode ? 'text-indigo-400' : 'text-indigo-600')} />
                        <div className="flex-1">
                          <h3 className={clsx("font-semibold", theme.textPrimary)}>
                            {elevenlabsVoices.find(v => v.voice_id === formData.voice)?.name ||
                              voices.find(v => v.id === formData.voice)?.name ||
                              'Selected Voice'}
                          </h3>
                          <p className={clsx("text-sm", theme.textTertiary)}>
                            Voice selected from ElevenLabs
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div
                className={clsx(
                  "w-20 h-20 bg-gradient-to-r rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse",
                  stepConfig.gradient
                )}
                style={{
                  boxShadow: `0 0 30px ${stepConfig.color}, 0 0 60px ${stepConfig.color}`,
                }}
              >
                <stepConfig.icon className="w-10 h-10 text-white" />
              </div>
              <h2
                className={clsx("text-3xl font-bold", theme.textPrimary)}
                style={{ textShadow: isDarkMode ? `0 0 20px ${stepConfig.color}` : 'none' }}
              >
                {stepConfig.title}
              </h2>
              <p
                className={clsx("text-xl", theme.textSecondary)}
                style={{ textShadow: isDarkMode ? `0 0 10px ${stepConfig.color}` : 'none' }}
              >
                {stepConfig.subtitle}
              </p>
              <p className={clsx("max-w-md mx-auto", theme.textTertiary)}>
                {stepConfig.description}
              </p>
            </div>

            <div className="space-y-6">
              {isLoadingTools ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" style={{ color: stepConfig.color }} />
                </div>
              ) : connectedTools.length > 0 ? (
                <div className="space-y-4">
                  <Label className={clsx("text-lg", theme.textPrimary)}>
                    Select Tools to Configure (Optional)
                  </Label>
                  <p className={clsx("text-sm", theme.textTertiary)}>
                    Select the tools you want to configure for this agent. You can skip this step and configure tools later.
                  </p>
                  <div className="grid gap-3 max-h-96 overflow-y-auto">
                    {connectedTools.map((tool) => {
                      const isSelected = formData.selectedTools.includes(tool.id)
                      return (
                        <Card
                          key={tool.id}
                          className={clsx(
                            "cursor-pointer transition-all duration-300",
                            isSelected
                              ? isDarkMode
                                ? "bg-pink-500/20 border-pink-400"
                                : "bg-pink-100 border-pink-400"
                              : isDarkMode
                                ? "bg-black/50 border-gray-600 hover:border-pink-400"
                                : "bg-white/70 border-gray-300 hover:border-pink-400"
                          )}
                          style={{
                            boxShadow: isSelected
                              ? isDarkMode
                                ? "0 0 30px #FF0080"
                                : "0 0 30px rgba(236,72,153,0.5)"
                              : isDarkMode
                                ? "0 0 10px rgba(255, 0, 128, 0.3)"
                                : "0 0 10px rgba(236,72,153,0.2)",
                          }}
                          onClick={() => {
                            const newSelectedTools = isSelected
                              ? formData.selectedTools.filter(id => id !== tool.id)
                              : [...formData.selectedTools, tool.id]
                            updateFormData("selectedTools", newSelectedTools)
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <Plug className={clsx("w-5 h-5", isDarkMode ? 'text-pink-400' : 'text-pink-600')} />
                              <div className="flex-1">
                                <h3 className={clsx("font-semibold", theme.textPrimary)}>{tool.name}</h3>
                                {tool.description && (
                                  <p className={clsx("text-sm", theme.textTertiary)}>{tool.description}</p>
                                )}
                              </div>
                              {isSelected && (
                                <CheckCircle2 className={clsx("w-5 h-5", isDarkMode ? 'text-pink-400' : 'text-pink-600')} />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className={clsx("text-center", theme.textTertiary)}>
                    You can connect tools and integrations later from the Settings page.
                  </p>
                </div>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        if (formData.useExistingPhone && formData.existingPhoneId) {
          return true
        }
        const { provider } = formData.phoneSetup
        let providerValid = false
        if (provider === "plivo") {
          providerValid = (
            !!formData.phoneSetup.authId &&
            !!formData.phoneSetup.authToken
          )
        } else if (provider === "vanage") {
          providerValid = (
            !!formData.phoneSetup.apiKey &&
            !!formData.phoneSetup.apiSecret
          )
        } else if (provider === "exotel") {
          providerValid = (
            !!formData.phoneSetup.apiKey &&
            !!formData.phoneSetup.apiSecret &&
            !!formData.phoneSetup.accountSid &&
            !!formData.phoneSetup.appId &&
            !!formData.phoneSetup.subdomain
          )
        } else {
          // Twilio
          providerValid = (
            !!formData.phoneSetup.accountSid &&
            !!formData.phoneSetup.apiKey &&
            !!formData.phoneSetup.apiSecret
          )
        }
        // Also require phone number if not using existing phone
        return providerValid && formData.selectedPhoneNumber.trim() !== ""
      case 2: // Connect ElevenLabs
        return formData.voice !== ""
      case 3: // Check billing
        const creditInCents = (currentUser?.total_credit || 0) - (currentUser?.used_credit || 0)
        const needsPaymentMethod = creditInCents < 100 && paymentMethods.length === 0
        // If payment method is required but not present, can't proceed
        if (needsPaymentMethod) {
          return false
        }
        // If credit is sufficient, allow skipping billing confirmation
        if (creditInCents >= 100) {
          return true
        }
        // Otherwise, require billing confirmation
        return formData.billingConfirmed
      case 4: // Select industry
        return formData.industry !== ""
      case 5: // Create agent
        return formData.agentName.trim() !== "" && formData.purpose.trim() !== ""
      case 6: // Connect tools
        return true // Tools are optional
      default:
        return false
    }
  }

  const isSkippable = (step: number) => {
    // Allow skipping for optional steps
    return step === 6 || step === 1 || step === 2
  }

  const handleSkip = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      handleNext()
    }
  }

  return (
    <div className={`min-h-screen ${theme.background} relative overflow-hidden flex items-center justify-center p-4`}>
      {/* Theme Toggle Button */}
      <Button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 w-12 h-12 rounded-full border-0 transition-all duration-300"
        style={{
          background: theme.iconBg,
          boxShadow: theme.iconShadow,
        }}
      >
        {!isDarkMode ? <Sun className="w-5 h-5 text-white" /> : <Moon className="w-5 h-5 text-white" />}
      </Button>

      {/* Electric Effects Background */}
      <svg className="absolute inset-0 pointer-events-none z-0" width="100%" height="100%">
        {electricArcs.map((arc) => (
          <line
            key={arc.id}
            x1={arc.x1}
            y1={arc.y1}
            x2={arc.x2}
            y2={arc.y2}
            stroke={theme.arcColor}
            strokeWidth="2"
            opacity="0.4"
            className="animate-pulse"
            style={{
              filter: `drop-shadow(0 0 10px ${theme.arcColor})`,
            }}
          />
        ))}
      </svg>

      {/* Spark Particles */}
      <svg className="absolute inset-0 pointer-events-none z-0" width="100%" height="100%">
        {sparkParticles.map((spark) => (
          <circle
            key={spark.id}
            cx={spark.x}
            cy={spark.y}
            r={spark.size}
            fill={spark.color}
            className="animate-pulse"
            style={{
              filter: `drop-shadow(0 0 5px ${spark.color})`,
            }}
          />
        ))}
      </svg>

      {/* Grid Background */}
      <div className="absolute inset-0 opacity-5 z-0">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(${theme.gridColor} 1px, transparent 1px),
              linear-gradient(90deg, ${theme.gridColor} 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="w-full max-w-4xl relative z-10">
        {/* Progress bar */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <span
              className={clsx(
                "text-lg font-medium",
                isDarkMode ? "text-white" : "text-cyan-600"
              )}
              style={{ textShadow: `0 0 10px ${theme.cardBorder}` }}
            >
              Step {currentStep} of {totalSteps}
            </span>
            <span
              className={clsx(
                "text-lg",
                isDarkMode ? "text-cyan-300" : "text-cyan-600"
              )}
              style={{ textShadow: `0 0 10px ${theme.cardBorder}` }}
            >
              {Math.round((currentStep / totalSteps) * 100)}% complete
            </span>
          </div>
          <div
            className={clsx(
              "w-full rounded-full h-4 overflow-hidden",
              isDarkMode ? "bg-gray-800" : "bg-sky-200"
            )}
          >
            <div
              className="h-4 rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${(currentStep / totalSteps) * 100}%`,
                background: "linear-gradient(90deg, #00FFFF, #FF00FF, #FFFF00)",
                boxShadow: "0 0 20px #00FFFF",
              }}
            />
          </div>
        </div>
        {/* Step content */}
        <Card
          className="border-0 bg-black/80 backdrop-blur-xl mb-8"
          style={{
            background: theme.cardBg,
            border: `2px solid ${theme.cardBorder}`,
            boxShadow: theme.cardShadow,
          }}
        >
          <CardContent className="p-12">{renderStep()}</CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            className={clsx(
              "flex items-center gap-3 h-14 px-8 text-lg border-2 disabled:opacity-50",
              isDarkMode
                ? "text-white border-gray-600 bg-black/50! hover:bg-gray-700 hover:border-cyan-400"
                : "text-gray-900 border-gray-300 bg-white hover:bg-gray-100 hover:border-blue-400"
            )}
            style={{
              boxShadow: "0 0 15px rgba(0, 255, 255, 0.3)",
            }}
          >
            {currentStep === 1 ? (
              <>
                <X className="w-5 h-5" />
                Cancel
              </>
            ) : (
              <>
                <ArrowLeft className="w-5 h-5" />
                Back
              </>
            )}
          </Button>
          <div className="flex items-center gap-3">
            {isSkippable(currentStep) && (
              <Button
                variant="outline"
                onClick={handleSkip}
                className={clsx(
                  "h-14 px-6 text-lg border-2",
                  isDarkMode
                    ? "text-white border-gray-600 bg-black/50! hover:bg-gray-700! hover:border-cyan-400"
                    : "text-gray-900 border-gray-300 bg-white hover:bg-gray-100! hover:border-blue-400"
                )}
                style={{ boxShadow: "0 0 15px rgba(0, 255, 255, 0.3)" }}
              >
                Skip
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-3 h-14 px-8 text-lg text-white border-0 transition-all duration-200 disabled:opacity-50"
              style={{
                background: "linear-gradient(45deg, #FF00FF, #00FFFF)",
                boxShadow: "0 0 30px #FF00FF, 0 0 60px #00FFFF",
              }}
            >
              {currentStep === totalSteps ? (
                <>
                  Create Agent
                  <Sparkles className="w-5 h-5" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      <ToastContainer newestOnTop limit={3} />
    </div>
  )
}
