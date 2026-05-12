/**
 * Logique de jeu du mini-jeu "Build the App" :
 * spawn de blocs technos, compte à rebours, drag & drop et résolution des dépôts.
 */

import Phaser from "phaser";
import { css, cssHex } from "@/utils/cssVars";
import { TECH, TechId, TIMER_SECONDS, ZONE } from "./ManitouConfig";

/**
 * Encapsule l'état et la logique d'une partie.
 *
 * La scène instancie cette classe, appelle `start()`, puis attend le callback
 * `onEnd(caught)` pour passer à l'écran résultat.
 */
export class ManitouGame {
  private caught: TechId[] = [];
  private timeLeft = TIMER_SECONDS;
  private isActive = false;
  private timerText?: Phaser.GameObjects.Text;
  private spawnTimer?: Phaser.Time.TimerEvent;
  private countdownTimer?: Phaser.Time.TimerEvent;
  /** File garantissant que chaque techno apparaît au moins une fois avant le mode aléatoire. */
  private techQueue: (typeof TECH)[number][] = [];

  /**
   * @param scene  - Scène Phaser utilisée pour créer les objets visuels et les timers.
   * @param onEnd  - Appelé quand le temps est écoulé, avec la liste des technos collectées.
   */
  constructor(
    private readonly scene: Phaser.Scene,
    private readonly onEnd: (caught: TechId[]) => void,
  ) {}

