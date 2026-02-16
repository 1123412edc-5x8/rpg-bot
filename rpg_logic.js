// 計算升級所需經驗值
function getRequiredExp(level) {
    return Math.pow(level, 2) * 100;
    }

    // 處理獲得經驗值後的邏輯
    function addExperience(player, amount) {
        player.exp += amount;
            let leveledUp = false;

                // 循環檢查是否滿足升級條件 (可能連升多級)
                    while (player.exp >= getRequiredExp(player.level)) {
                            player.exp -= getRequiredExp(player.level);
                                    player.level += 1;
                                            leveledUp = true;
                                                    
                                                            // 升級獎勵：屬性點或是解鎖新職業
                                                                    player.stats.STR += 2;
                                                                            player.stats.LUK += 1;
                                                                                }
                                                                                    return { player, leveledUp };
                                                                                    }

                                                                                    module.exports = { getRequiredExp, addExperience };