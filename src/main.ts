/**
 * main.ts — Point d'entrée de l'application
 *
 * C'est le premier fichier exécuté par le navigateur.
 * Son rôle : attendre que la police soit chargée, puis démarrer le jeu Phaser.
 *
 * Pourquoi attendre la police ?
 * Phaser dessine le texte sur un canvas HTML au démarrage.
 * Si la police n'est pas encore chargée à ce moment-là,
 * le texte s'affiche avec une police de secours (mauvais rendu).
 */

import Phaser from "phaser";
import { gameConfig } from "./game.config";
import "./styles/global.css";
// Empêche les textes du jeu d'apparaître pixélisés (voir le fichier pour le détail)
import "./utils/smoothText";

// On essaie de charger la police "VT323" (Google Fonts, chargée dans index.html)
const fontLoad = document.fonts.load("400 16px VT323").then(() => {});

// Filet de sécurité : si la police met plus de 2 secondes, on démarre quand même
// (évite que le jeu reste bloqué si Google Fonts est lent ou hors ligne)
const timeout = new Promise<void>((resolve) => setTimeout(resolve, 2000));

// On attend le premier des deux : police chargée OU timeout
Promise.race([fontLoad, timeout]).then(() => {
  new Phaser.Game(gameConfig);
});
