const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');

module.exports = {
    name: 'bag',
    async execute(message, args, p) {
        if (!p.inventory) p.inventory = {};
        if (!p.equipment) p.equipment = { weapon: null, head: null, armor: null, boots: null, plus: {} };

        // --- 1. 純文字分類清單 (完全移除 Emoji) ---
        const baseCategories = {
            "藥水與消耗品": ["小型生命藥水", "中型生命藥水", "大型生命藥水", "超大型生命藥水", "力量藥劑", "鐵壁藥劑", "狂暴藥劑", "抗寒合劑", "能量飲料", "過期飯糰", "幸運餅乾", "急救包", "加速捲軸", "幸運草", "工匠錘", "粗糙磨刀石"],
            "礦石與零件": ["粗糙的碎石", "鐵礦石", "銅礦原石", "銀礦石", "白金礦石", "鋼鐵錠", "白銀錠", "黑鐵錠", "奧利哈鋼", "生鏽的齒輪", "精準發條", "魔力導線", "蒸汽核心", "廢鐵渣", "黑煤炭", "石英砂碎塊", "生鏽的鑰匙", "焦黑岩石", "硫磺粉末", "活塞組件"],
            "自然與素材": ["乾燥的木頭", "優質木材", "堅硬的橡木", "世界樹嫩枝", "優質皮革", "野獸厚皮毛", "狼人毛皮", "強韌纖維", "強韌蜘蛛絲", "柔软的兔皮", "粘稠的史萊姆液", "哥布林的尖牙", "野獸利爪", "狼王利爪", "毒蛇毒囊", "枯萎的野花", "月光花", "發光的孢子", "彩色毒蕈", "天然蜂蠟", "純淨泉水", "凍僵的魚", "冰河鋼", "硬化的甲殼", "殭屍的腐肉", "厚實棉絨", "純淨雪球", "惡魔斷角", "熔岩殼殘片", "餘燼灰燼"],
            "珍稀與精華": ["古老金幣", "翡翠之心", "冰晶碎片", "寒冰精華", "龍鱗碎屑", "烈焰精華", "龍血石", "混沌之魂", "紅寶石碎塊", "藍寶石碎塊", "黃寶石碎塊", "紫水晶碎塊", "千年靈芝"]
        };

        // --- 2. 智能歸類 ---
        const categorizedInventory = {};
        for (const cat in baseCategories) categorizedInventory[cat] = [];
        categorizedInventory["其他雜項"] = [];

        // 建立一個快速查詢表，把所有定義過的物品轉成純文字比對
        const itemToCategory = {};
        for (const [cat, list] of Object.entries(baseCategories)) {
            list.forEach(item => {
                itemToCategory[item] = cat;
            });
        }

        // 掃描背包
        for (const [itemName, count] of Object.entries(p.inventory)) {
            if (count <= 0) continue;

            // 這裡會自動去掉玩家背包物品名稱裡的 Emoji 再來比對
            const pureName = itemName.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu, "").trim();
            const cat = itemToCategory[pureName];

            if (cat) {
                categorizedInventory[cat].push({ name: itemName, count });
            } else {
                categorizedInventory["其他雜項"].push({ name: itemName, count });
            }
        }

        // 移除空的分類
        const finalCats = Object.fromEntries(Object.entries(categorizedInventory).filter(([_, items]) => items.length > 0));

        // --- 3. 初始狀態 ---
        let viewMode = 'loot'; 
        let currentCat = Object.keys(finalCats)[0] || "其他雜項";
        let currentSlot = 'weapon';
        const slots = { weapon: "⚔️ 武器", head: "🪖 頭盔", armor: "👕 護甲", boots: "🥾 靴子" };

        // --- 4. 顯示與交互 ---
        const generateEmbed = () => {
            const embed = new EmbedBuilder()
                .setTitle(`🎒 ${message.author.username} 的背包`)
                .setColor(viewMode === 'loot' ? 0x3498db : 0xe67e22)
                .addFields({ name: '💰 金幣', value: `\`$${p.money.toLocaleString()}\``, inline: true });

            if (viewMode === 'loot') {
                const items = finalCats[currentCat] || [];
                const list = items.map(i => `**${i.name}** × \`${i.count}\``).join('\n');
                embed.setDescription(`### 分區：${currentCat}\n${list || "*目前沒有物品*"}`);
            } else {
                const eq = p.equipment[currentSlot];
                let desc = "❌ **未穿戴**";
                if (eq && typeof eq === 'object') {
                    desc = `🔹 **名稱**: ${eq.name}\n🔹 **強化**: \`+${eq.plus || 0}\`\n🔹 **數值**: \`${eq.stat}\``;
                }
                embed.setDescription(`### 裝備：${slots[currentSlot]}\n${desc}`);
            }
            return embed;
        };

        const generateComponents = () => {
            const row1 = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder().setCustomId('m').setPlaceholder('切換分區').addOptions([
                    { label: '戰利品背包', value: 'loot', emoji: '📦', default: viewMode === 'loot' },
                    { label: '目前裝備', value: 'equip', emoji: '🛡️', default: viewMode === 'equip' }
                ])
            );
            const row2 = new ActionRowBuilder();
            if (viewMode === 'loot') {
                const opts = Object.keys(finalCats).map(c => ({ label: c, value: c, default: c === currentCat }));
                row2.addComponents(new StringSelectMenuBuilder().setCustomId('s').setPlaceholder('選擇分頁').addOptions(opts.length ? opts : [{label:'空',value:'0'}]));
            } else {
                row2.addComponents(new StringSelectMenuBuilder().setCustomId('st').setPlaceholder('選擇部位').addOptions(
                    Object.entries(slots).map(([k, v]) => ({ label: v, value: k, default: k === currentSlot }))
                ));
            }
            return [row1, row2];
        };

        const msg = await message.reply({ embeds: [generateEmbed()], components: generateComponents() });
        const collector = msg.createMessageComponentCollector({ filter: i => i.user.id === message.author.id, time: 60000 });

        collector.on('collect', async i => {
            if (i.customId === 'm') { viewMode = i.values[0]; currentCat = Object.keys(finalCats)[0] || "其他雜項"; }
            else if (i.customId === 's') currentCat = i.values[0];
            else if (i.customId === 'st') currentSlot = i.values[0];
            await i.update({ embeds: [generateEmbed()], components: generateComponents() });
        });
    }
};