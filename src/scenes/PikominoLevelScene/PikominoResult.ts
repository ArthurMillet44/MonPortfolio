/**
 * Construit l'écran de résultat : score, message thématique,
 * récap des technos et boutons d'action.
 */

import Phaser from "phaser";
import { css, cssHex } from "@/utils/cssVars";
import { TECHS, TechId } from "./PikominoConfig";
import { buildButton } from "./PikominoUI";

export function buildResult(
  scene: Phaser.Scene,
  collectedIds: TechId[],
  onReplay: () => void,
  onDemo: () => void,
  onGithub: () => void,
  onMenu: () => void,
): void {
  const { width, height } = scene.scale;
  const font = css("--font-pixel");
  const n = collectedIds.length;

  scene.add
    .text(width / 2, height * 0.08, "RÉSULTAT", {
      fontSize: "34px",
      fontFamily: font,
      color: css("--piko-score-color"),
      stroke: "#000000",
      strokeThickness: 3,
    })
    .setOrigin(0.5);

  scene.add
    .text(width / 2, height * 0.225, `${n} / ${TECHS.length} TECHNOS COLLECTÉES`, {
      fontSize: "18px",
      fontFamily: font,
      color: css("--piko-timer-ok"),
    })
    .setOrigin(0.5);

  scene.add
    .text(width / 2, height * 0.335, rating(n), {
      fontSize: "15px",
      fontFamily: font,
      color: "#ffffff",
      wordWrap: { width: 620 },
      align: "center",
    })
    .setOrigin(0.5);

  scene.add
    .text(width / 2, height * 0.435, "STACK TECHNIQUE :", {
      fontSize: "14px",
      fontFamily: font,
      color: "#ffffff",
    })
    .setOrigin(0.5);

  drawTechChips(scene, width / 2, height * 0.52, collectedIds);

  const btnY = height * 0.875;
  buildButton(scene, width / 2 - 270, btnY, "REJOUER",     onReplay, cssHex("--piko-timer-ok"));
  buildButton(scene, width / 2 - 90,  btnY, "VOIR DÉMO",   onDemo,   0x3498db);
  buildButton(scene, width / 2 + 90,  btnY, "VOIR GITHUB", onGithub, 0x3498db);
  buildButton(scene, width / 2 + 270, btnY, "MENU",        onMenu,   cssHex("--piko-timer-ok"));

  scene.add
    .text(width / 2, height * 0.955, "ESC — RETOUR AU MENU", {
      fontSize: "13px",
      fontFamily: font,
      color: "#ffffff",
    })
    .setOrigin(0.5);
}

function rating(n: number): string {
  if (n === 8) return "STACK COMPLÈTE: Tout collecté ! Tu maîtrises le projet Pikomino.";
  if (n >= 6) return "PRESQUE COMPLET: Encore un effort pour la stack entière !";
  if (n >= 4) return "À MOITIÉ: La moitié de la stack est dans le panier.";
  if (n >= 2) return "DÉBUT TIMIDE: Quelques technos collectées, le serpent peut mieux faire.";
  if (n === 1) return "UN SEUL: Une seule techno collectée. Réessaie !";
  return "BREDOUILLE: Le serpent n'a rien mangé. À toi de jouer !";
}

/**
 * Affiche deux rangées de 4 chips représentant les 8 technos.
 * Les technos collectées sont mises en valeur, les autres grisées.
 */
function drawTechChips(
  scene: Phaser.Scene,
  cx: number,
  cy: number,
  collectedIds: TechId[],
): void {
  const font = css("--font-pixel");
  const chipW = 90;
  const chipH = 32;
  const gap = 8;

  const row1 = TECHS.slice(0, 4);
  const row2 = TECHS.slice(4);

  const drawRow = (
    techs: ReadonlyArray<(typeof TECHS)[number]>,
    rowCy: number,
  ) => {
    const total = techs.length * (chipW + gap) - gap;
    let x = cx - total / 2 + chipW / 2;

    for (const tech of techs) {
      const collected = collectedIds.includes(tech.id);
      scene.add.rectangle(x, rowCy, chipW, chipH, tech.color, collected ? 0.9 : 0.22);
      scene.add
        .text(x, rowCy, tech.label, {
          fontSize: "11px",
          fontFamily: font,
          color: "#ffffff",
          align: "center",
          wordWrap: { width: chipW - 8 },
        })
        .setOrigin(0.5)
        .setAlpha(collected ? 1 : 0.35);
      x += chipW + gap;
    }
  };

  drawRow(row1, cy);
  drawRow(row2, cy + chipH + 10);
}
