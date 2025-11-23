import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#667eea",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Piano Tiles - Play Online Free | Rhythm Game",
  description: "Play Piano Tiles online free! Tap black tiles, avoid white ones. Classic, Arcade, Zen & Rush modes. No download required!",
  keywords: ["Piano Tiles", "Don't Tap The White Tile", "Music Game", "Rhythm Game", "Arcade Game", "Reflex Game"],
  authors: [{ name: "Your Name" }],
  metadataBase: new URL('https://pianotilesgames.com'),
  openGraph: {
    title: "Piano Tiles - Play Online Free | Rhythm Game",
    description: "Play Piano Tiles online free! Tap black tiles, avoid white ones. Classic, Arcade, Zen & Rush modes. No download required!",
    type: "website",
    url: "https://pianotilesgames.com",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Piano Tiles - Play Online Free Rhythm Game',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Piano Tiles - Play Online Free | Rhythm Game",
    description: "Play Piano Tiles online free! Tap black tiles, avoid white ones. Classic, Arcade, Zen & Rush modes. No download required!",
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: '/',
  },
  other: {
    'google-site-verification': '-qxTLBDiz_TiZ3Riyu_KNORmMwIrL929DrOaTLAJdXM',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-HM3XD8SQXN"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-HM3XD8SQXN');
          `}
        </Script>
        
        {children}
        <Analytics />
      </body>
    </html>
  );
}

