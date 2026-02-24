const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'collect',
    async execute(message, p) {
        const sets = [
            { 
                name: "🏮 古代生活", 
                items: ["碎裂的磚塊", "完整陶罐"], 
                bonus: "體力上限 +2",
                check: (inv) => inv.includes("碎裂的磚塊") && inv.includes("完整陶罐")
            },
            { 
                name: "⚔️ 戰鬥祭禮", 
                items: ["【稀有】古代祭祀刀", "【史詩】黃金聖甲蟲"], 
                bonus: "基礎攻擊力 +50",
                check: (inv) => inv.includes("【稀有】古代祭祀刀") && inv.includes("【史詩】黃金聖甲蟲")
            },
            { 
                name: "💎 文明核心", 
                items: ["【傳說】亞特蘭提斯之星", "【傳說】遺蹟碎片"], 
                bonus: "強化成功率 +5%",
                check: (inv) => inv.includes("【傳說】亞特蘭提斯之星") && inv.includes("【傳說】遺蹟碎片")
            }
        ];

        const inventory = p.backpack || [];
        let description = "# 🏺 **遺物典藏進度**\n> 收集指定物品並保留在背包，即可獲得加成。\n\n";

        sets.forEach(set => {
            const isActive = set.check(inventory);
            const statusEmoji = isActive ? "✅" : "❌";
            const progress = set.items.map(item => inventory.includes(item) ? `**${item}**` : `~~${item}~~`).join(" + ");

            description += `### ${statusEmoji} ${set.name}\n`;
            description += `> **組合：** ${progress}\n`;
            description += `> **效果：** \`${set.bonus}\` ${isActive ? " (生效中)" : ""}\n\n`;
        });

        const embed = new EmbedBuilder()
            .setColor(0x00FF7F)
            .setTitle("📖 | 遺蹟圖鑑大師")
            .setDescription(description)
            .setFooter({ text: "提示：賣掉套裝物品後，加成會自動消失。" });

        await message.reply({ embeds: [embed] });
    }
};
