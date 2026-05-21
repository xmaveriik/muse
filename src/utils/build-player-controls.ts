import {ButtonStyle, ComponentType} from 'discord.js';
import type {ActionRowData, MessageActionRowComponentData} from 'discord.js';

export const PLAYER_BUTTON_IDS = {
  PlayPause: 'player:playpause',
  Stop: 'player:stop',
  Next: 'player:next',
  Repeat: 'player:repeat',

  SeekBack: 'player:seekback',
  SeekForward: 'player:seekforward',
  VolumeDown: 'player:volumedown',
  VolumeUp: 'player:volumeup',
  Mute: 'player:mute',
} as const;

// Must match STATUS enum order in src/services/player.ts:
// PLAYING = 0, PAUSED = 1, IDLE = 2
const STATUS_PLAYING = 0;

interface PlayerControlsState {
  status: number;
  loopCurrentSong: boolean;
  loopCurrentQueue: boolean;
  getQueue: () => unknown[];
  getCurrent: () => {isLive: boolean} | null;
  getVolume: () => number;
}

export function buildPlayerControls(
  player: PlayerControlsState,
): Array<ActionRowData<MessageActionRowComponentData>> {
  const isPlaying = player.status === STATUS_PLAYING;
  const current = player.getCurrent();
  const canSeek = Boolean(current && !current.isLive);

  const hasNext = player.getQueue().length > 0;
  const hasRepeat = player.loopCurrentSong || player.loopCurrentQueue;
  const repeatEmoji = player.loopCurrentSong ? '🔂' : '🔁';

  const volume = player.getVolume();

  return [
    {
      type: ComponentType.ActionRow,
      components: [
        {
          type: ComponentType.Button,
          customId: PLAYER_BUTTON_IDS.PlayPause,
          emoji: {name: isPlaying ? '⏸️' : '▶️'},
          style: ButtonStyle.Secondary,
        },
        {
          type: ComponentType.Button,
          customId: PLAYER_BUTTON_IDS.Stop,
          emoji: {name: '⏹️'},
          style: ButtonStyle.Secondary,
        },
        {
          type: ComponentType.Button,
          customId: PLAYER_BUTTON_IDS.Next,
          emoji: {name: '⏭️'},
          style: ButtonStyle.Secondary,
          disabled: !hasNext,
        },
        {
          type: ComponentType.Button,
          customId: PLAYER_BUTTON_IDS.Repeat,
          emoji: {name: repeatEmoji},
          style: hasRepeat ? ButtonStyle.Success : ButtonStyle.Secondary,
        },
      ],
    },
    {
      type: ComponentType.ActionRow,
      components: [
        {
          type: ComponentType.Button,
          customId: PLAYER_BUTTON_IDS.SeekBack,
          emoji: {name: '⏪'},
          label: '10s',
          style: ButtonStyle.Secondary,
          disabled: !canSeek,
        },
        {
          type: ComponentType.Button,
          customId: PLAYER_BUTTON_IDS.SeekForward,
          emoji: {name: '⏩'},
          label: '10s',
          style: ButtonStyle.Secondary,
          disabled: !canSeek,
        },
        {
          type: ComponentType.Button,
          customId: PLAYER_BUTTON_IDS.VolumeDown,
          emoji: {name: '🔉'},
          style: ButtonStyle.Secondary,
          disabled: volume <= 0,
        },
        {
          type: ComponentType.Button,
          customId: PLAYER_BUTTON_IDS.VolumeUp,
          emoji: {name: '🔊'},
          style: ButtonStyle.Secondary,
          disabled: volume >= 100,
        },
        {
          type: ComponentType.Button,
          customId: PLAYER_BUTTON_IDS.Mute,
          emoji: {name: '🔇'},
          style: ButtonStyle.Secondary,
          disabled: volume <= 0,
        },
      ],
    },
  ];
}
