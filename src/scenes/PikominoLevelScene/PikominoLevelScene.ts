/**
 * Niveau Pikomino, délègue intro/game/result à ses modules dédiés.
 * La machine d'états, ESC et les transitions sont gérés par BaseLevelScene.
 */

import { BaseLevelScene, GameState } from "@/scenes/Common/BaseLevelScene";
import { buildIntro, buildRulesOverlay } from "./PikominoIntro";
import { PikominoGame, CollectedIds } from "./PikominoGame";
import { buildResult } from "./PikominoResult";
import { buildVideoOverlay } from "./PikominoVideoPanel";
import "./PikominoLevelScene.css";

const GITHUB_URL = "https://github.com/ArthurMillet44/Pikomino/tree/main/pikomino";

export class PikominoLevelScene extends BaseLevelScene {
  protected readonly menuSceneKey = "ProjectsScene";
  private collectedIds: CollectedIds = [];

  constructor() {
    super({ key: "PikominoLevelScene" });
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
      const game = new PikominoGame(this, (collected) => {
        this.collectedIds = collected;
        this.transition("result");
      });
      this.minigame = game;
      game.start();
    } else {
      buildResult(
        this,
        this.collectedIds,
        () => this.transition("game"),
        () => buildVideoOverlay(() => this.resetEsc()),
        () => window.open(GITHUB_URL, "_blank"),
        () => this.launchLevel("ProjectsScene"),
      );
    }
  }
}
