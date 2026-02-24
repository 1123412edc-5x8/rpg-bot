const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const checkCooldown = require('../utils/cooldown.js');

module.exports = {
    name: 'raid',
    async execute(message, p, players) {
        // 1. 冷卻檢查 (副本較長，建議 1 小時)
        const timeLeft = checkCooldown(message.author.id, 'raid', 3600);
        if (timeLeft) {
            return message.reply(`⏳ 你的精神尚未恢復，請等待 \`${Math.ceil(timeLeft / 60)}\` 分鐘後再進入副本。`);
        }

        if (!p.job) return message.reply("❌ 你尚未覺醒職業，無法進入時空裂縫！");
        if (p.energy < 5) return message.reply("❌ 體力不足（至少需要 5 點）。");

        // 2. 副本設定
        const raidBoss = { name: "🌀 時空守望者", hp: 10000, minAtk: 1200 };
        
        // 3. 計算職業加成 (對接你的 professions.json)
        let playerAtk = (p.level || 1) * 20;
        let bonusDesc = "";

        if (p.job === "影刃") {
            playerAtk *= 1.8; // 影刃副本爆發高
            bonusDesc = "🗡️ **影刃天賦：** 暴擊傷害提升！";
        } else if (p.job === "符文鐵匠") {
            playerAtk *= 1.3;
            bonusDesc = "🔨 **鐵匠天賦：** 裝備共鳴效果提升！";
        } else if (p.job === "古代祭司") {
            p.energy += 2; // 祭司在副本內較不累
            bonusDesc = "✨ **祭司天賦：** 神聖加護減少了體力消耗！";
        }

        // 4. 勝負判定
        const isWin = playerAtk >= raidBoss.minAtk;
        const embed = new EmbedBuilder();

        if (isWin) {
            const rewardMoney = 5000 + (p.level * 100);
            const rewardExp = 2000;
            p.money += rewardMoney;
            p.exp += rewardExp;
            p.energy -= 5;

            embed.setColor(0x00ff00)
                .setTitle(`⚔️ 副本捷報：擊敗 ${raidBoss.name}`)
                .setDescription(`${bonusDesc}\n\n你成功穩定住了時空裂縫！\n> 💰 獲得金幣：\`$${rewardMoney}\`\n> 📈 獲得經驗：\`${rewardExp}\`\n\n*(職業進階材料已存入背包)*`);
        } else {
            p.energy = 0; // 失敗代價
            embed.setColor(0xff0000)
                .setTitle(`💀 副本潰敗：${raidBoss.name}`)
                .setDescription(`你的戰力 (\`${Math.floor(playerAtk)}\`) 不足，被震出了時空裂縫！\n你耗盡了所有體力，狼狽地逃回村莊。`);
        }

        players[message.author.id] = p;
        fs.writeFileSync('./players.json', JSON.stringify(players, null, 2));
        await message.reply({ embeds: [embed] });
    }
};
