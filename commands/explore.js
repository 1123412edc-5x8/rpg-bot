const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const lvSys = require('../utils/levelSystem.js');

module.exports = {
    name: 'explore',
    async execute(message, p, players) {
        // ... (省略之前的冷卻與地點檢查) ...

        // 隨機獲得經驗 (根據地圖等級給予)
        const expGain = Math.floor(Math.random() * 20) + 10;
        p.exp = (p.exp || 0) + expGain;

        let levelUpMsg = "";
        if (lvSys.checkLevelUp(p)) {
            levelUpMsg = `\n🎊 **恭喜升級！你現在是 Lv.${p.level} 了！**\n💰 獲得升級獎勵金幣並恢復體力！`;
        }

        // 存檔
        players[message.author.id] = p;
        fs.writeFileSync('./players.json', JSON.stringify(players, null, 2));

        const embed = new EmbedBuilder()
            .setColor(0x3498db)
            .setTitle("🔎 探索完成")
            .setDescription(`你獲得了 \`${expGain}\` 經驗值！${levelUpMsg}`);
            
        await message.reply({ embeds: [embed] });
    }
};
