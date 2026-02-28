const { qualities, items } = require('../utils/equipData.js'); // 注意路徑
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'craft',
    aliases: ['合成', 'hc', 'make'],
    async execute(message, args, p, players) {
        // 🚨 安全檢查
        if (!items) return message.reply("❌ **系統錯誤**：找不到裝備清單 (items)。");

        const clean = (str) => str ? str.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu, "").trim() : "";

        // --- 1. 顯示合成表 ---
        if (!args[0]) {
            const helpEmbed = new EmbedBuilder()
                .setColor(0x3498DB)
                .setTitle("🔨 | 裝備合成工坊")
                .setDescription("請輸入裝備全名進行製作\n用法：`~hc [裝備名稱]`\n例如：`~hc 精鋼長矛`\n\n**可製作清單：**\n" + 
                    Object.keys(items).map(name => `🔹 **${name}** (Lv.${items[name].level})`).join('\n'))
                .setFooter({ text: "請確保材料足夠！" });

            return message.reply({ embeds: [helpEmbed] });
        }

        // --- 2. 搜尋裝備 ---
        const targetName = args.join(' '); // 支援有空格的名稱
        const recipe = items[targetName];

        if (!recipe) {
            return message.reply(`❌ **找不到配方**：\`${targetName}\`。請輸入完整的裝備名稱！`);
        }

        // --- 3. 檢查等級與金錢 ---
        if (p.level < recipe.level) return message.reply(`❌ **等級不足**：製作此裝備需要 Lv.${recipe.level}。`);
        const cost = recipe.level * 100; // 假設費用是等級x100
        if (p.money < cost) return message.reply(`❌ **金幣不足**：需要 \`$${cost}\`。`);

        // --- 4. 檢查材料 (智能匹配) ---
        let missing = [];
        for (const [mName, needAmount] of Object.entries(recipe.mats)) {
            const pureMName = clean(mName);
            const hasAmount = p.inventory[mName] || p.inventory[pureMName] || 0;
            if (hasAmount < needAmount) {
                missing.push(`- ${mName} (缺少 ${needAmount - hasAmount})`);
            }
        }

        if (missing.length > 0) {
            return message.reply(`❌ **材料不足**：\n${missing.join('\n')}`);
        }

        // --- 5. 扣除材料與金幣 ---
        p.money -= cost;
        for (const [mName, needAmount] of Object.entries(recipe.mats)) {
            if (p.inventory[mName] >= needAmount) p.inventory[mName] -= needAmount;
            else p.inventory[clean(mName)] -= needAmount;
        }

        // --- 6. 發放裝備 ---
        const qualityInfo = qualities[recipe.quality] || qualities.White;
        const part = recipe.type; // weapon, head, armor, boots
        
        // 計算屬性 (基礎值 * 品質倍率)
        const baseStat = recipe.atk || recipe.def || 0;
        const finalStat = Math.floor(baseStat * qualityInfo.mult);

        p.equipment = p.equipment || {};
        p.equipment[part] = {
            name: `${qualityInfo.label} ${targetName}`,
            stat: finalStat,
            quality: recipe.quality,
            plus: 0
        };

        // 儲存資料
        players[message.author.id] = p;
        fs.writeFileSync(path.join(__dirname, '../players.json'), JSON.stringify(players, null, 2));

        // --- 7. 成功 Embed ---
        const successEmbed = new EmbedBuilder()
            .setColor(qualityInfo.color)
            .setTitle("⚒️ | 打造成功！")
            .setDescription(`你成功製作出了 **${qualityInfo.label} ${targetName}**！`)
            .addFields(
                { name: `📊 ${part === 'weapon' ? '攻擊力' : '防禦力'}`, value: `\`+${finalStat}\``, inline: true },
                { name: "✨ 品質", value: `${qualityInfo.label}`, inline: true }
            )
            .setFooter({ text: "裝備已自動穿戴。" });

        await message.reply({ embeds: [successEmbed] });
    module.exports = { qualities, items };
        }
};