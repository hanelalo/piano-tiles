// 游戏状态
const GameState = {
    MENU: 'menu',
    COUNTDOWN: 'countdown',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameover'
};

// 游戏模式
const GameMode = {
    CLASSIC: 'classic',
    ARCADE: 'arcade',
    ZEN: 'zen',
    RUSH: 'rush'
};

// 游戏配置
const CONFIG = {
    ROWS: 4,
    COLS: 4,
    CLASSIC_TARGET: 50,
    ZEN_TIME: 30,
    // 基础速度配置 (ms/row)
    INITIAL_SPEED: 800,  // 经典模式初始速度
    ARCADE_INITIAL: 600, // 街机模式初始速度
    RUSH_INITIAL: 500,   // 竞速模式初始速度
    MIN_SPEED: 150,      // 最快速度上限
    
    // 加速配置
    SPEED_DROP_PER_CLICK: 2, // 每次点击减少的毫秒数 (平滑加速)
    SPEED_LEVEL_STEP: 50,    // 每多少分提升一个明显等级
    KEYS: ['KeyD', 'KeyF', 'KeyJ', 'KeyK'] // 键盘映射
};

// 音效管理器 (使用 Web Audio API)
class SoundManager {
    constructor() {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.enabled = true;
    }

    playClick() {
        if (!this.enabled) return;
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        
        osc.type = 'sine';
        // 随机一点音高变化，听起来更自然
        osc.frequency.setValueAtTime(400 + Math.random() * 200, this.context.currentTime);
        osc.frequency.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.15);
        
        gain.gain.setValueAtTime(0.3, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.15);
        
        osc.connect(gain);
        gain.connect(this.context.destination);
        
        osc.start();
        osc.stop(this.context.currentTime + 0.15);
    }

    playGameOver() {
        if (!this.enabled) return;
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, this.context.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.context.currentTime + 0.5);
        
        gain.gain.setValueAtTime(0.5, this.context.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.context.currentTime + 0.5);
        
        osc.connect(gain);
        gain.connect(this.context.destination);
        
        osc.start();
        osc.stop(this.context.currentTime + 0.5);
    }

    resume() {
        if (this.context.state === 'suspended') {
            this.context.resume();
        }
    }
}

class PianoTilesGame {
    constructor() {
        this.state = GameState.MENU;
        this.mode = null;
        this.score = 0;
        this.timer = 0;
        this.speed = CONFIG.INITIAL_SPEED;
        this.timerInterval = null;
        this.gameInterval = null;
        this.rows = [];
        this.moveCount = 0;
        
        this.soundManager = new SoundManager();
        this.highScores = this.loadHighScores();

        this.initializeElements();
        this.bindEvents();
        this.updateHighScoreDisplay();
    }

    loadHighScores() {
        try {
            const stored = localStorage.getItem('pianoTilesHighScores');
            const parsed = stored ? JSON.parse(stored) : null;
            
            // 默认值
            const defaults = {
                [GameMode.CLASSIC]: Infinity,
                [GameMode.ARCADE]: 0,
                [GameMode.ZEN]: 0,
                [GameMode.RUSH]: 0
            };

            // 如果没有存储或解析失败，返回默认值
            if (!parsed) return defaults;

            // 确保所有模式都有值，混合默认值和存储值
            return { ...defaults, ...parsed };
        } catch (e) {
            console.error('Failed to load high scores:', e);
            return {
                [GameMode.CLASSIC]: Infinity,
                [GameMode.ARCADE]: 0,
                [GameMode.ZEN]: 0,
                [GameMode.RUSH]: 0
            };
        }
    }

    saveHighScore(mode, score) {
        let isNewRecord = false;
        
        if (mode === GameMode.CLASSIC) {
            // 经典模式：时间越短越好
            if (score < this.highScores[mode]) {
                this.highScores[mode] = score;
                isNewRecord = true;
            }
        } else {
            // 其他模式：分数越高越好
            if (score > this.highScores[mode]) {
                this.highScores[mode] = score;
                isNewRecord = true;
            }
        }

        if (isNewRecord) {
            localStorage.setItem('pianoTilesHighScores', JSON.stringify(this.highScores));
            this.updateHighScoreDisplay();
        }
        
        return isNewRecord;
    }

