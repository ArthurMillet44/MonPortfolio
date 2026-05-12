/**
 * Overlay vidéo du niveau Manitou, wrapper de LevelVideoPanel.
 */

import manitouVideoUrl from "@/assets/videos/video1.mp4";
import { buildVideoOverlay as _buildVideoOverlay } from "@/scenes/Common/LevelVideoPanel";

export function buildVideoOverlay(resetEsc: () => void): void {
  _buildVideoOverlay(manitouVideoUrl, "#f1c40f", resetEsc);
}
