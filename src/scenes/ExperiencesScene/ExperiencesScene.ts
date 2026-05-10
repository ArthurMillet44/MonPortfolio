/**
 * Sélection d'une expérience (Chapitre 2)
 *
 * Étend BaseChapterScene en définissant uniquement ce qui est propre
 * à ce chapitre : titre, données, couleurs CSS et disposition des cartes.
 */

import {
  BaseChapterScene,
  ChapterItem,
} from "@/scenes/Common/BaseChapterScene";
import { experiences } from "@/data/experiences";
import "./ExperiencesScene.css";

export class ExperiencesScene extends BaseChapterScene {
  constructor() {
    super({ key: "ExperiencesScene" });
  }

  protected readonly cssPrefix = "--experiences";
  protected readonly chapterTitle = "CHAPITRE 2 — EXPÉRIENCES";
  protected readonly items: ChapterItem[] = experiences;
  protected readonly cardWidth = 520;
  protected readonly cardHeight = 70;

  /**
   * Colonne unique centrée adaptée aux titres longs.
   * @param width  - Largeur de la scène en pixels
   * @param height - Hauteur de la scène en pixels
   * @returns Tableau des positions {x, y} de chaque carte
   */
  protected getCardPositions(
    width: number,
    height: number,
  ): { x: number; y: number }[] {
    return this.items.map((_, index) => ({
      x: width / 2,
      y: height * 0.37 + index * 90,
    }));
  }
}
