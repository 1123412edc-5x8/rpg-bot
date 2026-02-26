const { EmbedBuilder } = require('discord.js');
const { maps } = require('../utils/mapData.js');
const playerCalc = require('../utils/playerCalc.js');
const fs = require('fs');

module.exports = {
    name: 'explore',
    // 支援多種觸發方式
    aliases: ['ex', '冒險', '探險', 'go'], 
    async execute(message, args, p, players) {
        // 1. 決定地圖 (預設為翡翠平原)
        const mapName = args[0] || "翡翠平原";
        const map = maps[mapName];

        if (!map) return message.reply("📍 **找不到該地圖！**\n用法：`~explore 翡翠平原`、`~explore 烈焰深淵`。");

        // 2. 數值初始化防呆 (徹底解決 NaN)
        p.energy = p.energy ?? 12; // 如果沒體力欄位，預設補滿 12
        const stats = playerCalc.getStats(p);
        const maxEnergy = stats.maxEnergy || 12; // 取得上限，沒抓到就預設 12
        const maxHp = stats.maxHp || 100;

        // 3. 體力檢查
        if (p.energy < map.cost) {
            return message.reply(`🔋 **體力不足！**\n前往 **${mapName}** 需要 \`${map.cost}\` 點，你目前剩下 \`${p.energy}\` 點。`);
        }

        // 4. 扣除門票與計算戰鬥傷害
        p.energy -= map.cost;
        // 戰鬥計算：基礎傷害 * (80%~120% 隨機) - 玩家防禦
        const monsterAtk = Math.floor(map.baseDmg * (0.8 + Math.random() * 0.4));
        const finalDamage = Math.max(10, monsterAtk - (stats.totalDef || 0));
        p.hp -= finalDamage;

        // 5. 死亡判定
        if (p.hp <= 0) {
            p.hp = 0;
            p.energy = Math.max(0, p.energy);
            const loss = Math.floor((p.money || 0) * 0.2); // 死亡損失 20% 金幣
            p.money = Math.max(0, (p.money || 0) - loss);
            
            // 儲存狀態
            players[message.author.id] = p;
            fs.writeFileSync('./players.json', JSON.stringify(players, null, 2));

            const deathEmbed = new EmbedBuilder()
                .setTitle(`💀 探索失敗：${mapName}`)
                .setColor(0xff0000)
                .setThumbnail('https://i.imgur.com/8S9X9vX.png') // 如果有死亡圖標可以放這
                .setDescription(`你在 **${mapName}** 深處遭遇強敵，體力不支倒下了...`)
                .addFields(
                    { name: "💥 致命傷", value: `\`${finalDamage}\` 傷害`, inline: true },
                    { name: "💸 損失", value: `\`$${loss.toLocaleString()}\` 金幣`, inline: true }
                )
                .setFooter({ text: "你被路過的遺蹟鑑定家救回了村莊。" });

            return message.reply({ embeds: [deathEmbed] });
        }

        // 6. 權重抽獎邏輯 (掉落 1~3 個戰利品)
        const dropCount = Math.floor(Math.random() * 3) + 1;
        let lootResults = [];
        p.inventory = p.inventory || {};

        for (let i = 0; i < dropCount; i++) {
            const roll = Math.random() * 100;
            let selectedPool;

            if (roll < 3) selectedPool = map.pools.rare;
            else if (roll < 20) selectedPool = map.pools.uncommon;
            else selectedPool = map.pools.common;

            if (selectedPool && selectedPool.length > 0) {
                const item = selectedPool[Math.floor(Math.random() * selectedPool.length)];
                lootResults.push(item);
                p.inventory[item] = (p.inventory[item] || 0) + 1;
            }
        }

        // 7. 寫入資料庫
        players[message.author.id] = p;
        fs.writeFileSync('./players.json', JSON.stringify(players, null, 2));

        // 8. 成功探索 Embed
        const embed = new EmbedBuilder()
            .setTitle(`🚩 探索紀錄：${mapName}`)
            .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
            .setColor(finalDamage > 50 ? 0xffa500 : 0x2ecc71) // 傷害高變橘色，安全則綠色
            .setDescription(`你深入了 **${mapName}**，經歷了一番激鬥並成功生還！`)
            .addFields(
                { name: "🩸 戰鬥損耗", value: `💥 受到 \`${finalDamage}\` 傷害\n❤️ 剩餘 HP: **${p.hp}** / ${maxHp}`, inline: true },
                { name: "🔋 剩餘體力", value: `⚡ **${p.energy}** / ${maxEnergy}`, inline: true }
            )
            .addFields(
                { name: "🎁 獲得戰利品", value: lootResults.map(i => `📦 \`${i}\``).join('  ') || "✨ 這次什麼都沒發現", inline: false }
            )
            .setFooter({ text: `耗費了 ${map.cost} 點體力 | 繼續變強吧！` })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }
};