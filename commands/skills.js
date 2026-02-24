const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'skills',
    async execute(message, p, players) {
        const args = message.content.split(' ');
        
        // 定義各職業的技能路徑
        const skillTrees = {
            "appraiser": { name: "精確鑑定", desc: "提升鑑定金幣產出", max: 5, bonus: 0.1 },
            "blacksmith": { name: "神之手", desc: "提升強化成功率 (每級 +2%)", max: 5, bonus: 0.02 },
            "chef": { name: "大胃王", desc: "增加最大精力上限 (每級 +2)", max: 5, bonus: 2 }
        };

        const mySkill = skillTrees[p.job];
        if (!mySkill) return message.reply("❌ **你還沒有職業，無法查看技能。**");

        // 初始化技能等級
        if (!p.skill_level) p.skill_level = 0;

        // --- 功能 A：查看技能 ---
        if (!args[1]) {
            const currentBonus = (p.skill_level * mySkill.bonus * 100).toFixed(0);
            const nextCost = (p.skill_level + 1) * 5000;

            const embed = new EmbedBuilder()
                .setColor(0x3498db)
                .setTitle(`🧪 | 職業技能：${mySkill.name}`)
                .setDescription(
                    `# **等級：Lv. ${p.skill_level} / ${mySkill.max}**\n` +
                    `> **效果 » ${mySkill.desc}**\n` +
                    `> **目前加成 » \`+${currentBonus}${p.job === 'chef' ? '' : '%'}\`**\n` +
                    `**━━━━━━━━━━━━━━**\n\n` +
                    (p.skill_level < mySkill.max 
                        ? `### ⏫ 升級需求\n> **消耗金幣 » \`${nextCost}\` 金**\n> **指令 » \`~skills upgrade\`**`
                        : `### ✨ 技能已達最高等級！`)
                );
            return message.reply({ embeds: [embed] });
        }

        // --- 功能 B：升級技能 ---
        if (args[1] === 'upgrade') {
            if (p.skill_level >= mySkill.max) return message.reply("❌ **技能已達滿級！**");
            
            const cost = (p.skill_level + 1) * 5000;
            if ((p.money || 0) < cost) return message.reply(`❌ **金幣不足：** 需要 \`${cost}\` 金幣。`);

            p.money -= cost;
            p.skill_level += 1;

            // 特殊邏輯：如果是廚師，直接提升最大體力
            if (p.job === 'chef') {
                p.max_energy = (p.max_energy || 10) + 2;
            }

            players[message.author.id] = p;
            fs.writeFileSync('./players.json', JSON.stringify(players, null, 2));

            return message.reply(`🎊 **升級成功！** 你的「${mySkill.name}」已提升至 **Lv.${p.skill_level}**！`);
        }
    }
};
