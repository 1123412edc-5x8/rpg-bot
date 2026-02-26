const { EmbedBuilder } = require('discord.js');
const { maps } = require('../utils/mapData.js');
const playerCalc = require('../utils/playerCalc.js');
const fs = require('fs');

module.exports = {
    name: 'explore',
    aliases: ['ex', '冒險', '探險', 'go'], // 這裡加入別名
    async execute(message, args, p, players) {
        // 1. 地圖設定
        const mapName = args[0] || "翡翠平原";
        const map = maps[mapName];
        if (!map) return message.reply("📍 **找不到該地圖！**\n用法：`~ex 翡翠平原`。");

        // 2. 數值防呆與計算
        p.energy = p.energy ?? 12; 
        const stats = playerCalc.getStats(p);
        const maxEnergy = stats.maxEnergy || 12;
        const maxHp = stats.maxHp || 100;

        // 3. 體力檢查
        if (p.energy < map.cost) {
            return message.reply(`🔋 **體力不足！**\n需要 \`${map.cost}\` 點，你目前剩下 \`${p.energy}\` 點。`);
        }

        // 4. 戰鬥計算
        p.energy -= map.cost;
        const monsterAtk = Math.floor(map.baseDmg * (0.8 + Math.random() * 0.4));
        const finalDamage = Math.max(10, monsterAtk - (stats.totalDef || 0));
        p.hp -= finalDamage;

        // 5. 死亡判定
        if (p.hp <= 0) {
            p.hp = 0;
            const loss = Math.floor((p.money || 0) * 0.2);
            p.money = Math.max(0, (p.money || 0) - loss);
            
            players[message.author.id] = p;
            fs.writeFileSync('./players.json', JSON.stringify(players, null, 2));

            const deathEmbed = new EmbedBuilder()
                .setTitle(`💀 探索失敗：${mapName}`)
                .setColor(0xff0000)
                .setThumbnail(message.author.displayAvatarURL()) // 這裡換成玩家頭像，不破圖
                .setDescription(`你在 **${mapName}** 倒下了...`)
                .addFields(
                    { name: "💥 致命傷", value: `\`${finalDamage}\` 傷害`, inline: true },
                    { name: "💸 損失", value: `\`$${loss.toLocaleString()}\` 金幣`, inline: true }
                )
                .setFooter({ text: "提示：請先使用 ~heal 或是喝藥水再出發！" });

            return message.reply({ embeds: [deathEmbed] });
        }

        // 6. 掉落邏輯
        const dropCount = Math.floor(Math.random() * 3) + 1;
        let lootResults = [];
        p.inventory = p.inventory || {};
        for (let i = 0; i < dropCount; i++) {
            const roll = Math.random() * 100;
            let pool = (roll < 3) ? map.pools.rare : (roll < 20 ? map.pools.uncommon : map.pools.common);
            if (pool && pool.length > 0) {
                const item = pool[Math.floor(Math.random() * pool.length)];
                lootResults.push(item);
                p.inventory[item] = (p.inventory[item] || 0) + 1;
            }
        }

        // 7. 儲存
        players[message.author.id] = p;
        fs.writeFileSync('./players.json', JSON.stringify(players, null, 2));

        // 8. 成功 Embed
        const embed = new EmbedBuilder()
            .setTitle(`🚩 探索紀錄：${mapName}`)
            .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
            .setThumbnail(message.author.displayAvatarURL())
            .setColor(finalDamage > 50 ? 0xffa500 : 0x2ecc71)
            .addFields(
                { name: "🩸 戰鬥損耗", value: `💥 受到 \`${finalDamage}\` 傷害\n❤️ 剩餘 HP: **${p.hp}** / ${maxHp}`, inline: true },
                { name: "🔋 剩餘體力", value: `⚡ **${p.energy}** / ${maxEnergy}`, inline: true },
                // 戰利品清單美化
                { name: "🎁 獲得戰利品", value: lootResults.map(i => `🔹 **${i}**`).join('\n') || "✨ 什麼都沒發現", inline: false }
            )
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }
};