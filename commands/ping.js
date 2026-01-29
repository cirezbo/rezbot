module.exports = {
    data: {
        name: 'ping',
        description: 'Replies with client uptime',
    },
    run: ({ interaction }) => {
        const uptime = interaction.client.uptime;

        const seconds = Math.floor((uptime / 1000) % 60);
        const minutes = Math.floor((uptime / (1000 * 60)) % 60);
        const hours = Math.floor((uptime / (1000 * 60 * 60)) % 24);
        const days = Math.floor(uptime / (1000 * 60 * 60 * 24));

        const pad = (num) => String(num).padStart(2, '0');
        
        const uptimeString = `${pad(days)}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;

        interaction.reply(`pong! 🏓\nRezbot uptime: ${uptimeString}`);
    }
}