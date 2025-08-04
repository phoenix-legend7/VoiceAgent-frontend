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
  Zap,
  Bot,
  MessageSquare,
  Settings,
  Mic,
  Volume2,
  Play,
  Pause,
  Mail,
  Calendar,
  CreditCard,
  BarChart3,
  Target,
  Phone,
  Database,
  Workflow,
  ShoppingCart,
  Clock,
  PhoneCall,
  Plus,
} from "lucide-react"

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

const tools = [
  // Phone & Communication
  {
    id: "twilio",
    name: "Twilio Phone System",
    description: "Make and receive calls with your own phone numbers",
    icon: Phone,
    category: "Phone & SMS",
    popular: true,
  },
  {
    id: "whatsapp-business",
    name: "WhatsApp Business",
    description: "Send messages via WhatsApp Business API",
    icon: MessageSquare,
    category: "Phone & SMS",
  },

  // CRM & Sales
  {
    id: "pipedrive",
    name: "Pipedrive",
    description: "Sync leads and deals with your sales pipeline",
    icon: Target,
    category: "CRM & Sales",
    popular: true,
  },
  {
    id: "hubspot",
    name: "HubSpot CRM",
    description: "Connect with your HubSpot contacts and deals",
    icon: Database,
    category: "CRM & Sales",
    popular: true,
  },
  {
    id: "salesforce",
    name: "Salesforce",
    description: "Integrate with Salesforce CRM data",
    icon: Database,
    category: "CRM & Sales",
  },

  // Email & Communication
  {
    id: "gmail",
    name: "Gmail Integration",
    description: "Send follow-up emails automatically",
    icon: Mail,
    category: "Email & Communication",
    popular: true,
  },
  {
    id: "outlook",
    name: "Microsoft Outlook",
    description: "Connect with Outlook email and calendar",
    icon: Mail,
    category: "Email & Communication",
  },
  {
    id: "mailchimp",
    name: "Mailchimp",
    description: "Add contacts to email marketing campaigns",
    icon: Mail,
    category: "Email & Communication",
  },

  // Calendar & Scheduling
  {
    id: "google-calendar",
    name: "Google Calendar",
    description: "Schedule appointments automatically",
    icon: Calendar,
    category: "Scheduling",
    popular: true,
  },
  {
    id: "calendly",
    name: "Calendly",
    description: "Book meetings through Calendly integration",
    icon: Calendar,
    category: "Scheduling",
    popular: true,
  },
  {
    id: "acuity-scheduling",
    name: "Acuity Scheduling",
    description: "Schedule appointments with Acuity",
    icon: Calendar,
    category: "Scheduling",
  },

  // Automation & Workflows
  {
    id: "make",
    name: "Make.com",
    description: "Create powerful automation workflows",
    icon: Workflow,
    category: "Automation",
    popular: true,
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Connect 6000+ apps with automation",
    icon: Workflow,
    category: "Automation",
    popular: true,
  },

  // Payment Processing
  {
    id: "stripe",
    name: "Stripe Payments",
    description: "Accept payments during calls",
    icon: CreditCard,
    category: "Payments",
    popular: true,
  },
  {
    id: "paypal",
    name: "PayPal",
    description: "Process PayPal payments",
    icon: CreditCard,
    category: "Payments",
  },

  // E-commerce
  {
    id: "shopify",
    name: "Shopify",
    description: "Access your Shopify store data",
    icon: ShoppingCart,
    category: "E-commerce",
    popular: true,
  },
  {
    id: "woocommerce",
    name: "WooCommerce",
    description: "Connect with your WooCommerce store",
    icon: ShoppingCart,
    category: "E-commerce",
  },

  // Analytics
  {
    id: "google-analytics",
    name: "Google Analytics",
    description: "Track website visitor data",
    icon: BarChart3,
    category: "Analytics",
  },
]

