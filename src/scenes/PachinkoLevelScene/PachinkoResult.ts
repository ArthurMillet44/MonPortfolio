/**
 * Construit l'écran de résultat : victoire ou échec selon la case d'arrivée,
 * et boutons d'action.
 */

import Phaser from "phaser";
import { css, cssHex } from "@/utils/cssVars";
import { PachinkoOutcome } from "./PachinkoGame";
import { buildButton } from "./PachinkoUI";

/**
 * Affiche l'écran de résultat après la chute de la bille.
 *
 * @param scene    - Scène Phaser cible.
 * @param outcome  - Case dans laquelle la bille est tombée.
 * @param onReplay - Bouton "Rejouer".
 * @param onItch   - Bouton "Voir sur itch.io" (ouvre le jeu réel dans un nouvel onglet).
 * @param onMenu   - Bouton "Menu".
 */
export function buildResult(
  scene: Phaser.Scene,
  outcome: PachinkoOutcome,
  onReplay: () => void,
  onItch: () => void,
  onMenu: () => void,
): void {
  const { width, height } = scene.scale;
  const font = css("--font-pixel");

  const resultColor = outcome.win
    ? css("--pachinko-win-color")
    : css("--pachinko-fail-color");

  // Titre
  scene.add
    .text(width / 2, height * 0.15, outcome.win ? "GAGNÉ !" : "PERDU...", {
      fontSize: css("--pachinko-result-title-size"),
      fontFamily: css("--font-title"),
      color: resultColor,
      stroke: "#000000",
      strokeThickness: 3,
    })
    .setOrigin(0.5);

  // Case atteinte
  scene.add
    .text(width / 2, height * 0.32, `LA BILLE EST TOMBÉE DANS : ${outcome.label}`, {
      fontSize: css("--pachinko-result-subtitle-size"),
      fontFamily: font,
      color: "#ffffff",
    })
    .setOrigin(0.5);

  // Message thématique
  scene.add
    .text(width / 2, height * 0.44, message(outcome.win), {
      fontSize: css("--pachinko-result-message-size"),
      fontFamily: font,
      color: css("--pachinko-text"),
      wordWrap: { width: 620 },
      align: "center",
    })
    .setOrigin(0.5);

  const btnY = height * 0.78;
  buildButton(
    scene,
    width / 2 - 220,
    btnY,
    "REJOUER",
    onReplay,
    cssHex("--pachinko-win-color"),
  );
  buildButton(scene, width / 2, btnY, "VOIR SUR ITCH.IO", onItch);
  buildButton(
    scene,
    width / 2 + 220,
    btnY,
    "MENU",
    onMenu,
    cssHex("--pachinko-win-color"),
  );
}

function message(win: boolean): string {
  if (win) {
    return "Bien joué, c'est bien avec Unity que \"Les Dés de la Mer\" a été développé !";
  }
  return "Raté ! Le jeu a en réalité été développé avec Unity. Retentez votre chance !";
}
