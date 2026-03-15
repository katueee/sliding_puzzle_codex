export type Difficulty = 3 | 4;

export type Direction = "up" | "down" | "left" | "right";

export type Tile = number;

export interface BestRecord {
  moves: number | null;
  time: number | null;
  stars: number;
}

export interface BestRecords {
  "3": BestRecord;
  "4": BestRecord;
}

export interface LastGameSnapshot {
  difficulty: Difficulty;
  tiles: Tile[];
  startingTiles: Tile[];
  moves: number;
  elapsedSeconds: number;
  isSolved: boolean;
  hasStarted: boolean;
}

export interface PersistedState {
  soundOn: boolean;
  difficulty: Difficulty;
  bestRecords: BestRecords;
  lastGame: LastGameSnapshot | null;
  themeIndex: number;
  hasSeenGuide: boolean;
}

export interface PuzzleState {
  difficulty: Difficulty;
  tiles: Tile[];
  startingTiles: Tile[];
  moves: number;
  elapsedSeconds: number;
  hasStarted: boolean;
  isTimerRunning: boolean;
  isSolved: boolean;
  starsEarned: number;
  soundOn: boolean;
  bestRecords: BestRecords;
  themeIndex: number;
  hasSeenGuide: boolean;
  clearMessageIndex: number;
}
