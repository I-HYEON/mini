import { motion } from "framer-motion"

export default function Header() {
  return (
    <motion.div
      className="flex flex-col justify-center items-center h-full text-center px-4 py-8 mt-8"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500">
        MINI FUN ARCADE
      </h1>
      <p className="text-lg md:text-xl max-w-2xl text-zinc-300 leading-relaxed">
        Welcome to the result of vibe-coding. Dive into our collection of mini-games designed to test your skills and
        challenge your mind...
      </p>
      <div className="mt-6">
        <motion.div
          className="inline-block px-6 py-2 cursor-pointer border-2 border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-black transition-all duration-300 rounded-md font-bold"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          EXPLORE GAMES
        </motion.div>
      </div>
    </motion.div>
  )
}

