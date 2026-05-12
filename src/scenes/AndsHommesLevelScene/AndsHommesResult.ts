/**
 * Construit l'écran de résultat : score, message thématique,
 * récap des paires et boutons d'action.
 */

import Phaser from "phaser";
import { css, cssHex } from "@/utils/cssVars";
import { PAIRS, PairId } from "./AndsHommesConfig";
import { buildButton } from "./AndsHommesUI";

/**
 * Affiche l'écran de résultat après la fin d'une partie.
 *
 * @param scene    - Scène Phaser cible.
 * @param foundIds - IDs des paires trouvées pendant la partie.
 * @param onReplay - Bouton "Rejouer".
 * @param onDemo   - Bouton "Voir Démo" (ouvre l'overlay vidéo).
 * @param onGithub - Bouton "Voir GitHub".
 * @param onMenu   - Bouton "Menu".
 */
export function buildResult(
  scene: Phaser.Scene,
  foundIds: PairId[],
  onReplay: () => void,
  onDemo: () => void,
  onGithub: () => void,
  onMenu: () => void,
): void {
  const { width, height } = scene.scale;
  const font = css("--font-pixel");
  const n = foundIds.length;

  // Titre
  scene.add
    .text(width / 2, height * 0.08, "RÉSULTAT", {
      fontSize: "34px",
      fontFamily: font,
      color: css("--ah-score-color"),
      stroke: "#000000",
      strokeThickness: 3,
    })
    .setOrigin(0.5);

  // Score
  scene.add
    .text(width / 2, height * 0.225, `${n} / ${PAIRS.length} PAIRES TROUVÉES`, {
      fontSize: "18px",
      fontFamily: font,
      color: css("--ah-timer-ok"),
    })
    .setOrigin(0.5);

  // Message thématique
  scene.add
    .text(width / 2, height * 0.335, rating(n), {
      fontSize: "15px",
      fontFamily: font,
      color: "#ffffff",
      wordWrap: { width: 620 },
      align: "center",
    })
    .setOrigin(0.5);

  // Titre du récap stack
  scene.add
    .text(width / 2, height * 0.435, "STACK TECHNIQUE :", {
      fontSize: "14px",
      fontFamily: font,
      color: "#ffffff",
    })
    .setOrigin(0.5);

  drawPairsChips(scene, width / 2, height * 0.52, foundIds);

  // 4 boutons : REJOUER | VOIR DÉMO | VOIR GITHUB | MENU
  const btnY = height * 0.875;
  buildButton(
    scene,
    width / 2 - 270,
    btnY,
    "REJOUER",
    onReplay,
    cssHex("--ah-timer-ok"),
  );
  buildButton(
    scene,
    width / 2 - 90,
    btnY,
    "VOIR DÉMO",
    onDemo,
    cssHex("--ah-accent"),
  );
  buildButton(
    scene,
    width / 2 + 90,
    btnY,
    "VOIR GITHUB",
    onGithub,
    cssHex("--ah-accent"),
  );
  buildButton(
    scene,
    width / 2 + 270,
    btnY,
    "MENU",
    onMenu,
    cssHex("--ah-timer-ok"),
  );

  scene.add
    .text(width / 2, height * 0.955, "ESC — RETOUR AU MENU", {
      fontSize: "13px",
      fontFamily: font,
      color: "#ffffff",
    })
    .setOrigin(0.5);
}

function rating(n: number): string {
  if (n === 7) return "CATALOGUE MAÎTRISÉ: Tu connais And's Hommes par cœur !";
  if (n >= 5) return "BON CLIENT: Tu te souviens de presque toute la stack.";
  if (n >= 3) return "CLIENT RÉGULIER: Le projet te rappelle quelque chose...";
  if (n >= 1)
    return "PREMIÈRE VISITE: La boutique ne t'a pas encore tout révélé.";
  return "VITRINE FERMÉE: Aucune paire retrouvée. Réessaie !";
}

/**
 * Affiche deux rangées de chips représentant les 7 paires.
 * Les paires trouvées sont mises en valeur, les autres grisées.
 */
function drawPairsChips(
  scene: Phaser.Scene,
  cx: number,
  cy: number,
  foundIds: PairId[],
): void {
  const font = css("--font-pixel");
  const chipW = 92;
  const chipH = 34;
  const gap = 8;

  const row1 = PAIRS.slice(0, 4);
  const row2 = PAIRS.slice(4);

  const drawRow = (
    pairs: ReadonlyArray<(typeof PAIRS)[number]>,
    rowCy: number,
  ) => {
    const total = pairs.length * (chipW + gap) - gap;
    let x = cx - total / 2 + chipW / 2;

    for (const pair of pairs) {
      const found = foundIds.includes(pair.id);
      scene.add.rectangle(
        x,
        rowCy,
        chipW,
        chipH,
        pair.color,
        found ? 0.9 : 0.22,
      );
      scene.add
        .text(x, rowCy, pair.termA, {
          fontSize: "11px",
          fontFamily: font,
          color: "#ffffff",
          align: "center",
          wordWrap: { width: chipW - 8 },
        })
        .setOrigin(0.5)
        .setAlpha(found ? 1 : 0.35);
      x += chipW + gap;
    }
  };

  drawRow(row1, cy);
  drawRow(row2, cy + chipH + 10);
}
