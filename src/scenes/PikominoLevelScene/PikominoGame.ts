import Phaser from "phaser";
import { css, cssHex } from "@/utils/cssVars";
import {
  TECHS,
  TechId,
  TIMER_SECONDS,
  CELL,
  COLS,
  ROWS,
  GRID_X,
  GRID_Y,
  TICK_MS,
  GROW_BY,
} from "./PikominoConfig";

export type CollectedIds = TechId[];

interface GridCell {
  col: number;
  row: number;
}

interface FoodItem {
  tech: (typeof TECHS)[number];
  col: number;
  row: number;
  container: Phaser.GameObjects.Container;
}

export class PikominoGame {
  private body: GridCell[] = [];
  private dir = { dc: 1, dr: 0 };
  private nextDir = { dc: 1, dr: 0 };
  private growPending = 0;
  private foods: FoodItem[] = [];
  private collectedIds: CollectedIds = [];
  private isActive = false;
  private timeLeft = TIMER_SECONDS;

  private graphics?: Phaser.GameObjects.Graphics;
  private timerText?: Phaser.GameObjects.Text;
  private scoreText?: Phaser.GameObjects.Text;
  private tickEvent?: Phaser.Time.TimerEvent;
  private countdownEvent?: Phaser.Time.TimerEvent;
  private keyZ?: Phaser.Input.Keyboard.Key;
  private keyQ?: Phaser.Input.Keyboard.Key;
  private keyS?: Phaser.Input.Keyboard.Key;
  private keyD?: Phaser.Input.Keyboard.Key;

