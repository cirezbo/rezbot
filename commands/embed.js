// commands/embed.js
const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: {
    name: 'embed',
    description: 'Send a custom embedded message',
    default_member_permissions: '0x00000008', // Admin only
    options: [
      {
        name: 'title',
        description: 'The embed title',
        type: 3,
        required: false,
      },
      {
        name: 'description',
        description: 'The embed description',
        type: 3,
        required: false,
      },
      {
        name: 'color',
        description: 'Hex color (e.g. #0099ff)',
        type: 3,
        required: false,
      },
      {
        name: 'image',
        description: 'Image URL',
        type: 3,
        required: false,
      },
      {
        name: 'thumbnail',
        description: 'Thumbnail URL',
        type: 3,
        required: false,
      },
      {
        name: 'footer',
        description: 'Footer text',
        type: 3,
        required: false,
      },
    ],
  },

  run: async ({ interaction }) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({
        content: ' ^}^l You need **Administrator** permission to use this command.',
        flags: 1 << 6, // Ephemeral reply
      });
    }

    // Get all inputs
    const titleRaw = interaction.options.getString('title');
    const descriptionRaw = interaction.options.getString('description');
    const footerRaw = interaction.options.getString('footer');
    const color = interaction.options.getString('color') || '#00b0f4';
    const image = interaction.options.getString('image');
    const thumbnail = interaction.options.getString('thumbnail');

    // Convert literal \n to actual new lines
    const title = titleRaw?.replace(/\\n/g, '\n');
    const description = descriptionRaw?.replace(/\\n/g, '\n');
    const footer = footerRaw?.replace(/\\n/g, '\n');

    // Build the embed
    const embed = new EmbedBuilder();

    if (title) embed.setTitle(title);
    if (description) embed.setDescription(description);
    if (color) embed.setColor(color.replace('#', ''));
    if (image) embed.setImage(image);
    if (thumbnail) embed.setThumbnail(thumbnail);
    if (footer) embed.setFooter({ text: footer });

    await interaction.reply({ embeds: [embed] });
  },
};
