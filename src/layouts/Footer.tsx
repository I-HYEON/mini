export default function Footer() {
    return (
      <footer className="bg-zinc-900 text-zinc-300 py-6 px-8 mt-auto">
        <div className="mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: 사이트 이름 및 설명 */}
          <div className="text-center md:text-left">
            <h1 className="text-lg font-semibold text-white">MiniFun!</h1>
            <p className="text-sm text-zinc-400">작지만 재밌는 게임들, 언제 어디서나 🎮</p>
          </div>
  
          {/* Right: 소셜 링크 또는 카피라이트 */}
          <div className="text-sm text-zinc-500 text-center md:text-right">
            &copy; {new Date().getFullYear()} MiniFun. All rights reserved.
          </div>
        </div>
      </footer>
    );
  }
  