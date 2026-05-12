/**
 * ManitouLevelScene — "Build the App"
 *
 * Mini-jeu lié au stage Manitou (Data Engineer, BUT Informatique).
 * Des blocs représentant les technologies de la mission tombent du ciel.
 * Le joueur les attrape et les dépose dans la zone de dépôt.
 *
 * Trois états : intro → game → result
 * La transition intro → game passe par une modale de règles.
 */

import Phaser from "phaser";
import { BaseScene } from "@/scenes/Common/BaseScene";
import { css, cssHex } from "@/utils/cssVars";
import "./ManitouLevelScene.css";

type GameState = "intro" | "game" | "result";

const TECH = [
  { id: "sql", label: "SQL", color: 0x9b59b6 },
  { id: "talend", label: "TALEND", color: 0x3498db },
  { id: "java", label: "JAVA", color: 0xe74c3c },
  { id: "ps", label: "POWERSHELL", color: 0x2980b9 },
  { id: "dbt", label: "DBT", color: 0xf39c12 },
  { id: "pbi", label: "POWER BI", color: 0xf1c40f },
] as const;

type TechId = (typeof TECH)[number]["id"];

const TIMER_SECONDS = 10;

// Zone de dépôt : côté droit du canvas (800×600)
// Couvre x : 527–703, y : 82–537
const ZONE = { x: 615, y: 310, w: 176, h: 456 };

export class ManitouLevelScene extends BaseScene {
  private state: GameState = "intro";
  private caught: TechId[] = [];
  private timeLeft = TIMER_SECONDS;
  private isGameActive = false;

  private timerText?: Phaser.GameObjects.Text;
  private spawnTimer?: Phaser.Time.TimerEvent;
  private countdownTimer?: Phaser.Time.TimerEvent;
  private escKey?: Phaser.Input.Keyboard.Key;
  // File garantissant que chaque tech apparaît au moins une fois
  private techQueue: (typeof TECH)[number][] = [];

  constructor() {
    super({ key: "ManitouLevelScene" });
  }

  // ─── INITIALISATION ───────────────────────────────────────

  protected buildScene(): void {
    const { width, height } = this.scale;
    this.buildBackground(width, height);

    this.escKey = this.input.keyboard?.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC,
    );
    this.resetEsc();