  /** Lance la partie : construit le HUD, la zone de dépôt, les timers et le drag & drop. */
  start(): void {
    const font = css("--font-pixel");

    this.timerText = this.scene.add.text(14, 14, `TEMPS : ${TIMER_SECONDS}`, {
      fontSize: "15px",
      fontFamily: font,
      color: css("--manitou-timer-ok"),
    });

    const gfx = this.scene.add.graphics();
    gfx.fillStyle(cssHex("--manitou-zone-bg"), 0.75);
    gfx.fillRect(ZONE.x - ZONE.w / 2, ZONE.y - ZONE.h / 2, ZONE.w, ZONE.h);
    gfx.lineStyle(2, cssHex("--manitou-accent"));
    gfx.strokeRect(ZONE.x - ZONE.w / 2, ZONE.y - ZONE.h / 2, ZONE.w, ZONE.h);

    this.scene.add
      .text(ZONE.x, ZONE.y - ZONE.h / 2 - 14, "ZONE DE DÉPÔT", {
        fontSize: "11px",
        fontFamily: font,
        color: css("--manitou-accent"),
      })
      .setOrigin(0.5);

    this.scene.add
      .text(ZONE.x, ZONE.y + ZONE.h / 2 + 13, "attrape & dépose", {
        fontSize: "9px",
        fontFamily: font,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.caught = [];
    this.timeLeft = TIMER_SECONDS;
    this.isActive = true;
    this.initTechQueue();

    this.countdownTimer = this.scene.time.addEvent({
      delay: 1000,
      repeat: TIMER_SECONDS - 1,
      callback: this.tickTimer,
      callbackScope: this,
    });

    // 1 bloc toutes les 1 400ms → 7 blocs en 10s ; les 6 premiers couvrent toute la stack.
    this.spawnTimer = this.scene.time.addEvent({
      delay: 1400,
      loop: true,
      callback: this.spawnBlock,
      callbackScope: this,
    });
    this.spawnBlock(); // premier bloc immédiat, pas d'attente de 1 400ms

    this.scene.input.on(
      "dragstart",
      (_p: unknown, obj: Phaser.GameObjects.Container) => {
        // Met le tween de chute en pause pour que le bloc suive le curseur.
        (obj.getData("tween") as Phaser.Tweens.Tween | undefined)?.pause();
      },
    );
    this.scene.input.on(
      "drag",
      (
        _p: unknown,
        obj: Phaser.GameObjects.Container,
        dragX: number,
        dragY: number,
      ) => {
        obj.x = dragX;
        obj.y = dragY;
      },
    );
    this.scene.input.on(
      "dragend",
      (_p: unknown, obj: Phaser.GameObjects.Container) => {
        if (obj.active) this.resolveBlock(obj);
      },
    );
  }

  /** Arrête les timers et marque la partie comme inactive (appelé lors d'une transition). */
  stop(): void {
    this.isActive = false;
    this.spawnTimer?.remove();
    this.countdownTimer?.remove();
  }

  /** Remplit la file avec toutes les technos dans un ordre aléatoire. */
  private initTechQueue(): void {
    this.techQueue = [...TECH].sort(() => Math.random() - 0.5);
  }

  /**
   * Retourne la prochaine techno garantie depuis la file,
   * puis passe en sélection aléatoire une fois la file épuisée.
   */
  private nextTech(): (typeof TECH)[number] {
    return this.techQueue.length > 0
      ? this.techQueue.shift()!
      : TECH[Math.floor(Math.random() * TECH.length)];
  }

  private tickTimer(): void {
    this.timeLeft--;
    this.timerText?.setText(`TEMPS : ${this.timeLeft}`);

    if (this.timeLeft <= 3) {
      this.timerText?.setColor(css("--manitou-timer-danger"));
    } else if (this.timeLeft <= 6) {
      this.timerText?.setColor(css("--manitou-timer-warning"));
    }

    if (this.timeLeft <= 0) this.endGame();
  }

  private spawnBlock(): void {
    if (!this.isActive) return;

    const tech = this.nextTech();
    const BW = 110;
    const BH = 36;
    const font = css("--font-pixel");

    // Zone de chute limitée au côté gauche pour ne pas chevaucher la zone de dépôt.
    const x = Phaser.Math.Between(60, ZONE.x - ZONE.w / 2 - 60);
    const container = this.scene.add.container(x, -BH);

    const bg = this.scene.add
      .rectangle(0, 0, BW, BH, tech.color, 0.9)
      .setStrokeStyle(1, 0xffffff);
    const label = this.scene.add
      .text(0, 0, tech.label, {
        fontSize: "12px",
        fontFamily: font,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    container.add([bg, label]);
    container.setInteractive(
      new Phaser.Geom.Rectangle(-BW / 2, -BH / 2, BW, BH),
      Phaser.Geom.Rectangle.Contains,
    );
    this.scene.input.setDraggable(container);
    container.setData("techId", tech.id);

    const tween = this.scene.tweens.add({
      targets: container,
      y: 650,
      duration: Phaser.Math.Between(2200, 3200),
      onComplete: () => {
        if (!container.active || !this.isActive) return;
        this.flashZone(false);
        container.destroy();
      },
    });

    container.setData("tween", tween);
  }

  /**
   * Détermine si le bloc relâché est dans la zone de dépôt.
   * Si oui, enregistre la techno (une seule fois par techno distincte).
   */
  private resolveBlock(block: Phaser.GameObjects.Container): void {
    (block.getData("tween") as Phaser.Tweens.Tween | undefined)?.stop();

    const inZone =
      block.x >= ZONE.x - ZONE.w / 2 &&
      block.x <= ZONE.x + ZONE.w / 2 &&
      block.y >= ZONE.y - ZONE.h / 2 &&
      block.y <= ZONE.y + ZONE.h / 2;

    if (inZone) {
      const id = block.getData("techId") as TechId;
      if (!this.caught.includes(id)) this.caught.push(id);
      this.flashZone(true);
    } else {
      this.flashZone(false);
    }

    block.destroy();
  }

  /** Flash visuel de la zone de dépôt : vert si dépôt réussi, rouge sinon. */
  private flashZone(success: boolean): void {
    const color = success ? 0x2ecc71 : 0xe74c3c;
    const flash = this.scene.add.rectangle(
      ZONE.x,
      ZONE.y,
      ZONE.w,
      ZONE.h,
      color,
      0.45,
    );
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 280,
      onComplete: () => flash.destroy(),
    });
  }

  private endGame(): void {
    this.isActive = false;
    this.spawnTimer?.remove();
    this.countdownTimer?.remove();
    // Délai court pour que le joueur voie le timer à 0 avant la transition.
    this.scene.time.delayedCall(600, () => this.onEnd(this.caught));
  }
}
