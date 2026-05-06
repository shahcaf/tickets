const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('credit')
        .setDescription('Displays information about the system architecture and developers'),
    
    async execute(interaction) {
        const logoPath = path.join('C:\\Users\\SHACHAF\\.gemini\\antigravity\\brain\\333e3d6d-6a0a-4320-add4-471728fb69bd\\media__1778042171902.png');
        const logoAttachment = new AttachmentBuilder(logoPath, { name: 'logo.png' });

        const embed = new EmbedBuilder()
            .setAuthor({ name: 'BLACK SHADOW, INC. • SYSTEM INFORMATION', iconURL: 'attachment://logo.png' })
            .setTitle('🏛️ Project Intelligence')
            .setDescription('This automated ticket management infrastructure is a proprietary system engineered for **Black Shadow, Inc.** It provides high-performance interaction handling and secure communication protocols.')
            .addFields(
                { name: '👤 System Architect', value: '<@1496146117526687755>', inline: true },
                { name: '🛠️ Framework', value: 'Discord.js v14', inline: true },
                { name: '⚙️ Environment', value: 'Node.js LTS', inline: true }
            )
            .setThumbnail('attachment://logo.png')
            .setColor('#000000')
            .setFooter({ text: 'BLACK SHADOW, INC. • EXCELLENCE IN AUTOMATION', iconURL: 'attachment://logo.png' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], files: [logoAttachment] });
    },
};
