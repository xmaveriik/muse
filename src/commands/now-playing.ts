import {ButtonInteraction, ChatInputCommandInteraction} from 'discord.js';
import {TYPES} from '../types.js';
import {inject, injectable} from 'inversify';
import PlayerManager from '../managers/player.js';
import Command from './index.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import {buildPlayingMessageEmbed} from '../utils/build-embed.js';
import {buildPlayerControls, PLAYER_BUTTON_IDS} from '../utils/build-player-controls.js';
import {STATUS} from '../services/player.js';

@injectable()
export default class implements Command {
  public readonly slashCommand = new SlashCommandBuilder()
    .setName('now-playing')
    .setDescription('shows the currently played song');

  public readonly handledButtonIds = Object.values(PLAYER_BUTTON_IDS);

  private readonly playerManager: PlayerManager;

  constructor(@inject(TYPES.Managers.Player) playerManager: PlayerManager) {
    this.playerManager = playerManager;
  }

  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const player = this.playerManager.get(interaction.guild!.id);

    if (!player.getCurrent()) {
      throw new Error('nothing is currently playing');
    }

    await interaction.reply({
      embeds: [buildPlayingMessageEmbed(player)],
      components: [buildPlayerControls(player)],
    });
  }

  public async handleButtonInteraction(interaction: ButtonInteraction): Promise<void> {
    if (!interaction.guild) {
      return;
    }

    const player = this.playerManager.get(interaction.guild.id);

    if (!player.getCurrent()) {
      await interaction.reply({content: 'Nothing is playing right now.', ephemeral: true});
      return;
    }

    const member = await interaction.guild.members.fetch(interaction.user.id);
    const memberVc = member.voice.channelId;
    const botVc = interaction.guild.members.me?.voice?.channelId;

    if (!memberVc || !botVc || memberVc !== botVc) {
      await interaction.reply({content: 'Join my voice channel to use controls.', ephemeral: true});
      return;
    }

    await interaction.deferReply({ephemeral: true});

    switch (interaction.customId) {
      case PLAYER_BUTTON_IDS.PlayPause: {
        if (player.status === STATUS.PLAYING) {
          player.pause();
          await interaction.editReply('⏸️ Paused.');
        } else {
          await player.play();
          await interaction.editReply('▶️ Resumed.');
        }

        break;
      }

      case PLAYER_BUTTON_IDS.Stop: {
        player.stop();
        await interaction.editReply('⏹️ Stopped.');
        break;
      }

      case PLAYER_BUTTON_IDS.Next: {
        if (player.getQueue().length === 0) {
          await interaction.editReply('No next track to skip to.');
          break;
        }

        await player.forward(1);
        await interaction.editReply('⏭️ Skipped.');
        break;
      }

      case PLAYER_BUTTON_IDS.Repeat: {
        if (player.loopCurrentSong) {
          player.loopCurrentSong = false;
          player.loopCurrentQueue = true;
          await interaction.editReply('🔁 Repeat: Queue.');
        } else if (player.loopCurrentQueue) {
          player.loopCurrentQueue = false;
          await interaction.editReply('🔁 Repeat: Off.');
        } else {
          player.loopCurrentSong = true;
          await interaction.editReply('🔂 Repeat: Song.');
        }

        break;
      }

      default: {
        await interaction.editReply('Unknown control.');
        break;
      }
    }

    try {
      if (interaction.message.editable) {
        if (player.getCurrent()) {
          await interaction.message.edit({
            embeds: [buildPlayingMessageEmbed(player)],
            components: [buildPlayerControls(player)],
          });
        } else {
          await interaction.message.edit({
            content: 'Playback stopped.',
            embeds: [],
            components: [],
          });
        }
      }
    } catch {}
  }
}
