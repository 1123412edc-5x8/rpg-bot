const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const professions = require('./professions.json');
const { addExperience } = require('./rpg_logic');

function handleCommands(message, players) {
    const userId = message.author.id;
    const p = players[userId];

    // --- 指令 1: 狀態查詢 (視覺強化版) ---
    if (message.content === '~status') {
        const job = professions[p.job];
        
        const embed = new EmbedBuilder()
            .setColor(0x2F3136) // 使用 Discord 深色背景色，讓內容更顯眼
            .setTitle(`📜 ${message.author.username} 的冒險者日誌`)
            .setThumbnail(message.author.displayAvatarURL()) // 顯示大頭照
            .setDescription(`*「此人正漫步於遺蹟與現實的邊界...」*`) // 加入一段帥氣的引言
            .addFields(
                { name: '👤 職業', value: `> **${job.emoji} ${job.name}**`, inline: true },
                { name: '⚔️ 等級', value: `> **Lv. ${p.level}**`, inline: true },
                { name: '✨ 經驗值', value: `> \`${p.exp} / ${Math.pow(p.level, 2) * 100}\``, inline: true },
                { name: '🍀 幸運 (LUK)', value: `\`${p.stats.LUK}\``, inline: true },
                { name: '💪 力量 (STR)', value: `\`${p.stats.STR}\``, inline: true },
                { name: '🎒 背包物品', value: `\`${p.backpack ? p.backpack.length : 0}\` 件`, inline: true }
            )
            .addFields({ name: '📝 職業介紹', value: `> ${job.desc}` })
            .setFooter({ text: `輸入 ~explore 開始尋寶 | 下一階轉職：Lv.${job.req_level || 'MAX'}` })
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    }

    // --- 指令 2: 鑑定 (獲得經驗) ---
    if (message.content === '~identify') {
        const result = addExperience(p, 50);
        fs.writeFileSync('./players.json', JSON.stringify(players, null, 2));
        let msg = `🔍 鑑定成功！獲得 50 EXP`;
        if (result.leveledUp) msg += `\n🎊 升級到 Lv.${p.level}!`;
        return message.reply(msg);
    }

    // --- 指令 3: 探索 (挖寶) ---
    if (message.content === '~explore') {
        // 定義掉落表
        const lootTable = [
            { name: "生鏽的鐵盒", chance: 50 },
            { name: "刻有符文的石板", chance: 30 },
            { name: "發光的神秘古物", chance: 15 },
            { name: "【傳說】遺蹟之心的碎片", chance: 5 }
        ];

        // 隨機演算法
        const roll = Math.random() * 100;
        let cumulative = 0;
        let droppedItem = lootTable[0].name;

        for (const item of lootTable) {
            cumulative += item.chance;
            if (roll < cumulative) {
                droppedItem = item.name;
                break;
            }
        }

        // 確保玩家有背包
        if (!p.backpack) p.backpack = [];
        p.backpack.push(droppedItem);
        
        fs.writeFileSync('./players.json', JSON.stringify(players, null, 2));
        return message.reply(`🧱 你在遺蹟深處挖掘，找到了 **[${droppedItem}]**！\n使用 \`~backpack\` 查看。`);
    }

    // --- 指令 4: 背包 ---
    if (message.content === '~backpack') {
        const items = (p.backpack && p.backpack.length > 0) 
            ? p.backpack.map((item, index) => `${index + 1}. ${item}`).join('\n') 
            : "目前空空如也";

        const embed = new EmbedBuilder()
            .setColor(0xFFA500)
            .setTitle(`🎒 ${message.author.username} 的背包`)
            .setDescription(items);
        
        return message.reply({ embeds: [embed] });
    }
}

module.exports = { handleCommands };