import { Component, OnInit, OnDestroy, HostListener, ViewChild, ElementRef, AfterViewInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateManagerService } from '@content-lab/core';
import { StatefulComponent } from '@content-lab/core';
import { ResetButtonComponent } from '@content-lab/ui-components'  // NOTE: update to specific componentreset-button/reset-button.component';

interface TetrisState {
  highScore: number;
  soundEnabled: boolean;
}

interface Tetromino {
  shape: number[][];
  color: string;
  x: number;
  y: number;
}

@Component({
  selector: 'app-tetris',
  standalone: true,
  imports: [CommonModule, ResetButtonComponent],
  templateUrl: './tetris.component.html',
  styleUrl: './tetris.component.scss'
})
export class TetrisComponent extends StatefulComponent<TetrisState> implements OnInit, AfterViewInit, OnDestroy {
  protected readonly TOOL_ID = 'tetris';

  @ViewChild('gameCanvas', { static: false }) gameCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('nextPieceCanvas', { static: false }) nextPieceCanvas!: ElementRef<HTMLCanvasElement>;

  private ctx: CanvasRenderingContext2D | null = null;
  private nextPieceCtx: CanvasRenderingContext2D | null = null;
  private animationFrameId: number | null = null;

  // Game constants
  readonly BOARD_WIDTH = 10;
  readonly BOARD_HEIGHT = 20;
  readonly BLOCK_SIZE = 30;
  readonly INITIAL_SPEED = 800;
  readonly SPEED_INCREASE_PER_LEVEL = 50;

  // Game state
  board: number[][] = [];
  currentPiece: Tetromino | null = null;
  nextPiece: Tetromino | null = null;
  score = 0;
  level = 1;
  lines = 0;
  gameOver = false;
  paused = false;
  gameStarted = false;
  highScore = 0;
  soundEnabled = true;

  // Game loop
  private gameInterval: any = null;
  private currentSpeed = this.INITIAL_SPEED;
  private lastMoveTime = 0;

  // Tetromino shapes
  private readonly SHAPES = {
    I: { shape: [[1, 1, 1, 1]], color: '#00f0f0' },
    O: { shape: [[1, 1], [1, 1]], color: '#f0f000' },
    T: { shape: [[0, 1, 0], [1, 1, 1]], color: '#a000f0' },
    S: { shape: [[0, 1, 1], [1, 1, 0]], color: '#00f000' },
    Z: { shape: [[1, 1, 0], [0, 1, 1]], color: '#f00000' },
    J: { shape: [[1, 0, 0], [1, 1, 1]], color: '#0000f0' },
    L: { shape: [[0, 0, 1], [1, 1, 1]], color: '#f0a000' }
  };

  private readonly COLOR_MAP: { [key: number]: string } = {
    0: '',
    1: '#00f0f0',
    2: '#f0f000',
    3: '#a000f0',
    4: '#00f000',
    5: '#f00000',
    6: '#0000f0',
    7: '#f0a000'
  };

  // Audio contexts for sound effects
  private audioContext: AudioContext | null = null;

  constructor(
    stateManager: StateManagerService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {
    super(stateManager);
  }

  protected getDefaultState(): TetrisState {
    return {
      highScore: 0,
      soundEnabled: true
    };
  }

  protected applyState(state: TetrisState): void {
    this.highScore = state.highScore;
    this.soundEnabled = state.soundEnabled;
  }

  protected getCurrentState(): TetrisState {
    return {
      highScore: this.highScore,
      soundEnabled: this.soundEnabled
    };
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.initializeBoard();
    this.initializeAudio();
  }

  ngAfterViewInit(): void {
    this.ctx = this.gameCanvas.nativeElement.getContext('2d');
    this.nextPieceCtx = this.nextPieceCanvas.nativeElement.getContext('2d');

    if (this.ctx) {
      this.setupCanvas();
      this.startRenderLoop();
    }
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.stopGame();
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private setupCanvas(): void {
    const canvas = this.gameCanvas.nativeElement;
    canvas.width = this.BOARD_WIDTH * this.BLOCK_SIZE;
    canvas.height = this.BOARD_HEIGHT * this.BLOCK_SIZE;

    const nextCanvas = this.nextPieceCanvas.nativeElement;
    nextCanvas.width = 120;
    nextCanvas.height = 120;
  }

  private startRenderLoop(): void {
    this.ngZone.runOutsideAngular(() => {
      const render = (timestamp: number) => {
        this.renderGame();
        this.animationFrameId = requestAnimationFrame(render);
      };
      this.animationFrameId = requestAnimationFrame(render);
    });
  }

  private renderGame(): void {
    if (!this.ctx) return;

    // Clear canvas
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(0, 0, this.gameCanvas.nativeElement.width, this.gameCanvas.nativeElement.height);

    // Draw grid lines
    this.drawGrid();

    // Draw locked pieces
    this.drawBoard();

    // Draw current piece
    if (this.currentPiece && this.gameStarted && !this.gameOver) {
      this.drawPiece(this.currentPiece);
    }

    // Draw next piece
    this.renderNextPiece();
  }

  private drawGrid(): void {
    if (!this.ctx) return;

    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    this.ctx.lineWidth = 1;

    for (let y = 0; y <= this.BOARD_HEIGHT; y++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y * this.BLOCK_SIZE);
      this.ctx.lineTo(this.BOARD_WIDTH * this.BLOCK_SIZE, y * this.BLOCK_SIZE);
      this.ctx.stroke();
    }

    for (let x = 0; x <= this.BOARD_WIDTH; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x * this.BLOCK_SIZE, 0);
      this.ctx.lineTo(x * this.BLOCK_SIZE, this.BOARD_HEIGHT * this.BLOCK_SIZE);
      this.ctx.stroke();
    }
  }

