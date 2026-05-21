import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import type {
  APIActionRowComponent,
  APIMessageActionRowComponent,
} from 'discord.js';

export const PLAYER_BUTTON_IDS = {
  PlayPause: 'player:playpause',
  Stop: 'player:stop',
  Next: 'player:next',
  Repeat: 'player:repeat',
} as const;

// Must match STATUS enum order in src/services/player.ts:
// PLAYING = 0, PAUSED = 1, IDLE = 2
const STATUS_PLAYING = 0;

interface PlayerControlsState {
  status: number;
  loopCurrentSong: boolean;
  loopCurrentQueue: boolean;
  getQueue: () => unknown[];
}

export function buildPlayerControls(
  player: PlayerControlsState,
): APIActionRowComponent<APIMessageActionRowComponent> {
  const isPlaying = player.status === STATUS_PLAYING;
  const hasNext = player.getQueue().length > 0;
  const hasRepeat = player.loopCurrentSong || player.loopCurrentQueue;
  const repeatEmoji = player.loopCurrentSong ? '🔂' : '🔁';

  return new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(PLAYER_BUTTON_IDS.PlayPause)
        .setEmoji(isPlaying ? '⏸️' : '▶️')
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId(PLAYER_BUTTON_IDS.Stop)
        .setEmoji('⏹️')
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId(PLAYER_BUTTON_IDS.Next)
        .setEmoji('⏭️')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(!hasNext),

      new ButtonBuilder()
        .setCustomId(PLAYER_BUTTON_IDS.Repeat)
        .setEmoji(repeatEmoji)
        .setStyle(hasRepeat ? ButtonStyle.Success : ButtonStyle.Secondary),
    )
    .toJSON();
}
