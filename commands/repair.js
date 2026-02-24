const fs = require('fs');

module.exports = {
    name: 'repair',
    async execute(message, p, players) {
        if (!p.equipment || (!p.equipment.weapon && !p.equipment.armor)) {
            return message.reply("❌ 你身上沒有裝備需要修理。");
        }

        const args = message.content.split(' ');
        const target = args[1]; // weapon 或 armor

        if (target !== 'weapon' && target !== 'armor') {
            return message.reply("📝 **用法：** `~repair weapon` 或 `~repair armor` ");
        }

        const itemName = p.equipment[target];
        if (!itemName) return message.reply(`❌ 你沒有裝備${target === 'weapon' ? '武器' : '防具'}。`);

        const currentDur = p.equipment.durability[target];
        const needRepair = 100 - currentDur;
        if (needRepair <= 0) return message.reply("✨ 這件裝備狀態完美，不需要修理。");

        // 修理費計算：1 點耐久 = 10 金幣
        let cost = needRepair * 10;
        
        // 職業加成：如果是鐵匠，修理費打 5 折
        if (p.job === 'blacksmith') {
            cost = Math.floor(cost * 0.5);
        }

        if (p.money < cost) return message.reply(`❌ 錢不夠！修復這件裝備需要 \`$${cost}\`。`);

        p.money -= cost;
        p.equipment.durability[target] = 100;

        fs.writeFileSync('./players.json', JSON.stringify(players, null, 2));

        message.reply(`🔧 **修復完成！** 花費 \`$${cost}\` 金幣，你的 **${itemName}** 已恢復至 100% 耐久。`);
    }
};
