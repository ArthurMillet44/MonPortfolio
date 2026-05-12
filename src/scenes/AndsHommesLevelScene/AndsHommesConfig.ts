/**
 * Constantes partagées par tous les modules du niveau And's Hommes :
 * paires du memory, dimensions des cartes et durée de la partie.
 */

/** Les 7 paires concept ↔ définition du jeu de memory. */
export const PAIRS = [
  { id: "symfony", termA: "Symfony", termB: "Framework\nPHP", color: 0x764abc },
  { id: "twig", termA: "Twig", termB: "Moteur de\ntemplates", color: 0x8bc34a },
  {
    id: "doctrine",
    termA: "Doctrine ORM",
    termB: "Mapping\nobjet-relationnel",
    color: 0xe67e22,
  },
  {
    id: "mysql",
    termA: "MySQL",
    termB: "Base de données\nSQL",
    color: 0x00758f,
  },
  {
    id: "phpunit",
    termA: "PHPUnit",
    termB: "Framework\nde tests",
    color: 0x3498db,
  },
  {
    id: "mvc",
    termA: "MVC",
    termB: "Architecture\ndu projet",
    color: 0xe74c3c,
  },
  { id: "methodo", termA: "Méthodologie", termB: "Agile", color: 0x27ae60 },
] as const;

export type PairId = (typeof PAIRS)[number]["id"];

/** Durée d'une partie en secondes. */
export const TIMER_SECONDS = 90;

/** Dimensions des cartes et espacement de la grille (canvas 800×600). */
export const CARD_W = 104;
export const CARD_H = 85;
export const CARD_GAP_X = 6;
export const CARD_GAP_Y = 22;

/** Durée (ms) de chaque demi-flip (scaleX 1→0 puis 0→1). */
export const FLIP_MS = 180;

/** Délai (ms) avant de re-retourner une paire non trouvée. */
export const MISMATCH_DELAY = 900;
