const { addStreamer, getStreamers } = require('../db');
const fetch = require('node-fetch');
const { getAccessToken } = require('../twitch/twitchAuth');

module.exports = {
  data: {
    name: 'add-streamer',
    description: 'Add a Twitch streamer to monitor',
    options: [
      {
        name: 'username',
        type: 3,
        description: 'Twitch username to add',
        required: true,
      },
    ],
  },

  run: async ({ interaction }) => {
    const username = interaction.options.getString('username').toLowerCase();

    const clientId = process.env.TWITCH_CLIENT_ID;
    if (!clientId) {
      return interaction.reply({
        content: '⚠️ Twitch Client ID not configured.',
        flags: 1 << 6,
      });
    }

    const guildId = interaction.guildId;
    const currentStreamers = getStreamers(guildId).map(s => s.twitch_username.toLowerCase());
    if (currentStreamers.includes(username)) {
      return interaction.reply({
        content: `⚠️ Streamer \`${username}\` is already being monitored.`,
        flags: 1 << 6,
      });
    }

    try {
      const token = await getAccessToken();

      const res = await fetch(`https://api.twitch.tv/helix/users?login=${username}`, {
        headers: {
          'Client-ID': clientId,
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error(`Twitch API error: ${res.status} ${res.statusText}`);
        return interaction.reply({
          content: '⚠️ Failed to validate Twitch username due to API error.',
          flags: 1 << 6,
        });
      }

      const data = await res.json();

      if (!data.data || data.data.length === 0) {
        return interaction.reply({
          content: `❌ Twitch user \`${username}\` does not exist.`,
          flags: 1 << 6,
        });
      }

      addStreamer(guildId, username);
      return interaction.reply(`✅ Added Twitch streamer \`${username}\` for monitoring.`);
    } catch (error) {
      console.error('Fetch error:', error);
      return interaction.reply({
        content: '⚠️ An error occurred while checking Twitch username.',
        flags: 1 << 6,
      });
    }
  },
};
