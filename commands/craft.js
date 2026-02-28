const data = require('../utils/equipData.js'); 
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'craft',
    aliases: ['合成', 'hc', 'make'],
    async execute(message, args, p, players) {
        
        const items = data.items;
        const qualities = data.qualities;

        if (!items || !qualities) {
            return message.reply("❌ **數據讀取失敗**：請檢查 `utils/equipData.js`。");
        }

        const clean = (str) => str ? str.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu, "").trim() : "";

        // --- 1. 顯示精美合成清單 ---
        if (!args[0]) {
            const embed = new EmbedBuilder()
                .setColor(0x3498DB)
                .setTitle("🔨 裝備合成工坊")
                .setDescription("使用方法：`~hc [裝備名稱]` (例如：`~hc 精鋼長矛`)\n---")
                .setTimestamp();

            // 把裝備分門別類顯示，排版才不會亂跳
            let categoryText = "";
            for (const [name, info] of Object.entries(items)) {
                const matList = Object.entries(info.mats)
                    .map(([mName, amount]) => {
                        const has = (p.inventory[mName] || 0) + (p.inventory[clean(mName)] || 0);
                        return `${mName} \`${has}/${amount}\``;
                    }).join(" | ");

                categoryText += `🔹 **${name}** (Lv.${info.level})\n└ 需求：${matList}\n\n`;
            }

            embed.addFields({ name: "📜 可製作配方 (名稱 | 所需材料 | 你的持有量)", value: categoryText });

            return message.reply({ embeds: [embed] });
        }

        // --- 2. 搜尋與匹配 ---
        const targetName = args.join(' '); 
        const recipe = items[targetName];

        if (!recipe) {
            return message.reply(`❌ **找不到配方**：\`${targetName}\`。請輸入正確全名 (如：\`新手的木弓\`)`);
        }

        // --- 3. 檢查條件 ---
        if (p.level < recipe.level) return message.reply(`❌ **等級不足**：你的等級不足 Lv.${recipe.level}。`);
        
        const cost = recipe.level * 100;
        if (p.money < cost) return message.reply(`❌ **金幣不足**：製作此裝備需要 \`$${cost}\`。`);

        // --- 4. 檢查材料 (智能匹配) ---
        let missing = [];
        let matSummary = "";
        for (const [mName, needAmount] of Object.entries(recipe.mats)) {
            const pureMName = clean(mName);
            const hasAmount = (p.inventory[mName] || 0) + (p.inventory[pureMName] || 0);
            
            if (hasAmount < needAmount) {
                missing.push(`${mName} (缺少 ${needAmount - hasAmount})`);
            }
            matSummary += `${mName}: \`${hasAmount}/${needAmount}\`\n`;
        }

        if (missing.length > 0) {
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setTitle("❌ 材料不足")
                    .setColor(0xFF0000)
                    .setDescription(`製作 **${targetName}** 失敗！\n\n**當前進度：**\n${matSummary}`)
                ]
            });
        }

        // --- 5. 扣除與製作 ---
        p.money -= cost;
        for (const [mName, needAmount] of Object.entries(recipe.mats)) {
            const pureMName = clean(mName);
            if ((p.inventory[mName] || 0) >= needAmount) {
                p.inventory[mName] -= needAmount;
            } else {
                p.inventory[pureMName] -= needAmount;
            }
        }

        const qInfo = qualities[recipe.quality] || { label: "⚪ 普通", mult: 1.0, color: 0xffffff };
        const statType = (recipe.type === 'weapon') ? '攻擊力' : '防禦力';
        const baseValue = recipe.atk || recipe.def || 0;
        const finalStat = Math.floor(baseValue * qInfo.mult);

        p.equipment = p.equipment || {};
        p.equipment[recipe.type] = {
            name: `${qInfo.label} ${targetName}`,
            stat: finalStat,
            quality: recipe.quality,
            plus: 0
        };

        // 儲存
        players[message.author.id] = p;
        fs.writeFileSync(path.join(__dirname, '../players.json'), JSON.stringify(players, null, 2));

        // --- 6. 成功畫面 ---
        const successEmbed = new EmbedBuilder()
            .setColor(qInfo.color)
            .setTitle("⚒️ 打造成功！")
            .setDescription(`你獲得了 **${qInfo.label} ${targetName}**`)
            .addFields(
                { name: `📊 ${statType}`, value: `\`+${finalStat}\``, inline: true },
                { name: "✨ 品質", value: `${qInfo.label}`, inline: true }
            )
            .setFooter({ text: "裝備已自動穿戴在身上。" });

        await message.reply({ embeds: [successEmbed] });
    }
};