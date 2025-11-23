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
  RUSH: 700, // Rush 模式从较慢开始，逐渐加速
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
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

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
             const drop = mode === 'RUSH' ? SPEED_DROP * 1.5 : SPEED_DROP;
             const newSpeed = Math.max(MIN_SPEED, speedRef.current - drop);
             speedRef.current = newSpeed;
             setSpeed(newSpeed);
             startGameLoop(); 
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
    const currentScore = mode === 'CLASSIC' ? (success ? timer : Infinity) : score;
    const currentBest = highScores[mode];
    
    const newHighScores = { ...highScores };
    
    if (mode === 'CLASSIC') {
       // Classic mode: lower time is better (Infinity means no record yet)
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

  // Privacy Policy Modal Component
  const PrivacyPolicyModal = () => {
    if (!showPrivacyPolicy) return null;

    return (
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn"
        onClick={() => setShowPrivacyPolicy(false)}
      >
        <div 
          className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-popIn"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center z-10">
            <h2 className="text-xl font-bold text-gray-800">🔒 Privacy Policy</h2>
            <button
              onClick={() => setShowPrivacyPolicy(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            >
              ×
            </button>
          </div>
          
          <div className="p-6 space-y-4 text-sm text-gray-600">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Data Collection</h3>
              <p className="leading-relaxed">
                This Piano Tiles game operates entirely in your browser. 
                We only store your game high scores locally on your device using browser localStorage. 
                No personal information is collected, transmitted, or stored on our servers.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Local Storage</h3>
              <p className="leading-relaxed">
                Your best scores for each game mode are saved locally in your browser's localStorage. 
                This data remains on your device and is never shared with third parties. 
                You can clear this data at any time by clearing your browser's cache.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">No Tracking</h3>
              <p className="leading-relaxed">
                We do not use cookies, analytics, or any tracking technologies. 
                Your gameplay is private and not monitored.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Third-Party Services</h3>
              <p className="leading-relaxed">
                This game may display advertisements that are served by third-party ad networks. 
                These networks may collect information according to their own privacy policies. 
                We are not responsible for the privacy practices of these third parties.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Children's Privacy</h3>
              <p className="leading-relaxed">
                This game is suitable for all ages. 
                We do not knowingly collect personal information from children. 
                All game data remains local to your device.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Changes to Privacy Policy</h3>
              <p className="leading-relaxed">
                We may update this privacy policy from time to time. 
                Any changes will be posted on this page with an updated revision date.
              </p>
            </div>

            <div className="pt-4 border-t border-gray-200 text-xs text-gray-500">
              <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            <div className="pt-4">
              <button
                onClick={() => setShowPrivacyPolicy(false)}
                className="w-full bg-primary hover:brightness-110 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Terms of Service Modal Component
  const TermsModal = () => {
    if (!showTerms) return null;

    return (
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn"
        onClick={() => setShowTerms(false)}
      >
        <div 
          className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-popIn"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center z-10">
            <h2 className="text-xl font-bold text-gray-800">📋 Terms of Service</h2>
            <button
              onClick={() => setShowTerms(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            >
              ×
            </button>
          </div>
          
          <div className="p-6 space-y-4 text-sm text-gray-600">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Acceptance of Terms</h3>
              <p className="leading-relaxed">
                By accessing and using this Piano Tiles game website, you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Use License</h3>
              <p className="leading-relaxed">
                Permission is granted to temporarily access and play this game for personal, non-commercial use only. 
                This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                <li>Modify or copy the game materials</li>
                <li>Use the game for any commercial purpose</li>
                <li>Attempt to decompile or reverse engineer any software</li>
                <li>Remove any copyright or other proprietary notations</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Disclaimer</h3>
              <p className="leading-relaxed">
                The materials on this website are provided on an 'as is' basis. 
                We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, 
                without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, 
                or non-infringement of intellectual property or other violation of rights.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Limitations</h3>
              <p className="leading-relaxed">
                In no event shall we or our suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, 
                or due to business interruption) arising out of the use or inability to use the materials on this website, 
                even if we or an authorized representative has been notified orally or in writing of the possibility of such damage.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Accuracy of Materials</h3>
              <p className="leading-relaxed">
                The materials appearing on this website could include technical, typographical, or photographic errors. 
                We do not warrant that any of the materials on its website are accurate, complete, or current.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Modifications</h3>
              <p className="leading-relaxed">
                We may revise these terms of service at any time without notice. 
                By using this website you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Governing Law</h3>
              <p className="leading-relaxed">
                These terms and conditions are governed by and construed in accordance with applicable laws. 
                Any disputes relating to these terms and conditions shall be subject to the exclusive jurisdiction of the courts.
              </p>
            </div>

            <div className="pt-4 border-t border-gray-200 text-xs text-gray-500">
              <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            <div className="pt-4">
              <button
                onClick={() => setShowTerms(false)}
                className="w-full bg-primary hover:brightness-110 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };


  // -- RENDER --

  if (status === 'MENU') {
    return (
      <>
        <PrivacyPolicyModal />
        <TermsModal />
        <div className="flex-1 w-full h-full overflow-y-auto p-5 no-scrollbar animate-fadeIn bg-gradient-to-b from-[#f5f7fa] to-white md:bg-white md:rounded-xl" data-game-container>
        {/* Game Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {[
            { 
              id: 'CLASSIC', 
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
              id: 'ARCADE', 
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
              id: 'ZEN', 
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
              id: 'RUSH', 
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
          ].map((m) => {
            const isClassic = m.id === 'CLASSIC';
            const isArcade = m.id === 'ARCADE';
            const isZen = m.id === 'ZEN';
            const isRush = m.id === 'RUSH';
            
            return (
            <a 
              key={m.id}
              href={`/mode/${m.id.toLowerCase()}`}
              className={`${m.colors.bg} p-5 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex md:flex-col items-center md:text-center gap-4 border-2 ${m.colors.border} ${
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
                <h2 className={`text-xl font-bold ${m.colors.title} mb-1`}>{m.label}</h2>
                <p className="text-gray-600 text-sm mb-1">{m.desc}</p>
                <p className="text-gray-500 text-xs">{m.sub}</p>
                <div className={`mt-2 pt-2 border-t ${m.colors.border} text-sm font-bold ${m.colors.score}`}>
                  Best: {formatScore(m.id as GameMode, highScores[m.id as keyof HighScores])}
                </div>
              </div>
            </a>
          )})}
        </div>

        {/* Game Information - Combined Section */}
        <div className="bg-white rounded-xl p-5 shadow-md border border-gray-200">
          {/* How to Play Section */}
          <h2 className="text-xl font-bold text-gray-800 mb-3">🎹 How to Play Piano Tiles</h2>
          <div className="space-y-3 text-sm text-gray-600 mb-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Basic Rules:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Tap only the <strong className="text-gray-900">black tiles</strong> as they scroll down</li>
                <li>Never tap the <strong className="text-gray-900">white tiles</strong> or you'll lose</li>
                <li>Each correctly tapped black tile increases your score</li>
                <li>Missing a black tile that reaches the bottom ends the game</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Tips for Success:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Stay focused and keep your eyes on the tiles</li>
                <li>Use multiple fingers for faster tapping</li>
                <li>Practice regularly to improve your reaction time</li>
                <li>Don't rush - accuracy is more important than speed</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Controls:</h3>
              <p className="ml-2">You can play using your mouse, touchscreen, or keyboard (D, F, J, K keys).</p>
            </div>
          </div>

          {/* Game Modes Section */}
          <h2 className="text-xl font-bold text-gray-800 mb-3 mt-6 pt-6 border-t border-gray-200">🎮 Game Modes Explained</h2>
          <div className="space-y-4 text-sm text-gray-600 mb-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">🎯 Classic Mode</h3>
              <p className="ml-2">The original Piano Tiles challenge. Tap 50 black tiles as quickly as possible. Your goal is to complete all 50 tiles in the shortest time. Perfect for players who want to beat their personal best!</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">⚡ Arcade Mode</h3>
              <p className="ml-2">Endless mode where the speed gradually increases with each tile you tap. See how many tiles you can hit before making a mistake! The game gets progressively faster, testing your limits.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">🧘 Zen Mode</h3>
              <p className="ml-2">Relax and play at your own pace. You have 30 seconds to tap as many black tiles as possible. No pressure from increasing speed - just focus on accuracy and see how many tiles you can score!</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">🏃 Rush Mode</h3>
              <p className="ml-2">For expert players! Rush mode starts at a moderate speed and accelerates rapidly. This is the ultimate test of your reflexes and precision. Can you handle the extreme pace?</p>
            </div>
          </div>

          {/* Game History Section */}
          <h2 className="text-xl font-bold text-gray-800 mb-3 mt-6 pt-6 border-t border-gray-200">📚 About Piano Tiles</h2>
          <div className="text-sm text-gray-600 space-y-3">
            <p className="leading-relaxed">
              Piano Tiles (also known as Don't Tap The White Tile or Magic Piano) is a classic rhythm game that became popular worldwide. 
              The game challenges players to tap only the black tiles while avoiding the white ones as they scroll down the screen. 
              Originally developed by Cheetah Mobile, Piano Tiles has become one of the most beloved mobile games, combining simple mechanics with addictive gameplay.
            </p>
            <p className="leading-relaxed">
              Our online version brings the classic Piano Tiles experience to your browser with smooth animations and multiple game modes. 
              Test your reflexes, improve your reaction time, and see how fast you can tap without missing a black tile!
            </p>
          </div>
        </div>

        {/* Footer Links - Terms and Privacy Policy */}
        <div className="mt-6 pt-6 border-t border-gray-300 pb-4">
          <div className="flex justify-center items-center gap-4 text-xs">
            <button
              onClick={() => setShowTerms(true)}
              className="text-gray-600 hover:text-gray-800 underline transition-colors"
            >
              Terms of Service
            </button>
            <span className="text-gray-400">|</span>
            <button
              onClick={() => setShowPrivacyPolicy(true)}
              className="text-gray-600 hover:text-gray-800 underline transition-colors"
            >
              Privacy Policy
            </button>
          </div>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
      <PrivacyPolicyModal />
      <TermsModal />
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
           <div className="absolute inset-0 bg-black/85 flex flex-col justify-center items-center text-white z-50 animate-fadeIn p-8 text-center">
              <h2 className="text-4xl font-bold mb-4">{result.success ? '🎉 Awesome!' : '😢 Game Over'}</h2>
              <div className="bg-white/10 p-6 rounded-xl mb-6 w-full">
                 <p className="text-xl mb-2">{mode === 'CLASSIC' ? (result.success ? `Time: ${timer.toFixed(2)}s` : 'Failed') : `Score: ${score}`}</p>
                 {result.isNewRecord && <div className="text-yellow-400 font-bold">🏆 New Record!</div>}
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    if (initialMode) {
                      // Refresh page to trigger ad refresh
                      window.location.reload();
                    } else {
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

      {/* Ad Space - Reserved for future ads */}
      <div className="w-full h-[50px] shrink-0 bg-transparent flex items-center justify-center">
        {/* Ad Space Reserved for Future Ads */}
      </div>
      </div>
    </>
  );
}
