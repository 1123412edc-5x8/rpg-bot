const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'gtop',
    aliases: ['公會排行榜', '公會榜單'],
    async execute(message, args, p, players) {
        // 1. 讀取並轉換資料為陣列
        // 這裡我們以「等級」和「經驗值」來排序，你也可以改成「金幣」
        const sortedList = Object.entries(players)
            .map(([id, data]) => ({
                id,
                level: data.level || 1,
                exp: data.exp || 0,
                money: data.money || 0
            }))
            .sort((a, b) => {
                if (b.level !== a.level) return b.level - a.level; // 先比等級
                return b.exp - a.exp; // 等級一樣比經驗
            })
            .slice(0, 10); // 只取前 10 名

        // 2. 生成排行榜文字
        let list = "";
        for (let i = 0; i < sortedList.length; i++) {
            const user = sortedList[i];
            const member = message.guild.members.cache.get(user.id);
            const name = member ? member.displayName : `未知冒險者(${user.id.slice(0, 4)})`;
            
            const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `第 ${i + 1} 名`;
            list += `${medal} **${name}** - Lv.${user.level} (💰 $${user.money.toLocaleString()})\n`;
        }

        if (list === "") list = "目前尚無冒險者資料。";

        // 3. 計算月底剩餘天數
        const now = new Date();
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const daysLeft = lastDay.getDate() - now.getDate();

        // 4. 生成 Embed
        const embed = new EmbedBuilder()
            .setColor(0xF1C40F)
            .setTitle("🏆 | 遺蹟公會賽季排行榜")
            .setDescription(`📅 本賽季將於 **${daysLeft} 天後** 結算\n\n${list}`)
            .addFields(
                { 
                    name: "🎁 結算獎勵說明", 
                    value: "🔸 **公會榜首**：額外獲得 `$50,000` 獎金\n🔸 **個人貢獻**：每 `100` 積分轉換為 `$1000` 現金", 
                    inline: false 
                }
            )
            .setFooter({ text: "系統將於每月 1 號自動統整並重置積分" })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }
};