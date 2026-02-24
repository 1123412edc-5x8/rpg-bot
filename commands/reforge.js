const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'reforge',
    async execute(message, p, players) {
        const args = message.content.split(' ');
        const cost = 2000; // 每次洗煉的費用

        if (!p.equipment?.weapon) return message.reply("❌ 你手上沒有裝備可以洗煉！");
        if (p.money < cost) return message.reply(`❌ 洗煉需要 \`$${cost}\`，你的錢不夠。`);

        // 隨機詞綴池
        const prefixes = [
            { name: "殘暴的", atkMult: 0.15, desc: "攻擊力 +15%" },
            { name: "神速的", energySave: 1, desc: "探索時機率不扣體力" },
            { name: "致命的", crit: 0.2, desc: "暴擊率 +20%" },
            { name: "堅固的", durSave: 0.5, desc: "耐久消耗減半" },
            { name: "幸運的", drop: 0.1, desc: "掉落率 +10%" }
        ];

        // 隨機抽選一個詞綴
        const newPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];

        // 扣錢並更新資料
        p.money -= cost;
        p.equipment.prefix = newPrefix;

        players[message.author.id] = p;
        fs.writeFileSync('./players.json', JSON.stringify(players, null, 2));

        const embed = new EmbedBuilder()
            .setColor(0x3498db)
            .setTitle("🌀 | 裝備重塑完成")
            .setDescription(`你消耗了 \`$${cost}\` 重鑄了你的 **${p.equipment.weapon}**`)
            .addFields(
                { name: "✨ 新詞綴", value: `**【${newPrefix.name}】**`, inline: true },
                { name: "💎 效果", value: `\`${newPrefix.desc}\``, inline: true }
            )
            .setFooter({ text: "不滿意？再次輸入 ~reforge 繼續洗煉！" });

        await message.reply({ embeds: [embed] });
    }
};
