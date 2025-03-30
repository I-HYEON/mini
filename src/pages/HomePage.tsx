import GamesList from "@/components/Home/GameList";
import Header from "@/components/Home/Header";
import Sparkles from "@/components/Home/Sparkles";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white relative">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900 to-zinc-950 z-0" />
      <div className="absolute inset-0 bg-grid-pattern opacity-10 z-0" />

      {/* sparkles 애니메이션 */}
      <Sparkles />

      {/* Content container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* 상단 헤더 파트 */}
        <div className="min-h-[30vh]">
          <Header />
        </div>

        {/* Games list 보여주는 파트 */}
        <div className="min-h-[70vh]">
          <GamesList />
        </div>
      </div>
    </div>
  )
}


