import Game from "@/components/Game";
import { notFound } from "next/navigation";
import { Metadata } from "next";

// Valid modes
const MODES = ['classic', 'arcade', 'zen', 'rush'] as const;
type Mode = typeof MODES[number];

interface PageProps {
  params: {
    mode: string;
  };
}

export async function generateStaticParams() {
  return MODES.map((mode) => ({
    mode: mode,
  }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const mode = params.mode.toLowerCase();
  const modeInfo = {
    classic: { title: "Classic Mode", desc: "Tap 50 tiles as fast as you can!" },
    arcade: { title: "Arcade Mode", desc: "Endless challenge with increasing speed." },
    zen: { title: "Zen Mode", desc: "How many tiles can you tap in 30 seconds?" },
    rush: { title: "Rush Mode", desc: "Extreme speed for advanced players." },
  };

  if (!MODES.includes(mode as Mode)) return {};

  const info = modeInfo[mode as Mode];
  return {
    title: `Piano Tiles - ${info.title}`,
    description: info.desc,
    openGraph: {
      title: `Play Piano Tiles: ${info.title}`,
      description: info.desc,
    },
    alternates: {
      canonical: `/mode/${mode}`,
    },
  };
}

export default function ModePage({ params }: PageProps) {
  const modeKey = params.mode.toUpperCase();

  // Validate mode
  if (!MODES.includes(params.mode as Mode)) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [{
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://pianotiles-hdjb.vercel.app"
    }, {
      "@type": "ListItem",
      "position": 2,
      "name": `${modeKey} Mode`,
      "item": `https://pianotiles-hdjb.vercel.app/mode/${params.mode}`
    }]
  };

  return (
    <main className="flex w-full h-screen justify-center items-stretch overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* PC Left Ad */}
      <aside className="hidden md:flex w-[300px] min-w-[160px] shrink h-full justify-center items-center p-2.5">
        {/* Google AdSense Code Here */}
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
        {/* We pass the uppercase mode (e.g. CLASSIC) to the Game component */}
        <Game initialMode={modeKey as any} />

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

