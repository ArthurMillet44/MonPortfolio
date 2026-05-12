/**
 * Constantes partagées par tous les modules du niveau Manitou :
 * stack technique, durée de la partie et dimensions de la zone de dépôt.
 */

/** Stack technique de la mission — ordre d'affichage dans les chips résultat. */
export const TECH = [
  { id: "sql", label: "SQL", color: 0x9b59b6 },
  { id: "talend", label: "TALEND", color: 0x3498db },
  { id: "java", label: "JAVA", color: 0xe74c3c },
  { id: "ps", label: "POWERSHELL", color: 0x2980b9 },
  { id: "dbt", label: "DBT", color: 0xf39c12 },
  { id: "pbi", label: "POWER BI", color: 0xf1c40f },
] as const;

/** Union des identifiants de technologies. */
export type TechId = (typeof TECH)[number]["id"];

/** Durée totale d'une partie en secondes. */
export const TIMER_SECONDS = 10;

/**
 * Zone de dépôt — centre et dimensions en pixels (canvas 800×600).
 * Couvre x : 527–703, y : 82–537.
 */
export const ZONE = { x: 615, y: 310, w: 176, h: 456 };
