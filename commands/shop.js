const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'shop',
    async execute(message, p, players) {
        const args = message.content.split(' ');
        
        // 商店貨架
        const items = {
            "1": { name: "精力藥水", price: 500, desc: "恢復 5 點精力", type: "energy" },
            "2": { name: "擴張背包", price: 2000, desc: "增加 5 格容量", type: "slot" },
            "3": { name: "【幸運】守護符", price: 3000, desc: "強化失敗時保護物品不碎裂", type: "buff" },
            "4": { name: "【精煉】磨刀石", price: 1500, desc: "下次強化成功率 +15%", type: "buff" }
        };

        if (!args[1]) {
            let list = Object.entries(items).map(([id, item]) => 
                `### [${id}] ${item.name} | 💰 \`${item.price}\`\n> *${item.desc}*`
            ).join('\n');

            const embed = new EmbedBuilder()
                .setColor(0xFFD700)
                .setTitle("🛒 | 冒險者物資店")
                .setDescription(`# **今日特選商品**\n${list}\n\n**💡 購買指令：\`~shop [編號]\`**`);
            return message.reply({ embeds: [embed] });
        }

        const choice = items[args[1]];
        if (!choice) return message.reply("❌ **查無此商品。**");
        if ((p.money || 0) < choice.price) return message.reply("❌ **錢不夠喔！**");

        // 扣錢與發貨
        p.money -= choice.price;
        if (!p.backpack) p.backpack = [];
        p.backpack.push(choice.name);

        players[message.author.id] = p;
        fs.writeFileSync('./players.json', JSON.stringify(players, null, 2));

        message.reply(`✅ **購買成功！** 你獲得了「${choice.name}」。`);
    }
};
