/**
 * Logique du mini-jeu Pachinko :
 * plateau de clous, chute de la bille (physique simplifiée maison) et détection de la case d'arrivée.
 */

import Phaser from "phaser";
import { css, cssHex } from "@/utils/cssVars";
import {
  BOARD,
  BALL_RADIUS,
  PEG_RADIUS,
  GRAVITY,
  PEG_BOUNCE,
  WALL_BOUNCE,
  BUCKETS,
  bucketAt,
  generatePegPositions,
  BucketId,
} from "./PachinkoConfig";

export interface PachinkoOutcome {
  bucketId: BucketId;
  label: string;
  win: boolean;
}

/**
 * Encapsule l'état et la logique d'une partie de pachinko.
 *
 * La scène instancie cette classe, appelle `start()`, puis attend le callback
 * `onEnd(outcome)` pour passer à l'écran résultat.
 */
export class PachinkoGame {
  private pegs: { x: number; y: number }[] = generatePegPositions();
  private ball?: Phaser.GameObjects.Arc;
  private aim?: Phaser.GameObjects.Triangle;
  private instructions?: Phaser.GameObjects.Text;
  private isFalling = false;
  private hasEnded = false;
  private vx = 0;
  private vy = 0;
  /** Fonctions de nettoyage des écouteurs, appelées dans stop(). */
  private cleanups: (() => void)[] = [];

  /**
   * @param scene - Scène Phaser utilisée pour créer les objets visuels et écouter les entrées.
   * @param onEnd - Appelé une fois la bille arrivée dans une case, avec le résultat.
   */
  constructor(
    private readonly scene: Phaser.Scene,
    private readonly onEnd: (outcome: PachinkoOutcome) => void,
  ) {}

  /** Lance la partie : dessine le plateau et attend le clic du joueur. */
  start(): void {
    this.buildBoard();
    this.buildBuckets();
    this.buildAimAndInstructions();

    const onPointerMove = (pointer: Phaser.Input.Pointer) => this.updateAim(pointer.x);
    const onPointerDown = (pointer: Phaser.Input.Pointer) => this.dropBall(pointer.x);

    this.scene.input.on("pointermove", onPointerMove);
    this.scene.input.on("pointerdown", onPointerDown);
    this.cleanups.push(() => this.scene.input.off("pointermove", onPointerMove));
    this.cleanups.push(() => this.scene.input.off("pointerdown", onPointerDown));

    const onUpdate = (_time: number, delta: number) => this.tick(delta);
    this.scene.events.on(Phaser.Scenes.Events.UPDATE, onUpdate);
    this.cleanups.push(() =>
      this.scene.events.off(Phaser.Scenes.Events.UPDATE, onUpdate),
    );
  }

  /** Coupe tous les écouteurs, appelé lors d'une transition de scène. */
  stop(): void {
    this.cleanups.forEach((fn) => fn());
    this.cleanups = [];
  }

  /** Dessine les murs et les clous du plateau. */
  private buildBoard(): void {
    const wallColor = cssHex("--pachinko-divider");

    this.scene.add
      .graphics()
      .lineStyle(2, wallColor)
      .lineBetween(BOARD.left, BOARD.top, BOARD.left, BOARD.bottom)
      .lineBetween(BOARD.right, BOARD.top, BOARD.right, BOARD.bottom);

    const pegColor = cssHex("--pachinko-peg-color");
    for (const peg of this.pegs) {
      this.scene.add.circle(peg.x, peg.y, PEG_RADIUS, pegColor);
    }
  }

  /** Dessine les cases d'arrivée et leur étiquette, en bas du plateau. */
  private buildBuckets(): void {
    const width = BOARD.right - BOARD.left;
    const bucketW = width / BUCKETS.length;
    const bucketH = 90;
    const cy = BOARD.bottom + bucketH / 2;

    BUCKETS.forEach((bucket, index) => {
      const cx = BOARD.left + bucketW * index + bucketW / 2;

      this.scene.add
        .rectangle(cx, cy, bucketW - 4, bucketH, bucket.color, bucket.win ? 0.9 : 0.55)
        .setStrokeStyle(2, bucket.color);

      this.scene.add
        .text(cx, cy, bucket.label, {
          fontSize: css("--pachinko-bucket-label-size"),
          fontFamily: css("--font-pixel"),
          color: bucket.win ? "#000000" : "#ffffff",
          align: "center",
          wordWrap: { width: bucketW - 14 },
        })
        .setOrigin(0.5);
    });
  }

  /** Dessine le repère de visée en haut du plateau et le texte d'instruction. */
  private buildAimAndInstructions(): void {
    this.aim = this.scene.add.triangle(
      400,
      BOARD.top - 16,
      -8,
      -8,
      8,
      -8,
      0,
      8,
      cssHex("--pachinko-score-color"),
    );

    this.instructions = this.scene.add
      .text(400, 30, "CLIQUEZ POUR LÂCHER LA BILLE", {
        fontSize: css("--pachinko-hud-size"),
        fontFamily: css("--font-pixel"),
        color: "#ffffff",
      })
      .setOrigin(0.5);
  }

