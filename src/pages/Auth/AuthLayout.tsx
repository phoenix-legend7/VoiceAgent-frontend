import { ReactNode, useEffect, useState } from "react"
import { ToastContainer } from "react-toastify"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Sun, Moon, Zap } from "lucide-react"

type Theme = {
  background: string
  arcColor: string
  matrixColor: string
  gridColor: string
  scanColor: string
  cardBg: string
  cardBorder: string
  cardShadow: string
  iconBg: string
  iconShadow: string
  titleColor: string
  titleShadow: string
  descColor: string
  descShadow: string
  labelColor: string
  labelShadow: string
  inputBg: string
  inputText: string
  inputPlaceholder: string
  inputBorder: string
  inputShadow: string
  buttonGradient: string
  buttonShadow: string
  textColor: string
  textShadow: string
}

type AuthLayoutProps = {
  title: string
  description: string
  children: (theme: Theme, isDarkMode: boolean) => ReactNode
}

export default function AuthLayout({ title, description, children }: AuthLayoutProps) {
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

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight })
    }
    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    setIsDarkMode(savedTheme === "dark")
  }, [])

  const generateMatrixChar = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?"
    return chars[Math.floor(Math.random() * chars.length)]
  }

  const generateElectricArc = (x1: number, y1: number, x2: number, y2: number) => {
    const segments = 6
    const points: string[] = []
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
        velocity: { x: (Math.random() - 0.5) * 3, y: (Math.random() - 0.5) * 3 },
      }))
      setSparkParticles(newSparks)
    }

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

    const animationInterval = setInterval(() => {
      setSparkParticles((prev) =>
        prev.map((spark) => {
          let newX = spark.x + spark.velocity.x
          let newY = spark.y + spark.velocity.y
          let newVelX = spark.velocity.x
          let newVelY = spark.velocity.y
          if (newX < 0 || newX > dimensions.width) {
            newVelX = -newVelX
            newX = Math.max(0, Math.min(newX, dimensions.width))
          }
          if (newY < 0 || newY > dimensions.height) {
            newVelY = -newVelY
            newY = Math.max(0, Math.min(newY, dimensions.height))
          }
          return { ...spark, x: newX, y: newY, velocity: { x: newVelX, y: newVelY } }
        }),
      )
      setMatrixRain((prev) =>
        prev.map((drop) => ({
          ...drop,
          y: drop.y > dimensions.height ? -20 : drop.y + drop.speed,
          char: Math.random() < 0.1 ? generateMatrixChar() : drop.char,
        })),
      )
    }, 60)

    const effectsInterval = setInterval(() => {
      generateArcs()
    }, 3000)

    return () => {
      clearInterval(animationInterval)
      clearInterval(effectsInterval)
    }
  }, [dimensions, isDarkMode])

  const toggleTheme = () => {
    if (isDarkMode) {
      localStorage.setItem("theme", "light")
    } else {
      localStorage.setItem("theme", "dark")
    }
    setIsDarkMode(!isDarkMode)
  }

  const theme: Theme = {
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
      <Button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 w-12 h-12 rounded-full border-0 transition-all duration-300"
        style={{ background: theme.iconBg, boxShadow: theme.iconShadow }}
      >
        {!isDarkMode ? <Sun className="w-5 h-5 text-white" /> : <Moon className="w-5 h-5 text-white" />}
      </Button>

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
            style={{ filter: `drop-shadow(0 0 3px ${theme.matrixColor})` }}
          >
            {drop.char}
          </text>
        ))}
      </svg>

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

      <div className="relative z-30 flex items-center justify-center min-h-screen p-4">
        <Card
          className="w-full max-w-md border-0 backdrop-blur-xl"
          style={{ background: theme.cardBg, border: `2px solid ${theme.cardBorder}`, boxShadow: theme.cardShadow }}
        >
          <CardHeader className="text-center space-y-4">
            <div
              className="mx-auto w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: theme.iconBg, boxShadow: theme.iconShadow, animation: "neon-pulse 2s ease-in-out infinite" }}
            >
              <Zap className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className={`text-2xl font-bold ${theme.titleColor}`} style={{ textShadow: theme.titleShadow }}>
                {title}
              </CardTitle>
              <CardDescription className={theme.descColor} style={{ textShadow: theme.descShadow }}>
                {description}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {children(theme, isDarkMode)}
          </CardContent>
        </Card>
      </div>

      <ToastContainer newestOnTop limit={3} />

      <style>{`
        @keyframes electric-crackle { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
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
        @keyframes grid-pulse { 0%, 100% { opacity: 0.1; } 50% { opacity: 0.3; } }
        @keyframes scan-vertical { 0% { top: -10px; } 100% { top: 100%; } }
      `}</style>
    </div>
  )
}


