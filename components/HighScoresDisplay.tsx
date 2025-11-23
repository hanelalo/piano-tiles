"use client";

import { useState, useEffect } from "react";

type GameMode = 'CLASSIC' | 'ARCADE' | 'ZEN' | 'RUSH';

interface HighScores {
  CLASSIC: number;
  ARCADE: number;
  ZEN: number;
  RUSH: number;
}

interface HighScoresDisplayProps {
  mode: GameMode;
  borderColor: string;
  textColor: string;
}

const formatScore = (m: GameMode, v: number): string => {
  if (m === 'CLASSIC') {
    if (v === Infinity || !v) return '--';
    return v.toFixed(2) + 's';
  }
  return v ? String(v) : '--';
};

export default function HighScoresDisplay({ mode, borderColor, textColor }: HighScoresDisplayProps) {
  const [score, setScore] = useState<string>('--');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('pianoTilesHighScores');
      if (stored) {
        const highScores: HighScores = JSON.parse(stored);
        const formattedScore = formatScore(mode, highScores[mode]);
        setScore(formattedScore);
      }
    } catch (e) {
      console.error("Failed to load high scores", e);
    }
  }, [mode]);

  return (
    <div className={`mt-2 pt-2 border-t ${borderColor} text-xs md:text-sm font-bold ${textColor}`}>
      Best: {score}
    </div>
  );
}

