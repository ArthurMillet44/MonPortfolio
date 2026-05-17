/**
 * Bouton du niveau Pikomino, wrapper de LevelUI avec la couleur accent Pikomino par défaut.
 */

import Phaser from "phaser";
import { cssHex } from "@/utils/cssVars";
import { buildButton as _buildButton } from "@/scenes/Common/LevelUI";

export function buildButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  callback: () => void,
  color?: number,
): void {
  _buildButton(scene, x, y, label, callback, color ?? cssHex("--piko-score-color"));
}