  private drawBoard(): void {
    if (!this.ctx) return;

    for (let y = 0; y < this.BOARD_HEIGHT; y++) {
      for (let x = 0; x < this.BOARD_WIDTH; x++) {
        const value = this.board[y][x];
        if (value !== 0) {
          this.drawBlock(x, y, this.COLOR_MAP[value]);
        }
      }
    }
  }

  private drawPiece(piece: Tetromino): void {
    if (!this.ctx) return;

    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const boardX = piece.x + x;
          const boardY = piece.y + y;
          if (boardY >= 0 && boardY < this.BOARD_HEIGHT && boardX >= 0 && boardX < this.BOARD_WIDTH) {
            this.drawBlock(boardX, boardY, piece.color);
          }
        }
      }
    }
  }

  private drawBlock(x: number, y: number, color: string): void {
    if (!this.ctx) return;

    const pixelX = x * this.BLOCK_SIZE;
    const pixelY = y * this.BLOCK_SIZE;

    // Fill main color
    this.ctx.fillStyle = color;
    this.ctx.fillRect(pixelX + 1, pixelY + 1, this.BLOCK_SIZE - 2, this.BLOCK_SIZE - 2);

    // Add highlight
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.fillRect(pixelX + 2, pixelY + 2, this.BLOCK_SIZE - 4, this.BLOCK_SIZE / 2 - 2);

    // Add shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.fillRect(pixelX + 2, pixelY + this.BLOCK_SIZE / 2, this.BLOCK_SIZE - 4, this.BLOCK_SIZE / 2 - 2);

    // Border
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(pixelX + 1, pixelY + 1, this.BLOCK_SIZE - 2, this.BLOCK_SIZE - 2);
  }

  private renderNextPiece(): void {
    if (!this.nextPieceCtx || !this.nextPiece) return;

    const canvas = this.nextPieceCanvas.nativeElement;

    // Clear canvas
    this.nextPieceCtx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    this.nextPieceCtx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate centering offset
    const pieceWidth = this.nextPiece.shape[0].length * 24;
    const pieceHeight = this.nextPiece.shape.length * 24;
    const offsetX = (canvas.width - pieceWidth) / 2;
    const offsetY = (canvas.height - pieceHeight) / 2;

    // Draw piece
    for (let y = 0; y < this.nextPiece.shape.length; y++) {
      for (let x = 0; x < this.nextPiece.shape[y].length; x++) {
        if (this.nextPiece.shape[y][x]) {
          const pixelX = offsetX + x * 24;
          const pixelY = offsetY + y * 24;

          // Fill main color
          this.nextPieceCtx.fillStyle = this.nextPiece.color;
          this.nextPieceCtx.fillRect(pixelX + 1, pixelY + 1, 22, 22);

          // Add highlight
          this.nextPieceCtx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          this.nextPieceCtx.fillRect(pixelX + 2, pixelY + 2, 20, 10);

          // Add shadow
          this.nextPieceCtx.fillStyle = 'rgba(0, 0, 0, 0.3)';
          this.nextPieceCtx.fillRect(pixelX + 2, pixelY + 12, 20, 10);

          // Border
          this.nextPieceCtx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
          this.nextPieceCtx.lineWidth = 1;
          this.nextPieceCtx.strokeRect(pixelX + 1, pixelY + 1, 22, 22);
        }
      }
    }
  }

  private initializeBoard(): void {
    this.board = Array(this.BOARD_HEIGHT).fill(null).map(() => Array(this.BOARD_WIDTH).fill(0));
  }

  private initializeAudio(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (!this.gameStarted || this.gameOver) {
      if (event.key === 'Enter' && !this.gameStarted) {
        this.startGame();
      }
      return;
    }

    if (this.paused && event.key !== 'p' && event.key !== 'P') {
      return;
    }

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        this.movePiece(-1, 0);
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.movePiece(1, 0);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.movePiece(0, 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.rotatePiece();
        break;
      case ' ':
        event.preventDefault();
        this.hardDrop();
        break;
      case 'p':
      case 'P':
        event.preventDefault();
        this.togglePause();
        break;
    }
  }

  startGame(): void {
    this.ngZone.run(() => {
      this.initializeBoard();
      this.score = 0;
      this.level = 1;
      this.lines = 0;
      this.gameOver = false;
      this.paused = false;
      this.gameStarted = true;
      this.currentSpeed = this.INITIAL_SPEED;

      this.currentPiece = this.createRandomPiece();
      this.nextPiece = this.createRandomPiece();

      this.startGameLoop();
      this.playSound('start');
      this.cdr.markForCheck();
    });
  }

  private startGameLoop(): void {
    this.stopGame();
    this.ngZone.runOutsideAngular(() => {
      this.gameInterval = setInterval(() => {
        if (!this.paused && !this.gameOver) {
          this.moveDown();
        }
      }, this.currentSpeed);
    });
  }

  stopGame(): void {
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
      this.gameInterval = null;
    }
  }

  togglePause(): void {
    this.ngZone.run(() => {
      this.paused = !this.paused;
      this.playSound('pause');
      this.cdr.markForCheck();
    });
  }

  override onReset(): void {
    this.ngZone.run(() => {
      this.stopGame();
      this.initializeBoard();
      this.gameStarted = false;
      this.gameOver = false;
      this.paused = false;
      this.score = 0;
      this.level = 1;
      this.lines = 0;
      this.currentPiece = null;
      this.nextPiece = null;
      this.cdr.markForCheck();
    });
  }

  toggleSound(): void {
    this.soundEnabled = !this.soundEnabled;
    this.saveState();
  }

  private createRandomPiece(): Tetromino {
    const shapeKeys = Object.keys(this.SHAPES);
    const randomKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
    const template = this.SHAPES[randomKey as keyof typeof this.SHAPES];

    return {
      shape: template.shape.map(row => [...row]),
      color: template.color,
      x: Math.floor(this.BOARD_WIDTH / 2) - Math.floor(template.shape[0].length / 2),
      y: 0
    };
  }

  private movePiece(dx: number, dy: number): boolean {
    if (!this.currentPiece) return false;

    this.currentPiece.x += dx;
    this.currentPiece.y += dy;

    if (this.checkCollision()) {
      this.currentPiece.x -= dx;
      this.currentPiece.y -= dy;
      return false;
    }

    if (dx !== 0) {
      this.playSound('move');
    }
    return true;
  }

  private moveDown(): void {
    if (!this.movePiece(0, 1)) {
      this.lockPiece();
      this.clearLines();
      this.spawnNewPiece();
    }
  }

  private rotatePiece(): void {
    if (!this.currentPiece) return;

    const originalShape = this.currentPiece.shape;
    this.currentPiece.shape = this.rotate(this.currentPiece.shape);

    if (this.checkCollision()) {
      // Try wall kicks
      const kicks = [
        { dx: 1, dy: 0 },
        { dx: -1, dy: 0 },
        { dx: 2, dy: 0 },
        { dx: -2, dy: 0 }
      ];

      let rotated = false;
      for (const kick of kicks) {
        this.currentPiece.x += kick.dx;
        this.currentPiece.y += kick.dy;

        if (!this.checkCollision()) {
          rotated = true;
          break;
        }

        this.currentPiece.x -= kick.dx;
        this.currentPiece.y -= kick.dy;
      }

      if (!rotated) {
        this.currentPiece.shape = originalShape;
        return;
      }
    }

    this.playSound('rotate');
  }

  private rotate(shape: number[][]): number[][] {
    const rows = shape.length;
    const cols = shape[0].length;
    const rotated: number[][] = [];

    for (let col = 0; col < cols; col++) {
      const newRow: number[] = [];
      for (let row = rows - 1; row >= 0; row--) {
        newRow.push(shape[row][col]);
      }
      rotated.push(newRow);
    }

    return rotated;
  }

  private hardDrop(): void {
    if (!this.currentPiece) return;

    let dropDistance = 0;
    while (this.movePiece(0, 1)) {
      dropDistance++;
    }

    this.ngZone.run(() => {
      this.score += dropDistance * 2;
      this.cdr.markForCheck();
    });

    this.lockPiece();
    this.clearLines();
    this.spawnNewPiece();
    this.playSound('drop');
  }

  private checkCollision(): boolean {
    if (!this.currentPiece) return false;

    for (let y = 0; y < this.currentPiece.shape.length; y++) {
      for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
        if (this.currentPiece.shape[y][x]) {
          const boardX = this.currentPiece.x + x;
          const boardY = this.currentPiece.y + y;

          if (
            boardX < 0 ||
            boardX >= this.BOARD_WIDTH ||
            boardY >= this.BOARD_HEIGHT ||
            (boardY >= 0 && this.board[boardY][boardX])
          ) {
            return true;
          }
        }
      }
    }

    return false;
  }

  private lockPiece(): void {
    if (!this.currentPiece) return;

    for (let y = 0; y < this.currentPiece.shape.length; y++) {
      for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
        if (this.currentPiece.shape[y][x]) {
          const boardY = this.currentPiece.y + y;
          const boardX = this.currentPiece.x + x;

          if (boardY >= 0) {
            this.board[boardY][boardX] = this.getColorIndex(this.currentPiece.color);
          }
        }
      }
    }
  }

  private clearLines(): void {
    let linesCleared = 0;

    for (let y = this.BOARD_HEIGHT - 1; y >= 0; y--) {
      if (this.board[y].every(cell => cell !== 0)) {
        this.board.splice(y, 1);
        this.board.unshift(Array(this.BOARD_WIDTH).fill(0));
        linesCleared++;
        y++;
      }
    }

    if (linesCleared > 0) {
      this.ngZone.run(() => {
        this.lines += linesCleared;
        this.score += this.calculateScore(linesCleared);
        this.updateLevel();
        this.playSound('clear');
        this.cdr.markForCheck();
      });
    }
  }

  private calculateScore(linesCleared: number): number {
    const baseScores = [0, 100, 300, 500, 800];
    return baseScores[linesCleared] * this.level;
  }

  private updateLevel(): void {
    const newLevel = Math.floor(this.lines / 10) + 1;
    if (newLevel > this.level) {
      this.level = newLevel;
      this.currentSpeed = Math.max(100, this.INITIAL_SPEED - (this.level - 1) * this.SPEED_INCREASE_PER_LEVEL);
      this.startGameLoop();
      this.playSound('levelup');
    }
  }

  private spawnNewPiece(): void {
    this.currentPiece = this.nextPiece;
    this.nextPiece = this.createRandomPiece();

    if (this.checkCollision()) {
      this.endGame();
    }
  }

  private endGame(): void {
    this.ngZone.run(() => {
      this.gameOver = true;
      this.stopGame();

      if (this.score > this.highScore) {
        this.highScore = this.score;
        this.saveState();
      }

      this.playSound('gameover');
      this.cdr.markForCheck();
    });
  }

  private getColorIndex(color: string): number {
    const colors = ['#00f0f0', '#f0f000', '#a000f0', '#00f000', '#f00000', '#0000f0', '#f0a000'];
    return colors.indexOf(color) + 1;
  }

  private playSound(type: 'move' | 'rotate' | 'drop' | 'clear' | 'levelup' | 'gameover' | 'start' | 'pause'): void {
    if (!this.soundEnabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    switch (type) {
      case 'move':
        oscillator.frequency.value = 200;
        gainNode.gain.value = 0.1;
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.05);
        break;
      case 'rotate':
        oscillator.frequency.value = 300;
        gainNode.gain.value = 0.15;
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.08);
        break;
      case 'drop':
        oscillator.frequency.value = 150;
        gainNode.gain.value = 0.2;
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.1);
        break;
      case 'clear':
        oscillator.frequency.value = 500;
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.3);
        break;
      case 'levelup':
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.2);
        gainNode.gain.value = 0.3;
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.2);
        break;
      case 'gameover':
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.5);
        gainNode.gain.value = 0.3;
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.5);
        break;
      case 'start':
        oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.15);
        gainNode.gain.value = 0.2;
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.15);
        break;
      case 'pause':
        oscillator.frequency.value = 250;
        gainNode.gain.value = 0.15;
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.1);
        break;
    }
  }
}
