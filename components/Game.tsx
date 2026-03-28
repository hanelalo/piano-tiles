"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, RotateCcw, Menu as MenuIcon, Trophy } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { analytics } from "@/lib/analytics";
import GameMenu from "./GameMenu";



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
  RUSH: 700, // Rush 模式从较慢开始，逐渐加速
};
const MIN_SPEED = 150;
const SPEED_DROP = 2;
// Rush 模式自动加速配置
const RUSH_AUTO_ACCEL_INTERVAL = 2000; // 每2秒自动加速一次
const RUSH_AUTO_ACCEL_DROP = 5; // 每次自动加速减少的毫秒数
const RUSH_CLICK_ACCEL_DROP = 6; // 每次点击减少的毫秒数（比 ARCADE 更快）

interface GameProps {
  initialMode?: GameMode;
}

export default function Game({ initialMode }: GameProps) {
  const router = useRouter();

  // State
  // If initialMode is provided, start in COUNTDOWN status, otherwise MENU
  const [status, setStatus] = useState<GameStatus>(initialMode ? 'COUNTDOWN' : 'MENU');
  
  // 同步 status 到 ref
  useEffect(() => {
    statusRef.current = status;
  }, [status]);
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
  const gameLoopRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const moveCountRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rowsRef = useRef<TileRow[]>([]); 
  const speedRef = useRef(800);
  const scoreRef = useRef(0);
  const modeRef = useRef<GameMode>(initialMode || 'CLASSIC');
  const statusRef = useRef<GameStatus>(initialMode ? 'COUNTDOWN' : 'MENU');
  const lastUpdateTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const lastAutoAccelRef = useRef<number>(0); // 上次自动加速的时间（使用 performance.now()）

  // Effect: When initialMode prop changes (or on mount with prop), start game
  useEffect(() => {
    if (initialMode) {
      startGame(initialMode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'click') {
      // 模拟钢琴音：混合波形 + 快速Attack + 慢速Decay + 泛音
      const now = ctx.currentTime;
      
      // 随机选取 C 大调音阶的一个音，增加趣味性
      // C4, D4, E4, F4, G4, A4, B4, C5
      const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
      const freq = notes[Math.floor(Math.random() * notes.length)];

      // 主振荡器 (Triangle - 更有质感)
      const osc1 = ctx.createOscillator();
      osc1.type = 'triangle';
      osc1.frequency.value = freq;

      // 泛音振荡器 (Sine - 增加厚度)
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.value = freq * 2; // 2倍频
      osc2.detune.value = 5; // 稍微失谐，模拟真实物理特性

      const masterGain = ctx.createGain();
      
      // 包络：快速达到最大音量，然后指数衰减
      masterGain.gain.setValueAtTime(0, now);
      masterGain.gain.linearRampToValueAtTime(0.3, now + 0.02); // Attack
      masterGain.gain.exponentialRampToValueAtTime(0.01, now + 1.5); // Decay

      osc1.connect(masterGain);
      osc2.connect(masterGain);
      masterGain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.5);
      osc2.stop(now + 1.5);

    } else {
      // Game Over 音效保持原样，或者稍微优化
      osc.type = 'sawtooth'; // 锯齿波更刺耳
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    }
  };

  const startGame = (selectedMode: GameMode) => {
    setMode(selectedMode);
    modeRef.current = selectedMode;
    setStatus('COUNTDOWN');
    statusRef.current = 'COUNTDOWN';
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
    lastAutoAccelRef.current = performance.now(); // 重置自动加速计时器
    
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
    statusRef.current = 'PLAYING';
    startTimeRef.current = Date.now();
    
    // 跟踪游戏开始事件
    analytics.gameStart(modeRef.current);

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
    if (gameLoopRef.current !== null) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    
    lastUpdateTimeRef.current = performance.now();

    const animate = (currentTime: number) => {
      // 继续动画循环（无论状态如何，都要检查，以便能继续运行）
      if (statusRef.current === 'PLAYING') {
        // Rush 模式：基于时间的自动加速
        if (modeRef.current === 'RUSH' && speedRef.current > MIN_SPEED) {
          if (currentTime - lastAutoAccelRef.current >= RUSH_AUTO_ACCEL_INTERVAL) {
            const newSpeed = Math.max(MIN_SPEED, speedRef.current - RUSH_AUTO_ACCEL_DROP);
            speedRef.current = newSpeed;
            setSpeed(newSpeed);
            lastAutoAccelRef.current = currentTime;
          }
        }
        
        const elapsed = currentTime - lastUpdateTimeRef.current;
        const intervalMs = speedRef.current; // 实时获取最新速度
        
        if (elapsed >= intervalMs) {
      const currentRows = rowsRef.current;
      
      if (moveCountRef.current >= ROWS) {
         const lastRow = currentRows[currentRows.length - 1];
         if (lastRow && !lastRow.clicked) {
            playSound('gameover');
            endGame(false);
            return;
         }
      }

          // 创建新行
      const newRow: TileRow = {
            id: Date.now() + Math.random(), // 添加随机数以确保唯一性
        blackIndex: Math.floor(Math.random() * COLS),
        clicked: false
      };
      
      const nextRows = [newRow, ...currentRows];
      if (nextRows.length > ROWS + 1) {
        nextRows.pop();
      }
      
      rowsRef.current = nextRows;
          setRows([...nextRows]); // 创建新数组触发重新渲染
      moveCountRef.current++;
          lastUpdateTimeRef.current = currentTime;
        }
        
        // 继续动画循环
        gameLoopRef.current = requestAnimationFrame(animate);
      }
    };
    
    gameLoopRef.current = requestAnimationFrame(animate);
  };

  const handleTileClick = (rowIndex: number, colIndex: number, isBlack: boolean) => {
    if (statusRef.current !== 'PLAYING') return;

    if (isBlack) {
       const currentRows = rowsRef.current;
       if (currentRows[rowIndex]?.clicked) return;

       // 立即更新 ref，确保快速响应
       const newRows = [...currentRows];
       newRows[rowIndex] = { ...newRows[rowIndex], clicked: true };
       rowsRef.current = newRows;
       
       // 立即更新状态
       setRows(newRows);
       
       // 立即更新分数（使用 ref 避免闭包）
       const newScore = scoreRef.current + 1;
       scoreRef.current = newScore;
       setScore(newScore);
       
       // 音效异步播放，不阻塞主线程
       requestAnimationFrame(() => {
         playSound('click');
       });

       if (mode === 'CLASSIC' && newScore >= CLASSIC_TARGET) {
         endGame(true);
         return;
       }

       if (mode === 'ARCADE' || mode === 'RUSH') {
          if (speedRef.current > MIN_SPEED) {
             const drop = mode === 'RUSH' ? RUSH_CLICK_ACCEL_DROP : SPEED_DROP;
             const newSpeed = Math.max(MIN_SPEED, speedRef.current - drop);
             speedRef.current = newSpeed;
             setSpeed(newSpeed);
             // 不需要重启游戏循环，速度变化会通过 speedRef.current 实时生效
          }
       }

    } else {
       // 点击白块 - 游戏结束
       const currentRows = rowsRef.current;
       const newRows = [...currentRows];
       newRows[rowIndex] = { ...newRows[rowIndex], missedIndex: colIndex };
       rowsRef.current = newRows;
       setRows([...newRows]);
       
       requestAnimationFrame(() => {
       playSound('gameover');
       endGame(false);
       });
    }
  };

  const stopGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (gameLoopRef.current !== null) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const endGame = (success: boolean) => {
    stopGame();
    setStatus('GAME_OVER');
    statusRef.current = 'GAME_OVER';
    
    let isNewRecord = false;
    
    // For Classic mode, calculate the actual time using ref to get accurate timing
    let currentScore: number;
    if (mode === 'CLASSIC') {
      if (success) {
        // Calculate final time directly from start time ref for accuracy
        const finalTime = startTimeRef.current > 0 ? (Date.now() - startTimeRef.current) / 1000 : timer;
        currentScore = finalTime;
        // Update timer state to show final time
        setTimer(finalTime);
      } else {
        currentScore = Infinity;
      }
    } else {
      currentScore = score;
    }
    
    const currentBest = highScores[mode];
    const newHighScores = { ...highScores };
    
    if (mode === 'CLASSIC') {
       // Classic mode: lower time is better (Infinity means no record yet)
       // Always save the first successful completion
       if (success && (currentBest === Infinity || currentScore < currentBest)) {
         newHighScores[mode] = currentScore;
         isNewRecord = currentBest === Infinity || currentScore < currentBest;
         setHighScores(newHighScores);
         localStorage.setItem('pianoTilesHighScores', JSON.stringify(newHighScores));
       }
    } else {
       if (currentScore > currentBest) {
         newHighScores[mode] = currentScore;
         isNewRecord = true;
         setHighScores(newHighScores);
         localStorage.setItem('pianoTilesHighScores', JSON.stringify(newHighScores));
       }
    }

    setResult({ success, isNewRecord });
    
    // 跟踪游戏完成/失败事件
    if (success) {
      if (mode === 'CLASSIC') {
        analytics.gameComplete(mode, undefined, currentScore);
      } else {
        analytics.gameComplete(mode, currentScore);
      }
    } else {
      analytics.gameFail(mode, currentScore === Infinity ? undefined : currentScore);
    }
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


  const handleBack = () => {
    stopGame();
    analytics.backToHome(mode);
    if (initialMode) {
      // If came from a dedicated route, go back to home
      window.location.href = '/';
    } else {
      // If in SPA mode, go back to menu
      setStatus('MENU');
      statusRef.current = 'MENU';
    }
  };

  const handleMenuBtn = () => {
    stopGame();
    analytics.backToHome(mode);
     if (initialMode) {
       window.location.href = '/';
     } else {
       setStatus('MENU');
      statusRef.current = 'MENU';
     }
  };



  // -- RENDER --

  if (status === 'MENU') {
    return <GameMenu />;
  }

  return (
    <>
    <div className="flex-1 w-full h-full flex flex-col bg-white md:rounded-xl shadow-xl overflow-hidden relative">
      {/* Game Header */}
      <div className="flex justify-between items-center p-3 bg-gray-50 border-b border-gray-100 z-20 flex-wrap gap-2 shrink-0">
        {initialMode ? (
          <a
            href="/"
            onClick={() => stopGame()} // Ensure game loop stops
            className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-bold text-gray-700 transition flex items-center justify-center shrink-0"
          >
            ← Home
          </a>
        ) : (
          <button 
            onClick={handleBack}
            className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-bold text-gray-700 transition shrink-0"
          >
            ← Back
          </button>
        )}
        <div className="flex gap-3 text-xs md:text-sm flex-wrap items-center">
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
             <div className="hidden sm:flex items-center gap-1">
                <span className="font-semibold text-gray-500">Speed:</span>
                <span className={`font-bold tabular-nums ${speed < 400 ? 'text-red-500' : 'text-gray-800'}`}>
                  {((mode === 'RUSH' ? INITIAL_SPEEDS.RUSH : INITIAL_SPEEDS.ARCADE) / speed).toFixed(1)}x
                </span>
             </div>
           )}
        </div>
      </div>

      {/* Game Board */}
      <div className="flex-1 relative w-full max-w-[400px] mx-auto bg-[#f5f5f5] border-x-4 border-gray-800 overflow-hidden touch-none min-h-0">
         {/* Grid */}
         <div className="w-full h-full flex flex-col relative">
            {rows.slice(0, 5).map((row, rIdx) => (
               <div 
                  key={row.id} 
                  className="w-full flex-1 flex border-b border-gray-200 min-h-0 transform-gpu will-change-transform"
               >
                  {[0, 1, 2, 3].map((col) => {
                     const isBlack = row.blackIndex === col;
                     let bgClass = isBlack ? 'bg-[#1a1a1a]' : 'bg-white';
                     
                     if (isBlack && row.clicked) {
                        bgClass = 'bg-gray-400';
                     }
                     if (isBlack && row.clicked && mode !== 'CLASSIC') {
                        bgClass = 'bg-gray-400';
                     }
                     if (row.missedIndex === col) {
                        bgClass = 'bg-red-500';
                     }
                     
                     return (
                       <div 
                         key={col}
                         onMouseDown={(e) => { 
                            e.preventDefault();
                            handleTileClick(rIdx, col, isBlack); 
                         }}
                         onTouchStart={(e) => { 
                            e.preventDefault();
                            handleTileClick(rIdx, col, isBlack); 
                         }}
                         className={`w-1/4 h-full border-r border-gray-200 relative cursor-pointer transform-gpu will-change-[background-color] ${bgClass} select-none`}
                         style={{ transition: 'background-color 50ms ease-out' }}
                       />
                     );
                  })}
               </div>
            ))}
         </div>
         
         {/* Countdown Overlay */}
         {status === 'COUNTDOWN' && (
           <div className="absolute inset-0 bg-white/30 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">
             <div className="text-9xl font-black text-gray-800 drop-shadow-lg">
               {countdown === 0 ? 'GO!' : countdown}
             </div>
           </div>
         )}
         
         {/* Game Over Overlay */}
         {status === 'GAME_OVER' && result && (
           <div className="absolute inset-0 bg-black/85 flex flex-col justify-center items-center text-white z-50 animate-fadeIn p-8 text-center overflow-y-auto">
              <h2 className="text-4xl font-bold mb-4">{result.success ? '🎉 Awesome!' : '😢 Game Over'}</h2>
              

              <div className="bg-white/10 p-6 rounded-xl mb-4 w-full">
                 <p className="text-xl mb-2">{mode === 'CLASSIC' ? (result.success ? `Time: ${timer.toFixed(2)}s` : 'Failed') : `Score: ${score}`}</p>
                 {result.isNewRecord && <div className="text-yellow-400 font-bold">🏆 New Record!</div>}
              </div>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    if (initialMode) {
                      // 跟踪游戏重试事件
                      analytics.gameRetry(mode);
                      // Refresh page to trigger ad refresh
                      window.location.reload();
                    } else {
                      analytics.gameRetry(mode);
                      startGame(mode);
                    }
                  }}
                  className="bg-primary hover:brightness-110 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-opacity duration-150"
                >
                  Play Again
                </button>
                <button 
                  onClick={handleMenuBtn}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-opacity duration-150"
                >
                  Home
                </button>
              </div>
           </div>
         )}
      </div>

    </div>
    </>
  );
}
