const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'cook',
    async execute(message, p, players) {
        if (p.job !== 'chef') return message.reply("❌ **權限不足：** 只有「靈魂廚師」能進行烹飪。");
        
        if ((p.money || 0) < 800) return message.reply("❌ **食材不足：** 準備一桌靈魂饗宴需要 800 金幣。");

        p.money -= 800;
        const maxE = 10 + (Math.floor(p.level / 5) * 2);
        
        // 廚師特權：體力可以直接加到上限 + 5 (爆氣狀態)
        p.energy = (p.energy || 0) + 8;
        
        players[message.author.id] = p;
        fs.writeFileSync('./players.json', JSON.stringify(players, null, 2));

        const embed = new EmbedBuilder()
            .setColor(0xff7f50)
            .setTitle(`🍳 | 職業技能：靈魂烹飪`)
            .setDescription(
                `# 🍱 **獲得：靈魂便當**\n` +
                `> **香氣撲鼻！你感覺全身充滿了力量。**\n` +
                `**━━━━━━━━━━━━━━**\n\n` +
                `## 🥣 烹飪效果\n` +
                `> **精力恢復 » \`+ 8\` 點**\n` +
                `> **當前狀態 » \`${p.energy} / ${maxE}\`**\n\n` +
                `**💡 提示：廚師的料理可以讓體力暫時超越上限！**`
            );

        await message.reply({ embeds: [embed] });
    }
};
