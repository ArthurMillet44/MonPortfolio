/**
 * Configuration principale du jeu Phaser
 *
 * Ce fichier définit les paramètres globaux du jeu :
 * dimensions, rendu, physique, et liste des scènes.
 *
 * On l'importe dans main.ts pour créer l'instance du jeu.
 */

import Phaser from "phaser";
import { MainMenuScene } from "./scenes/MainMenuScene/MainMenuScene";
import { LevelSelectScene } from "./scenes/LevelSelectScene/LevelSelectScene";
import { ProjectsScene } from "./scenes/ProjectsScene/ProjectsScene";
import { ExperiencesScene } from "./scenes/ExperiencesScene/ExperiencesScene";
import { ManitouLevelScene } from "./scenes/ManitouLevelScene/ManitouLevelScene";
import { AndsHommesLevelScene } from "./scenes/AndsHommesLevelScene/AndsHommesLevelScene";

export const gameConfig: Phaser.Types.Core.GameConfig = {
  // Phaser choisit automatiquement WebGL (rapide) ou Canvas (compatible) selon le navigateur
  type: Phaser.AUTO,

  // Dimensions de base du jeu (peut être mis à l'échelle par "scale" ci-dessous)
  width: 800,
  height: 600,

  // Couleur de fond visible pendant le chargement
  backgroundColor: "#0a0a1a",

  // Mode pixel art : désactive le lissage des images pour garder le rendu net
  pixelArt: true,

  // ID de la div HTML dans laquelle Phaser injecte le canvas
  parent: "game-container",

  // Redimensionnement automatique
  scale: {
    mode: Phaser.Scale.FIT, // le canvas s'adapte à la taille de la fenêtre
    autoCenter: Phaser.Scale.CENTER_BOTH, // centré horizontalement et verticalement
  },

  // Liste des scènes du jeu — la première de la liste est lancée au démarrage
  scene: [MainMenuScene, LevelSelectScene, ProjectsScene, ExperiencesScene, ManitouLevelScene, AndsHommesLevelScene],
};
