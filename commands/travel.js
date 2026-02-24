const fs = require('fs');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'travel',
    async execute(message, p, players) {
        const args = message.content.split(' ');
        const targetMap = args[1];

        const maps = {
            "1": { name: "🌿 遺蹟外圍", req: 1, color: 0x2ecc71 },
            "2": { name: "💀 幽暗地窖", req: 10, color: 0x7f8c8d },
            "3": { name: "🔥 熔岩核心", req: 25, color: 0xe74c3c }
        };

        if (!targetMap || !maps[targetMap]) {
            let list = "請選擇目的地編號：\n";
            for (const [id, map] of Object.entries(maps)) {
                list += `**${id}** - ${map.name} (限制: Lv.${map.req})\n`;
            }
            return message.reply(list);
        }

        const dest = maps[targetMap];
        if (p.level < dest.req) {
            return message.reply(`❌ 等級不足！前往 **${dest.name}** 需要 Lv.${dest.req}。`);
        }

        p.location = dest.name;
        players[message.author.id] = p;
        fs.writeFileSync('./players.json', JSON.stringify(players, null, 2));

        const embed = new EmbedBuilder()
            .setColor(dest.color)
            .setTitle("🎫 | 抵達新區域")
            .setDescription(`你已成功抵達 **${dest.name}**！在這裡探索要多加小心。`);

        await message.reply({ embeds: [embed] });
    }
};
