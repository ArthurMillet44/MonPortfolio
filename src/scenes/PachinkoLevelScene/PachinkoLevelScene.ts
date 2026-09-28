/**
 * Niveau Pachinko, délègue intro/game/result à ses modules dédiés.
 * La machine d'états, ESC et les transitions sont gérés par BaseLevelScene.
 */

import { BaseLevelScene, GameState } from "@/scenes/Common/BaseLevelScene";
import { buildIntro, buildRulesOverlay } from "./PachinkoIntro";
import { PachinkoGame, PachinkoOutcome } from "./PachinkoGame";
import { buildResult } from "./PachinkoResult";
import { ITCH_URL, BUCKETS } from "./PachinkoConfig";
import "./PachinkoLevelScene.css";

export class PachinkoLevelScene extends BaseLevelScene {
  protected readonly menuSceneKey = "ProjectsScene";
  private outcome: PachinkoOutcome = {
    bucketId: BUCKETS[0].id,
    label: BUCKETS[0].label,
    win: false,
  };

  constructor() {
    super({ key: "PachinkoLevelScene" });
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
      const game = new PachinkoGame(this, (outcome) => {
        this.outcome = outcome;
        this.transition("result");
      });
      this.minigame = game;
      game.start();
    } else {
      buildResult(
        this,
        this.outcome,
        () => this.transition("game"),
        () => window.open(ITCH_URL, "_blank"),
        () => this.launchLevel("ProjectsScene"),
      );
    }
  }
}
