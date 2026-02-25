const { EmbedBuilder } = require('discord.js');
const { maps } = require('../utils/mapData.js');
const playerCalc = require('../utils/playerCalc.js');
const fs = require('fs');

module.exports = {
    name: 'explore',
    async execute(message, args, p, players) {
        const mapName = args[0] || "翡翠平原";
        const map = maps[mapName];

        if (!map) return message.reply("📍 找不到該地圖！用法：`~explore 翡翠平原`、`~explore 烈焰深淵` 等。");

        // 1. 體力檢查
        if (p.energy < map.cost) {
            return message.reply(`🔋 體力不足！前往 **${mapName}** 需要 \`${map.cost}\` 點體力。`);
        }

        // 2. 扣除門票與計算防禦
        p.energy -= map.cost;
        const stats = playerCalc.getStats(p);

        // 3. 戰鬥計算：基礎傷害 * (80%~120% 隨機) - 玩家防禦
        const monsterAtk = Math.floor(map.baseDmg * (0.8 + Math.random() * 0.4));
        const finalDamage = Math.max(10, monsterAtk - stats.totalDef);
        p.hp -= finalDamage;

        // 4. 死亡判定
        if (p.hp <= 0) {
            p.hp = 0;
            const loss = Math.floor(p.money * 0.2); // 死亡損失 20% 金幣
            p.money -= loss;
            
            // 儲存死亡狀態
            players[message.author.id] = p;
            fs.writeFileSync('./players.json', JSON.stringify(players, null, 2));

            return message.reply(`💀 **你在 ${mapName} 被擊敗了！**\n怪物造成了 \`${finalDamage}\` 點致命傷害。\n你損失了 \`$${loss}\` 金幣並逃回了村莊。`);
        }

        // 5. 權重抽獎邏輯 (80% Common, 17% Uncommon, 3% Rare)
        const dropCount = Math.floor(Math.random() * 3) + 1; // 隨機掉落 1~3 個
        let lootResults = [];
        p.inventory = p.inventory || {};

        for (let i = 0; i < dropCount; i++) {
            const roll = Math.random() * 100;
            let selectedPool;

            if (roll < 3) selectedPool = map.pools.rare;
            else if (roll < 20) selectedPool = map.pools.uncommon;
            else selectedPool = map.pools.common;

            const item = selectedPool[Math.floor(Math.random() * selectedPool.length)];
            lootResults.push(item);
            p.inventory[item] = (p.inventory[item] || 0) + 1;
        }

        // 6. 寫入資料庫
        players[message.author.id] = p;
        fs.writeFileSync('./players.json', JSON.stringify(players, null, 2));

        // 7. 回傳結果
        const embed = new EmbedBuilder()
            .setTitle(`🚩 探索完成：${mapName}`)
            .setColor(finalDamage > 100 ? 0xe74c3c : 0x2ecc71)
            .setDescription(`你深入了${mapName}，經歷了一番激鬥。`)
            .addFields(
                { name: "🩸 戰鬥損耗", value: `受到 \`${finalDamage}\` 傷害\n剩餘 HP: \`${p.hp}/${stats.maxHp}\``, inline: true },
                { name: "🔋 剩餘體力", value: `\`${p.energy}/${stats.maxEnergy}\``, inline: true },
                { name: "🎁 獲得戰利品", value: lootResults.map(i => `\`${i}\``).join('、') || "無", inline: false }
            );

        await message.reply({ embeds: [embed] });
    }
};