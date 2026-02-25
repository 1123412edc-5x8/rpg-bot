module.exports = {
        name: 'upgrade',
            aliases: ['強化', 'up', 'qh'], // 支援多種別名
                async execute(message, args, p, players) {
                        let input = args[0];
                                
                                        // 🔹 中文/縮寫轉換映射表
                                                const slotMap = {
                                                            '武': 'weapon', '武器': 'weapon', 'w': 'weapon',
                                                                        '頭': 'head', '頭盔': 'head', 'h': 'head',
                                                                                    '甲': 'armor', '護甲': 'armor', '衣服': 'armor', 'a': 'armor',
                                                                                                '鞋': 'boots', '靴子': 'boots', '鞋子': 'boots', 'b': 'boots'
                                                                                                        };

                                                                                                                const slot = slotMap[input]; 
                                                                                                                        if (!slot) return message.reply("💡 請指定部位：`武`、`頭`、`甲`、`鞋` (例：`~強化 武`) ");

                                                                                                                                // ... (後續強化邏輯保持不變)
                                                                                                                                    }
                                                                                                                                    };