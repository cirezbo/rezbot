const { PermissionsBitField } = require('discord.js');
const { setWelcomeChannel } = require('../db');

module.exports = {
  data: {
    name: 'setwelcome',
    description: 'Set the channel where welcome messages will be sent (Admin only)',
    options: [
      {
        name: 'channel',
        description: 'The channel to send welcome messages in',
        type: 7, // CHANNEL
        required: true,
      },
    ],
  },

  run: async ({ interaction }) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({
        content: '🚫 You do not have permission to use this command.',
        ephemeral: true,
      });
    }

    const channel = interaction.options.getChannel('channel');
    setWelcomeChannel(interaction.guild.id, channel.id);

    await interaction.reply({
      content: `Welcome channel set to <#${channel.id}>`,
      ephemeral: true,
    });
  }
};
