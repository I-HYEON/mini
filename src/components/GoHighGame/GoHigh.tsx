import { useEffect, useRef } from "react"
import shieldPng from "../../assets/gohigh/shield.png"
import boostPng from "../../assets/gohigh/boost.png"

export default function GoHigh() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const shieldImage = new Image()
  const boostImage = new Image()

  shieldImage.src = shieldPng
  boostImage.src = boostPng

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const updateCanvasSize = () => {
      canvas.width = Math.min(500, window.innerWidth * 0.9)
      canvas.height = Math.min(700, window.innerHeight * 0.9)
    }

    updateCanvasSize()
    window.addEventListener("resize", updateCanvasSize)

    // Game variables
    let gameRunning = false
    let gameOver = false
    let score = 0
    let highScore = 0
    let speed = 2
    let backgroundOffset = 0

    // Spacecraft
    const spacecraft = {
      x: canvas.width / 2,
      y: canvas.height - 100,
      width: 40,
      height: 60,
      speed: 5,
      color: "#4ade80",
    }

    // Obstacles (asteroids)
    const asteroids: {
      x: number
      y: number
      radius: number
      speed: number
      rotation: number
      rotationSpeed: number
    }[] = []

    // Stars
    const stars: { x: number; y: number; radius: number; brightness: number; twinkleSpeed: number }[] = []

    // Planets
    const planets: {
      x: number
      y: number
      radius: number
      color: string
      ring?: boolean
      ringColor?: string
      ringWidth?: number
    }[] = []

    // Particles for explosion
    const particles: { x: number; y: number; radius: number; color: string; vx: number; vy: number; life: number }[] =
      []

    // Power-ups
    const powerUps: { x: number; y: number; type: string; radius: number; collected: boolean }[] = []

    // Game state
    let shieldActive = false
    let shieldTime = 0
    let boostActive = false
    let boostTime = 0

    // Generate random color
    const getRandomColor = () => {
      const colors = ["#ff4d4d", "#4ade80", "#60a5fa", "#f97316", "#a78bfa", "#fbbf24", "#ec4899"]
      return colors[Math.floor(Math.random() * colors.length)]
    }

    // Initialize stars
    const initStars = () => {
      stars.length = 0
      for (let i = 0; i < 100; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height * 3 - canvas.height,
          radius: Math.random() * 2 + 0.5,
          brightness: Math.random() * 0.5 + 0.5,
          twinkleSpeed: Math.random() * 0.05 + 0.01,
        })
      }
    }

    // Initialize planets
    const initPlanets = () => {
      planets.length = 0

      // Add a few planets at random positions off-screen (will scroll into view)
      for (let i = 0; i < 5; i++) {
        const hasRing = Math.random() > 0.7
        planets.push({
          x: Math.random() * canvas.width,
          y: -500 - Math.random() * 3000, // Start far above
          radius: 20 + Math.random() * 40,
          color: getRandomColor(),
          ring: hasRing,
          ringColor: hasRing ? getRandomColor() : undefined,
          ringWidth: hasRing ? 5 + Math.random() * 10 : undefined,
        })
      }
    }

    // Initialize game
    const initGame = () => {
      // Reset game state
      gameRunning = true
      gameOver = false
      score = 0
      speed = 2
      backgroundOffset = 0
      shieldActive = false
      shieldTime = 0
      boostActive = false
      boostTime = 0

      // Reset spacecraft
      spacecraft.x = canvas.width / 2
      spacecraft.y = canvas.height - 100

      // Clear obstacles and particles
      asteroids.length = 0
      particles.length = 0
      powerUps.length = 0

      // Initialize stars and planets
      initStars()
      initPlanets()
    }

    // Create explosion effect
    const createExplosion = (x: number, y: number, color: string) => {
      for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = Math.random() * 3 + 1
        particles.push({
          x,
          y,
          radius: Math.random() * 3 + 1,
          color: color || "#ffffff",
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 60,
        })
      }
    }

    // Draw game elements
    const draw = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw space background
      ctx.fillStyle = "#000000"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw stars
      stars.forEach((star) => {
        // Calculate twinkle effect
        const twinkle = Math.sin(Date.now() * star.twinkleSpeed) * 0.2 + 0.8

        ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness * twinkle})`
        ctx.beginPath()
        ctx.arc(star.x, star.y + (backgroundOffset % (canvas.height * 3)), star.radius, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw planets
      planets.forEach((planet) => {
        // Only draw planets that are visible
        const y = planet.y + backgroundOffset
        if (y > -planet.radius * 2 && y < canvas.height + planet.radius * 2) {
          // Draw planet
          ctx.fillStyle = planet.color
          ctx.beginPath()
          ctx.arc(planet.x, y, planet.radius, 0, Math.PI * 2)
          ctx.fill()

          // Draw ring if planet has one
          if (planet.ring && planet.ringColor && planet.ringWidth) {
            ctx.strokeStyle = planet.ringColor
            ctx.lineWidth = planet.ringWidth
            ctx.beginPath()
            ctx.ellipse(planet.x, y, planet.radius * 1.5, planet.radius * 0.5, Math.PI / 6, 0, Math.PI * 2)
            ctx.stroke()
          }

          // Add some surface details
          ctx.fillStyle = `rgba(0, 0, 0, 0.2)`
          ctx.beginPath()
          ctx.arc(planet.x - planet.radius * 0.3, y - planet.radius * 0.3, planet.radius * 0.4, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      // Draw power-ups
      powerUps.forEach((powerUp) => {
        if (!powerUp.collected) {
          ctx.fillStyle = powerUp.type === "shield" ? "#60a5fa" : "#f97316"
          ctx.beginPath()
          ctx.arc(powerUp.x, powerUp.y, powerUp.radius, 0, Math.PI * 2)
          ctx.fill()

          // s 또는 b 텍스트 그리기기
          // ctx.fillStyle = "#ffffff"
          // ctx.font = "12px Arial"
          // ctx.textAlign = "center"
          // ctx.textBaseline = "middle"
          // ctx.fillText(powerUp.type === "shield" ? "S" : "B", powerUp.x, powerUp.y)
          
          // 텍스트 대신 이미지 그리기
          const img = powerUp.type === "shield" ? shieldImage : boostImage;
          if (img.complete && img.naturalHeight !== 0) {
            // 이미지가 로드된 경우
            const imgSize = powerUp.radius * 1.5;
            ctx.drawImage(img, powerUp.x - imgSize/2, powerUp.y - imgSize/2, imgSize, imgSize);
          } else {
            // 이미지가 로드되지 않은 경우 기존 텍스트 표시
            ctx.fillStyle = "#ffffff";
            ctx.font = "12px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(powerUp.type === "shield" ? "S" : "B", powerUp.x, powerUp.y);
          }
        }
      })

      // Draw asteroids
      asteroids.forEach((asteroid) => {
        ctx.save()
        ctx.translate(asteroid.x, asteroid.y)
        ctx.rotate(asteroid.rotation)

        // Draw asteroid
        ctx.fillStyle = "#a3a3a3"
        ctx.beginPath()

        // Create irregular shape
        const points = 8
        for (let i = 0; i < points; i++) {
          const angle = (i / points) * Math.PI * 2
          const distance = asteroid.radius * (0.8 + Math.sin(i * 5) * 0.2)
          const x = Math.cos(angle) * distance
          const y = Math.sin(angle) * distance

          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }

        ctx.closePath()
        ctx.fill()

        // Add crater details
        ctx.fillStyle = "#808080"
        for (let i = 0; i < 3; i++) {
          const craterX = (Math.random() - 0.5) * asteroid.radius
          const craterY = (Math.random() - 0.5) * asteroid.radius
          const craterRadius = asteroid.radius * 0.2

          ctx.beginPath()
          ctx.arc(craterX, craterY, craterRadius, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.restore()
      })

      // Draw spacecraft
      ctx.save()
      ctx.translate(spacecraft.x, spacecraft.y)

      // Draw shield if active
      if (shieldActive) {
        ctx.fillStyle = "rgba(96, 165, 250, 0.3)"
        ctx.beginPath()
        ctx.arc(0, 0, spacecraft.width, 0, Math.PI * 2)
        ctx.fill()

        ctx.strokeStyle = "rgba(96, 165, 250, 0.8)"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(0, 0, spacecraft.width, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Draw spacecraft body
      ctx.fillStyle = spacecraft.color
      ctx.beginPath()
      ctx.moveTo(0, -spacecraft.height / 2)
      ctx.lineTo(spacecraft.width / 2, spacecraft.height / 2)
      ctx.lineTo(-spacecraft.width / 2, spacecraft.height / 2)
      ctx.closePath()
      ctx.fill()

      // Draw cockpit
      ctx.fillStyle = "#60a5fa"
      ctx.beginPath()
      ctx.ellipse(0, -spacecraft.height / 6, spacecraft.width / 4, spacecraft.height / 6, 0, 0, Math.PI * 2)
      ctx.fill()

      // Draw engine flames
      const flameHeight = (spacecraft.height / 3) * (0.8 + Math.random() * 0.4)
      const boostMultiplier = boostActive ? 1.5 : 1

      ctx.fillStyle = "#f97316"
      ctx.beginPath()
      ctx.moveTo(-spacecraft.width / 4, spacecraft.height / 2)
      ctx.lineTo(0, spacecraft.height / 2 + flameHeight * boostMultiplier)
      ctx.lineTo(spacecraft.width / 4, spacecraft.height / 2)
      ctx.closePath()
      ctx.fill()

      ctx.fillStyle = "#fbbf24"
      ctx.beginPath()
      ctx.moveTo(-spacecraft.width / 6, spacecraft.height / 2)
      ctx.lineTo(0, spacecraft.height / 2 + flameHeight * 0.7 * boostMultiplier)
      ctx.lineTo(spacecraft.width / 6, spacecraft.height / 2)
      ctx.closePath()
      ctx.fill()

      ctx.restore()

      // Draw particles
      particles.forEach((particle) => {
        ctx.fillStyle = particle.color
        ctx.globalAlpha = particle.life / 60
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
      })

      // Draw score
      ctx.fillStyle = "white"
      ctx.font = "20px Arial"
      ctx.textAlign = "left"
      ctx.fillText(`고도: ${Math.floor(score).toLocaleString()}m`, 20, 30)

      // Draw high score
      ctx.fillStyle = "white"
      ctx.font = "16px Arial"
      ctx.textAlign = "left"
      ctx.fillText(`최고 고도: ${Math.floor(highScore).toLocaleString()}m`, 20, 60)

      // Draw power-up status
      if (shieldActive) {
        ctx.fillStyle = "#60a5fa"
        ctx.fillText(`보호막: ${Math.ceil(shieldTime / 60)}초`, 20, 90)
      }

      if (boostActive) {
        ctx.fillStyle = "#f97316"
        ctx.fillText(`부스트: ${Math.ceil(boostTime / 60)}초`, 20, shieldActive ? 120 : 90)
      }

      // Draw game over screen
      if (gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.fillStyle = "white"
        ctx.font = "30px Arial"
        ctx.textAlign = "center"
        ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 60)

        ctx.font = "20px Arial"
        ctx.fillText(`최종 고도: ${Math.floor(score).toLocaleString()}m`, canvas.width / 2, canvas.height / 2 - 20)

        if (score > highScore) {
          ctx.fillStyle = "#fbbf24"
          ctx.fillText("새로운 기록!", canvas.width / 2, canvas.height / 2 + 10)
        }

        ctx.fillStyle = "#4ade80"
        ctx.fillRect(canvas.width / 2 - 60, canvas.height / 2 + 40, 120, 40)

        ctx.fillStyle = "white"
        ctx.font = "16px Arial"
        ctx.fillText("다시 시작", canvas.width / 2, canvas.height / 2 + 65)
      }

      // Draw start screen
      if (!gameRunning && !gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.fillStyle = "white"
        ctx.font = "30px Arial"
        ctx.textAlign = "center"
        ctx.fillText("GoHigh", canvas.width / 2, canvas.height / 2 - 60)

        ctx.font = "16px Arial"
        ctx.fillText("화면 좌우를 터치하여 우주선을 조종하세요!", canvas.width / 2, canvas.height / 2 - 20)
        ctx.fillText("소행성을 피하고 가능한 높이 올라가세요!", canvas.width / 2, canvas.height / 2 + 10)

        ctx.fillStyle = "#4ade80"
        ctx.fillRect(canvas.width / 2 - 60, canvas.height / 2 + 40, 120, 40)

        ctx.fillStyle = "white"
        ctx.font = "16px Arial"
        ctx.fillText("게임 시작", canvas.width / 2, canvas.height / 2 + 65)
      }
    }

    // Update game state
    const update = () => {
      if (!gameRunning) return

      // Update score (based on how high the spacecraft has gone)
      score += speed

      // Update background offset (creates scrolling effect)
      backgroundOffset += speed

      // Update power-up timers
      if (shieldActive) {
        shieldTime--
        if (shieldTime <= 0) {
          shieldActive = false
        }
      }

      if (boostActive) {
        boostTime--
        if (boostTime <= 0) {
          boostActive = false
          speed = Math.max(2, speed / 1.5)
        }
      }

      // Add new asteroids randomly
      if (Math.random() < 0.02 + score / 100000) {
        asteroids.push({
          x: Math.random() * canvas.width,
          y: -50,
          radius: 15 + Math.random() * 20,
          speed: 1 + Math.random() * 2,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.05,
        })
      }

      // Add power-ups occasionally
      if (Math.random() < 0.002) {
        powerUps.push({
          x: Math.random() * (canvas.width - 40) + 20,
          y: -30,
          type: Math.random() > 0.5 ? "shield" : "boost",
          radius: 15,
          collected: false,
        })
      }

      // Update asteroids
      for (let i = 0; i < asteroids.length; i++) {
        asteroids[i].y += asteroids[i].speed
        asteroids[i].rotation += asteroids[i].rotationSpeed

        // Remove asteroids that are off-screen
        if (asteroids[i].y > canvas.height + 50) {
          asteroids.splice(i, 1)
          i--
        }
      }

      // Update power-ups
      for (let i = 0; i < powerUps.length; i++) {
        powerUps[i].y += 2

        // Check if power-up is collected
        if (!powerUps[i].collected) {
          const dx = powerUps[i].x - spacecraft.x
          const dy = powerUps[i].y - spacecraft.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < powerUps[i].radius + spacecraft.width / 2) {
            powerUps[i].collected = true

            // Apply power-up effect
            if (powerUps[i].type === "shield") {
              shieldActive = true
              shieldTime = 600 // 10 seconds at 60fps
            } else if (powerUps[i].type === "boost") {
              boostActive = true
              boostTime = 300 // 5 seconds at 60fps
              speed *= 1.5
            }

            // Create collection effect
            createExplosion(powerUps[i].x, powerUps[i].y, powerUps[i].type === "shield" ? "#60a5fa" : "#f97316")
          }
        }

        // Remove power-ups that are off-screen
        if (powerUps[i].y > canvas.height + 30) {
          powerUps.splice(i, 1)
          i--
        }
      }

      // Update particles
      for (let i = 0; i < particles.length; i++) {
        particles[i].x += particles[i].vx
        particles[i].y += particles[i].vy
        particles[i].life--

        if (particles[i].life <= 0) {
          particles.splice(i, 1)
          i--
        }
      }

      // Check for collisions with asteroids
      for (const asteroid of asteroids) {
        const dx = asteroid.x - spacecraft.x
        const dy = asteroid.y - spacecraft.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < asteroid.radius + spacecraft.width / 2) {
          // If shield is active, destroy the asteroid instead
          if (shieldActive) {
            createExplosion(asteroid.x, asteroid.y, "#a3a3a3")
            const index = asteroids.indexOf(asteroid)
            if (index !== -1) {
              asteroids.splice(index, 1)
            }
            continue
          }

          // Game over
          gameRunning = false
          gameOver = true

          // Update high score
          if (score > highScore) {
            highScore = score
          }

          // Create explosion
          createExplosion(spacecraft.x, spacecraft.y, spacecraft.color)

          return
        }
      }

      // Increase difficulty over time
      if (score % 1000 === 0) {
        speed += 0.01
      }
    }

    // Game loop
    let lastTime = 0
    const gameLoop = (timestamp: number) => {
      const deltaTime = timestamp - lastTime
      lastTime = timestamp

      if (deltaTime < 160) {
        // Skip huge deltas (e.g. when tab is inactive)
        update()
      }

      draw()
      requestAnimationFrame(gameLoop)
    }

    // Start game loop
    requestAnimationFrame(gameLoop)

    // Handle keyboard input
    const keys: { [key: string]: boolean } = {}

    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.key] = true
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.key] = false
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    // Game input processing
    const processInput = () => {
      if (!gameRunning) return

      // Move spacecraft based on key input
      if (keys["ArrowLeft"] || keys["a"]) {
        spacecraft.x -= spacecraft.speed
      }
      if (keys["ArrowRight"] || keys["d"]) {
        spacecraft.x += spacecraft.speed
      }

      // Keep spacecraft within canvas bounds
      spacecraft.x = Math.max(spacecraft.width / 2, Math.min(canvas.width - spacecraft.width / 2, spacecraft.x))
    }

    // Set up input processing interval
    const inputInterval = setInterval(processInput, 16)

    // Handle mouse/touch input
    const handleClick = (e: MouseEvent) => {
      // Check if click is on restart button
      if (gameOver) {
        const buttonX = canvas.width / 2 - 60
        const buttonY = canvas.height / 2 + 40
        const buttonWidth = 120
        const buttonHeight = 40

        if (
          e.offsetX >= buttonX &&
          e.offsetX <= buttonX + buttonWidth &&
          e.offsetY >= buttonY &&
          e.offsetY <= buttonY + buttonHeight
        ) {
          initGame()
          return
        }
      }

      // Check if click is on start button
      if (!gameRunning && !gameOver) {
        const buttonX = canvas.width / 2 - 60
        const buttonY = canvas.height / 2 + 40
        const buttonWidth = 120
        const buttonHeight = 40

        if (
          e.offsetX >= buttonX &&
          e.offsetX <= buttonX + buttonWidth &&
          e.offsetY >= buttonY &&
          e.offsetY <= buttonY + buttonHeight
        ) {
          initGame()
          return
        }
      }

      // Move spacecraft based on click position
      if (gameRunning) {
        if (e.offsetX < canvas.width / 2) {
          // Move left
          spacecraft.x -= spacecraft.speed * 5
        } else {
          // Move right
          spacecraft.x += spacecraft.speed * 5
        }

        // Keep spacecraft within canvas bounds
        spacecraft.x = Math.max(spacecraft.width / 2, Math.min(canvas.width - spacecraft.width / 2, spacecraft.x))
      }
    }

    // Handle touch input
    const handleTouch = (e: TouchEvent) => {
      e.preventDefault()

      if (!gameRunning) {
        // Check if touch is on start/restart button
        const touch = e.touches[0]
        const rect = canvas.getBoundingClientRect()
        const touchX = touch.clientX - rect.left
        const touchY = touch.clientY - rect.top

        const buttonX = canvas.width / 2 - 60
        const buttonY = canvas.height / 2 + 40
        const buttonWidth = 120
        const buttonHeight = 40

        if (
          touchX >= buttonX &&
          touchX <= buttonX + buttonWidth &&
          touchY >= buttonY &&
          touchY <= buttonY + buttonHeight
        ) {
          if (gameOver || (!gameRunning && !gameOver)) {
            initGame()
            return
          }
        }
      } else {
        // Move spacecraft based on touch position
        const touch = e.touches[0]
        const rect = canvas.getBoundingClientRect()
        const touchX = touch.clientX - rect.left

        if (touchX < canvas.width / 2) {
          // Move left
          spacecraft.x -= spacecraft.speed * 3
        } else {
          // Move right
          spacecraft.x += spacecraft.speed * 3
        }

        // Keep spacecraft within canvas bounds
        spacecraft.x = Math.max(spacecraft.width / 2, Math.min(canvas.width - spacecraft.width / 2, spacecraft.x))
      }
    }

    canvas.addEventListener("click", handleClick)
    canvas.addEventListener("touchstart", handleTouch)
    canvas.addEventListener("touchmove", handleTouch)

    // Clean up
    return () => {
      window.removeEventListener("resize", updateCanvasSize)
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
      canvas.removeEventListener("click", handleClick)
      canvas.removeEventListener("touchstart", handleTouch)
      canvas.removeEventListener("touchmove", handleTouch)
      clearInterval(inputInterval)
    }
  }, [])

  return (
    <div className="flex items-center justify-center w-full h-screen bg-gray-900">
      <div className="w-[90%] h-full flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="border-2 border-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20 max-h-[90vh]"
        />
      </div>
    </div>
  )
}

