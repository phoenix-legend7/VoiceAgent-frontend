"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { Badge } from "../components/ui/badge"
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Bot,
  MessageSquare,
  Settings,
  Mic,
  Volume2,
  Play,
  Pause,
  Phone,
  Database,
  Sun,
  Moon,
  AlarmClock,
} from "lucide-react"
import clsx from "clsx"
import { countryPhoneOptions } from "../consts/countryPhones"

interface WizardProps {
  onComplete: (agentData: any) => void
}

const voices = [
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

const industries = [
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
]

// const tools = [
//   // Phone & Communication
//   {
//     id: "twilio",
//     name: "Twilio Phone System",
//     description: "Make and receive calls with your own phone numbers",
//     icon: Phone,
//     category: "Phone & SMS",
//     popular: true,
//   },
//   {
//     id: "whatsapp-business",
//     name: "WhatsApp Business",
//     description: "Send messages via WhatsApp Business API",
//     icon: MessageSquare,
//     category: "Phone & SMS",
//   },

//   // CRM & Sales
//   {
//     id: "pipedrive",
//     name: "Pipedrive",
//     description: "Sync leads and deals with your sales pipeline",
//     icon: Target,
//     category: "CRM & Sales",
//     popular: true,
//   },
//   {
//     id: "hubspot",
//     name: "HubSpot CRM",
//     description: "Connect with your HubSpot contacts and deals",
//     icon: Database,
//     category: "CRM & Sales",
//     popular: true,
//   },
//   {
//     id: "salesforce",
//     name: "Salesforce",
//     description: "Integrate with Salesforce CRM data",
//     icon: Database,
//     category: "CRM & Sales",
//   },

//   // Email & Communication
//   {
//     id: "gmail",
//     name: "Gmail Integration",
//     description: "Send follow-up emails automatically",
//     icon: Mail,
//     category: "Email & Communication",
//     popular: true,
//   },
//   {
//     id: "outlook",
//     name: "Microsoft Outlook",
//     description: "Connect with Outlook email and calendar",
//     icon: Mail,
//     category: "Email & Communication",
//   },
//   {
//     id: "mailchimp",
//     name: "Mailchimp",
//     description: "Add contacts to email marketing campaigns",
//     icon: Mail,
//     category: "Email & Communication",
//   },

//   // Calendar & Scheduling
//   {
//     id: "google-calendar",
//     name: "Google Calendar",
//     description: "Schedule appointments automatically",
//     icon: Calendar,
//     category: "Scheduling",
//     popular: true,
//   },
//   {
//     id: "calendly",
//     name: "Calendly",
//     description: "Book meetings through Calendly integration",
//     icon: Calendar,
//     category: "Scheduling",
//     popular: true,
//   },
//   {
//     id: "acuity-scheduling",
//     name: "Acuity Scheduling",
//     description: "Schedule appointments with Acuity",
//     icon: Calendar,
//     category: "Scheduling",
//   },

//   // Automation & Workflows
//   {
//     id: "make",
//     name: "Make.com",
//     description: "Create powerful automation workflows",
//     icon: Workflow,
//     category: "Automation",
//     popular: true,
//   },
//   {
//     id: "zapier",
//     name: "Zapier",
//     description: "Connect 6000+ apps with automation",
//     icon: Workflow,
//     category: "Automation",
//     popular: true,
//   },

//   // Payment Processing
//   {
//     id: "stripe",
//     name: "Stripe Payments",
//     description: "Accept payments during calls",
//     icon: CreditCard,
//     category: "Payments",
//     popular: true,
//   },
//   {
//     id: "paypal",
//     name: "PayPal",
//     description: "Process PayPal payments",
//     icon: CreditCard,
//     category: "Payments",
//   },

//   // E-commerce
//   {
//     id: "shopify",
//     name: "Shopify",
//     description: "Access your Shopify store data",
//     icon: ShoppingCart,
//     category: "E-commerce",
//     popular: true,
//   },
//   {
//     id: "woocommerce",
//     name: "WooCommerce",
//     description: "Connect with your WooCommerce store",
//     icon: ShoppingCart,
//     category: "E-commerce",
//   },

//   // Analytics
//   {
//     id: "google-analytics",
//     name: "Google Analytics",
//     description: "Track website visitor data",
//     icon: BarChart3,
//     category: "Analytics",
//   },
// ]

export default function Wizard({ onComplete }: WizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isPlaying, setIsPlaying] = useState<string | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 })
  const [sparkParticles, setSparkParticles] = useState<
    Array<{ id: number; x: number; y: number; size: number; color: string }>
  >([])
  const [electricArcs, setElectricArcs] = useState<
    Array<{ id: number; x1: number; y1: number; x2: number; y2: number }>
  >([])

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    agentName: "",
    industry: "",
    purpose: "",
    voice: "",
    personality: "",
    phoneNumber: "",
    greeting: "",
    // New fields
    phoneSetup: {
      option: "", // "purchase" or "twilio"
      twilioSid: "",
      twilioSecret: "",
      twilioPhoneNumber: "",
      twilioRegion: "us-west",
      twilioCountry: "US",
      twilioApiKey: "",
    },
    knowledgeBase: {
      files: [] as File[],
    },
  })

  const totalSteps = 7
  const audioRef = useRef<HTMLAudioElement | null>(null);
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

  const playVoiceSample = (voice: any) => {
    if (isPlaying === voice.id) {
      audioRef.current?.pause();
      audioRef.current = null;
      setIsPlaying(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause(); // stop any previous audio
        audioRef.current.src = voice.preview_url;
        audioRef.current.play();
        audioRef.current.onended = () => {
          setIsPlaying(null);
        };
        audioRef.current.onerror = (e: any) => {
          console.error("Error playing audio:", e);
          setIsPlaying(null);
        }
      }
      setIsPlaying(voice.id);
    }
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete({
        ...formData,
        voiceType: formData.voice,
        tone: formData.personality,
        primaryGoal: formData.purpose,
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

  const getStepContent = () => {
    const stepConfigs = [
      {
        icon: Bot,
        title: "Let's create your AI agent",
        subtitle: "First, give your agent a memorable name",
        description: "This will be how customers know your AI assistant. Choose something friendly and professional.",
        gradient: "from-blue-500 to-purple-600",
        color: "#00FFFF",
      },
      {
        icon: Settings,
        title: "What industry are you in?",
        subtitle: "Help us customize your agent's expertise",
        description: "We'll pre-load industry-specific knowledge and conversation patterns.",
        gradient: "from-green-500 to-blue-600",
        color: "#00FF00",
      },
      {
        icon: MessageSquare,
        title: "What's your agent's main purpose?",
        subtitle: "Define your agent's primary mission",
        description: "Be specific about what you want your agent to accomplish in conversations.",
        gradient: "from-purple-500 to-pink-600",
        color: "#FF00FF",
      },
      {
        icon: Mic,
        title: "Choose the perfect voice",
        subtitle: "Your agent's voice sets the tone",
        description: "Listen to samples and pick the voice that matches your brand personality.",
        gradient: "from-orange-500 to-red-600",
        color: "#FFFF00",
      },
      // NEW STEPS
      {
        icon: Phone,
        title: "Set up your phone number",
        subtitle: "Configure calling capabilities",
        description: "Choose how your agent will make and receive calls.",
        gradient: "from-green-500 to-cyan-600",
        color: "#00FF00",
      },
      {
        icon: Database,
        title: "Train your agent",
        subtitle: "Upload knowledge and training data",
        description: "Give your agent the information it needs to help your customers effectively.",
        gradient: "from-purple-500 to-blue-600",
        color: "#8A2BE2",
      },
      {
        icon: Sparkles,
        title: "Final touches",
        subtitle: "Add personality and greeting",
        description: "Make your agent uniquely yours with custom personality traits and greetings.",
        gradient: "from-pink-500 to-purple-600",
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

            <div className="space-y-4">
              <Label
                htmlFor="agentName"
                className={clsx("text-lg", theme.textPrimary)}
                style={{ textShadow: theme.textShadow }}
              >
                Agent Name
              </Label>
              <Input
                id="agentName"
                placeholder="e.g., Sarah, Alex, or CustomerBot"
                value={formData.agentName}
                onChange={(e) => updateFormData("agentName", e.target.value)}
                className={clsx(
                  "text-xl h-14 border-2",
                  theme.inputBg,
                  theme.inputText,
                  theme.inputPlaceholder
                )}
                style={{
                  border: `2px solid ${theme.inputBorder}`,
                  boxShadow: theme.inputShadow,
                }}
              />
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

            <div className="grid grid-cols-2 gap-4">
              {industries.map((industry) => {
                const isSelected = formData.industry === industry.id;

                return (
                  <Card
                    key={industry.id}
                    className={clsx(
                      "cursor-pointer transition-all duration-300 hover:scale-105",
                      isSelected
                        ? isDarkMode
                          ? "bg-green-500/20 border-green-400"
                          : "bg-emerald-100 border-emerald-400"
                        : isDarkMode
                          ? "bg-black/50 border-gray-600 hover:border-green-400"
                          : "bg-white/70 border-gray-300 hover:border-emerald-400"
                    )}
                    style={{
                      boxShadow: isSelected
                        ? isDarkMode
                          ? "0 0 30px #00FF00"
                          : "0 0 30px rgba(16,185,129,0.5)"
                        : isDarkMode
                          ? "0 0 10px rgba(0, 255, 0, 0.3)"
                          : "0 0 10px rgba(16,185,129,0.2)",
                    }}
                    onClick={() => updateFormData("industry", industry.id)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl mb-2">{industry.icon}</div>
                      <h3 className={clsx("font-semibold mb-1", theme.textPrimary)}>
                        {industry.name}
                      </h3>
                      <p className={clsx("text-xs", theme.textTertiary)}>
                        {industry.description}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )

      case 3:
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

            <div className="space-y-4">
              <Label
                htmlFor="purpose"
                className={clsx("text-lg", theme.textPrimary)}
                style={{ textShadow: theme.textShadow }}
              >
                Primary Purpose
              </Label>
              <Textarea
                id="purpose"
                placeholder="e.g., Answer questions about our products, schedule appointments, qualify leads, provide customer support..."
                value={formData.purpose}
                onChange={(e) => updateFormData("purpose", e.target.value)}
                className={clsx(
                  "min-h-[120px] text-lg border-2",
                  theme.inputBg,
                  theme.inputText,
                  theme.inputPlaceholder
                )}
                style={{
                  border: `2px solid ${theme.inputBorder}`,
                  boxShadow: theme.inputShadow,
                }}
              />
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

            <div className="grid gap-4">
              {voices.map((voice) => {
                const isSelected = formData.voice === voice.id;

                return (
                  <Card
                    key={voice.id}
                    className={clsx(
                      "cursor-pointer transition-all duration-300 hover:scale-102",
                      isSelected
                        ? isDarkMode
                          ? "bg-yellow-500/20 border-yellow-400"
                          : "bg-amber-100 border-amber-400"
                        : isDarkMode
                          ? "bg-black/50 border-gray-600 hover:border-yellow-400"
                          : "bg-white/70 border-gray-300 hover:border-amber-400"
                    )}
                    style={{
                      boxShadow: isSelected
                        ? isDarkMode
                          ? "0 0 30px #FFFF00"
                          : "0 0 30px rgba(245,158,11,0.5)"
                        : isDarkMode
                          ? "0 0 10px rgba(255, 255, 0, 0.3)"
                          : "0 0 10px rgba(245,158,11,0.2)",
                    }}
                    onClick={() => updateFormData("voice", voice.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4">
                            <Volume2
                              className={clsx(
                                "w-6 h-6",
                                isDarkMode ? 'text-yellow-400' : 'text-amber-600'
                              )}
                            />
                            <div>
                              <h3 className={clsx("font-bold text-xl", theme.textPrimary)}>
                                {voice.name}
                              </h3>
                              <p className={clsx("mb-1", theme.textTertiary)}>
                                {voice.description}
                              </p>
                              <div className="flex gap-2">
                                <Badge
                                  variant="outline"
                                  className={clsx(
                                    isDarkMode
                                      ? 'border-yellow-400 text-yellow-400'
                                      : 'border-amber-500 text-amber-600'
                                  )}
                                >
                                  {voice.accent}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={clsx(
                                    isDarkMode
                                      ? 'border-purple-400 text-purple-400'
                                      : 'border-violet-500 text-violet-600'
                                  )}
                                >
                                  {voice.personality}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>

                        {!!voice.preview_url && (
                          <Button
                            variant="outline"
                            size="lg"
                            onClick={(e) => {
                              e.stopPropagation()
                              playVoiceSample(voice)
                            }}
                            className={clsx(
                              "ml-4",
                              isDarkMode
                                ? 'border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black'
                                : 'border-amber-500 text-amber-600 hover:bg-amber-500 hover:text-white'
                            )}
                            style={{
                              boxShadow: isDarkMode
                                ? "0 0 15px #FFFF00"
                                : "0 0 15px rgba(245,158,11,0.4)",
                            }}
                          >
                            {isPlaying === voice.id ? (
                              <>
                                <Pause className="w-5 h-5 mr-2" />
                                Playing...
                              </>
                            ) : (
                              <>
                                <Play className="w-5 h-5 mr-2" />
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

            <audio
              ref={audioRef}
              onEnded={() => setIsPlaying(null)}
              className="hidden"
            />
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
                className={clsx(
                  "text-xl",
                  isDarkMode ? "text-green-300" : "text-green-600",
                )}
                style={{ textShadow: "0 0 10px #00FF00" }}
              >
                {stepConfig.subtitle}
              </p>
              <p className={clsx("max-w-md mx-auto", theme.textTertiary)}>
                {stepConfig.description}
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label
                  className={clsx(
                    "block text-lg mb-4 font-medium",
                    isDarkMode ? "text-green-300" : "text-green-600"
                  )}
                >
                  Choose your setup:
                </label>
                <div className="space-y-4">
                  <div
                    className={clsx(
                      "p-6 border-2 rounded-lg cursor-pointer transition-all duration-300",
                      formData.phoneSetup.option === "purchase"
                        ? "border-green-400 bg-green-500/10"
                        : "border-gray-600 hover:border-green-400"
                    )}
                    style={{
                      boxShadow: formData.phoneSetup.option === "purchase" ? "0 0 20px rgba(0, 255, 0, 0.3)" : "none",
                    }}
                    onClick={() => updateFormData("phoneSetup", { ...formData.phoneSetup, option: "purchase" })}
                  >
                    <h3 className={clsx("font-bold text-lg mb-2", theme.textPrimary)}>
                      🚀 Purchase New Number
                    </h3>
                    <p className={theme.textTertiary}>
                      Purchase a new number after setup (~$3/month)
                    </p>
                  </div>
                  <div
                    className={clsx(
                      "p-6 border-2 rounded-lg cursor-pointer transition-all duration-300",
                      formData.phoneSetup.option === "twilio"
                        ? "border-green-400 bg-green-500/10"
                        : "border-gray-600 hover:border-green-400"
                    )}
                    style={{
                      boxShadow: formData.phoneSetup.option === "twilio" ? "0 0 20px rgba(0, 255, 0, 0.3)" : "none",
                    }}
                    onClick={() => updateFormData("phoneSetup", { ...formData.phoneSetup, option: "twilio" })}
                  >
                    <h3 className={clsx("font-bold text-lg mb-2", theme.textPrimary)}>
                      📱 Import from Twilio
                    </h3>
                    <p className={theme.textTertiary}>
                      Connect your existing Twilio account and numbers
                    </p>
                  </div>
                </div>
              </div>

              {formData.phoneSetup.option === "twilio" && (
                <div className="space-y-4">
                  <div>
                    <Label
                      className={clsx(
                        "text-sm mb-2 block",
                        isDarkMode ? "text-green-300" : "text-green-600"
                      )}
                    >
                      Region
                    </Label>
                    <select
                      value={formData.phoneSetup.twilioRegion}
                      onChange={(e) =>
                        updateFormData("phoneSetup", { ...formData.phoneSetup, twilioRegion: e.target.value })
                      }
                      className={clsx(
                        "w-full p-3 rounded-lg",
                        isDarkMode ? "border-green-400" : "border-green-600",
                        theme.inputBg, theme.inputText
                      )}
                      style={{ boxShadow: `0 0 10px rgba(0, 255, 0, ${isDarkMode ? 0.3 : 0.7})` }}
                    >
                      <option value="us-west">US West</option>
                      <option value="us-east">US East</option>
                    </select>
                  </div>
                  <div>
                    <Label
                      className={clsx(
                        "text-sm mb-2 block",
                        isDarkMode ? "text-green-300" : "text-green-600"
                      )}
                    >
                      Country
                    </Label>
                    <select
                      value={formData.phoneSetup.twilioCountry}
                      onChange={(e) =>
                        updateFormData("phoneSetup", { ...formData.phoneSetup, twilioCountry: e.target.value })
                      }
                      className={clsx(
                        "w-full p-3 rounded-lg",
                        isDarkMode ? "border-green-400" : "border-green-600",
                        theme.inputBg, theme.inputText
                      )}
                      style={{ boxShadow: `0 0 10px rgba(0, 255, 0, ${isDarkMode ? 0.3 : 0.7})` }}
                    >
                      {countryPhoneOptions.map((country, index) => (
                        <option key={index} value={country.value}>{country.value}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label
                      className={clsx(
                        "text-sm mb-2 block",
                        isDarkMode ? "text-green-300" : "text-green-600"
                      )}
                    >
                      Phone Number
                    </Label>
                    <Input
                      value={formData.phoneSetup.twilioPhoneNumber}
                      onChange={(e) =>
                        updateFormData("phoneSetup", { ...formData.phoneSetup, twilioPhoneNumber: e.target.value })
                      }
                      placeholder="+12345678990"
                      className={clsx(
                        "border-2",
                        isDarkMode ? "border-green-400" : "border-green-600",
                        theme.inputBg, theme.inputText
                      )}
                      style={{ boxShadow: `0 0 10px rgba(0, 255, 0, ${isDarkMode ? 0.3 : 0.7})` }}
                    />
                  </div>
                  <div>
                    <Label
                      className={clsx(
                        "text-sm mb-2 block",
                        isDarkMode ? "text-green-300" : "text-green-600"
                      )}
                    >
                      Twilio API Key
                    </Label>
                    <Input
                      value={formData.phoneSetup.twilioApiKey}
                      onChange={(e) =>
                        updateFormData("phoneSetup", { ...formData.phoneSetup, twilioApiKey: e.target.value })
                      }
                      className={clsx(
                        "border-2",
                        isDarkMode ? "border-green-400" : "border-green-600",
                        theme.inputBg, theme.inputText
                      )}
                      style={{ boxShadow: `0 0 10px rgba(0, 255, 0, ${isDarkMode ? 0.3 : 0.7})` }}
                    />
                  </div>
                  <div>
                    <Label
                      className={clsx(
                        "text-sm mb-2 block",
                        isDarkMode ? "text-green-300" : "text-green-600"
                      )}
                    >
                      Twilio Account SID
                    </Label>
                    <Input
                      value={formData.phoneSetup.twilioSid}
                      onChange={(e) =>
                        updateFormData("phoneSetup", { ...formData.phoneSetup, twilioSid: e.target.value })
                      }
                      placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className={clsx(
                        "border-2",
                        isDarkMode ? "border-green-400" : "border-green-600",
                        theme.inputBg, theme.inputText
                      )}
                      style={{ boxShadow: `0 0 10px rgba(0, 255, 0, ${isDarkMode ? 0.3 : 0.7})` }}
                    />
                  </div>
                  <div>
                    <Label
                      className={clsx(
                        "text-sm mb-2 block",
                        isDarkMode ? "text-green-300" : "text-green-600"
                      )}
                    >
                      Twilio API Secret
                    </Label>
                    <Input
                      type="password"
                      value={formData.phoneSetup.twilioSecret}
                      onChange={(e) =>
                        updateFormData("phoneSetup", { ...formData.phoneSetup, twilioSecret: e.target.value })
                      }
                      className={clsx(
                        "border-2",
                        isDarkMode ? "border-green-400" : "border-green-600",
                        theme.inputBg, theme.inputText
                      )}
                      style={{ boxShadow: `0 0 10px rgba(0, 255, 0, ${isDarkMode ? 0.3 : 0.7})` }}
                    />
                  </div>
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
                className={clsx(
                  "text-xl",
                  isDarkMode ? "text-purple-300" : "text-purple-600",
                )}
                style={{ textShadow: isDarkMode ? "0 0 10px #8A2BE2" : 'none' }}
              >
                {stepConfig.subtitle}
              </p>
              <p className={clsx("max-w-md mx-auto", theme.textTertiary)}>
                {stepConfig.description}
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <Label
                  className={clsx(
                    "text-lg mb-3 block",
                    isDarkMode ? "text-purple-300" : "text-purple-600"
                  )}
                  style={{ textShadow: isDarkMode ? "0 0 10px #8A2BE2" : "none" }}
                >
                  Upload Training Documents
                </Label>
                <div
                  className="border-2 border-dashed border-purple-400 rounded-lg p-8 text-center hover:border-purple-300 transition-colors cursor-pointer select-none"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ boxShadow: "0 0 20px rgba(138, 43, 226, 0.3)" }}
                >
                  <Database className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <p
                    className={clsx(
                      "font-semibold mb-2",
                      isDarkMode ? "text-white" : "text-purple-600"
                    )}
                  >
                    Drop files here or click to upload
                  </p>
                  <p className={clsx("text-sm", theme.textTertiary)}>
                    PDF, DOC, TXT files up to 10MB each
                  </p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={(e) => {
                      const files = Array.from(e.target.files || [])
                      updateFormData("knowledgeBase", { ...formData.knowledgeBase, files })
                    }}
                  />
                </div>
                {formData.knowledgeBase.files.length > 0 && (
                  <div className="mt-4">
                    <p
                      className={clsx(
                        "text-sm mb-2",
                        isDarkMode ? "text-purple-300" : "text-purple-600"
                      )}
                    >
                      Uploaded files:
                    </p>
                    <div className="space-y-2">
                      {formData.knowledgeBase.files.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-purple-500/10 p-2 rounded border border-purple-400/30"
                        >
                          <span
                            className={clsx(
                              "text-sm",
                              isDarkMode ? "text-white" : "text-purple-500"
                            )}
                          >
                            {file.name}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const newFiles = formData.knowledgeBase.files.filter((_, i) => i !== index)
                              updateFormData("knowledgeBase", { ...formData.knowledgeBase, files: newFiles })
                            }}
                            className="text-red-400 hover:text-red-300"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      case 7:
        // This becomes the final step (personality/greeting)
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
                className={clsx(
                  "text-xl",
                  isDarkMode ? "text-pink-300" : "text-pink-600",
                )}
                style={{ textShadow: isDarkMode ? "0 0 10px #FF0080" : 'none' }}
              >
                {stepConfig.subtitle}
              </p>
              <p className={clsx("max-w-md mx-auto", theme.textTertiary)}>
                {stepConfig.description}
              </p>
            </div>
            <div className="space-y-6">
              <div>
                <Label
                  htmlFor="personality"
                  className={clsx(
                    "text-lg mb-3 block",
                    isDarkMode ? "text-pink-300" : "text-pink-600"
                  )}
                  style={{ textShadow: isDarkMode ? "0 0 10px #FF0080" : "none" }}
                >
                  Personality Traits (optional)
                </Label>
                <Input
                  id="personality"
                  placeholder="e.g., Friendly and helpful, Professional and direct, Warm and empathetic"
                  value={formData.personality}
                  onChange={(e) => updateFormData("personality", e.target.value)}
                  className={clsx(
                    "h-12 text-lg border-2",
                    isDarkMode ? "bg-black/50 text-white placeholder:text-gray-400" : "bg-white/70 text-gray-800 placeholder:text-gray-600"
                  )}
                  style={{
                    border: "2px solid #FF0080",
                    boxShadow: isDarkMode ? "0 0 20px #FF0080, inset 0 0 20px rgba(255, 0, 128, 0.1)" : "none",
                  }}
                />
              </div>
              <div>
                <Label
                  htmlFor="greeting"
                  className={clsx(
                    "text-lg mb-3 block",
                    isDarkMode ? "text-pink-300" : "text-pink-600"
                  )}
                  style={{ textShadow: isDarkMode ? "0 0 10px #FF0080" : "none" }}
                >
                  Custom Greeting (optional)
                </Label>
                <Textarea
                  id="greeting"
                  placeholder="e.g., Hi! I'm here to help you with any questions about our services. How can I assist you today?"
                  value={formData.greeting}
                  onChange={(e) => updateFormData("greeting", e.target.value)}
                  className={clsx(
                    "min-h-[100px] text-lg border-2",
                    isDarkMode ? "bg-black/50 text-white placeholder:text-gray-400" : "bg-white/70 text-gray-800 placeholder:text-gray-600"
                  )}
                  style={{
                    border: "2px solid #FF0080",
                    boxShadow: isDarkMode ? "0 0 20px #FF0080, inset 0 0 20px rgba(255, 0, 128, 0.1)" : "none",
                  }}
                />
              </div>
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
        return formData.agentName.trim() !== ""
      case 2:
        return formData.industry !== ""
      case 3:
        return formData.purpose.trim() !== ""
      case 4:
        return formData.voice !== ""
      case 5:
        if (formData.phoneSetup.option === "purchase") {
          return true
        }
        return (
          formData.phoneSetup.twilioSid &&
          formData.phoneSetup.twilioApiKey &&
          formData.phoneSetup.twilioCountry &&
          formData.phoneSetup.twilioPhoneNumber &&
          formData.phoneSetup.twilioRegion &&
          formData.phoneSetup.twilioSecret
        )
      case 6:
        return true // Knowledge base is optional
      case 7:
        return true // Final touches are optional
      default:
        return false
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
                ? "text-white border-gray-600 bg-black/50 hover:bg-gray-700 hover:border-cyan-400"
                : "text-gray-900 border-gray-300 bg-white hover:bg-gray-100 hover:border-blue-400"
            )}
            style={{
              boxShadow: "0 0 15px rgba(0, 255, 255, 0.3)",
            }}
          >
            {currentStep === 1 ? (
              <>
                <AlarmClock className="w-5 h-5" />
                Not now
              </>
            ): (
              <>
                <ArrowLeft className="w-5 h-5" />
                Back
              </>
            )}
          </Button>
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
  )
}
