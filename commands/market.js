const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'market',
    async execute(message, p, players) {
        const args = message.content.split(' ');
        let market = JSON.parse(fs.readFileSync('./market.json'));

        // --- 功能 A：查看市場 ---
        if (!args[1]) {
            let list = "";
            if (market.length === 0) {
                list = "> *目前市場空空如也...*";
            } else {
                market.forEach((item, index) => {
                    list += `### [${index}] ${item.itemName}\n`;
                    list += `> **售價：\`${item.price}\` 金** | **賣家：<@${item.sellerId}>**\n\n`;
                });
            }

            const embed = new EmbedBuilder()
                .setColor(0x00AE86)
                .setTitle("⚖️ | 遺蹟交易所")
                .setDescription(
                    "# 🛒 **現貨清單**\n" +
                    list +
                    "**━━━━━━━━━━━━━━**\n" +
                    "**💡 上架：`~market sell [物品名] [價格]`**\n" +
                    "**💡 購買：`~market buy [編號]`**"
                );
            return message.reply({ embeds: [embed] });
        }

        // --- 功能 B：上架商品 ---
        if (args[1] === 'sell') {
            const itemName = args[2];
            const price = parseInt(args[3]);

            if (!itemName || isNaN(price) || price <= 0) {
                return message.reply("❌ **格式錯誤！** 使用：`~market sell [物品名] [價格]`");
            }

            // 檢查背包是否有該物品
            const itemIdx = p.backpack.indexOf(itemName);
            if (itemIdx === -1) return message.reply(`❌ **找不到物品：** 你的背包裡沒有「${itemName}」。`);

            // 扣除物品並加入市場
            p.backpack.splice(itemIdx, 1);
            market.push({
                sellerId: message.author.id,
                itemName: itemName,
                price: price
            });

            fs.writeFileSync('./market.json', JSON.stringify(market, null, 2));
            fs.writeFileSync('./players.json', JSON.stringify(players, null, 2));

            return message.reply(`✅ **成功上架！** 你以 \`${price}\` 金幣掛售了「${itemName}」。`);
        }

        // --- 功能 C：購買商品 ---
        if (args[1] === 'buy') {
            const index = parseInt(args[2]);
            const item = market[index];

            if (!item) return message.reply("❌ **編號錯誤：** 該商品不存在或已被買走。");
            if (item.sellerId === message.author.id) return message.reply("🤔 **那是你自己賣的東西。**");
            if ((p.money || 0) < item.price) return message.reply("❌ **財力不足：** 你的金幣不夠買這件商品。");

            // 轉帳邏輯
            p.money -= item.price;
            const seller = players[item.sellerId];
            if (seller) seller.money = (seller.money || 0) + item.price;

            // 物品入庫
            p.backpack.push(item.itemName);
            market.splice(index, 1);

            fs.writeFileSync('./market.json', JSON.stringify(market, null, 2));
            fs.writeFileSync('./players.json', JSON.stringify(players, null, 2));

            const buyEmbed = new EmbedBuilder()
                .setColor(0x2ecc71)
                .setTitle("🤝 | 交易完成")
                .setDescription(`# **購買成功！**\n> 你支付了 \`${item.price}\` 金幣獲得了 **${item.itemName}**！`);
            
            return message.reply({ embeds: [buyEmbed] });
        }
    }
};
