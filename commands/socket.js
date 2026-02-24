const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'socket',
    async execute(message, p, players) {
        const args = message.content.split(' ');
        const action = args[1]; // buy / inlay

        const gemData = {
            "紅寶石": { atk: 150, cost: 5000, emoji: "🔴", desc: "增加 150 點基礎攻擊" },
            "藍寶石": { energyMax: 5, cost: 5000, emoji: "🔵", desc: "增加 5 點體力上限" },
            "黃寶石": { crit: 0.1, cost: 8000, emoji: "🟡", desc: "增加 10% 暴擊率" }
        };

        // --- 1. 顯示寶石清單與鑲嵌狀況 ---
        if (!action) {
            let desc = "### 💎 寶石工坊\n";
            for (const [name, info] of Object.entries(gemData)) {
                desc += `${info.emoji} **${name}** ($${info.cost})\n> ${info.desc}\n`;
            }
            desc += "\n**用法：**\n`~socket buy [名]` - 購買寶石\n`~socket inlay [裝備名] [寶石名]` - 鑲嵌寶石";
            
            const embed = new EmbedBuilder().setColor(0x9b59b6).setTitle("💎 | 鑲嵌大師").setDescription(desc);
            return message.reply({ embeds: [embed] });
        }

        // --- 2. 購買寶石 ---
        if (action === 'buy') {
            const gemName = args[2];
            const gem = gemData[gemName];
            if (!gem) return message.reply("❌ 沒有這種寶石！");
            if (p.money < gem.cost) return message.reply("❌ 錢不夠喔！");

            p.money -= gem.cost;
            p.backpack.push(gemName);
            players[message.author.id] = p;
            fs.writeFileSync('./players.json', JSON.stringify(players, null, 2));
            return message.reply(`✅ 你購買了 ${gemName}！`);
        }

        // --- 3. 鑲嵌寶石 ---
        if (action === 'inlay') {
            const gearType = args[2]; // weapon 或 armor
            const gemName = args[3];

            if (!p.equipment[gearType]) return message.reply("❌ 你沒穿這件裝備！");
            if (!p.backpack.includes(gemName)) return message.reply("❌ 你身上沒有這顆寶石！");

            // 初始化槽位 (假設每件裝備固定 2 個槽位)
            if (!p.equipment.slots) p.equipment.slots = { weapon: [], armor: [] };
            if (p.equipment.slots[gearType].length >= 2) return message.reply("❌ 槽位已滿！請先拆卸或更換裝備。");

            // 扣除寶石並鑲嵌
            const gemIndex = p.backpack.indexOf(gemName);
            p.backpack.splice(gemIndex, 1);
            p.equipment.slots[gearType].push(gemName);

            players[message.author.id] = p;
            fs.writeFileSync('./players.json', JSON.stringify(players, null, 2));

            return message.reply(`✨ 成功將 **${gemName}** 鑲嵌進你的 **${p.equipment[gearType]}**！`);
        }
    }
};