export default function Wizard({ onComplete }: WizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isPlaying, setIsPlaying] = useState<string | null>(null)
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 })
  const [sparkParticles, setSparkParticles] = useState<
    Array<{ id: number; x: number; y: number; size: number; color: string }>
  >([])
  const [electricArcs, setElectricArcs] = useState<
    Array<{ id: number; x1: number; y1: number; x2: number; y2: number }>
  >([])

  const [formData, setFormData] = useState({
    agentName: "",
    industry: "",
    purpose: "",
    voice: "",
    personality: "",
    tools: [] as string[],
    phoneNumber: "",
    greeting: "",
    // New fields
    phoneSetup: {
      option: "", // "purchase" or "twilio"
      twilioSid: "",
      twilioToken: "",
      country: "US",
      areaCode: "",
    },
    knowledgeBase: {
      files: [] as File[],
      website: "",
      additionalInfo: "",
    },
    businessHours: {
      timezone: "America/New_York",
      schedule: {
        monday: { enabled: true, start: "09:00", end: "17:00" },
        tuesday: { enabled: true, start: "09:00", end: "17:00" },
        wednesday: { enabled: true, start: "09:00", end: "17:00" },
        thursday: { enabled: true, start: "09:00", end: "17:00" },
        friday: { enabled: true, start: "09:00", end: "17:00" },
        saturday: { enabled: false, start: "09:00", end: "17:00" },
        sunday: { enabled: false, start: "09:00", end: "17:00" },
      },
      fallbackMessage: "I'm currently unavailable. Please leave a message and I'll get back to you soon!",
    },
    callHandling: {
      maxDuration: 15,
      recordCalls: true,
      transferToHuman: false,
      humanPhoneNumber: "",
    },
  })

  const totalSteps = 10
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

  // Generate electric effects
  useEffect(() => {
    if (dimensions.width === 0) return

    const generateSparks = () => {
      const colors = ["#00FFFF", "#FF00FF", "#FFFF00", "#00FF00", "#FF0080"]
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
  }, [dimensions])

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
        selectedTools: formData.tools,
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

  const toggleTool = (toolId: string) => {
    setFormData((prev) => ({
      ...prev,
      tools: prev.tools.includes(toolId) ? prev.tools.filter((t) => t !== toolId) : [...prev.tools, toolId],
    }))
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
      {
        icon: Zap,
        title: "Supercharge with tools",
        subtitle: "Connect powerful integrations",
        description: "Add tools to make your agent more capable and useful for your customers.",
        gradient: "from-cyan-500 to-blue-600",
        color: "#00FFFF",
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
        icon: Clock,
        title: "Set business hours",
        subtitle: "When should your agent be available?",
        description: "Configure your agent's availability and what happens outside business hours.",
        gradient: "from-orange-500 to-yellow-600",
        color: "#FFA500",
      },
      {
        icon: PhoneCall,
        title: "Test your agent",
        subtitle: "Try it out before going live",
        description: "Make a test call to see how your agent performs and make any final adjustments.",
        gradient: "from-green-500 to-teal-600",
        color: "#00FF7F",
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

  const renderStep = () => {
    const stepConfig = getStepContent()

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div
                className={`w-20 h-20 bg-gradient-to-r ${stepConfig.gradient} rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse`}
                style={{
                  boxShadow: `0 0 30px ${stepConfig.color}, 0 0 60px ${stepConfig.color}`,
                }}
              >
                <stepConfig.icon className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white" style={{ textShadow: `0 0 20px ${stepConfig.color}` }}>
                {stepConfig.title}
              </h2>
              <p className="text-xl text-cyan-300" style={{ textShadow: "0 0 10px #00FFFF" }}>
                {stepConfig.subtitle}
              </p>
              <p className="text-gray-300 max-w-md mx-auto">{stepConfig.description}</p>
            </div>
            <div className="space-y-4">
              <Label htmlFor="agentName" className="text-white text-lg" style={{ textShadow: "0 0 10px #00FFFF" }}>
                Agent Name
              </Label>
              <Input
                id="agentName"
                placeholder="e.g., Sarah, Alex, or CustomerBot"
                value={formData.agentName}
                onChange={(e) => updateFormData("agentName", e.target.value)}
                className="text-xl h-14 bg-black/50 text-white placeholder:text-gray-400 border-2"
                style={{
                  border: "2px solid #00FFFF",
                  boxShadow: "0 0 20px #00FFFF, inset 0 0 20px rgba(0, 255, 255, 0.1)",
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
                className={`w-20 h-20 bg-gradient-to-r ${stepConfig.gradient} rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse`}
                style={{
                  boxShadow: `0 0 30px ${stepConfig.color}, 0 0 60px ${stepConfig.color}`,
                }}
              >
                <stepConfig.icon className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white" style={{ textShadow: `0 0 20px ${stepConfig.color}` }}>
                {stepConfig.title}
              </h2>
              <p className="text-xl text-green-300" style={{ textShadow: "0 0 10px #00FF00" }}>
                {stepConfig.subtitle}
              </p>
              <p className="text-gray-300 max-w-md mx-auto">{stepConfig.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {industries.map((industry) => (
                <Card
                  key={industry.id}
                  className={`cursor-pointer transition-all duration-300 hover:scale-105 ${formData.industry === industry.id
                      ? "bg-green-500/20 border-green-400"
                      : "bg-black/50 border-gray-600 hover:border-green-400"
                    }`}
                  style={{
                    boxShadow: formData.industry === industry.id ? "0 0 30px #00FF00" : "0 0 10px rgba(0, 255, 0, 0.3)",
                  }}
                  onClick={() => updateFormData("industry", industry.id)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl mb-2">{industry.icon}</div>
                    <h3 className="font-semibold text-white mb-1">{industry.name}</h3>
                    <p className="text-xs text-gray-300">{industry.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div
                className={`w-20 h-20 bg-gradient-to-r ${stepConfig.gradient} rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse`}
                style={{
                  boxShadow: `0 0 30px ${stepConfig.color}, 0 0 60px ${stepConfig.color}`,
                }}
              >
                <stepConfig.icon className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white" style={{ textShadow: `0 0 20px ${stepConfig.color}` }}>
                {stepConfig.title}
              </h2>
              <p className="text-xl text-pink-300" style={{ textShadow: "0 0 10px #FF00FF" }}>
                {stepConfig.subtitle}
              </p>
              <p className="text-gray-300 max-w-md mx-auto">{stepConfig.description}</p>
            </div>
            <div className="space-y-4">
              <Label htmlFor="purpose" className="text-white text-lg" style={{ textShadow: "0 0 10px #FF00FF" }}>
                Primary Purpose
              </Label>
              <Textarea
                id="purpose"
                placeholder="e.g., Answer questions about our products, schedule appointments, qualify leads, provide customer support..."
                value={formData.purpose}
                onChange={(e) => updateFormData("purpose", e.target.value)}
                className="min-h-[120px] text-lg bg-black/50 text-white placeholder:text-gray-400 border-2"
                style={{
                  border: "2px solid #FF00FF",
                  boxShadow: "0 0 20px #FF00FF, inset 0 0 20px rgba(255, 0, 255, 0.1)",
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
                className={`w-20 h-20 bg-gradient-to-r ${stepConfig.gradient} rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse`}
                style={{
                  boxShadow: `0 0 30px ${stepConfig.color}, 0 0 60px ${stepConfig.color}`,
                }}
              >
                <stepConfig.icon className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white" style={{ textShadow: `0 0 20px ${stepConfig.color}` }}>
                {stepConfig.title}
              </h2>
              <p className="text-xl text-yellow-300" style={{ textShadow: "0 0 10px #FFFF00" }}>
                {stepConfig.subtitle}
              </p>
              <p className="text-gray-300 max-w-md mx-auto">{stepConfig.description}</p>
            </div>
            <div className="grid gap-4">
              {voices.map((voice) => (
                <Card
                  key={voice.id}
                  className={`cursor-pointer transition-all duration-300 hover:scale-102 ${formData.voice === voice.id
                      ? "bg-yellow-500/20 border-yellow-400"
                      : "bg-black/50 border-gray-600 hover:border-yellow-400"
                    }`}
                  style={{
                    boxShadow: formData.voice === voice.id ? "0 0 30px #FFFF00" : "0 0 10px rgba(255, 255, 0, 0.3)",
                  }}
                  onClick={() => updateFormData("voice", voice.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <Volume2 className="w-6 h-6 text-yellow-400" />
                          <div>
                            <h3 className="font-bold text-xl text-white">{voice.name}</h3>
                            <p className="text-gray-300 mb-1">{voice.description}</p>
                            <div className="flex gap-2">
                              <Badge variant="outline" className="border-yellow-400 text-yellow-400">
                                {voice.accent}
                              </Badge>
                              <Badge variant="outline" className="border-purple-400 text-purple-400">
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
                          className="ml-4 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                          style={{
                            boxShadow: "0 0 15px #FFFF00",
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
              ))}
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
                className={`w-20 h-20 bg-gradient-to-r ${stepConfig.gradient} rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse`}
                style={{
                  boxShadow: `0 0 30px ${stepConfig.color}, 0 0 60px ${stepConfig.color}`,
                }}
              >
                <stepConfig.icon className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white" style={{ textShadow: `0 0 20px ${stepConfig.color}` }}>
                {stepConfig.title}
              </h2>
              <p className="text-xl text-cyan-300" style={{ textShadow: "0 0 10px #00FFFF" }}>
                {stepConfig.subtitle}
              </p>
              <p className="text-gray-300 max-w-md mx-auto">{stepConfig.description}</p>
            </div>

            {/* Selection Summary */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-cyan-500/10 rounded-full border border-cyan-400/30">
                <Zap className="w-5 h-5 text-cyan-400" />
                <span className="text-white font-medium">
                  {formData.tools.length} tool{formData.tools.length !== 1 ? "s" : ""} selected
                </span>
                {formData.tools.length > 0 && (
                  <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                    +{formData.tools.length * 25}% more powerful
                  </Badge>
                )}
              </div>
            </div>

            {/* Popular Tools - Enhanced Design */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white" style={{ textShadow: "0 0 15px #FFFF00" }}>
                    ⭐ Most Popular
                  </h3>
                </div>
                <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 px-3 py-1">
                  Recommended for {industries.find((i) => i.id === formData.industry)?.name || "your industry"}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tools
                  .filter((tool) => tool.popular)
                  .map((tool) => {
                    const isSelected = formData.tools.includes(tool.id)
                    return (
                      <Card
                        key={tool.id}
                        className={`cursor-pointer transition-all duration-500 hover:scale-105 group relative overflow-hidden ${isSelected
                            ? "bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20 border-cyan-400 shadow-2xl"
                            : "bg-gradient-to-br from-gray-900/50 to-black/50 border-gray-600 hover:border-cyan-400 hover:shadow-xl"
                          }`}
                        style={{
                          boxShadow: isSelected
                            ? "0 0 40px rgba(0, 255, 255, 0.4), 0 0 80px rgba(0, 255, 255, 0.2)"
                            : "0 0 20px rgba(0, 255, 255, 0.1)",
                          border: isSelected ? "2px solid #00FFFF" : "2px solid #374151",
                        }}
                        onClick={() => toggleTool(tool.id)}
                      >
                        {/* Animated background gradient */}
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* Selection indicator */}
                        {isSelected && (
                          <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full flex items-center justify-center animate-pulse">
                            <Zap className="w-4 h-4 text-white" />
                          </div>
                        )}

                        <CardContent className="p-8 relative z-10">
                          <div className="flex items-start gap-6">
                            {/* Icon with glow effect */}
                            <div
                              className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${isSelected
                                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg"
                                  : "bg-gradient-to-r from-gray-700 to-gray-600 group-hover:from-cyan-500/50 group-hover:to-blue-500/50"
                                }`}
                              style={{
                                boxShadow: isSelected ? "0 0 20px rgba(0, 255, 255, 0.5)" : "none",
                              }}
                            >
                              <tool.icon
                                className={`w-8 h-8 ${isSelected ? "text-white" : "text-gray-300 group-hover:text-white"} transition-colors duration-300`}
                              />
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <h3
                                  className={`font-bold text-xl transition-colors duration-300 ${isSelected ? "text-white" : "text-gray-200 group-hover:text-white"
                                    }}`}
                                >
                                  {tool.name}
                                </h3>
                                <Badge
                                  variant="outline"
                                  className={`text-xs transition-all duration-300 ${isSelected
                                      ? "border-cyan-400 text-cyan-300 bg-cyan-500/10"
                                      : "border-gray-500 text-gray-400 group-hover:border-cyan-400 group-hover:text-cyan-300"
                                    }`}
                                >
                                  {tool.category}
                                </Badge>
                              </div>

                              <p
                                className={`text-sm leading-relaxed mb-4 transition-colors duration-300 ${isSelected ? "text-gray-200" : "text-gray-400 group-hover:text-gray-200"
                                  }`}
                              >
                                {tool.description}
                              </p>

                              {/* Benefits/Features */}
                              <div className="flex flex-wrap gap-2">
                                {tool.id === "twilio" && (
                                  <>
                                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                                      Make Calls
                                    </Badge>
                                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                                      SMS
                                    </Badge>
                                  </>
                                )}
                                {tool.id === "pipedrive" && (
                                  <>
                                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                                      Lead Tracking
                                    </Badge>
                                    <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs">
                                      Sales Pipeline
                                    </Badge>
                                  </>
                                )}
                                {tool.id === "gmail" && (
                                  <>
                                    <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-xs">
                                      Auto Email
                                    </Badge>
                                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs">
                                      Follow-ups
                                    </Badge>
                                  </>
                                )}
                                {tool.id === "google-calendar" && (
                                  <>
                                    <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-xs">
                                      Auto Booking
                                    </Badge>
                                    <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/30 text-xs">
                                      Scheduling
                                    </Badge>
                                  </>
                                )}
                                {tool.id === "stripe" && (
                                  <>
                                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                                      Payments
                                    </Badge>
                                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                                      Secure
                                    </Badge>
                                  </>
                                )}
                                {tool.id === "make" && (
                                  <>
                                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                                      Automation
                                    </Badge>
                                    <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30 text-xs">
                                      Workflows
                                    </Badge>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Selection button */}
                          <div className="mt-6 flex justify-end">
                            <Button
                              size="sm"
                              className={`transition-all duration-300 ${isSelected
                                  ? "bg-gradient-to-r from-green-500 to-cyan-500 text-white border-0 shadow-lg"
                                  : "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30 hover:from-cyan-500 hover:to-blue-500 hover:text-white"
                                }`}
                              style={{
                                boxShadow: isSelected ? "0 0 15px rgba(0, 255, 255, 0.5)" : "none",
                              }}
                            >
                              {isSelected ? (
                                <>
                                  <Zap className="w-4 h-4 mr-2" />
                                  Connected
                                </>
                              ) : (
                                <>
                                  <Plus className="w-4 h-4 mr-2" />
                                  Add Tool
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
              </div>
            </div>

            {/* All Tools by Category - Enhanced */}
            {Object.entries(
              tools
                .filter((tool) => !tool.popular)
                .reduce(
                  (acc, tool) => {
                    if (!acc[tool.category]) acc[tool.category] = []
                    acc[tool.category].push(tool)
                    return acc
                  },
                  {} as Record<string, typeof tools>,
                ),
            ).map(([category, categoryTools]) => (
              <div key={category} className="mb-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                  <h3 className="text-xl font-bold text-white" style={{ textShadow: "0 0 10px #FF00FF" }}>
                    {category}
                  </h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-purple-500/50 to-transparent" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryTools.map((tool) => {
                    const isSelected = formData.tools.includes(tool.id)
                    return (
                      <Card
                        key={tool.id}
                        className={`cursor-pointer transition-all duration-300 hover:scale-105 group ${isSelected
                            ? "bg-gradient-to-br from-cyan-500/15 to-purple-500/15 border-cyan-400"
                            : "bg-gradient-to-br from-gray-900/30 to-black/30 border-gray-600 hover:border-cyan-400"
                          }`}
                        style={{
                          boxShadow: isSelected ? "0 0 25px rgba(0, 255, 255, 0.3)" : "0 0 10px rgba(0, 255, 255, 0.1)",
                        }}
                        onClick={() => toggleTool(tool.id)}
                      >
                        <CardContent className="p-6 relative">
                          {isSelected && (
                            <div className="absolute top-3 right-3 w-6 h-6 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full" />
                            </div>
                          )}

                          <div className="flex items-start gap-4">
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${isSelected
                                  ? "bg-gradient-to-r from-cyan-500 to-blue-500"
                                  : "bg-gradient-to-r from-gray-700 to-gray-600 group-hover:from-cyan-500/50 group-hover:to-blue-500/50"
                                }`}
                            >
                              <tool.icon
                                className={`w-6 h-6 ${isSelected ? "text-white" : "text-gray-300 group-hover:text-white"} transition-colors duration-300`}
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3
                                className={`font-bold text-base mb-1 transition-colors duration-300 ${isSelected ? "text-white" : "text-gray-200 group-hover:text-white"
                                  }`}
                              >
                                {tool.name}
                              </h3>
                              <p
                                className={`text-sm leading-relaxed transition-colors duration-300 ${isSelected ? "text-gray-200" : "text-gray-400 group-hover:text-gray-200"
                                  }`}
                              >
                                {tool.description}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 flex items-center justify-between">
                            <Badge
                              variant="outline"
                              className={`text-xs transition-all duration-300 ${isSelected
                                  ? "border-cyan-400 text-cyan-300 bg-cyan-500/10"
                                  : "border-gray-500 text-gray-400 group-hover:border-cyan-400 group-hover:text-cyan-300"
                                }`}
                            >
                              {tool.category}
                            </Badge>

                            <Button
                              size="sm"
                              variant="ghost"
                              className={`h-8 px-3 text-xs transition-all duration-300 ${isSelected ? "text-green-400 hover:text-green-300" : "text-cyan-400 hover:text-cyan-300"
                                }`}
                            >
                              {isSelected ? "Added" : "Add"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            ))}

            {/* Bottom CTA */}
            <div className="text-center mt-12 p-6 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl border border-cyan-400/30">
              <h4 className="text-white font-bold text-lg mb-2">🚀 Ready to supercharge your agent?</h4>
              <p className="text-gray-300 text-sm mb-4">
                You can always add more tools later from your dashboard. Let's continue building your agent!
              </p>
              <div className="flex items-center justify-center gap-2 text-cyan-300">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm">More integrations coming soon</span>
              </div>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div
                className={`w-20 h-20 bg-gradient-to-r ${stepConfig.gradient} rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse`}
                style={{
                  boxShadow: `0 0 30px ${stepConfig.color}, 0 0 60px ${stepConfig.color}`,
                }}
              >
                <stepConfig.icon className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white" style={{ textShadow: `0 0 20px ${stepConfig.color}` }}>
                {stepConfig.title}
              </h2>
              <p className="text-xl text-green-300" style={{ textShadow: "0 0 10px #00FF00" }}>
                {stepConfig.subtitle}
              </p>
              <p className="text-gray-300 max-w-md mx-auto">{stepConfig.description}</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-green-300 text-lg mb-4 font-medium">Choose your setup:</label>
                <div className="space-y-4">
                  <div
                    className={`p-6 border-2 rounded-lg cursor-pointer transition-all duration-300 ${formData.phoneSetup.option === "purchase"
                        ? "border-green-400 bg-green-500/10"
                        : "border-gray-600 hover:border-green-400"
                      }`}
                    style={{
                      boxShadow: formData.phoneSetup.option === "purchase" ? "0 0 20px rgba(0, 255, 0, 0.3)" : "none",
                    }}
                    onClick={() => updateFormData("phoneSetup", { ...formData.phoneSetup, option: "purchase" })}
                  >
                    <h3 className="text-white font-bold text-lg mb-2">🚀 Purchase New Number</h3>
                    <p className="text-gray-300">Get a new number instantly via Twilio integration (~$1/month)</p>
                  </div>
                  <div
                    className={`p-6 border-2 rounded-lg cursor-pointer transition-all duration-300 ${formData.phoneSetup.option === "twilio"
                        ? "border-green-400 bg-green-500/10"
                        : "border-gray-600 hover:border-green-400"
                      }`}
                    style={{
                      boxShadow: formData.phoneSetup.option === "twilio" ? "0 0 20px rgba(0, 255, 0, 0.3)" : "none",
                    }}
                    onClick={() => updateFormData("phoneSetup", { ...formData.phoneSetup, option: "twilio" })}
                  >
                    <h3 className="text-white font-bold text-lg mb-2">📱 Import from Twilio</h3>
                    <p className="text-gray-300">Connect your existing Twilio account and numbers</p>
                  </div>
                </div>
              </div>

              {formData.phoneSetup.option === "purchase" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-green-300 text-sm mb-2 block">Country</Label>
                      <select
                        value={formData.phoneSetup.country}
                        onChange={(e) =>
                          updateFormData("phoneSetup", { ...formData.phoneSetup, country: e.target.value })
                        }
                        className="w-full p-3 bg-black/50 border-2 border-green-400 text-white rounded-lg"
                        style={{ boxShadow: "0 0 10px rgba(0, 255, 0, 0.3)" }}
                      >
                        <option value="US">🇺🇸 United States</option>
                        <option value="AU">🇦🇺 Australia</option>
                        <option value="UK">🇬🇧 United Kingdom</option>
                        <option value="CA">🇨🇦 Canada</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-green-300 text-sm mb-2 block">Area Code (Optional)</Label>
                      <Input
                        value={formData.phoneSetup.areaCode}
                        onChange={(e) =>
                          updateFormData("phoneSetup", { ...formData.phoneSetup, areaCode: e.target.value })
                        }
                        placeholder="e.g., 212, 415"
                        className="bg-black/50 border-2 border-green-400 text-white"
                        style={{ boxShadow: "0 0 10px rgba(0, 255, 0, 0.3)" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {formData.phoneSetup.option === "twilio" && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-green-300 text-sm mb-2 block">Twilio Account SID</Label>
                    <Input
                      value={formData.phoneSetup.twilioSid}
                      onChange={(e) =>
                        updateFormData("phoneSetup", { ...formData.phoneSetup, twilioSid: e.target.value })
                      }
                      placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="bg-black/50 border-2 border-green-400 text-white"
                      style={{ boxShadow: "0 0 10px rgba(0, 255, 0, 0.3)" }}
                    />
                  </div>
                  <div>
                    <Label className="text-green-300 text-sm mb-2 block">Twilio Auth Token</Label>
                    <Input
                      type="password"
                      value={formData.phoneSetup.twilioToken}
                      onChange={(e) =>
                        updateFormData("phoneSetup", { ...formData.phoneSetup, twilioToken: e.target.value })
                      }
                      placeholder="Your Twilio Auth Token"
                      className="bg-black/50 border-2 border-green-400 text-white"
                      style={{ boxShadow: "0 0 10px rgba(0, 255, 0, 0.3)" }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div
                className={`w-20 h-20 bg-gradient-to-r ${stepConfig.gradient} rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse`}
                style={{
                  boxShadow: `0 0 30px ${stepConfig.color}, 0 0 60px ${stepConfig.color}`,
                }}
              >
                <stepConfig.icon className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white" style={{ textShadow: `0 0 20px ${stepConfig.color}` }}>
                {stepConfig.title}
              </h2>
              <p className="text-xl text-purple-300" style={{ textShadow: "0 0 10px #8A2BE2" }}>
                {stepConfig.subtitle}
              </p>
              <p className="text-gray-300 max-w-md mx-auto">{stepConfig.description}</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-purple-300 text-lg mb-3 block" style={{ textShadow: "0 0 10px #8A2BE2" }}>
                  Upload Training Documents
                </Label>
                <div
                  className="border-2 border-dashed border-purple-400 rounded-lg p-8 text-center hover:border-purple-300 transition-colors cursor-pointer"
                  style={{ boxShadow: "0 0 20px rgba(138, 43, 226, 0.3)" }}
                >
                  <Database className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <p className="text-white font-semibold mb-2">Drop files here or click to upload</p>
                  <p className="text-gray-300 text-sm">PDF, DOC, TXT files up to 10MB each</p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt"
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || [])
                      updateFormData("knowledgeBase", { ...formData.knowledgeBase, files })
                    }}
                  />
                </div>
                {formData.knowledgeBase.files.length > 0 && (
                  <div className="mt-4">
                    <p className="text-purple-300 text-sm mb-2">Uploaded files:</p>
                    <div className="space-y-2">
                      {formData.knowledgeBase.files.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-purple-500/10 p-2 rounded border border-purple-400/30"
                        >
                          <span className="text-white text-sm">{file.name}</span>
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

              <div>
                <Label className="text-purple-300 text-lg mb-3 block" style={{ textShadow: "0 0 10px #8A2BE2" }}>
                  Website to Scrape (Optional)
                </Label>
                <Input
                  value={formData.knowledgeBase.website}
                  onChange={(e) =>
                    updateFormData("knowledgeBase", { ...formData.knowledgeBase, website: e.target.value })
                  }
                  placeholder="https://yourwebsite.com"
                  className="bg-black/50 border-2 border-purple-400 text-white"
                  style={{ boxShadow: "0 0 10px rgba(138, 43, 226, 0.3)" }}
                />
                <p className="text-gray-400 text-sm mt-2">We'll automatically extract information from your website</p>
              </div>

              <div>
                <Label className="text-purple-300 text-lg mb-3 block" style={{ textShadow: "0 0 10px #8A2BE2" }}>
                  Additional Information
                </Label>
                <Textarea
                  value={formData.knowledgeBase.additionalInfo}
                  onChange={(e) =>
                    updateFormData("knowledgeBase", { ...formData.knowledgeBase, additionalInfo: e.target.value })
                  }
                  placeholder="Any specific information, policies, or instructions you want your agent to know..."
                  className="min-h-[120px] bg-black/50 border-2 border-purple-400 text-white"
                  style={{ boxShadow: "0 0 10px rgba(138, 43, 226, 0.3)" }}
                />
              </div>
            </div>
          </div>
        )

      case 8:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div
                className={`w-20 h-20 bg-gradient-to-r ${stepConfig.gradient} rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse`}
                style={{
                  boxShadow: `0 0 30px ${stepConfig.color}, 0 0 60px ${stepConfig.color}`,
                }}
              >
                <stepConfig.icon className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white" style={{ textShadow: `0 0 20px ${stepConfig.color}` }}>
                {stepConfig.title}
              </h2>
              <p className="text-xl text-orange-300" style={{ textShadow: "0 0 10px #FFA500" }}>
                {stepConfig.subtitle}
              </p>
              <p className="text-gray-300 max-w-md mx-auto">{stepConfig.description}</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-orange-300 text-lg mb-3 block" style={{ textShadow: "0 0 10px #FFA500" }}>
                  Timezone
                </Label>
                <select
                  value={formData.businessHours.timezone}
                  onChange={(e) =>
                    updateFormData("businessHours", { ...formData.businessHours, timezone: e.target.value })
                  }
                  className="w-full p-3 bg-black/50 border-2 border-orange-400 text-white rounded-lg"
                  style={{ boxShadow: "0 0 10px rgba(255, 165, 0, 0.3)" }}
                >
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Australia/Sydney">Sydney (AEST)</option>
                </select>
              </div>

              <div>
                <Label className="text-orange-300 text-lg mb-4 block" style={{ textShadow: "0 0 10px #FFA500" }}>
                  Weekly Schedule
                </Label>
                <div className="space-y-3">
                  {Object.entries(formData.businessHours.schedule).map(([day, schedule]) => (
                    <div
                      key={day}
                      className="flex items-center space-x-4 p-4 bg-orange-500/10 rounded-lg border border-orange-400/30"
                    >
                      <div className="w-20">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={schedule.enabled}
                            onChange={(e) => {
                              const newSchedule = {
                                ...formData.businessHours.schedule,
                                [day]: { ...schedule, enabled: e.target.checked },
                              }
                              updateFormData("businessHours", { ...formData.businessHours, schedule: newSchedule })
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-white capitalize font-medium">{day}</span>
                        </label>
                      </div>
                      {schedule.enabled && (
                        <div className="flex items-center space-x-2">
                          <input
                            type="time"
                            value={schedule.start}
                            onChange={(e) => {
                              const newSchedule = {
                                ...formData.businessHours.schedule,
                                [day]: { ...schedule, start: e.target.value },
                              }
                              updateFormData("businessHours", { ...formData.businessHours, schedule: newSchedule })
                            }}
                            className="p-2 bg-black/50 border border-orange-400 text-white rounded"
                          />
                          <span className="text-orange-300">to</span>
                          <input
                            type="time"
                            value={schedule.end}
                            onChange={(e) => {
                              const newSchedule = {
                                ...formData.businessHours.schedule,
                                [day]: { ...schedule, end: e.target.value },
                              }
                              updateFormData("businessHours", { ...formData.businessHours, schedule: newSchedule })
                            }}
                            className="p-2 bg-black/50 border border-orange-400 text-white rounded"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-orange-300 text-lg mb-3 block" style={{ textShadow: "0 0 10px #FFA500" }}>
                  After Hours Message
                </Label>
                <Textarea
                  value={formData.businessHours.fallbackMessage}
                  onChange={(e) =>
                    updateFormData("businessHours", { ...formData.businessHours, fallbackMessage: e.target.value })
                  }
                  placeholder="What should your agent say when called outside business hours?"
                  className="min-h-[100px] bg-black/50 border-2 border-orange-400 text-white"
                  style={{ boxShadow: "0 0 10px rgba(255, 165, 0, 0.3)" }}
                />
              </div>
            </div>
          </div>
        )

      case 9:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div
                className={`w-20 h-20 bg-gradient-to-r ${stepConfig.gradient} rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse`}
                style={{
                  boxShadow: `0 0 30px ${stepConfig.color}, 0 0 60px ${stepConfig.color}`,
                }}
              >
                <stepConfig.icon className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white" style={{ textShadow: `0 0 20px ${stepConfig.color}` }}>
                {stepConfig.title}
              </h2>
              <p className="text-xl text-green-300" style={{ textShadow: "0 0 10px #00FF7F" }}>
                {stepConfig.subtitle}
              </p>
              <p className="text-gray-300 max-w-md mx-auto">{stepConfig.description}</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-green-300 text-lg mb-3 block" style={{ textShadow: "0 0 10px #00FF7F" }}>
                    Max Call Duration (minutes)
                  </Label>
                  <Input
                    type="number"
                    value={formData.callHandling.maxDuration}
                    onChange={(e) =>
                      updateFormData("callHandling", {
                        ...formData.callHandling,
                        maxDuration: Number.parseInt(e.target.value),
                      })
                    }
                    className="bg-black/50 border-2 border-green-400 text-white"
                    style={{ boxShadow: "0 0 10px rgba(0, 255, 127, 0.3)" }}
                  />
                </div>
                <div>
                  <Label className="text-green-300 text-lg mb-3 block" style={{ textShadow: "0 0 10px #00FF7F" }}>
                    Record Calls
                  </Label>
                  <div className="flex items-center space-x-3 mt-3">
                    <input
                      type="checkbox"
                      checked={formData.callHandling.recordCalls}
                      onChange={(e) =>
                        updateFormData("callHandling", { ...formData.callHandling, recordCalls: e.target.checked })
                      }
                      className="w-5 h-5"
                    />
                    <span className="text-white">Enable call recording</span>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-green-300 text-lg mb-3 block" style={{ textShadow: "0 0 10px #00FF7F" }}>
                  Human Handoff
                </Label>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.callHandling.transferToHuman}
                      onChange={(e) =>
                        updateFormData("callHandling", { ...formData.callHandling, transferToHuman: e.target.checked })
                      }
                      className="w-5 h-5"
                    />
                    <span className="text-white">Enable transfer to human agent</span>
                  </div>
                  {formData.callHandling.transferToHuman && (
                    <Input
                      value={formData.callHandling.humanPhoneNumber}
                      onChange={(e) =>
                        updateFormData("callHandling", { ...formData.callHandling, humanPhoneNumber: e.target.value })
                      }
                      placeholder="Human agent phone number"
                      className="bg-black/50 border-2 border-green-400 text-white"
                      style={{ boxShadow: "0 0 10px rgba(0, 255, 127, 0.3)" }}
                    />
                  )}
                </div>
              </div>

              {/* Test Call Section */}
              <div
                className="mt-8 p-6 bg-green-500/10 rounded-lg border-2 border-green-400"
                style={{ boxShadow: "0 0 20px rgba(0, 255, 127, 0.3)" }}
              >
                <h3 className="text-white font-bold text-xl mb-4">🎯 Ready to Test?</h3>
                <p className="text-gray-300 mb-4">
                  Your agent is configured! Click below to make a test call and see how it performs.
                </p>
                <Button
                  className="w-full text-white font-bold text-lg py-4"
                  style={{
                    background: "linear-gradient(45deg, #00FF7F, #00FFFF)",
                    boxShadow: "0 0 30px rgba(0, 255, 127, 0.5)",
                    border: "2px solid #00FF7F",
                  }}
                  onClick={() => {
                    // Simulate test call
                    alert("📞 Initiating test call... Your agent will call you in 10 seconds!")
                  }}
                >
                  <PhoneCall className="w-6 h-6 mr-3" />
                  Make Test Call
                </Button>
              </div>
            </div>
          </div>
        )

      case 10:
        // This becomes the final step (personality/greeting)
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div
                className={`w-20 h-20 bg-gradient-to-r ${stepConfig.gradient} rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse`}
                style={{
                  boxShadow: `0 0 30px ${stepConfig.color}, 0 0 60px ${stepConfig.color}`,
                }}
              >
                <stepConfig.icon className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white" style={{ textShadow: `0 0 20px ${stepConfig.color}` }}>
                {stepConfig.title}
              </h2>
              <p className="text-xl text-pink-300" style={{ textShadow: "0 0 10px #FF0080" }}>
                {stepConfig.subtitle}
              </p>
              <p className="text-gray-300 max-w-md mx-auto">{stepConfig.description}</p>
            </div>
            <div className="space-y-6">
              <div>
                <Label
                  htmlFor="personality"
                  className="text-white text-lg mb-3 block"
                  style={{ textShadow: "0 0 10px #FF0080" }}
                >
                  Personality Traits (optional)
                </Label>
                <Input
                  id="personality"
                  placeholder="e.g., Friendly and helpful, Professional and direct, Warm and empathetic"
                  value={formData.personality}
                  onChange={(e) => updateFormData("personality", e.target.value)}
                  className="h-12 text-lg bg-black/50 text-white placeholder:text-gray-400 border-2"
                  style={{
                    border: "2px solid #FF0080",
                    boxShadow: "0 0 20px #FF0080, inset 0 0 20px rgba(255, 0, 128, 0.1)",
                  }}
                />
              </div>
              <div>
                <Label
                  htmlFor="greeting"
                  className="text-white text-lg mb-3 block"
                  style={{ textShadow: "0 0 10px #FF0080" }}
                >
                  Custom Greeting (optional)
                </Label>
                <Textarea
                  id="greeting"
                  placeholder="e.g., Hi! I'm here to help you with any questions about our services. How can I assist you today?"
                  value={formData.greeting}
                  onChange={(e) => updateFormData("greeting", e.target.value)}
                  className="min-h-[100px] text-lg bg-black/50 text-white placeholder:text-gray-400 border-2"
                  style={{
                    border: "2px solid #FF0080",
                    boxShadow: "0 0 20px #FF0080, inset 0 0 20px rgba(255, 0, 128, 0.1)",
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
        return true // Tools are optional
      case 6:
        return (
          formData.phoneSetup.option !== "" &&
          (formData.phoneSetup.option !== "twilio" ||
            (formData.phoneSetup.twilioSid && formData.phoneSetup.twilioToken))
        )
      case 7:
        return true // Knowledge base is optional
      case 8:
        return true // Business hours have defaults
      case 9:
        return true // Call handling has defaults
      case 10:
        return true // Final touches are optional
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center p-4">
      {/* Electric Effects Background */}
      <svg className="absolute inset-0 pointer-events-none z-0" width="100%" height="100%">
        {electricArcs.map((arc) => (
          <line
            key={arc.id}
            x1={arc.x1}
            y1={arc.y1}
            x2={arc.x2}
            y2={arc.y2}
            stroke="#00FFFF"
            strokeWidth="2"
            opacity="0.4"
            className="animate-pulse"
            style={{
              filter: "drop-shadow(0 0 10px #00FFFF)",
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
              linear-gradient(rgba(0,255,255,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,255,255,0.3) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="w-full max-w-4xl relative z-10">
        {/* Progress bar */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-medium text-white" style={{ textShadow: "0 0 10px #00FFFF" }}>
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-lg text-cyan-300" style={{ textShadow: "0 0 10px #00FFFF" }}>
              {Math.round((currentStep / totalSteps) * 100)}% complete
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden">
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
            border: "2px solid #00FFFF",
            boxShadow: "0 0 40px #00FFFF, inset 0 0 40px rgba(0, 255, 255, 0.1)",
          }}
        >
          <CardContent className="p-12">{renderStep()}</CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex items-center gap-3 h-14 px-8 text-lg bg-black/50 border-2 border-gray-600 text-white hover:border-cyan-400 disabled:opacity-50"
            style={{
              boxShadow: "0 0 15px rgba(0, 255, 255, 0.3)",
            }}
          >
            <ArrowLeft className="w-5 h-5" />
            Back
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
