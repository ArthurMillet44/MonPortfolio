/**
 * textures.ts — Générateur de textures partagées entre toutes les scènes
 *
 * Phaser charge normalement des images depuis des fichiers PNG.
 * Ici, on les dessine directement en code avec l'API Graphics de Phaser,
 * ce qui évite d'avoir des fichiers d'assets externes pour l'instant.
 *
 * Chaque texture est créée une seule fois puis mise en cache par Phaser :
 * elle reste disponible dans toutes les scènes jusqu'à la fin de la session.
 * Les gardes "textures.exists" empêchent de la régénérer inutilement
 * si une scène précédente l'a déjà créée.
 */

import Phaser from "phaser";
import { KEYS } from "./assetKeys";

/**
 * Point d'entrée : génère toutes les textures du jeu si elles ne sont pas déjà en cache.
 * À appeler au début de create() dans chaque scène.
 *
 * @param scene - La scène Phaser courante (nécessaire pour dessiner et accéder au cache)
 */
export function generateTextures(scene: Phaser.Scene): void {
  if (!scene.textures.exists(KEYS.BG_SKY)) generateSky(scene);
  if (!scene.textures.exists(KEYS.BG_CLOUDS)) generateClouds(scene);
}

/**
 * Dessine le fond de ciel en dégradé de bleus.
 * Le ciel est divisé en 4 bandes horizontales, du bleu foncé en haut
 * au bleu très sombre en bas (effet nuit/crépuscule).
 */
function generateSky(scene: Phaser.Scene): void {
  const W = 800;
  const H = 600;

  const g = scene.make.graphics();

  // Bande du haut : bleu nuit profond
  g.fillStyle(0x1a237e);
  g.fillRect(0, 0, W, H * 0.3);

  // Bande 2 : bleu légèrement plus clair
  g.fillStyle(0x283593);
  g.fillRect(0, H * 0.3, W, H * 0.2);

  // Bande 3 : encore un peu plus clair
  g.fillStyle(0x303f9f);
  g.fillRect(0, H * 0.5, W, H * 0.3);

  // Bande du bas : presque noir (sol à venir)
  g.fillStyle(0x1b1b2f);
  g.fillRect(0, H * 0.8, W, H * 0.2);

  // On convertit le dessin en texture réutilisable
  g.generateTexture(KEYS.BG_SKY, W, H);
  g.destroy(); // on libère la mémoire du graphics
}

/**
 * Dessine une texture de nuage pixel art.
 * Un seul sprite est créé, puis utilisé deux fois dans la scène
 * (un normal, un retourné horizontalement).
 */
function generateClouds(scene: Phaser.Scene): void {
  const g = scene.make.graphics();

  // Couleur bleu-violet semi-transparente pour un effet nuageux
  g.fillStyle(0x3949ab, 0.7);

  // Plusieurs rectangles superposés forment la forme du nuage
  g.fillRect(10, 20, 60, 20); // corps principal gauche
  g.fillRect(0, 30, 80, 20); // base large
  g.fillRect(20, 10, 40, 20); // bosse du haut
  g.fillRect(90, 25, 50, 18); // deuxième nuage à droite
  g.fillRect(85, 33, 60, 18); // base du deuxième nuage
  g.fillRect(100, 15, 30, 20); // bosse du deuxième nuage

  g.generateTexture(KEYS.BG_CLOUDS, 200, 60);
  g.destroy();
}

