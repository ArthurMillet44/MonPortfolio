/**
 * Logique du mini-jeu Memory And's Hommes :
 * disposition de la grille, animation de flip, détection des paires
 * et compte à rebours.
 */

import Phaser from "phaser";
import { css, cssHex } from "@/utils/cssVars";
import {
  PAIRS,
  PairId,
  TIMER_SECONDS,
  CARD_W,
  CARD_H,
  CARD_GAP_X,
  CARD_GAP_Y,
  FLIP_MS,
  MISMATCH_DELAY,
} from "./AndsHommesConfig";

export type FoundIds = PairId[];

interface CardData {
  container: Phaser.GameObjects.Container;
  pairId: PairId;
  isFlipped: boolean;
  isMatched: boolean;
  /** Affiche le dos (caché) ou la face (visible). */
  showFace: (visible: boolean) => void;
}

/**
 * Encapsule l'état et la logique d'une partie de memory.
 *
 * La scène instancie cette classe, appelle `start()`, puis attend le callback
 * `onEnd(matchedCount)` pour passer à l'écran résultat.
 */
export class AndsHommesGame {
  private cards: CardData[] = [];
  private flipped: CardData[] = [];
  private foundIds: FoundIds = [];
  private isChecking = false;
  private isActive = false;
  private timeLeft = TIMER_SECONDS;
  private timerText?: Phaser.GameObjects.Text;
  private pairsText?: Phaser.GameObjects.Text;
  private countdownTimer?: Phaser.Time.TimerEvent;

  /**
   * @param scene  - Scène Phaser utilisée pour créer les objets visuels et les timers.
   * @param onEnd  - Appelé à la fin de la partie avec les IDs des paires trouvées.
   */
  constructor(
    private readonly scene: Phaser.Scene,
    private readonly onEnd: (found: FoundIds) => void,
  ) {}

  /** Lance la partie : construit le HUD, les cartes et démarre le compte à rebours. */
  start(): void {
    this.isActive = true;
    this.buildHud();

    const deck = this.buildDeck();
    this.placeCards(deck);

    this.countdownTimer = this.scene.time.addEvent({
      delay: 1000,
      repeat: TIMER_SECONDS - 1,
      callback: this.tickTimer,
      callbackScope: this,
    });
  }

  /** Arrête les timers, appelé lors d'une transition de scène. */
  stop(): void {
    this.isActive = false;
    this.countdownTimer?.remove();
  }

  private buildHud(): void {
    const font = css("--font-pixel");
    const { width } = this.scene.scale;

    this.pairsText = this.scene.add.text(14, 14, "PAIRES : 0 / 7", {
      fontSize: "15px",
      fontFamily: font,
      color: css("--ah-score-color"),
    });

    this.timerText = this.scene.add
      .text(width - 14, 14, `TEMPS : ${TIMER_SECONDS}`, {
        fontSize: "15px",
        fontFamily: font,
        color: css("--ah-timer-ok"),
      })
      .setOrigin(1, 0);

    this.scene.add
      .text(width / 2, 14, "AND'S HOMMES", {
        fontSize: "15px",
        fontFamily: font,
        color: css("--ah-accent"),
      })
      .setOrigin(0.5, 0);
  }

  /**
   * Crée un deck mélangé de 14 cartes (7 paires A+B).
   * Chaque entrée contient le pairId, le texte à afficher et la couleur.
   */
  private buildDeck(): { pairId: PairId; label: string; color: number }[] {
    const deck: { pairId: PairId; label: string; color: number }[] = [];

    for (const pair of PAIRS) {
      deck.push({ pairId: pair.id, label: pair.termA, color: pair.color });
      deck.push({ pairId: pair.id, label: pair.termB, color: pair.color });
    }

    // Fisher-Yates
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
  }

  /** Place les 14 cartes en grille 7×2. */
  private placeCards(
    deck: { pairId: PairId; label: string; color: number }[],
  ): void {
    const cols = 7;
    const totalW = cols * CARD_W + (cols - 1) * CARD_GAP_X;
    const startX = (800 - totalW) / 2 + CARD_W / 2;

    const rows = 2;
    const totalH = rows * CARD_H + (rows - 1) * CARD_GAP_Y;
    // Centre vertical dans la zone sous le HUD (55px) avec 15px de marge basse
    const startY = 55 + (530 - totalH) / 2 + CARD_H / 2;

    deck.forEach((item, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (CARD_W + CARD_GAP_X);
      const y = startY + row * (CARD_H + CARD_GAP_Y);
      this.cards.push(this.createCard(x, y, item));
    });
  }

