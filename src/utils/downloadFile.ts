/**
 * downloadFile — déclenche le téléchargement d'un fichier (ex : un PDF importé via Vite).
 *
 * Contrairement à `window.open(url)`, qui laisse le navigateur choisir
 * d'afficher le fichier ou de le télécharger, ce helper force toujours
 * le téléchargement, via un lien <a download> temporaire.
 *
 * @param url      - URL du fichier (ex : import Vite d'un asset).
 * @param filename - Nom du fichier proposé au téléchargement.
 */
export function downloadFile(url: string, filename: string): void {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}
