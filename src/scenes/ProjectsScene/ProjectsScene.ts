/**
 * Sélection d'un projet (Chapitre 1)
 *
 * Étend BaseChapterScene en définissant uniquement ce qui est propre
 * à ce chapitre : titre, données, couleurs CSS et disposition des cartes.
 */

import {
  BaseChapterScene,
  ChapterItem,
} from "@/scenes/Common/BaseChapterScene";
import { projects } from "@/data/projects";
import "./ProjectsScene.css";

/** Positions des 3 colonnes de la grille */
const COLUMNS = [150, 400, 650] as const;

/** Y de chaque rangée */
const ROW_Y = [210, 320, 430] as const;

export class ProjectsScene extends BaseChapterScene {
  constructor() {
    super({ key: "ProjectsScene" });
  }

  // Propriétés spécifiques à ce chapitre
  protected readonly cssPrefix = "--projects";
  protected readonly chapterTitle = "CHAPITRE 1 — PROJETS";
  protected readonly items: ChapterItem[] = projects;
  protected readonly cardWidth = 220;
  protected readonly cardHeight = 70;

  /**
   * Grille 3 colonnes.
   * La dernière carte est centrée si elle se retrouve seule sur sa rangée.
   * @param width  - Largeur de la scène en pixels
   * @param height - Hauteur de la scène en pixels
   * @returns Tableau des positions {x, y} de chaque carte
   */
  protected getCardPositions(width: number): { x: number; y: number }[] {
    return this.items.map((_, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);

      // Si la dernière rangée n'a qu'une seule carte, on la centre
      const isLastRow = row === Math.floor((this.items.length - 1) / 3);
      const itemsInLastRow = this.items.length % 3 || 3;
      const x = isLastRow && itemsInLastRow === 1 ? width / 2 : COLUMNS[col];

      return { x, y: ROW_Y[row] };
    });
  }
}