  private createCard(
    x: number,
    y: number,
    item: { pairId: PairId; label: string; color: number },
  ): CardData {
    const font = css("--font-pixel");
    const container = this.scene.add.container(x, y);

    const backBg = this.scene.add
      .rectangle(0, 0, CARD_W, CARD_H, cssHex("--ah-card-back"))
      .setStrokeStyle(2, cssHex("--ah-card-border"));
    const backLabel = this.scene.add
      .text(0, 0, "AH", {
        fontSize: "18px",
        fontFamily: font,
        color: css("--ah-card-border"),
      })
      .setOrigin(0.5);

    const faceBg = this.scene.add
      .rectangle(0, 0, CARD_W, CARD_H, item.color, 0.9)
      .setStrokeStyle(2, 0xffffff)
      .setVisible(false);
    const faceLabel = this.scene.add
      .text(0, 0, item.label, {
        fontSize: "11px",
        fontFamily: font,
        color: "#ffffff",
        align: "center",
        wordWrap: { width: CARD_W - 12 },
      })
      .setOrigin(0.5)
      .setVisible(false);

    container.add([backBg, backLabel, faceBg, faceLabel]);

    container.setInteractive(
      new Phaser.Geom.Rectangle(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H),
      Phaser.Geom.Rectangle.Contains,
    );

    const card: CardData = {
      container,
      pairId: item.pairId,
      isFlipped: false,
      isMatched: false,
      showFace: (visible: boolean) => {
        backBg.setVisible(!visible);
        backLabel.setVisible(!visible);
        faceBg.setVisible(visible);
        faceLabel.setVisible(visible);
      },
    };

    container.on("pointerover", () => {
      if (!card.isFlipped && !card.isMatched) {
        backBg.setStrokeStyle(2, cssHex("--ah-accent"));
      }
    });
    container.on("pointerout", () => {
      if (!card.isFlipped && !card.isMatched) {
        backBg.setStrokeStyle(2, cssHex("--ah-card-border"));
      }
    });
    container.on("pointerdown", () => this.handleClick(card));

    return card;
  }

  private handleClick(card: CardData): void {
    if (!this.isActive || this.isChecking || card.isFlipped || card.isMatched) {
      return;
    }

    this.flipCard(card, true, () => {
      this.flipped.push(card);

      if (this.flipped.length === 2) {
        this.isChecking = true;
        this.checkMatch();
      }
    });
  }

  /** Animation de flip : scaleX 1→0, swap dos/face, scaleX 0→1. */
  private flipCard(card: CardData, faceUp: boolean, onDone?: () => void): void {
    card.isFlipped = faceUp;
    this.scene.tweens.add({
      targets: card.container,
      scaleX: 0,
      duration: FLIP_MS,
      onComplete: () => {
        card.showFace(faceUp);
        this.scene.tweens.add({
          targets: card.container,
          scaleX: 1,
          duration: FLIP_MS,
          onComplete: () => onDone?.(),
        });
      },
    });
  }

  private checkMatch(): void {
    const [a, b] = this.flipped;

    if (a.pairId === b.pairId) {
      // Paire trouvée
      a.isMatched = true;
      b.isMatched = true;
      this.foundIds.push(a.pairId);
      this.pairsText?.setText(`PAIRES : ${this.foundIds.length} / ${PAIRS.length}`);
      this.flashCards([a, b], true);
      this.flipped = [];
      this.isChecking = false;

      if (this.foundIds.length === PAIRS.length) {
        this.endGame();
      }
    } else {
      // Pas de correspondance : montrer puis re-retourner
      this.flashCards([a, b], false);
      this.scene.time.delayedCall(MISMATCH_DELAY, () => {
        if (!this.isActive) return;
        this.flipCard(a, false);
        this.flipCard(b, false, () => {
          this.flipped = [];
          this.isChecking = false;
        });
      });
    }
  }

  /** Flash vert (match) ou rouge (mismatch) sur les cartes concernées. */
  private flashCards(cards: CardData[], success: boolean): void {
    const color = success ? 0x2ecc71 : 0xe74c3c;
    for (const card of cards) {
      const flash = this.scene.add.rectangle(
        card.container.x,
        card.container.y,
        CARD_W,
        CARD_H,
        color,
        0.5,
      );
      this.scene.tweens.add({
        targets: flash,
        alpha: 0,
        duration: 350,
        onComplete: () => flash.destroy(),
      });
    }
  }

  private tickTimer(): void {
    this.timeLeft--;
    this.timerText?.setText(`TEMPS : ${this.timeLeft}`);

    if (this.timeLeft <= 15) {
      this.timerText?.setColor(css("--ah-timer-danger"));
    } else if (this.timeLeft <= 30) {
      this.timerText?.setColor(css("--ah-timer-warning"));
    }

    if (this.timeLeft <= 0) this.endGame();
  }

  private endGame(): void {
    this.isActive = false;
    this.countdownTimer?.remove();
    // Petit délai pour que le joueur voie l'état final avant la transition.
    this.scene.time.delayedCall(700, () => this.onEnd(this.foundIds));
  }
}
