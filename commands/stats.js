const { EmbedBuilder } = require('discord.js');
const playerCalc = require('../utils/playerCalc.js');
const professions = require('../professions.json'); // 引入你的職業清單

module.exports = {
    name: 'stats',
    aliases: ['st', '狀態', '屬性'],
    async execute(message, args, p) {
        // 1. 取得計算後的最終數值
        const stats = playerCalc.getStats(p);
        
        // 2. 處理職業名稱 (防呆：如果 p.job 沒對應到 json 則顯示冒險者)
        const jobInfo = professions[p.job] || { name: "新進冒險者", emoji: "⚔️" };
        const jobDisplay = `${jobInfo.emoji} ${jobInfo.name}`;

        // 3. 製作 HP 血條 (視覺化)
        const hpBarStr = (current, max) => {
            const size = 10;
            const progress = Math.max(0, Math.min(size, Math.floor((current / max) * size)));
            return "🟩".repeat(progress) + "⬛".repeat(size - progress);
        };
        const hpBar = hpBarStr(p.hp || 0, stats.maxHp || 100);
        
        // 4. 計算綜合戰力 (確保數值不為 NaN)
        const atk = stats.atk || 0;
        const def = stats.def || 0;
        const maxHp = stats.maxHp || 100;
        const powerScore = Math.floor(atk + def + (maxHp / 10));

        // 5. 製作專業 Embed (視覺強化版)
        const statsEmbed = new EmbedBuilder()
            .setColor(0xFFA500) // 換成橘金色，等級感更強
            .setTitle(`👤 **${message.author.username}** 的冒險者檔案`)
            .setThumbnail(message.author.displayAvatarURL())
            .addFields(
                // 第一行：等級、職業、戰力 (最核心資訊)
                { name: '🔰 等級', value: `**Lv.${p.level || 1}**`, inline: true },
                { name: '⚔️ 職業', value: `**${jobDisplay}**`, inline: true },
                { name: '🏆 戰力', value: `⚡ **${powerScore.toLocaleString()}**`, inline: true }
            )
            .addFields(
                { name: '📊 經驗進度', value: `\`${p.exp || 0} / ${(p.level || 1) * 100}\` EXP`, inline: false },
                { name: '❤️ 生命值狀態', value: `${hpBar}\n**${p.hp || 0} / ${maxHp}**`, inline: false }
            )
            .addFields(
                // 第二行：基礎屬性
                { name: '🗡️ 攻擊力', value: `**${atk}**`, inline: true },
                { name: '🛡️ 防禦力', value: `**${def}**`, inline: true },
                { name: '💰 金幣', value: `**$${(p.money || 0).toLocaleString()}**`, inline: true }
            )
            .addFields(
                { 
                    name: '🛡️ 當前武裝', 
                    value: `> 🗡️ **武器**: ${p.equipment?.weapon?.name || "無"}\n> 👕 **護甲**: ${p.equipment?.armor?.name || "無"}\n> 🎓 **頭盔**: ${p.equipment?.head?.name || "無"}\n> 👞 **靴子**: ${p.equipment?.boots?.name || "無"}`,
                    inline: false 
                }
            )
            .setFooter({ text: '提示：等級越高，能挑戰的副本就越深！' })
            .setTimestamp()
        }
    };