    initializeElements() {
        this.menuEl = document.getElementById('menu');
        this.gameEl = document.getElementById('game');
        this.gameBoardEl = document.getElementById('gameBoard');
        this.scoreEl = document.getElementById('score');
        this.timerEl = document.getElementById('timer');
        this.modeDisplayEl = document.getElementById('modeDisplay');
        this.gameOverEl = document.getElementById('gameOver');
        this.finalScoreEl = document.getElementById('finalScoreText');
        this.finalTimeEl = document.getElementById('finalTimeText');
        this.scoreLabelEl = document.getElementById('scoreLabel');
        this.timerLabelEl = document.getElementById('timerLabel');
        
        this.speedInfoEl = document.getElementById('speedInfo');
        this.speedDisplayEl = document.getElementById('speedDisplay');
        
        this.countdownEl = document.getElementById('countdown');
        this.countdownNumEl = document.getElementById('countdownNum');
    }

    updateHighScoreDisplay() {
        const formatScore = (mode, score) => {
            if (mode === GameMode.CLASSIC) {
                if (score === Infinity || score === null || score === undefined) return '--';
                return `${Number(score).toFixed(2)}s`;
            }
            return (!score && score !== 0) ? '--' : score;
        };

        document.getElementById('best-classic').textContent = formatScore(GameMode.CLASSIC, this.highScores[GameMode.CLASSIC]);
        document.getElementById('best-arcade').textContent = formatScore(GameMode.ARCADE, this.highScores[GameMode.ARCADE]);
        document.getElementById('best-zen').textContent = formatScore(GameMode.ZEN, this.highScores[GameMode.ZEN]);
        document.getElementById('best-rush').textContent = formatScore(GameMode.RUSH, this.highScores[GameMode.RUSH]);
    }

    bindEvents() {
        // 模式选择
        document.querySelectorAll('.mode-card').forEach(card => {
            card.addEventListener('click', () => {
                const mode = card.dataset.mode;
                this.soundManager.resume(); // 激活音频上下文
                this.prepareGame(mode);
            });
        });

        // 返回按钮
        document.getElementById('backBtn').addEventListener('click', () => this.backToMenu());

        // 重新开始
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());

        // 返回菜单
        document.getElementById('menuBtn').addEventListener('click', () => this.backToMenu());

        // 键盘事件
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    handleKeyPress(e) {
        if (this.state !== GameState.PLAYING) return;

        const keyIndex = CONFIG.KEYS.indexOf(e.code);
        if (keyIndex !== -1) {
            // 找到最底部一行的对应列
            // 注意：rows[0] 是最上面的一行，rows[rows.length-1] 是最下面的一行
            // 这里的逻辑需要和 addRow 的 unshift 配合
            // 实际上因为我们是 insertBefore，界面上最下面的是最早添加的，也就是数组末尾的
            
            // 我们需要找"可点击"的那一行。通常是最下面一行。
            // 但是如果有动画或者为了容错，可能需要判定逻辑
            
            // 简单逻辑：点击最底部的一行 (rows.length - 1)
            if (this.rows.length > 0) {
                const targetRow = this.rows[this.rows.length - 1];
                const tile = targetRow[keyIndex];
                
                // 模拟点击
                if (tile) {
                    this.checkTile(tile);
                    // 添加按压效果
                    tile.classList.add('active');
                    setTimeout(() => tile.classList.remove('active'), 100);
                }
            }
        }
    }

    prepareGame(mode) {
        this.mode = mode;
        this.menuEl.classList.add('hidden');
        this.gameEl.classList.remove('hidden');
        this.gameOverEl.classList.add('hidden');
        
        this.setupGameMode();
        this.initializeBoard();
        
        // 开始倒计时
        this.startCountdown();
    }

    startCountdown() {
        this.state = GameState.COUNTDOWN;
        this.countdownEl.classList.remove('hidden');
        let count = 3;
        this.countdownNumEl.textContent = count;
        
        const countInterval = setInterval(() => {
            count--;
            if (count > 0) {
                this.countdownNumEl.textContent = count;
                // 重置动画
                this.countdownNumEl.style.animation = 'none';
                this.countdownNumEl.offsetHeight; /* trigger reflow */
                this.countdownNumEl.style.animation = null; 
            } else if (count === 0) {
                this.countdownNumEl.textContent = 'GO!';
            } else {
                clearInterval(countInterval);
                this.countdownEl.classList.add('hidden');
                this.startGame();
            }
        }, 600); // 稍微快一点的倒计时
    }

    startGame() {
        this.state = GameState.PLAYING;
        this.score = 0;
        this.timer = 0;
        this.moveCount = 0;
        
        // 根据模式设置初始速度
        if (this.mode === GameMode.RUSH) {
            this.speed = CONFIG.RUSH_INITIAL;
        } else if (this.mode === GameMode.ARCADE) {
            this.speed = CONFIG.ARCADE_INITIAL;
        } else {
            this.speed = CONFIG.INITIAL_SPEED;
        }

        this.startTimer();
        this.startGameLoop();
        this.updateDisplay();
    }

