/**
 * Liste des expériences professionnelles du portfolio
 *
 * Chaque entrée correspond à une carte dans l'écran de sélection d'expériences.
 */

export interface ExperienceRef {
  /** Identifiant unique de l'expérience */
  id: string;
  /** Nom affiché sur la carte */
  title: string;
}

export const experiences: ExperienceRef[] = [
  { id: "ministere-justice", title: "Ministère de la justice" },
  { id: "microej", title: "MicroEJ" },
  { id: "manitou", title: "Manitou" },
];
