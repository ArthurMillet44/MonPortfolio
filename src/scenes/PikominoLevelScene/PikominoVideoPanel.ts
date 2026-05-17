/**
 * Overlay vidéo du niveau Pikomino, wrapper de LevelVideoPanel.
 */

import pikominoVideoUrl from "@/assets/videos/pikodemo.mp4";
import { buildVideoOverlay as _buildVideoOverlay } from "@/scenes/Common/LevelVideoPanel";

export function buildVideoOverlay(resetEsc: () => void): void {
  _buildVideoOverlay(pikominoVideoUrl, "#7f52ff", resetEsc);
}
