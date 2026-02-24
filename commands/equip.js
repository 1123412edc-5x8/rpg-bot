const fs = require('fs');

module.exports = {
    name: 'equip',
    async execute(message, p, players) {
        const args = message.content.split(' ');
        const itemName = args.slice(1).join(' ');

        if (!p.backpack.includes(itemName)) return message.reply("❌ 你背包裡沒有這件東西！");

        // 定義種類
        const weapons = ["生鏽的短劍", "【精良】探險家短弓", "【史詩】符文重錘", "【傳說】亞特蘭提斯之鋒"];
        const armors = ["礦工頭盔", "【精良】皮製胸甲", "【史詩】祭司銀袍", "【傳說】永恆神諭盔甲"];

        const baseName = itemName.split(' +')[0];
        let type = "";

        if (weapons.includes(baseName)) type = "weapon";
        else if (armors.includes(baseName)) type = "armor";
        else return message.reply("❌ 這件物品不是可裝備的武器或防具。");

        // 確保玩家資料中有裝備物件
        if (!p.equipment) p.equipment = { weapon: null, armor: null };

        p.equipment[type] = itemName;
        
        players[message.author.id] = p;
        fs.writeFileSync('./players.json', JSON.stringify(players, null, 2));

        const typeName = type === "weapon" ? "武器" : "防具";
        message.reply(`✅ 裝備成功！你已裝上${typeName}：**${itemName}**`);
    }
};
