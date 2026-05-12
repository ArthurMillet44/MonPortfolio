/**
 * Classe de base pour les scènes de jeu à trois états (intro → game → result).
 *
 * Fournit la machine d'états, la gestion d'ESC et la transition animée.
 * Chaque niveau concret n'implémente que :
 *   - menuSceneKey   : scène vers laquelle ESC renvoie
 *   - renderState()  : contenu visuel de chaque état
 *   - onTransitionCleanup() (optionnel) : nettoyage spécifique avant transition
 */

import Phaser from "phaser";
import { BaseScene } from "./BaseScene";

export type GameState = "intro" | "game" | "result";

export abstract class BaseLevelScene extends BaseScene {
  protected state: GameState = "intro";
  protected escKey?: Phaser.Input.Keyboard.Key;
  /** Référence au mini-jeu actif, typé structurellement pour partager stop(). */
  protected minigame?: { stop(): void };

  /** Clé de la scène parente vers laquelle ESC renvoie (ex : "ProjectsScene"). */
  protected abstract readonly menuSceneKey: string;

  /**
   * Construit le contenu visuel de l'état courant.
   * Appelé par showState() à chaque entrée dans un état.
   */
  protected abstract renderState(state: GameState): void;

  /** Hook optionnel, surcharger pour nettoyer des listeners spécifiques (ex : drag). */
  protected onTransitionCleanup(): void {}

  protected buildScene(): void {
    this.escKey = this.input.keyboard?.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC,
    );
    this.resetEsc();
    this.showState();
  }

  /** (Ré)assigne ESC pour quitter vers la scène parente. */
  protected resetEsc(): void {
    this.escKey?.removeAllListeners();
    this.escKey?.on("down", () => this.launchLevel(this.menuSceneKey));
  }

  /** Reconstruit le fond et délègue le rendu à renderState(). */
  private showState(): void {
    const { width, height } = this.scale;
    this.buildBackground(width, height);
    this.renderState(this.state);
  }

  /**
   * Transition animée vers un nouvel état.
   * Séquence : fadeOut → cleanup → renderState → fadeIn.
   */
  protected transition(to: GameState): void {
    this.minigame?.stop();
    this.minigame = undefined;

    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.onTransitionCleanup();
      this.tweens.killAll();
      this.children.removeAll(true);

      this.state = to;
      this.resetEsc();
      this.showState();

      this.cameras.main.fadeIn(300, 0, 0, 0);
    });
  }
}
