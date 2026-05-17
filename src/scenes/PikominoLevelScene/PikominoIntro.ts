/**
 * Construit l'écran d'introduction du niveau Pikomino :
 * présentation du projet et modale des règles du snake.
 */

import Phaser from "phaser";
import { css, cssHex } from "@/utils/cssVars";
import { TECHS, TIMER_SECONDS } from "./PikominoConfig";
import { buildButton } from "./PikominoUI";

export function buildIntro(scene: Phaser.Scene, onStart: () => void): void {
  const { width, height } = scene.scale;
  const font = css("--font-pixel");

  scene.add
    .text(
      width / 2,
      height * 0.07,
      "PROJET UNIVERSITAIRE  -  IUT Informatique  -  Équipe de 4",
      { fontSize: "14px", fontFamily: font, color: "#ffffff" },
    )
    .setOrigin(0.5);

  scene.add
    .text(width / 2, height * 0.17, "PIKOMINO", {
      fontSize: "40px",
      fontFamily: font,
      color: css("--piko-accent"),
      stroke: "#000000",
      strokeThickness: 4,
    })
    .setOrigin(0.5);

  scene.add
    .graphics()
    .lineStyle(1, cssHex("--piko-divider"))
    .lineBetween(width * 0.15, height * 0.33, width * 0.85, height * 0.33);

  scene.add
    .text(width * 0.12, height * 0.37, "MISSION", {
      fontSize: "20px",
      fontFamily: font,
      color: css("--piko-accent"),
    })
    .setOrigin(0, 0.5);

  scene.add
    .text(
      width * 0.12,
      height * 0.42,
      [
        "Dans le cadre de l'IUT nous avons réalisé par groupe de 4, un jeu en Kotlin et JavaFX basé sur le jeu de société Pikomino.",
        "",
        "L'objectif était d'imaginer comment fonctionnerait le jeu s'il était adapté en tant que jeu en ligne.",
      ],
      {
        fontSize: "18px",
        fontFamily: "'SpeedDemon', monospace",
        color: css("--piko-text"),
        wordWrap: { width: width * 0.86 },
        align: "left",
        lineSpacing: 14,
      },
    )
    .setOrigin(0, 0);

  buildButton(scene, width / 2, height * 0.855, "► COMMENCER ◄", onStart);

  scene.add
    .text(width / 2, height * 0.955, "ESC — RETOUR AU MENU", {
      fontSize: "13px",
      fontFamily: font,
      color: "#ffffff",
    })
    .setOrigin(0.5);
}

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

  const panelW = 620;
  const panelH = 430;
  const panelCx = width / 2;
  const panelCy = height / 2;

  overlay.push(
    scene.add
      .rectangle(panelCx, panelCy, panelW, panelH, cssHex("--piko-panel-bg"))
      .setStrokeStyle(2, cssHex("--piko-score-color")),
  );

  overlay.push(
    scene.add
      .text(panelCx, panelCy - panelH / 2 + 40, "RÈGLES DU JEU", {
        fontSize: "20px",
        fontFamily: font,
        color: css("--piko-score-color"),
      })
      .setOrigin(0.5),
  );

  overlay.push(
    scene.add
      .text(
        panelCx,
        panelCy - panelH / 2 + 82,
        [
          "Dirige le serpent avec Z (haut) Q (gauche) S (bas) D (droite).",
          "",
          "Mange les technos colorées pour les collecter.",
          "Évite les murs et ta propre queue !",
          "",
          `Collecte les ${TECHS.length} technos en ${TIMER_SECONDS} secondes.`,
          "Bonne chance !",
        ],
        {
          fontSize: "18px",
          fontFamily: font,
          color: css("--piko-text"),
          align: "center",
          wordWrap: { width: panelW - 80 },
          lineSpacing: 12,
        },
      )
      .setOrigin(0.5, 0),
  );

  // Bouton Jouer
  const btnCont = scene.add.container(panelCx, panelCy + panelH / 2 - 55);
  const btnBg = scene.add
    .rectangle(0, 0, 170, 40, cssHex("--piko-score-color"))
    .setStrokeStyle(2, cssHex("--piko-score-color"));
  const btnTxt = scene.add
    .text(0, 0, "JOUER ►", {
      fontSize: "14px",
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
        fontSize: "11px",
        fontFamily: font,
        color: "#ffffff",
      })
      .setOrigin(0.5),
  );
}
