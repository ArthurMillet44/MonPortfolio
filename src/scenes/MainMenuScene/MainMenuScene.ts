/**
 * MainMenuScene
 *
 * Première scène visible par le joueur quand il arrive sur le site.
 * Elle affiche le titre, un personnage animé et un message pour démarrer.
 *
 * Ordre d'exécution :
 *   1. create()        → génère les textures puis construit l'écran
 *   2. buildScene()    → place tous les éléments visuels
 *   3. update()        → vérifie les touches à chaque frame
 *   4. onStart()       → lancé quand le joueur appuie sur Entrée ou clique
 */

import Phaser from "phaser";
import { KEYS } from "@/utils/assetKeys";
import { generateTextures } from "@/utils/textures";
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

export class MainMenuScene extends Phaser.Scene {
  /** Touche Entrée, utilisée pour démarrer le jeu */
  private enterKey!: Phaser.Input.Keyboard.Key;

  /** Animation de clignotement du texte "Appuie sur Entrée" */
  private blinkTween?: Phaser.Tweens.Tween;

  constructor() {
    // On donne un nom à la scène pour pouvoir y naviguer depuis d'autres scènes
    super({ key: "MainMenuScene" });
  }

  /**
   * Appelé une seule fois au chargement de la scène.
   * On génère d'abord les textures (images dessinées en code),
   * puis on construit l'écran du menu.
   */
  create(): void {
    generateTextures(this);
    this.buildScene();
  }

  /**
   * Place tous les éléments visuels du menu sur l'écran :
   * fond, nuages animés, titre, personnage, prompt et contrôles.
   */
  private buildScene(): void {
    const { width, height } = this.scale;

    // Fond
    // L'image de ciel couvre tout l'écran
    this.add
      .image(width / 2, height / 2, KEYS.BG_SKY)
      .setDisplaySize(width, height);

    // Nuages animés
    // Deux nuages qui se déplacent lentement en sens opposés (effet parallaxe simple)
    const cloud1 = this.add.image(200, 80, KEYS.BG_CLOUDS).setAlpha(0.6);
    const cloud2 = this.add
      .image(600, 120, KEYS.BG_CLOUDS)
      .setAlpha(0.4)
      .setFlipX(true);
    this.tweens.add({
      targets: cloud1,
      x: width + 200,
      duration: 20000,
      repeat: -1,
    });
    this.tweens.add({ targets: cloud2, x: -200, duration: 25000, repeat: -1 });

    // Titre principal
    this.add
      .text(width / 2, height * 0.28, "ARTHUR MILLET", {
        fontSize: css("--menu-title-size"),
        fontFamily: css("--menu-font"),
        color: css("--menu-title-color"),
        stroke: css("--menu-title-stroke"),
        strokeThickness: cssNum("--menu-title-stroke-width"),
      })
      .setOrigin(0.5); // centré horizontalement et verticalement

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
      alpha: 0, // devient transparent
      duration: 600, // en 600ms
      yoyo: true, // puis revient visible
      repeat: -1, // répète indéfiniment
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

    // Personnage animé
    // Le personnage flotte de haut en bas pour attirer l'attention
    const playerPreview = this.add
      .image(width / 2, height * 0.52, KEYS.PLAYER)
      .setFrame("idle") // utilise le frame "idle" du spritesheet
      .setScale(3); // agrandi x3 pour être visible

    this.tweens.add({
      targets: playerPreview,
      y: height * 0.52 - 6, // monte de 6px
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut", // mouvement fluide
    });

    // Numéro de version (coin bas gauche)
    this.add.text(8, height - 14, "v0.1.0", {
      fontSize: css("--menu-version-size"),
      fontFamily: css("--menu-font"),
      color: css("--menu-version-color"),
    });

    // Gestion des touches
    if (this.input.keyboard) {
      // Touche Entrée : stockée pour être vérifiée dans update()
      this.enterKey = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.ENTER,
      );
      // Espace : écoute l'événement "keydown" directement
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
   * L'écran s'assombrit progressivement avant de changer de scène.
   */
  private onStart(): void {
    // On arrête le clignotement pour éviter un flash pendant le fondu
    this.blinkTween?.stop();

    // Fondu au noir en 400ms
    this.cameras.main.fadeOut(400, 0, 0, 0);

    // On attend la fin du fondu avant de changer de scène
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.scene.start("LevelSelectScene");
    });
  }
}
