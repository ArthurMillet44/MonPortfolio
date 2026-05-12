/**
 * ManitouVideoPanel.ts
 *
 * Overlay vidéo DOM injecté par-dessus le canvas Phaser.
 * Cliquer en dehors de la vidéo ferme l'overlay.
 */

import Phaser from "phaser";
import videoUrl from "@/assets/videos/video1.mp4";

/**
 * Crée un overlay HTML avec un lecteur vidéo natif.
 * Cliquer sur le fond sombre ferme l'overlay et revient à l'écran de résultat.
 *
 * @param resetEsc - Restaure le comportement par défaut d'ESC sur l'écran de résultat.
 */
export function buildVideoOverlay(
  _scene: Phaser.Scene,
  _escKey: Phaser.Input.Keyboard.Key | undefined,
  resetEsc: () => void,
): void {
  const container = document.createElement("div");
  container.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.92);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    cursor: pointer;
  `;

  const video = document.createElement("video");
  video.src = videoUrl;
  video.controls = true;
  video.autoplay = true;
  video.style.cssText = `
    max-width: 90%;
    max-height: 85vh;
    outline: 2px solid #f1c40f;
    cursor: default;
  `;

  const close = () => {
    video.pause();
    container.remove();
    resetEsc();
  };

  // Clic sur le fond (pas sur la vidéo) ferme l'overlay.
  container.addEventListener("click", (e) => {
    if (e.target === container) close();
  });

  container.appendChild(video);
  document.body.appendChild(container);
}
