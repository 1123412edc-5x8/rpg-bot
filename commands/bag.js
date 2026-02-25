const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'bag',
    async execute(message, args, p) { // 這裡記得接收 args 和 p
        if (!p.inventory || Object.keys(p.inventory).length === 0) {
            return message.reply("🎒 你的背包空空如也，快去 `~探索` 吧！");
        }

        // 1. 定義物品分類
        const categories = {
            "🧪 藥水與消耗品": ["🧪 小型生命藥水", "🧪 中型生命藥水", "🧪 大型生命藥水", "🧪 超大型生命藥水", "🧪 力量藥劑", "🧪 鐵壁藥劑", "🧪 狂暴藥劑", "🧪 抗寒合劑", "⚡ 能量飲料", "🍙 過期飯糰", "🍪 幸運餅乾", "🩹 急救包", "🌀 加速捲軸", "🍀 幸運草", "⚒️ 工匠錘", "粗糙磨刀石"],
            "⛏️ 礦石與零件": ["⛓️ 鐵礦石", "銅礦原石", "🥈 銀礦石", "⚪ 白金礦石", "🧱 鋼鐵錠", "⛓️ 白銀錠", "黑鐵錠", "💎 奧利哈鋼", "生鏽的齒輪", "⚙️ 精準發條", "🔌 魔力導線", "💠 蒸汽核心", "廢鐵渣", "黑煤炭", "石英砂碎塊", "生鏽的鑰匙", "🌑 焦黑岩石", "🔥 硫磺粉末", "🏗️ 活塞組件"],
            "🌿 自然與素材": ["🪵 乾燥的木頭", "🌲 優質木材", "🪵 堅硬的橡木", "🌿 世界樹嫩枝", "📜 優質皮革", "野獸厚皮毛", "🐺 狼人毛皮", "🧶 強韌纖維", "強韌蜘蛛絲", "柔软的兔皮", "粘稠的史萊姆液", "哥布林的尖牙", "🐾 野獸利爪", "🐾 狼王利爪", "🐍 毒蛇毒囊", "枯萎的野花", "月光花", "發光的孢子", "彩色毒蕈", "天然蜂蠟", "純淨泉水", "凍僵的魚", "🧊 冰河鋼", "硬化的甲殼", "殭屍的腐肉", "厚實棉絨", "純淨雪球", "惡魔斷角", "熔岩殼殘片", "餘燼灰燼"],
            "💎 珍稀與精華": ["💰 古老金幣", "💚 翡翠之心", "❄️ 冰晶碎片", "🌬️ 寒冰精華", "🐉 龍鱗碎屑", "🔥 烈焰精華", "🩸 龍血石", "🌌 混沌之魂", "🔻 紅寶石碎塊", "🔹 藍寶石碎塊", "🔸 黃寶石碎塊", "💜 紫水晶碎塊", "🍄 千年靈芝"]
        };

        // 2. 製作裝備顯示字串 (顯示在每一頁的最上方)
        let equipStatus = "### 🛡️ 當前裝備\n";
        const slots = { weapon: "武器", head: "頭盔", armor: "護甲", boots: "靴子" };
        let hasEquip = false;
        
        for (const [key, label] of Object.entries(slots)) {
            const item = p.equipment[key];
            if (item && typeof item === 'object') {
                equipStatus += `> **${label}**: ${item.name} (+${item.plus})\n`;
                hasEquip = true;
            } else {
                equipStatus += `> **${label}**: *未穿戴*\n`;
            }
        }
        if (!hasEquip) equipStatus = "### 🛡️ 當前裝備\n> *目前全身赤裸，快去合成裝備！*\n";

        // 3. 篩選分頁內容
        let pages = [];
        for (const [catName, itemList] of Object.entries(categories)) {
            let catContent = "";
            itemList.forEach(itemName => {
                const count = p.inventory[itemName] || 0;
                if (count > 0) {
                    catContent += `**${itemName}** × \`${count}\`\n`;
                }
            });

            if (catContent !== "") {
                pages.push({ title: catName, content: catContent });
            }
        }

        if (pages.length === 0 && !hasEquip) return message.reply("🎒 你的背包空空如也。");
        if (pages.length === 0) pages.push({ title: "物品欄", content: "*目前沒有材料物資*" });

        // 4. 分頁邏輯
        let currentPage = 0;
        const generateEmbed = (pageIdx) => {
            return new EmbedBuilder()
                .setTitle(`🎒 ${message.author.username} 的實體背包`)
                .setColor(0x3498db)
                .setDescription(`${equipStatus}\n--- \n### ${pages[pageIdx].title}\n${pages[pageIdx].content}`)
                .addFields({ name: '💰 持有金幣', value: `\`$${p.money.toLocaleString()}\``, inline: true })
                .setFooter({ text: `第 ${pageIdx + 1} / ${pages.length} 頁 | 提示：使用 ~賣 [關鍵字] 換成錢` });
        };

        // 5. 發送與監聽
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('prev').setLabel('⬅️ 上一頁').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('next').setLabel('下一頁 ➡️').setStyle(ButtonStyle.Secondary)
        );

        const msg = await message.reply({
            embeds: [generateEmbed(0)],
            components: pages.length > 1 ? [row] : []
        });

        if (pages.length <= 1) return;

        const collector = msg.createMessageComponentCollector({
            filter: i => i.user.id === message.author.id,
            time: 60000
        });

        collector.on('collect', async i => {
            if (i.customId === 'prev') {
                currentPage = currentPage === 0 ? pages.length - 1 : currentPage - 1;
            } else {
                currentPage = currentPage === pages.length - 1 ? 0 : currentPage + 1;
            }
            await i.update({ embeds: [generateEmbed(currentPage)] });
        });

        collector.on('end', () => {
            msg.edit({ components: [] }).catch(() => {});
        });
    }
};