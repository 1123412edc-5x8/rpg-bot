const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'titles',
    async execute(message, p, players) {
        const args = message.content.split(' ');
        
        // 1. 定義所有可能的稱號與取得條件
        const allTitles = [
            { id: "newbie", name: "🌱 遺蹟菜鳥", condition: "預設擁有" },
            { id: "rich", name: "💰 萬金富豪", condition: "持有金額超過 10,000" },
            { id: "slayer", name: "⚔️ 怪物獵人", condition: "等級達到 Lv.10" },
            { id: "whale", name: "🐳 伺服器金主", condition: "累計捐款公會達 20,000" },
            { id: "king", name: "👑 遺蹟之王", condition: "公會榜排名第一名的會長" }
        ];

        // 檢查玩家已解鎖的稱號
        if (!p.unlockedTitles) p.unlockedTitles = ["newbie"];
        
        // 自動檢查解鎖邏輯 (簡單版)
        if (p.money >= 10000 && !p.unlockedTitles.includes("rich")) p.unlockedTitles.push("rich");
        if (p.level >= 10 && !p.unlockedTitles.includes("slayer")) p.unlockedTitles.push("slayer");

        // --- 功能 A：列表顯示 ---
        if (!args[1]) {
            let list = "";
            allTitles.forEach(t => {
                const isUnlocked = p.unlockedTitles.includes(t.id);
                const isEquipped = p.currentTitle === t.id;
                list += `${isUnlocked ? "✅" : "🔒"} **${t.name}** ${isEquipped ? " (使用中)" : ""}\n> *條件：${t.condition}*\n\n`;
            });

            const embed = new EmbedBuilder()
                .setColor(0x3498db)
                .setTitle(`🎖️ | ${message.author.username} 的稱號庫`)
                .setDescription(list + "\n**指令：`~titles equip [編號]` (如: `~titles equip rich`)**");
            return message.reply({ embeds: [embed] });
        }

        // --- 功能 B：佩戴稱號 ---
        if (args[1] === 'equip') {
            const targetId = args[2];
            if (!p.unlockedTitles.includes(targetId)) return message.reply("❌ 你尚未解鎖此稱號！");

            p.currentTitle = targetId;
            players[message.author.id] = p;
            fs.writeFileSync('./players.json', JSON.stringify(players, null, 2));

            const titleObj = allTitles.find(t => t.id === targetId);
            return message.reply(`✅ 稱號切換成功！你現在是 **【${titleObj.name}】**`);
        }
    }
};
