const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'refine',
    async execute(message, p, players) {
        if (p.job !== 'blacksmith') return message.reply("❌ **權限不足：** 只有「符文鐵匠」能進行精煉。");
        
        // 檢查有沒有可以精煉的廢料 (假設是鑑定後的低階物)
        if ((p.money || 0) < 500) return message.reply("❌ **素材不足：** 精煉需要消耗 500 金幣作為燃料。");

        p.money -= 500;
        
        // 精煉邏輯：有機率大賺，有機率失敗
        const roll = Math.random();
        let msg = "";
        let color = 0x95a5a6;
        let gain = 0;

        if (roll > 0.4) {
            gain = 1500;
            msg = "# 🛠️ **精煉成功！**\n> 你將廢料精煉成了「符文鋼錠」！";
            color = 0xf1c40f;
        } else {
            gain = 100;
            msg = "# 💨 **精煉失敗...**\n> 熔爐溫度不穩，素材變成了灰燼。";
        }

        p.money += gain;
        players[message.author.id] = p;
        fs.writeFileSync('./players.json', JSON.stringify(players, null, 2));

        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle(`⚒️ | 職業技能：符文精煉`)
            .setDescription(
                `${msg}\n` +
                `**━━━━━━━━━━━━━━**\n\n` +
                `## 💰 損益計算\n` +
                `> **燃料消耗 » \`- 500\` 金**\n` +
                `> **獲得產出 » \`+ ${gain}\` 金**\n\n` +
                `**💡 提示：鐵匠可以透過精煉低價值物來翻倍利潤。**`
            );

        await message.reply({ embeds: [embed] });
    }
};
