/**
 * Classe de base pour toutes les scènes du jeu
 *
 * Contient la logique commune à chaque scène :
 * fondu d'entrée, génération des textures, fond animé, transition vers une autre scène.
 *
 * Méthodes concrètes (partagées par toutes les scènes) :
 *   - create()           → fondu d'entrée + textures + appel à buildScene()
 *   - buildBackground()  → fond de ciel + nuages animés
 *   - launchLevel()      → fondu de sortie + changement de scène
 *
 * Méthodes abstraites (à définir dans chaque sous-classe) :
 *   - buildScene()       → construction de l'interface spécifique à chaque scène
 *
 */

import Phaser from "phaser";
import { KEYS } from "@/utils/assetKeys";
import { generateTextures } from "@/utils/textures";

export abstract class BaseScene extends Phaser.Scene {
  /** Charge les spritesheets des personnages (Soldier et Orc avec ombres). */
  preload(): void {
    this.load.spritesheet(KEYS.SOLDIER_IDLE, "assets/sprites/Soldier-Idle.png", {
      frameWidth: 100,
      frameHeight: 100,
    });
    this.load.spritesheet(KEYS.SOLDIER_WALK, "assets/sprites/Soldier-Walk.png", {
      frameWidth: 100,
      frameHeight: 100,
    });
    this.load.spritesheet(KEYS.ORC_IDLE, "assets/sprites/Orc-Idle.png", {
      frameWidth: 100,
      frameHeight: 100,
    });
    this.load.spritesheet(KEYS.ORC_WALK, "assets/sprites/Orc-Walk.png", {
      frameWidth: 100,
      frameHeight: 100,
    });
  }

  /**
   * Appelé une seule fois au chargement de la scène.
   * Fondu d'entrée, vérification du cache des textures, puis construction de l'écran.
   */
  create(): void {
    this.cameras.main.fadeIn(400, 0, 0, 0);
    generateTextures(this);
    this.buildScene();
  }

  /**
   * Construit l'interface de la scène.
   * Chaque sous-classe implémente cette méthode pour placer ses propres éléments.
   */
  protected abstract buildScene(): void;

  /**
   * Ajoute le fond de ciel et les deux nuages animés.
   * Commun à toutes les scènes du jeu.
   *
   * @param width  - Largeur de la scène en pixels
   * @param height - Hauteur de la scène en pixels
   */
  protected buildBackground(width: number, height: number): void {
    this.add
      .image(width / 2, height / 2, KEYS.BG_SKY)
      .setDisplaySize(width, height);

    const cloud1 = this.add.image(200, 80, KEYS.BG_CLOUDS).setAlpha(0.6);
    const cloud2 = this.add
      .image(600, 120, KEYS.BG_CLOUDS)
      .setAlpha(0.4)
      .setFlipX(true);

    this.tweens.add({
      targets: cloud1,
      x: width + 200,
      duration: 20000,
      repeat: -1,
    });
    this.tweens.add({ targets: cloud2, x: -200, duration: 25000, repeat: -1 });
  }

  /**
   * Lance une transition vers une autre scène.
   * L'écran s'assombrit progressivement avant de changer.
   *
   * @param sceneKey - La clé de la scène cible
   */
  protected launchLevel(sceneKey: string): void {
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.scene.start(sceneKey);
    });
  }
}
