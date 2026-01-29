const { EmbedBuilder } = require('discord.js');
const { getAllConfigs } = require('../db');
const { getAccessToken } = require('./twitchAuth');

const liveStatus = {}; // track live status of streamers

// Fetch Twitch stream data for a given username
async function getStreamData(username) {
  const token = await getAccessToken();

  const res = await fetch(`https://api.twitch.tv/helix/streams?user_login=${username}`, {
    headers: {
      'Client-ID': process.env.TWITCH_CLIENT_ID,
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) return null;

  const data = await res.json();
  if (data.data && data.data.length > 0) return data.data[0];
  return null;
}

// Fetch Twitch user data (for profile image)
async function getUserData(username) {
  const token = await getAccessToken();

  const res = await fetch(`https://api.twitch.tv/helix/users?login=${username}`, {
    headers: {
      'Client-ID': process.env.TWITCH_CLIENT_ID,
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) return null;

  const data = await res.json();
  if (data.data && data.data.length > 0) return data.data[0];
  return null;
}


// Main function to check live status and send notifications
async function checkTwitchLive(client) {
  const configs = getAllConfigs(); // [{ guild_id, notify_channel_id, streamers: [] }, ...]

  for (const config of configs) {
    const guildId = config.guild_id;           // <<< NEW: get guild ID
    if (!liveStatus[guildId]) liveStatus[guildId] = {}; // <<< NEW: initialize per-guild status
   
    const channel = await client.channels.fetch(config.notify_channel_id).catch(() => null);
    if (!channel || !channel.isTextBased()) continue;

    for (const username of config.streamers) {
      const lowerUsername = username.toLowerCase();

      let streamData;
      try {
        streamData = await getStreamData(lowerUsername);
      } catch {
        continue; // skip streamer if fetch fails
      }

      const currentlyLive = !!streamData;

      // Only send notification if streamer just went live
      if (currentlyLive && !liveStatus[guildId][lowerUsername]) {
        const userData = await getUserData(lowerUsername); // get profile image
        const streamUrl = `https://twitch.tv/${lowerUsername}`;

        const thumbnailUrl = streamData.thumbnail_url
	 ? streamData.thumbnail_url
	  .replace("{width}", "1280")
	  .replace("{height}", "720")
	  + `?id=${streamData.id}`
	 : null;

        const embed = new EmbedBuilder()
          .setColor(0x9146FF) // Twitch purple
          .setAuthor({
            name: `${streamData.user_name} is now live on Twitch!`,
            iconURL: userData?.profile_image_url || undefined
          })
          .setDescription(`[${streamData.title}](${streamUrl})`) // clickable stream title
          .addFields(
            { name: 'Game', value: streamData.game_name || 'Unknown', inline: true },
            { name: 'Viewers', value: String(streamData.viewer_count || 0), inline: true }
          )
	  .setFooter({ text: `rezbot` })
	  .setTimestamp();

	  if (thumbnailUrl) {
            embed.setImage(thumbnailUrl);
	  } // 720p thumbnail

       // Send with @everyone ping
        channel.send({ content: '@everyone', embeds: [embed] }).catch(() => {});
      }

      liveStatus[guildId][lowerUsername] = currentlyLive;
    } 
  }
}

module.exports = { checkTwitchLive };
