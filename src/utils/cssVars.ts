/**
 * Helpers pour lire les variables CSS depuis TypeScript
 *
 * Phaser gère son propre rendu sur un canvas et n'a pas accès au CSS directement.
 * Ces fonctions font le pont : elles lisent les variables définies dans les fichiers
 * .css et retournent des valeurs utilisables dans le code Phaser.
 */

/** Retourne la valeur d'une variable CSS sous forme de chaîne.
 * @param variable - Nom de la variable CSS (ex : "--projects-card-color")
 * @returns Valeur de la variable CSS (ex : "#ffffff")
 */
export function css(variable: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim();
}

/** Retourne la valeur d'une variable CSS sous forme de nombre.
 * @param variable - Nom de la variable CSS (ex : "--projects-title-stroke-width")
 * @returns Valeur de la variable CSS sous forme de nombre (ex : 3)
 */
export function cssNum(variable: string): number {
  return parseFloat(css(variable));
}

/**
 * Retourne la valeur d'une variable CSS hex sous forme d'entier Phaser.
 * @param variable - Nom de la variable CSS (ex : "--projects-card-accent")
 * @returns Valeur de la variable CSS hex sous forme d'entier Phaser (ex : 0x4ec9b0)
 */
export function cssHex(variable: string): number {
  return parseInt(css(variable).replace("#", ""), 16);
}
