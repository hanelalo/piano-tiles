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
        {/* Header */}
        <header className="text-center text-white pt-3 pb-2 shrink-0 relative overflow-hidden">
          {/* Piano Keys Pattern Background - More Realistic */}
          <div className="absolute inset-0 flex items-end opacity-60">
            {Array.from({ length: 24 }).map((_, i) => {
              const isBlack = i % 2 === 1;
              const isWhite = !isBlack;
              return (
                <div 
                  key={i} 
                  className={`relative flex-1 ${isWhite ? 'bg-white' : 'bg-[#0a0a0a]'} border-r border-gray-700/50`}
                  style={{
                    height: isBlack ? '75%' : '100%',
                    boxShadow: isBlack 
                      ? 'inset 0 3px 6px rgba(0,0,0,0.7), 0 2px 4px rgba(0,0,0,0.4), inset 0 -1px 0 rgba(255,255,255,0.1)' 
                      : 'inset 0 -3px 6px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.2), inset 0 2px 0 rgba(255,255,255,0.3)',
                    zIndex: isBlack ? 2 : 1,
                    alignSelf: isBlack ? 'flex-start' : 'stretch',
                    marginTop: isBlack ? '-8px' : '0',
                  }}
                >
                  {/* Black key top highlight */}
                  {isBlack && (
                    <>
                      <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-gray-500/40 via-gray-600/20 to-transparent"></div>
                      <div className="absolute top-0 left-0 right-0 h-px bg-gray-500/50"></div>
                    </>
                  )}
                  {/* White key bottom depression */}
                  {isWhite && (
                    <div className="absolute bottom-0 left-1/4 right-1/4 h-1/5 bg-gradient-to-t from-gray-300/50 to-transparent"></div>
                  )}
                  {/* Key separator line */}
                  {i > 0 && isWhite && (
                    <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-gray-400/80"></div>
                  )}
                </div>
              );
            })}
          </div>
          {/* Text Background Overlay for Better Readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40 backdrop-blur-[3px]"></div>
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-black mb-1 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] text-white">
              🎹 Piano Tiles
            </h1>
            <p className="text-sm md:text-base font-semibold opacity-95 drop-shadow-[0_1px_5px_rgba(0,0,0,0.7)] text-white">
              Don&apos;t Tap The White Tile!
            </p>
          </div>
        </header>

        {/* Main Game Area (Client Component) */}
        <Game />
      </div>

      {/* PC Right Ad */}
      <aside className="hidden md:flex w-[300px] min-w-[160px] shrink h-full justify-center items-center p-2.5">
        {/* Google AdSense Code Here */}
      </aside>
    </main>
  );
}

