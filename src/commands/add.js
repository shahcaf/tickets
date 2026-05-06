const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add')
        .setDescription('Adds a user to the current ticket channel')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to add to this ticket')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        
        // Ensure this is a ticket channel (we can check if it has a parent in the ticket category)
        if (interaction.channel.parentId !== process.env.TICKET_CATEGORY_ID) {
            return interaction.reply({ content: 'This command can only be used inside a ticket channel.', flags: ['Ephemeral'] });
        }

        try {
            await interaction.channel.permissionOverwrites.edit(user.id, {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true
            });

            await interaction.reply({ content: `✅ <@${user.id}> has been added to the ticket.` });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to add user to the channel. Please check my permissions.', flags: ['Ephemeral'] });
        }
    },
};
