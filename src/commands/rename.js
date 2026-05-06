const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rename')
        .setDescription('Renames the current ticket channel')
        .addStringOption(option => 
            option.setName('name')
                .setDescription('The new name for this channel')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    
    async execute(interaction) {
        const newName = interaction.options.getString('name');
        
        if (interaction.channel.parentId !== process.env.TICKET_CATEGORY_ID) {
            return interaction.reply({ content: 'This command can only be used inside a ticket channel.', flags: ['Ephemeral'] });
        }

        try {
            const oldName = interaction.channel.name;
            await interaction.channel.setName(newName);
            await interaction.reply({ content: `✅ Channel renamed from \`${oldName}\` to \`${newName}\`.` });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to rename channel. Rate limits might apply.', flags: ['Ephemeral'] });
        }
    },
};
