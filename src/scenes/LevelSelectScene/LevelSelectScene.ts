/**
 * LevelSelectScene
 *
 * Deuxième scène du jeu, visible après le menu principal.
 * Le joueur choisit entre deux niveaux : "Projets" ou "Expériences".
 * Chaque choix est représenté par une carte interactive.
 *
 * Ordre d'exécution :
 *   1. create()            → (hérité de BaseScene) fondu + textures + buildScene()
 *   2. buildScene()        → place le fond, les nuages, le titre, les cartes et l'astuce ESC
 *   3. createLevelCard()   → crée une carte cliquable pour un niveau donné
 *   4. launchLevel()       → (hérité de BaseScene) fondu noir puis changement de scène
 */

import Phaser from "phaser";
import { KEYS } from "@/utils/assetKeys";
import { BaseScene } from "@/scenes/Common/BaseScene";
import "./LevelSelectScene.css";

/**
 * Lit la valeur d'une variable CSS définie dans LevelSelectScene.css.
 * Ex : css('--select-title-color') retourne "#f5c518"
 */
function css(variable: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim();
}

/**
 * Même chose que css() mais retourne un nombre.
 * Utile pour les propriétés comme strokeThickness.
 */
function cssNum(variable: string): number {
  return parseFloat(css(variable));
}

/**
 * Convertit une couleur CSS hexadécimale en entier Phaser.
 * Ex : cssHex('--select-card-projects-accent') → 0x4ec9b0
 * Nécessaire pour colorer les rectangles Phaser (qui n'acceptent pas les strings).
 */
function cssHex(variable: string): number {
  return parseInt(css(variable).replace("#", ""), 16);
}

export class LevelSelectScene extends BaseScene {
  constructor() {
    // Nom de la scène — utilisé pour y naviguer depuis d'autres scènes
    super({ key: "LevelSelectScene" });
  }

  /**
   * Place tous les éléments visuels sur l'écran :
   * fond, nuages, titre, cartes de sélection et astuce ESC.
   */
  protected buildScene(): void {
    const { width, height } = this.scale;

    this.buildBackground(width, height);

    // Titre de la page
    this.add
      .text(width / 2, height * 0.1, "SÉLECTIONNER UN CHAPITRE", {
        fontSize: css("--select-title-size"),
        fontFamily: css("--select-font"),
        color: css("--select-title-color"),
        stroke: css("--select-title-stroke"),
        strokeThickness: cssNum("--select-title-stroke-width"),
      })
      .setOrigin(0.5);

    // Carte "Projets" — à gauche du centre
    this.createLevelCard(
      width / 2 - 180,
      height * 0.52,
      "CHAPITRE 1: PROJETS",
      "--select-card-projects-accent",
      "--select-card-projects-bg",
      () => this.launchLevel("ProjectsScene"),
    );

    // Carte "Expériences" — à droite du centre
    this.createLevelCard(
      width / 2 + 180,
      height * 0.52,
      "CHAPITRE 2: EXPÉRIENCES",
      "--select-card-xp-accent",
      "--select-card-xp-bg",
      () => this.launchLevel("ExperiencesScene"),
    );

    // Astuce pour revenir au menu
    this.add
      .text(width / 2, height * 0.93, "ESC — RETOUR AU MENU", {
        fontSize: css("--select-hint-size"),
        fontFamily: css("--select-font"),
        color: css("--select-hint-color"),
      })
      .setOrigin(0.5);

    // Touche ESC : retour au menu principal
    if (this.input.keyboard) {
      this.input.keyboard
        .addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
        .on("down", () => this.launchLevel("MainMenuScene"));
    }
  }

  /**
   * Crée une carte de sélection de niveau.
   * La carte regroupe tous ses éléments dans un conteneur Phaser
   * pour qu'ils bougent et s'animent ensemble lors du survol.
   *
   * @param x         - Centre horizontal de la carte (en pixels)
   * @param y         - Centre vertical de la carte (en pixels)
   * @param title     - Nom du niveau affiché sur la carte
   * @param accentVar - Variable CSS de la couleur d'accent (bordure, titre, bouton)
   * @param bgVar     - Variable CSS de la couleur de fond de la carte
   * @param onSelect  - Fonction appelée quand le joueur clique sur la carte
   */
  private createLevelCard(
    x: number,
    y: number,
    title: string,
    accentVar: string,
    bgVar: string,
    onSelect: () => void,
  ): void {
    const W = 280;
    const H = 230;

    // Couleurs lues depuis le CSS — deux formats nécessaires :
    // - entier (0x4ec9b0) pour les rectangles Phaser
    // - string ("#4ec9b0") pour les textes Phaser
    const accentInt = cssHex(accentVar);
    const bgInt = cssHex(bgVar);
    const accentStr = css(accentVar);

    // Le conteneur regroupe tous les éléments de la carte.
    // Animer le conteneur déplace et redimensionne tout d'un coup.
    const container = this.add.container(x, y);

    // Fond de la carte avec bordure colorée
    const cardBg = this.add
      .rectangle(0, 0, W, H, bgInt)
      .setStrokeStyle(2, accentInt);

    // Titre de la carte ("PROJETS" ou "EXPÉRIENCES")
    const titleText = this.add
      .text(0, -88, title, {
        fontSize: css("--select-card-title-size"),
        fontFamily: css("--select-font"),
        color: accentStr,
      })
      .setOrigin(0.5);

    // Personnage animé au centre de la carte — point visuel d'accroche
    const player = this.add
      .image(0, -5, KEYS.PLAYER)
      .setFrame("idle")
      .setScale(4);

    // Animation de flottement du personnage (monte et descend en boucle)
    this.tweens.add({
      targets: player,
      y: -11,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Bouton "JOUER"
    const btnBg = this.add.rectangle(0, 72, 160, 36, accentInt);
    const btnText = this.add
      .text(0, 72, "JOUER ►", {
        fontSize: css("--select-btn-label-size"),
        fontFamily: css("--select-font"),
        color: css("--select-btn-label-color"),
      })
      .setOrigin(0.5);

    container.add([cardBg, titleText, player, btnBg, btnText]);

    // Zone interactive sur toute la surface de la carte
    container.setInteractive(
      new Phaser.Geom.Rectangle(-W / 2, -H / 2, W, H),
      Phaser.Geom.Rectangle.Contains,
    );

    // Survol : la carte grandit légèrement et la bordure s'épaissit
    container.on("pointerover", () => {
      this.tweens.add({ targets: container, scaleX: 1.04, scaleY: 1.04, duration: 120 });
      cardBg.setStrokeStyle(3, accentInt);
    });

    // Fin de survol : retour à la taille normale
    container.on("pointerout", () => {
      this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 120 });
      cardBg.setStrokeStyle(2, accentInt);
    });

    // Clic sur la carte → lance le niveau
    container.on("pointerdown", onSelect);
  }
}
