/**
 * Niveau And's Hommes, délègue intro/game/result à ses modules dédiés.
 * La machine d'états, ESC et les transitions sont gérés par BaseLevelScene.
 */

import { BaseLevelScene, GameState } from "@/scenes/Common/BaseLevelScene";
import { buildIntro, buildRulesOverlay } from "./AndsHommesIntro";
import { AndsHommesGame, FoundIds } from "./AndsHommesGame";
import { buildResult } from "./AndsHommesResult";
import { buildVideoOverlay } from "./AndsHommesVideoPanel";
import "./AndsHommesLevelScene.css";

const GITHUB_URL = "https://github.com/ArthurMillet44/And-s-Hommes";

export class AndsHommesLevelScene extends BaseLevelScene {
  protected readonly menuSceneKey = "ProjectsScene";
  private foundIds: FoundIds = [];

  constructor() {
    super({ key: "AndsHommesLevelScene" });
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
      const game = new AndsHommesGame(this, (found) => {
        this.foundIds = found;
        this.transition("result");
      });
      this.minigame = game;
      game.start();
    } else {
      buildResult(
        this,
        this.foundIds,
        () => this.transition("game"),
        () => buildVideoOverlay(() => this.resetEsc()),
        () => window.open(GITHUB_URL, "_blank"),
        () => this.launchLevel("ProjectsScene"),
      );
    }
  }
}
