// utils/playerCalc.js
const gearStats = {
    "生鏽的短劍": 10, "【史詩】符文重錘": 150, "【傳說】亞特蘭提斯之鋒": 500,
        "礦工頭盔": 10, "【精良】探險家長靴": 30, "【史詩】板甲": 100
        };
        const gemValues = { "紅寶石": 150, "黃寶石": 50, "藍寶石": 0 };

        module.exports = {
            getStats(p) {
                    const lv = p.level || 1;
                            
                                    // 1. 血量與體力上限
                                            const maxHp = lv * 100 + 500;
                                                    const maxEnergy = 10 + (lv * 2);

                                                            // 2. 計算攻擊力
                                                                    let baseAtk = lv * 15;
                                                                            let gearAtk = 0;
                                                                                    const weaponName = p.equipment?.weapon || p.equipping;
                                                                                            if (weaponName && (p.equipment?.durability?.weapon ?? 100) > 0) {
                                                                                                        const baseName = weaponName.split(' +')[0];
                                                                                                                    let atk = gearStats[baseName] || 0;
                                                                                                                                if (weaponName.includes("+")) {
                                                                                                                                                const plusLv = parseInt(weaponName.split('+')[1]);
                                                                                                                                                                atk = Math.floor(atk * (1 + plusLv * 0.5));
                                                                                                                                                                            }
                                                                                                                                                                                        gearAtk = atk;
                                                                                                                                                                                                }
                                                                                                                                                                                                        
                                                                                                                                                                                                                // 3. 計算防禦力
                                                                                                                                                                                                                        let baseDef = lv * 5;
                                                                                                                                                                                                                                let gearDef = 0;
                                                                                                                                                                                                                                        const armorName = p.equipment?.armor;
                                                                                                                                                                                                                                                if (armorName && (p.equipment?.durability?.armor ?? 100) > 0) {
                                                                                                                                                                                                                                                            const baseName = armorName.split(' +')[0];
                                                                                                                                                                                                                                                                        gearDef = gearStats[baseName] || 0; // 防具數值也存在 gearStats 裡
                                                                                                                                                                                                                                                                                }

                                                                                                                                                                                                                                                                                        // 4. 總結 (這裡可以把職業加成也放進來)
                                                                                                                                                                                                                                                                                                let totalAtk = baseAtk + gearAtk;
                                                                                                                                                                                                                                                                                                        if (p.job === "⚔️ 狂戰士") totalAtk = Math.floor(totalAtk * 1.5);
                                                                                                                                                                                                                                                                                                                
                                                                                                                                                                                                                                                                                                                        let totalDef = baseDef + gearDef;

                                                                                                                                                                                                                                                                                                                                return {
                                                                                                                                                                                                                                                                                                                                            maxHp, maxEnergy,
                                                                                                                                                                                                                                                                                                                                                        totalAtk, totalDef,
                                                                                                                                                                                                                                                                                                                                                                    baseAtk, gearAtk,
                                                                                                                                                                                                                                                                                                                                                                                baseDef, gearDef
                                                                                                                                                                                                                                                                                                                                                                                        };
                                                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                                                            };