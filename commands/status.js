const { getStreamers, getChannel } = require('../db');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  data: {
    name: 'status',
    description: 'Show Twitch settings for this server',
  },
  run: async ({ interaction }) => {
    const guildId = interaction.guildId;
    const streamers = getStreamers(guildId);
    const channelId = getChannel(guildId);

    const embed = new EmbedBuilder()
      .setTitle('Twitch Notifications')
      .setColor(0x9146FF) // Twitch purple color
      .addFields(
        {
          name: '📺 Monitored Streamers',
          value: streamers.length === 0
            ? '*None*'
            : streamers.map(s => `• ${s.twitch_username}`).join('\n'),
          inline: false,
        },
        {
          name: '📣 Notification Channel',
          value: channelId ? `<#${channelId}>` : '*Not Set*',
          inline: false,
        }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
