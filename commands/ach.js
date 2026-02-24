const { EmbedBuilder } = require('discord.js');
const achievements = require('../achievements.json');

module.exports = {
    name: 'ach',
    async execute(message, p) {
        if (!p.achievements) p.achievements = [];

        let list = "";
        for (const [key, data] of Object.entries(achievements)) {
            const isUnlocked = p.achievements.includes(key);
            list += `### ${isUnlocked ? "✅" : "🔒"} **${data.name}**\n`;
            list += `> *${data.desc}*\n`;
            if (isUnlocked) list += `> **獎勵：\`${data.reward}\`**\n`;
            list += `\n`;
        }

        const embed = new EmbedBuilder()
            .setColor(0xFFA500)
            .setTitle(`🏆 | ${message.author.username} 的成就清單`)
            .setDescription(
                `# 🎖️ **榮譽勳章**\n` +
                `> **目前已達成：\`${p.achievements.length} / ${Object.keys(achievements).length}\`**\n` +
                `**━━━━━━━━━━━━━━**\n\n` +
                list +
                `**━━━━━━━━━━━━━━**`
            );

        await message.reply({ embeds: [embed] });
    }
};
