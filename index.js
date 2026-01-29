require('dotenv/config');
const { Client, IntentBitField, IntentsBitField } = require('discord.js');
const { CommandHandler } = require('djs-commander');
const path = require('path');
const { checkTwitchLive } = require('./twitch/liveChecker');
const fs = require('fs');
const { getVerificationSettings } = require('./db');

const client = new Client ({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMessageReactions, // for reaction events
    ],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'], // required for reaction events on uncached messages
});

new CommandHandler({
    client,
    eventsPath: path.join(__dirname, 'events'),
    commandsPath: path.join(__dirname, 'commands'),
    deleteUnused: true,
})

const eventsPath = path.join(__dirname, 'events');
fs.readdirSync(eventsPath).forEach(file => {
  const event = require(path.join(eventsPath, file));
  if (event.name && typeof event.execute === 'function') {
    client.on(event.name, (...args) => event.execute(...args));
    console.log(`✅ Loaded event: ${event.name}`);
  }
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);

    checkTwitchLive(client);

    setInterval(() => checkTwitchLive(client), 60 * 1000);


    client.guilds.cache.forEach(async (guild) => {
    const settings = getVerificationSettings(guild.id);
    if (!settings) return;

    try {
      const channel = await guild.channels.fetch(settings.verification_channel_id);
      if (!channel || !channel.isTextBased()) return;

      await channel.messages.fetch(settings.verification_message_id);
    } catch {
      // Silent fail, e.g. if message was deleted or inaccessible
    }
  });
});

client.login(process.env.DISCORD_CLIENT_TOKEN);
