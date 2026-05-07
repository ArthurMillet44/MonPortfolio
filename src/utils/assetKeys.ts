/**
 * assetKeys.ts — Noms des assets (textures, sons, etc.)
 * -------------------------------------------------------
 * Phaser identifie chaque image ou son par une clé (une simple chaîne de caractères).
 * Ce fichier centralise toutes ces clés pour éviter les fautes de frappe.
 *
 */

export const KEYS = {
  /** Spritesheet du personnage joueur (4 frames : idle, walk_1, walk_2, jump) */
  PLAYER: "player",

  /** Image de fond : ciel en dégradé de bleus */
  BG_SKY: "bg_sky",

  /** Image des nuages pixel art */
  BG_CLOUDS: "bg_clouds",
} as const;

/** Type utilitaire : représente n'importe quelle valeur valide de KEYS */
export type AssetKey = (typeof KEYS)[keyof typeof KEYS];
