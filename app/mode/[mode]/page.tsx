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
    classic: { 
      title: "Classic Mode", 
      desc: "Play Piano Tiles Classic Mode free online! Tap 50 black tiles as fast as you can and beat your best time in this free rhythm game!" 
    },
    arcade: { 
      title: "Arcade Mode", 
      desc: "Free Piano Tiles Arcade Mode - endless challenge with increasing speed. Play online for free and test your limits in this free music game!" 
    },
    zen: { 
      title: "Zen Mode", 
      desc: "Play Piano Tiles Zen Mode online free! How many black tiles can you tap in 30 seconds? No pressure, just accuracy in this free rhythm game!" 
    },
    rush: { 
      title: "Rush Mode", 
      desc: "Free Piano Tiles Rush Mode - extreme speed for advanced players. Play online for free and challenge yourself in this fast-paced free music game!" 
    },
  };

  if (!MODES.includes(mode as Mode)) return {};

  const info = modeInfo[mode as Mode];
  return {
    title: `Piano Tiles - ${info.title}`,
    description: info.desc,
    openGraph: {
      title: `Play Piano Tiles: ${info.title}`,
      description: info.desc,
      type: "website",
      url: `https://pianotilesgames.com/mode/${mode}`,
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: `Piano Tiles - ${info.title}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Play Piano Tiles: ${info.title}`,
      description: info.desc,
      images: ['/og-image.png'],
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
      "item": "https://pianotilesgames.com"
    }, {
      "@type": "ListItem",
      "position": 2,
      "name": `${modeKey} Mode`,
      "item": `https://pianotilesgames.com/mode/${params.mode}`
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
        {/* Main Game Area (Client Component) */}
        {/* We pass the uppercase mode (e.g. CLASSIC) to the Game component */}
        <Game initialMode={modeKey as any} />
      </div>

      {/* PC Right Ad */}
      <aside className="hidden md:flex w-[300px] min-w-[160px] shrink h-full justify-center items-center p-2.5">
        {/* Google AdSense Code Here */}
      </aside>
    </main>
  );
}

