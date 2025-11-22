import Game from "@/components/Game";

export default function Home() {
  return (
    <main className="flex w-full h-screen justify-center items-stretch overflow-hidden">
      {/* PC Left Ad */}
      <aside className="hidden md:flex w-[300px] min-w-[160px] shrink h-full justify-center items-center p-2.5">
        {/* Google AdSense Code Here */}
        {/* <div className="w-[160px] h-[600px] bg-white/5 border-2 border-dashed border-white/20 flex justify-center items-center text-white/50 rounded-lg">Ad Space</div> */}
      </aside>

      <div className="flex-1 w-full max-w-[500px] min-w-[320px] h-screen flex flex-col relative z-10 bg-gradient-to-br from-[#667eea] to-[#764ba2] shadow-[0_0_50px_rgba(0,0,0,0.5)] md:ring-1 md:ring-white/10">
        {/* Mobile Top Ad */}
        <div className="flex md:hidden w-full h-[50px] shrink-0 justify-center items-center bg-transparent overflow-hidden">
          {/* Mobile Ad Code Here */}
        </div>

        {/* Header */}
        <header className="text-center text-white pt-3 pb-2 shrink-0">
          <h1 className="text-2xl md:text-3xl font-bold mb-1 drop-shadow-md">🎹 Piano Tiles</h1>
          <p className="text-sm md:text-base opacity-90">Don&apos;t Tap The White Tile!</p>
        </header>

        {/* Main Game Area (Client Component) */}
        <Game />

        {/* Mobile Bottom Ad */}
        <div className="flex md:hidden w-full h-[50px] shrink-0 justify-center items-center bg-transparent overflow-hidden">
          {/* Mobile Ad Code Here */}
        </div>
      </div>

      {/* PC Right Ad */}
      <aside className="hidden md:flex w-[300px] min-w-[160px] shrink h-full justify-center items-center p-2.5">
        {/* Google AdSense Code Here */}
      </aside>
    </main>
  );
}

