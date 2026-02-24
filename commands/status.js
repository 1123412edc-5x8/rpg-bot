const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const professions = require('../professions.json');
const emojis = require('../emojis.json');
const achievements = require('../achievements.json');

module.exports = {
    name: 'status',
    async execute(message, p, players) {
        // 1. 取得職業資料
        const jobData = professions[p.job] || { name: "無職業", emoji: "❓", skill: "無", cmd: "none" };
        
        // 2. 稱號系統
        if (!p.achievements) p.achievements = [];
        let titles = p.achievements.map(key => achievements[key] ? `【${achievements[key].reward}】` : "").join("");
        if (titles === "") titles = "【初出茅廬】";

        // 3. 體力與自動恢復
        const maxE = 10 + (Math.floor(p.level / 5) * 2);
        const now = Date.now();
        if (!p.last_restore_time) p.last_restore_time = now;
        const diff = now - p.last_restore_time;
        const recoverPoints = Math.floor(diff / (10 * 60 * 1000));

        if (recoverPoints > 0) {
            p.energy = Math.min(maxE, (p.energy || 0) + recoverPoints);
            p.last_restore_time = now;
            players[message.author.id] = p;
            fs.writeFileSync('./players.json', JSON.stringify(players, null, 2));
        }

        // 4. 🌟 核心戰力計算 (包含洗煉詞綴)
        const gearBase = { "生鏽的短劍": 10, "【精良】探險家長靴": 40, "【史詩】符文重錘": 150, "【傳說】亞特蘭提斯之鋒": 500 };
        let baseAtk = (p.level || 1) * 15;
        let gearAtk = 0;

        // 武器基礎與強化
        if (p.equipment?.weapon) {
            const bName = p.equipment.weapon.split(' +')[0];
            gearAtk = gearBase[bName] || 0;
            if (p.equipment.weapon.includes("+")) {
                const lv = parseInt(p.equipment.weapon.split('+')[1]);
                gearAtk = Math.floor(gearAtk * (1 + lv * 0.5));
            }
        }

        let totalAtk = baseAtk + gearAtk;

        // 🌟 處理洗煉詞綴 (Reforge)
        let prefixLabel = "";
        if (p.equipment?.prefix) {
            prefixLabel = ` **[${p.equipment.prefix.name}]**`;
            if (p.equipment.prefix.atkMult) {
                totalAtk = Math.floor(totalAtk * (1 + p.equipment.prefix.atkMult));
            }
        }

        // 職業加成
        if (p.job === "影刃") totalAtk = Math.floor(totalAtk * 1.2);

        // 5. 經驗條
        const nextExp = Math.pow(p.level, 2) * 100;
        const progress = Math.min(Math.floor((p.exp / nextExp) * 10), 10);
        const bar = '▰'.repeat(progress) + '▱'.repeat(10 - progress);

        // 6. 構建 Embed
        const embed = new EmbedBuilder()
            .setColor(0x2F3136)
            .setAuthor({ name: `📜 冒險者檔案：${message.author.username}`, iconURL: message.author.displayAvatarURL() })
            .setDescription(
                `# ${jobData.emoji} ${titles}\n` +
                `## **${jobData.name}**\n` +
                `> **冒險等級 » \`LV. ${p.level}\`**\n` +
                `**━━━━━━━━━━━━━━**\n\n` +
                `## ⚔️ **戰鬥能力**\n` +
                `> **總攻擊力：\`🔥 ${totalAtk}\`**\n` +
                `> **當前武器：\`${p.equipment?.weapon || "赤手空拳"}\`${prefixLabel}**\n\n` +
                `## ⚡ **職業專屬技能**\n` +
                `> **技能：\`${jobData.skill}\` ( ~${jobData.cmd} )**\n\n` +
                `## ${emojis.stats.hp} **角色狀態**\n` +
                `> **精力值：\`${p.energy || 0} / ${maxE}\`** 🟢\n` +
                `> **持有金：\`${p.money || 0}\` 金**\n\n` +
                `## ${emojis.stats.exp} **成長進度**\n` +
                `> **\`${bar}\` (${p.exp}/${nextExp})**\n` +
                `**━━━━━━━━━━━━━━**`
            )
            .setFooter({ text: `🏆 成就數：${p.achievements.length} | 總攻已計算強化、洗煉與職業加成` });

        await message.reply({ embeds: [embed] });
    }
};