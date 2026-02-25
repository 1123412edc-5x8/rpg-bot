module.exports = {
    // 定義升級所需的經驗公式：等級^2 * 100
    getRequiredExp(level) {
        return Math.pow(level, 2) * 100;
    },

    // 檢查並處理升級
    checkLevelUp(p) {
        const MAX_LEVEL = 100; // 🚩 設定上限
        let leveledUp = false;

        // 如果已經滿級，經驗值鎖死在 0，不進行計算
        if (p.level >= MAX_LEVEL) {
            p.level = MAX_LEVEL;
            p.exp = 0;
            return false;
        }
        
        // 使用 while 處理可能連續升級的情況
        while (p.exp >= this.getRequiredExp(p.level || 1)) {
            p.exp -= this.getRequiredExp(p.level || 1);
            p.level = (p.level || 1) + 1;
            leveledUp = true;
            
            // 🌟 HP 邏輯實作 (B方案：寫實流)
            // 升級後上限會自動提升，給予 100 點成長獎勵
            p.hp = (p.hp || 500) + 100; 

            // 升級獎勵：體力隨著等級上限同步 (你的公式)
            p.energy = 10 + (p.level * 2); 
            p.money = (p.money || 0) + (p.level * 500);

            // 🚩 達到上限立即鎖死並跳出
            if (p.level >= MAX_LEVEL) {
                p.level = MAX_LEVEL;
                p.exp = 0;
                break;
            }
        }
        
        // 🌟 防呆：確保 HP 不會超過該等級上限 (Lv * 100 + 500)
        const maxHp = (p.level || 1) * 100 + 500;
        if (p.hp > maxHp) p.hp = maxHp;

        return leveledUp;
    }
};