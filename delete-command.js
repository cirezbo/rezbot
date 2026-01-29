const { REST, Routes } = require('discord.js');
require('dotenv').config();

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: [] } // Clears all commands for this guild
    );
    console.log('All guild commands cleared');
  } catch (error) {
    console.error('Error deleting commands:', error);
  }
})();
