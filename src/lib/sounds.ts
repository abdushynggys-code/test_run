export type UiSound = 'click' | 'reward';

const soundFiles: Record<UiSound, string> = {
  click: '/sounds/ui-click.mp3',
  reward: '/sounds/reward-coinbag.mp3',
};

const volumes: Record<UiSound, number> = {
  click: 0.28,
  reward: 0.5,
};

const players = new Map<UiSound, HTMLAudioElement>();

export function playUiSound(sound: UiSound) {
  if (typeof Audio === 'undefined') return;

  const player = players.get(sound) ?? new Audio(soundFiles[sound]);
  if (!players.has(sound)) {
    player.preload = 'auto';
    player.volume = volumes[sound];
    players.set(sound, player);
  }

  player.currentTime = 0;
  void player.play().catch(() => {
    // Browsers may block audio until the first direct user interaction.
  });
}
