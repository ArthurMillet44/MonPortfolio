/**
 * Construit l'écran d'introduction du niveau Manitou :
 * présentation de l'expérience, texte de mission et modale des règles.
 */

import Phaser from "phaser";
import { css, cssHex } from "@/utils/cssVars";
import { TIMER_SECONDS } from "./ManitouConfig";
import { buildButton } from "./ManitouUI";

/**
 * Affiche l'écran d'introduction : titre, mission et bouton "Commencer".
 *
 * @param scene   - Scène Phaser cible.
 * @param onStart - Appelé quand le joueur clique sur "Commencer" (ouvre la modale des règles).
 */
export function buildIntro(scene: Phaser.Scene, onStart: () => void): void {
  const { width, height } = scene.scale;
  const font = css("--font-pixel");

  // Titre et sous-titre
  scene.add
    .text(
      width / 2,
      height * 0.07,
      "EXPÉRIENCE PROFESSIONNELLE  ·  Stage  ·  BUT Informatique",
      { fontSize: "11px", fontFamily: font, color: "#ffffff" },
    )
    .setOrigin(0.5);

  // Titre principal
  scene.add
    .text(width / 2, height * 0.17, "MANITOU", {
      fontSize: "44px",
      fontFamily: font,
      color: css("--manitou-accent"),
      stroke: "#000000",
      strokeThickness: 4,
    })
    .setOrigin(0.5);

  // Texte de mission
  scene.add
    .graphics()
    .lineStyle(1, cssHex("--manitou-divider"))
    .lineBetween(width * 0.15, height * 0.32, width * 0.85, height * 0.32);
  scene.add
    .text(width / 2, height * 0.36, "MISSION", {
      fontSize: "14px",
      fontFamily: font,
      color: css("--manitou-accent"),
    })
    .setOrigin(0.5);

  // Description de la mission
  scene.add
    .text(
      width / 2,
      height * 0.41,
      "L'équipe R&D IS est responsable de la gestion d'un grand nombre de licences logicielles. J'ai développé une application permettant de comparer le nombre de licences achetées avec celles effectivement utilisées, afin d'obtenir une vue quasi instantanée des utilisateurs rendant l'attribution des licences plus efficace.",
      {
        fontSize: "14px",
        fontFamily: "'SpeedDemon', monospace",
        color: css("--manitou-text"),
        wordWrap: { width: 660 },
        align: "center",
        lineSpacing: 10,
      },
    )
    .setOrigin(0.5, 0);

  buildButton(scene, width / 2, height * 0.855, "► COMMENCER ◄", onStart);

  // Astuce ESC en bas
  scene.add
    .text(width / 2, height * 0.955, "ESC — RETOUR AU MENU", {
      fontSize: "9px",
      fontFamily: font,
      color: "#ffffff",
    })
    .setOrigin(0.5);
}

/**
 * Affiche la modale des règles par-dessus l'intro.
 *
 * La fermeture (ESC ou bouton Jouer) détruit uniquement les objets de la modale,
 * laissant l'intro intacte en dessous.
 *
 * @param scene    - Scène Phaser cible.
 * @param escKey   - Référence à la touche ESC pour détourner son comportement pendant la modale.
 * @param onPlay   - Appelé quand le joueur clique sur "Jouer" (démarre la partie).
 * @param resetEsc - Restaure le comportement par défaut d'ESC après fermeture de la modale.
 */
export function buildRulesOverlay(
  scene: Phaser.Scene,
  escKey: Phaser.Input.Keyboard.Key | undefined,
  onPlay: () => void,
  resetEsc: () => void,
): void {
  const { width, height } = scene.scale;
  const font = css("--font-pixel");

  // Tous les objets de la modale sont trackés pour être détruits ensemble à la fermeture.
  const overlay: Phaser.GameObjects.GameObject[] = [];
  const close = () => {
    overlay.forEach((o) => o.destroy());
    resetEsc();
  };

  // Pendant que la modale est ouverte, ESC = fermer la modale (pas quitter la scène).
  escKey?.removeAllListeners();
  escKey?.on("down", close);

  // Fond semi-transparent bloquant les clics sur l'intro.
  overlay.push(
    scene.add
      .rectangle(width / 2, height / 2, width, height, 0x000000, 0.78)
      .setInteractive(),
  );

  const panelW = 590;
  const panelH = 400;
  const panelCx = width / 2;
  const panelCy = height / 2;

  overlay.push(
    scene.add
      .rectangle(panelCx, panelCy, panelW, panelH, cssHex("--manitou-panel-bg"))
      .setStrokeStyle(2, cssHex("--manitou-accent")),
  );

  overlay.push(
    scene.add
      .text(panelCx, panelCy - panelH / 2 + 42, "RÈGLES DU JEU", {
        fontSize: "20px",
        fontFamily: font,
        color: css("--manitou-accent"),
      })
      .setOrigin(0.5),
  );

  overlay.push(
    scene.add
      .text(
        panelCx,
        panelCy - panelH / 2 + 88,
        [
          "Des blocs représentant les technos de la mission tombent du ciel.",
          "",
          "Clique dessus, glisse-les et dépose-les dans la zone à droite.",
          "",
          "Objectif : collecter les 6 technos de la stack !",
          "",
          `Tu as ${TIMER_SECONDS} secondes. Bonne chance !`,
        ],
        {
          fontSize: "13px",
          fontFamily: font,
          color: css("--manitou-text"),
          align: "center",
          wordWrap: { width: panelW - 80 },
        },
      )
      .setOrigin(0.5, 0),
  );

  const btnCont = scene.add.container(panelCx, panelCy + panelH / 2 - 60);
  const btnBg = scene.add
    .rectangle(0, 0, 170, 40, cssHex("--manitou-accent"))
    .setStrokeStyle(2, cssHex("--manitou-accent"));
  const btnTxt = scene.add
    .text(0, 0, "JOUER ►", {
      fontSize: "14px",
      fontFamily: font,
      color: "#ffffff",
    })
    .setOrigin(0.5);
  btnCont.add([btnBg, btnTxt]);
  btnCont.setInteractive(
    new Phaser.Geom.Rectangle(-85, -20, 170, 40),
    Phaser.Geom.Rectangle.Contains,
  );
  btnCont.on("pointerover", () => {
    btnBg.setStrokeStyle(2, 0xffffff);
    scene.tweens.add({
      targets: btnCont,
      scaleX: 1.07,
      scaleY: 1.07,
      duration: 80,
    });
  });
  btnCont.on("pointerout", () => {
    btnBg.setStrokeStyle(2, cssHex("--manitou-accent"));
    scene.tweens.add({ targets: btnCont, scaleX: 1, scaleY: 1, duration: 80 });
  });
  btnCont.on("pointerdown", () => onPlay());
  overlay.push(btnCont);

  overlay.push(
    scene.add
      .text(panelCx, panelCy + panelH / 2 + 18, "ESC pour annuler", {
        fontSize: "9px",
        fontFamily: font,
        color: "#ffffff",
      })
      .setOrigin(0.5),
  );
}
