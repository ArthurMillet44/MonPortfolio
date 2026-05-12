/**
 * Composant bouton réutilisable dans les trois états du niveau Manitou
 * (intro, résultat, modale des règles).
 */

import Phaser from "phaser";
import { css, cssHex } from "@/utils/cssVars";

/**
 * Crée un bouton interactif avec hover et clic.
 *
 * @param scene    - Scène Phaser dans laquelle le bouton est créé.
 * @param x        - Centre horizontal.
 * @param y        - Centre vertical.
 * @param label    - Texte affiché sur le bouton.
 * @param callback - Fonction appelée au clic.
 * @param color    - Couleur de fond en hex (défaut : --manitou-score-color).
 */
export function buildButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  callback: () => void,
  color?: number,
): void {
  const W = 155;
  const H = 38;
  const font = css("--font-pixel");
  const accent = color ?? cssHex("--manitou-score-color");

  const container = scene.add.container(x, y);
  const bg = scene.add.rectangle(0, 0, W, H, accent).setStrokeStyle(2, accent);
  const text = scene.add
    .text(0, 0, label, { fontSize: "12px", fontFamily: font, color: "#000000" })
    .setOrigin(0.5);

  container.add([bg, text]);
  container.setInteractive(
    new Phaser.Geom.Rectangle(-W / 2, -H / 2, W, H),
    Phaser.Geom.Rectangle.Contains,
  );
  // Effet de survol : le bouton grandit légèrement et la bordure devient blanche
  container.on("pointerover", () => {
    scene.tweens.add({
      targets: container,
      scaleX: 1.06,
      scaleY: 1.06,
      duration: 80,
    });
  });
  // Effet de sortie : retour à l'état normal
  container.on("pointerout", () => {
    bg.setStrokeStyle(2, accent);
    scene.tweens.add({
      targets: container,
      scaleX: 1,
      scaleY: 1,
      duration: 80,
    });
  });
  // Clic : exécute la fonction de rappel fournie
  container.on("pointerdown", callback);
}
