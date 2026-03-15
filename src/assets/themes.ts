import unicornRainbow from "./unicorn-rainbow.svg";
import unicornSky from "./unicorn-sky.svg";

export interface PuzzleTheme {
  id: string;
  name: string;
  image: string;
  accent: string;
}

export const PUZZLE_THEMES: PuzzleTheme[] = [
  {
    id: "rainbow-meadow",
    name: "にじのはらっぱ",
    image: unicornRainbow,
    accent: "#ff9ec8"
  },
  {
    id: "sky-journey",
    name: "そらのさんぽ",
    image: unicornSky,
    accent: "#8fd7ff"
  }
];
