/**
 * MainMenuScene
 *
 * Première scène visible par le joueur quand il arrive sur le site.
 * Elle affiche le titre, un personnage animé et un message pour démarrer.
 *
 * Ordre d'exécution :
 *   1. create()        → (hérité de BaseScene) fondu + textures + buildScene()
 *   2. buildScene()    → place tous les éléments visuels
 *   3. update()        → vérifie les touches à chaque frame
 *   4. onStart()       → lancé quand le joueur appuie sur Entrée ou clique
 */

import Phaser from "phaser";
import { KEYS } from "@/utils/assetKeys";
import { BaseScene } from "@/scenes/Common/BaseScene";
import "./MainMenuScene.css";

/**
 * Lit la valeur d'une variable CSS définie dans MainMenuScene.css.
 * Ex : css('--menu-title-color') retourne "#f5c518"
 */
function css(variable: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim();
}

/**
 * Même chose que css() mais retourne un nombre.
 * Utile pour les propriétés comme strokeThickness qui attendent un chiffre.
 */
function cssNum(variable: string): number {
  return parseFloat(css(variable));
}

export class MainMenuScene extends BaseScene {
  /** Touche Entrée, utilisée pour démarrer le jeu */
  private enterKey!: Phaser.Input.Keyboard.Key;

  /** Animation de clignotement du texte "Appuie sur Entrée" */
  private blinkTween?: Phaser.Tweens.Tween;

  constructor() {
    // On donne un nom à la scène pour pouvoir y naviguer depuis d'autres scènes
    super({ key: "MainMenuScene" });
  }

  /**
   * Place tous les éléments visuels du menu sur l'écran :
   * fond, nuages animés, titre, personnage, prompt et contrôles.
   */
  protected buildScene(): void {
    const { width, height } = this.scale;

    this.buildBackground(width, height);

    // Titre principal
    this.add
      .text(width / 2, height * 0.28, "ARTHUR MILLET", {
        fontSize: css("--menu-title-size"),
        fontFamily: css("--menu-font"),
        color: css("--menu-title-color"),
        stroke: css("--menu-title-stroke"),
        strokeThickness: cssNum("--menu-title-stroke-width"),
      })
      .setOrigin(0.5);

    // Sous-titre
    this.add
      .text(width / 2, height * 0.42, "PORTFOLIO", {
        fontSize: css("--menu-subtitle-size"),
        fontFamily: css("--menu-font"),
        color: css("--menu-subtitle-color"),
        stroke: css("--menu-subtitle-stroke"),
        strokeThickness: cssNum("--menu-subtitle-stroke-width"),
      })
      .setOrigin(0.5);

    // Texte clignotant "Appuie sur Entrée"
    const pressEnter = this.add
      .text(width / 2, height * 0.62, "► APPUIE SUR ENTRÉE ◄", {
        fontSize: css("--menu-prompt-size"),
        fontFamily: css("--menu-font"),
        color: css("--menu-prompt-color"),
      })
      .setOrigin(0.5);

    // Animation : le texte disparaît et réapparaît en boucle (yoyo = aller-retour)
    this.blinkTween = this.tweens.add({
      targets: pressEnter,
      alpha: 0,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    // Rappel des contrôles
    this.add
      .text(
        width / 2,
        height * 0.87,
        "Gauche: Q    Droite: D    Sauter: Espace",
        {
          fontSize: css("--menu-controls-size"),
          fontFamily: css("--menu-font"),
          color: css("--menu-controls-color"),
        },
      )
      .setOrigin(0.5);

    // Personnage animé, flotte de haut en bas pour attirer l'attention
    const playerPreview = this.add
      .image(width / 2, height * 0.52, KEYS.SOLDIER_IDLE, 0)
      .setScale(3);

    this.tweens.add({
      targets: playerPreview,
      y: height * 0.52 - 6,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Numéro de version (coin bas gauche)
    this.add.text(8, height - 14, "v0.1.0", {
      fontSize: css("--menu-version-size"),
      fontFamily: css("--menu-font"),
      color: css("--menu-version-color"),
    });

    // Gestion des touches
    if (this.input.keyboard) {
      this.enterKey = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.ENTER,
      );
      this.input.keyboard
        .addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
        .on("down", () => this.onStart());
    }

    // Clic ou tap sur l'écran (mobile) : démarre aussi le jeu
    this.input.once("pointerdown", () => this.onStart());
  }

  /**
   * Appelé à chaque frame (environ 60 fois par seconde).
   * On vérifie ici si la touche Entrée est enfoncée.
   */
  update(): void {
    if (this.enterKey?.isDown) this.onStart();
  }

  /**
   * Démarre la transition vers la scène suivante.
   * On arrête le clignotement pour éviter un flash pendant le fondu.
   */
  private onStart(): void {
    this.blinkTween?.stop();
    this.launchLevel("LevelSelectScene");
  }
}
