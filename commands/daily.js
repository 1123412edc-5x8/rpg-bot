const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'daily',
    async execute(message, p, players) {
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        
        // 檢查冷卻時間
        if (p.last_daily && now - p.last_daily < oneDay) {
            const remaining = oneDay - (now - p.last_daily);
            const hours = Math.floor(remaining / (60 * 60 * 1000));
            const mins = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
            return message.reply(`❌ **你今天領過獎勵了！** 請在 \`${hours}小時${mins}分\` 後再回來。`);
        }

        // 隨機獎勵
        const rewardMoney = 1000 + Math.floor(Math.random() * 1000);
        const rewardExp = 200;

        p.money = (p.money || 0) + rewardMoney;
        p.exp = (p.exp || 0) + rewardExp;
        p.last_daily = now;

        players[message.author.id] = p;
        fs.writeFileSync('./players.json', JSON.stringify(players, null, 2));

        const embed = new EmbedBuilder()
            .setColor(0xFFD700)
            .setTitle("📅 | 每日簽到成功")
            .setDescription(
                `# 🎁 **每日補給已送達**\n` +
                `> **這是一些探險物資，拿去好好利用吧！**\n` +
                `**━━━━━━━━━━━━━━**\n\n` +
                `## 💰 獲得金額 » \`+ ${rewardMoney}\` 金\n` +
                `## ✨ 獲得經驗 » \`+ ${rewardExp}\` EXP\n\n` +
                `**━━━━━━━━━━━━━━**\n` +
                `**💡 提示：明天再來領取更多驚喜！**`
            );

        await message.reply({ embeds: [embed] });
    }
};
