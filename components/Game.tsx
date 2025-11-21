"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, RotateCcw, Menu as MenuIcon, Trophy, Timer, Zap, Target } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Types
type GameMode = 'CLASSIC' | 'ARCADE' | 'ZEN' | 'RUSH';
type GameStatus = 'MENU' | 'COUNTDOWN' | 'PLAYING' | 'GAME_OVER';

interface TileRow {
  id: number;
  blackIndex: number;
  clicked: boolean;
  missedIndex?: number; // if user clicked wrong tile
}

interface HighScores {
  CLASSIC: number;
  ARCADE: number;
  ZEN: number;
  RUSH: number;
}

// Constants
const ROWS = 4;
const COLS = 4;
const CLASSIC_TARGET = 50;
const ZEN_TIME = 30;
const INITIAL_SPEEDS = {
  CLASSIC: 800,
  ARCADE: 600,
  RUSH: 500,
};
const MIN_SPEED = 150;
const SPEED_DROP = 2;

interface GameProps {
  initialMode?: GameMode;
}

export default function Game({ initialMode }: GameProps) {
  const router = useRouter();

  // State
  // If initialMode is provided, start in COUNTDOWN status, otherwise MENU
  const [status, setStatus] = useState<GameStatus>(initialMode ? 'COUNTDOWN' : 'MENU');
  const [mode, setMode] = useState<GameMode>(initialMode || 'CLASSIC');
  
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [speed, setSpeed] = useState(800);
  const [rows, setRows] = useState<TileRow[]>([]);
  const [countdown, setCountdown] = useState(3);
  const [highScores, setHighScores] = useState<HighScores>({
    CLASSIC: Infinity,
    ARCADE: 0,
    ZEN: 0,
    RUSH: 0,
  });
  const [result, setResult] = useState<{ success: boolean; isNewRecord: boolean } | null>(null);

  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const moveCountRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rowsRef = useRef<TileRow[]>([]); 
  const speedRef = useRef(800);
  const scoreRef = useRef(0);
  const modeRef = useRef<GameMode>(initialMode || 'CLASSIC');

  // Effect: When initialMode prop changes (or on mount with prop), start game
  useEffect(() => {
    if (initialMode) {
      startGame(initialMode);
    }
  }, [initialMode]);

  // Initialize Audio & High Scores
  useEffect(() => {
    try {
      const stored = localStorage.getItem('pianoTilesHighScores');
      if (stored) {
        setHighScores({ ...highScores, ...JSON.parse(stored) });
      }
    } catch (e) {
      console.error("Failed to load high scores", e);
    }

    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContext) {
      audioCtxRef.current = new AudioContext();
    }

    return () => {
      stopGame();
    };
  }, []);

  const playSound = (type: 'click' | 'gameover') => {
    if (!audioCtxRef.current) return;
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
    // ... (Sound logic remains same)
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400 + Math.random() * 200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
  };

  const startGame = (selectedMode: GameMode) => {
    setMode(selectedMode);
    modeRef.current = selectedMode;
    setStatus('COUNTDOWN');
    setCountdown(3);
    
    let initSpeed = INITIAL_SPEEDS.CLASSIC;
    if (selectedMode === 'ARCADE') initSpeed = INITIAL_SPEEDS.ARCADE;
    if (selectedMode === 'RUSH') initSpeed = INITIAL_SPEEDS.RUSH;
    setSpeed(initSpeed);
    speedRef.current = initSpeed;

    const initRows: TileRow[] = [];
    for (let i = 0; i < ROWS; i++) {
      initRows.push({
        id: Date.now() + i, 
        blackIndex: Math.floor(Math.random() * COLS),
        clicked: false
      });
    }
    
    setRows(initRows);
    rowsRef.current = initRows;
    moveCountRef.current = 0;
    setScore(0);
    scoreRef.current = 0;
    setTimer(0);
    
    let count = 3;
    const intv = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(intv);
        setCountdown(0);
        runGame();
      }
    }, 600);
  };

  const runGame = () => {
    setStatus('PLAYING');
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - startTimeRef.current) / 1000;
      
      if (modeRef.current === 'ZEN') {
        const remaining = Math.max(0, ZEN_TIME - elapsed);
        setTimer(remaining);
        if (remaining <= 0) endGame(true);
      } else {
        setTimer(elapsed);
      }
    }, 10);

    startGameLoop();
  };

  const startGameLoop = () => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    
    gameLoopRef.current = setInterval(() => {
      const currentRows = rowsRef.current;
      
      if (moveCountRef.current >= ROWS) {
         const lastRow = currentRows[currentRows.length - 1];
         if (lastRow && !lastRow.clicked) {
            playSound('gameover');
            endGame(false);
            return;
         }
      }

      const newRow: TileRow = {
        id: Date.now(),
        blackIndex: Math.floor(Math.random() * COLS),
        clicked: false
      };
      
      const nextRows = [newRow, ...currentRows];
      if (nextRows.length > ROWS + 1) {
        nextRows.pop();
      }
      
      setRows(nextRows);
      rowsRef.current = nextRows;
      moveCountRef.current++;

    }, speedRef.current);
  };

  const handleTileClick = (rowIndex: number, colIndex: number, isBlack: boolean) => {
    if (status !== 'PLAYING') return;

    if (isBlack) {
       const newRows = [...rows];
       if (newRows[rowIndex].clicked) return;

       newRows[rowIndex].clicked = true;
       setRows(newRows);
       rowsRef.current = newRows;
       
       playSound('click');
       
       const newScore = score + 1;
       setScore(newScore);
       scoreRef.current = newScore;

       if (mode === 'CLASSIC' && newScore >= CLASSIC_TARGET) {
         endGame(true);
         return;
       }

       if (mode === 'ARCADE' || mode === 'RUSH') {
          if (speedRef.current > MIN_SPEED) {
             const drop = mode === 'RUSH' ? SPEED_DROP * 1.5 : SPEED_DROP;
             const newSpeed = Math.max(MIN_SPEED, speedRef.current - drop);
             speedRef.current = newSpeed;
             setSpeed(newSpeed);
             startGameLoop(); 
          }
       }

    } else {
       const newRows = [...rows];
       newRows[rowIndex].missedIndex = colIndex; 
       setRows(newRows);
       playSound('gameover');
       endGame(false);
    }
  };

  const stopGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
  };

  const endGame = (success: boolean) => {
    stopGame();
    setStatus('GAME_OVER');
    
    let isNewRecord = false;
    const currentScore = mode === 'CLASSIC' ? (success ? timer : Infinity) : score;
    const currentBest = highScores[mode];
    
    const newHighScores = { ...highScores };
    
    if (mode === 'CLASSIC') {
       if (currentScore < currentBest) {
         newHighScores[mode] = currentScore;
         isNewRecord = true;
       }
    } else {
       if (currentScore > currentBest) {
         newHighScores[mode] = currentScore;
         isNewRecord = true;
       }
    }

    if (isNewRecord) {
       setHighScores(newHighScores);
       localStorage.setItem('pianoTilesHighScores', JSON.stringify(newHighScores));
    }

    setResult({ success, isNewRecord });
  };

  // Keyboard Support
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (status !== 'PLAYING') return;
      const keys = ['KeyD', 'KeyF', 'KeyJ', 'KeyK'];
      const col = keys.indexOf(e.code);
      if (col === -1) return;

      const targetRowIndex = rowsRef.current.length - 1;
      const row = rowsRef.current[targetRowIndex];
      
      if (row) {
         const isBlack = row.blackIndex === col;
         handleTileClick(targetRowIndex, col, isBlack);
      }
    };
    
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [status]);

  const formatScore = (m: GameMode, v: number) => {
    if (m === 'CLASSIC') {
      if (v === Infinity || !v) return '--';
      return v.toFixed(2) + 's';
    }
    return v || '--';
  };

  const handleBack = () => {
    stopGame();
    if (initialMode) {
      // If came from a dedicated route, go back to home
      window.location.href = '/';
    } else {
      // If in SPA mode, go back to menu
      setStatus('MENU');
    }
  };

  const handleMenuBtn = () => {
     if (initialMode) {
       window.location.href = '/';
     } else {
       setStatus('MENU');
     }
  };

  // -- RENDER --

  if (status === 'MENU') {
    return (
      <div className="flex-1 w-full h-full overflow-y-auto p-5 no-scrollbar animate-fadeIn bg-[#f5f7fa] md:bg-white md:rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { id: 'CLASSIC', icon: Target, label: 'Classic', desc: 'Tap 50 tiles', sub: 'Fastest wins' },
            { id: 'ARCADE', icon: Zap, label: 'Arcade', desc: 'Endless', sub: 'Increasing speed' },
            { id: 'ZEN', icon: Timer, label: 'Zen', desc: '30 Seconds', sub: 'Max score' },
            { id: 'RUSH', icon: Play, label: 'Rush', desc: 'Extreme', sub: 'Max speed' },
          ].map((m) => (
            <a 
              key={m.id}
              href={`/mode/${m.id.toLowerCase()}`}
              className="bg-white md:bg-gray-50 p-5 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer flex md:block items-center md:text-center gap-4 border border-gray-100"
            >
              <div className="text-4xl md:text-5xl md:mb-3 w-12 md:w-auto text-center flex justify-center">
                 <m.icon size={40} className="text-gray-700" />
              </div>
              <div className="flex-1 text-left md:text-center">
                <h2 className="text-xl font-bold text-gray-800">{m.label}</h2>
                <p className="text-gray-500 text-sm">{m.desc}</p>
                <p className="text-gray-400 text-xs">{m.sub}</p>
                <div className="mt-2 pt-2 border-t border-gray-100 text-sm font-bold text-primary">
                  Best: {formatScore(m.id as GameMode, highScores[m.id as keyof HighScores])}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-white md:rounded-xl shadow-xl overflow-hidden relative">
      {/* Game Header */}
      <div className="flex justify-between items-center p-4 bg-gray-50 border-b border-gray-100 z-20">
        {initialMode ? (
          <a
            href="/"
            onClick={() => stopGame()} // Ensure game loop stops
            className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-bold text-gray-700 transition flex items-center justify-center"
          >
            ← Home
          </a>
        ) : (
          <button 
            onClick={handleBack}
            className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-bold text-gray-700 transition"
          >
            ← Back
          </button>
        )}
        <div className="flex gap-4 text-sm md:text-base">
           <div className="flex items-center gap-1">
             <span className="font-semibold text-gray-500">{mode === 'CLASSIC' ? 'Progress' : 'Score'}:</span>
             <span className="font-bold text-gray-800 tabular-nums">
               {mode === 'CLASSIC' ? `${score}/${CLASSIC_TARGET}` : score}
             </span>
           </div>
           <div className="flex items-center gap-1">
             <span className="font-semibold text-gray-500">Time:</span>
             <span className="font-bold text-gray-800 tabular-nums">{timer.toFixed(2)}s</span>
           </div>
           {(mode === 'ARCADE' || mode === 'RUSH') && (
             <div className="hidden md:flex items-center gap-1">
                <span className="font-semibold text-gray-500">Speed:</span>
                <span className={`font-bold tabular-nums ${speed < 400 ? 'text-red-500' : 'text-gray-800'}`}>
                  {((mode === 'RUSH' ? INITIAL_SPEEDS.RUSH : INITIAL_SPEEDS.ARCADE) / speed).toFixed(1)}x
                </span>
             </div>
           )}
        </div>
      </div>

      {/* Game Board */}
      <div className="flex-1 relative w-full max-w-[400px] mx-auto bg-[#f5f5f5] border-x-4 border-gray-800 overflow-hidden touch-none">
         {/* Grid */}
         <div className="w-full h-full flex flex-col">
            {rows.slice(0, 5).map((row, rIdx) => (
               <div key={row.id} className="w-full flex-1 flex border-b border-gray-200 min-h-0">
                  {[0, 1, 2, 3].map((col) => {
                     const isBlack = row.blackIndex === col;
                     let bgClass = isBlack ? 'bg-[#1a1a1a]' : 'bg-white';
                     if (isBlack && row.clicked) bgClass = 'bg-gray-400'; // Default clicked
                     if (isBlack && row.clicked && mode !== 'CLASSIC') bgClass = 'bg-green-500'; // Success color
                     if (row.missedIndex === col) bgClass = 'bg-red-500 animate-shake'; // Missed
                     
                     return (
                       <div 
                         key={col}
                         onMouseDown={(e) => { handleTileClick(rIdx, col, isBlack); }}
                         onTouchStart={(e) => { handleTileClick(rIdx, col, isBlack); }}
                         className={`w-1/4 h-full border-r border-gray-200 relative cursor-pointer ${bgClass}`}
                       />
                     );
                  })}
               </div>
            ))}
         </div>
         
         {/* Countdown Overlay */}
         {status === 'COUNTDOWN' && (
           <div className="absolute inset-0 bg-white/30 backdrop-blur-sm flex justify-center items-center z-50">
             <div className="text-9xl font-black text-gray-800 animate-popIn drop-shadow-lg">
               {countdown === 0 ? 'GO!' : countdown}
             </div>
           </div>
         )}
         
         {/* Game Over Overlay */}
         {status === 'GAME_OVER' && result && (
           <div className="absolute inset-0 bg-black/85 flex flex-col justify-center items-center text-white z-50 animate-fadeIn p-8 text-center">
              <h2 className="text-4xl font-bold mb-4">{result.success ? '🎉 Awesome!' : '😢 Game Over'}</h2>
              <div className="bg-white/10 p-6 rounded-xl mb-6 w-full">
                 <p className="text-xl mb-2">{mode === 'CLASSIC' ? (result.success ? `Time: ${timer.toFixed(2)}s` : 'Failed') : `Score: ${score}`}</p>
                 {result.isNewRecord && <div className="text-yellow-400 font-bold animate-pulse">🏆 New Record!</div>}
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => startGame(mode)}
                  className="bg-primary hover:brightness-110 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition"
                >
                  Play Again
                </button>
                <button 
                  onClick={handleMenuBtn}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition"
                >
                  Menu
                </button>
              </div>
           </div>
         )}
      </div>
    </div>
  );
}
