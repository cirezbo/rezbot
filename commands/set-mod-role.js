const { PermissionFlagsBits } = require('discord.js');
const { setModRole } = require('../db');

module.exports = {
    data: {
        name: 'set-mod-role',
        description: 'Set the moderator role for this server',
        options: [
            {
                name: 'role',
                type: 8, // Role type
                description: 'The role to assign mod permissions to',
                required: true
            }
        ],
        default_member_permissions: '0x00000008', // 🚫 Only visible to admins
    },
    run: async ({ interaction }) => {
        if (!interaction.member.permissions.has('Administrator')) {
        return interaction.reply({
            content: '❌ You need **Administrator** permission to use this command.',
            flags: 1 << 6
        });
    }

        const role = interaction.options.getRole('role');
        const guildId = interaction.guildId;

        const { setModRole } = require('../db');
        setModRole(guildId, role.id);

        await interaction.reply(`✅ Set **${role.name}** as the moderator role.`);
    }
};