  private snakeHeadColor = 0;
  private snakeBodyColor = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly onEnd: (collected: CollectedIds) => void,
  ) {}

  start(): void {
    this.isActive = true;
    this.snakeHeadColor = cssHex("--piko-snake-head");
    this.snakeBodyColor = cssHex("--piko-snake-body");

    this.buildHud();
    this.graphics = this.scene.add.graphics();

    const startCol = Math.floor(COLS / 2);
    const startRow = Math.floor(ROWS / 2);
    this.body = [
      { col: startCol,     row: startRow },
      { col: startCol - 1, row: startRow },
      { col: startCol - 2, row: startRow },
    ];

    this.spawnAllFoods();

    const kb = this.scene.input.keyboard;
    this.keyZ = kb?.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this.keyQ = kb?.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    this.keyS = kb?.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = kb?.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    this.tickEvent = this.scene.time.addEvent({
      delay: TICK_MS,
      loop: true,
      callback: this.tick,
      callbackScope: this,
    });

    this.countdownEvent = this.scene.time.addEvent({
      delay: 1000,
      repeat: TIMER_SECONDS - 1,
      callback: this.tickTimer,
      callbackScope: this,
    });

    this.draw();
  }

  stop(): void {
    this.isActive = false;
    this.tickEvent?.remove();
    this.countdownEvent?.remove();
  }

  private buildHud(): void {
    const font = css("--font-pixel");
    const { width } = this.scene.scale;

    this.scoreText = this.scene.add.text(14, 14, `TECHNOS : 0 / ${TECHS.length}`, {
      fontSize: "15px",
      fontFamily: font,
      color: css("--piko-score-color"),
    });

    this.timerText = this.scene.add
      .text(width - 14, 14, `TEMPS : ${TIMER_SECONDS}`, {
        fontSize: "15px",
        fontFamily: font,
        color: css("--piko-timer-ok"),
      })
      .setOrigin(1, 0);

    this.scene.add
      .text(width / 2, 14, "PIKOMINO", {
        fontSize: "15px",
        fontFamily: font,
        color: css("--piko-accent"),
      })
      .setOrigin(0.5, 0);

    this.scene.add
      .graphics()
      .lineStyle(1, cssHex("--piko-grid-border"), 0.6)
      .strokeRect(GRID_X, GRID_Y, COLS * CELL, ROWS * CELL);
  }

  private spawnAllFoods(): void {
    const shuffled = [...TECHS].sort(() => Math.random() - 0.5);
    for (const tech of shuffled) {
      const pos = this.randomFreeCell();
      if (pos) this.spawnFood(tech, pos.col, pos.row);
    }
  }

  private spawnFood(tech: (typeof TECHS)[number], col: number, row: number): void {
    const font = css("--font-pixel");
    const x = GRID_X + col * CELL + CELL / 2;
    const y = GRID_Y + row * CELL + CELL / 2;

    const container = this.scene.add.container(x, y);
    const bg = this.scene.add.rectangle(0, 0, CELL - 4, CELL - 4, tech.color);
    const label = this.scene.add
      .text(0, 0, tech.short, {
        fontSize: "8px",
        fontFamily: font,
        color: "#ffffff",
        align: "center",
      })
      .setOrigin(0.5);
    container.add([bg, label]);

    this.foods.push({ tech, col, row, container });
  }

  private randomFreeCell(): GridCell | null {
    const occupied = new Set([
      ...this.body.map(c => `${c.col},${c.row}`),
      ...this.foods.map(f => `${f.col},${f.row}`),
    ]);

    const free: GridCell[] = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!occupied.has(`${c},${r}`)) free.push({ col: c, row: r });
      }
    }
    if (free.length === 0) return null;
    return free[Math.floor(Math.random() * free.length)];
  }

  private tick(): void {
    if (!this.isActive) return;

    this.readInput();
    this.dir = this.nextDir;

    const head = this.body[0];
    const newHead: GridCell = {
      col: head.col + this.dir.dc,
      row: head.row + this.dir.dr,
    };

    if (newHead.col < 0 || newHead.col >= COLS || newHead.row < 0 || newHead.row >= ROWS) {
      this.endGame();
      return;
    }

    const bodyToCheck = this.growPending > 0 ? this.body : this.body.slice(0, -1);
    if (bodyToCheck.some(c => c.col === newHead.col && c.row === newHead.row)) {
      this.endGame();
      return;
    }

    this.body.unshift(newHead);
    if (this.growPending > 0) {
      this.growPending--;
    } else {
      this.body.pop();
    }

    const eatenIdx = this.foods.findIndex(
      f => f.col === newHead.col && f.row === newHead.row,
    );
    if (eatenIdx !== -1) {
      const food = this.foods[eatenIdx];
      this.collectedIds.push(food.tech.id);
      food.container.destroy();
      this.foods.splice(eatenIdx, 1);
      this.growPending += GROW_BY;
      this.scoreText?.setText(`TECHNOS : ${this.collectedIds.length} / ${TECHS.length}`);

      if (this.collectedIds.length === TECHS.length) {
        this.endGame();
        return;
      }
    }

    this.draw();
  }

  private readInput(): void {
    if (this.keyZ?.isDown && this.dir.dr !== 1) {
      this.nextDir = { dc: 0, dr: -1 };
    } else if (this.keyS?.isDown && this.dir.dr !== -1) {
      this.nextDir = { dc: 0, dr: 1 };
    } else if (this.keyQ?.isDown && this.dir.dc !== 1) {
      this.nextDir = { dc: -1, dr: 0 };
    } else if (this.keyD?.isDown && this.dir.dc !== -1) {
      this.nextDir = { dc: 1, dr: 0 };
    }
  }

  private draw(): void {
    if (!this.graphics) return;
    this.graphics.clear();

    for (let i = 0; i < this.body.length; i++) {
      const { col, row } = this.body[i];
      this.graphics.fillStyle(i === 0 ? this.snakeHeadColor : this.snakeBodyColor);
      this.graphics.fillRect(
        GRID_X + col * CELL + 2,
        GRID_Y + row * CELL + 2,
        CELL - 4,
        CELL - 4,
      );
    }
  }

  private tickTimer(): void {
    this.timeLeft--;
    this.timerText?.setText(`TEMPS : ${this.timeLeft}`);

    if (this.timeLeft <= 10) {
      this.timerText?.setColor(css("--piko-timer-danger"));
    } else if (this.timeLeft <= 20) {
      this.timerText?.setColor(css("--piko-timer-warning"));
    }

    if (this.timeLeft <= 0) this.endGame();
  }

  private endGame(): void {
    this.isActive = false;
    this.tickEvent?.remove();
    this.countdownEvent?.remove();
    this.scene.time.delayedCall(700, () => this.onEnd(this.collectedIds));
  }
}
