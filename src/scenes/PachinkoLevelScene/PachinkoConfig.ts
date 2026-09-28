/**
 * Constantes partagées par tous les modules du niveau Pachinko :
 * plateau de clous, cases d'arrivée et réglages de la physique de la bille.
 */

/** Lien vers la page itch.io du jeu ("Les Dés de la Mer"). */
export const ITCH_URL = "https://amillet.itch.io/les-d-de-la-mer";

/** Bornes du plateau de jeu (canvas 800×600). */
export const BOARD = {
  left: 90,
  right: 710,
  /** Y à partir duquel la bille est lâchée. */
  top: 90,
  /** Y de la ligne d'arrivée dans les cases. */
  bottom: 470,
};

/** Rayon de la bille et des clous, en pixels. */
export const BALL_RADIUS = 8;
export const PEG_RADIUS = 5;

/** Réglages de la simulation (px/s², facteur de rebond sur les clous et les murs). */
export const GRAVITY = 1500;
export const PEG_BOUNCE = 0.62;
export const WALL_BOUNCE = 0.7;

/** Grille de clous en quinconce. */
export const PEG_ROWS = 8;
export const PEG_ROW_SPACING = 36;
export const PEG_COL_SPACING = 52;
export const PEG_TOP_Y = 150;

/**
 * Cases d'arrivée en bas du plateau.
 * Trois cases gagnantes "UNITY" (le moteur réellement utilisé pour le jeu),
 * en alternance avec deux cases "moteur concurrent" perdantes — comme sur
 * un vrai plateau de pachinko, où les cases gagnantes sont sur les bords
 * et au centre.
 */
export const BUCKETS = [
  { id: "unity-left", label: "UNITY", color: 0xf5c518, win: true },
  { id: "gamemaker", label: "GAMEMAKER", color: 0xb02e46, win: false },
  { id: "unity-center", label: "UNITY", color: 0xf5c518, win: true },
  { id: "unreal", label: "UNREAL", color: 0x2c2c2c, win: false },
  { id: "unity-right", label: "UNITY", color: 0xf5c518, win: true },
] as const;

export type BucketId = (typeof BUCKETS)[number]["id"];

/**
 * Calcule la position de chaque clou de la grille en quinconce.
 * Une rangée sur deux est décalée d'un demi-espacement.
 */
export function generatePegPositions(): { x: number; y: number }[] {
  const pegs: { x: number; y: number }[] = [];
  const width = BOARD.right - BOARD.left;
  const cols = Math.floor(width / PEG_COL_SPACING);

  for (let row = 0; row < PEG_ROWS; row++) {
    const y = PEG_TOP_Y + row * PEG_ROW_SPACING;
    const offset = row % 2 === 0 ? 0 : PEG_COL_SPACING / 2;

    for (let col = 0; col <= cols; col++) {
      const x = BOARD.left + offset + col * PEG_COL_SPACING;
      if (x >= BOARD.left + 10 && x <= BOARD.right - 10) {
        pegs.push({ x, y });
      }
    }
  }

  return pegs;
}

/** Retourne la case correspondant à une position X, selon un découpage en tranches égales. */
export function bucketAt(x: number): (typeof BUCKETS)[number] {
  const width = BOARD.right - BOARD.left;
  const clampedX = Math.min(Math.max(x, BOARD.left), BOARD.right - 0.01);
  const ratio = (clampedX - BOARD.left) / width;
  const index = Math.floor(ratio * BUCKETS.length);
  return BUCKETS[index];
}
