const { REST, Routes } = require('discord.js');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`Logged in as ${client.user.tag}!`);

        const commands = [];
        client.commands.forEach(command => {
            commands.push(command.data.toJSON());
        });

        const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

        try {
            console.log(`Started refreshing ${commands.length} application (/) commands.`);

            await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: commands },
            );

            console.log(`Successfully reloaded application (/) commands.`);
        } catch (error) {
            console.error(error);
        }
    },
};
