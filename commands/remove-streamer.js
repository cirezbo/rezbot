const { removeStreamer, getStreamers } = require('../db');

module.exports = {
  data: {
    name: 'remove-streamer',
    description: 'Remove a monitored Twitch streamer',
    options: [
      {
        name: 'username',
        description: 'Twitch username',
        type: 3, // STRING
        required: true,
      },
    ],
  },
  run: async ({ interaction }) => {
    const username = interaction.options.getString('username').toLowerCase();
    const guildId = interaction.guildId;

    // Get current streamers monitored for this guild
    const streamers = getStreamers(guildId).map(s => s.twitch_username.toLowerCase());

    // Check if username is monitored
    if (!streamers.includes(username)) {
      return await interaction.reply({ content: `⚠️ ${username} is not being monitored.`, ephemeral: true });
    }

    // Remove streamer
    removeStreamer(guildId, username);

    // Confirm removal
    await interaction.reply({ content: `✅ Removed **${username}** from monitoring.` });
  }
};
