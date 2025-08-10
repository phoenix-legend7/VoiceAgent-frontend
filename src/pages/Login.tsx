import { useState, useEffect } from "react"
import { toast, ToastContainer } from "react-toastify"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Separator } from "../components/ui/separator"
import { Zap, Mail, Lock, Sparkles, Sun, Moon } from "lucide-react"
import axiosInstance from "../core/axiosInstance"

export default function LoginScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 })
  const [electricArcs, setElectricArcs] = useState<
    Array<{ id: number; x1: number; y1: number; x2: number; y2: number; intensity: number }>
  >([])
  const [sparkParticles, setSparkParticles] = useState<
    Array<{ id: number; x: number; y: number; size: number; color: string; velocity: { x: number; y: number } }>
  >([])
  const [matrixRain, setMatrixRain] = useState<
    Array<{ id: number; x: number; y: number; char: string; speed: number; opacity: number }>
  >([])

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
    if (!!savedTheme && savedTheme === "dark") {
      setIsDarkMode(true)
    } else {
      setIsDarkMode(false)
    }
  }, [])

  // Generate matrix characters
  const generateMatrixChar = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?"
    return chars[Math.floor(Math.random() * chars.length)]
  }

  // Generate electric arc path
  const generateElectricArc = (x1: number, y1: number, x2: number, y2: number) => {
    const segments = 6
    const points = []
    const dx = (x2 - x1) / segments
    const dy = (y2 - y1) / segments

    for (let i = 0; i <= segments; i++) {
      const x = x1 + dx * i + (Math.random() - 0.5) * 20
      const y = y1 + dy * i + (Math.random() - 0.5) * 20
      points.push(`${x},${y}`)
    }

    return points.join(" ")
  }

  useEffect(() => {
    if (dimensions.width === 0) return

    // Generate electric arcs (reduced to 8)
    const generateArcs = () => {
      const newArcs = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        x1: Math.random() * dimensions.width,
        y1: Math.random() * dimensions.height * 0.3,
        x2: Math.random() * dimensions.width,
        y2: Math.random() * dimensions.height * 0.7 + dimensions.height * 0.3,
        intensity: Math.random() * 0.8 + 0.3,
      }))
      setElectricArcs(newArcs)
    }

    // Generate spark particles (reduced to 30)
    const generateSparks = () => {
      const darkColors = ["#00FFFF", "#FF00FF", "#FFFF00", "#00FF00", "#FF0080", "#8000FF"]
      const lightColors = ["#87CEEB", "#4FC3F7", "#29B6F6", "#03A9F4", "#0288D1", "#0277BD"]
      const colors = isDarkMode ? darkColors : lightColors

      const newSparks = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        size: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        velocity: {
          x: (Math.random() - 0.5) * 3,
          y: (Math.random() - 0.5) * 3,
        },
      }))
      setSparkParticles(newSparks)
    }

    // Generate matrix rain (reduced)
    const generateMatrix = () => {
      const columns = Math.floor(dimensions.width / 25)
      const newMatrix = Array.from({ length: columns }, (_, i) => ({
        id: i,
        x: i * 25,
        y: Math.random() * dimensions.height,
        char: generateMatrixChar(),
        speed: Math.random() * 2 + 1,
        opacity: Math.random() * 0.6 + 0.2,
      }))
      setMatrixRain(newMatrix)
    }

    generateArcs()
    generateSparks()
    generateMatrix()

    // Slower animations for better performance
    const animationInterval = setInterval(() => {
      // Update spark particles
      setSparkParticles((prev) =>
        prev.map((spark) => {
          let newX = spark.x + spark.velocity.x
          let newY = spark.y + spark.velocity.y
          let newVelX = spark.velocity.x
          let newVelY = spark.velocity.y

          // Bounce off walls
          if (newX < 0 || newX > dimensions.width) {
            newVelX = -newVelX
            newX = Math.max(0, Math.min(newX, dimensions.width))
          }
          if (newY < 0 || newY > dimensions.height) {
            newVelY = -newVelY
            newY = Math.max(0, Math.min(newY, dimensions.height))
          }

          return {
            ...spark,
            x: newX,
            y: newY,
            velocity: { x: newVelX, y: newVelY },
          }
        }),
      )

      // Update matrix rain
      setMatrixRain((prev) =>
        prev.map((drop) => ({
          ...drop,
          y: drop.y > dimensions.height ? -20 : drop.y + drop.speed,
          char: Math.random() < 0.1 ? generateMatrixChar() : drop.char,
        })),
      )
    }, 60) // Slower interval

    // Regenerate effects less frequently
    const effectsInterval = setInterval(() => {
      generateArcs()
    }, 3000)

    return () => {
      clearInterval(animationInterval)
      clearInterval(effectsInterval)
    }
  }, [dimensions, isDarkMode])

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
    // setTimeout(() => {
    //   onLogin({
    //     name: email.split("@")[0],
    //     email: email,
    //     avatar: "/placeholder.svg?height=40&width=40",
    //     provider: "email",
    //   })
    //   setIsLoading(false)
    // }, 1500)
  }

  const toggleTheme = () => {
    if (isDarkMode) {
      localStorage.setItem("theme", "light")
    } else {
      localStorage.setItem("theme", "dark")
    }
    setIsDarkMode(!isDarkMode)
  }

  // Theme-specific colors and styles
  const theme = {
    background: isDarkMode ? "bg-black" : "bg-gradient-to-br from-cyan-50 via-blue-50 to-cyan-50",
    arcColor: isDarkMode ? "#00FFFF" : "#7dd7ff",
    matrixColor: isDarkMode ? "#00FF00" : "#7dd7ff",
    gridColor: isDarkMode ? "rgba(0,255,255,0.3)" : "rgba(14,165,233,0.3)",
    scanColor: isDarkMode ? "#00FFFF" : "#7dd7ff",
    cardBg: isDarkMode ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.9)",
    cardBorder: isDarkMode ? "#00FFFF" : "#7dd7ff",
    cardShadow: isDarkMode
      ? "0 0 20px #00FFFF, 0 0 40px #00FFFF, 0 0 60px #00FFFF, inset 0 0 20px rgba(0, 255, 255, 0.1)"
      : "0 0 20px rgba(14,165,233,0.3), 0 0 40px rgba(14,165,233,0.2), 0 0 60px rgba(14,165,233,0.1), inset 0 0 20px rgba(14,165,233,0.05)",
    iconBg: isDarkMode ? "linear-gradient(45deg, #FF00FF, #00FFFF)" : "linear-gradient(45deg, #7dd7ff, #0284c7)",
    iconShadow: isDarkMode
      ? "0 0 30px #FF00FF, 0 0 60px #00FFFF, inset 0 0 20px rgba(255, 255, 255, 0.2)"
      : "0 0 30px rgba(14,165,233,0.4), 0 0 60px rgba(2,132,199,0.3), inset 0 0 20px rgba(255, 255, 255, 0.3)",
    titleColor: isDarkMode ? "text-white" : "text-gray-800",
    titleShadow: isDarkMode ? "0 0 10px #00FFFF, 0 0 20px #00FFFF, 0 0 30px #00FFFF" : "0 0 10px rgba(14,165,233,0.3)",
    descColor: isDarkMode ? "text-cyan-300" : "text-cyan-600",
    descShadow: isDarkMode ? "0 0 5px #00FFFF" : "0 0 5px rgba(14,165,233,0.2)",
    labelColor: isDarkMode ? "text-white" : "text-cyan-700",
    labelShadow: isDarkMode ? "0 0 5px #00FFFF" : "none",
    inputBg: isDarkMode ? "bg-black/50" : "bg-white/70",
    inputText: isDarkMode ? "text-white" : "text-gray-800",
    inputPlaceholder: isDarkMode ? "placeholder:text-gray-400" : "placeholder:text-gray-600",
    inputBorder: isDarkMode ? "#00FFFF" : "#7dd7ff",
    inputShadow: isDarkMode
      ? "0 0 10px #00FFFF, inset 0 0 10px rgba(0, 255, 255, 0.1)"
      : "0 0 10px rgba(14,165,233,0.2), inset 0 0 10px rgba(14,165,233,0.05)",
    buttonGradient: isDarkMode ? "linear-gradient(45deg, #FF00FF, #00FFFF)" : "linear-gradient(45deg, #7dd7ff, #0284c7)",
    buttonShadow: isDarkMode
      ? "0 0 20px #FF00FF, 0 0 40px #00FFFF, inset 0 0 20px rgba(255, 255, 255, 0.1)"
      : "0 0 20px rgba(14,165,233,0.3), 0 0 40px rgba(2,132,199,0.2), inset 0 0 20px rgba(255, 255, 255, 0.2)",
    textColor: isDarkMode ? "text-cyan-300" : "text-cyan-600",
    textShadow: isDarkMode ? "0 0 5px #00FFFF" : "none",
  }

  return (
    <div className={`min-h-screen relative overflow-hidden ${theme.background}`}>
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

      {/* Electric Arcs */}
      <svg className="absolute inset-0 pointer-events-none z-10" width="100%" height="100%">
        {electricArcs.map((arc) => (
          <g key={arc.id}>
            <polyline
              points={generateElectricArc(arc.x1, arc.y1, arc.x2, arc.y2)}
              fill="none"
              stroke={theme.arcColor}
              strokeWidth="3"
              opacity={arc.intensity * (isDarkMode ? 1 : 0.6)}
              className="animate-pulse"
              style={{
                filter: `
                  drop-shadow(0 0 5px ${theme.arcColor}) 
                  drop-shadow(0 0 10px ${theme.arcColor}) 
                  drop-shadow(0 0 20px ${theme.arcColor})
                `,
                animation: `electric-crackle ${1 + Math.random()}s infinite`,
              }}
            />
            <polyline
              points={generateElectricArc(arc.x1, arc.y1, arc.x2, arc.y2)}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1"
              opacity={arc.intensity * 0.8 * (isDarkMode ? 1 : 0.4)}
              className="animate-pulse"
            />
          </g>
        ))}
      </svg>

      {/* Spark Particles */}
      <svg className="absolute inset-0 pointer-events-none z-20" width="100%" height="100%">
        {sparkParticles.map((spark) => (
          <circle
            key={spark.id}
            cx={spark.x}
            cy={spark.y}
            r={spark.size}
            fill={spark.color}
            className="animate-pulse"
            opacity={isDarkMode ? 1 : 0.7}
            style={{
              filter: `
                drop-shadow(0 0 5px ${spark.color}) 
                drop-shadow(0 0 10px ${spark.color})
              `,
            }}
          />
        ))}
      </svg>

      {/* Matrix Rain */}
      <svg className="absolute inset-0 pointer-events-none z-0" width="100%" height="100%">
        {matrixRain.map((drop) => (
          <text
            key={drop.id}
            x={drop.x}
            y={drop.y}
            fill={theme.matrixColor}
            fontSize="14"
            fontFamily="monospace"
            opacity={drop.opacity * (isDarkMode ? 1 : 0.4)}
            style={{
              filter: `drop-shadow(0 0 3px ${theme.matrixColor})`,
            }}
          >
            {drop.char}
          </text>
        ))}
      </svg>

      {/* Holographic Grid */}
      <div className="absolute inset-0 opacity-10 z-0">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(${theme.gridColor} 1px, transparent 1px),
              linear-gradient(90deg, ${theme.gridColor} 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
            animation: "grid-pulse 4s ease-in-out infinite",
          }}
        />
      </div>

      {/* Scanning Line */}
      <div className="absolute inset-0 pointer-events-none z-25">
        <div
          className={`absolute w-full h-0.5 bg-gradient-to-r from-transparent to-transparent opacity-60`}
          style={{
            backgroundImage: `linear-gradient(to right, transparent, ${theme.scanColor}, transparent)`,
            animation: "scan-vertical 4s ease-in-out infinite",
            filter: `drop-shadow(0 0 5px ${theme.scanColor}) blur(0.5px)`,
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-30 flex items-center justify-center min-h-screen p-4">
        <Card
          className="w-full max-w-md border-0 backdrop-blur-xl"
          style={{
            background: theme.cardBg,
            border: `2px solid ${theme.cardBorder}`,
            boxShadow: theme.cardShadow,
          }}
        >
          <CardHeader className="text-center space-y-4">
            <div
              className="mx-auto w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: theme.iconBg,
                boxShadow: theme.iconShadow,
                animation: "neon-pulse 2s ease-in-out infinite",
              }}
            >
              <Zap className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle
                className={`text-2xl font-bold ${theme.titleColor}`}
                style={{
                  textShadow: theme.titleShadow,
                }}
              >
                Welcome to Spark
              </CardTitle>
              <CardDescription
                className={theme.descColor}
                style={{
                  textShadow: theme.descShadow,
                }}
              >
                Create powerful AI voice agents in minutes
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {/* Google Sign In */}
            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 border-0 transition-all duration-200"
              style={{
                boxShadow: isDarkMode
                  ? "0 0 20px rgba(255, 255, 255, 0.5)"
                  : "0 0 20px rgba(0, 0, 0, 0.1), 0 4px 20px rgba(0, 0, 0, 0.1)",
              }}
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
                <Separator
                  className="w-full"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${theme.cardBorder}, transparent)`,
                    height: "2px",
                    boxShadow: `0 0 10px ${theme.cardBorder}`,
                  }}
                />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span
                  className={`${isDarkMode ? 'bg-black' : 'bg-white'} px-2 ${theme.descColor}`}
                  style={{
                    textShadow: theme.descShadow,
                  }}
                >
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Email Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className={theme.labelColor}
                  style={{
                    textShadow: theme.labelShadow,
                  }}
                >
                  Email
                </Label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4`}
                    style={{ color: theme.cardBorder }} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`pl-10 ${theme.inputBg} ${theme.inputText} ${theme.inputPlaceholder}`}
                    style={{
                      border: `2px solid ${theme.inputBorder}`,
                      boxShadow: theme.inputShadow,
                    }}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className={theme.labelColor}
                  style={{
                    textShadow: theme.labelShadow,
                  }}
                >
                  Password
                </Label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4`}
                    style={{ color: theme.cardBorder }} />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`pl-10 ${theme.inputBg} ${theme.inputText} ${theme.inputPlaceholder}`}
                    style={{
                      border: `2px solid ${theme.inputBorder}`,
                      boxShadow: theme.inputShadow,
                    }}
                    required
                  />
                </div>
              </div>
              <Button
                onClick={(e) => {
                  e.preventDefault()
                  handleEmailLogin(e)
                }}
                disabled={isLoading || !email || !password}
                className="w-full h-12 text-white border-0 transition-all duration-200 disabled:opacity-50"
                style={{
                  background: theme.buttonGradient,
                  boxShadow: theme.buttonShadow,
                  animation: "neon-pulse 2s ease-in-out infinite",
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
            </div>

            <p
              className={`text-center text-sm ${theme.textColor}`}
              style={{
                textShadow: theme.textShadow,
              }}
            >
              Don't have an account? Sign up with Google above
            </p>
          </CardContent>
        </Card>
      </div>

      <ToastContainer />

      <style>{`
        @keyframes electric-crackle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        
        @keyframes neon-pulse {
          0%, 100% { 
            box-shadow: ${isDarkMode
          ? `0 0 20px #FF00FF, 0 0 40px #00FFFF, inset 0 0 20px rgba(255, 255, 255, 0.1)`
          : `0 0 20px rgba(14,165,233,0.3), 0 0 40px rgba(2,132,199,0.2), inset 0 0 20px rgba(255, 255, 255, 0.2)`
        };
          }
          50% { 
            box-shadow: ${isDarkMode
          ? `0 0 30px #FF00FF, 0 0 60px #00FFFF, 0 0 80px #FFFF00, inset 0 0 30px rgba(255, 255, 255, 0.2)`
          : `0 0 30px rgba(14,165,233,0.4), 0 0 60px rgba(2,132,199,0.3), 0 0 80px rgba(56,189,248,0.2), inset 0 0 30px rgba(255, 255, 255, 0.3)`
        };
          }
        }
        
        @keyframes grid-pulse {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.3; }
        }
        
        @keyframes scan-vertical {
          0% { top: -10px; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  )
}