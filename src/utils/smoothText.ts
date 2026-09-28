/**
 * smoothText — empêche les textes Phaser de paraître pixélisés/crénelés.
 *
 * Il y a en fait DEUX effets qui pixélisent le texte dans ce projet :
 *
 * 1. Le mode "pixel art" (voir game.config.ts) fait dessiner toutes les
 *    textures — y compris celles des textes — sans lissage (filtrage
 *    "NEAREST"). On corrige ça en forçant un filtrage "LINEAR" sur les
 *    textures de texte uniquement (les sprites du jeu gardent leur rendu
 *    pixel art intact).
 *
 * 2. Le jeu est dessiné en interne sur un canvas de taille fixe (800x600,
 *    voir game.config.ts), puis ce canvas est agrandi par le NAVIGATEUR
 *    pour remplir la fenêtre (Phaser.Scale.FIT ne redimensionne jamais le
 *    canvas lui-même, il l'étire en CSS). `image-rendering: pixelated`
 *    dans global.css force cet agrandissement à se faire sans lissage,
 *    pour que les sprites restent nets. Mais ça re-pixélise TOUT ce qui
 *    est sur le canvas au passage, texte compris. Un gros titre contient
 *    déjà beaucoup de pixels par lettre, donc ça se voit à peine ; un
 *    petit texte n'en a que quelques-uns et devient visiblement "en
 *    escalier". Le point 1 seul ne suffit donc pas.
 *
 *    On compense en dessinant chaque texte à une résolution interne plus
 *    élevée que celle du canvas de base : une fois réduit à sa taille
 *    logique (avec le filtrage LINEAR du point 1), il contient assez de
 *    détail pour rester lisible même après l'agrandissement "pixelated"
 *    du navigateur. La résolution nécessaire dépend du facteur
 *    d'agrandissement réel (fenêtre/écran de l'utilisateur), donc on la
 *    calcule à chaque texte créé plutôt que de deviner une valeur fixe.
 *
 * On patch directement la factory `scene.add.text(...)` : tous les textes,
 * présents et futurs, en bénéficient automatiquement, sans avoir à modifier
 * chaque appel `.text()` du code.
 *
 * Ce fichier ne fait rien tant qu'il n'est pas importé : il doit être importé
 * une seule fois, pour son effet de bord, avant que le jeu ne démarre
 * (voir main.ts).
 */
import Phaser from "phaser";

const MIN_RESOLUTION = 2;
const MAX_RESOLUTION = 6;

/**
 * Calcule la résolution de rendu à donner à un texte pour qu'il reste net
 * une fois le canvas du jeu agrandi par le navigateur.
 */
function computeTextResolution(scene: Phaser.Scene): number {
  const scale = scene.sys.game.scale;

  // displayScale = tailleDeBase / tailleAffichée (une fraction < 1 quand le
  // canvas est étiré pour remplir une fenêtre plus grande que 800x600).
  // Son inverse est donc le facteur d'agrandissement réel appliqué par le navigateur.
  const domUpscale =
    scale.displayScale.x > 0 ? 1 / scale.displayScale.x : 1;

  // Les écrans HiDPI (Retina, etc.) agrandissent encore une fois en plus.
  const dpr = window.devicePixelRatio || 1;

  const resolution = Math.ceil(domUpscale * dpr);

  return Phaser.Math.Clamp(resolution, MIN_RESOLUTION, MAX_RESOLUTION);
}

const originalText = Phaser.GameObjects.GameObjectFactory.prototype.text;

Phaser.GameObjects.GameObjectFactory.prototype.text = function (
  x: number,
  y: number,
  text: string | string[],
  style?: Phaser.Types.GameObjects.Text.TextStyle,
) {
  const textObject = originalText.call(this, x, y, text, {
    resolution: computeTextResolution(this.scene),
    ...style,
  });
  textObject.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
  return textObject;
};
