const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'check',
    async execute(message) {
        const args = message.content.split(' ');
        const query = args[1];

        // 🌟 物品數據庫 (與圖鑑同步)
        const itemDb = {
            "生鏽的鐵盒": { rarity: "COMMON", price: "尚未鑑定", emoji: "📦", color: 0x95a5a6, desc: "裡面裝著未知的遺物，需使用 ~identify 鑑定。" },
            "亞特蘭提斯之星": { rarity: "LEGENDARY", price: "5000", emoji: "⭐", color: 0xf1c40f, desc: "傳說中的失落文明核心，散發著神聖光芒。" },
            "黃金聖甲蟲": { rarity: "EPIC", price: "2000", emoji: "🪲", color: 0x9b59b6, desc: "純金打造的古代護身符，是收藏家的最愛。" },
            "古代祭祀刀": { rarity: "RARE", price: "800", emoji: "🗡️", color: 0x3498db, desc: "雖然鏽跡斑斑，但仍能感覺到強大的靈力。" },
            "完整陶罐": { rarity: "COMMON", price: "300", emoji: "🏺", color: 0x2ecc71, desc: "保存完好的古代容器，適合放在博物館展示。" },
            "碎裂的磚塊": { rarity: "TRASH", price: "50", emoji: "🧱", color: 0x7f8c8d, desc: "這真的只是垃圾，沒什麼好說的。" }
        };

        // 如果沒有輸入物品名，顯示清單索引
        if (!query) {
            const list = Object.keys(itemDb).map(name => `> ${itemDb[name].emoji} **${name}**`).join('\n');
            const embed = new EmbedBuilder()
                .setColor(0x3498db)
                .setTitle("📖 | 遺蹟百科全書")
                .setDescription("# **已知物品索引**\n\n" + list + "\n\n**💡 使用 `~check [物品名稱]` 查看詳細資料**");
            return message.reply({ embeds: [embed] });
        }

        // 搜尋物品 (支援部分匹配)
        const itemName = Object.keys(itemDb).find(n => n.includes(query));
        const item = itemDb[itemName];

        if (!item) return message.reply("❌ **百科中找不到該物品**，請確認名稱是否正確。");

        const embed = new EmbedBuilder()
            .setColor(item.color)
            .setTitle(`${item.emoji} | 物品詳情：${itemName}`)
            .setDescription(
                `> **稀有度 »** \`${item.rarity}\`\n` +
                `> ----------------------\n` +
                `### 🏺 物品描述\n` +
                `> *${item.desc}*\n\n` +
                `### 💰 官方估價 (直接出售)\n` +
                `> **\`$${item.price}\` 金幣**\n` +
                `> ----------------------\n` +
                `📈 **市場建議：** 如果掛在 \`~market\`，建議加價 20-50% 賣給其他玩家！`
            );

        await message.reply({ embeds: [embed] });
    }
};
