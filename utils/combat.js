const playerCalc = require('./playerCalc.js');

module.exports = {
    simulate(p, mob) {
        const stats = playerCalc.getStats(p);
        let p_hp = p.hp || 100;
        let m_hp = mob.hp;
        let log = [];

        // 遵循圖中建議：使用最基礎的戰鬥直觀數值 (HP, ATK, DEF)
        while (p_hp > 0 && m_hp > 0) {
            // 1. 玩家攻擊怪物 (減法公式)
            // 傷害 = 攻擊方 ATK - 防禦方 DEF
            // 註：設定最小值為 1，避免負數 Bug
            let p_dmg = Math.max(1, stats.atk - (mob.def || 0));
            m_hp -= p_dmg;
            if (m_hp <= 0) break;

            // 2. 怪物攻擊玩家 (同樣套用減法公式)
            let m_dmg = Math.max(1, mob.atk - stats.def);
            p_hp -= m_dmg;
        }

        return { 
            win: p_hp > 0, 
            finalHp: Math.max(0, p_hp) 
        };
    }
};
