const { setNotifyChannel } = require('../db');
const { PermissionsBitField } = require('discord.js');

module.exports = {
  data: {
    name: 'set-channel',
    description: 'Set this channel for Twitch live notifications',
    default_member_permissions: '0x00000008', // 👈 Only admins can see
  },
  run: async ({ interaction }) => {
    const guildId = interaction.guildId;
    const channelId = interaction.channelId;

    if (!interaction.member.permissions.has('Administrator')) {
        return interaction.reply({
            content: '❌ You need **Administrator** permission to use this command.',
            flags: 1 << 6
        });
    }

    setNotifyChannel(guildId, channelId);
    await interaction.reply(`✅ Notification channel set to <#${channelId}>`);
  }
};
