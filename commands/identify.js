const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const emojis = require('../emojis.json');
const professions = require('../professions.json');

module.exports = {
    name: 'identify',
    async execute(message, p, players) {
        if (!p.backpack || !p.backpack.includes("生鏽的鐵盒")) {
            return message.reply("❌ **鑑定失敗：** 背包裡沒有可鑑定的「生鏽的鐵盒」。");
        }

        // 扣除箱子
        const index = p.backpack.indexOf("生鏽的鐵盒");
        p.backpack.splice(index, 1);

        const isAppraiser = (p.job === 'appraiser');
        const roll = Math.random() + (isAppraiser ? 0.25 : 0); // 鑑定家額外 +25% 運氣

        // 💎 定義寶物池
        let result;
        if (roll > 1.1) {
            result = { name: "【傳說】亞特蘭提斯之星", money: 5000, exp: 1000, emoji: "💎", color: 0x00ffff, rarity: "LEGENDARY" };
        } else if (roll > 0.9) {
            result = { name: "【史詩】黃金聖甲蟲", money: 2000, exp: 450, emoji: "🪲", color: 0xf1c40f, rarity: "EPIC" };
        } else if (roll > 0.6) {
            result = { name: "【稀有】古代祭祀刀", money: 800, exp: 150, emoji: "🗡️", color: 0x9b59b6, rarity: "RARE" };
        } else if (roll > 0.3) {
            result = { name: "【普通】完整陶罐", money: 300, exp: 50, emoji: "🏺", color: 0x2ecc71, rarity: "COMMON" };
        } else {
            result = { name: "【垃圾】碎裂的磚塊", money: 50, exp: 10, emoji: "🧱", color: 0x95a5a6, rarity: "TRASH" };
        }

        // 更新數據
        p.money = (p.money || 0) + result.money;
        p.exp += result.exp;

        // 檢查升級 (共用邏輯)
        const nextExp = Math.pow(p.level, 2) * 100;
        if (p.exp >= nextExp) {
            p.level += 1;
            p.exp -= nextExp;
            p.energy = 10 + (Math.floor(p.level / 5) * 2); 
        }

        players[message.author.id] = p;
        fs.writeFileSync('./players.json', JSON.stringify(players, null, 2));

        const embed = new EmbedBuilder()
            .setColor(result.color)
            .setTitle(`🔍 | 鑑定結果：${result.rarity}`)
            .setDescription(
                `# ${result.emoji} **${result.name}**\n` +
                `> ${isAppraiser ? "✨ **[鑑定家特權]** 成功看穿了遺物的偽裝！" : "你小心地清理掉盒上的塵土..."}\n` +
                `**━━━━━━━━━━━━━━**\n\n` +
                `## 💰 變現價值\n` +
                `> **獲得金幣 » \`+ ${result.money}\`**\n` +
                `> **獲得經驗 » \`+ ${result.exp}\`**\n\n` +
                `## 🎒 剩餘物品\n` +
                `> **未鑑定鐵盒 » \`${p.backpack.filter(i => i === "生鏽的鐵盒").length}\` 個**\n` +
                `**━━━━━━━━━━━━━━**`
            )
            .setFooter({ text: `等級: LV.${p.level} | 冒險者: ${message.author.username}` });

        await message.reply({ embeds: [embed] });
    }
};
