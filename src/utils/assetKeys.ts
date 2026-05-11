/**
 * assetKeys.ts — Noms des assets (textures, sons, etc.)
 * -------------------------------------------------------
 * Phaser identifie chaque image ou son par une clé (une simple chaîne de caractères).
 * Ce fichier centralise toutes ces clés pour éviter les fautes de frappe.
 *
 */

export const KEYS = {
  /** Spritesheet Soldier idle — 6 frames 100×100 (avec ombres) */
  SOLDIER_IDLE: "soldier_idle",

  /** Spritesheet Soldier walk — 8 frames 100×100 (avec ombres) */
  SOLDIER_WALK: "soldier_walk",

  /** Spritesheet Orc idle — 6 frames 100×100 (avec ombres) */
  ORC_IDLE: "orc_idle",

  /** Spritesheet Orc walk — 8 frames 100×100 (avec ombres) */
  ORC_WALK: "orc_walk",

  /** Image de fond : ciel en dégradé de bleus */
  BG_SKY: "bg_sky",

  /** Image des nuages pixel art */
  BG_CLOUDS: "bg_clouds",
} as const;

/** Type utilitaire : représente n'importe quelle valeur valide de KEYS */
export type AssetKey = (typeof KEYS)[keyof typeof KEYS];
