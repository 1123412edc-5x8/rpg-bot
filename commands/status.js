const { EmbedBuilder } = require('discord.js');
const professions = require('../professions.json');
const emojis = require('../emojis.json');

module.exports = {
    name: 'status',
    async execute(message, p, players) {
        const job = professions[p.job] || { name: "無職業", emoji: "❓", desc: "尚未就職" };
        const nextExp = Math.pow(p.level, 2) * 100;
        
        const progress = Math.min(Math.floor((p.exp / nextExp) * 10), 10);
        const bar = '▰'.repeat(progress) + '▱'.repeat(10 - progress);

        let jobIconUrl = "";
        if (job.emoji && job.emoji.includes(':')) {
            const jobIconId = job.emoji.split(':')[2].replace('>', '');
            jobIconUrl = `https://cdn.discordapp.com/emojis/${jobIconId}.png`;
        }

        const embed = new EmbedBuilder()
            .setColor(0x2F3136)
            .setAuthor({ name: `📜 ${message.author.username} 的個人檔案`, iconURL: message.author.displayAvatarURL() })
            .setThumbnail(jobIconUrl)
            .setDescription(
                `# ${job.emoji} **${job.name}**\n` +
                `> **當前等級 » \`LV. ${p.level}\`**\n` +
                `**━━━━━━━━━━━━━━**\n\n` +
                `## ${emojis.stats.hp} **角色狀態**\n` +
                `> **生命值：\`100 / 100\`**\n` +
                `> **精力值：\`10 / 10\`**\n\n` +
                `## ${emojis.stats.gold} **資產資訊**\n` +
                `> **持有金幣：\`${p.money || 0}\` 金**\n\n` +
                `## ${emojis.stats.exp} **成長進度**\n` +
                `> **\`${bar}\` (${p.exp}/${nextExp})**\n` +
                `**━━━━━━━━━━━━━━**`
            )
            .setFooter({ text: '💡 提示：使用 ~explore 開始冒險' })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }
};
