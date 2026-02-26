const { qualities, tiers, parts, weaponTypes } = require('../utils/equipData.js');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'craft',
    aliases: ['合成', 'hc', 'make'],
    async execute(message, args, p, players) {
        
        // --- 1. 主動顯示合成清單 ---
        if (!args[0]) {
            let recipeList = "";
            for (const [lv, tier] of Object.entries(tiers)) {
                recipeList += `⭐ **Lv.${lv} 系列**：\`${tier.name}\`\n`;
                recipeList += `🔹 需要：\`${tier.material}\` x10 + \`${tier.sub}\` x5\n`;
                recipeList += `💰 費用：\`$${lv * 100}\`\n\n`;
            }

            const helpEmbed = new EmbedBuilder()
                .setColor(0x3498DB)
                .setTitle("🔨 | 裝備合成工坊")
                .setDescription("請輸入等級與部位進行製作\n用法：`~hc [等級] [部位]`\n例：`~hc 10 劍`、`~hc 30 鞋`\n\n" + recipeList)
                .setFooter({ text: "部位支援：劍、弓、矛、頭、甲、鞋" });

            return message.reply({ embeds: [helpEmbed] });
        }

        // --- 2. 參數識別 ---
        const lv = parseInt(args[0]);
        const typeInput = args[1];

        if (!lv || !typeInput || !tiers[lv]) {
            return message.reply("❌ **辨識失敗！** 請輸入正確的等級 (10/30/50/70/90) 與部位。");
        }

        let part = "";
        let type = typeInput;

        const weaponList = ['劍', '弓', '矛'];
        const headList = ['頭', '頭盔', '頂'];
        const armorList = ['甲', '護甲', '衣服', '身'];
        const bootsList = ['鞋', '靴子', '靴', '足'];

        if (weaponList.includes(typeInput)) {
            part = "weapon";
        } else if (headList.includes(typeInput)) {
            part = "head";
            type = "頭盔";
        } else if (armorList.includes(typeInput)) {
            part = "armor";
            type = "護甲";
        } else if (bootsList.includes(typeInput)) {
            part = "boots";
            type = "靴子";
        }

        if (!part) return message.reply("❌ **部位錯誤！** 支援：劍、弓、矛、頭、甲、鞋。");

        const tier = tiers[lv];
        const recipeCost = lv * 100;

        // --- 3. 條件檢查 ---
        if (p.level < lv) return message.reply(`❌ **等級不足！** 你需要 Lv.${lv}。`);
        if (p.money < recipeCost) return message.reply(`❌ **金幣不足！** 需要 \`$${recipeCost}\`。`);
        
        const hasMain = p.inventory[tier.material] || 0;
        const hasSub = p.inventory[tier.sub] || 0;
        if (hasMain < 10 || hasSub < 5) {
            return message.reply(`❌ **材料不足！** 需要：\n📦 10x \`${tier.material}\` (你有: ${hasMain})\n📦 5x \`${tier.sub}\` (你有: ${hasSub})`);
        }

        // --- 4. 隨機決定品質 ---
        const roll = Math.random() * 100;
        let finalQual = "White";
        let accum = 0;
        for (const [q, info] of Object.entries(qualities)) {
            accum += info.chance;
            if (roll <= accum) {
                finalQual = q;
                break;
            }
        }

        // --- 5. 計算屬性 ---
        const baseValue = lv * 10;
        const qMult = qualities[finalQual].mult;
        const pWeight = parts[part].weight;
        let finalStat = Math.floor(baseValue * qMult * pWeight);

        let weaponLabel = "";
        if (part === "weapon") {
            const wType = weaponTypes[type] || weaponTypes["劍"];
            finalStat = Math.floor(finalStat * wType.atkBonus);
            weaponLabel = type;
        }

        // --- 6. 扣除與發放 ---
        p.money -= recipeCost;
        p.inventory[tier.material] -= 10;
        p.inventory[tier.sub] -= 5;
        
        const qInfo = qualities[finalQual];
        const itemName = `${qInfo.label} ${tier.name}${weaponLabel || parts[part].name}`;
        
        p.equipment = p.equipment || {};
        p.equipment[part] = {
            name: itemName,
            stat: finalStat,
            quality: finalQual,
            plus: 0
        };

        // 儲存資料
        players[message.author.id] = p;
        fs.writeFileSync('./players.json', JSON.stringify(players, null, 2));

        // --- 7. 成功 Embed ---
        const successEmbed = new EmbedBuilder()
            .setColor(qInfo.color || 0xFFFFFF)
            .setTitle("⚒️ | 打造成功！")
            .setDescription(`你成功製作出了 **${itemName}**！`)
            .addFields(
                { name: "📊 屬性", value: `\`${part === 'weapon' ? '攻擊力' : '防禦力'} +${finalStat}\``, inline: true },
                { name: "✨ 品質", value: `${qInfo.label}`, inline: true }
            )
            .setFooter({ text: "裝備已自動穿戴在身上。" });

        await message.reply({ embeds: [successEmbed] });
    }
};