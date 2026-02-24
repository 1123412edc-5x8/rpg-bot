module.exports = {
    // 定義升級所需的經驗公式：等級^2 * 100
    getRequiredExp(level) {
        return Math.pow(level, 2) * 100;
    },

    // 檢查並處理升級
    checkLevelUp(p) {
        let leveledUp = false;
        while (p.exp >= this.getRequiredExp(p.level || 1)) {
            p.exp -= this.getRequiredExp(p.level || 1);
            p.level = (p.level || 1) + 1;
            leveledUp = true;
            
            // 升級獎勵：全滿體力，或是增加基礎屬性
            p.energy = 10 + (p.level * 2); 
            p.money = (p.money || 0) + (p.level * 500);
        }
        return leveledUp;
    }
};
