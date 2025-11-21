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
  title: "Piano Tiles - Play Online Free Rhythm Game",
  description: "Challenge your reflexes in this addictive piano rhythm game. Play Classic, Arcade, Zen, and Rush modes for free directly in your browser!",
  keywords: ["Piano Tiles", "Don't Tap The White Tile", "Music Game", "Rhythm Game", "Arcade Game", "Reflex Game"],
  authors: [{ name: "Your Name" }],
  metadataBase: new URL('https://pianotiles-hdjb.vercel.app'),
  openGraph: {
    title: "Piano Tiles - Don't Tap The White Tile!",
    description: "Challenge your reflexes in this addictive piano rhythm game.",
    type: "website",
    // images: ['/screenshot.png'],
  },
  twitter: {
    card: "summary_large_image",
    title: "Piano Tiles - Don't Tap The White Tile!",
    description: "Challenge your reflexes in this addictive piano rhythm game.",
    // images: ['/screenshot.png'],
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

