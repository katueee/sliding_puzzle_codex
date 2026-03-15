export const formatDuration = (seconds: number): string => {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, "0");
  const remain = (safeSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remain}`;
};
