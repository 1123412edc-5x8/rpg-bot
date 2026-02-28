const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'craft',
        aliases: ['hc'],
            async execute(message, args, p, players) {
                    let debugMsg = "🔍 **除錯診斷報告**\n";

                            // 1. 測試路徑與讀取
                                    try {
                                                const dataPath = path.join(__dirname, '../utils/equipData.js');
                                                            debugMsg += `📂 預期路徑: \`${dataPath}\`\n`;
                                                                        
                                                                                    if (!fs.existsSync(dataPath)) {
                                                                                                    debugMsg += "❌ 錯誤: **找不到檔案！** 請檢查資料夾是叫 `utils` 還是 `工具`？\n";
                                                                                                                } else {
                                                                                                                                const data = require(dataPath);
                                                                                                                                                debugMsg += "✅ 成功讀取檔案內容。\n";
                                                                                                                                                                debugMsg += `📊 包含 items: \`${data.items ? '是' : '否'}\`\n`;
                                                                                                                                                                                debugMsg += `📊 包含 qualities: \`${data.qualities ? '是' : '否'}\`\n`;
                                                                                                                                                                                                
                                                                                                                                                                                                                if (data.items) {
                                                                                                                                                                                                                                    debugMsg += `📦 配方數量: \`${Object.keys(data.items).length}\` 個\n`;
                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                        } catch (err) {
                                                                                                                                                                                                                                                                                    debugMsg += `💀 讀取崩潰: \`${err.message}\`\n`;
                                                                                                                                                                                                                                                                                            }

                                                                                                                                                                                                                                                                                                    // 2. 測試玩家數據
                                                                                                                                                                                                                                                                                                            debugMsg += `👤 玩家等級: \`${p ? p.level : '未定義'}\`\n`;
                                                                                                                                                                                                                                                                                                                    debugMsg += `💰 玩家金幣: \`${p ? p.money : '未定義'}\`\n`;

                                                                                                                                                                                                                                                                                                                            const embed = new EmbedBuilder()
                                                                                                                                                                                                                                                                                                                                        .setTitle("🔧 系統自動診斷")
                                                                                                                                                                                                                                                                                                                                                    .setDescription(debugMsg)
                                                                                                                                                                                                                                                                                                                                                                .setColor(0xff0000);

                                                                                                                                                                                                                                                                                                                                                                        return message.reply({ embeds: [embed] });
                                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                                            };