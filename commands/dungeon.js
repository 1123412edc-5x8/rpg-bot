const combat = require('../utils/combat.js');
const fs = require('fs');

module.exports = {
    name: 'dungeon',
    aliases: ['副本', 'fb'],
    async execute(message, args, p, players) {
        // 1. 檢查玩家狀態
        if (!p.hp || p.hp <= 0) {
            return message.reply("❌ **挑戰失敗**：你現在體力不支（HP: 0），請先使用 `~use` 喝藥水！");
        }

        const totalFloor = 5;
        let currentFloor = 1;
        let battleLogs = [];

        message.reply("🏰 **正在進入「幽暗礦坑」地下城... 挑戰開始！**");

        // 2. 自動爬塔邏輯
        while (currentFloor <= totalFloor && p.hp > 0) {
            // 每層怪物屬性：血量 150*層數, 攻擊 25*層數
            const mob = { 
                name: `第 ${currentFloor} 層守衛`, 
                hp: 150 * currentFloor, 
                atk: 25 * currentFloor 
            };
            
            // 執行戰鬥
            const result = combat.simulate(p, mob);
            p.hp = result.finalHp;

            if (result.win) {
                battleLogs.push(`✅ **第 ${currentFloor} 層**：順利擊殺守衛！ (剩餘 HP: ` + p.hp + `)`);
                currentFloor++;
            } else {
                // 戰敗邏輯
                players[message.author.id] = p;
                fs.writeFileSync('./players.json', JSON.stringify(players, null, 2));
                return message.reply(`💀 **副本失敗**：你在第 ${currentFloor} 層被打慘了... 獎勵全數遺失！`);
            }
        }

        // 3. 結算獎勵 (從 80 種材料中挑選副本特產)
        const rewardsPool = ["⚙️ 精準發條", "🔌 魔力導線", "💠 蒸汽核心", "🧱 鋼鐵錠"];
        const loot = rewardsPool[Math.floor(Math.random() * rewardsPool.length)];
        
        p.inventory[loot] = (p.inventory[loot] || 0) + 2;
        p.exp += 350;

        // 4. 存檔
        players[message.author.id] = p;
        fs.writeFileSync('./players.json', JSON.stringify(players, null, 2));

        // 5. 輸出報告 (純文字排版)
        let report = "🏆 **【 地下城全通關成功 】**\n\n";
        report += battleLogs.join("\n") + "\n\n";
        report += "🎁 **通關獎勵**：**" + loot + "** × `2`\n";
        report += "🌟 **獲得經驗**：`+350`\n";
        report += "❤️ **最終狀態**：`HP " + p.hp + "`";

        return message.reply(report);
    }
};
