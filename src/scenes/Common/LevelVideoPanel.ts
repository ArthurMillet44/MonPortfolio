/**
 * Overlay vidéo DOM partagé entre tous les niveaux du portfolio.
 * Injecté par-dessus le canvas Phaser. Cliquer en dehors ferme l'overlay.
 */

/**
 * Crée un overlay HTML avec un lecteur vidéo natif.
 *
 * @param videoUrl    - URL de la vidéo à lire (import Vite d'un asset).
 * @param accentColor - Couleur CSS de la bordure de la vidéo (ex : "#f1c40f").
 * @param resetEsc    - Restaure le comportement par défaut d'ESC après fermeture.
 */
export function buildVideoOverlay(
  videoUrl: string,
  accentColor: string,
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
    outline: 2px solid ${accentColor};
    cursor: default;
  `;

  const close = () => {
    video.pause();
    container.remove();
    resetEsc();
  };

  container.addEventListener("click", (e) => {
    if (e.target === container) close();
  });

  container.appendChild(video);
  document.body.appendChild(container);
}
