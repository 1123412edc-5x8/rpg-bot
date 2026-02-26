const playerCalc = require('../utils/playerCalc.js');

module.exports = {
    name: 'stats',
    aliases: ['st', '狀態', '屬性'],
    async execute(message, args, p) {
        // 1. 取得計算後的最終數值
        const stats = playerCalc.getStats(p);
        
        // 2. 製作 HP 血條 (視覺化)
        const hpBarStr = (current, max) => {
            const size = 10;
            const progress = Math.min(size, Math.floor((current / max) * size));
            return "█".repeat(progress) + "░".repeat(size - progress);
        };

        const hpBar = hpBarStr(p.hp, stats.maxHp);
        
        // 3. 計算全身戰力 (簡單公式: ATK + DEF + HP/10)
        const powerScore = Math.floor(stats.atk + stats.def + (stats.maxHp / 10));

        // 4. 統計財產 (統計背包裡最貴的 3 樣東西)
        const topItems = Object.entries(p.inventory)
            .filter(([_, count]) => count > 0)
            .sort((a, b) => b[1] - a[1]) // 這裡暫時依數量排，之後可依價值排
            .slice(0, 3)
            .map(([name, count]) => `${name} x${count}`)
            .join(', ') || "無";

        // 5. 輸出排版 (Discord 清爽風格)
        let out = "👤 **玩家個人檔案： " + message.author.username + "**\n";
        out += "━━━━━━━━━━━━━━━\n";
        out += "🔰 **等級**: `Lv." + p.level + "` (" + p.exp + "/" + (p.level * 100) + " EXP)\n";
        out += "⚔️ **職業**: `" + (p.job === 'appraiser' ? '鑑定士 (新手)' : p.job) + "`\n";
        out += "🏆 **綜合戰力**: `⚡ " + powerScore.toLocaleString() + "`\n";
        out += "━━━━━━━━━━━━━━━\n";
        out += "❤️ **生命值**: [" + hpBar + "] `" + p.hp + " / " + stats.maxHp + "`\n";
        out += "🗡️ **攻擊力**: `" + stats.atk + "` | 🛡️ **防禦力**: `" + stats.def + "` \n";
        out += "💰 **持金量**: `$ " + (p.money || 0).toLocaleString() + "` \n";
        out += "━━━━━━━━━━━━━━━\n";
        out += "🛡️ **當前武裝**:\n";
        out += "> 🗡️ 武器: " + (p.equipment.weapon?.name || "*未裝備*") + "\n";
        out += "> 👕 護甲: " + (p.equipment.armor?.name || "*未裝備*") + "\n";
        out += "> 🎓 頭盔: " + (p.equipment.head?.name || "*未裝備*") + "\n";
        out += "> 👞 靴子: " + (p.equipment.boots?.name || "*未裝備*") + "\n";
        out += "━━━━━━━━━━━━━━━\n";
        out += "🎒 **稀有資產**: " + topItems + "\n";
        out += "━━━━━━━━━━━━━━━\n";
        out += "*提示：使用 `~dungeon` 獲取稀有零件來提升戰力！*";

        return message.reply(out);
    }
};
