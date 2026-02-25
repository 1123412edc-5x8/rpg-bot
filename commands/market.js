const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

// 💰 80 種物品完整系統收購價庫 (作為市場最低限價)
const itemPrices = {
    // 🟢 翡翠平原 ($5 / $50 / $500)
    "🪵 乾燥的木頭": 5, "🧪 小型生命藥水": 5, "粘稠的史萊姆液": 5, "哥布林的尖牙": 5, "枯萎的野花": 5, "粗糙的碎石": 5, "蝙蝠的翅膀": 5, "柔軟的兔皮": 5, "純淨泉水": 5, "🍙 過期飯糰": 5,
    "🌲 優質木材": 50, "🐾 野獸利爪": 50, "🧶 強韌纖維": 50, "🐍 毒蛇毒囊": 50,
    "🌿 世界樹嫩枝": 500, "🍀 幸運草": 500,
    // 🪨 幽暗礦坑 ($15 / $150 / $1,500)
    "⛓️ 鐵礦石": 15, "🧪 中型生命藥水": 15, "銅礦原石": 15, "生鏽的齒輪": 15, "廢鐵渣": 15, "黑煤炭": 15, "石英砂碎塊": 15, "生鏽的鑰匙": 15, "粗糙磨刀石": 15, "⚡ 能量飲料": 15,
    "🥈 銀礦石": 150, "🧱 鋼鐵錠": 150, "⚙️ 精準發條": 150, "🔌 魔力導線": 150,
    "💎 奧利哈鋼": 1500, "💰 古老金幣": 1500,
    // 🌲 迷霧森林 ($30 / $300 / $3,000)
    "📜 優質皮革": 30, "🧪 大型生命藥水": 30, "野獸厚皮毛": 30, "強韌蜘蛛絲": 30, "發光的孢子": 30, "腐爛的布料": 30, "彩色毒蕈": 30, "天然蜂蠟": 30, "🌀 加速捲軸": 30, "🪵 堅硬的橡木": 30,
    "🔻 紅寶石碎塊": 300, "🔹 藍寶石碎塊": 300, "🍄 千年靈芝": 300, "🐺 狼人毛皮": 300,
    "🐾 狼王利爪": 3000, "💚 翡翠之心": 3000,
    // ❄️ 寒冰凍原 ($60 / $600 / $6,000)
    "❄️ 冰晶碎片": 60, "🩹 急救包": 60, "硬化的甲殼": 60, "殭屍的腐肉": 60, "厚實棉絨": 60, "凍僵的魚": 60, "純淨雪球": 60, "🧪 抗寒合劑": 60, "🍪 幸運餅乾": 60, "⛓️ 白銀錠": 60,
    "🧊 冰河鋼": 600, "⚪ 白金礦石": 600, "💜 紫水晶碎塊": 600, "📜 密封書卷": 600,
    "🌬️ 寒冰精華": 6000, "🐉 龍鱗碎屑": 6000,
    // 🌋 烈焰深淵 ($150 / $1,500 / $15,000)
    "🌑 焦黑岩石": 150, "🧪 超大型藥水": 150, "餘燼灰燼": 150, "黑鐵錠": 150, "惡魔斷角": 150, "熔岩殼殘片": 150, "高溫溶劑": 150, "🧪 狂暴藥劑": 150, "🧪 鐵壁藥劑": 150, "🔥 硫磺粉末": 150,
    "🔥 烈焰精華": 1500, "🔸 黃寶石碎塊": 1500, "💠 蒸汽核心": 1500, "⚒️ 工匠錘": 1500,
    "🩸 龍血石": 15000, "🌌 混沌之魂": 15000
};

module.exports = {
    name: 'market',
    async execute(message, p, players) {
        const args = message.content.split(' ');
        if (!fs.existsSync('./market.json')) fs.writeFileSync('./market.json', '[]');
        let market = JSON.parse(fs.readFileSync('./market.json'));

        // --- 功能 A：查看市場 ---
        if (!args[1]) {
            let list = market.length === 0 ? "> *目前市場空空如也...*" : "";
            market.forEach((item, index) => {
                list += `**[${index}]** ${item.itemName} - 💰 \`${item.price}\` (賣家: <@${item.sellerId}>)\n`;
            });

            const embed = new EmbedBuilder()
                .setColor(0x00AE86)
                .setTitle("⚖️ | 遺蹟交易所")
                .setDescription(`# 🛒 現貨清單\n${list}\n\n**⚖️ 稅率：\`3%\` | ⚠️ 售價不得低於系統收購價**\n**上架：\`~market sell [物名] [價]\` | 購買：\`~market buy [編號]\`**`);
            return message.reply({ embeds: [embed] });
        }

        // --- 功能 B：上架商品 ---
        if (args[1] === 'sell') {
            const itemName = args[2];
            const price = parseInt(args[3]);
            const minPrice = itemPrices[itemName];

            if (!minPrice) return message.reply("❌ **錯誤：** 系統無法辨識此物品。");
            if (isNaN(price) || price < minPrice) return message.reply(`❌ **拒絕上架：** 價格不能低於系統收購價 (\`$${minPrice}\`)。`);
            
            if (!p.inventory || !p.inventory[itemName] || p.inventory[itemName] <= 0) {
                return message.reply(`❌ **失敗：** 背包裡沒有「${itemName}」。`);
            }

            // 扣除 1 個
            p.inventory[itemName] -= 1;
            market.push({ sellerId: message.author.id, itemName: itemName, price: price });

            fs.writeFileSync('./market.json', JSON.stringify(market, null, 2));
            fs.writeFileSync('./players.json', JSON.stringify(players, null, 2));
            return message.reply(`✅ **成功上架！** 以 \`$${price}\` 掛售了「${itemName}」。`);
        }

        // --- 功能 C：購買商品 ---
        if (args[1] === 'buy') {
            const index = parseInt(args[2]);
            const item = market[index];

            if (!item) return message.reply("❌ **編號錯誤：** 商品已不存在。");
            if (item.sellerId === message.author.id) return message.reply("🤔 不能買自己賣的東西。");
            if ((p.money || 0) < item.price) return message.reply("❌ **財力不足！**");

            // 轉帳與扣稅 (3%)
            const tax = Math.floor(item.price * 0.03);
            const finalProfit = item.price - tax;

            p.money -= item.price;
            if (players[item.sellerId]) {
                players[item.sellerId].money = (players[item.sellerId].money || 0) + finalProfit;
            }

            // 入庫
            p.inventory = p.inventory || {};
            p.inventory[item.itemName] = (p.inventory[item.itemName] || 0) + 1;
            market.splice(index, 1);

            fs.writeFileSync('./market.json', JSON.stringify(market, null, 2));
            fs.writeFileSync('./players.json', JSON.stringify(players, null, 2));

            return message.reply(`🤝 **交易完成！** 你支付 \`$${item.price}\` 獲得了 **${item.itemName}**。\n*(賣家實得: $${finalProfit}, 系統扣稅: $${tax})*`);
        }
    }
};