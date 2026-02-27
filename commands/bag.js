const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');

module.exports = {
    name: 'bag',
    async execute(message, args, p) {
        if (!p.inventory) p.inventory = {};
        if (!p.equipment) p.equipment = { weapon: null, head: null, armor: null, boots: null, plus: {} };

        // --- 1. 定義資料 ---
        const categories = {
            "🧪 藥水與消耗品": ["🧪 小型生命藥水", "🧪 中型生命藥水", "🧪 大型生命藥水", "🧪 超大型生命藥水", "🧪 力量藥劑", "🧪 鐵壁藥劑", "🧪 狂暴藥劑", "🧪 抗寒合劑", "⚡ 能量飲料", "🍙 過期飯糰", "🍪 幸運餅乾", "🩹 急救包", "🌀 加速捲軸", "🍀 幸運草", "⚒️ 工匠錘", "粗糙磨刀石"],
            "⛏️ 礦石與零件": ["⛓️ 鐵礦石", "銅礦原石", "🥈 銀礦石", "⚪ 白金礦石", "🧱 鋼鐵錠", "⛓️ 白銀錠", "黑鐵錠", "💎 奧利哈鋼", "生鏽的齒輪", "⚙️ 精準發條", "🔌 魔力導線", "💠 蒸汽核心", "廢鐵渣", "黑煤炭", "石英砂碎塊", "生鏽的鑰匙", "🌑 焦黑岩石", "🔥 硫磺粉末", "🏗️ 活塞組件"],
            "🌿 自然與素材": ["🪵 乾燥的木頭", "🌲 優質木材", "🪵 堅硬的橡木", "🌿 世界樹嫩枝", "📜 優質皮革", "野獸厚皮毛", "🐺 狼人毛皮", "🧶 強韌纖維", "強韌蜘蛛絲", "柔软的兔皮", "粘稠的史萊姆液", "哥布林的尖牙", "🐾 野獸利爪", "🐾 狼王利爪", "🐍 毒蛇毒囊", "枯萎的野花", "月光花", "發光的孢子", "彩色毒蕈", "天然蜂蠟", "純淨泉水", "凍僵的魚", "🧊 冰河鋼", "硬化的甲殼", "殭屍的腐肉", "厚實棉絨", "純淨雪球", "惡魔斷角", "熔岩殼殘片", "餘燼灰燼"],
            "💎 珍稀與精華": ["💰 古老金幣", "💚 翡翠之心", "❄️ 冰晶碎片", "🌬️ 寒冰精華", "🐉 龍鱗碎屑", "🔥 烈焰精華", "🩸 龍血石", "🌌 混沌之魂", "🔻 紅寶石碎塊", "🔹 藍寶石碎塊", "🔸 黃寶石碎塊", "💜 紫水晶碎塊", "🍄 千年靈芝"]
        };

        const slots = { weapon: "⚔️ 武器欄位", head: "🪖 頭盔欄位", armor: "👕 護甲欄位", boots: "🥾 靴子欄位" };

        // --- 2. 初始狀態 ---
        let viewMode = 'loot'; // 'loot' 或 'equip'
        let currentSubCategory = Object.keys(categories)[0]; // 預設顯示第一個戰利品分類
        let currentEquipSlot = 'weapon'; // 預設顯示武器槽位

        // --- 3. 生成 Embed 函數 ---
        const generateEmbed = () => {
            const embed = new EmbedBuilder()
                .setTitle(`🎒 ${message.author.username} 的個人背包`)
                .setColor(viewMode === 'loot' ? 0x3498db : 0xe67e22)
                .addFields({ name: '💰 持有金幣', value: `\`$${p.money.toLocaleString()}\``, inline: true });

            if (viewMode === 'loot') {
                let content = "";
                const items = categories[currentSubCategory];
                items.forEach(name => {
                    const count = p.inventory[name] || 0;
                    if (count > 0) content += `**${name}** × \`${count}\`\n`;
                });
                embed.setDescription(`###  戰利品分區 - ${currentSubCategory}\n${content || "*目前沒有此類材料*"}`);
                embed.setFooter({ text: "切換上方選單來查看裝備或其他分類" });
            } else {
                const eq = p.equipment[currentEquipSlot];
                let eqDisplay = "❌ **目前未穿戴任何裝備**";
                if (eq && typeof eq === 'object') {
                    const plus = eq.plus || 0;
                    const statName = currentEquipSlot === 'weapon' ? '攻擊力' : '防禦力';
                    eqDisplay = `🔹 **名稱**: ${eq.name}\n🔹 **強化**: \`+${plus}\`\n🔹 **${statName}**: \`${eq.stat}\`\n🔹 **品質**: ${eq.quality || '普通'}`;
                }
                embed.setDescription(`### 🛡️ 裝備分區 - ${slots[currentEquipSlot]}\n${eqDisplay}`);
                embed.setFooter({ text: "切換上方選單來查看戰利品或切換部位" });
            }
            return embed;
        };

        // --- 4. 生成組件函數 ---
        const generateComponents = () => {
            // 第一層選單：切換 戰利品 / 裝備
            const modeRow = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('select_mode')
                    .setPlaceholder('🔄 切換背包分區...')
                    .addOptions([
                        { label: '📦 查看戰利品與材料', value: 'loot', description: '顯示藥水、礦石、素材等', emoji: '📦', default: viewMode === 'loot' },
                        { label: '🛡️ 查看當前裝備', value: 'equip', description: '顯示武器、防具等屬性', emoji: '🛡️', default: viewMode === 'equip' }
                    ])
            );

            // 第二層選單：根據模式顯示不同的子分類
            const subRow = new ActionRowBuilder();
            if (viewMode === 'loot') {
                const options = Object.keys(categories).map(cat => ({
                    label: cat,
                    value: cat,
                    default: cat === currentSubCategory
                }));
                subRow.addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('select_sub')
                        .setPlaceholder('📂 選擇材料分類...')
                        .addOptions(options)
                );
            } else {
                const options = Object.entries(slots).map(([key, label]) => ({
                    label: label,
                    value: key,
                    default: key === currentEquipSlot
                }));
                subRow.addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('select_equip')
                        .setPlaceholder('⚔️ 選擇裝備部位...')
                        .addOptions(options)
                );
            }

            return [modeRow, subRow];
        };

        // --- 5. 發送與監聽 ---
        const msg = await message.reply({
            embeds: [generateEmbed()],
            components: generateComponents()
        });

        const collector = msg.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            filter: i => i.user.id === message.author.id,
            time: 120000
        });

        collector.on('collect', async i => {
            if (i.customId === 'select_mode') {
                viewMode = i.values[0];
            } else if (i.customId === 'select_sub') {
                currentSubCategory = i.values[0];
            } else if (i.customId === 'select_equip') {
                currentEquipSlot = i.values[0];
            }

            await i.update({
                embeds: [generateEmbed()],
                components: generateComponents()
            });
        });

        collector.on('end', () => {
            msg.edit({ components: [] }).catch(() => {});
        });
    }
};