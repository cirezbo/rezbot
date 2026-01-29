const { getVerificationSettings } = require('../db');

module.exports = {
  name: 'messageReactionAdd',

  async execute(reaction, user) {
    if (user.bot) return;

    // Always fetch partials (reaction + message)
    try {
      if (reaction.partial) await reaction.fetch();
      if (reaction.message.partial) await reaction.message.fetch();
    } catch {
      return; // Fail silently if we can’t fetch the reaction/message
    }

    const guild = reaction.message.guild;
    if (!guild) return;

    const settings = getVerificationSettings(guild.id);
    if (!settings) return;

    const {
      verification_channel_id,
      verification_message_id,
      member_role_id,
    } = settings;

    // ✅ Strict check for exact message & channel
    const isVerificationMessage =
      reaction.message.id === verification_message_id &&
      reaction.message.channel.id === verification_channel_id;

    if (!isVerificationMessage) return;

    // ✅ Emoji check using Unicode (to avoid editor issues)
    if (reaction.emoji.name !== '\u2705') return;

    try {
      const member = await guild.members.fetch(user.id);
      if (!member.roles.cache.has(member_role_id)) {
        await member.roles.add(member_role_id);
      }
    } catch {
      return; // silently fail
    }
  },
};
