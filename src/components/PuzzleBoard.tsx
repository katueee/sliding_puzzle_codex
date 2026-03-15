import { CSSProperties, useMemo, useRef } from "react";
import { Difficulty, Direction } from "../types";
import styles from "./PuzzleBoard.module.css";

interface PuzzleBoardProps {
  size: Difficulty;
  tiles: number[];
  imageSrc: string;
  onTileTap: (index: number) => void;
  onSwipe: (direction: Direction) => void;
  disabled?: boolean;
}

const SWIPE_THRESHOLD = 22;

const getDirectionFromDelta = (dx: number, dy: number): Direction | null => {
  if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) {
    return null;
  }
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? "right" : "left";
  }
  return dy > 0 ? "down" : "up";
};

const tilePositionStyle = (index: number, size: number): CSSProperties => {
  const row = Math.floor(index / size);
  const col = index % size;

  return {
    width: `${100 / size}%`,
    height: `${100 / size}%`,
    transform: `translate(${col * 100}%, ${row * 100}%)`
  };
};

const tileImageStyle = (value: number, size: number, imageSrc: string): CSSProperties => {
  const solvedIndex = value - 1;
  const solvedRow = Math.floor(solvedIndex / size);
  const solvedCol = solvedIndex % size;

  return {
    backgroundImage: `url(${imageSrc})`,
    backgroundSize: `${size * 100}% ${size * 100}%`,
    backgroundPosition: `${(solvedCol * 100) / (size - 1)}% ${(solvedRow * 100) / (size - 1)}%`
  };
};

export const PuzzleBoard = ({ size, tiles, imageSrc, onTileTap, onSwipe, disabled }: PuzzleBoardProps): JSX.Element => {
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const blankIndex = tiles.indexOf(0);

  const renderedTiles = useMemo(
    () =>
      tiles
        .map((value, index) => ({ value, index }))
        .filter(({ value }) => value !== 0),
    [tiles]
  );

  return (
    <div
      className={styles.board}
      role="grid"
      aria-label={`${size}かける${size} スライディングパズル`}
      onPointerDown={(event) => {
        startRef.current = { x: event.clientX, y: event.clientY };
      }}
      onPointerUp={(event) => {
        const start = startRef.current;
        startRef.current = null;
        if (!start || disabled) {
          return;
        }
        const direction = getDirectionFromDelta(event.clientX - start.x, event.clientY - start.y);
        if (direction) {
          onSwipe(direction);
        }
      }}
    >
      <div className={styles.blankSlot} style={tilePositionStyle(blankIndex, size)} />
      {renderedTiles.map(({ value, index }) => (
        <button
          key={value}
          type="button"
          className={styles.tile}
          style={{
            ...tilePositionStyle(index, size),
            ...tileImageStyle(value, size, imageSrc)
          }}
          onClick={() => onTileTap(index)}
          disabled={disabled}
          aria-label={`${value}ばんのピース`}
        >
          <span className={styles.tileShine} />
        </button>
      ))}
    </div>
  );
};
