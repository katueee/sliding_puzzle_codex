import { useEffect, useReducer, useRef } from "react";
import { BestRecords, Difficulty, Direction, LastGameSnapshot, PuzzleState } from "../types";
import { calculateStars, isSolved, moveByDirection, moveTileAtIndex, shuffleSolvable } from "../utils/game";
import { loadPersistedState, savePersistedState } from "../utils/storage";
import { playClearSound, playMoveSound } from "../utils/sound";

const CLEAR_MESSAGE_COUNT = 6;

type PuzzleAction =
  | { type: "MOVE_TILE"; index: number }
  | { type: "MOVE_BY_DIRECTION"; direction: Direction }
  | { type: "SHUFFLE" }
  | { type: "RESTART" }
  | { type: "SET_DIFFICULTY"; difficulty: Difficulty }
  | { type: "TOGGLE_SOUND" }
  | { type: "DISMISS_GUIDE" }
  | { type: "NEXT_THEME"; themeCount: number }
  | { type: "TICK" };

interface FreshRound {
  tiles: number[];
  startingTiles: number[];
  moves: number;
  elapsedSeconds: number;
  hasStarted: boolean;
  isTimerRunning: boolean;
  isSolved: boolean;
  starsEarned: number;
}

const freshRound = (difficulty: Difficulty): FreshRound => {
  const shuffled = shuffleSolvable(difficulty);
  return {
    tiles: shuffled,
    startingTiles: shuffled,
    moves: 0,
    elapsedSeconds: 0,
    hasStarted: false,
    isTimerRunning: false,
    isSolved: false,
    starsEarned: 0
  };
};

const updateBestRecords = (
  bestRecords: BestRecords,
  difficulty: Difficulty,
  moves: number,
  elapsedSeconds: number,
  stars: number
): BestRecords => {
  const key = String(difficulty) as "3" | "4";
  const current = bestRecords[key];

  return {
    ...bestRecords,
    [key]: {
      moves: current.moves === null || moves < current.moves ? moves : current.moves,
      time: current.time === null || elapsedSeconds < current.time ? elapsedSeconds : current.time,
      stars: Math.max(current.stars, stars)
    }
  };
};

const applyMoveResult = (state: PuzzleState, nextTiles: number[] | null): PuzzleState => {
  if (!nextTiles || state.isSolved) {
    return state;
  }

  const moves = state.moves + 1;
  const solved = isSolved(nextTiles);
  const starsEarned = solved ? calculateStars(state.difficulty, moves, state.elapsedSeconds) : state.starsEarned;
  const bestRecords = solved
    ? updateBestRecords(state.bestRecords, state.difficulty, moves, state.elapsedSeconds, starsEarned)
    : state.bestRecords;

  return {
    ...state,
    tiles: nextTiles,
    moves,
    hasStarted: true,
    isTimerRunning: !solved,
    isSolved: solved,
    starsEarned,
    bestRecords,
    clearMessageIndex: solved
      ? (state.clearMessageIndex + 1 + Math.floor(Math.random() * 2)) % CLEAR_MESSAGE_COUNT
      : state.clearMessageIndex
  };
};

const normalizeThemeIndex = (index: number, themeCount: number): number => {
  if (themeCount <= 0) {
    return 0;
  }
  return ((index % themeCount) + themeCount) % themeCount;
};

const createInitialState = (themeCount: number): PuzzleState => {
  const persisted = loadPersistedState();
  const snapshot = persisted.lastGame;
  const canResume =
    snapshot &&
    snapshot.tiles.length === snapshot.difficulty * snapshot.difficulty &&
    snapshot.startingTiles.length === snapshot.difficulty * snapshot.difficulty &&
    !snapshot.isSolved;

  if (canResume && snapshot) {
    return {
      difficulty: snapshot.difficulty,
      tiles: snapshot.tiles,
      startingTiles: snapshot.startingTiles,
      moves: snapshot.moves,
      elapsedSeconds: snapshot.elapsedSeconds,
      hasStarted: snapshot.hasStarted || snapshot.moves > 0,
      isTimerRunning: snapshot.hasStarted || snapshot.moves > 0,
      isSolved: false,
      starsEarned: 0,
      soundOn: persisted.soundOn,
      bestRecords: persisted.bestRecords,
      themeIndex: normalizeThemeIndex(persisted.themeIndex, themeCount),
      hasSeenGuide: persisted.hasSeenGuide,
      clearMessageIndex: 0
    };
  }

  const round = freshRound(persisted.difficulty);
  return {
    difficulty: persisted.difficulty,
    ...round,
    soundOn: persisted.soundOn,
    bestRecords: persisted.bestRecords,
    themeIndex: normalizeThemeIndex(persisted.themeIndex, themeCount),
    hasSeenGuide: persisted.hasSeenGuide,
    clearMessageIndex: 0
  };
};

