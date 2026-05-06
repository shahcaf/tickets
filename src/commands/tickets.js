const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, PermissionFlagsBits, AttachmentBuilder } = require('discord.js');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tickets')
        .setDescription('Sends the ticket panel to the designated channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction) {
        if (interaction.channelId !== process.env.PANEL_CHANNEL_ID) {
            return interaction.reply({ 
                content: `This command can only be used in <#${process.env.PANEL_CHANNEL_ID}>.`, 
                flags: ['Ephemeral'] 
            });
        }

        await interaction.deferReply({ flags: ['Ephemeral'] });

        // Relative path to the assets directory
        const logoPath = path.join(__dirname, '..', 'assets', 'logo.png');
        const logoAttachment = new AttachmentBuilder(logoPath, { name: 'logo.png' });

        const embed = new EmbedBuilder()
            .setAuthor({ name: 'BLACK SHADOW, INC. • OFFICIAL SUPPORT', iconURL: 'attachment://logo.png' })
            .setTitle('🏛️ Corporate Support Department')
            .setDescription('Welcome to the **Black Shadow, Inc.** official support portal. Please select your inquiry department below to initiate a secure communication channel.\n\n> **Inquiry Protocols:**\n> 1. Select your category from the dropdown menu.\n> 2. A private secure channel will be initialized for you.\n> 3. Provide all requested documentation once the channel is ready.')
            .addFields(
                { name: '📘 General Info', value: 'General corporate inquiries and information.', inline: true },
                { name: '🚨 Report User', value: 'Report rule violations or security issues.', inline: true },
                { name: '🤝 Partnership', value: 'Explore partnership and alliance opportunities.', inline: true }
            )
            .setImage('attachment://logo.png')
            .setColor('#000000')
            .setFooter({ text: 'BLACK SHADOW, INC. • EST 2026', iconURL: 'attachment://logo.png' })
            .setTimestamp();

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('ticket_select')
            .setPlaceholder('Initiate Department Contact...')
            .addOptions(
                new StringSelectMenuOptionBuilder().setLabel('General Info').setValue('general').setEmoji('📘'),
                new StringSelectMenuOptionBuilder().setLabel('Report User').setValue('report').setEmoji('🚨'),
                new StringSelectMenuOptionBuilder().setLabel('Partnership').setValue('partner').setEmoji('🤝')
            );

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.channel.send({ embeds: [embed], components: [row], files: [logoAttachment] });
        await interaction.editReply({ content: 'Corporate Support Panel has been successfully updated and deployed.' });
    },
};
