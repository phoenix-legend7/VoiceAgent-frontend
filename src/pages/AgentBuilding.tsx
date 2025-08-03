"use client"

import React from "react"

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

  const buildingSteps = [
    { id: 1, title: "Initializing AI Core", icon: Brain, duration: 2000 },
    { id: 2, title: "Training Neural Networks", icon: Network, duration: 2500 },
    { id: 3, title: "Configuring Voice Engine", icon: MessageSquare, duration: 2000 },
    { id: 4, title: "Setting Up Phone Integration", icon: Phone, duration: 1500 },
    { id: 5, title: "Loading Knowledge Base", icon: Database, duration: 2000 },
    { id: 6, title: "Finalizing Agent Configuration", icon: Settings, duration: 2000 },
  ]

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
    <div className="min-h-screen bg-gray-900 relative overflow-hidden flex items-center justify-center">
      {/* Matrix Rain Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-green-400 text-xs font-mono opacity-20 animate-matrix-rain"
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
        <svg className="w-full h-full opacity-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <g key={i}>
              <circle
                cx={`${20 + (i % 5) * 20}%`}
                cy={`${20 + Math.floor(i / 5) * 20}%`}
                r="2"
                fill="#F26AE1"
                className="animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
              {i < 19 && (
                <line
                  x1={`${20 + (i % 5) * 20}%`}
                  y1={`${20 + Math.floor(i / 5) * 20}%`}
                  x2={`${20 + ((i + 1) % 5) * 20}%`}
                  y2={`${20 + Math.floor((i + 1) / 5) * 20}%`}
                  stroke="#A38AFF"
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
      <div className="fixed inset-0 pointer-events-none opacity-5">
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
            <svg width="100" height="100" className="text-cyan-400">
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
            className="absolute w-1 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full animate-float-hologram"
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
          <h1 className="text-4xl font-bold text-white mb-4 animate-text-glow">Building Your AI Agent</h1>
          <p className="text-gray-300 text-lg">Creating {agentData.name} with advanced AI capabilities...</p>
        </div>

        {/* Progress Section */}
        <Card className="bg-gray-800/90 border-gray-700 backdrop-blur-sm mb-8">
          <CardContent className="p-8">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white font-medium">Overall Progress</span>
                <span className="text-[#F26AE1] font-bold">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-3 bg-gray-700" />
            </div>

            {/* Current Step */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-[#F26AE1] to-[#A38AFF] rounded-full flex items-center justify-center animate-glow">
                {React.createElement(buildingSteps[currentStep]?.icon || Brain, {
                  className: "w-6 h-6 text-white",
                })}
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">
                  {buildingSteps[currentStep]?.title || "Initializing..."}
                </h3>
                <p className="text-gray-400">Processing neural pathways and configurations...</p>
              </div>
            </div>

            {/* Step List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {buildingSteps.map((step, index) => {
                const Icon = step.icon
                const isCompleted = index < currentStep
                const isActive = index === currentStep
                // const isUpcoming = index > currentStep

                return (
                  <div
                    key={step.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-[#F26AE1]/20 to-[#A38AFF]/20 border border-[#F26AE1]/30"
                        : isCompleted
                          ? "bg-green-500/10 border border-green-500/20"
                          : "bg-gray-700/50 border border-gray-600"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isActive
                          ? "bg-gradient-to-r from-[#F26AE1] to-[#A38AFF] animate-glow"
                          : isCompleted
                            ? "bg-green-500"
                            : "bg-gray-600"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4 text-white" />
                      ) : (
                        <Icon className={`w-4 h-4 text-white ${isActive ? "animate-spin-slow" : ""}`} />
                      )}
                    </div>
                    <span
                      className={`font-medium ${
                        isActive ? "text-white" : isCompleted ? "text-green-400" : "text-gray-400"
                      }`}
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
          <Card className="bg-gray-800/90 border-gray-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Cpu className="w-6 h-6 text-[#F26AE1]" />
                <h3 className="text-white font-semibold">AI Core</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Neural Layers:</span>
                  <span className="text-white">847</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Parameters:</span>
                  <span className="text-white">2.1B</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Training Data:</span>
                  <span className="text-white">15.2TB</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/90 border-gray-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <MessageSquare className="w-6 h-6 text-[#A38AFF]" />
                <h3 className="text-white font-semibold">Voice Engine</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Voice Model:</span>
                  <span className="text-white capitalize">{agentData.voiceType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tone:</span>
                  <span className="text-white capitalize">{agentData.tone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Language:</span>
                  <span className="text-white">English (US)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/90 border-gray-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Database className="w-6 h-6 text-cyan-400" />
                <h3 className="text-white font-semibold">Configuration</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Industry:</span>
                  <span className="text-white">{agentData.industry}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Goal:</span>
                  <span className="text-white">{agentData.primaryGoal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tools:</span>
                  <span className="text-white">{agentData.tools.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Metrics */}
        <Card className="bg-gray-800/90 border-gray-700 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Zap className="w-6 h-6 text-yellow-400" />
              <h3 className="text-white font-semibold">System Metrics</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">98.7%</div>
                <div className="text-gray-400 text-sm">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">1.2s</div>
                <div className="text-gray-400 text-sm">Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400 mb-1">24/7</div>
                <div className="text-gray-400 text-sm">Availability</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400 mb-1">∞</div>
                <div className="text-gray-400 text-sm">Scalability</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Messages */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center space-x-2 text-gray-300">
            <Sparkles className="w-5 h-5 text-[#F26AE1] animate-spin" />
            <span>Optimizing neural pathways for {agentData.industry} industry...</span>
          </div>
        </div>
      </div>
    </div>
  )
}
