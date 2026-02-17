const { EmbedBuilder } = require('discord.js');
const professions = require('../professions.json');
const emojis = require('../emojis.json');

module.exports = {
    name: 'status',
    execute(message, p, players) {
        const job = professions[p.job];
        const nextExp = Math.pow(p.level, 2) * 100;
        const progress = Math.min(Math.floor((p.exp / nextExp) * 10), 10);
        const bar = '▰'.repeat(progress) + '▱'.repeat(10 - progress);

        // 這裡我們把職業 Emoji 從字串中提取出 ID (假設格式是 <:name:ID>)
        // 如果想讓職業圖大一點，直接把圖片網址塞進 setThumbnail
        const jobIconUrl = `https://cdn.discordapp.com/emojis/${job.emoji.split(':')[2].replace('>', '')}.png`;

        const embed = new EmbedBuilder()
            .setColor(0x2F3136)
            .setTitle(`📜 ${message.author.username} 的個人檔案`)
            // 🌟 關鍵：將職業 Emoji 當成大縮圖放在右上角
            .setThumbnail(jobIconUrl) 
            .addFields(
                { name: '👤 冒險者職業', value: `**${job.name}**`, inline: true },
                { name: '⚔️ 當前等級', value: `**Lv. ${p.level}**`, inline: true },
                { name: '\u200B', value: '\u200B', inline: true }, // 空格佔位，保持整齊
                { name: `${emojis.stats.gold} 財富`, value: `\`${p.money || 0}\` 金幣`, inline: true },
                { name: `${emojis.stats.hp} 生命值`, value: `\`100 / 100\``, inline: true },
                { name: `${emojis.stats.energy} 精力`, value: `\`10 / 10\``, inline: true },
                { name: `${emojis.stats.exp} 成長進度`, value: `\`${bar}\` (${p.exp}/${nextExp})`, inline: false }
            )
            .setFooter({ text: `📅 冒險開始於 ${new Date().toLocaleDateString()}` });

        return message.reply({ embeds: [embed] });
    }
};