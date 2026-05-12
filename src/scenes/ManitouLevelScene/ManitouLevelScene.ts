/**
 * Niveau Manitou, délègue intro/game/result à ses modules dédiés.
 * La machine d'états, ESC et les transitions sont gérés par BaseLevelScene.
 */

import { BaseLevelScene, GameState } from "@/scenes/Common/BaseLevelScene";
import { TechId } from "./ManitouConfig";
import { buildIntro, buildRulesOverlay } from "./ManitouIntro";
import { ManitouGame } from "./ManitouGame";
import { buildResult } from "./ManitouResult";
import { buildVideoOverlay } from "./ManitouVideoPanel";
import "./ManitouLevelScene.css";

export class ManitouLevelScene extends BaseLevelScene {
  protected readonly menuSceneKey = "LevelSelectScene";
  private caught: TechId[] = [];

  constructor() {
    super({ key: "ManitouLevelScene" });
  }

  protected renderState(state: GameState): void {
    if (state === "intro") {
      buildIntro(this, () =>
        buildRulesOverlay(
          this,
          this.escKey,
          () => this.transition("game"),
          () => this.resetEsc(),
        ),
      );
    } else if (state === "game") {
      const game = new ManitouGame(this, (caught) => {
        this.caught = caught;
        this.transition("result");
      });
      this.minigame = game;
      game.start();
    } else {
      buildResult(
        this,
        this.caught,
        () => this.transition("game"),
        () => this.launchLevel("LevelSelectScene"),
        () => buildVideoOverlay(() => this.resetEsc()),
      );
    }
  }

  /** Nettoie les listeners drag & drop propres au mini-jeu Manitou. */
  protected onTransitionCleanup(): void {
    this.input.off("drag");
    this.input.off("dragstart");
    this.input.off("dragend");
  }
}
