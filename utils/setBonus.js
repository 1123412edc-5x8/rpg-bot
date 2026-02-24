const sets = require('../sets.json');

function getActiveSets(player) {
    const activeSets = [];
        const playerEquips = [
                player.equipment?.weapon?.split(' +')[0],
                        player.equipment?.armor?.split(' +')[0],
                                player.equipment?.accessory?.split(' +')[0] // 假設你新增了飾品欄位
                                    ].filter(Boolean);

                                        for (const [setName, setData] of Object.entries(sets)) {
                                                // 檢查玩家裝備是否包含套裝要求的所有物品
                                                        const hasAll = setData.items.every(reqItem => playerEquips.includes(reqItem));
                                                                if (hasAll) {
                                                                            activeSets.push({ name: setName, ...setData });
                                                                                    }
                                                                                        }
                                                                                            return activeSets;
                                                                                            }

                                                                                            module.exports = { getActiveSets };