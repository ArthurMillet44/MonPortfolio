/**
 * textures.ts
 *
 * Génère toutes les images (textures) utilisées par le menu principal.
 *
 * Phaser charge normalement des images depuis des fichiers PNG.
 * Ici, on les dessine directement en code avec l'API Graphics de Phaser,
 * ce qui évite d'avoir des fichiers d'assets externes pour l'instant.
 *
 * Chaque texture est créée une fois, mise en cache par Phaser,
 * puis utilisée autant de fois qu'on veut via son nom (ex: KEYS.BG_SKY).
 */

import Phaser from "phaser";
import { KEYS } from "@/utils/assetKeys";

/**
 * Point d'entrée : génère toutes les textures du menu en une seule fois.
 * À appeler au début de create() dans MainMenuScene.
 *
 * @param scene - La scène Phaser courante (nécessaire pour dessiner)
 */
export function generateTextures(scene: Phaser.Scene): void {
  generateSky(scene);
  generateClouds(scene);
  generatePlayer(scene);
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

/**
 * Dessine le spritesheet du personnage (4 frames côte à côte) :
 *   - Frame 0 : idle (immobile)
 *   - Frame 1 : walk_1 (pas gauche)
 *   - Frame 2 : walk_2 (pas droite)
 *   - Frame 3 : jump (saut)
 *
 * Un spritesheet c'est une seule image qui contient plusieurs frames d'animation.
 * Phaser découpe ensuite cette image en frames individuels.
 */
function generatePlayer(scene: Phaser.Scene): void {
  const PW = 16; // largeur d'un frame
  const PH = 24; // hauteur d'un frame

  const g = scene.make.graphics();

  for (let i = 0; i < 4; i++) {
    const ox = i * PW; // décalage horizontal pour ce frame

    // Corps (bleu)
    g.fillStyle(0x1565c0);
    g.fillRect(ox + 4, 8, 8, 10);

    // Tête (peau)
    g.fillStyle(0xffcc80);
    g.fillRect(ox + 4, 0, 8, 8);

    // Yeux (deux petits carrés sombres)
    g.fillStyle(0x1a1a2e);
    g.fillRect(ox + 5, 2, 2, 2); // oeil gauche
    g.fillRect(ox + 9, 2, 2, 2); // oeil droit

    // Jambes (bleu foncé) — légèrement différentes selon le frame pour simuler la marche
    g.fillStyle(0x0d47a1);
    if (i === 0) {
      // Idle : jambes droites
      g.fillRect(ox + 4, 18, 3, 6);
      g.fillRect(ox + 9, 18, 3, 6);
    } else if (i === 1) {
      // Walk 1 : jambe gauche en avant
      g.fillRect(ox + 3, 18, 3, 6);
      g.fillRect(ox + 10, 18, 3, 5);
    } else if (i === 2) {
      // Walk 2 : position symétrique à idle
      g.fillRect(ox + 4, 18, 3, 6);
      g.fillRect(ox + 9, 18, 3, 6);
    } else {
      // Jump : jambes relevées + bras levés
      g.fillRect(ox + 3, 18, 3, 5);
      g.fillRect(ox + 10, 18, 3, 5);
      g.fillStyle(0x1565c0);
      g.fillRect(ox + 1, 8, 3, 8); // bras gauche levé
      g.fillRect(ox + 12, 8, 3, 8); // bras droit levé
    }
  }

  // Génère la texture complète (les 4 frames dans une seule image)
  g.generateTexture(KEYS.PLAYER, PW * 4, PH);
  g.destroy();

  // On déclare le frame "idle" pour pouvoir l'utiliser par son nom dans la scène
  scene.textures.get(KEYS.PLAYER).add("idle", 0, 0, 0, PW, PH);
}
