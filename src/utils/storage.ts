import { BestRecord, BestRecords, Difficulty, LastGameSnapshot, PersistedState } from "../types";
import { isSolved } from "./game";

const STORAGE_KEY = "yumekawa-slide-puzzle-v1";

const createDefaultRecord = (): BestRecord => ({
  moves: null,
  time: null,
  stars: 0
});

export const createDefaultBestRecords = (): BestRecords => ({
  "3": createDefaultRecord(),
  "4": createDefaultRecord()
});

export const createDefaultPersistedState = (): PersistedState => ({
  soundOn: true,
  difficulty: 4,
  bestRecords: createDefaultBestRecords(),
  lastGame: null,
  themeIndex: 0,
  hasSeenGuide: false
});

const isDifficulty = (value: unknown): value is Difficulty => value === 3 || value === 4;

const sanitizeBestRecord = (record: unknown): BestRecord => {
  if (!record || typeof record !== "object") {
    return createDefaultRecord();
  }

  const value = record as Partial<BestRecord>;
  return {
    moves: typeof value.moves === "number" && Number.isFinite(value.moves) ? value.moves : null,
    time: typeof value.time === "number" && Number.isFinite(value.time) ? value.time : null,
    stars: typeof value.stars === "number" && Number.isFinite(value.stars) ? Math.max(0, Math.floor(value.stars)) : 0
  };
};

const sanitizeBestRecords = (records: unknown): BestRecords => {
  if (!records || typeof records !== "object") {
    return createDefaultBestRecords();
  }

  const value = records as Partial<BestRecords>;
  return {
    "3": sanitizeBestRecord(value["3"]),
    "4": sanitizeBestRecord(value["4"])
  };
};

const sanitizeTiles = (tiles: unknown, size: number): number[] | null => {
  if (!Array.isArray(tiles) || tiles.length !== size * size) {
    return null;
  }
  if (!tiles.every((tile) => Number.isInteger(tile))) {
    return null;
  }

  const numbers = tiles as number[];
  const uniqueCount = new Set(numbers).size;
  if (uniqueCount !== size * size) {
    return null;
  }

  const hasAllValues = numbers.every((tile) => tile >= 0 && tile < size * size);
  return hasAllValues ? numbers : null;
};

const sanitizeLastGame = (snapshot: unknown): LastGameSnapshot | null => {
  if (!snapshot || typeof snapshot !== "object") {
    return null;
  }

  const value = snapshot as Partial<LastGameSnapshot>;
  if (!isDifficulty(value.difficulty)) {
    return null;
  }

  const size = value.difficulty;
  const tiles = sanitizeTiles(value.tiles, size);
  const startingTiles = sanitizeTiles(value.startingTiles, size);
  if (!tiles || !startingTiles) {
    return null;
  }

  const moves = typeof value.moves === "number" && Number.isFinite(value.moves) ? Math.max(0, Math.floor(value.moves)) : 0;
  const elapsedSeconds =
    typeof value.elapsedSeconds === "number" && Number.isFinite(value.elapsedSeconds)
      ? Math.max(0, Math.floor(value.elapsedSeconds))
      : 0;
  const solvedFlag = typeof value.isSolved === "boolean" ? value.isSolved : isSolved(tiles);
  const hasStarted = typeof value.hasStarted === "boolean" ? value.hasStarted : moves > 0;

  return {
    difficulty: size,
    tiles,
    startingTiles,
    moves,
    elapsedSeconds,
    isSolved: solvedFlag,
    hasStarted
  };
};

export const loadPersistedState = (): PersistedState => {
  const fallback = createDefaultPersistedState();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return fallback;
    }

    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    const difficulty = isDifficulty(parsed.difficulty) ? parsed.difficulty : fallback.difficulty;
    const soundOn = typeof parsed.soundOn === "boolean" ? parsed.soundOn : fallback.soundOn;
    const themeIndex =
      typeof parsed.themeIndex === "number" && Number.isFinite(parsed.themeIndex) ? Math.max(0, Math.floor(parsed.themeIndex)) : 0;
    const hasSeenGuide = typeof parsed.hasSeenGuide === "boolean" ? parsed.hasSeenGuide : false;

    return {
      soundOn,
      difficulty,
      bestRecords: sanitizeBestRecords(parsed.bestRecords),
      lastGame: sanitizeLastGame(parsed.lastGame),
      themeIndex,
      hasSeenGuide
    };
  } catch {
    return fallback;
  }
};

export const savePersistedState = (state: PersistedState): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage write errors to avoid blocking gameplay
  }
};
