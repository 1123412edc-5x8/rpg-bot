const { EmbedBuilder } = require('discord.js');
const professions = require('../professions.json');
const emojis = require('../emojis.json');

module.exports = {
    name: 'status',
    // 這裡補上第三個參數 players，維持跟 index.js 的呼叫一致
    execute(message, p, players) {
        const job = professions[p.job];
        
        // 計算經驗值
        const nextExp = Math.pow(p.level, 2) * 100;
        // 使用 Math.min 確保進度條最長就是 10 格，不會因為經驗溢出而變形
        const progress = Math.min(Math.floor((p.exp / nextExp) * 10), 10);
        const bar = '▰'.repeat(progress) + '▱'.repeat(10 - progress);

        const embed = new EmbedBuilder()
            .setColor(0x2F3136)
            .setTitle(`📜 ${message.author.username} 的冒險者檔案`)
            .setThumbnail(message.author.displayAvatarURL())
            .addFields(
                // 這裡會自動抓取你 professions.json 裡的自製職業 Emoji
                { name: '👤 職業', value: `${job.emoji} **${job.name}**`, inline: true },
                { name: '⚔️ 等級', value: `**Lv. ${p.level}**`, inline: true },
                { name: `${emojis.stats.gold} 金幣`, value: `\`${p.money || 0}\``, inline: true },
                { name: `${emojis.stats.exp} 經驗值 進度`, value: `\`${bar}\` (${p.exp}/${nextExp})`, inline: false },
                { name: `${emojis.stats.hp} 狀態`, value: `HP: 100/100 | ${emojis.stats.energy} Energy: 10/10`, inline: false }
            )
            .setFooter({ text: '💡 指令提示：~explore 探索 | ~backpack 背包' })
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    }
};