const { EmbedBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const { setVerificationSettings } = require('../db');

module.exports = {
  data: {
    name: 'verifysetup',
    description: 'Set up the verification message in #rules (Admin only)',
    options: [
      {
        name: 'role',
        type: 8, // Role type
        description: 'The role to assign on verification',
        required: true,
      },
    ],
  },

  run: async ({ interaction }) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({
        content: '❌ You do not have permission to use this command.',
        flags: 1 << 6, // ephemeral
      });
    }

    const guild = interaction.guild;
    const role = interaction.options.getRole('role');
    if (!role) {
      return interaction.reply({ content: '❌ Invalid role.', flags: 1 << 6 });
    }

    const channel = guild.channels.cache.find(
      (ch) => ch.name === 'rules' && ch.type === ChannelType.GuildText
    );

    if (!channel) {
      return interaction.reply({ content: '❌ Could not find a #rules text channel.', flags: 1 << 6 });
    }

    const embed = new EmbedBuilder()
      .setTitle('Verify to Access the Server')
      .setDescription(`Please read the rules above and react with ✅ to verify.`)
      .setColor(0x9146FF);

    // Send the embed
    const message = await channel.send({ embeds: [embed] });
    await message.react('✅');

    // Save verification data per guild
    await setVerificationSettings(guild.id, channel.id, message.id, role.id);

    await interaction.reply({
      content: `✅ Verification message sent in <#${channel.id}> and role set to ${role.name}.`,
      flags: 1 << 6, // ephemeral
    });
  },
};
