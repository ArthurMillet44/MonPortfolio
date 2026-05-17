export const TECHS = [
  { id: "kotlin", label: "Kotlin", short: "KOT", color: 0x7f52ff },
  { id: "gradle", label: "Gradle", short: "GDL", color: 0x02aabb },
  { id: "javafx", label: "JavaFX", short: "JFX", color: 0xe07b39 },
  { id: "css", label: "CSS", short: "CSS", color: 0x264de4 },
  { id: "mvc", label: "MVC", short: "MVC", color: 0xe74c3c },
  { id: "junit", label: "JUnit", short: "JUT", color: 0x25a162 },
  { id: "ktor", label: "Ktor", short: "KTR", color: 0x087cfa },
  { id: "agile", label: "Agile", short: "AGL", color: 0xf1c40f },
] as const;

export type TechId = (typeof TECHS)[number]["id"];

export const TIMER_SECONDS = 30;
export const CELL = 28;
export const COLS = 27;
export const ROWS = 19;
export const GRID_X = 22;
export const GRID_Y = 50;
export const TICK_MS = 180;
export const GROW_BY = 3;
