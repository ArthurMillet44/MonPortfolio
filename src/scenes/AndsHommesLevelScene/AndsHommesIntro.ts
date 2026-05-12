/**
 * Construit l'écran d'introduction du niveau And's Hommes :
 * présentation du projet e-commerce et modale des règles du memory.
 */

import Phaser from "phaser";
import { css, cssHex } from "@/utils/cssVars";
import { PAIRS, TIMER_SECONDS } from "./AndsHommesConfig";
import { buildButton } from "./AndsHommesUI";

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
    .text(
      width / 2,
      height * 0.07,
      "PROJET UNIVERSITAIRE  -  BUT Informatique  -  Équipe de 3",
      { fontSize: "14px", fontFamily: font, color: "#ffffff" },
    )
    .setOrigin(0.5);

  // Titre principal
  scene.add
    .text(width / 2, height * 0.17, "AND'S HOMMES", {
      fontSize: "40px",
      fontFamily: font,
      color: css("--ah-score-color"),
      stroke: "#000000",
      strokeThickness: 4,
    })
    .setOrigin(0.5);

  // Séparateur
  scene.add
    .graphics()
    .lineStyle(1, cssHex("--ah-divider"))
    .lineBetween(width * 0.15, height * 0.33, width * 0.85, height * 0.33);

  scene.add
    .text(width * 0.12, height * 0.37, "MISSION", {
      fontSize: "18px",
      fontFamily: font,
      color: css("--ah-score-color"),
    })
    .setOrigin(0, 0.5);

  // Description du projet
  scene.add
    .text(
      width * 0.12,
      height * 0.42,
      [
        "And's Hommes est un site e-commerce de cosmétiques pour hommes, conçu et réalisé de A à Z en équipe de 3 lors du projet de fin de premier semestre.",
        "",
        "Objectif : tester notre créativité et valider nos compétences front/back-end, sans consignes précises avec pour seules contraintes Symfony et une base SQL.",
      ],
      {
        fontSize: "16px",
        fontFamily: "'SpeedDemon', monospace",
        color: css("--ah-text"),
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

  const panelW = 620;
  const panelH = 430;
  const panelCx = width / 2;
  const panelCy = height / 2;

  overlay.push(
    scene.add
      .rectangle(panelCx, panelCy, panelW, panelH, cssHex("--ah-panel-bg"))
      .setStrokeStyle(2, cssHex("--ah-score-color")),
  );

  // Titre de la modale
  overlay.push(
    scene.add
      .text(panelCx, panelCy - panelH / 2 + 40, "RÈGLES DU JEU", {
        fontSize: "20px",
        fontFamily: font,
        color: css("--ah-score-color"),
      })
      .setOrigin(0.5),
  );

  // Règles (compact, 5 lignes sans lignes vides pour éviter le chevauchement)
  overlay.push(
    scene.add
      .text(
        panelCx,
        panelCy - panelH / 2 + 82,
        [
          `${PAIRS.length * 2} cartes sont disposées face cachée.`,
          "Clique sur deux cartes pour les retourner.",
          "Si elles forment une paire, elles restent visibles.",
          `Retrouve les ${PAIRS.length} paires avant la fin du chrono !`,
          `Tu as ${TIMER_SECONDS} secondes. Bonne chance !`,
        ],
        {
          fontSize: "14px",
          fontFamily: font,
          color: css("--ah-text"),
          align: "center",
          wordWrap: { width: panelW - 80 },
          lineSpacing: 12,
        },
      )
      .setOrigin(0.5, 0),
  );

  // ── Exemple de paire ──────────────────────────────────────────
  // Positionné clairement sous les règles (≈ 5 lignes × 25px = 125px + marge)
  const exLabelY = panelCy - panelH / 2 + 245;
  const exChipsY = exLabelY + 28;

  overlay.push(
    scene.add
      .text(panelCx, exLabelY, "EXEMPLE DE PAIRE :", {
        fontSize: "11px",
        fontFamily: font,
        color: css("--ah-text-dim"),
      })
      .setOrigin(0.5),
  );

  const exPair = PAIRS[0]; // Symfony ↔ Framework PHP MVC
  const chipW = 130;
  const chipH = 34;

  // Carte A (gauche)
  overlay.push(
    scene.add.rectangle(
      panelCx - 92,
      exChipsY,
      chipW,
      chipH,
      exPair.color,
      0.85,
    ),
  );
  overlay.push(
    scene.add
      .text(panelCx - 92, exChipsY, exPair.termA, {
        fontSize: "12px",
        fontFamily: font,
        color: "#ffffff",
      })
      .setOrigin(0.5),
  );

  // Flèche
  overlay.push(
    scene.add
      .text(panelCx, exChipsY, "↔", {
        fontSize: "18px",
        fontFamily: font,
        color: "#ffffff",
      })
      .setOrigin(0.5),
  );

  // Carte B (droite)
  overlay.push(
    scene.add.rectangle(
      panelCx + 92,
      exChipsY,
      chipW,
      chipH,
      exPair.color,
      0.85,
    ),
  );
  overlay.push(
    scene.add
      .text(panelCx + 92, exChipsY, exPair.termB.replace("\n", " "), {
        fontSize: "12px",
        fontFamily: font,
        color: "#ffffff",
      })
      .setOrigin(0.5),
  );

  // ── Bouton Jouer ───────────────────────────────────────────────
  const btnCont = scene.add.container(panelCx, panelCy + panelH / 2 - 55);
  const btnBg = scene.add
    .rectangle(0, 0, 170, 40, cssHex("--ah-score-color"))
    .setStrokeStyle(2, cssHex("--ah-score-color"));
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
