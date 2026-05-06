const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits, AttachmentBuilder } = require('discord.js');
const path = require('path');

const cooldowns = new Set();
const userTickets = new Map();

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        try {
            if (interaction.isChatInputCommand()) {
                const command = interaction.client.commands.get(interaction.commandName);
                if (!command) return;

                try {
                    await command.execute(interaction);
                } catch (error) {
                    console.error('Command Execution Error:', error);
                    const response = { content: `❌ **Interaction Error:** ${error.message}`, flags: ['Ephemeral'] };
                    if (interaction.replied) await interaction.followUp(response).catch(console.error);
                    else if (interaction.deferred) await interaction.editReply(response).catch(console.error);
                    else await interaction.reply(response).catch(console.error);
                }
            } else if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_select') {
                const staffRoleId = process.env.STAFF_ROLE_ID;
                const categoryId = process.env.TICKET_CATEGORY_ID;

                await interaction.deferReply({ flags: ['Ephemeral'] }).catch(() => {});

                if (cooldowns.has(interaction.user.id)) {
                    return interaction.editReply({ content: 'Please wait before opening another ticket.' });
                }
                cooldowns.add(interaction.user.id);
                setTimeout(() => cooldowns.delete(interaction.user.id), 5000);

                if (userTickets.has(interaction.user.id)) {
                    return interaction.editReply({ content: 'You already have an open ticket.' });
                }

                const type = interaction.values[0];
                const categories = {
                    general: { prefix: 'general', label: 'General Info', msg: 'Please state your inquiry for General Info.' },
                    report: { prefix: 'report', label: 'Report User', msg: 'Please provide full documentation of the security breach or rule violation.' },
                    partner: { prefix: 'partnership', label: 'Partnership', msg: 'Submit your partnership proposal including all relevant links.' }
                };

                const config = categories[type] || categories.general;
                const channelName = `${config.prefix}-${interaction.user.username}`;
                const channelTopic = `🏢 BLACK SHADOW, INC. • ${config.label} Ticket • Authorized Representative: ${interaction.user.tag} (${interaction.user.id})`;

                try {
                    const channel = await interaction.guild.channels.create({
                        name: channelName,
                        type: ChannelType.GuildText,
                        parent: categoryId,
                        topic: channelTopic,
                        permissionOverwrites: [
                            { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                            { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
                            { id: staffRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
                            { id: interaction.client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageChannels] }
                        ]
                    });

                    userTickets.set(interaction.user.id, channel.id);

                    const logoPath = path.join(__dirname, '..', 'assets', 'logo.png');
                    const logoAttachment = new AttachmentBuilder(logoPath, { name: 'logo.png' });

                    const embed = new EmbedBuilder()
                        .setAuthor({ name: 'BLACK SHADOW, INC. • Internal Comms', iconURL: 'attachment://logo.png' })
                        .setTitle(`Department: ${config.label}`)
                        .setDescription(`Greetings, <@${interaction.user.id}>. You have reached the **${config.label}** department.\n\n> **Required Documentation:**\n> ${config.msg}`)
                        .addFields(
                            { name: '👤 Representative', value: `<@${interaction.user.id}>`, inline: true },
                            { name: '📂 Ticket Status', value: '`INITIALIZED`', inline: true }
                        )
                        .setThumbnail('attachment://logo.png')
                        .setColor('#000000')
                        .setFooter({ text: 'BLACK SHADOW, INC. • EST 2026' })
                        .setTimestamp();

                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder().setCustomId('claim_ticket').setLabel('🙋 Claim Case').setStyle(ButtonStyle.Success),
                            new ButtonBuilder().setCustomId('close_ticket').setLabel('🔒 Close Channel').setStyle(ButtonStyle.Secondary)
                        );

                    await channel.send({ content: `<@${interaction.user.id}> | <@&${staffRoleId}>`, embeds: [embed], components: [row], files: [logoAttachment] });
                    await interaction.editReply({ content: `Secure channel initialized: <#${channel.id}>` });

                } catch (error) {
                    console.error('Error creating ticket:', error);
                    await interaction.editReply({ content: `❌ **Initialization Error:** ${error.message}` });
                }
            } else if (interaction.isButton()) {
                const { customId } = interaction;

                if (customId === 'claim_ticket') {
                    await interaction.deferUpdate().catch(() => {});

                    if (!interaction.member.roles.cache.has(process.env.STAFF_ROLE_ID)) {
                        return interaction.followUp({ content: 'Access Denied: Staff only.', flags: ['Ephemeral'] });
                    }

                    try {
                        const oldEmbed = interaction.message.embeds[0];
                        if (!oldEmbed) return;

                        const newEmbed = EmbedBuilder.from(oldEmbed).setColor('#00FF00');
                        const fields = [...oldEmbed.fields];
                        const statusFieldIndex = fields.findIndex(f => f.name.includes('Status'));
                        if (statusFieldIndex !== -1) {
                            fields[statusFieldIndex] = { name: '📂 Ticket Status', value: '`ACTIVE - CLAIMED`', inline: true };
                        }
                        
                        newEmbed.setFields(fields);
                        newEmbed.addFields({ name: '🛠️ Assigned Agent', value: `<@${interaction.user.id}>`, inline: true });

                        const row = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder().setCustomId('claim_ticket').setLabel('✅ Claimed').setStyle(ButtonStyle.Success).setDisabled(true),
                                new ButtonBuilder().setCustomId('close_ticket').setLabel('🔒 Close Channel').setStyle(ButtonStyle.Secondary)
                            );

                        await interaction.editReply({ embeds: [newEmbed], components: [row] });
                        await interaction.followUp({ content: `📢 **Agent <@${interaction.user.id}>** has taken charge of this case.` });
                    } catch (error) {
                        console.error('Claim Error:', error);
                        await interaction.followUp({ content: `❌ **Claim Error:** ${error.message}`, flags: ['Ephemeral'] }).catch(() => {});
                    }
                } else if (customId === 'close_ticket') {
                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder().setCustomId('confirm_close').setLabel('Confirm Closure').setStyle(ButtonStyle.Danger),
                            new ButtonBuilder().setCustomId('cancel_close').setLabel('Abort').setStyle(ButtonStyle.Secondary)
                        );
                    
                    await interaction.reply({ content: '### ⚠️ Termination Confirmation\nConfirm channel closure?', components: [row] }).catch(console.error);
                } else if (customId === 'cancel_close') {
                    await interaction.message.delete().catch(() => {});
                } else if (customId === 'confirm_close') {
                    try {
                        await interaction.update({ content: '🔄 **Terminating connection...** Archiving in 5s.', components: [] });
                        
                        const logChannelId = process.env.LOG_CHANNEL_ID;
                        if (logChannelId) {
                            const logChannel = interaction.guild.channels.cache.get(logChannelId);
                            if (logChannel) {
                                const logEmbed = new EmbedBuilder()
                                    .setTitle('📂 Case Archived')
                                    .addFields(
                                        { name: '👤 Officer', value: `<@${interaction.user.id}>`, inline: true },
                                        { name: '🏷️ Case ID', value: `\`${interaction.channel.name}\``, inline: true }
                                    )
                                    .setTimestamp()
                                    .setColor('#000000');
                                
                                await logChannel.send({ embeds: [logEmbed] }).catch(console.error);
                            }
                        }

                        for (const [userId, channelId] of userTickets.entries()) {
                            if (channelId === interaction.channel.id) {
                                userTickets.delete(userId);
                                break;
                            }
                        }

                        setTimeout(() => {
                            interaction.channel.delete().catch(console.error);
                        }, 5000);
                    } catch (error) {
                        console.error('Close Error:', error);
                    }
                }
            }
        } catch (globalError) {
            console.error('Global Interaction Error:', globalError);
        }
    }
};
