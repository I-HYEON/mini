import { useEffect, useRef, useState } from "react"

export default function RunAway() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [highScore, setHighScore] = useState<number>(0)
  const gameStateRef = useRef({
    gameRunning: false,
    gameOver: false,
    score: 0,
    speed: 5,
    lastTime: 0,
    frameId: 0,
    groundHeight: 50,
    player: {
      x: 50,
      y: 300,
      width: 30,
      height: 30,
      jumping: false,
      jumpPower: 15,
      gravity: 0.8,
      velocity: 0,
      color: "#ff4d4d",
    },
    obstacles: [] as { x: number; width: number; height: number }[],
    buildings: [] as { x: number; width: number; height: number; color: string }[],
    clouds: [] as { x: number; y: number; radius: number }[]
  })

  useEffect(() => {
    // 로컬 스토리지에서 최고 점수 불러오기
    const savedHighScore = localStorage.getItem('runawayHighScore')
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10))
      gameStateRef.current.speed = Math.min(5 + Math.floor(parseInt(savedHighScore, 10) / 500) * 0.5, 15)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // 캔버스 크기 설정
    const updateCanvasSize = () => {
      canvas.width = Math.min(1000, window.innerWidth * 0.9)
      canvas.height = 500
    }

    updateCanvasSize()
    window.addEventListener("resize", updateCanvasSize)

    // 게임 관련 변수들
    const gameState = gameStateRef.current

    // 색상 배열 (메모리 최적화를 위해 함수 외부로 이동)
    const buildingColors = ["#2563eb", "#4f46e5", "#7c3aed", "#9333ea", "#c026d3", "#db2777", "#e11d48"]
    
    // 랜덤 색상 생성
    const getRandomColor = () => {
      return buildingColors[Math.floor(Math.random() * buildingColors.length)]
    }

    // 게임 요소 초기화
    const initGame = () => {
      // 게임 상태 초기화
      gameState.gameRunning = true
      gameState.gameOver = false
      gameState.score = 0
      gameState.speed = 5

      // 플레이어 초기화
      gameState.player.y = canvas.height - 100
      gameState.player.velocity = 0
      gameState.player.jumping = false

      // 장애물 제거
      gameState.obstacles = []

      // 첫 장애물 생성
      gameState.obstacles.push({
        x: canvas.width,
        width: 30,
        height: 50,
      })

      // 건물 생성
      gameState.buildings = []
      for (let i = 0; i < 5; i++) {
        gameState.buildings.push({
          x: i * 200,
          width: 100 + Math.random() * 100,
          height: 100 + Math.random() * 150,
          color: getRandomColor(),
        })
      }

      // 구름 생성
      gameState.clouds = []
      for (let i = 0; i < 5; i++) {
        gameState.clouds.push({
          x: Math.random() * canvas.width,
          y: 50 + Math.random() * 100,
          radius: 20 + Math.random() * 30,
        })
      }
    }

    // 게임 요소 그리기
    const draw = () => {
      // 캔버스 초기화
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 하늘 그라디언트 그리기
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, "#87CEEB")
      gradient.addColorStop(1, "#1E90FF")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 구름 그리기
      ctx.fillStyle = "#FFFFFF"
      gameState.clouds.forEach((cloud) => {
        ctx.beginPath()
        ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2)
        ctx.fill()

        ctx.beginPath()
        ctx.arc(cloud.x + cloud.radius * 0.5, cloud.y - cloud.radius * 0.2, cloud.radius * 0.7, 0, Math.PI * 2)
        ctx.fill()

        ctx.beginPath()
        ctx.arc(cloud.x - cloud.radius * 0.5, cloud.y, cloud.radius * 0.6, 0, Math.PI * 2)
        ctx.fill()
      })

      // 건물 그리기
      gameState.buildings.forEach((building) => {
        ctx.fillStyle = building.color
        ctx.fillRect(building.x, canvas.height - building.height, building.width, building.height)

        // 창문 그리기
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
        const windowSize = 10
        const windowGap = 15

        // 창문 그리기를 효율적으로 수행
        const startY = canvas.height - building.height + 20
        const endY = canvas.height - 20
        const startX = building.x + 15
        const endX = building.x + building.width - 15
        
        for (let y = startY; y < endY; y += windowGap) {
          for (let x = startX; x < endX; x += windowGap) {
            ctx.fillRect(x, y, windowSize, windowSize)
          }
        }
      })

      // 땅 그리기
      ctx.fillStyle = "#4CAF50"
      ctx.fillRect(0, canvas.height - 50, canvas.width, 50)

      // 플레이어 그리기 (더 매끄러운 스타일)
      const player = gameState.player
      ctx.fillStyle = player.color
      
      // 바디
      ctx.beginPath()
      ctx.roundRect(player.x, player.y, player.width, player.height, 5)
      ctx.fill()
      
      // 눈 그리기
      ctx.fillStyle = "white"
      ctx.beginPath()
      ctx.arc(player.x + player.width - 10, player.y + 10, 4, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.beginPath()
      ctx.arc(player.x + player.width - 20, player.y + 10, 4, 0, Math.PI * 2)
      ctx.fill()
      
      // 눈동자
      ctx.fillStyle = "black"
      ctx.beginPath()
      ctx.arc(player.x + player.width - 10, player.y + 10, 2, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.beginPath()
      ctx.arc(player.x + player.width - 20, player.y + 10, 2, 0, Math.PI * 2)
      ctx.fill()

      // 장애물 그리기
      ctx.fillStyle = "#8B4513"
      gameState.obstacles.forEach((obstacle) => {
        // 더 매끄러운 장애물 모양
        ctx.beginPath()
        ctx.roundRect(obstacle.x, canvas.height - gameState.groundHeight - obstacle.height, obstacle.width, obstacle.height, 5)
        ctx.fill()
        
        // 질감 추가
        ctx.strokeStyle = "#6B2F0D"
        ctx.lineWidth = 2
        ctx.beginPath()
        for (let y = canvas.height - gameState.groundHeight - obstacle.height + 10; y < canvas.height - gameState.groundHeight; y += 15) {
          ctx.moveTo(obstacle.x, y)
          ctx.lineTo(obstacle.x + obstacle.width, y)
        }
        ctx.stroke()
      })

      // 점수 그리기
      ctx.fillStyle = "white"
      ctx.font = "20px Arial"
      ctx.textAlign = "left"
      ctx.fillText(`점수: ${gameState.score}`, 20, 30)
      
      // 최고 점수 표시
      ctx.fillText(`최고 점수: ${highScore}`, 20, 60)

      // 게임 오버 화면
      if (gameState.gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.fillStyle = "white"
        ctx.font = "30px Arial"
        ctx.textAlign = "center"
        ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 60)

        ctx.font = "20px Arial"
        ctx.fillText(`점수: ${gameState.score}`, canvas.width / 2, canvas.height / 2 - 20)
        
        // 새 기록 달성 표시
        if (gameState.score > highScore) {
          ctx.fillStyle = "#FFD700"
          ctx.font = "24px Arial"
          ctx.fillText("새 기록 달성!", canvas.width / 2, canvas.height / 2 + 10)
          ctx.fillStyle = "white"
        } else {
          ctx.fillText(`최고 점수: ${highScore}`, canvas.width / 2, canvas.height / 2 + 10)
        }

        // 다시 시작 버튼
        ctx.fillStyle = "#000000"
        ctx.beginPath()
        ctx.roundRect(canvas.width / 2 - 60, canvas.height / 2 + 40, 120, 40, 8)
        ctx.fill()

        ctx.fillStyle = "white"
        ctx.font = "16px Arial"
        ctx.fillText("다시 시작", canvas.width / 2, canvas.height / 2 + 65)
        
        // 단축키 안내
        ctx.font = "14px Arial"
        ctx.fillText("Space 키를 눌러 다시 시작", canvas.width / 2, canvas.height / 2 + 100)
      }

      // 시작 화면
      if (!gameState.gameRunning && !gameState.gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.fillStyle = "white"
        ctx.font = "36px Arial"
        ctx.textAlign = "center"
        ctx.fillText("RunAway", canvas.width / 2, canvas.height / 2 - 60)

        ctx.font = "16px Arial"
        ctx.fillText("화면을 클릭하거나 스페이스바를 눌러 점프하세요!", canvas.width / 2, canvas.height / 2)
        
        if (highScore > 0) {
          ctx.fillText(`최고 점수: ${highScore}`, canvas.width / 2, canvas.height / 2 + 30)
        }

        // 시작 버튼
        ctx.fillStyle = "#000000"
        ctx.beginPath()
        ctx.roundRect(canvas.width / 2 - 60, canvas.height / 2 + 60, 120, 40, 8)
        ctx.fill()

        ctx.fillStyle = "white"
        ctx.font = "18px Arial"
        ctx.fillText("게임 시작", canvas.width / 2, canvas.height / 2 + 85)
      }
    }

    // 게임 상태 업데이트
    const update = () => {
      if (!gameState.gameRunning) return

      // 점수 업데이트
      gameState.score++

      // 점진적으로 속도 증가
      if (gameState.score % 300 === 0) {
        gameState.speed += 0.5
      }
      

      // 플레이어 업데이트
      if (gameState.player.jumping) {
        gameState.player.velocity += gameState.player.gravity
        gameState.player.y += gameState.player.velocity

        // 플레이어가 착지했는지 확인
        if (gameState.player.y >= canvas.height - 100) {
          gameState.player.y = canvas.height - 100
          gameState.player.jumping = false
          gameState.player.velocity = 0
        }
      }

      // 장애물 업데이트
      for (let i = 0; i < gameState.obstacles.length; i++) {
        gameState.obstacles[i].x -= gameState.speed

        // 화면 밖으로 나간 장애물 제거
        if (gameState.obstacles[i].x + gameState.obstacles[i].width < 0) {
          gameState.obstacles.splice(i, 1)
          i--
        }
      }

      // 새 장애물 추가 (난이도에 따라 빈도 조절)
      if (gameState.obstacles.length < 3) {
        const minGap = 300 - gameState.speed * 10 // 속도가 증가함에 따라 간격이 줄어듦
        const lastObstacle = gameState.obstacles[gameState.obstacles.length - 1]
        const obstacleChance = 0.01 + (gameState.score / 10000) * 0.01 // 점수에 따라 장애물 발생 확률 증가
        
        if ((!lastObstacle || canvas.width - lastObstacle.x > minGap) && Math.random() < obstacleChance) {
          // 점수에 따라 장애물 크기 다양화
          const obstacleHeight = 30 + Math.random() * (70 + Math.min(gameState.score / 1000 * 10, 50))
          
          gameState.obstacles.push({
            x: canvas.width,
            width: 20 + Math.random() * 30,
            height: obstacleHeight,
          })
        }
      }

      // 건물 업데이트
      for (let i = 0; i < gameState.buildings.length; i++) {
        gameState.buildings[i].x -= gameState.speed * 0.2

        // 화면 밖으로 나간 건물 재배치
        if (gameState.buildings[i].x + gameState.buildings[i].width < 0) {
            // 모든 건물 중 x 좌표가 가장 큰 건물 찾기
            let maxX = 0;
            
            for (let j = 0; j < gameState.buildings.length; j++) {
              const rightEdge = gameState.buildings[j].x + gameState.buildings[j].width;
              if (rightEdge > maxX) {
                maxX = rightEdge;
              }
            }
            
            // 가장 오른쪽에 있는 건물 다음에 새 건물 배치
            gameState.buildings[i] = {
              x: maxX,
              width: 100 + Math.random() * 100,
              height: 100 + Math.random() * 150,
              color: getRandomColor(),
            }
          }

      }

      // 구름 업데이트
      for (let i = 0; i < gameState.clouds.length; i++) {
        gameState.clouds[i].x -= gameState.speed * 0.1

        // 화면 밖으로 나간 구름 재배치
        if (gameState.clouds[i].x + gameState.clouds[i].radius < 0) {
          gameState.clouds[i].x = canvas.width + gameState.clouds[i].radius
          gameState.clouds[i].y = 50 + Math.random() * 100
        }
      }

      // 충돌 체크
      for (const obstacle of gameState.obstacles) {
        if (
          gameState.player.x < obstacle.x + obstacle.width &&
          gameState.player.x + gameState.player.width > obstacle.x &&
          gameState.player.y + gameState.player.height > canvas.height - gameState.groundHeight - obstacle.height
        ) {
          gameState.gameRunning = false
          gameState.gameOver = true
          
          // 최고 점수 업데이트
          if (gameState.score > highScore) {
            setHighScore(gameState.score)
            localStorage.setItem('runawayHighScore', gameState.score.toString())
          }
        }
      }
    }

    // 게임 루프 최적화
    const gameLoop = (timestamp: number) => {
      // deltaTime 계산 (최적화)
      if (!gameState.lastTime) {
        gameState.lastTime = timestamp
      }
      
      const deltaTime = timestamp - gameState.lastTime
      gameState.lastTime = timestamp

      // 일정 FPS 유지를 위한 제한 (60fps 목표)
      if (deltaTime < 160) { // 대략 6fps 이상의 경우에만 업데이트
        update()
      }

      draw()
      gameState.frameId = requestAnimationFrame(gameLoop)
    }

    // 게임 루프 시작
    gameState.frameId = requestAnimationFrame(gameLoop)

    // 점프 함수 (중복 호출 방지)
    const jump = () => {
      if (gameState.gameRunning && !gameState.player.jumping) {
        gameState.player.jumping = true
        gameState.player.velocity = -gameState.player.jumpPower
      }
    }

    // 클릭 이벤트 처리
    const handleClick = (e: MouseEvent) => {
      // 다시 시작 버튼 클릭 체크
      if (gameState.gameOver) {
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

      // 시작 버튼 클릭 체크
      if (!gameState.gameRunning && !gameState.gameOver) {
        const buttonX = canvas.width / 2 - 60
        const buttonY = canvas.height / 2 + 60
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

      // 게임 중 점프
      jump()
    }

    // 키보드 이벤트 처리
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault() // 페이지 스크롤 방지
        
        // 게임 오버 상태에서 다시 시작
        if (gameState.gameOver) {
          initGame()
          return
        }
        
        // 시작 화면에서 게임 시작
        if (!gameState.gameRunning && !gameState.gameOver) {
          initGame()
          return
        }
        
        // 게임 중 점프
        jump()
      }
    }

    canvas.addEventListener("click", handleClick)
    window.addEventListener("keydown", handleKeyDown)

    // 정리 함수
    return () => {
      window.removeEventListener("resize", updateCanvasSize)
      canvas.removeEventListener("click", handleClick)
      window.removeEventListener("keydown", handleKeyDown)
      cancelAnimationFrame(gameState.frameId)
    }
  }, [highScore]) // highScore가 변경될 때 useEffect 재실행

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <canvas 
        ref={canvasRef} 
        className="border-2 border-sky-600 rounded-lg shadow-lg max-h-[90vh]" 
        tabIndex={0} // 키보드 이벤트 포커스를 위한 tabIndex 추가
      />
      <div className="text-lg text-gray-300">스페이스바 또는 클릭으로 점프하세요!</div>
    </div>
  )
}