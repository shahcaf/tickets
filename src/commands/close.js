const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('close')
        .setDescription('Initiates the closure of the current ticket')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    
    async execute(interaction) {
        if (interaction.channel.parentId !== process.env.TICKET_CATEGORY_ID) {
            return interaction.reply({ content: 'This command can only be used inside a ticket channel.', flags: ['Ephemeral'] });
        }

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId('confirm_close').setLabel('Confirm Closure').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('cancel_close').setLabel('Abort').setStyle(ButtonStyle.Secondary)
            );
        
        await interaction.reply({ content: '### ⚠️ Termination Confirmation\nConfirm channel closure and archival via command protocol?', components: [row] });
    },
};
