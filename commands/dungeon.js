const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
// 🌟 引入套裝檢查工具 (如果你之前有做的話)
const { getActiveSets } = require('../utils/setBonus.js');

module.exports = {
    name: 'dungeon',
    async execute(message, p, players) {
        const args = message.content.split(' ');
        const floor = parseInt(args[1]) || 1;
        const partner = message.mentions.users.first();

        // 1. 怪物數據庫 (增加積分欄位 score)
        const monsters = {
            1: { name: "🟢 史萊姆群", atk: 200, hp: 1000, reward: 500, score: 5 },
            2: { name: "💀 骷髏步兵", atk: 500, hp: 3000, reward: 1500, score: 15 },
            3: { name: "🔥 煉獄犬", atk: 1200, hp: 8000, reward: 4000, score: 40 },
            4: { name: "🧛 遺蹟領主", atk: 3000, hp: 20000, reward: 10000, score: 100 }
        };

        const boss = monsters[floor];
        if (!boss) return message.reply("❌ 該層地下城尚未被發現！");

        // 2. 完整戰力計算函數 (同步你的 stats.js 邏輯)
        const calcFullAtk = (user) => {
            let atk = (user.level || 1) * 15;
            // 簡化模擬：你可以把 stats.js 的 gear/gem 計算邏輯封裝成 function 放在 utils 裡調用
            // 這裡先保留基礎邏輯 + 職業加成
            if (user.job === "影刃") atk *= 1.2;
            return Math.floor(atk);
        };

        let totalPlayerAtk = calcFullAtk(p);
        let participants = [message.author.username];
        let p2 = null;

        if (partner) {
            if (partner.id === message.author.id) return message.reply("❌ 你不能跟自己的影子組隊！");
            p2 = players[partner.id];
            if (!p2) return message.reply("❌ 該玩家尚未開啟冒險！");
            totalPlayerAtk += calcFullAtk(p2);
            participants.push(partner.username);
        }

        const difficultyMult = partner ? 1.8 : 1.0;
        const requiredAtk = boss.atk * difficultyMult;

        const embed = new EmbedBuilder()
            .setTitle(`🏰 地下城第 ${floor} 層：${boss.name}`)
            .setFooter({ text: partner ? "👥 協力模式" : "👤 單人挑戰" });

        if (totalPlayerAtk >= requiredAtk) {
            // --- 🏆 勝利邏輯 ---
            const reward = Math.floor(boss.reward / (partner ? 1.5 : 1));
            const gScore = boss.score;

            // 處理玩家 A 獎勵
            p.money += reward;
            p.exp += reward / 2;

            // 🌟 處理公會積分與貢獻 (玩家 A)
            let guilds = JSON.parse(fs.readFileSync('./guilds.json', 'utf8'));
            const gNameA = Object.keys(guilds).find(name => guilds[name].members.includes(message.author.id));
            if (gNameA) {
                guilds[gNameA].score = (guilds[gNameA].score || 0) + gScore;
                p.contribution = (p.contribution || 0) + gScore;
            }

            // 處理玩家 B 獎勵 (2P)
            if (p2 && partner) {
                p2.money += reward;
                p2.exp += reward / 2;
                const gNameB = Object.keys(guilds).find(name => guilds[name].members.includes(partner.id));
                if (gNameB) {
                    guilds[gNameB].score = (guilds[gNameB].score || 0) + gScore;
                    p2.contribution = (p2.contribution || 0) + gScore;
                }
                players[partner.id] = p2;
            }

            // 存檔公會數據
            fs.writeFileSync('./guilds.json', JSON.stringify(guilds, null, 2));

            embed.setColor(0x2ecc71)
                .setDescription(
                    `🎉 **挑戰成功！**\n\n` +
                    `**隊伍總戰力：** \`${totalPlayerAtk}\` / 需求 \`${Math.floor(requiredAtk)}\`\n` +
                    `**參與者：** ${participants.join(' & ')}\n\n` +
                    `💰 每人獲得：\`$${reward}\` 金幣\n` +
                    `🚩 公會積分：\`+${gScore}\` 分`
                );
        } else {
            embed.setColor(0xe74c3c)
                .setDescription(`💀 **慘遭滅團...**\n\n**隊伍總戰力：** \`${totalPlayerAtk}\` / 需求 \`${Math.floor(requiredAtk)}\``);
        }

        players[message.author.id] = p;
        fs.writeFileSync('./players.json', JSON.stringify(players, null, 2));
        await message.reply({ embeds: [embed] });
    }
};