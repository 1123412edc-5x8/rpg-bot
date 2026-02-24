const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'job',
    async execute(message, p, players) {
        const args = message.content.split(' ');
        const jobKey = args[1];

        // 1. 讀取你自定義的職業檔案
        const professions = JSON.parse(fs.readFileSync('./professions.json', 'utf8'));

        // 2. 顯示可用職業清單 (如果沒輸入代號)
        if (!jobKey || !professions[jobKey]) {
            let list = "### 📜 遺蹟職業公報\n\n";
            for (const [key, info] of Object.entries(professions)) {
                // 只顯示第一階段職業 (req_level 為 10 的)
                if (info.req_level <= 10) {
                    list += `**[ ${key} ] ${info.name}**\n> 🎭 類型: \`${info.type}\` | ⚖️ 需求: \`Lv.${info.req_level}\` \n> ✨ 效果: ${info.desc}\n\n`;
                }
            }
            list += "👉 **請輸入：** `~job [職業代號]` (例如: `~job blacksmith`)";
            
            const embed = new EmbedBuilder().setColor(0x3498db).setTitle("🏛️ | 職業覺醒中心").setDescription(list);
            return message.reply({ embeds: [embed] });
        }

        const selected = professions[jobKey];

        // 3. 檢查等級是否符合你設定的 req_level
        if ((p.level || 1) < selected.req_level) {
            return message.reply(`❌ **等級不足！** 成為 **${selected.name}** 需要達到 Lv.${selected.req_level}。`);
        }

        // 4. 檢查是否已經有職業
        if (p.job) return message.reply(`❌ 你已經是 **${p.job}** 了，術業有專攻！`);

        // 5. 執行轉職並存檔
        p.job = selected.name;
        players[message.author.id] = p;
        fs.writeFileSync('./players.json', JSON.stringify(players, null, 2));

        const successEmbed = new EmbedBuilder()
            .setColor(0x2ecc71)
            .setTitle("🎊 職業覺醒成功！")
            .setDescription(`你現在正式成為一名 **${selected.name}**！\n> *${selected.desc}*`);
        
        await message.reply({ embeds: [successEmbed] });
    }
};