    this.showIntro();
  }

  /** Réassigne ESC au comportement par défaut : quitter vers le menu. */
  private resetEsc(): void {
    this.escKey?.removeAllListeners();
    this.escKey?.on("down", () => this.launchLevel("LevelSelectScene"));
  }

  // ─── INTRO ────────────────────────────────────────────────

  private showIntro(): void {
    const { width, height } = this.scale;
    const font = css("--font-pixel");

    // Label combiné sur une seule ligne
    this.add
      .text(
        width / 2,
        height * 0.07,
        "EXPÉRIENCE PROFESSIONNELLE  ·  Stage  ·  BUT Informatique",
        {
          fontSize: "11px",
          fontFamily: font,
          color: "#ffffff",
        },
      )
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.17, "MANITOU", {
        fontSize: "44px",
        fontFamily: font,
        color: css("--manitou-accent"),
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    this.add
      .graphics()
      .lineStyle(1, cssHex("--manitou-divider"))
      .lineBetween(width * 0.15, height * 0.32, width * 0.85, height * 0.32);

    this.add
      .text(width / 2, height * 0.36, "MISSION", {
        fontSize: "14px",
        fontFamily: font,
        color: css("--manitou-accent"),
      })
      .setOrigin(0.5);

    // Mission uniquement — police plus grande grâce à l'espace libéré
    this.add
      .text(
        width / 2,
        height * 0.41,
        "L'équipe R&D IS est responsable de la gestion d'un grand nombre de licences logicielles. J'ai développé une application permettant de comparer le nombre de licences achetées avec celles effectivement utilisées, afin d'obtenir une vue quasi instantanée des utilisateurs rendant l'attribution des licences plus efficace.",
        {
          fontSize: "14px",
          fontFamily: font,
          color: css("--manitou-text"),
          wordWrap: { width: 660 },
          align: "center",
          lineSpacing: 10,
        },
      )
      .setOrigin(0.5, 0);

    this.buildButton(width / 2, height * 0.855, "► COMMENCER ◄", () =>
      this.showRulesOverlay(),
    );

    this.add
      .text(width / 2, height * 0.955, "ESC — RETOUR AU MENU", {
        fontSize: "9px",
        fontFamily: font,
        color: "#ffffff",
      })
      .setOrigin(0.5);
  }

  // ─── MODALE DES RÈGLES ────────────────────────────────────

  private showRulesOverlay(): void {
    const { width, height } = this.scale;
    const font = css("--font-pixel");

    // Objets de la modale — trackés pour être détruits à la fermeture
    const overlay: Phaser.GameObjects.GameObject[] = [];
    const close = () => {
      overlay.forEach((o) => o.destroy());
      this.resetEsc(); // ESC redevient "quitter vers le menu"
    };

    // Pendant que la modale est ouverte, ESC = fermer la modale
    this.escKey?.removeAllListeners();
    this.escKey?.on("down", close);

    // Fond semi-transparent qui bloque les clics sur l'intro
    overlay.push(
      this.add
        .rectangle(width / 2, height / 2, width, height, 0x000000, 0.78)
        .setInteractive(),
    );

    // Panneau — plus grand pour accueillir davantage de padding intérieur
    const panelW = 590;
    const panelH = 400;
    const panelCx = width / 2;
    const panelCy = height / 2;
    overlay.push(
      this.add
        .rectangle(
          panelCx,
          panelCy,
          panelW,
          panelH,
          cssHex("--manitou-panel-bg"),
        )
        .setStrokeStyle(2, cssHex("--manitou-accent")),
    );

    // Titre — 40px depuis le bord supérieur du panneau
    overlay.push(
      this.add
        .text(panelCx, panelCy - panelH / 2 + 42, "RÈGLES DU JEU", {
          fontSize: "20px",
          fontFamily: font,
          color: css("--manitou-accent"),
        })
        .setOrigin(0.5),
    );

    // Instructions — 80px depuis le bord supérieur, texte centré avec marge latérale
    overlay.push(
      this.add
        .text(
          panelCx,
          panelCy - panelH / 2 + 88,
          [
            "Des blocs représentant les technos de la mission tombent du ciel.",
            "",
            "Clique dessus, glisse-les et dépose-les dans la zone à droite.",
            "",
            "Objectif : collecter les 6 technos de la stack !",
            "",
            `Tu as ${TIMER_SECONDS} secondes. Bonne chance !`,
          ],
          {
            fontSize: "13px",
            fontFamily: font,
            color: css("--manitou-text"),
            align: "center",
            wordWrap: { width: panelW - 80 },
          },
        )
        .setOrigin(0.5, 0),
    );

    // Bouton JOUER — 50px depuis le bord inférieur du panneau
    const btnCont = this.add.container(panelCx, panelCy + panelH / 2 - 60);
    const btnBg = this.add
      .rectangle(0, 0, 170, 40, cssHex("--manitou-accent"))
      .setStrokeStyle(2, cssHex("--manitou-accent"));
    const btnTxt = this.add
      .text(0, 0, "JOUER ►", {
        fontSize: "14px",
        fontFamily: font,
        color: "#ffffff",
      })
      .setOrigin(0.5);
    btnCont.add([btnBg, btnTxt]);
    btnCont.setInteractive(
      new Phaser.Geom.Rectangle(-85, -20, 170, 40),
      Phaser.Geom.Rectangle.Contains,
    );
    btnCont.on("pointerover", () => {
      btnBg.setStrokeStyle(2, 0xffffff);
      this.tweens.add({
        targets: btnCont,
        scaleX: 1.07,
        scaleY: 1.07,
        duration: 80,
      });
    });
    btnCont.on("pointerout", () => {
      btnBg.setStrokeStyle(2, cssHex("--manitou-accent"));
      this.tweens.add({ targets: btnCont, scaleX: 1, scaleY: 1, duration: 80 });
    });
    btnCont.on("pointerdown", () => this.transition("game"));
    overlay.push(btnCont);

    // Hint fermeture — juste sous le panneau
    overlay.push(
      this.add
        .text(panelCx, panelCy + panelH / 2 + 18, "ESC pour annuler", {
          fontSize: "9px",
          fontFamily: font,
          color: "#ffffff",
        })
        .setOrigin(0.5),
    );
  }

  // ─── GAME ─────────────────────────────────────────────────

  private showGame(): void {
    const font = css("--font-pixel");

    // HUD
    this.timerText = this.add.text(14, 14, `TEMPS : ${TIMER_SECONDS}`, {
      fontSize: "15px",
      fontFamily: font,
      color: css("--manitou-timer-ok"),
    });

    // Zone de dépôt
    const gfx = this.add.graphics();
    gfx.fillStyle(cssHex("--manitou-zone-bg"), 0.75);
    gfx.fillRect(ZONE.x - ZONE.w / 2, ZONE.y - ZONE.h / 2, ZONE.w, ZONE.h);
    gfx.lineStyle(2, cssHex("--manitou-accent"));
    gfx.strokeRect(ZONE.x - ZONE.w / 2, ZONE.y - ZONE.h / 2, ZONE.w, ZONE.h);

    this.add
      .text(ZONE.x, ZONE.y - ZONE.h / 2 - 14, "ZONE DE DÉPÔT", {
        fontSize: "11px",
        fontFamily: font,
        color: css("--manitou-accent"),
      })
      .setOrigin(0.5);

    this.add
      .text(ZONE.x, ZONE.y + ZONE.h / 2 + 13, "attrape & dépose", {
        fontSize: "9px",
        fontFamily: font,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // Remise à zéro de l'état de jeu
    this.caught = [];
    this.timeLeft = TIMER_SECONDS;
    this.isGameActive = true;
    this.initTechQueue(); // garantit que toute la stack passe au moins une fois

    // Compte à rebours (1 tick/seconde × 10)
    this.countdownTimer = this.time.addEvent({
      delay: 1000,
      repeat: TIMER_SECONDS - 1,
      callback: this.tickTimer,
      callbackScope: this,
    });

    // Spawner de blocs — 1 bloc toutes les 1 400ms → 7 blocs en 10s
    // Les 6 premiers couvrent toute la stack, les suivants sont aléatoires
    this.spawnTimer = this.time.addEvent({
      delay: 1400,
      loop: true,
      callback: this.spawnBlock,
      callbackScope: this,
    });
    this.spawnBlock(); // premier bloc immédiat

    // Drag & drop
    this.input.on(
      "dragstart",
      (_p: unknown, obj: Phaser.GameObjects.Container) => {
        (obj.getData("tween") as Phaser.Tweens.Tween | undefined)?.pause();
      },
    );
    this.input.on(
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
    this.input.on(
      "dragend",
      (_p: unknown, obj: Phaser.GameObjects.Container) => {
        if (obj.active) this.resolveBlock(obj);
      },
    );
  }

  /** Mélange toute la stack dans la file — chaque tech apparaîtra au moins une fois. */
  private initTechQueue(): void {
    this.techQueue = [...TECH].sort(() => Math.random() - 0.5);
  }

  /** Retourne le prochain bloc garanti, puis passe en mode aléatoire. */
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
    if (!this.isGameActive) return;

    const tech = this.nextTech();
    const BW = 110;
    const BH = 36;
    const font = css("--font-pixel");

    // Zone de chute : côté gauche, bien avant la drop zone
    const x = Phaser.Math.Between(60, ZONE.x - ZONE.w / 2 - 60);
    const container = this.add.container(x, -BH);

    const bg = this.add
      .rectangle(0, 0, BW, BH, tech.color, 0.9)
      .setStrokeStyle(1, 0xffffff);
    const label = this.add
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
    this.input.setDraggable(container);
    container.setData("techId", tech.id);

    const tween = this.tweens.add({
      targets: container,
      y: 650,
      duration: Phaser.Math.Between(2200, 3200),
      onComplete: () => {
        // Bloc tombé hors écran sans être attrapé
        if (!container.active || !this.isGameActive) return;
        this.flashZone(false);
        container.destroy();
      },
    });

    container.setData("tween", tween);
  }

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

  private flashZone(success: boolean): void {
    const color = success ? 0x2ecc71 : 0xe74c3c;
    const flash = this.add.rectangle(
      ZONE.x,
      ZONE.y,
      ZONE.w,
      ZONE.h,
      color,
      0.45,
    );
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 280,
      onComplete: () => flash.destroy(),
    });
  }

  private endGame(): void {
    this.isGameActive = false;
    this.spawnTimer?.remove();
    this.countdownTimer?.remove();
    this.time.delayedCall(600, () => this.transition("result"));
  }

  // ─── RESULT ───────────────────────────────────────────────

  private showResult(): void {
    const { width, height } = this.scale;
    const font = css("--font-pixel");

    this.add
      .text(width / 2, height * 0.1, "RÉSULTAT", {
        fontSize: "34px",
        fontFamily: font,
        color: css("--manitou-accent"),
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    this.add
      .text(
        width / 2,
        height * 0.245,
        `${this.caught.length} / ${TECH.length} TECHNOS DÉPLOYÉES`,
        {
          fontSize: "18px",
          fontFamily: font,
          color: css("--manitou-score-color"),
        },
      )
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.355, this.rating(), {
        fontSize: "12px",
        fontFamily: font,
        color: "#ffffff",
        wordWrap: { width: 620 },
        align: "center",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.475, "TECHNOLOGIES DE LA MISSION :", {
        fontSize: "11px",
        fontFamily: font,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.drawTechRow(width / 2, height * 0.557);

    // Carte récapitulatif expérience
    const cardY = height * 0.69;
    this.add
      .rectangle(width / 2, cardY, 430, 58, cssHex("--manitou-panel-bg"))
      .setStrokeStyle(1, cssHex("--manitou-divider"));
    this.add
      .text(width / 2, cardY - 13, "MANITOU — Stage · BUT Informatique", {
        fontSize: "12px",
        fontFamily: font,
        color: css("--manitou-accent"),
      })
      .setOrigin(0.5);
    this.add
      .text(width / 2, cardY + 11, "Gestion de licences logicielles · R&D IS", {
        fontSize: "11px",
        fontFamily: font,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // Boutons
    const btnY = height * 0.875;
    this.buildButton(width / 2 - 220, btnY, "VOIR DÉMO", () => {
      /* TODO */
    });
    this.buildButton(width / 2, btnY, "REJOUER", () => this.transition("game"));
    this.buildButton(width / 2 + 220, btnY, "MENU", () =>
      this.launchLevel("LevelSelectScene"),
    );
  }

  private rating(): string {
    const n = this.caught.length;
    if (n === 6)
      return "MISSION ACCOMPLIE: Stack complète déployée en production !";
    if (n === 5)
      return "QUASI-LIVRAISON: Un outil manque avant la mise en prod.";
    if (n === 4)
      return "VERSION BÊTA: L'app tourne, mais la stack n'est pas complète.";
    if (n === 3)
      return "PROTOTYPE INCOMPLET: La moitié de la stack, pas de livraison.";
    if (n === 2)
      return "STACK INSUFFISANTE: Trop peu de briques pour construire.";
    if (n === 1)
      return "MISSION ÉCHOUÉE: Une seule techno, l'app ne peut pas tourner.";
    return "DÉPLOIEMENT AVORTÉ: Aucune techno activée. L'app ne voit pas le jour.";
  }

  private drawTechRow(cx: number, cy: number): void {
    const font = css("--font-pixel");
    const chipW = 82;
    const chipH = 24;
    const gap = 6;
    // 6 chips × (82+6) − 6 = 522px, centré dans 800px : 139–661
    let x = cx - (TECH.length * (chipW + gap) - gap) / 2 + chipW / 2;

    for (const tech of TECH) {
      const caught = this.caught.includes(tech.id);
      this.add.rectangle(x, cy, chipW, chipH, tech.color, caught ? 0.9 : 0.25);
      this.add
        .text(x, cy, tech.label, {
          fontSize: "9px",
          fontFamily: font,
          color: "#ffffff",
        })
        .setOrigin(0.5)
        .setAlpha(caught ? 1 : 0.4);
      x += chipW + gap;
    }
  }

  // ─── HELPERS ──────────────────────────────────────────────

  private buildButton(
    x: number,
    y: number,
    label: string,
    callback: () => void,
  ): void {
    const W = 155;
    const H = 38;
    const font = css("--font-pixel");
    const accent = cssHex("--manitou-accent");

    const container = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, W, H, accent).setStrokeStyle(2, accent);
    const text = this.add
      .text(0, 0, label, {
        fontSize: "12px",
        fontFamily: font,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    container.add([bg, text]);
    container.setInteractive(
      new Phaser.Geom.Rectangle(-W / 2, -H / 2, W, H),
      Phaser.Geom.Rectangle.Contains,
    );
    container.on("pointerover", () => {
      bg.setStrokeStyle(2, 0xffffff);
      this.tweens.add({
        targets: container,
        scaleX: 1.06,
        scaleY: 1.06,
        duration: 80,
      });
    });
    container.on("pointerout", () => {
      bg.setStrokeStyle(2, accent);
      this.tweens.add({
        targets: container,
        scaleX: 1,
        scaleY: 1,
        duration: 80,
      });
    });
    container.on("pointerdown", callback);
  }

  /**
   * Transition entre états : fondu noir, nettoyage complet, reconstruction.
   * Le fond (ciel + nuages) est re-créé car tweens.killAll() tue aussi les tweens des nuages.
   */
  private transition(to: GameState): void {
    this.isGameActive = false;
    this.spawnTimer?.remove();
    this.countdownTimer?.remove();

    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.input.off("drag");
      this.input.off("dragstart");
      this.input.off("dragend");
      this.tweens.killAll();
      this.children.removeAll(true);

      if (to === "intro") {
        this.caught = [];
      }

      this.state = to;
      this.resetEsc(); // ESC reprend son comportement par défaut après toute transition
      const { width, height } = this.scale;
      this.buildBackground(width, height);

      if (to === "intro") this.showIntro();
      else if (to === "game") this.showGame();
      else this.showResult();

      this.cameras.main.fadeIn(300, 0, 0, 0);
    });
  }
}
