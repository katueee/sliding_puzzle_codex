let audioContext: AudioContext | null = null;

const ensureAudioContext = (): AudioContext | null => {
  if (typeof window === "undefined" || typeof window.AudioContext === "undefined") {
    return null;
  }
  if (!audioContext) {
    audioContext = new window.AudioContext();
  }
  return audioContext;
};

const playTone = (
  frequency: number,
  duration: number,
  volume: number,
  type: OscillatorType,
  startDelay = 0
): void => {
  const context = ensureAudioContext();
  if (!context) {
    return;
  }

  const startTime = context.currentTime + startDelay;
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startTime);

  gainNode.gain.setValueAtTime(0.001, startTime);
  gainNode.gain.exponentialRampToValueAtTime(volume, startTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
};

export const playMoveSound = (): void => {
  playTone(750, 0.05, 0.03, "triangle");
};

export const playClearSound = (): void => {
  playTone(660, 0.12, 0.04, "sine", 0);
  playTone(880, 0.12, 0.04, "sine", 0.11);
  playTone(1175, 0.18, 0.05, "triangle", 0.22);
};
