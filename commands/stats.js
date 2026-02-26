const { EmbedBuilder } = require('discord.js');
const playerCalc = require('../utils/playerCalc.js');

module.exports = {
    name: 'stats',
    aliases: ['st', '狀態', '屬性'],
    async execute(message, args, p) {
        // 1. 取得計算後的最終數值
        const stats = playerCalc.getStats(p);
        
        // 2. 製作 HP 血條 (視覺化)
        const hpBarStr = (current, max) => {
            const size = 10;
            const progress = Math.max(0, Math.min(size, Math.floor((current / max) * size)));
            return "🟩".repeat(progress) + "⬛".repeat(size - progress);
        };

        const hpBar = hpBarStr(p.hp, stats.maxHp);
        
        // 3. 計算全身戰力
        const powerScore = Math.floor(stats.atk + stats.def + (stats.maxHp / 10));

        // 4. 統計財產
        const topItems = Object.entries(p.inventory)
            .filter(([_, count]) => count > 0)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([name, count]) => `\`${name} x${count}\``)
            .join(' ') || "無";

        // 5. 製作 Embed
        const statsEmbed = new EmbedBuilder()
            .setColor(0x00BFFF) // 這裡選深天藍色，你可以換成你喜歡的顏色
            .setTitle(`👤 玩家個人檔案：${message.author.username}`)
            .setThumbnail(message.author.displayAvatarURL()) // 右上角顯示頭像
            .addFields(
                { name: '🔰 等級', value: `\`Lv.${p.level}\` (${p.exp}/${p.level * 100} EXP)`, inline: true },
                { name: '⚔️ 職業', value: `\`${p.job === 'appraiser' ? '鑑定士 (新手)' : p.job}\``, inline: true },
                { name: '🏆 綜合戰力', value: `\`⚡ ${powerScore.toLocaleString()}\``, inline: true }
            )
            .addFields(
                { name: '❤️ 生命值', value: `${hpBar} \`${p.hp} / ${stats.maxHp}\``, inline: false },
                { name: '🗡️ 攻擊力', value: `\`${stats.atk}\``, inline: true },
                { name: '🛡️ 防禦力', value: `\`${stats.def}\``, inline: true },
                { name: '💰 持金量', value: `\`$ ${p.money.toLocaleString()}\``, inline: true }
            )
            .addFields(
                { 
                    name: '🛡️ 當前武裝', 
                    value: `> 🗡️ **武器**: ${p.equipment.weapon?.name || "*未裝備*"}\n> 👕 **護甲**: ${p.equipment.armor?.name || "*未裝備*"}\n> 🎓 **頭盔**: ${p.equipment.head?.name || "*未裝備*"}\n> 👞 **靴子**: ${p.equipment.boots?.name || "*未裝備*"}`,
                    inline: false 
                },
                { name: '🎒 稀有資產', value: topItems, inline: false }
            )
            .setFooter({ text: '提示：使用 ~dungeon 獲取稀有零件來提升戰力！' })
            .setTimestamp();

        return message.reply({ embeds: [statsEmbed] });
    }
};