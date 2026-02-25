module.exports = {
        // 1. 部位加成權重
            parts: {
                    "weapon": { name: "武器", mainStat: "atk", weight: 1.0 },
                            "head":   { name: "頭盔", mainStat: "def", weight: 0.4 },
                                    "armor":  { name: "護甲", mainStat: "def", weight: 1.0 },
                                            "boots":  { name: "靴子", mainStat: "def", weight: 0.3 }
                                                },

                                                    // 2. 品質與機率 (合成時決定品質)
                                                        qualities: {
                                                                "White":  { label: "⚪ 普通", mult: 1.0, chance: 60 },
                                                                        "Green":  { label: "🟢 優秀", mult: 1.5, chance: 25 },
                                                                                "Blue":   { label: "🔵 精良", mult: 2.2, chance: 10 },
                                                                                        "Purple": { label: "🟣 史詩", mult: 3.5, chance: 4 },
                                                                                                "Gold":   { label: "🟡 傳說", mult: 6.0, chance: 1 }
                                                                                                    },

                                                                                                        // 3. 階級清單 (每 20 級一跳)
                                                                                                            tiers: {
                                                                                                                    10: { name: "遺蹟",  material: "🪵 乾燥的木頭", sub: "⛓️ 鐵礦石" },
                                                                                                                            30: { name: "精鋼",  material: "🧱 鋼鐵錠", sub: "📜 優質皮革" },
                                                                                                                                    50: { name: "迷霧",  material: "🐺 狼人毛皮", sub: "🥈 銀礦石" },
                                                                                                                                            70: { name: "寒冰",  material: "🧊 冰河鋼", sub: "🌬️ 寒冰精華" },
                                                                                                                                                    90: { name: "焚天",  material: "🩸 龍血石", sub: "🌌 混沌之魂" }
                                                                                                                                                        },

                                                                                                                                                            // 4. 武器類型差異
                                                                                                                                                                weaponTypes: {
                                                                                                                                                                        "劍": { atkBonus: 1.0, defBonus: 0.2, desc: "攻守兼備" },
                                                                                                                                                                                "弓": { atkBonus: 1.3, defBonus: 0.0, desc: "極致輸出" },
                                                                                                                                                                                        "矛": { atkBonus: 1.1, defBonus: 0.1, desc: "破甲穿透" }
                                                                                                                                                                                            }
                                                                                                                                                                                            };