const reducer = (state: PuzzleState, action: PuzzleAction): PuzzleState => {
  switch (action.type) {
    case "MOVE_TILE": {
      const nextTiles = moveTileAtIndex(state.tiles, state.difficulty, action.index);
      return applyMoveResult(state, nextTiles);
    }
    case "MOVE_BY_DIRECTION": {
      const nextTiles = moveByDirection(state.tiles, state.difficulty, action.direction);
      return applyMoveResult(state, nextTiles);
    }
    case "SHUFFLE": {
      const nextRound = freshRound(state.difficulty);
      return {
        ...state,
        ...nextRound
      };
    }
    case "RESTART": {
      return {
        ...state,
        tiles: [...state.startingTiles],
        moves: 0,
        elapsedSeconds: 0,
        hasStarted: false,
        isTimerRunning: false,
        isSolved: false,
        starsEarned: 0
      };
    }
    case "SET_DIFFICULTY": {
      const nextRound = freshRound(action.difficulty);
      return {
        ...state,
        difficulty: action.difficulty,
        ...nextRound
      };
    }
    case "TOGGLE_SOUND": {
      return {
        ...state,
        soundOn: !state.soundOn
      };
    }
    case "DISMISS_GUIDE": {
      return {
        ...state,
        hasSeenGuide: true
      };
    }
    case "NEXT_THEME": {
      const nextRound = freshRound(state.difficulty);
      return {
        ...state,
        ...nextRound,
        themeIndex: normalizeThemeIndex(state.themeIndex + 1, action.themeCount)
      };
    }
    case "TICK": {
      if (!state.isTimerRunning || state.isSolved) {
        return state;
      }
      return {
        ...state,
        elapsedSeconds: state.elapsedSeconds + 1
      };
    }
    default:
      return state;
  }
};

export interface PuzzleGameController {
  state: PuzzleState;
  moveTile: (index: number) => void;
  swipeMove: (direction: Direction) => void;
  shuffle: () => void;
  restart: () => void;
  setDifficulty: (difficulty: Difficulty) => void;
  toggleSound: () => void;
  dismissGuide: () => void;
  nextTheme: () => void;
}

export const usePuzzleGame = (themeCount: number): PuzzleGameController => {
  const [state, dispatch] = useReducer(reducer, themeCount, createInitialState);
  const previousMoves = useRef(state.moves);
  const previousSolved = useRef(state.isSolved);

  useEffect(() => {
    if (!state.isTimerRunning) {
      return undefined;
    }
    const timerId = window.setInterval(() => {
      dispatch({ type: "TICK" });
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [state.isTimerRunning]);

  useEffect(() => {
    const snapshot: LastGameSnapshot = {
      difficulty: state.difficulty,
      tiles: state.tiles,
      startingTiles: state.startingTiles,
      moves: state.moves,
      elapsedSeconds: state.elapsedSeconds,
      isSolved: state.isSolved,
      hasStarted: state.hasStarted
    };

    savePersistedState({
      soundOn: state.soundOn,
      difficulty: state.difficulty,
      bestRecords: state.bestRecords,
      lastGame: snapshot,
      themeIndex: state.themeIndex,
      hasSeenGuide: state.hasSeenGuide
    });
  }, [
    state.soundOn,
    state.difficulty,
    state.bestRecords,
    state.tiles,
    state.startingTiles,
    state.moves,
    state.elapsedSeconds,
    state.isSolved,
    state.hasStarted,
    state.themeIndex,
    state.hasSeenGuide
  ]);

  useEffect(() => {
    if (state.moves > previousMoves.current && state.soundOn) {
      playMoveSound();
    }
    previousMoves.current = state.moves;
  }, [state.moves, state.soundOn]);

  useEffect(() => {
    if (state.isSolved && !previousSolved.current && state.soundOn) {
      playClearSound();
    }
    previousSolved.current = state.isSolved;
  }, [state.isSolved, state.soundOn]);

  return {
    state,
    moveTile: (index) => dispatch({ type: "MOVE_TILE", index }),
    swipeMove: (direction) => dispatch({ type: "MOVE_BY_DIRECTION", direction }),
    shuffle: () => dispatch({ type: "SHUFFLE" }),
    restart: () => dispatch({ type: "RESTART" }),
    setDifficulty: (difficulty) => dispatch({ type: "SET_DIFFICULTY", difficulty }),
    toggleSound: () => dispatch({ type: "TOGGLE_SOUND" }),
    dismissGuide: () => dispatch({ type: "DISMISS_GUIDE" }),
    nextTheme: () => dispatch({ type: "NEXT_THEME", themeCount })
  };
};
