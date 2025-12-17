import { useEffect, useRef, useState, useCallback } from "react"
import {
  Phone,
  Calendar,
  Mail,
  MessageSquare,
  Users,
  Bot,
  Headphones,
  Clock,
  Send,
} from "lucide-react"

const floatingIconsConfig = [
  { icon: Phone, color: "#00b8d4" },
  { icon: Calendar, color: "#00b8d4" },
  { icon: Mail, color: "#00b8d4" },
  { icon: MessageSquare, color: "#00b8d4" },
  { icon: Users, color: "#00b8d4" },
  { icon: Bot, color: "#00b8d4" },
  { icon: Headphones, color: "#00b8d4" },
  { icon: Clock, color: "#00b8d4" },
  { icon: Send, color: "#00b8d4" },
]

interface FloatingIcon {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  iconIndex: number
}

export default function FloatingElements() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [electricArcs, setElectricArcs] = useState<
    Array<{ id: number; x1: number; y1: number; x2: number; y2: number; intensity: number }>
  >([])
  const [sparkParticles, setSparkParticles] = useState<Array<{ id: number; x: number; y: number; size: number }>>([])

  const floatingIconsRef = useRef<FloatingIcon[]>([])
  const [floatingIcons, setFloatingIcons] = useState<FloatingIcon[]>([])
  const animationFrameRef = useRef<number | null>(null)

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

  const animateIcons = useCallback(() => {
    if (dimensions.width === 0 || floatingIconsRef.current.length === 0) {
      animationFrameRef.current = requestAnimationFrame(animateIcons)
      return
    }

    floatingIconsRef.current = floatingIconsRef.current.map((icon) => {
      let newX = icon.x + icon.vx
      let newY = icon.y + icon.vy
      let newVx = icon.vx
      let newVy = icon.vy

      // Bounce off edges with padding
      if (newX <= 20 || newX >= dimensions.width - 80) {
        newVx = -newVx
        newX = Math.max(20, Math.min(newX, dimensions.width - 80))
      }
      if (newY <= 20 || newY >= dimensions.height - 80) {
        newVy = -newVy
        newY = Math.max(20, Math.min(newY, dimensions.height - 80))
      }

      return { ...icon, x: newX, y: newY, vx: newVx, vy: newVy }
    })

    setFloatingIcons([...floatingIconsRef.current])
    animationFrameRef.current = requestAnimationFrame(animateIcons)
  }, [dimensions])

  useEffect(() => {
    if (dimensions.width === 0) return

    // Generate arcs
    const generateArcs = () => {
      const newArcs = Array.from({ length: 3 }, (_, i) => ({
        id: i,
        x1: Math.random() * dimensions.width,
        y1: Math.random() * dimensions.height * 0.3,
        x2: Math.random() * dimensions.width,
        y2: Math.random() * dimensions.height * 0.7 + dimensions.height * 0.3,
        intensity: Math.random() * 0.3 + 0.1,
      }))
      setElectricArcs(newArcs)
    }

    // Generate sparks
    const generateSparks = () => {
      const newSparks = Array.from({ length: 6 }, (_, i) => ({
        id: i,
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        size: Math.random() * 2 + 1,
      }))
      setSparkParticles(newSparks)
    }

    floatingIconsRef.current = floatingIconsConfig.map((_, i) => ({
      id: i,
      x: 100 + Math.random() * (dimensions.width - 200),
      y: 100 + Math.random() * (dimensions.height - 200),
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      iconIndex: i,
    }))
    setFloatingIcons([...floatingIconsRef.current])

    generateArcs()
    generateSparks()

    // Start animation loop
    animationFrameRef.current = requestAnimationFrame(animateIcons)

    const effectsInterval = setInterval(() => {
      generateArcs()
    }, 5000)

    return () => {
      clearInterval(effectsInterval)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [dimensions, animateIcons])

  return (
    <>
      {/* Electric arcs */}
      <svg className="absolute inset-0 pointer-events-none z-10 opacity-20" width="100%" height="100%">
        {electricArcs.map((arc) => (
          <g key={arc.id}>
            <polyline
              points={generateElectricArc(arc.x1, arc.y1, arc.x2, arc.y2)}
              fill="none"
              stroke="#00b8d4"
              strokeWidth="2"
              opacity={arc.intensity}
              style={{ filter: "drop-shadow(0 0 4px #00b8d4)" }}
            />
          </g>
        ))}
      </svg>

      {/* Spark particles */}
      <svg className="absolute inset-0 pointer-events-none z-10 opacity-30" width="100%" height="100%">
        {sparkParticles.map((spark) => (
          <circle
            key={spark.id}
            cx={spark.x}
            cy={spark.y}
            r={spark.size}
            fill="#00b8d4"
            style={{ filter: "drop-shadow(0 0 3px #00b8d4)" }}
          />
        ))}
      </svg>

      <div className="absolute inset-0 pointer-events-none z-5">
        {floatingIcons.map((floatingIcon) => {
          const IconComponent = floatingIconsConfig[floatingIcon.iconIndex].icon
          return (
            <div
              key={floatingIcon.id}
              className="absolute"
              style={{
                transform: `translate3d(${floatingIcon.x}px, ${floatingIcon.y}px, 0)`,
                willChange: "transform",
              }}
            >
              <div
                className="p-3 rounded-2xl"
                style={{
                  background: "rgba(255, 255, 255, 0.85)",
                  boxShadow: "0 4px 20px rgba(0, 184, 212, 0.15), 0 0 15px rgba(0, 184, 212, 0.1)",
                  border: "1px solid rgba(0, 184, 212, 0.2)",
                }}
              >
                <IconComponent className="w-6 h-6" style={{ color: "#00b8d4" }} strokeWidth={1.5} />
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
