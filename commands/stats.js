const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
// 🌟 引入套裝檢查工具 (請確保你有按照上一則建議建立 utils/setBonus.js)
const { getActiveSets } = require('../utils/setBonus.js');

module.exports = {
    name: 'stats',
    async execute(message, p) {
        // 1. 數據庫定義
        const gearStats = {
            "生鏽的短劍": 10,
            "礦工頭盔": 5,
            "【精良】探險家長靴": 40,
            "【史詩】符文重錘": 150,
            "【傳說】亞特蘭提斯之鋒": 500
        };
        const gemValues = { "紅寶石": 150, "黃寶石": 50, "藍寶石": 0 };

        // 2. 經驗值與等級條計算
        const lvSys = require('../utils/levelSystem.js');
        const nextExp = lvSys.getRequiredExp(p.level || 1);
        const progress = Math.min(Math.floor((p.exp / nextExp) * 10), 10);
        const bar = "🟩".repeat(progress) + "⬜".repeat(10 - progress);

        // 3. 基礎與裝備戰力計算
        let baseAtk = (p.level || 1) * 15;
        let gearAtk = 0;
        let gemAtk = 0;

        // 計算武器基礎與強化
        const currentWeapon = p.equipment?.weapon || p.equipping;
        if (currentWeapon) {
            const baseName = currentWeapon.split(' +')[0];
            gearAtk = gearStats[baseName] || 0;

            if (currentWeapon.includes("+")) {
                const level = parseInt(currentWeapon.split('+')[1]);
                gearAtk = Math.floor(gearAtk * (1 + level * 0.5));
            }
        }

        // 計算寶石加成
        if (p.equipment?.slots?.weapon) {
            p.equipment.slots.weapon.forEach(gem => {
                gemAtk += (gemValues[gem] || 0);
            });
        }

        // --- 🌟 核心修改：計算套裝效果加成 ---
        let setAtkBonus = 0;
        let setAtkMult = 0;
        const activeSets = getActiveSets(p);

        activeSets.forEach(s => {
            if (s.bonus.atk) setAtkBonus += s.bonus.atk;
            if (s.bonus.atkMult) setAtkMult += s.bonus.atkMult;
        });

        // 總攻擊力公式：(基礎+裝備+寶石+套裝固定值) * (1 + 套裝百分比加成)
        let totalAtk = (baseAtk + gearAtk + gemAtk + setAtkBonus);
        totalAtk = Math.floor(totalAtk * (1 + setAtkMult));

        // 處理職業加成 (最後乘算)
        if (p.job === "影刃") totalAtk = Math.floor(totalAtk * 1.2);

        // 4. 耐久度處理
        const weaponDur = p.equipment?.durability?.weapon ?? 100;
        const armorDur = p.equipment?.durability?.armor ?? 100;

        // 5. 構建 Embed
        const embed = new EmbedBuilder()
            .setColor(0xff4500)
            .setTitle(`⚔️ ${message.author.username} 的冒險紀錄`)
            .addFields(
                { name: `經驗等級 (Lv. ${p.level || 1})`, value: `${bar} \n(${p.exp || 0} / ${nextExp} Exp)`, inline: false },
                { name: "職業", value: `🎭 ${p.job || "無業遊民"}`, inline: true },
                { name: "金幣", value: `💰 $${p.money || 0}`, inline: true },
                { name: "總攻擊力", value: `🔥 **${totalAtk}**`, inline: false },
                { name: "戰力拆解", value: `基礎 \`${baseAtk}\` + 裝備 \`${gearAtk}\` + 寶石 \`${gemAtk}\`${setAtkBonus > 0 ? ` + 套裝 \`${setAtkBonus}\`` : ""}` },
                { name: "武器狀態", value: `🔹 ${p.equipment?.weapon || "無"}\n耐久: \`${weaponDur}%\``, inline: true },
                { name: "防具狀態", value: `🔸 ${p.equipment?.armor || "無"}\n耐久: \`${armorDur}%\``, inline: true }
            );

        // 如果有鑲嵌寶石，顯示出來
        if (p.equipment?.slots?.weapon?.length > 0) {
            embed.addFields({ name: "💎 武器鑲嵌", value: p.equipment.slots.weapon.join(', '), inline: true });
        }

        // --- 🌟 核心修改：如果套裝生效，顯示套裝效果 ---
        if (activeSets.length > 0) {
            const setDescriptions = activeSets.map(s => `✨ **${s.name}**\n> ${s.desc}`).join('\n');
            embed.addFields({ name: "🌀 套裝共鳴生效中", value: setDescriptions, inline: false });
        }

        await message.reply({ embeds: [embed] });
    }
};