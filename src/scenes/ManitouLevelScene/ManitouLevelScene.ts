/**
 * Gère uniquement la machine d'états (intro → game → result) et les transitions.
 * Chaque état est délégué à son module dédié :
 *   - ManitouIntro   : écran d'introduction et modale des règles
 *   - ManitouGame    : logique de jeu (spawn, timer, drag & drop)
 *   - ManitouResult  : écran de résultat
 */

import Phaser from "phaser";
import { BaseScene } from "@/scenes/Common/BaseScene";
import { TechId } from "./ManitouConfig";
import { buildIntro, buildRulesOverlay } from "./ManitouIntro";
import { ManitouGame } from "./ManitouGame";
import { buildResult } from "./ManitouResult";
import "./ManitouLevelScene.css";

type GameState = "intro" | "game" | "result";

export class ManitouLevelScene extends BaseScene {
  private state: GameState = "intro";
  private caught: TechId[] = [];
  private escKey?: Phaser.Input.Keyboard.Key;
  private minigame?: ManitouGame;

  constructor() {
    super({ key: "ManitouLevelScene" });
  }

  protected buildScene(): void {
    this.escKey = this.input.keyboard?.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC,
    );
    this.resetEsc();
    this.showState();
  }

  /**
   * (Ré)assigne ESC à son comportement par défaut : quitter vers la sélection de chapitres.
   * Appelé après chaque transition et après fermeture de la modale des règles.
   */
  private resetEsc(): void {
    this.escKey?.removeAllListeners();
    this.escKey?.on("down", () => this.launchLevel("LevelSelectScene"));
  }

  /** Reconstruit le fond et l'état courant. Appelé à l'init et après chaque transition. */
  private showState(): void {
    const { width, height } = this.scale;
    this.buildBackground(width, height);

    if (this.state === "intro") {
      buildIntro(this, () =>
        buildRulesOverlay(
          this,
          this.escKey,
          () => this.transition("game"),
          () => this.resetEsc(),
        ),
      );
    } else if (this.state === "game") {
      this.minigame = new ManitouGame(this, (caught) => {
        this.caught = caught;
        this.transition("result");
      });
      this.minigame.start();
    } else {
      buildResult(
        this,
        this.caught,
        () => this.transition("game"),
        () => this.launchLevel("LevelSelectScene"),
      );
    }
  }

  /**
   * Effectue une transition vers un nouvel état.
   *
   * Séquence : fondu noir → nettoyage complet (tweens, enfants, input drag)
   * → reconstruction du fond et du nouvel état → fondu entrant.
   * Le fond est re-créé car tweens.killAll() supprime aussi les tweens des nuages.
   */
  private transition(to: GameState): void {
    this.minigame?.stop();
    this.minigame = undefined;

    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.input.off("drag");
      this.input.off("dragstart");
      this.input.off("dragend");
      this.tweens.killAll();
      this.children.removeAll(true);

      this.state = to;
      this.resetEsc();
      this.showState();

      this.cameras.main.fadeIn(300, 0, 0, 0);
    });
  }
}
