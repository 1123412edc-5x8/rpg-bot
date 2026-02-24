const { EmbedBuilder } = require('discord.js');

// 儲存當前事件狀態
let currentBoss = null;

module.exports = {
    name: 'event',
    async execute(message, p, players) {
        const args = message.content.split(' ');

        // --- 功能 A：管理員手動開啟事件 (測試用) ---
        if (args[1] === 'start' && message.member.permissions.has('Administrator')) {
            currentBoss = {
                name: "💎 遠古晶鑽巨像",
                hp: 5000,
                maxHp: 5000,
                reward: 20000,
                attackers: {} // 紀錄每個人的傷害
            };
            return message.channel.send("📢 **【世界事件】遠古晶鑽巨像 在遺蹟深處甦醒了！全體冒險者即刻前往討伐！**\n> 指令：`~event attack` ");
        }

        // --- 功能 B：玩家參與攻擊 ---
        if (args[1] === 'attack') {
            if (!currentBoss) return message.reply("📭 目前沒有世界事件發生。");
            
            // 計算戰力 (引用之前的 stats 邏輯)
            const dmg = p.level * 15 + (p.backpack.length * 5); // 簡化版戰力
            
            currentBoss.hp -= dmg;
            currentBoss.attackers[message.author.id] = (currentBoss.attackers[message.author.id] || 0) + dmg;

            if (currentBoss.hp <= 0) {
                // 結算獎勵
                const topAttackerId = Object.keys(currentBoss.attackers).reduce((a, b) => currentBoss.attackers[a] > currentBoss.attackers[b] ? a : b);
                const reward = currentBoss.reward;
                
                // 給第一名發獎金
                if (players[topAttackerId]) players[topAttackerId].money += reward;
                
                const winEmbed = new EmbedBuilder()
                    .setColor(0xFFD700)
                    .setTitle("🎊 世界事件達成！")
                    .setDescription(`**${currentBoss.name}** 已被擊敗！\n\n🏆 **MVP：** <@${topAttackerId}>\n💰 **獎勵：** \`$${reward}\` 分發給予貢獻者！`);
                
                currentBoss = null; // 重置事件
                return message.channel.send({ embeds: [winEmbed] });
            }

            return message.reply(`⚔️ 你對 BOSS 造成了 \`${dmg}\` 點傷害！ (剩餘血量: ${currentBoss.hp})`);
        }

        // --- 功能 C：查看當前狀態 ---
        if (!args[1]) {
            if (!currentBoss) return message.reply("🌲 遺蹟目前很平靜...");
            const embed = new EmbedBuilder()
                .setTitle(`🚨 當前威脅：${currentBoss.name}`)
                .setDescription(`HP: ${currentBoss.hp} / ${currentBoss.maxHp}\n擊敗它可獲得大量公會資金與稱號獎勵！`)
                .setColor(0xff0000);
            return message.reply({ embeds: [embed] });
        }
    }
};
