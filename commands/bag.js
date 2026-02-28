const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');

module.exports = {
    name: 'bag',
    async execute(message, args, p) {
        if (!p.inventory) p.inventory = {};
        if (!p.equipment) p.equipment = { weapon: null, head: null, armor: null, boots: null, plus: {} };

        // --- 1. 定義基礎分類清單 ---
        const baseCategories = {
            "🧪 藥水與消耗品": ["小型生命藥水", "中型生命藥水", "大型生命藥水", "超大型生命藥水", "力量藥劑", "鐵壁藥劑", "狂暴藥劑", "抗寒合劑", "能量飲料", "過期飯糰", "幸運餅乾", "急救包", "加速捲軸", "幸運草", "工匠錘", "粗糙磨刀石"],
            "⛏️ 礦石與零件": ["粗糙的碎石", "鐵礦石", "銅礦原石", "銀礦石", "白金礦石", "鋼鐵錠", "白銀錠", "黑鐵錠", "奧利哈鋼", "生鏽的齒輪", "精準發條", "魔力導線", "蒸汽核心", "廢鐵渣", "黑煤炭", "石英砂碎塊", "生鏽的鑰匙", "焦黑岩石", "硫磺粉末", "活塞組件"],
            "🌿 自然與素材": ["乾燥的木頭", "優質木材", "堅硬的橡木", "世界樹嫩枝", "優質皮革", "野獸厚皮毛", "狼人毛皮", "強韌纖維", "強韌蜘蛛絲", "柔软的兔皮", "粘稠的史萊姆液", "哥布林的尖牙", "野獸利爪", "狼王利爪", "毒蛇毒囊", "枯萎的野花", "月光花", "發光的孢子", "彩色毒蕈", "天然蜂蠟", "純淨泉水", "凍僵的魚", "冰河鋼", "硬化的甲殼", "殭屍的腐肉", "厚實棉絨", "純淨雪球", "惡魔斷角", "熔岩殼殘片", "餘燼灰燼"],
            "💎 珍稀與精華": ["古老金幣", "翡翠之心", "冰晶碎片", "寒冰精華", "龍鱗碎屑", "烈焰精華", "龍血石", "混沌之魂", "紅寶石碎塊", "藍寶石碎塊", "黃寶石碎塊", "紫水晶碎塊", "千年靈芝"]
        };

        // --- 2. 智能匹配邏輯 ---
        // 去除字串中的 Emoji 和前後空格
        const clean = (str) => str.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu, "").trim();

        const categorizedInventory = {};
        const assignedItems = new Set();

        // 初始化分類桶
        for (const cat in baseCategories) categorizedInventory[cat] = [];
        categorizedInventory["📦 未分類物資"] = [];

        // 遍歷玩家背包
        for (const [rawName, count] of Object.entries(p.inventory)) {
            if (count <= 0) continue;
            const pureName = clean(rawName);
            let found = false;

            for (const [cat, list] of Object.entries(baseCategories)) {
                // 如果背包裡的名字(去標籤後) 存在於 該分類清單(去標籤後)
                if (list.some(item => clean(item) === pureName)) {
                    categorizedInventory[cat].push({ display: rawName, count });
                    assignedItems.add(rawName);
                    found = true;
                    break;
                }
            }
            if (!found) {
                categorizedInventory["📦 未分類物資"].push({ display: rawName, count });
            }
        }

        // 過濾掉空的分類
        const finalCategories = {};
        for (const [cat, items] of Object.entries(categorizedInventory)) {
            if (items.length > 0) finalCategories[cat] = items;
        }

        const slots = { weapon: "⚔️ 武器", head: "🪖 頭盔", armor: "👕 護甲", boots: "🥾 靴子" };

        let viewMode = 'loot'; 
        let currentCat = Object.keys(finalCategories)[0] || "📦 未分類物資"; 
        let currentSlot = 'weapon'; 

        // --- 3. 生成 Embed ---
        const generateEmbed = () => {
            const embed = new EmbedBuilder()
                .setTitle(`🎒 ${message.author.username} 的個人背包`)
                .setColor(viewMode === 'loot' ? 0x3498db : 0xe67e22)
                .addFields({ name: '💰 持有金幣', value: `\`$${p.money.toLocaleString()}\``, inline: true });

            if (viewMode === 'loot') {
                const items = finalCategories[currentCat] || [];
                let content = items.map(i => `**${i.display}** × \`${i.count}\``).join('\n');
                embed.setDescription(`### 分區：${currentCat}\n${content || "*空空如也*"}`);
            } else {
                const eq = p.equipment[currentSlot];
                let eqDisplay = "❌ **未穿戴裝備**";
                if (eq && typeof eq === 'object') {
                    eqDisplay = `🔹 **名稱**: ${eq.name}\n🔹 **強化**: \`+${eq.plus || 0}\`\n🔹 **數值**: \`${eq.stat}\``;
                }
                embed.setDescription(`### 裝備：${slots[currentSlot]}\n${eqDisplay}`);
            }
            return embed;
        };

        // --- 4. 生成組件 ---
        const generateComponents = () => {
            const rows = [
                new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder().setCustomId('view_mode').setPlaceholder('🔄 切換大類別').addOptions([
                        { label: '戰利品與背包', value: 'loot', emoji: '📦', default: viewMode === 'loot' },
                        { label: '當前裝備', value: 'equip', emoji: '🛡️', default: viewMode === 'equip' }
                    ])
                )
            ];

            const subMenu = new StringSelectMenuBuilder();
            if (viewMode === 'loot') {
                const options = Object.keys(finalCategories).map(cat => ({ label: cat, value: cat, default: cat === currentCat }));
                if (options.length === 0) options.push({ label: '無物品', value: 'none' });
                subMenu.setCustomId('sub_cat').setPlaceholder('📂 選擇分頁').addOptions(options);
            } else {
                subMenu.setCustomId('slot_cat').setPlaceholder('⚔️ 選擇部位').addOptions(
                    Object.entries(slots).map(([k, v]) => ({ label: v, value: k, default: k === currentSlot }))
                );
            }
            rows.push(new ActionRowBuilder().addComponents(subMenu));
            return rows;
        };

        const msg = await message.reply({ embeds: [generateEmbed()], components: generateComponents() });
        const collector = msg.createMessageComponentCollector({ componentType: ComponentType.StringSelect, filter: i => i.user.id === message.author.id, time: 60000 });

        collector.on('collect', async i => {
            if (i.customId === 'view_mode') {
                viewMode = i.values[0];
                currentCat = Object.keys(finalCategories)[0] || "📦 未分類物資";
            } else if (i.customId === 'sub_cat') {
                currentCat = i.values[0];
            } else if (i.customId === 'slot_cat') {
                currentSlot = i.values[0];
            }
            await i.update({ embeds: [generateEmbed()], components: generateComponents() });
        });
    }
};