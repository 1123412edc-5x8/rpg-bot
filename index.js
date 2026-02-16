const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once('ready', () => {
    console.log(`⚔️  RPG 系統連線成功！當前機器人：${client.user.tag}`);
    });

    client.on('messageCreate', async message => {
        if (message.author.bot) return;

            if (message.content === '!status') {
                    const statusEmbed = new EmbedBuilder()
                                .setColor(0xFFD700)
                                            .setTitle(`📜 ${message.author.username} 的冒險者日誌`)
                                                        .addFields(
                                                                        { name: '目前職業', value: '尚未轉職', inline: true },
                                                                                        { name: '冒險等級', value: 'Lv. 1', inline: true },
                                                                                                        { name: '生命力', value: '❤️ 100/100', inline: false }
                                                                                                                    )
                                                                                                                                .setFooter({ text: '輸入 !start 開始你的冒險' });

                                                                                                                                        message.reply({ embeds: [statusEmbed] });
                                                                                                                                            }
                                                                                                                                            });

                                                                                                                                            client.login(process.env.DISCORD_TOKEN);