    setupGameMode() {
        const modeNames = {
            [GameMode.CLASSIC]: 'Classic',
            [GameMode.ARCADE]: 'Arcade',
            [GameMode.ZEN]: 'Zen',
            [GameMode.RUSH]: 'Rush'
        };

        this.modeDisplayEl.textContent = modeNames[this.mode];

        if (this.mode === GameMode.CLASSIC) {
            this.scoreLabelEl.textContent = 'Progress:';
            this.timerLabelEl.textContent = 'Time:';
            this.speedInfoEl.classList.add('hidden');
        } else if (this.mode === GameMode.ZEN) {
            this.scoreLabelEl.textContent = 'Score:';
            this.timerLabelEl.textContent = 'Time:';
            this.speedInfoEl.classList.add('hidden');
        } else {
            this.scoreLabelEl.textContent = 'Score:';
            this.timerLabelEl.textContent = 'Time:';
            this.speedInfoEl.classList.remove('hidden');
        }

        this.updateDisplay();
    }

    initializeBoard() {
        this.gameBoardEl.innerHTML = '';
        this.rows = [];
        for (let i = 0; i < CONFIG.ROWS; i++) {
            this.addRow();
        }
    }

    addRow() {
        const row = [];
        const blackTileIndex = Math.floor(Math.random() * CONFIG.COLS);

        for (let col = 0; col < CONFIG.COLS; col++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.dataset.row = this.rows.length;
            tile.dataset.col = col;

            if (col === blackTileIndex) {
                tile.classList.add('black');
                tile.dataset.black = 'true';
            } else {
                tile.classList.add('white');
                tile.dataset.black = 'false';
            }

            // 支持触摸和点击
            const handleInput = (e) => {
                e.preventDefault(); // 防止双击缩放等
                this.checkTile(tile);
            };
            
            tile.addEventListener('mousedown', handleInput);
            tile.addEventListener('touchstart', handleInput, { passive: false });
            
            this.gameBoardEl.insertBefore(tile, this.gameBoardEl.firstChild);
            row.push(tile);
        }

        this.rows.unshift(row);

        if (this.rows.length > CONFIG.ROWS + 1) { // 保留多一行作为缓冲
            const removedRow = this.rows.pop();
            removedRow.forEach(tile => {
                if (tile.parentNode) {
                    tile.parentNode.removeChild(tile);
                }
            });
        }
    }

    checkTile(tile) {
        if (this.state !== GameState.PLAYING) return;
        
        // 简单的防重复点击检查
        if (tile.classList.contains('clicked') || tile.classList.contains('missed')) return;

        const isBlack = tile.dataset.black === 'true';
        
        // 必须点击最底部的一行(或者倒数第二行，为了手感容错)
        // 这里的逻辑：如果点击的是黑块，必须是当前屏幕上最下面的那个黑块
        // 简单处理：只检查是否是黑块
        
        // 更严格的逻辑：检查是否是"有效"行。
        // 这里为了手感流畅，暂时只判断黑白，不严格限制行（除了不能点太上面的）
        
        if (isBlack) {
            this.handleSuccess(tile);
        } else {
            this.handleFailure(tile);
        }
    }

    handleSuccess(tile) {
        this.soundManager.playClick();
        
        tile.classList.remove('black');
        tile.classList.add('clicked');
        
        // 为街机和禅模式添加绿色反馈，经典模式保持灰色
        if (this.mode !== GameMode.CLASSIC) {
            tile.classList.add('success');
        }
        
        tile.dataset.black = 'false';
        
        this.score++;
        this.updateDisplay();

        if (this.mode === GameMode.CLASSIC && this.score >= CONFIG.CLASSIC_TARGET) {
            this.endGame(true);
        }

        // 加速逻辑：街机和竞速模式
        if (this.mode === GameMode.ARCADE || this.mode === GameMode.RUSH) {
            // 每次点击都微调速度
            if (this.speed > CONFIG.MIN_SPEED) {
                // 竞速模式加速更快
                const drop = this.mode === GameMode.RUSH ? CONFIG.SPEED_DROP_PER_CLICK * 1.5 : CONFIG.SPEED_DROP_PER_CLICK;
                this.speed = Math.max(CONFIG.MIN_SPEED, this.speed - drop);
                
                // 只有速度发生明显变化时才重置定时器，避免过于频繁的重置导致卡顿感
                // 这里我们每点击一次都重置，为了保证即时反馈，但通过平滑的速度变化让玩家适应
                this.restartGameLoop();
            }
        }
    }

    handleFailure(tile) {
        this.soundManager.playGameOver();
        tile.classList.add('missed');
        this.endGame(false);
    }

