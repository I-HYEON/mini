import { motion } from "framer-motion";
import GameCard from "./GameCard";
import runawayThumbnail from "@/assets/runaway/runaway-thumbnail.png";

const games = [
  {
    title: "Endless Jump",
    description: "Run and Jump through a beautiful cityscape, avoiding obstacles..",
    image: runawayThumbnail,
    href: "/games/run-away",
    isOpen: true,
  },
  {
    title: "CRYPTO PUZZLE",
    description: "Solve complex puzzles to hack into the mainframe and steal valuable data.",
    image: "/placeholder.jpg?height=400&width=600",
    href: "/games/crypto-puzzle",
    isOpen: false,
  },
  {
    title: "SYNTH SHOOTER",
    description: "Fast-paced shooter with synthwave aesthetics. Survive waves of enemies.",
    image: "/placeholder.jpg?height=400&width=600",
    href: "/games/synth-shooter",
    isOpen: false,
  },
  {
    title: "MEMORY MATRIX",
    description: "Test your memory skills in this futuristic pattern matching game.",
    image: "/placeholder.jpg?height=400&width=600",
    href: "/games/memory-matrix",
    isOpen: false,
  },
  {
    title: "HOLO CHESS",
    description: "Strategic holographic chess with special abilities and power moves.",
    image: "/placeholder.jpg?height=400&width=600",
    href: "/games/holo-chess",
    isOpen: false,
  },
  {
    title: "BYTE BRAWLER",
    description: "Fight in the digital arena against AI opponents with unique fighting styles.",
    image: "/placeholder.jpg?height=400&width=600",
    href: "/games/byte-brawler",
    isOpen: false,
  },
]

export default function GamesList() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  }

  return (
    <div className="w-full h-full px-4 py-8">
      <motion.h2
        className="text-2xl text-left font-bold mb-6 text-zinc-100 border-l-4 border-pink-500 pl-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        CHOOSE YOUR EXPERIENCE
      </motion.h2>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {games.map((game, index) => (
          <motion.div key={index} variants={item}>
            <GameCard {...game} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

