const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'dismantle',
        async execute(message, p, players) {
                const args = message.content.split(' ');
                        const itemName = args.slice(1).join(' ');

                                if (!itemName) return message.reply("👉 請輸入要分解的裝備名稱，例如：`~dismantle 生鏽的短劍`節");
                                        
                                                const itemIndex = p.backpack.indexOf(itemName);
                                                        if (itemIndex === -1) return message.reply("❌ 你的背包裡沒有這件裝備！");

                                                                // 判斷是否為可分解裝備 (避免分解到寶石或卷軸)
                                                                        const gearList = ["生鏽的短劍", "礦工頭盔", "【精良】探險家長靴"];
                                                                                const isGear = gearList.some(g => itemName.includes(g));
                                                                                        if (!isGear) return message.reply("❌ 這件物品太堅固了，無法分解！");

                                                                                                // 執行分解
                                                                                                        p.backpack.splice(itemIndex, 1);
                                                                                                                const scrapCount = Math.floor(Math.random() * 3) + 1; // 隨機獲得 1~3 個碎片
                                                                                                                        
                                                                                                                                if (!p.materials) p.materials = { "強化碎片": 0 };
                                                                                                                                        p.materials["強化碎片"] = (p.materials["強化碎片"] || 0) + scrapCount;

                                                                                                                                                players[message.author.id] = p;
                                                                                                                                                        fs.writeFileSync('./players.json', JSON.stringify(players, null, 2));

                                                                                                                                                                const embed = new EmbedBuilder()
                                                                                                                                                                            .setColor(0xe67e22)
                                                                                                                                                                                        .setTitle("⚒️ | 裝備拆解成功")
                                                                                                                                                                                                    .setDescription(`你將 **${itemName}** 拆解成了碎片。\n> 獲得：\`✨ 強化碎片 x${scrapCount}\``)
                                                                                                                                                                                                                .setFooter({ text: `目前擁有碎片：${p.materials["強化碎片"]}` });

                                                                                                                                                                                                                        await message.reply({ embeds: [embed] });
                                                                                                                                                                                                                            }
                                                                                                                                                                                                                            };