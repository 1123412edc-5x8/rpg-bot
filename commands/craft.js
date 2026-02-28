// 🚩 請確認你的資料夾名稱是叫 "工具" 還是 "utils"
const data = require('../utils/equipData.js'); 
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'craft',
    aliases: ['合成', 'hc', 'make'],
    async execute(message, args, p, players) {
        
        // 從導入的 data 中取出資料
        const items = data.items;
        const qualities = data.qualities;

        // 🚨 安全檢查
        if (!items || !qualities) {
            return message.reply("❌ **數據讀取失敗**：請檢查 `工具/equipData.js` 檔案。");
        }

        const clean = (str) => str ? str.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu, "").trim() : "";

        // --- 1. 顯示合成表 ---
        if (!args[0]) {
            const list = Object.keys(items).map(name => `🔹 **${name}** (Lv.${items[name].level})`).join('\n');
            const helpEmbed = new EmbedBuilder()
                .setColor(0x3498DB)
                .setTitle("🔨 | 裝備合成工坊")
                .setDescription(`請輸入裝備全名進行製作\n用法：\`~hc [裝備名稱]\`\n\n**可製作清單：**\n${list}`)
                .setFooter({ text: "請確保材料足夠！" });

            return message.reply({ embeds: [helpEmbed] });
        }

        // --- 2. 搜尋裝備 ---
        const targetName = args.join(' '); 
        const recipe = items[targetName];

        if (!recipe) {
            return message.reply(`❌ **找不到配方**：\`${targetName}\`。請輸入正確的裝備名稱！`);
        }

        // --- 3. 檢查等級與金錢 ---
        if (p.level < recipe.level) return message.reply(`❌ **等級不足**：製作需要 Lv.${recipe.level}。`);
        const cost = recipe.level * 100;
        if (p.money < cost) return message.reply(`❌ **金幣不足**：需要 \`$${cost}\`。`);

        // --- 4. 檢查材料 (智能匹配 Emoji) ---
        let missing = [];
        for (const [mName, needAmount] of Object.entries(recipe.mats)) {
            const pureMName = clean(mName);
            // 同時檢查帶 Emoji 名稱與純文字名稱
            const hasAmount = (p.inventory[mName] || 0) + (p.inventory[pureMName] || 0);
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
            const pureMName = clean(mName);
            // 優先扣除帶標籤的，不夠再扣沒標籤的
            if ((p.inventory[mName] || 0) >= needAmount) {
                p.inventory[mName] -= needAmount;
            } else {
                p.inventory[pureMName] -= needAmount;
            }
        }

        // --- 6. 發放裝備 ---
        const qInfo = qualities[recipe.quality] || { label: "⚪ 普通", mult: 1.0, color: 0xffffff };
        const part = recipe.type; 
        const baseStat = recipe.atk || recipe.def || 0;
        const finalStat = Math.floor(baseStat * qInfo.mult);

        p.equipment = p.equipment || {};
        p.equipment[part] = {
            name: `${qInfo.label} ${targetName}`,
            stat: finalStat,
            quality: recipe.quality,
            plus: 0
        };

        // 儲存資料
        players[message.author.id] = p;
        const playersPath = path.join(__dirname, '../players.json');
        fs.writeFileSync(playersPath, JSON.stringify(players, null, 2));

        // --- 7. 成功 Embed ---
        const successEmbed = new EmbedBuilder()
            .setColor(qInfo.color)
            .setTitle("⚒️ | 打造成功！")
            .setDescription(`你成功製作出了 **${qInfo.label} ${targetName}**！`)
            .addFields(
                { name: `📊 ${part === 'weapon' ? '攻擊力' : '防禦力'}`, value: `\`+${finalStat}\``, inline: true },
                { name: "✨ 品質", value: `${qInfo.label}`, inline: true }
            )
            .setFooter({ text: "裝備已自動穿戴在身上。" });

        await message.reply({ embeds: [successEmbed] });
    }
};