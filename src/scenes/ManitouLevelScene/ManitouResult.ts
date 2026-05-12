/**
 * Construit l'écran de résultat : score en technos distinctes, message de mission,
 * chips de la stack et boutons d'action.
 */

import Phaser from "phaser";
import { css, cssHex } from "@/utils/cssVars";
import { TECH, TechId } from "./ManitouConfig";
import { buildButton } from "./ManitouUI";

/**
 * Affiche l'écran de résultat après la fin d'une partie.
 *
 * @param scene    - Scène Phaser cible.
 * @param caught   - Liste des technos distinctes collectées pendant la partie.
 * @param onReplay - Appelé par le bouton "Rejouer" (relance directement le jeu).
 * @param onMenu   - Appelé par le bouton "Menu" (retour à la sélection de chapitres).
 */
export function buildResult(
  scene: Phaser.Scene,
  caught: TechId[],
  onReplay: () => void,
  onMenu: () => void,
): void {
  const { width, height } = scene.scale;
  const font = css("--font-pixel");

  // Titre, score et message de mission
  scene.add
    .text(width / 2, height * 0.1, "RÉSULTAT", {
      fontSize: "34px",
      fontFamily: font,
      color: css("--manitou-accent"),
      stroke: "#000000",
      strokeThickness: 3,
    })
    .setOrigin(0.5);

  // Score : nombre de technos distinctes collectées
  scene.add
    .text(
      width / 2,
      height * 0.245,
      `${caught.length} / ${TECH.length} TECHNOS DÉPLOYÉES`,
      {
        fontSize: "18px",
        fontFamily: font,
        color: css("--manitou-score-color"),
      },
    )
    .setOrigin(0.5);

  // Message de mission selon le score (0 à 6) — voir la fonction rating() ci-dessous
  scene.add
    .text(width / 2, height * 0.355, rating(caught.length), {
      fontSize: "12px",
      fontFamily: font,
      color: "#ffffff",
      wordWrap: { width: 620 },
      align: "center",
    })
    .setOrigin(0.5);

  // Les technos collectées sont mises en valeur, les autres sont grisées
  scene.add
    .text(width / 2, height * 0.475, "TECHNOLOGIES DE LA MISSION :", {
      fontSize: "11px",
      fontFamily: font,
      color: "#ffffff",
    })
    .setOrigin(0.5);

  drawTechRow(scene, width / 2, height * 0.557, caught);

  // Carte récapitulative de l'expérience
  const cardY = height * 0.69;

  // Fond de carte et texte
  scene.add
    .rectangle(width / 2, cardY, 430, 58, cssHex("--manitou-panel-bg"))
    .setStrokeStyle(1, cssHex("--manitou-divider"));

  // Titre et description de l'expérience professionnelle
  scene.add
    .text(width / 2, cardY - 13, "MANITOU — Stage · BUT Informatique", {
      fontSize: "12px",
      fontFamily: font,
      color: css("--manitou-accent"),
    })
    .setOrigin(0.5);

  // Description de l'expérience professionnelle
  scene.add
    .text(width / 2, cardY + 11, "Gestion de licences logicielles · R&D IS", {
      fontSize: "11px",
      fontFamily: font,
      color: "#ffffff",
    })
    .setOrigin(0.5);

  const btnY = height * 0.875;
  buildButton(scene, width / 2 - 220, btnY, "VOIR DÉMO", () => {
    /* TODO */
  });
  buildButton(scene, width / 2, btnY, "REJOUER", onReplay);
  buildButton(scene, width / 2 + 220, btnY, "MENU", onMenu);
}

/**
 * Retourne un message thématique selon le nombre de technos distinctes collectées.
 * Les 7 niveaux correspondent aux 7 scores possibles (0 à 6).
 * @param n - Score de 0 à 6 (nombre de technos distinctes collectées)
 * @return Message de résultat à afficher
 */
function rating(n: number): string {
  if (n === 6)
    return "MISSION ACCOMPLIE: Stack complète déployée en production !";
  if (n === 5) return "QUASI-LIVRAISON: Un outil manque avant la mise en prod.";
  if (n === 4)
    return "VERSION BÊTA: L'app tourne, mais la stack n'est pas complète.";
  if (n === 3)
    return "PROTOTYPE INCOMPLET: La moitié de la stack, pas de livraison.";
  if (n === 2)
    return "STACK INSUFFISANTE: Trop peu de briques pour construire.";
  if (n === 1)
    return "MISSION ÉCHOUÉE: Une seule techno, l'app ne peut pas tourner.";
  return "DÉPLOIEMENT AVORTÉ: Aucune techno activée. L'app ne voit pas le jour.";
}

/**
 * Affiche une rangée de chips pour toutes les technos de la stack.
 * Les technos collectées sont mises en valeur ; les autres sont grisées.
 *
 * @param scene  - Scène Phaser cible.
 * @param cx     - Centre horizontal de la rangée.
 * @param cy     - Centre vertical de la rangée.
 * @param caught - Technos collectées pendant la partie.
 */
function drawTechRow(
  scene: Phaser.Scene,
  cx: number,
  cy: number,
  caught: TechId[],
): void {
  const font = css("--font-pixel");
  const chipW = 82;
  const chipH = 24;
  const gap = 6;
  // 6 chips × (82 + 6) − 6 = 522px, centrés dans 800px → départ à 139px
  let x = cx - (TECH.length * (chipW + gap) - gap) / 2 + chipW / 2;

  for (const tech of TECH) {
    const isCaught = caught.includes(tech.id);
    scene.add.rectangle(x, cy, chipW, chipH, tech.color, isCaught ? 0.9 : 0.25);
    scene.add
      .text(x, cy, tech.label, {
        fontSize: "9px",
        fontFamily: font,
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setAlpha(isCaught ? 1 : 0.4);
    x += chipW + gap;
  }
}
