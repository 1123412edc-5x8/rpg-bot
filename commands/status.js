const { EmbedBuilder } = require('discord.js');
const professions = require('../professions.json');
const emojis = require('../emojis.json'); // 引入你的自製 Emoji 表

module.exports = {
    name: 'status',
        execute(message, p) {
                const job = professions[p.job];
                        
                                // 製作漂亮的經驗條 (使用你上傳的 EXP Emoji 作為開頭)
                                        const nextExp = Math.pow(p.level, 2) * 100;
                                                const progress = Math.floor((p.exp / nextExp) * 10);
                                                        const bar = '▰'.repeat(progress) + '▱'.repeat(10 - progress);

                                                                const embed = new EmbedBuilder()
                                                                            .setColor(0x2F3136)
                                                                                        .setTitle(`📜 ${message.author.username} 的冒險者檔案`)
                                                                                                    .setThumbnail(message.author.displayAvatarURL())
                                                                                                                .addFields(
                                                                                                                                { name: '👤 職業', value: `${job.emoji} **${job.name}**`, inline: true },
                                                                                                                                                { name: '⚔️ 等級', value: `**Lv. ${p.level}**`, inline: true },
                                                                                                                                                                { name: `${emojis.stats.gold} 金幣`, value: `\`${p.money || 0}\``, inline: true },
                                                                                                                                                                                { name: `${emojis.stats.exp} 經驗值 進度`, value: `\`${bar}\` (${p.exp}/${nextExp})`, inline: false },
                                                                                                                                                                                                { name: `${emojis.stats.hp} 狀態`, value: `HP: 100/100 | ${emojis.stats.energy} Energy: 10/10`, inline: false }
                                                                                                                                                                                                            )
                                                                                                                                                                                                                        .setFooter({ text: '輸入 ~explore 前往遺蹟深處' });

                                                                                                                                                                                                                                return message.reply({ embeds: [embed] });
                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                    };