import { Difficulty, Direction, Tile } from "../types";

const SHUFFLE_STEPS: Record<Difficulty, number> = {
  3: 90,
  4: 180
};

export const createSolvedTiles = (size: number): Tile[] =>
  Array.from({ length: size * size }, (_, index) => (index === size * size - 1 ? 0 : index + 1));

export const getBlankIndex = (tiles: Tile[]): number => tiles.indexOf(0);

export const isSolved = (tiles: Tile[]): boolean =>
  tiles.every((value, index) => (index === tiles.length - 1 ? value === 0 : value === index + 1));

export const getAdjacentIndices = (index: number, size: number): number[] => {
  const row = Math.floor(index / size);
  const col = index % size;
  const indices: number[] = [];

  if (row > 0) {
    indices.push(index - size);
  }
  if (row < size - 1) {
    indices.push(index + size);
  }
  if (col > 0) {
    indices.push(index - 1);
  }
  if (col < size - 1) {
    indices.push(index + 1);
  }

  return indices;
};

export const canMoveTileIndex = (tiles: Tile[], size: number, tileIndex: number): boolean => {
  const blankIndex = getBlankIndex(tiles);
  return getAdjacentIndices(blankIndex, size).includes(tileIndex);
};

export const moveTileAtIndex = (tiles: Tile[], size: number, tileIndex: number): Tile[] | null => {
  if (!canMoveTileIndex(tiles, size, tileIndex)) {
    return null;
  }

  const blankIndex = getBlankIndex(tiles);
  const next = [...tiles];
  [next[blankIndex], next[tileIndex]] = [next[tileIndex], next[blankIndex]];
  return next;
};

export const moveByDirection = (tiles: Tile[], size: number, direction: Direction): Tile[] | null => {
  const blankIndex = getBlankIndex(tiles);
  const row = Math.floor(blankIndex / size);
  const col = blankIndex % size;
  let sourceIndex = -1;

  if (direction === "left" && col < size - 1) {
    sourceIndex = blankIndex + 1;
  } else if (direction === "right" && col > 0) {
    sourceIndex = blankIndex - 1;
  } else if (direction === "up" && row < size - 1) {
    sourceIndex = blankIndex + size;
  } else if (direction === "down" && row > 0) {
    sourceIndex = blankIndex - size;
  }

  if (sourceIndex < 0) {
    return null;
  }

  return moveTileAtIndex(tiles, size, sourceIndex);
};

export const shuffleSolvable = (difficulty: Difficulty, steps = SHUFFLE_STEPS[difficulty]): Tile[] => {
  const size = difficulty;
  let tiles = createSolvedTiles(size);
  let lastBlank = -1;

  for (let i = 0; i < steps; i += 1) {
    const blank = getBlankIndex(tiles);
    const neighbors = getAdjacentIndices(blank, size).filter((index) => index !== lastBlank);
    const selected = neighbors[Math.floor(Math.random() * neighbors.length)];
    const next = [...tiles];
    [next[blank], next[selected]] = [next[selected], next[blank]];
    tiles = next;
    lastBlank = blank;
  }

  if (isSolved(tiles)) {
    return shuffleSolvable(difficulty, steps + 12);
  }

  return tiles;
};

export const calculateStars = (difficulty: Difficulty, moves: number, elapsedSeconds: number): number => {
  if (difficulty === 3) {
    if (moves <= 45 && elapsedSeconds <= 90) {
      return 3;
    }
    if (moves <= 70 && elapsedSeconds <= 180) {
      return 2;
    }
    return 1;
  }

  if (moves <= 120 && elapsedSeconds <= 240) {
    return 3;
  }
  if (moves <= 180 && elapsedSeconds <= 360) {
    return 2;
  }
  return 1;
};
