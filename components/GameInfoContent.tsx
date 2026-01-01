"use client";

import InArticleAd from "./InArticleAd";

// Game Information Content Component
export default function GameInfoContent() {
  return (
    <div className="bg-white rounded-xl p-5 shadow-md border border-gray-200">
      {/* How to Play Section */}
      <h2 className="text-xl font-bold text-gray-800 mb-3">🎹 How to Play Piano Tiles Online</h2>
      <div className="space-y-3 text-sm text-gray-600 mb-6">
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">Basic Rules:</h3>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Tap only the <strong className="text-gray-900">black tiles</strong> as they scroll down</li>
            <li>Never tap the <strong className="text-gray-900">white tiles</strong> or you&apos;ll lose</li>
            <li>Each correctly tapped black tile increases your score</li>
            <li>Missing a black tile that reaches the bottom ends the game</li>
          </ul>
        </div>
        
        {/* In-Article Ad */}
        <InArticleAd className="my-4" />
        
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">Tips for Success:</h3>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Stay focused and keep your eyes on the tiles</li>
            <li>Use multiple fingers for faster tapping</li>
            <li>Practice regularly to improve your reaction time</li>
            <li>Don&apos;t rush - accuracy is more important than speed</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">Controls:</h3>
          <p className="ml-2">Play Piano Tiles online free using your mouse, touchscreen, or keyboard (D, F, J, K keys). No download required - this browser-based game works instantly!</p>
        </div>
      </div>

      {/* Game Modes Section */}
      <h2 className="text-xl font-bold text-gray-800 mb-3 mt-6 pt-6 border-t border-gray-200">🎮 Game Modes Explained</h2>
      <div className="space-y-4 text-sm text-gray-600 mb-6">
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">🎯 Classic Mode</h3>
          <p className="ml-2">The original Piano Tiles challenge. Tap 50 black tiles as quickly as possible. Your goal is to complete all 50 tiles in the shortest time. Perfect for players who want to beat their personal best! Play Piano Tiles Classic Mode for free.</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">⚡ Arcade Mode</h3>
          <p className="ml-2">Free Piano Tiles Arcade Mode offers endless gameplay where the speed gradually increases with each tile you tap. See how many tiles you can hit before making a mistake! The game gets progressively faster, testing your limits.</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">🧘 Zen Mode</h3>
          <p className="ml-2">Relax and play at your own pace. You have 30 seconds to tap as many black tiles as possible. No pressure from increasing speed - just focus on accuracy and see how many tiles you can score! Play this free online mode anytime.</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">🏃 Rush Mode</h3>
          <p className="ml-2">For expert players! Rush mode starts at a moderate speed and accelerates rapidly. This is the ultimate test of your reflexes and precision. Can you handle the extreme pace? Play Rush Mode free online.</p>
        </div>
      </div>

      {/* Game History Section */}
      <h2 className="text-xl font-bold text-gray-800 mb-3 mt-6 pt-6 border-t border-gray-200">📚 About Piano Tiles</h2>
      <div className="text-sm text-gray-600 space-y-3">
        <p className="leading-relaxed">
          Piano Tiles (also known as Don&apos;t Tap The White Tile or Magic Piano) is a classic rhythm game that became popular worldwide. 
          This online rhythm game Piano Tiles challenges players to tap only the black tiles while avoiding the white ones as they scroll down the screen. 
          Originally developed by Cheetah Mobile, Piano Tiles has become one of the most beloved mobile games, combining simple mechanics with addictive gameplay.
        </p>
        <p className="leading-relaxed">
          Play Piano Tiles online for free! Our online version brings the classic Piano Tiles game experience to your browser with smooth animations and multiple game modes. 
          Test your reflexes, improve your reaction time, and see how fast you can tap without missing a black tile! This free music game requires no download and works directly in your web browser.
        </p>
      </div>
    </div>
  );
}

