/**
 * Liste des projets du portfolio
 *
 * Chaque entrée correspond à une carte dans l'écran de sélection de projets.
 */

export interface ProjectRef {
  /** Identifiant unique du projet qui est utilisé pour naviguer vers sa scène */
  id: string;
  /** Nom affiché sur la carte */
  title: string;
  /** Clé de la scène à lancer au clic (optionnel) */
  sceneKey?: string;
}

export const projects: ProjectRef[] = [
  { id: "pachinko-game", title: "Pachinko Game" },
  { id: "ands-hommes", title: "And's Hommes", sceneKey: "AndsHommesLevelScene" },
  { id: "projet-particules", title: "Projet Particules" },
  { id: "pikomino", title: "Pikomino" },
  { id: "good-stuff", title: "Good Stuff" },
  { id: "paldex", title: "Paldex" },
  { id: "frdigechef", title: "FrdigeChef" },
];