    startTimer() {
        const startTime = Date.now();
        
        this.timerInterval = setInterval(() => {
            if (this.state !== GameState.PLAYING) return;

            if (this.mode === GameMode.ZEN) {
                this.timer = Math.max(0, CONFIG.ZEN_TIME - (Date.now() - startTime) / 1000);
                if (this.timer <= 0) {
                    this.endGame(true);
                }
            } else {
                this.timer = (Date.now() - startTime) / 1000;
            }
            
            this.updateDisplay();
        }, 10);
    }

    startGameLoop() {
        this.gameInterval = setInterval(() => {
            if (this.state !== GameState.PLAYING) return;

            if (this.moveCount >= CONFIG.ROWS) {
                if (this.rows.length > 0) {
                    const lastRow = this.rows[this.rows.length - 1];
                    // 检查这一行是否还有黑块没被点掉
                    const hasUnclickedBlack = lastRow.some(tile => 
                        tile.dataset.black === 'true'
                    );

                    if (hasUnclickedBlack) {
                        // 漏掉了黑块，高亮显示漏掉的块
                        const missedTile = lastRow.find(t => t.dataset.black === 'true');
                        if (missedTile) missedTile.classList.add('missed');
                        this.soundManager.playGameOver();
                        this.endGame(false);
                        return;
                    }
                }
            }

            this.addRow();
            this.moveCount++;
        }, this.speed);
    }

    restartGameLoop() {
        clearInterval(this.gameInterval);
        this.startGameLoop();
    }

    updateDisplay() {
        if (this.mode === GameMode.CLASSIC) {
            this.scoreEl.textContent = `${this.score}/${CONFIG.CLASSIC_TARGET}`;
        } else {
            this.scoreEl.textContent = this.score;
        }
        this.timerEl.textContent = `${this.timer.toFixed(2)}s`;
        
        // 更新速度显示
        if (this.mode === GameMode.ARCADE || this.mode === GameMode.RUSH) {
            const baseSpeed = this.mode === GameMode.RUSH ? CONFIG.RUSH_INITIAL : CONFIG.ARCADE_INITIAL;
            const speedRate = (baseSpeed / this.speed).toFixed(1);
            this.speedDisplayEl.textContent = `${speedRate}x`;
            
            // 速度等级越高，颜色越红
            const rate = parseFloat(speedRate);
            if (rate > 2.5) this.speedDisplayEl.style.color = '#ff0000';
            else if (rate > 1.8) this.speedDisplayEl.style.color = '#ff6b6b';
            else if (rate > 1.4) this.speedDisplayEl.style.color = '#ff9f43';
            else this.speedDisplayEl.style.color = '#333';
        }
    }

    endGame(success) {
        this.state = GameState.GAME_OVER;
        clearInterval(this.timerInterval);
        clearInterval(this.gameInterval);

        this.gameOverEl.classList.remove('hidden');

        // 计算并保存最高分
        let finalValue = this.score;
        if (this.mode === GameMode.CLASSIC) {
            finalValue = success ? parseFloat(this.timer.toFixed(2)) : Infinity;
        }
        
        // 只有在成功或者非经典模式下才记录
        let isNewRecord = false;
        if (success || this.mode !== GameMode.CLASSIC) {
             isNewRecord = this.saveHighScore(this.mode, finalValue);
        }

        let scoreText = '';
        let timeText = '';

        if (this.mode === GameMode.CLASSIC) {
            scoreText = success ? `🎉 Success!` : `😢 Failed`;
            timeText = success ? `Time: ${this.timer.toFixed(2)}s` : `Progress: ${this.score}/${CONFIG.CLASSIC_TARGET}`;
        } else if (this.mode === GameMode.ZEN) {
            scoreText = `⏱️ Time's Up!`;
            timeText = `Score: ${this.score}`;
        } else {
            scoreText = success ? `🎉 Awesome!` : `😢 Game Over`;
            timeText = `Score: ${this.score}`;
        }

        this.finalScoreEl.textContent = scoreText;
        this.finalTimeEl.innerHTML = `${timeText} ${isNewRecord ? '<br><div class="new-record">🏆 New Record!</div>' : ''}`;
    }

    restartGame() {
        this.gameOverEl.classList.add('hidden');
        this.prepareGame(this.mode);
    }

    backToMenu() {
        this.state = GameState.MENU;
        clearInterval(this.timerInterval);
        clearInterval(this.gameInterval);

        this.gameEl.classList.add('hidden');
        this.menuEl.classList.remove('hidden');
        this.gameOverEl.classList.add('hidden');
        this.updateHighScoreDisplay(); // 更新菜单上的分数
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    // 防止移动端双击缩放
    document.addEventListener('dblclick', function(event) {
        event.preventDefault();
    }, { passive: false });
    
    new PianoTilesGame();
});
