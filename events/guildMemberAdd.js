// events/guildMemberAdd.js
const { getWelcomeChannel } = require('../db');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'guildMemberAdd',

  async execute(member) {
    try {
      const channelId = getWelcomeChannel(member.guild.id);
      if (!channelId) {
        console.log(`No welcome channel set in DB for guild ${member.guild.id}`);
        return;
      }

      const channel = member.guild.channels.cache.get(channelId);
      if (!channel || !channel.isTextBased()) {
        console.log(`Welcome channel not found or not text-based in guild ${member.guild.id}`);
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle('Welcome!')
        .setDescription(`Welcome <@${member.id}> to **${member.guild.name}**!`)
        .setColor(0x00AE86)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }));

      await channel.send({ embeds: [embed] });

    } catch (err) {
      console.error(`Error in guildMemberAdd event for guild ${member.guild.id}:`, err);
    }
  }
};
