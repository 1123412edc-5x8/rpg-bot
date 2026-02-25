const { EmbedBuilder } = require('discord.js');
const playerCalc = require('../utils/playerCalc.js');
const lvSys = require('../utils/levelSystem.js');

module.exports = {
    name: 'stats',
    async execute(message, p) {
        const s = playerCalc.getStats(p); // 取得計算結果 (maxHp, maxEnergy, totalAtk, totalDef)
        const currentLv = p.level || 1;
        const MAX_LEVEL = 100;
        const isMax = currentLv >= MAX_LEVEL;

        // 1. 經驗條與等級文字處理
        let bar, expDisplay;
        if (isMax) {
            bar = "👑" + "✨".repeat(9); // 滿級專屬金色特效
            expDisplay = "**MAX LEVEL**";
        } else {
            const nextExp = lvSys.getRequiredExp(currentLv);
            const progress = Math.min(Math.floor((p.exp / nextExp) * 10), 10);
            bar = "🟩".repeat(progress) + "⬜".repeat(10 - progress);
            expDisplay = `\`${p.exp || 0} / ${nextExp}\` Exp`;
        }

        // 2. 裝備顯示判定 (沒裝備就不顯示耐久度)
        const wTxt = p.equipment?.weapon 
            ? `🔹 ${p.equipment.weapon}\n耐久: \`${p.equipment.durability?.weapon ?? 100}%\`` 
            : "🔹 無";
        const aTxt = p.equipment?.armor 
            ? `🔸 ${p.equipment.armor}\n耐久: \`${p.equipment.durability?.armor ?? 100}%\`` 
            : "🔸 無";

        // 3. 構建 Embed
        const embed = new EmbedBuilder()
            .setColor(isMax ? 0xf1c40f : 0xff4500) // 滿級變金色，平常是橘紅色
            .setTitle(`⚔️ ${message.author.username} 的紀錄`)
            .addFields(
                { name: `等級 (Lv. ${currentLv})`, value: `${bar}\n(${expDisplay})`, inline: false },
                { name: "❤️ HP", value: `\`${p.hp || 0} / ${s.maxHp}\``, inline: true },
                { name: "🔋 體力", value: `\`${p.energy || 0} / ${s.maxEnergy}\``, inline: true },
                { name: "🔥 總攻擊", value: `\`${s.totalAtk}\``, inline: true },
                { name: "🛡️ 總防禦", value: `\`${s.totalDef}\``, inline: true },
                { name: "💰 金幣", value: `\`$${p.money || 0}\``, inline: true },
                { name: "⚔️ 武器", value: wTxt, inline: true },
                { name: "🛡️ 防具", value: aTxt, inline: true }
            );

        // 如果有鑲嵌寶石，額外顯示出來
        if (p.equipment?.slots?.weapon?.length > 0) {
            embed.addFields({ name: "💎 武器鑲嵌", value: p.equipment.slots.weapon.join(', '), inline: true });
        }

        await message.reply({ embeds: [embed] });
    }
};