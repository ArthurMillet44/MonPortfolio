/**
 * Construit l'écran d'introduction du niveau Pachinko :
 * présentation du jeu "Les Dés de la Mer" et modale des règles.
 */

import Phaser from "phaser";
import { css, cssHex } from "@/utils/cssVars";
import { buildButton } from "./PachinkoUI";

/**
 * Affiche l'écran d'introduction : titre, description et bouton "Commencer".
 *
 * @param scene   - Scène Phaser cible.
 * @param onStart - Appelé quand le joueur clique sur "Commencer" (ouvre la modale des règles).
 */
export function buildIntro(scene: Phaser.Scene, onStart: () => void): void {
  const { width, height } = scene.scale;
  const font = css("--font-pixel");

  // Contexte
  scene.add
    .text(width / 2, height * 0.07, "PROJET PERSONNEL  -  Unity / C#  -  Solo", {
      fontSize: css("--pachinko-context-size"),
      fontFamily: font,
      color: "#ffffff",
    })
    .setOrigin(0.5);

  // Titre principal
  scene.add
    .text(width / 2, height * 0.17, "PACHINKO GAME", {
      fontSize: css("--pachinko-title-size"),
      fontFamily: css("--font-title"),
      color: css("--pachinko-score-color"),
      stroke: "#000000",
      strokeThickness: 4,
    })
    .setOrigin(0.5);

  // Séparateur
  scene.add
    .graphics()
    .lineStyle(1, cssHex("--pachinko-divider"))
    .lineBetween(width * 0.15, height * 0.33, width * 0.85, height * 0.33);

  scene.add
    .text(width * 0.12, height * 0.37, "MISSION", {
      fontSize: css("--pachinko-mission-label-size"),
      fontFamily: font,
      color: css("--pachinko-score-color"),
    })
    .setOrigin(0, 0.5);

  // Description du projet
  scene.add
    .text(
      width * 0.12,
      height * 0.42,
      [
        "Les Dés de la Mer est un jeu que j'ai développé seul avec Unity (C#), publié et jouable gratuitement sur itch.io.",
        "",
        "Pour le présenter ici, ce mini-jeu Pachinko reprend le principe : lâchez la bille et espérez qu'elle atterrisse dans la bonne case.",
      ],
      {
        fontSize: css("--pachinko-description-size"),
        fontFamily: font,
        color: css("--pachinko-text"),
        wordWrap: { width: width * 0.86 },
        align: "left",
        lineSpacing: 14,
      },
    )
    .setOrigin(0, 0);

  buildButton(scene, width / 2, height * 0.855, "► COMMENCER ◄", onStart);

  scene.add
    .text(width / 2, height * 0.955, "ESC — RETOUR AU MENU", {
      fontSize: css("--pachinko-hint-size"),
      fontFamily: font,
      color: "#ffffff",
    })
    .setOrigin(0.5);
}

/**
 * Affiche la modale des règles par-dessus l'intro.
 *
 * ESC ou le bouton "Jouer" lancent la partie.
 *
 * @param scene    - Scène Phaser cible.
 * @param escKey   - Référence à la touche ESC (détournée le temps de la modale).
 * @param onPlay   - Appelé quand le joueur clique sur "Jouer".
 * @param resetEsc - Restaure le comportement ESC par défaut après fermeture.
 */
export function buildRulesOverlay(
  scene: Phaser.Scene,
  escKey: Phaser.Input.Keyboard.Key | undefined,
  onPlay: () => void,
  resetEsc: () => void,
): void {
  const { width, height } = scene.scale;
  const font = css("--font-pixel");

  const overlay: Phaser.GameObjects.GameObject[] = [];
  const close = () => {
    overlay.forEach((o) => o.destroy());
    resetEsc();
  };

  escKey?.removeAllListeners();
  escKey?.on("down", close);

  overlay.push(
    scene.add
      .rectangle(width / 2, height / 2, width, height, 0x000000, 0.78)
      .setInteractive(),
  );

  const panelW = 600;
  const panelH = 360;
  const panelCx = width / 2;
  const panelCy = height / 2;

  overlay.push(
    scene.add
      .rectangle(panelCx, panelCy, panelW, panelH, cssHex("--pachinko-panel-bg"))
      .setStrokeStyle(2, cssHex("--pachinko-score-color")),
  );

  overlay.push(
    scene.add
      .text(panelCx, panelCy - panelH / 2 + 42, "RÈGLES DU JEU", {
        fontSize: css("--pachinko-modal-title-size"),
        fontFamily: font,
        color: css("--pachinko-score-color"),
      })
      .setOrigin(0.5),
  );

  overlay.push(
    scene.add
      .text(
        panelCx,
        panelCy - panelH / 2 + 92,
        [
          "Un plateau de clous vous attend, avec 5 cases tout en bas.",
          "",
          "Cliquez n'importe où sur le plateau pour lâcher la bille à cet endroit.",
          "",
          "Elle rebondit sur les clous jusqu'à tomber dans une case.",
          "",
          "Atterrissez dans une case UNITY pour gagner. Une autre case ? Pas grave, relancez une bille !",
        ],
        {
          fontSize: css("--pachinko-modal-text-size"),
          fontFamily: font,
          color: css("--pachinko-text"),
          align: "center",
          wordWrap: { width: panelW - 80 },
          lineSpacing: 10,
        },
      )
      .setOrigin(0.5, 0),
  );

  const btnCont = scene.add.container(panelCx, panelCy + panelH / 2 - 45);
  const btnBg = scene.add
    .rectangle(0, 0, 170, 40, cssHex("--pachinko-score-color"))
    .setStrokeStyle(2, cssHex("--pachinko-score-color"));
  const btnTxt = scene.add
    .text(0, 0, "JOUER ►", {
      fontSize: css("--pachinko-modal-button-size"),
      fontFamily: font,
      color: "#000000",
    })
    .setOrigin(0.5);
  btnCont.add([btnBg, btnTxt]);
  btnCont.setInteractive(
    new Phaser.Geom.Rectangle(-85, -20, 170, 40),
    Phaser.Geom.Rectangle.Contains,
  );
  btnCont.on("pointerover", () => {
    scene.tweens.add({
      targets: btnCont,
      scaleX: 1.07,
      scaleY: 1.07,
      duration: 80,
    });
  });
  btnCont.on("pointerout", () => {
    scene.tweens.add({ targets: btnCont, scaleX: 1, scaleY: 1, duration: 80 });
  });
  btnCont.on("pointerdown", () => onPlay());
  overlay.push(btnCont);

  overlay.push(
    scene.add
      .text(panelCx, panelCy + panelH / 2 + 18, "ESC pour annuler", {
        fontSize: css("--pachinko-modal-cancel-size"),
        fontFamily: font,
        color: "#ffffff",
      })
      .setOrigin(0.5),
  );
}
