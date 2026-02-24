const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'gtop',
    async execute(message) {
        // ... (保留之前的排序邏輯) ...

        // 計算月底剩餘天數
        const now = new Date();
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const daysLeft = lastDay.getDate() - now.getDate();

        const embed = new EmbedBuilder()
            .setColor(0xF1C40F)
            .setTitle("🏆 | 遺蹟公會賽季排行榜")
            .setDescription(`📅 本賽季將於 **${daysLeft} 天後** 結算\n\n${list}`)
            .addFields(
                { 
                    name: "🎁 結算獎勵說明", 
                    value: "🔸 **公會榜首**：金庫獲得 `$50,000` 獎金\n🔸 **個人貢獻**：每 `100` 積分轉換為 `$1000` 現金", 
                    inline: false 
                }
            )
            .setFooter({ text: "系統將於每月 1 號自動統整並重置積分" });

        await message.reply({ embeds: [embed] });
    }
};