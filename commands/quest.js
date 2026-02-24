const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'quest',
    async execute(message, p, players) {
        // 隨機生成三個每日任務
        const quests = [
            { desc: "在地下城擊敗史萊姆群 1 次", reward: 2000 },
            { desc: "進行 5 次強化", reward: 3000 },
            { desc: "在拍賣行上架一件物品", reward: 1000 }
        ];

        const embed = new EmbedBuilder()
            .setColor(0x3498db)
            .setTitle("📅 | 公會告示板 (每日任務)")
            .setDescription(quests.map((q, i) => `${i+1}. ${q.desc} » \`$${q.reward}\``).join('\n'))
            .setFooter({ text: "任務每日凌晨 0:00 重置" });

        await message.reply({ embeds: [embed] });
    }
};
