/**
 * Overlay vidéo du niveau And's Hommes, wrapper de LevelVideoPanel.
 */

import andsHommesVideoUrl from "@/assets/videos/AndsHommesVideo.mp4";
import { buildVideoOverlay as _buildVideoOverlay } from "@/scenes/Common/LevelVideoPanel";

export function buildVideoOverlay(resetEsc: () => void): void {
  _buildVideoOverlay(andsHommesVideoUrl, "#00c896", resetEsc);
}
