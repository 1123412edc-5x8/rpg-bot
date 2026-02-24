const { EmbedBuilder, ComponentType, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'duo',
    async execute(message, p, players) {
        const target = message.mentions.users.first();
        if (!target || target.id === message.author.id) {
            return message.reply("❌ **組隊失敗：** 請標註一位隊友！(例如：`~duo @朋友`) ");
        }

        const p2 = players[target.id];
        if (!p2) return message.reply("❌ **對方還沒開始冒險！**");

        // 1. 檢查雙方體力 (各需 5 點)
        if ((p.energy || 0) < 5 || (p2.energy || 0) < 5) {
            return message.reply("❌ **體力不足：** 組隊副本需要雙方各有 5 點精力。");
        }

        // 2. 發送邀請按鈕
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('accept').setLabel('接受挑戰').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('refuse').setLabel('拒絕').setStyle(ButtonStyle.Danger)
        );

        const inviteEmbed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle("⚔️ | 副本組隊邀請")
            .setDescription(`<@${message.author.id}> 邀請 <@${target.id}> 一起挑戰 **【深淵巢穴】**！\n> **消耗：雙方各 5 ⚡**\n> **獎勵：大量金幣與稀有裝備**`);

        const response = await message.reply({ embeds: [inviteEmbed], components: [row] });

        // 3. 等待對方回應 (限時 30 秒)
        const filter = i => i.user.id === target.id;
        try {
            const confirmation = await response.awaitMessageComponent({ filter, time: 30000 });

            if (confirmation.customId === 'accept') {
                // --- 戰鬥邏輯開始 ---
                p.energy -= 5;
                p2.energy -= 5;

                // 合力傷害：(等級 + 裝備) 的總和
                const calcDmg = (player) => {
                    let d = player.level * 15;
                    player.backpack.forEach(i => {
                        if (i.includes("+1")) d += 30;
                        if (i.includes("+2")) d += 70;
                        if (i.includes("+3")) d += 150;
                    });
                    return d;
                };

                const totalDmg = calcDmg(p) + calcDmg(p2);
                const monsterHp = 300 + Math.floor(Math.random() * 500); // 隨機怪物血量
                const isWin = totalDmg >= monsterHp;

                let resultEmbed = new EmbedBuilder();
                if (isWin) {
                    const prize = Math.floor(monsterHp * 2.5);
                    p.money += prize;
                    p2.money += prize;
                    resultEmbed
                        .setColor(0x2ecc71)
                        .setTitle("🏆 | 副本攻略成功！")
                        .setDescription(`# **擊殺：深淵巨口**\n> **總傷害 » \`${totalDmg} / ${monsterHp}\`**\n\n### 💰 分紅獎勵\n> **<@${p.id}> 獲得 \`${prize}\` 金**\n> **<@${p2.id}> 獲得 \`${prize}\` 金**`);
                } else {
                    resultEmbed
                        .setColor(0xe74c3c)
                        .setTitle("💀 | 副本挑戰失敗...")
                        .setDescription(`# **你們被怪物擊退了！**\n> **總傷害 » \`${totalDmg} / ${monsterHp}\`**\n> 體力白花了，下次變強再來吧！`);
                }

                await confirmation.update({ embeds: [resultEmbed], components: [] });
                
                // 存檔
                players[message.author.id] = p;
                players[target.id] = p2;
                fs.writeFileSync('./players.json', JSON.stringify(players, null, 2));

            } else {
                await confirmation.update({ content: "❌ 邀請被拒絕了。", embeds: [], components: [] });
            }
        } catch (e) {
            await response.edit({ content: "⌛ 回應超時，組隊取消。", embeds: [], components: [] });
        }
    }
};