  /** Déplace le repère de visée pour suivre la souris (tant que la bille n'est pas lâchée). */
  private updateAim(pointerX: number): void {
    if (this.isFalling || this.hasEnded) return;
    const x = this.clampToBoard(pointerX);
    this.aim?.setX(x);
  }

  /** Lâche la bille à la position cliquée. */
  private dropBall(pointerX: number): void {
    if (this.isFalling || this.hasEnded) return;

    const x = this.clampToBoard(pointerX);
    this.isFalling = true;
    this.vx = 0;
    this.vy = 0;

    this.aim?.destroy();
    this.instructions?.destroy();

    this.ball = this.scene.add.circle(
      x,
      BOARD.top,
      BALL_RADIUS,
      cssHex("--pachinko-ball-color"),
    );
  }

  /** Empêche la bille (ou le repère) de sortir des murs du plateau. */
  private clampToBoard(x: number): number {
    return Phaser.Math.Clamp(x, BOARD.left + BALL_RADIUS, BOARD.right - BALL_RADIUS);
  }

  /** Boucle physique : gravité, rebonds sur les murs et les clous, détection d'arrivée. */
  private tick(deltaMs: number): void {
    if (!this.isFalling || !this.ball || this.hasEnded) return;

    const dt = deltaMs / 1000;

    this.vy += GRAVITY * dt;
    this.ball.x += this.vx * dt;
    this.ball.y += this.vy * dt;

    // Murs latéraux
    if (this.ball.x - BALL_RADIUS < BOARD.left) {
      this.ball.x = BOARD.left + BALL_RADIUS;
      this.vx = Math.abs(this.vx) * WALL_BOUNCE;
    } else if (this.ball.x + BALL_RADIUS > BOARD.right) {
      this.ball.x = BOARD.right - BALL_RADIUS;
      this.vx = -Math.abs(this.vx) * WALL_BOUNCE;
    }

    // Clous
    for (const peg of this.pegs) {
      const dx = this.ball.x - peg.x;
      const dy = this.ball.y - peg.y;
      const minDist = BALL_RADIUS + PEG_RADIUS;
      const distSq = dx * dx + dy * dy;

      if (distSq < minDist * minDist && distSq > 0) {
        const dist = Math.sqrt(distSq);
        const nx = dx / dist;
        const ny = dy / dist;

        // Repousse la bille hors du clou pour éviter qu'elle ne reste collée.
        const overlap = minDist - dist;
        this.ball.x += nx * overlap;
        this.ball.y += ny * overlap;

        // Réflexion de la vitesse par rapport à la normale de contact.
        const dot = this.vx * nx + this.vy * ny;
        this.vx = (this.vx - 2 * dot * nx) * PEG_BOUNCE;
        this.vy = (this.vy - 2 * dot * ny) * PEG_BOUNCE;

        // Petit aléa horizontal pour casser les trajectoires trop prévisibles.
        this.vx += (Math.random() - 0.5) * 60;
      }
    }

    // Arrivée dans une case
    if (this.ball.y + BALL_RADIUS >= BOARD.bottom) {
      this.land();
    }
  }

  /**
   * La bille a atteint la ligne des cases.
   * Une case gagnante termine la partie ; une case perdante retire juste la
   * bille et relance immédiatement un tour, sans mettre fin au jeu.
   */
  private land(): void {
    if (!this.ball || this.hasEnded) return;

    this.hasEnded = true;
    this.isFalling = false;

    const ball = this.ball;
    const bucket = bucketAt(ball.x);

    this.scene.tweens.add({
      targets: ball,
      y: BOARD.bottom + 45,
      duration: 200,
      ease: "Bounce.easeOut",
    });

    if (bucket.win) {
      this.scene.time.delayedCall(700, () => {
        this.onEnd({ bucketId: bucket.id, label: bucket.label, win: bucket.win });
      });
      return;
    }

    this.showMissedFeedback(ball.x);

    this.scene.time.delayedCall(900, () => {
      ball.destroy();
      if (this.ball === ball) this.ball = undefined;
      this.hasEnded = false;
      this.buildAimAndInstructions();
    });
  }

  /** Petit texte "RATÉ !" qui s'élève et disparaît, sans interrompre la partie. */
  private showMissedFeedback(x: number): void {
    const text = this.scene.add
      .text(x, BOARD.bottom + 20, "RATÉ !", {
        fontSize: css("--pachinko-hud-size"),
        fontFamily: css("--font-pixel"),
        color: css("--pachinko-fail-color"),
      })
      .setOrigin(0.5);

    this.scene.tweens.add({
      targets: text,
      y: text.y - 30,
      alpha: 0,
      duration: 850,
      onComplete: () => text.destroy(),
    });
  }
}
