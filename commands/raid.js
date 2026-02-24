const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
// 🌟 修正點 1：使用解構賦值對接 utils/cooldown.js
const { checkCooldown } = require('../utils/cooldown.js');

module.exports = {
    name: 'raid',
    async execute(message, p, players) {
        // 1. 冷卻檢查
        const timeLeft = checkCooldown(message.author.id, 'raid', 3600);
        if (timeLeft) {
            // 🌟 修正點 2：因為 checkCooldown 回傳的是剩餘秒數，直接顯示即可
            return message.reply(`⏳ 你的精神尚未恢復，請等待 \`${Math.ceil(timeLeft / 60)}\` 分鐘後再進入副本。`);
        }

        if (!p.job) return message.reply("❌ 你尚未覺醒職業，無法進入時空裂縫！");
        // 建議這裡也判斷一下 p.energy 是否存在，避免報錯
        if ((p.energy || 0) < 5) return message.reply("❌ 體力不足（至少需要 5 點）。");

        // 2. 副本設定
        const raidBoss = { name: "🌀 時空守望者", hp: 10000, minAtk: 1200, score: 250 };
        
        // 3. 計算職業加成
        let playerAtk = (p.level || 1) * 20;
        let bonusDesc = "";

        if (p.job === "影刃") {
            playerAtk *= 1.8;
            bonusDesc = "🗡️ **影刃天賦：** 暴擊傷害提升！";
        } else if (p.job === "符文鐵匠") {
            playerAtk *= 1.3;
            bonusDesc = "🔨 **鐵匠天賦：** 裝備共鳴效果提升！";
        } else if (p.job === "古代祭司") {
            p.energy = (p.energy || 0) + 2; 
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

            // 🌟 5. 加入公會積分獎勵
            let guildBonusText = "";
            if (fs.existsSync('./guilds.json')) {
                let guilds = JSON.parse(fs.readFileSync('./guilds.json', 'utf8'));
                const gName = Object.keys(guilds).find(name => guilds[name].members.includes(message.author.id));
                if (gName) {
                    guilds[gName].score = (guilds[gName].score || 0) + raidBoss.score;
                    p.contribution = (p.contribution || 0) + raidBoss.score;
                    fs.writeFileSync('./guilds.json', JSON.stringify(guilds, null, 2));
                    guildBonusText = `\n🚩 **公會積分：** \`+${raidBoss.score}\` (個人貢獻已同步)`;
                }
            }

            embed.setColor(0x00ff00)
                .setTitle(`⚔️ 副本捷報：擊敗 ${raidBoss.name}`)
                .setDescription(`${bonusDesc}\n\n你成功穩定住了時空裂縫！\n> 💰 獲得金幣：\`$${rewardMoney}\`\n> 📈 獲得經驗：\`${rewardExp}\`${guildBonusText}\n\n*(職業進階材料已存入背包)*`);
        } else {
            p.energy = 0; 
            embed.setColor(0xff0000)
                .setTitle(`💀 副本潰敗：${raidBoss.name}`)
                .setDescription(`你的戰力 (\`${Math.floor(playerAtk)}\`) 不足，被震出了時空裂縫！\n你耗盡了所有體力，狼狽地逃回村莊。`);
        }

        players[message.author.id] = p;
        fs.writeFileSync('./players.json', JSON.stringify(players, null, 2));
        await message.reply({ embeds: [embed] });
    }
};