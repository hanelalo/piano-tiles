import Link from "next/link";
import { Play, Timer, Zap, Target } from "lucide-react";
import HighScoresDisplay from "./HighScoresDisplay";

type GameMode = 'CLASSIC' | 'ARCADE' | 'ZEN' | 'RUSH';

const MODES = [
  { 
    id: 'CLASSIC' as GameMode, 
    icon: Target, 
    label: 'Classic', 
    desc: 'Tap 50 tiles', 
    sub: 'Fastest wins',
    colors: {
      bg: 'bg-gradient-to-br from-amber-50 to-yellow-50',
      border: 'border-amber-300',
      borderHover: 'border-amber-400',
      iconBg: 'bg-gradient-to-br from-amber-100 to-yellow-100',
      iconBgHover: 'from-amber-200 to-yellow-200',
      icon: 'text-amber-700',
      iconHover: 'text-amber-800',
      score: 'text-amber-700',
      title: 'text-amber-900'
    }
  },
  { 
    id: 'ARCADE' as GameMode, 
    icon: Zap, 
    label: 'Arcade', 
    desc: 'Endless', 
    sub: 'Increasing speed',
    colors: {
      bg: 'bg-gradient-to-br from-blue-50 to-purple-50',
      border: 'border-blue-300',
      borderHover: 'border-blue-400',
      iconBg: 'bg-gradient-to-br from-blue-100 to-purple-100',
      iconBgHover: 'from-blue-200 to-purple-200',
      icon: 'text-blue-700',
      iconHover: 'text-blue-800',
      score: 'text-blue-700',
      title: 'text-blue-900'
    }
  },
  { 
    id: 'ZEN' as GameMode, 
    icon: Timer, 
    label: 'Zen', 
    desc: '30 Seconds', 
    sub: 'Max score',
    colors: {
      bg: 'bg-gradient-to-br from-emerald-50 to-teal-50',
      border: 'border-emerald-300',
      borderHover: 'border-emerald-400',
      iconBg: 'bg-gradient-to-br from-emerald-100 to-teal-100',
      iconBgHover: 'from-emerald-200 to-teal-200',
      icon: 'text-emerald-700',
      iconHover: 'text-emerald-800',
      score: 'text-emerald-700',
      title: 'text-emerald-900'
    }
  },
  { 
    id: 'RUSH' as GameMode, 
    icon: Play, 
    label: 'Rush', 
    desc: 'Extreme', 
    sub: 'Max speed',
    colors: {
      bg: 'bg-gradient-to-br from-red-50 to-orange-50',
      border: 'border-red-300',
      borderHover: 'border-red-400',
      iconBg: 'bg-gradient-to-br from-red-100 to-orange-100',
      iconBgHover: 'from-red-200 to-orange-200',
      icon: 'text-red-700',
      iconHover: 'text-red-800',
      score: 'text-red-700',
      title: 'text-red-900'
    }
  },
];

// Server Component - 游戏模式卡片（静态内容 + 客户端分数显示）
export default function GameModeCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {MODES.map((m) => {
        const isClassic = m.id === 'CLASSIC';
        const isArcade = m.id === 'ARCADE';
        const isZen = m.id === 'ZEN';
        const isRush = m.id === 'RUSH';
        
        return (
          <Link 
            key={m.id}
            href={`/mode/${m.id.toLowerCase()}`}
            className={`${m.colors.bg} p-4 lg:p-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex md:flex-col items-center md:text-center gap-4 border-2 ${m.colors.border} ${
              isClassic ? 'hover:border-amber-400' :
              isArcade ? 'hover:border-blue-400' :
              isZen ? 'hover:border-emerald-400' :
              'hover:border-red-400'
            } group`}
          >
            <div className={`w-14 h-14 rounded-xl ${m.colors.iconBg} flex items-center justify-center transition-all group-hover:scale-110`}>
              <m.icon size={32} className={`${m.colors.icon} transition-colors`} />
            </div>
            <div className="flex-1 text-left md:text-center">
              <h2 className={`text-lg md:text-xl lg:text-2xl font-bold ${m.colors.title} mb-1`}>{m.label}</h2>
              <p className="text-gray-600 text-xs md:text-sm mb-1">{m.desc}</p>
              <p className="text-gray-500 text-xs">{m.sub}</p>
              <HighScoresDisplay 
                mode={m.id} 
                borderColor={m.colors.border}
                textColor={m.colors.score}
              />
            </div>
          </Link>
        );
      })}
    </div>
  );
}

