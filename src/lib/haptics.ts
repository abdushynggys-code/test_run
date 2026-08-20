export type HapticFeedback = 'crown' | 'level-up';

const patterns: Record<HapticFeedback, number[]> = {
  crown: [35, 45, 70, 45, 120],
  'level-up': [45, 35, 45],
};

export function triggerHaptic(feedback: HapticFeedback) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(patterns[feedback]);
}
