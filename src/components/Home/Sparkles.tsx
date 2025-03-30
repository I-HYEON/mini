import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface SparkleProps {
  id: string
  createdAt: number
  color: string
  size: number
  style: {
    top: string
    left: string
    zIndex: number
  }
}

const random = (min: number, max: number) => Math.floor(Math.random() * (max - min)) + min

const generateSparkle = (color: string): SparkleProps => {
  return {
    id: Math.random().toString(36).slice(2),
    createdAt: Date.now(),
    color,
    size: random(10, 20),
    style: {
      top: `${random(0, 100)}%`,
      left: `${random(0, 100)}%`,
      zIndex: 2,
    },
  }
}

const Sparkle = ({ color, size, style }: Omit<SparkleProps, "id" | "createdAt">) => {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      className="absolute"
      initial={{ scale: 0, rotate: 0, opacity: 0 }}
      animate={{
        scale: 1,
        rotate: 180,
        opacity: 1,
      }}
      exit={{
        scale: 0,
        opacity: 0,
      }}
      transition={{
        duration: 0.8,
        ease: "easeInOut",
      }}
    >
      <path
        d="M80 0C80 0 84.2846 41.2925 101.496 58.504C118.707 75.7154 160 80 160 80C160 80 118.707 84.2846 101.496 101.496C84.2846 118.707 80 160 80 160C80 160 75.7154 118.707 58.504 101.496C41.2925 84.2846 0 80 0 80C0 80 41.2925 75.7154 58.504 58.504C75.7154 41.2925 80 0 80 0Z"
        fill={color}
      />
    </motion.svg>
  )
}

export default function Sparkles() {
  const [sparkles, setSparkles] = useState<SparkleProps[]>([])
  const colors = ["#FF00FF", "#00FFFF", "#FF2D95", "#39FF14", "#F222FF"]

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      const color = colors[Math.floor(Math.random() * colors.length)]

      // Remove sparkles older than 1 second
      setSparkles((sparkles) => [
        ...sparkles.filter((sparkle) => now - sparkle.createdAt < 1000),
        generateSparkle(color),
      ])
    }, 300)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none">
      <AnimatePresence>
        {sparkles.map((sparkle) => (
          <Sparkle key={sparkle.id} color={sparkle.color} size={sparkle.size} style={sparkle.style} />
        ))}
      </AnimatePresence>
    </div>
  )
}

