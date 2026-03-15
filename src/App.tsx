import { useMemo, useState } from "react";
import { PUZZLE_THEMES } from "./assets/themes";
import { PuzzleBoard } from "./components/PuzzleBoard";
import { usePuzzleGame } from "./hooks/usePuzzleGame";
import { formatDuration } from "./utils/format";
import styles from "./App.module.css";

const CLEAR_MESSAGES = [
  "できたね。きらきらのてんさい！",
  "すごい。ユニコーンもにっこり！",
  "わあ、ばっちりかんせい！",
  "やったね。おほしさまゲット！",
  "すごいしゅうちゅうりょく！",
  "ふわふわハッピークリア！"
];

const DIFFICULTIES = [
  { value: 3 as const, label: "やさしい 3x3" },
  { value: 4 as const, label: "たのしい 4x4" }
];

function App(): JSX.Element {
  const [previewOpen, setPreviewOpen] = useState(false);
  const { state, moveTile, swipeMove, shuffle, restart, setDifficulty, toggleSound, dismissGuide, nextTheme } = usePuzzleGame(
    PUZZLE_THEMES.length
  );
  const currentTheme = PUZZLE_THEMES[state.themeIndex % PUZZLE_THEMES.length];
  const bestRecord = useMemo(
    () => state.bestRecords[(state.difficulty === 3 ? "3" : "4") as "3" | "4"],
    [state.bestRecords, state.difficulty]
  );
  const clearMessage = CLEAR_MESSAGES[state.clearMessageIndex % CLEAR_MESSAGES.length];

  return (
    <main className={styles.app}>
      <div className={styles.bubbleA} aria-hidden />
      <div className={styles.bubbleB} aria-hidden />
      <header className={styles.header}>
        <p className={styles.logo}>Yumekawa Puzzle</p>
        <h1>ゆめかわ ユニコーンパズル</h1>
        <p className={styles.subline}>ピースをうごかして えを かんせいしよう</p>
      </header>

      <section className={styles.statsGrid} aria-label="スコア">
        <article className={styles.statCard}>
          <span>てすう</span>
          <strong>{state.moves}</strong>
        </article>
        <article className={styles.statCard}>
          <span>じかん</span>
          <strong>{formatDuration(state.elapsedSeconds)}</strong>
        </article>
        <article className={styles.statCard}>
          <span>ベスト</span>
          <strong>{bestRecord.moves === null ? "--" : `${bestRecord.moves}手`}</strong>
        </article>
        <article className={styles.statCard}>
          <span>ベストタイム</span>
          <strong>{bestRecord.time === null ? "--:--" : formatDuration(bestRecord.time)}</strong>
        </article>
      </section>

      <section className={styles.playCard}>
        <PuzzleBoard
          size={state.difficulty}
          tiles={state.tiles}
          imageSrc={currentTheme.image}
          onTileTap={moveTile}
          onSwipe={swipeMove}
          disabled={state.isSolved}
        />
        <aside className={styles.previewDock}>
          <p className={styles.previewTitle}>おてほん</p>
          <img src={currentTheme.image} alt={`${currentTheme.name}のおてほん`} className={styles.previewThumb} />
          <p className={styles.previewName}>{currentTheme.name}</p>
          <button type="button" className={styles.softButton} onClick={() => setPreviewOpen(true)}>
            おおきくみる
          </button>
        </aside>
      </section>

      <section className={styles.controlRow} aria-label="ゲーム操作">
        <button type="button" className={styles.primaryButton} onClick={shuffle}>
          まぜる
        </button>
        <button type="button" className={styles.secondaryButton} onClick={restart}>
          やりなおし
        </button>
        <button type="button" className={styles.secondaryButton} onClick={() => setPreviewOpen(true)}>
          おてほん
        </button>
      </section>

      <section className={styles.settingRow} aria-label="設定">
        <div className={styles.segment}>
          {DIFFICULTIES.map((difficulty) => (
            <button
              key={difficulty.value}
              type="button"
              className={difficulty.value === state.difficulty ? styles.segmentActive : styles.segmentButton}
              onClick={() => setDifficulty(difficulty.value)}
            >
              {difficulty.label}
            </button>
          ))}
        </div>
        <button type="button" className={styles.soundButton} onClick={toggleSound}>
          {state.soundOn ? "おと ON" : "おと OFF"}
        </button>
      </section>

      {!state.hasSeenGuide && (
        <section className={styles.guideCard} aria-live="polite">
          <h2>はじめてのあそびかた</h2>
          <p>ピースを うごかして えを かんせいさせよう！</p>
          <button type="button" className={styles.primaryButton} onClick={dismissGuide}>
            はじめる
          </button>
        </section>
      )}

      {state.isSolved && (
        <section className={styles.clearLayer} role="dialog" aria-modal="true">
          <div className={styles.sparkleField} aria-hidden>
            {Array.from({ length: 14 }).map((_, index) => (
              <span
                key={`spark-${index}`}
                className={styles.spark}
                style={{
                  left: `${8 + (index % 7) * 14}%`,
                  top: `${6 + Math.floor(index / 7) * 24}%`,
                  animationDelay: `${index * 0.08}s`
                }}
              />
            ))}
          </div>
          <div className={styles.clearCard}>
            <p className={styles.clearTop}>できた！</p>
            <h2>{clearMessage}</h2>
            <p className={styles.starLine}>{`${"★".repeat(state.starsEarned)}${"☆".repeat(3 - state.starsEarned)}`}</p>
            <div className={styles.clearActions}>
              <button type="button" className={styles.primaryButton} onClick={restart}>
                もういちど
              </button>
              <button type="button" className={styles.secondaryButton} onClick={nextTheme}>
                つぎのえ
              </button>
            </div>
          </div>
        </section>
      )}

      {previewOpen && (
        <section className={styles.modalLayer} onClick={() => setPreviewOpen(false)} role="dialog" aria-modal="true">
          <div className={styles.modalCard} onClick={(event) => event.stopPropagation()}>
            <h2>おてほんを かくにん</h2>
            <img src={currentTheme.image} alt={`${currentTheme.name}のおてほん`} className={styles.modalImage} />
            <button type="button" className={styles.primaryButton} onClick={() => setPreviewOpen(false)}>
              とじる
            </button>
          </div>
        </section>
      )}
    </main>
  );
}

export default App;
