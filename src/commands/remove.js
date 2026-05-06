const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Removes a user from the current ticket channel')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to remove from this ticket')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        
        if (interaction.channel.parentId !== process.env.TICKET_CATEGORY_ID) {
            return interaction.reply({ content: 'This command can only be used inside a ticket channel.', flags: ['Ephemeral'] });
        }

        try {
            await interaction.channel.permissionOverwrites.delete(user.id);
            await interaction.reply({ content: `❌ <@${user.id}> has been removed from the ticket.` });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to remove user. Please check my permissions.', flags: ['Ephemeral'] });
        }
    },
};
