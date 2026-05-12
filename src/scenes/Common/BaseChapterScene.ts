/**
 * Classe de base pour les scènes de sélection de niveau
 *
 * ProjectsScene et ExperiencesScene partagent la même structure :
 * fond animé, titre, grille de cartes interactives, touche ESC.
 *
 * Méthodes concrètes (définies ici, partagées par tous) :
 *   - buildScene()       → fond + titre + cartes + touche ESC (appelé par BaseScene.create())
 *   - buildCard()        → carte interactive avec hover et clic
 *
 * Méthodes héritées de BaseScene :
 *   - create()           → fondu d'entrée + textures + buildScene()
 *   - buildBackground()  → fond de ciel + nuages animés
 *   - launchLevel()      → transition vers une autre scène
 *
 * Méthodes et propriétés abstraites (à définir dans chaque sous-classe) :
 *   - cssPrefix          → préfixe des variables CSS (ex : "--projects")
 *   - chapterTitle       → texte du titre affiché en haut
 *   - items              → tableau des éléments à afficher
 *   - cardWidth / cardHeight → dimensions des cartes
 *   - getCardPositions() → positions x/y de chaque carte selon la mise en page voulue
 */

import Phaser from "phaser";
import { css, cssNum, cssHex } from "@/utils/cssVars";
import { BaseScene } from "./BaseScene";

/** Structure minimale attendue pour chaque élément affiché sur une carte */
export interface ChapterItem {
  id: string;
  title: string;
  /** Clé de la scène à lancer au clic (optionnel) */
  sceneKey?: string;
}

export abstract class BaseChapterScene extends BaseScene {
  /** Préfixe des variables CSS de la scène (ex : "--projects" ou "--experiences") */
  protected abstract readonly cssPrefix: string;

  /** Titre affiché en haut de la scène (ex : "CHAPITRE 1 — PROJETS") */
  protected abstract readonly chapterTitle: string;

  /** Tableau des éléments à afficher sous forme de cartes */
  protected abstract readonly items: ChapterItem[];

  /** Largeur d'une carte en pixels */
  protected abstract readonly cardWidth: number;

  /** Hauteur d'une carte en pixels */
  protected abstract readonly cardHeight: number;

  /**
   * Retourne les positions {x, y} de chaque carte.
   * Chaque sous-classe choisit librement sa mise en page
   * (grille, colonne, disposition custom…).
   *
   * @param width  - Largeur de la scène en pixels
   * @param height - Hauteur de la scène en pixels
   */
  protected abstract getCardPositions(
    width: number,
    height: number,
  ): { x: number; y: number }[];

  /**
   * Construit tous les éléments visuels :
   * fond, nuages, titre, cartes et astuce ESC.
   */
  protected buildScene(): void {
    const { width, height } = this.scale;
    const p = this.cssPrefix; // raccourci local pour alléger les appels css()

    this.buildBackground(width, height);

    // Titre de la page
    this.add
      .text(width / 2, height * 0.11, this.chapterTitle, {
        fontSize: css(`${p}-title-size`),
        fontFamily: css("--font-pixel"),
        color: css(`${p}-title-color`),
        stroke: css("--color-bg"),
        strokeThickness: cssNum(`${p}-title-stroke-width`),
      })
      .setOrigin(0.5);

    // Cartes — positions calculées par la sous-classe
    const positions = this.getCardPositions(width, height);
    this.items.forEach((item, index) => {
      const { x, y } = positions[index];
      this.buildCard(x, y, index + 1, item.title, item.id, item.sceneKey);
    });

    // Astuce ESC en bas
    this.add
      .text(width / 2, height * 0.93, "ESC — RETOUR AU CHOIX DES CHAPITRES", {
        fontSize: css(`${p}-hint-size`),
        fontFamily: css("--font-pixel"),
        color: css(`${p}-hint-color`),
      })
      .setOrigin(0.5);

    // Touche ESC : retour à l'écran de sélection des chapitres
    if (this.input.keyboard) {
      this.input.keyboard
        .addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
        .on("down", () => this.launchLevel("LevelSelectScene"));
    }
  }

  /**
   * Crée une carte interactive à la position donnée.
   * La carte affiche un numéro à gauche et le titre à droite.
   * Au survol, elle grandit légèrement et sa bordure s'épaissit.
   *
   * @param x     - Centre horizontal de la carte
   * @param y     - Centre vertical de la carte
   * @param num   - Numéro affiché à gauche (ex : 1 → "01")
   * @param title - Texte principal de la carte
   * @param id    - Identifiant de l'élément (pour la navigation future)
   */
  private buildCard(
    x: number,
    y: number,
    num: number,
    title: string,
    _id: string,
    sceneKey?: string,
  ): void {
    const p = this.cssPrefix;
    const W = this.cardWidth;
    const H = this.cardHeight;
    const accentInt = cssHex(`${p}-card-accent`);
    const bgInt = cssHex(`${p}-card-bg`);

    // Conteneur : regroupe tous les éléments pour les animer ensemble au survol
    const container = this.add.container(x, y);

    // Fond de la carte avec bordure colorée
    const cardBg = this.add
      .rectangle(0, 0, W, H, bgInt)
      .setStrokeStyle(2, accentInt);

    // Numéro à gauche (ex : "01")
    const numText = this.add
      .text(-W / 2 + 16, 0, String(num).padStart(2, "0"), {
        fontSize: css(`${p}-card-text-size`),
        fontFamily: css("--font-pixel"),
        color: css(`${p}-card-accent`),
      })
      .setOrigin(0, 0.5);

    // Titre aligné à droite
    const titleText = this.add
      .text(W / 2 - 16, 0, title, {
        fontSize: css(`${p}-card-text-size`),
        fontFamily: css("--font-pixel"),
        color: css(`${p}-card-text-color`),
      })
      .setOrigin(1, 0.5);

    container.add([cardBg, numText, titleText]);

    if (!sceneKey) {
      container.setAlpha(0.35);
      return;
    }

    // Zone interactive couvrant toute la surface de la carte
    container.setInteractive(
      new Phaser.Geom.Rectangle(-W / 2, -H / 2, W, H),
      Phaser.Geom.Rectangle.Contains,
    );

    // Survol : légère mise à l'échelle et bordure plus épaisse
    container.on("pointerover", () => {
      this.tweens.add({
        targets: container,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100,
      });
      cardBg.setStrokeStyle(3, accentInt);
    });

    // Fin de survol : retour à l'état normal
    container.on("pointerout", () => {
      this.tweens.add({
        targets: container,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
      });
      cardBg.setStrokeStyle(2, accentInt);
    });

    // Clic : lance la scène si disponible, sinon indique que le niveau arrive bientôt
    container.on("pointerdown", () => {
      if (sceneKey) {
        this.launchLevel(sceneKey);
      }
    });
  }
}
