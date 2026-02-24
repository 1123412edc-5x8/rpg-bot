const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const emojis = require('../emojis.json');

module.exports = {
    name: 'backpack',
    async execute(message, p, players) {
        const args = message.content.split(' ');

        // --- 核心 A：背包擴容邏輯 (~backpack upgrade) ---
        if (args[1] === 'upgrade') {
            if (!p.maxSlots) p.maxSlots = 20;
            const upgradeCost = p.maxSlots * 500;
            const nextSlots = p.maxSlots + 10;

            if (p.maxSlots >= 100) return message.reply("❌ 你的背包已經擴張到極限了 (100 格)！");
            if (p.money < upgradeCost) return message.reply(`❌ 擴容需要 \`$${upgradeCost}\`，你的錢不夠！`);

            p.money -= upgradeCost;
            p.maxSlots = nextSlots;

            players[message.author.id] = p;
            fs.writeFileSync('./players.json', JSON.stringify(players, null, 2));

            const upEmbed = new EmbedBuilder()
                .setColor(0xF1C40F)
                .setTitle("🔨 | 背包空間擴建")
                .setDescription(`付款成功！冒險者公會已將容量提升至 **${nextSlots}** 格。`)
                .setFooter({ text: `消耗金幣: $${upgradeCost}` });
            return message.reply({ embeds: [upEmbed] });
        }

        // --- 核心 B：背包顯示邏輯 (~backpack) ---
        if (!p.backpack) p.backpack = [];
        const maxSlots = p.maxSlots || 20;

        // 1. 定義裝備清單
        const gearList = ["生鏽的短劍", "礦工頭盔", "【精良】探險家長靴", "【史詩】符文重錘", "【傳說】亞特蘭提斯之鋒"];

        // 2. 統計物品數量並分類
        const gearItems = {};
        const generalItems = {};

        p.backpack.forEach(item => {
            const isGear = gearList.some(g => item.includes(g));
            if (isGear) {
                gearItems[item] = (gearItems[item] || 0) + 1;
            } else {
                generalItems[item] = (generalItems[item] || 0) + 1;
            }
        });

        // 3. 格式化字串
        const gearDisplay = Object.entries(gearItems)
            .map(([name, count]) => `⚔️ **${name}** \`x${count}\``)
            .join('\n') || "> *暫無裝備*";

        const materialDisplay = Object.entries(generalItems)
            .map(([name, count]) => `📦 ${name} \`x${count}\``)
            .join('\n') || "> *暫無物資*";

        // 4. 進度條計算
        const used = p.backpack.length;
        const progress = Math.min(Math.floor((used / maxSlots) * 10), 10);
        const bar = '🟩'.repeat(progress) + '⬜'.repeat(10 - progress);

        // 5. 構建 Embed
        const embed = new EmbedBuilder()
            .setColor(0x2F3136)
            .setTitle(`${emojis.ui.backpack} | ${message.author.username} 的冒險背包`)
            .addFields(
                { 
                    name: `🎒 儲存空間 [ ${used} / ${maxSlots} ]`, 
                    value: `${bar} (${Math.floor((used/maxSlots)*100)}%)\n輸入 \`~backpack upgrade\` 擴容`, 
                    inline: false 
                },
                { name: `🗡️ 武器與防具`, value: gearDisplay, inline: true },
                { name: `💎 物資與寶石`, value: materialDisplay, inline: true }
            )
            .setFooter({ text: '💡 提示：裝備可透過 ~market sell 上架拍賣行' })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }
};