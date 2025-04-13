import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart, Trophy, Zap } from "lucide-react"

// 게임 상태 타입
type GameState = "idle" | "playing" | "game-over"

export default function FlyToTheSky() {
  // 게임 상태
  const [gameState, setGameState] = useState<GameState>("idle")
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [hp, setHp] = useState(3)
  const [speedBoost, setSpeedBoost] = useState(false)
  const [gameSpeed, setGameSpeed] = useState(5)

  // 캔버스 및 게임 루프 참조
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>(0)
  const gameSpeedRef = useRef(gameSpeed)

  // 게임 객체
  const gameRef = useRef({
    // 플레이어
    player: {
      x: 100,
      y: 200,
      width: 60,
      height: 30,
      velocityY: 0,
      isHit: false,
      hitTimer: 0,
    },
    // 장애물
    obstacles: [] as {
      x: number
      topHeight: number
      bottomHeight: number
      width: number
      passed: boolean
    }[],
    // 아이템
    items: [] as {
      x: number
      y: number
      type: "heal" | "speed"
      width: number
      height: number
      collected: boolean
    }[],
    // 게임 설정
    settings: {
      obstacleInterval: 200,
      lastObstacleX: 0,
      distance: 0,
      canvasHeight: 400,
      canvasWidth: 800,
      lastSpeedIncreaseScore: 0, // 마지막 속도 증가 점수
    },
    // 키 입력 상태
    keys: {
      ArrowUp: false,
      ArrowDown: false,
    },
  })

  // 로컬 스토리지에서 최고 점수 로드
  useEffect(() => {
    const savedHighScore = localStorage.getItem("flyToTheSkyHighScore")
    if (savedHighScore !== null) {
      setHighScore(Number.parseInt(savedHighScore))
    }
  }, [])

  //gameSpeed가 바뀔 때마다 ref도 업데이트
  useEffect(() => {
    gameSpeedRef.current = gameSpeed
  }, [gameSpeed])

  // 캔버스 크기 설정
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current && containerRef.current) {
        const containerWidth = containerRef.current.clientWidth
        canvasRef.current.width = containerWidth
        gameRef.current.settings.canvasWidth = containerWidth
      }
    }

    window.addEventListener("resize", updateCanvasSize)
    updateCanvasSize()

    return () => {
      window.removeEventListener("resize", updateCanvasSize)
    }
  }, [])

  // 키보드 이벤트 리스너
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        gameRef.current.keys[e.key as keyof typeof gameRef.current.keys] = true
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        gameRef.current.keys[e.key as keyof typeof gameRef.current.keys] = false
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  // 게임 루프 관리
  useEffect(() => {
    if (gameState === "playing") {
      // 게임 시작 시 애니메이션 프레임 요청
      animationRef.current = requestAnimationFrame(gameLoop)
    } else {
      // 게임 중단 시 애니메이션 프레임 취소
      cancelAnimationFrame(animationRef.current)
    }

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [gameState])

  // 점수에 따른 속도 증가 감지
  useEffect(() => {
    if (gameState === "playing") {
      // 200점마다 속도 증가
      if (score >= 100 && score % 100 === 0 && score !== gameRef.current.settings.lastSpeedIncreaseScore) {
        // 속도 증가 로직
        // const newSpeed = gameRef.current.settings.baseSpeed + Math.floor(score / 200) * 0.5
        setGameSpeed(prev => prev + 0.5)
        gameRef.current.settings.lastSpeedIncreaseScore = score
      }
    }
  }, [score, gameState])

  // 게임 오버 시 최고 점수 업데이트를 위한 useEffect 추가
useEffect(() => {
  if (gameState === "game-over" && score > highScore) {
    localStorage.setItem("flyToTheSkyHighScore", score.toString())
    setHighScore(score)
    console.log("최고 점수 저장됨:", score)
  }
}, [gameState, score, highScore]);

  // 게임 초기화
  const initGame = () => {
    // 게임 객체 초기화
    gameRef.current = {
      player: {
        x: 100,
        y: 200,
        width: 60,
        height: 30,
        velocityY: 0,
        isHit: false,
        hitTimer: 0,
      },
      obstacles: [],
      items: [],
      settings: {
        obstacleInterval: 200,
        lastObstacleX: 0,
        distance: 0,
        canvasHeight: 400,
        canvasWidth: canvasRef.current?.width || 800,
        lastSpeedIncreaseScore: 0,
      },
      keys: {
        ArrowUp: false,
        ArrowDown: false,
      },
    }

    // 상태 초기화
    setScore(0)
    setHp(3)
    setSpeedBoost(false)
    setGameSpeed(5) // 초기 게임 속도 설정
    setGameState("playing")
  }

  // 게임 루프
  const gameLoop = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // const game = gameRef.current

    // 캔버스 초기화
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 배경 그리기
    drawBackground(ctx, canvas)

    // 플레이어 업데이트
    updatePlayer()

    // 장애물 업데이트
    updateObstacles(canvas)

    // 아이템 업데이트
    updateItems(canvas)

    // 충돌 감지
    detectCollisions(canvas)

    // 게임 상태 업데이트
    updateGameState()

    // 플레이어 그리기
    drawPlayer(ctx)

    // 장애물 그리기
    drawObstacles(ctx)

    // 아이템 그리기
    drawItems(ctx)

    // 다음 프레임 요청 (게임 상태가 playing일 때만)
    if (gameState === "playing") {
      animationRef.current = requestAnimationFrame(gameLoop)
    }
  }

  // 배경 그리기
  const drawBackground = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const game = gameRef.current

    // 하늘 배경
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    skyGradient.addColorStop(0, "#87CEEB")
    skyGradient.addColorStop(1, "#E0F7FF")
    ctx.fillStyle = skyGradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 구름 그리기
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
    const cloudPositions = [
      { x: (100 - game.settings.distance * 0.1) % canvas.width, y: 50, r: 30 },
      { x: (300 - game.settings.distance * 0.05) % canvas.width, y: 80, r: 40 },
      { x: (600 - game.settings.distance * 0.08) % canvas.width, y: 60, r: 35 },
    ]

    cloudPositions.forEach((cloud) => {
      ctx.beginPath()
      ctx.arc(cloud.x, cloud.y, cloud.r, 0, Math.PI * 2)
      ctx.arc(cloud.x + 20, cloud.y - 10, cloud.r - 10, 0, Math.PI * 2)
      ctx.arc(cloud.x + 40, cloud.y, cloud.r - 5, 0, Math.PI * 2)
      ctx.fill()
    })
  }

  // 플레이어 업데이트
  const updatePlayer = () => {
    const game = gameRef.current
    const player = game.player
    const canvas = canvasRef.current
    if (!canvas) return

    // 키 입력에 따른 이동
    if (game.keys.ArrowUp) {
      player.velocityY = -5 // 위로 이동
    } else if (game.keys.ArrowDown) {
      player.velocityY = 5 // 아래로 이동
    } else {
      player.velocityY = 0 // 키를 누르지 않으면 현재 위치 유지
    }

    // 위치 업데이트
    player.y += player.velocityY

    // 화면 경계 체크
    if (player.y < 0) {
      player.y = 0
    }
    if (player.y + player.height > canvas.height) {
      player.y = canvas.height - player.height
    }

    // 충돌 깜빡임 효과 업데이트
    if (player.isHit) {
      player.hitTimer++
      if (player.hitTimer > 30) {
        player.isHit = false
        player.hitTimer = 0
      }
    }
  }

  // 장애물 업데이트
  const updateObstacles = (canvas: HTMLCanvasElement) => {
    const game = gameRef.current
    const obstacles = game.obstacles
    const settings = game.settings

    // 새 장애물 생성
    if (
      settings.lastObstacleX === 0 ||
      canvas.width - (settings.lastObstacleX - settings.distance) > settings.obstacleInterval
    ) {
      const gapHeight = 150 // 장애물 사이 간격
      const minHeight = 50 // 최소 기둥 높이
      const maxTopHeight = canvas.height - gapHeight - minHeight
      const topHeight = Math.floor(Math.random() * (maxTopHeight - minHeight)) + minHeight
      const bottomHeight = canvas.height - topHeight - gapHeight

      obstacles.push({
        x: canvas.width + settings.distance,
        topHeight,
        bottomHeight,
        width: 60,
        passed: false,
      })

      settings.lastObstacleX = canvas.width + settings.distance
    }

    // 장애물 이동 및 제거
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const obstacle = obstacles[i]
      const obstacleScreenX = obstacle.x - settings.distance

      // 화면 밖으로 나간 장애물 제거
      if (obstacleScreenX + obstacle.width < 0) {
        obstacles.splice(i, 1)
        continue
      }

      // 점수 계산 (장애물 통과 시)
      if (!obstacle.passed && obstacleScreenX + obstacle.width < game.player.x) {
        obstacle.passed = true
        setScore((prev) => prev + 10)
      }
    }
  }

  // 아이템 업데이트
  const updateItems = (canvas: HTMLCanvasElement) => {
    const game = gameRef.current
    const items = game.items
    const settings = game.settings

    // 랜덤하게 아이템 생성 (0.5% 확률)
    if (Math.random() < 0.005 && items.length < 3) {
      const itemType = Math.random() < 0.5 ? "heal" : "speed"
      const itemY = Math.random() * (canvas.height - 40)

      items.push({
        x: canvas.width + settings.distance,
        y: itemY,
        type: itemType,
        width: 30,
        height: 30,
        collected: false,
      })
    }

    // 아이템 이동 및 제거
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i]
      const itemScreenX = item.x - settings.distance

      // 화면 밖으로 나간 아이템 제거
      if (itemScreenX + item.width < 0 || item.collected) {
        items.splice(i, 1)
      }
    }
  }

  // 충돌 감지
  const detectCollisions = (canvas: HTMLCanvasElement) => {
    const game = gameRef.current
    const player = game.player
    const obstacles = game.obstacles
    const items = game.items
    const settings = game.settings

    // 플레이어가 이미 충돌 상태면 무적 시간 동안 충돌 무시
    if (player.isHit) {
      return
    }

    // 장애물 충돌 감지
    for (const obstacle of obstacles) {
      const obstacleScreenX = obstacle.x - settings.distance

      // 충돌 감지 (상단 기둥)
      if (
        player.x + player.width > obstacleScreenX &&
        player.x < obstacleScreenX + obstacle.width &&
        player.y < obstacle.topHeight
      ) {
        handleCollision()
        break
      }

      // 충돌 감지 (하단 기둥)
      if (
        player.x + player.width > obstacleScreenX &&
        player.x < obstacleScreenX + obstacle.width &&
        player.y + player.height > canvas.height - obstacle.bottomHeight
      ) {
        handleCollision()
        break
      }
    }

    // 아이템 충돌 감지
    for (const item of items) {
      if (item.collected) continue

      const itemScreenX = item.x - settings.distance

      if (
        player.x + player.width > itemScreenX &&
        player.x < itemScreenX + item.width &&
        player.y + player.height > item.y &&
        player.y < item.y + item.height
      ) {
        // 아이템 효과 적용
        if (item.type === "heal") {
          setHp((prev) => Math.min(prev + 1, 5))
        } else if (item.type === "speed") {
          setGameSpeed(prev=>prev+5)
          setSpeedBoost(true)
          // 속도 부스트 효과 5초 후 해제
          setTimeout(() => {
            setGameSpeed(prev => prev-5)
            setSpeedBoost(false)
          }, 3000)
        }

        item.collected = true
      }
    }
  }

  // 충돌 처리
  const handleCollision = () => {
    const player = gameRef.current.player

    // 이미 충돌 상태면 무시
    if (player.isHit) {
      return
    }

    // 충돌 시 HP 감소 및 시각적 피드백
    player.isHit = true
    player.hitTimer = 0

    // HP 감소 및 게임 오버 체크
    setHp((prev) => {
      const newHp = prev - 1
      if (newHp <= 0) {
        // HP가 0이 되면 게임 오버 처리
        handleGameOver()
        return 0
      }
      return newHp
    })
  }

  // 게임 오버 처리
  const handleGameOver = () => {
    // 게임 오버 상태 설정
    console.log("게임 오버! 점수:", score)
    setGameState("game-over")

    // 최고 점수 업데이트
    // if (score > highScore) {
    //   localStorage.setItem("flyToTheSkyHighScore", score.toString())
    //   setHighScore(score)
    //   console.log("최고 점수 저장됨:", score)
    // }
  }

  // 게임 상태 업데이트
  const updateGameState = () => {
    const game = gameRef.current
    const settings = game.settings

    // 현재 속도 계산 (속도 부스트 적용)
    const currentSpeed = speedBoost ? gameSpeedRef.current + 10 : gameSpeedRef.current

    // 거리 업데이트
    settings.distance += currentSpeed
  }

  // 플레이어 그리기
  const drawPlayer = (ctx: CanvasRenderingContext2D) => {
    const player = gameRef.current.player

    // 충돌 시 깜빡임 효과
    if (player.isHit && player.hitTimer % 6 < 3) {
      return // 깜빡임 효과를 위해 일부 프레임에서는 그리지 않음
    }

    // 비행기 몸체
    ctx.fillStyle = "#3498db"
    ctx.beginPath()
    ctx.moveTo(player.x + player.width, player.y + player.height / 2)
    ctx.lineTo(player.x, player.y + player.height)
    ctx.lineTo(player.x, player.y)
    ctx.closePath()
    ctx.fill()

    // 비행기 날개
    ctx.fillStyle = "#2980b9"
    ctx.beginPath()
    ctx.moveTo(player.x + player.width * 0.3, player.y + player.height * 0.2)
    ctx.lineTo(player.x + player.width * 0.5, player.y - player.height * 0.3)
    ctx.lineTo(player.x + player.width * 0.7, player.y + player.height * 0.2)
    ctx.closePath()
    ctx.fill()

    // 비행기 꼬리
    ctx.fillStyle = "#2980b9"
    ctx.beginPath()
    ctx.moveTo(player.x + player.width * 0.1, player.y + player.height * 0.3)
    ctx.lineTo(player.x, player.y - player.height * 0.2)
    ctx.lineTo(player.x + player.width * 0.2, player.y + player.height * 0.3)
    ctx.closePath()
    ctx.fill()

    // 속도 부스트 효과
    if (speedBoost) {
      ctx.fillStyle = "#e74c3c"
      ctx.beginPath()
      ctx.moveTo(player.x, player.y + player.height * 0.3)
      ctx.lineTo(player.x - 20, player.y + player.height * 0.5)
      ctx.lineTo(player.x, player.y + player.height * 0.7)
      ctx.closePath()
      ctx.fill()
    }
  }

  // 장애물 그리기
  const drawObstacles = (ctx: CanvasRenderingContext2D) => {
    const game = gameRef.current
    const obstacles = game.obstacles
    const settings = game.settings

    ctx.fillStyle = "#27ae60"

    for (const obstacle of obstacles) {
      const obstacleScreenX = obstacle.x - settings.distance

      // 상단 기둥
      ctx.fillRect(obstacleScreenX, 0, obstacle.width, obstacle.topHeight)

      // 상단 기둥 끝부분
      ctx.fillStyle = "#2ecc71"
      ctx.fillRect(obstacleScreenX - 10, obstacle.topHeight - 20, obstacle.width + 20, 20)
      ctx.fillStyle = "#27ae60"

      // 하단 기둥
      const bottomY = ctx.canvas.height - obstacle.bottomHeight
      ctx.fillRect(obstacleScreenX, bottomY, obstacle.width, obstacle.bottomHeight)

      // 하단 기둥 끝부분
      ctx.fillStyle = "#2ecc71"
      ctx.fillRect(obstacleScreenX - 10, bottomY, obstacle.width + 20, 20)
      ctx.fillStyle = "#27ae60"
    }
  }

  // 아이템 그리기
  const drawItems = (ctx: CanvasRenderingContext2D) => {
    const game = gameRef.current
    const items = game.items
    const settings = game.settings

    for (const item of items) {
      if (item.collected) continue

      const itemScreenX = item.x - settings.distance

      if (item.type === "heal") {
        // 체력 회복 아이템 (하트)
        ctx.fillStyle = "#e74c3c"
        const x = itemScreenX + item.width / 2
        const y = item.y + item.height / 2

        // 하트 그리기
        const size = item.width / 2
        ctx.beginPath()
        ctx.moveTo(x, y - size / 4)
        ctx.bezierCurveTo(x, y - size / 2, x - size / 2, y - size / 2, x - size / 2, y - size / 4)
        ctx.bezierCurveTo(x - size / 2, y + size / 4, x, y + size / 2, x, y + size / 2)
        ctx.bezierCurveTo(x, y + size / 2, x + size / 2, y + size / 4, x + size / 2, y - size / 4)
        ctx.bezierCurveTo(x + size / 2, y - size / 2, x, y - size / 2, x, y - size / 4)
        ctx.fill()
      } else if (item.type === "speed") {
        // 속도 부스트 아이템 (번개)
        ctx.fillStyle = "#f39c12"
        const x = itemScreenX + item.width / 2
        const y = item.y + item.height / 2

        // 번개 그리기
        const size = item.width / 2
        ctx.beginPath()
        ctx.moveTo(x - size / 3, y - size)
        ctx.lineTo(x + size / 3, y - size / 3)
        ctx.lineTo(x, y)
        ctx.lineTo(x + size / 3, y)
        ctx.lineTo(x - size / 3, y + size)
        ctx.lineTo(x, y + size / 3)
        ctx.lineTo(x - size / 3, y + size / 3)
        ctx.closePath()
        ctx.fill()
      }
    }
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto p-4 text-white">
      <div className="flex items-center justify-between w-full mb-4">
        <div className="text-lg font-bold">Be the good pilot</div>
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <span className="mr-2">점수:</span>
            <span className="font-bold text-lg">{score}</span>
          </div>
          <div className="flex items-center">
            <Trophy className="w-5 h-5 mr-1" />
            <span>{highScore}</span>
          </div>
        </div>
      </div>

      {/* HP 표시 UI */}
      <div className="flex items-center mb-2 w-full">
        <span className="mr-2">HP:</span>
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Heart key={i} className={`w-6 h-6 ${i < hp ? "text-red-500 fill-red-500" : "text-gray-300"}`} />
          ))}
        </div>
        {speedBoost && (
          <div className="ml-auto flex items-center">
            <Zap className="w-5 h-5 text-yellow-500 mr-1 fill-yellow-500" />
            <span className="text-yellow-500 font-bold">속도 부스트!</span>
          </div>
        )}
      </div>

      {/* 게임 속도 표시 */}
      <div className="flex items-center mb-2 w-full">
        <span className="mr-2">게임 속도:</span>
        <div className="h-3 bg-gray-200 rounded-full w-32">
          <div
            className="h-3 bg-blue-500 rounded-full"
            style={{ width: `${Math.min(100, (gameSpeed / 3) * 50)}%` }}
          ></div>
        </div>
        <span className="ml-2 text-sm">{gameSpeed}</span>
        <span className="ml-2 text-sm">{gameSpeed.toFixed(1)}x</span>
      </div>

      <div ref={containerRef} className="relative w-full border border-gray-300 rounded-lg overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          height={400} // 고정 높이
          className="w-full" // 너비만 반응형
        />

        {gameState === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 text-white">
            <h2 className="text-3xl font-bold mb-4">FlyToTheSky</h2>
            <p className="mb-2">위/아래 화살표 키로 비행기를 조종하세요</p>
            <p className="mb-2">장애물을 피하고 아이템을 모아 최대한 오래 생존하세요!</p>
            <div className="flex gap-4 mt-4">
              <div className="flex flex-col items-center">
                <Heart className="w-8 h-8 text-red-500 fill-red-500 mb-2" />
                <span>체력 회복</span>
              </div>
              <div className="flex flex-col items-center">
                <Zap className="w-8 h-8 text-yellow-500 fill-yellow-500 mb-2" />
                <span>속도 부스트</span>
              </div>
            </div>
            <Button className="mt-6" onClick={initGame}>
              게임 시작
            </Button>
          </div>
        )}

        {gameState === "game-over" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 text-white">
            <h2 className="text-3xl font-bold mb-4">게임 오버!</h2>
            <p className="text-xl mb-6">최종 점수: {score}</p>
            <Button onClick={initGame} className="px-8 py-2">
              다시 시작
            </Button>
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>조작 방법: 위/아래 화살표 키로 비행기를 조종하세요</p>
        <p>목표: 장애물을 피하고 아이템을 모아 최대한 높은 점수를 획득하세요</p>
      </div>
    </div>
  )
}
