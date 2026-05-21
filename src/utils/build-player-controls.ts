import {ActionRowBuilder, ButtonBuilder, ButtonStyle} from 'discord.js';
import Player, {STATUS} from '../services/player.js';

export const PLAYER_BUTTON_IDS = {
  PlayPause: 'player:playpause',
  Stop: 'player:stop',
  Next: 'player:next',
  Repeat: 'player:repeat',
} as const;

export function buildPlayerControls(player: Player): ActionRowBuilder<ButtonBuilder> {
  const isPlaying = player.status === STATUS.PLAYING;
  const hasNext = player.getQueue().length > 0;
  const hasRepeat = player.loopCurrentSong || player.loopCurrentQueue;
  const repeatEmoji = player.loopCurrentSong ? '🔂' : '🔁';

  return new ActionRowBuilder<ButtonBuilder>().addComponents(
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
  );
}
