"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Bot,
  Volume2,
  Sun,
  Moon,
  Rocket,
  Zap,
  Target,
} from "lucide-react"
import clsx from "clsx"
import { toast, ToastContainer } from "react-toastify"
import { useAuth } from "../core/authProvider"
import { adminAPI } from "../core/adminAPI"

interface OnboardingWizardProps {
  onComplete: () => void
}

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 })
  const [sparkParticles, setSparkParticles] = useState<
    Array<{ id: number; x: number; y: number; size: number; color: string }>
  >([])
  const [electricArcs, setElectricArcs] = useState<
    Array<{ id: number; x1: number; y1: number; x2: number; y2: number }>
  >([])

  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    elevenlabsApiKey: "",
    skipToDashboard: false,
  })

  const totalSteps = 3

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
    const savedTheme = localStorage.getItem("theme")
    if (!!savedTheme && savedTheme === "light") {
      setIsDarkMode(false)
    } else {
      setIsDarkMode(!window.matchMedia("(prefers-color-scheme: dark)").matches)
    }
  }, [])

  useEffect(() => {
    if (currentUser?.api_keys?.elevenlabs) {
      setFormData({
        ...formData,
        elevenlabsApiKey: currentUser.api_keys.elevenlabs,
      })
    }
  }, [currentUser])

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

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleComplete = async () => {
    // Save ElevenLabs API key if provided
    if (formData.elevenlabsApiKey.trim()) {
      try {
        await adminAPI.updateApiKeys({
          elevenlabs: formData.elevenlabsApiKey.trim(),
        })
        toast.success("API key saved successfully!")
      } catch (error) {
        console.error("Failed to save API key:", error)
        // Don't block completion if API key save fails
      }
    }

    if (formData.skipToDashboard) {
      onComplete()
      navigate("/")
    } else {
      onComplete()
      navigate("/wizard")
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const getStepContent = () => {
    const stepConfigs = [
      {
        icon: Rocket,
        title: "Welcome to Millis AI!",
        subtitle: "Step 1 of 3",
        description: "Let's get you started with your AI voice agent platform.",
        gradient: "from-blue-500 to-cyan-600",
        color: "#00FFFF",
      },
      {
        icon: Zap,
        title: "Connect ElevenLabs (Optional)",
        subtitle: "Step 2 of 3",
        description: "Connect your ElevenLabs account for high-quality voice generation. You can skip this and set it up later.",
        gradient: "from-purple-500 to-pink-600",
        color: "#FF00FF",
      },
      {
        icon: Target,
        title: "Ready to Create Your First Agent?",
        subtitle: "Step 3 of 3",
        description: "You're all set! Create your first AI voice agent or explore the dashboard first.",
        gradient: "from-indigo-500 to-purple-600",
        color: "#8A2BE2",
      },
    ]

    return stepConfigs[currentStep - 1]
  }

  // Theme configuration
  const theme = {
    background: isDarkMode
      ? "bg-black"
      : "bg-gradient-to-br from-cyan-50 via-blue-50 to-cyan-50",
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
    iconBg: isDarkMode
      ? "linear-gradient(45deg, #FF00FF, #00FFFF)"
      : "linear-gradient(45deg, #7dd7ff, #0284c7)",
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
    buttonPrimary: isDarkMode
      ? "linear-gradient(45deg, #FF00FF, #00FFFF)"
      : "linear-gradient(45deg, #0ea5e9, #3b82f6)",
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
                style={{
                  textShadow: isDarkMode ? `0 0 20px ${stepConfig.color}` : "none",
                }}
              >
                {stepConfig.title}
              </h2>
              <p
                className={clsx("text-xl", theme.textSecondary)}
                style={{
                  textShadow: isDarkMode ? `0 0 10px ${stepConfig.color}` : "none",
                }}
              >
                {stepConfig.subtitle}
              </p>
              <p className={clsx("max-w-md mx-auto", theme.textTertiary)}>
                {stepConfig.description}
              </p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card
                  className={clsx(
                    "transition-all duration-300",
                    isDarkMode ? "bg-black/50 border-gray-600" : "bg-white/70 border-gray-300"
                  )}
                  style={{
                    boxShadow: isDarkMode
                      ? "0 0 10px rgba(0, 255, 255, 0.3)"
                      : "0 0 10px rgba(14,165,233,0.2)",
                  }}
                >
                  <CardContent className="p-6 text-center">
                    <Bot className={clsx("w-8 h-8 mx-auto mb-3", isDarkMode ? "text-cyan-400" : "text-cyan-600")} />
                    <h3 className={clsx("font-bold text-lg mb-2", theme.textPrimary)}>
                      AI Voice Agents
                    </h3>
                    <p className={clsx("text-sm", theme.textTertiary)}>
                      Create intelligent voice agents that can handle calls, answer questions, and automate workflows.
                    </p>
                  </CardContent>
                </Card>

                <Card
                  className={clsx(
                    "transition-all duration-300",
                    isDarkMode ? "bg-black/50 border-gray-600" : "bg-white/70 border-gray-300"
                  )}
                  style={{
                    boxShadow: isDarkMode
                      ? "0 0 10px rgba(0, 255, 255, 0.3)"
                      : "0 0 10px rgba(14,165,233,0.2)",
                  }}
                >
                  <CardContent className="p-6 text-center">
                    <Volume2 className={clsx("w-8 h-8 mx-auto mb-3", isDarkMode ? "text-purple-400" : "text-purple-600")} />
                    <h3 className={clsx("font-bold text-lg mb-2", theme.textPrimary)}>
                      High-Quality Voices
                    </h3>
                    <p className={clsx("text-sm", theme.textTertiary)}>
                      Use ElevenLabs or our built-in voices for natural, human-like conversations.
                    </p>
                  </CardContent>
                </Card>

                <Card
                  className={clsx(
                    "transition-all duration-300",
                    isDarkMode ? "bg-black/50 border-gray-600" : "bg-white/70 border-gray-300"
                  )}
                  style={{
                    boxShadow: isDarkMode
                      ? "0 0 10px rgba(0, 255, 255, 0.3)"
                      : "0 0 10px rgba(14,165,233,0.2)",
                  }}
                >
                  <CardContent className="p-6 text-center">
                    <Target className={clsx("w-8 h-8 mx-auto mb-3", isDarkMode ? "text-pink-400" : "text-pink-600")} />
                    <h3 className={clsx("font-bold text-lg mb-2", theme.textPrimary)}>
                      Campaigns & Analytics
                    </h3>
                    <p className={clsx("text-sm", theme.textTertiary)}>
                      Launch campaigns, track performance, and optimize your agents.
                    </p>
                  </CardContent>
                </Card>
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
                style={{
                  textShadow: isDarkMode ? `0 0 20px ${stepConfig.color}` : "none",
                }}
              >
                {stepConfig.title}
              </h2>
              <p
                className={clsx("text-xl", theme.textSecondary)}
                style={{
                  textShadow: isDarkMode ? `0 0 10px ${stepConfig.color}` : "none",
                }}
              >
                {stepConfig.subtitle}
              </p>
              <p className={clsx("max-w-md mx-auto", theme.textTertiary)}>
                {stepConfig.description}
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <Label
                  htmlFor="elevenlabsKey"
                  className={clsx("text-lg", theme.textPrimary)}
                  style={{ textShadow: theme.textShadow }}
                >
                  ElevenLabs API Key (Optional)
                </Label>
                <Input
                  id="elevenlabsKey"
                  type="password"
                  placeholder="Enter your ElevenLabs API key (optional)"
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
                <p className={clsx("text-sm", theme.textTertiary)}>
                  You can find your API key in your ElevenLabs account settings. This step is optional - you can set it up later in Settings.
                </p>
              </div>
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
                style={{
                  textShadow: isDarkMode ? `0 0 20px ${stepConfig.color}` : "none",
                }}
              >
                {stepConfig.title}
              </h2>
              <p
                className={clsx("text-xl", theme.textSecondary)}
                style={{
                  textShadow: isDarkMode ? `0 0 10px ${stepConfig.color}` : "none",
                }}
              >
                {stepConfig.subtitle}
              </p>
              <p className={clsx("max-w-md mx-auto", theme.textTertiary)}>
                {stepConfig.description}
              </p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card
                  className={clsx(
                    "cursor-pointer transition-all duration-300",
                    !formData.skipToDashboard
                      ? isDarkMode
                        ? "bg-indigo-500/20 border-indigo-400"
                        : "bg-indigo-100 border-indigo-400"
                      : isDarkMode
                        ? "bg-black/50 border-gray-600 hover:border-indigo-400"
                        : "bg-white/70 border-gray-300 hover:border-indigo-400"
                  )}
                  style={{
                    boxShadow: !formData.skipToDashboard
                      ? isDarkMode
                        ? "0 0 30px #8A2BE2"
                        : "0 0 30px rgba(99,102,241,0.5)"
                      : isDarkMode
                        ? "0 0 10px rgba(138,43,226,0.3)"
                        : "0 0 10px rgba(99,102,241,0.2)",
                  }}
                  onClick={() => updateFormData("skipToDashboard", false)}
                >
                  <CardContent className="p-6 text-center">
                    <Bot className={clsx("w-12 h-12 mx-auto mb-4", isDarkMode ? "text-indigo-400" : "text-indigo-600")} />
                    <h3 className={clsx("font-bold text-xl mb-2", theme.textPrimary)}>
                      Create Your First Agent
                    </h3>
                    <p className={clsx("text-sm", theme.textTertiary)}>
                      Start building your AI voice agent right away with our guided wizard.
                    </p>
                  </CardContent>
                </Card>

                <Card
                  className={clsx(
                    "cursor-pointer transition-all duration-300",
                    formData.skipToDashboard
                      ? isDarkMode
                        ? "bg-indigo-500/20 border-indigo-400"
                        : "bg-indigo-100 border-indigo-400"
                      : isDarkMode
                        ? "bg-black/50 border-gray-600 hover:border-indigo-400"
                        : "bg-white/70 border-gray-300 hover:border-indigo-400"
                  )}
                  style={{
                    boxShadow: formData.skipToDashboard
                      ? isDarkMode
                        ? "0 0 30px #8A2BE2"
                        : "0 0 30px rgba(99,102,241,0.5)"
                      : isDarkMode
                        ? "0 0 10px rgba(138,43,226,0.3)"
                        : "0 0 10px rgba(99,102,241,0.2)",
                  }}
                  onClick={() => updateFormData("skipToDashboard", true)}
                >
                  <CardContent className="p-6 text-center">
                    <Sparkles className={clsx("w-12 h-12 mx-auto mb-4", isDarkMode ? "text-indigo-400" : "text-indigo-600")} />
                    <h3 className={clsx("font-bold text-xl mb-2", theme.textPrimary)}>
                      Explore Dashboard
                    </h3>
                    <p className={clsx("text-sm", theme.textTertiary)}>
                      Take a tour of the platform first. You can create an agent anytime.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div
      className={`min-h-screen ${theme.background} relative overflow-hidden flex items-center justify-center p-4`}
    >
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
              className={clsx("text-lg font-medium", isDarkMode ? "text-white" : "text-cyan-600")}
              style={{ textShadow: `0 0 10px ${theme.cardBorder}` }}
            >
              Step {currentStep} of {totalSteps}
            </span>
            <span
              className={clsx("text-lg", isDarkMode ? "text-cyan-300" : "text-cyan-600")}
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
                background: theme.progressGradient,
                boxShadow: theme.progressShadow,
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
            disabled={currentStep === 1}
            className={clsx(
              "flex items-center gap-3 h-14 px-8 text-lg border-2 disabled:opacity-50",
              isDarkMode
                ? "text-white border-gray-600 bg-black/50! hover:bg-gray-700 hover:border-cyan-400"
                : "text-gray-900 border-gray-300 bg-white! hover:bg-gray-100 hover:border-blue-400"
            )}
            style={{
              boxShadow: "0 0 15px rgba(0, 255, 255, 0.3)",
            }}
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleNext}
              className="flex items-center gap-3 h-14 px-8 text-lg text-white border-0 transition-all duration-200"
              style={{
                background: theme.buttonPrimary,
                boxShadow: theme.buttonShadow,
              }}
            >
              {currentStep === totalSteps ? (
                <>
                  {formData.skipToDashboard ? "Go to Dashboard" : "Create Agent"}
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

