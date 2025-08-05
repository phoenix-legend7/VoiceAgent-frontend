import React from "react"
import clsx from "clsx"

import { useState, useEffect } from "react"
import { Progress } from "../components/ui/progress"
import { Card, CardContent } from "../components/ui/card"
import { Zap, Brain, Cpu, Network, Database, Phone, MessageSquare, Settings, CheckCircle, Sparkles } from "lucide-react"

interface BuildingAnimationProps {
  agentData: any
  onComplete: () => void
}

export default function BuildingAnimation({ agentData, onComplete }: BuildingAnimationProps) {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [matrixChars, setMatrixChars] = useState<string[]>([])
  const [isDark, setIsDark] = useState(true)

  const buildingSteps = [
    { id: 1, title: "Initializing AI Core", icon: Brain, duration: 2000 },
    { id: 2, title: "Training Neural Networks", icon: Network, duration: 2500 },
    { id: 3, title: "Configuring Voice Engine", icon: MessageSquare, duration: 2000 },
    { id: 4, title: "Setting Up Phone Integration", icon: Phone, duration: 1500 },
    { id: 5, title: "Loading Knowledge Base", icon: Database, duration: 2000 },
    { id: 6, title: "Finalizing Agent Configuration", icon: Settings, duration: 2000 },
  ]

  // Check theme from localStorage
  useEffect(() => {
    const theme = localStorage.getItem('theme')
    setIsDark(theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches))
  }, [])

  // Generate matrix characters
  useEffect(() => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()".split("")
    setMatrixChars(chars)
  }, [])

  useEffect(() => {
    const totalDuration = buildingSteps.reduce((sum, step) => sum + step.duration, 0)
    let elapsed = 0

    const interval = setInterval(() => {
      elapsed += 100
      const newProgress = Math.min((elapsed / totalDuration) * 100, 100)
      setProgress(newProgress)

      // Update current step
      let stepElapsed = 0
      for (let i = 0; i < buildingSteps.length; i++) {
        stepElapsed += buildingSteps[i].duration
        if (elapsed <= stepElapsed) {
          setCurrentStep(i)
          break
        }
      }

      if (elapsed >= totalDuration) {
        clearInterval(interval)
        setTimeout(() => {
          onComplete()
        }, 1000)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <div className={clsx(
      "min-h-screen relative overflow-hidden flex items-center justify-center py-6",
      isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
    )}>
      {/* Matrix Rain Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className={clsx(
              "absolute text-xs font-mono animate-matrix-rain",
              isDark ? 'text-green-400 opacity-20' : 'text-blue-500 opacity-15'
            )}
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          >
            {Array.from({ length: 20 }).map((_, j) => (
              <div key={j} className="mb-1">
                {matrixChars[Math.floor(Math.random() * matrixChars.length)]}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Neural Network Visualization */}
      <div className="fixed inset-0 pointer-events-none">
        <svg className={clsx("w-full h-full", isDark ? 'opacity-10' : 'opacity-8')}>
          {Array.from({ length: 20 }).map((_, i) => (
            <g key={i}>
              <circle
                cx={`${20 + (i % 5) * 20}%`}
                cy={`${20 + Math.floor(i / 5) * 20}%`}
                r="2"
                fill={isDark ? "#F26AE1" : "#8B5CF6"}
                className="animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
              {i < 19 && (
                <line
                  x1={`${20 + (i % 5) * 20}%`}
                  y1={`${20 + Math.floor(i / 5) * 20}%`}
                  x2={`${20 + ((i + 1) % 5) * 20}%`}
                  y2={`${20 + Math.floor((i + 1) / 5) * 20}%`}
                  stroke={isDark ? "#A38AFF" : "#C084FC"}
                  strokeWidth="0.5"
                  className="animate-pulse"
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* Holographic Grid */}
      <div className={clsx("fixed inset-0 pointer-events-none", isDark ? 'opacity-5' : 'opacity-3')}>
        <div className="w-full h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 animate-gradient-shift" />
      </div>

      {/* Lightning Bolts */}
      <div className="fixed inset-0 pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute animate-lightning"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          >
            <svg width="100" height="100" className={clsx(isDark ? 'text-cyan-400' : 'text-blue-500')}>
              <path
                d={`M${Math.random() * 50} ${Math.random() * 50} L${Math.random() * 50 + 25} ${Math.random() * 50 + 25} L${Math.random() * 50} ${Math.random() * 50 + 50}`}
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="animate-pulse"
              />
            </svg>
          </div>
        ))}
      </div>

      {/* Floating Particles */}
      <div className="fixed inset-0 pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className={clsx(
              "absolute w-1 h-1 rounded-full animate-float-hologram",
              isDark 
                ? 'bg-gradient-to-r from-cyan-400 to-purple-400' 
                : 'bg-gradient-to-r from-blue-500 to-purple-500'
            )}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${4 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6">
        {/* Main Content */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-r from-[#F26AE1] to-[#A38AFF] rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
            <Brain className="w-12 h-12 text-white animate-spin-slow" />
          </div>
          <h1 className={clsx(
            "text-4xl font-bold mb-4 animate-text-glow",
            isDark ? 'text-white' : 'text-gray-900'
          )}>
            Building Your AI Agent
          </h1>
          <p className={clsx(
            "text-lg",
            isDark ? 'text-gray-300' : 'text-gray-600'
          )}>
            Creating {agentData.name} with advanced AI capabilities...
          </p>
        </div>

        {/* Progress Section */}
        <Card className={clsx(
          "border backdrop-blur-sm mb-8",
          isDark 
            ? 'bg-gray-800/90 border-gray-700' 
            : 'bg-white/90 border-gray-200 shadow-lg'
        )}>
          <CardContent className="p-8">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className={clsx(
                  "font-medium",
                  isDark ? 'text-white' : 'text-gray-900'
                )}>
                  Overall Progress
                </span>
                <span className="text-[#F26AE1] font-bold">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className={clsx(
                "h-3",
                isDark ? 'bg-gray-700' : 'bg-gray-200'
              )} />
            </div>

            {/* Current Step */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-[#F26AE1] to-[#A38AFF] rounded-full flex items-center justify-center animate-glow">
                {React.createElement(buildingSteps[currentStep]?.icon || Brain, {
                  className: "w-6 h-6 text-white",
                })}
              </div>
              <div>
                <h3 className={clsx(
                  "font-semibold text-lg",
                  isDark ? 'text-white' : 'text-gray-900'
                )}>
                  {buildingSteps[currentStep]?.title || "Initializing..."}
                </h3>
                <p className={clsx(isDark ? 'text-gray-400' : 'text-gray-600')}>
                  Processing neural pathways and configurations...
                </p>
              </div>
            </div>

            {/* Step List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {buildingSteps.map((step, index) => {
                const Icon = step.icon
                const isCompleted = index < currentStep
                const isActive = index === currentStep

                return (
                  <div
                    key={step.id}
                    className={clsx(
                      "flex items-center space-x-3 p-3 rounded-lg transition-all border",
                      isActive && [
                        isDark
                          ? "bg-gradient-to-r from-[#F26AE1]/20 to-[#A38AFF]/20 border-[#F26AE1]/30"
                          : "bg-gradient-to-r from-[#F26AE1]/10 to-[#A38AFF]/10 border-[#F26AE1]/40"
                      ],
                      isCompleted && !isActive && [
                        isDark
                          ? "bg-green-500/10 border-green-500/20"
                          : "bg-green-100 border-green-300/50"
                      ],
                      !isCompleted && !isActive && [
                        isDark
                          ? "bg-gray-700/50 border-gray-600"
                          : "bg-gray-50 border-gray-200"
                      ]
                    )}
                  >
                    <div
                      className={clsx(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        isActive && "bg-gradient-to-r from-[#F26AE1] to-[#A38AFF] animate-glow",
                        isCompleted && !isActive && "bg-green-500",
                        !isCompleted && !isActive && [
                          isDark ? "bg-gray-600" : "bg-gray-300"
                        ]
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4 text-white" />
                      ) : (
                        <Icon className={clsx(
                          "w-4 h-4 text-white",
                          isActive && "animate-spin-slow"
                        )} />
                      )}
                    </div>
                    <span
                      className={clsx(
                        "font-medium",
                        isActive && [isDark ? "text-white" : "text-gray-900"],
                        isCompleted && !isActive && "text-green-600",
                        !isCompleted && !isActive && [isDark ? "text-gray-400" : "text-gray-500"]
                      )}
                    >
                      {step.title}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Agent Configuration Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className={clsx(
            "border backdrop-blur-sm",
            isDark 
              ? 'bg-gray-800/90 border-gray-700' 
              : 'bg-white/90 border-gray-200 shadow-lg'
          )}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Cpu className="w-6 h-6 text-[#F26AE1]" />
                <h3 className={clsx(
                  "font-semibold",
                  isDark ? 'text-white' : 'text-gray-900'
                )}>
                  AI Core
                </h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={clsx(isDark ? 'text-gray-400' : 'text-gray-600')}>Neural Layers:</span>
                  <span className={clsx(isDark ? 'text-white' : 'text-gray-900')}>847</span>
                </div>
                <div className="flex justify-between">
                  <span className={clsx(isDark ? 'text-gray-400' : 'text-gray-600')}>Parameters:</span>
                  <span className={clsx(isDark ? 'text-white' : 'text-gray-900')}>2.1B</span>
                </div>
                <div className="flex justify-between">
                  <span className={clsx(isDark ? 'text-gray-400' : 'text-gray-600')}>Training Data:</span>
                  <span className={clsx(isDark ? 'text-white' : 'text-gray-900')}>15.2TB</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={clsx(
            "border backdrop-blur-sm",
            isDark 
              ? 'bg-gray-800/90 border-gray-700' 
              : 'bg-white/90 border-gray-200 shadow-lg'
          )}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <MessageSquare className="w-6 h-6 text-[#A38AFF]" />
                <h3 className={clsx(
                  "font-semibold",
                  isDark ? 'text-white' : 'text-gray-900'
                )}>
                  Voice Engine
                </h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={clsx(isDark ? 'text-gray-400' : 'text-gray-600')}>Voice Model:</span>
                  <span className={clsx(
                    "capitalize",
                    isDark ? 'text-white' : 'text-gray-900'
                  )}>{agentData.voiceType}</span>
                </div>
                <div className="flex justify-between">
                  <span className={clsx(isDark ? 'text-gray-400' : 'text-gray-600')}>Tone:</span>
                  <span className={clsx(
                    "capitalize",
                    isDark ? 'text-white' : 'text-gray-900'
                  )}>{agentData.tone}</span>
                </div>
                <div className="flex justify-between">
                  <span className={clsx(isDark ? 'text-gray-400' : 'text-gray-600')}>Language:</span>
                  <span className={clsx(isDark ? 'text-white' : 'text-gray-900')}>English (US)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={clsx(
            "border backdrop-blur-sm",
            isDark 
              ? 'bg-gray-800/90 border-gray-700' 
              : 'bg-white/90 border-gray-200 shadow-lg'
          )}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Database className="w-6 h-6 text-cyan-400" />
                <h3 className={clsx(
                  "font-semibold",
                  isDark ? 'text-white' : 'text-gray-900'
                )}>
                  Configuration
                </h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={clsx(isDark ? 'text-gray-400' : 'text-gray-600')}>Industry:</span>
                  <span className={clsx(isDark ? 'text-white' : 'text-gray-900')}>{agentData.industry}</span>
                </div>
                <div className="flex justify-between">
                  <span className={clsx(isDark ? 'text-gray-400' : 'text-gray-600')}>Goal:</span>
                  <span className={clsx(isDark ? 'text-white' : 'text-gray-900')}>{agentData.primaryGoal}</span>
                </div>
                <div className="flex justify-between">
                  <span className={clsx(isDark ? 'text-gray-400' : 'text-gray-600')}>Tools:</span>
                  <span className={clsx(isDark ? 'text-white' : 'text-gray-900')}>{agentData.tools.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Metrics */}
        <Card className={clsx(
          "border backdrop-blur-sm",
          isDark 
            ? 'bg-gray-800/90 border-gray-700' 
            : 'bg-white/90 border-gray-200 shadow-lg'
        )}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Zap className="w-6 h-6 text-yellow-400" />
              <h3 className={clsx(
                "font-semibold",
                isDark ? 'text-white' : 'text-gray-900'
              )}>
                System Metrics
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">98.7%</div>
                <div className={clsx(
                  "text-sm",
                  isDark ? 'text-gray-400' : 'text-gray-600'
                )}>Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">1.2s</div>
                <div className={clsx(
                  "text-sm",
                  isDark ? 'text-gray-400' : 'text-gray-600'
                )}>Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400 mb-1">24/7</div>
                <div className={clsx(
                  "text-sm",
                  isDark ? 'text-gray-400' : 'text-gray-600'
                )}>Availability</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400 mb-1">∞</div>
                <div className={clsx(
                  "text-sm",
                  isDark ? 'text-gray-400' : 'text-gray-600'
                )}>Scalability</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Messages */}
        <div className="mt-8 text-center">
          <div className={clsx(
            "flex items-center justify-center space-x-2",
            isDark ? 'text-gray-300' : 'text-gray-700'
          )}>
            <Sparkles className="w-5 h-5 text-[#F26AE1] animate-spin" />
            <span>Optimizing neural pathways for {agentData.industry} industry...</span>
          </div>
        </div>
      </div>
    </div>
  )
}
