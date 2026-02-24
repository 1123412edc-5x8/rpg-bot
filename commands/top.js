const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'top',
    async execute(message, p, players) {
        const args = message.content.split(' ');
        const mode = args[1] === 'lv' ? 'LEVEL' : 'ATK';

        const weaponBase = { "生鏽的短劍": 10, "【精良】探險家長弓": 45, "【史詩】符文重錘": 150, "【傳說】亞特蘭提斯之鋒": 500 };
        const gemValues = { "紅寶石": 150, "黃寶石": 50 };

        // 🌟 使用 Promise.all 處理非同步名稱抓取
        let leaderboard = await Promise.all(Object.keys(players).map(async (id) => {
            const user = players[id];
            
            // 🔍 嘗試抓取 Discord 名稱
            // 先找快取，找不到就用 fetch，最後才用 "未知勇者"
            let displayName = user.name;
            if (!displayName) {
                try {
                    const discordUser = await message.client.users.fetch(id);
                    displayName = discordUser.username;
                } catch (e) {
                    displayName = "遺蹟冒險者";
                }
            }

            // 1. 基礎攻擊
            let baseAtk = (user.level || 1) * 15;
            
            // 2. 裝備與強化加成
            let gearAtk = 0;
            if (user.equipment?.weapon) {
                const bName = user.equipment.weapon.split(' +')[0];
                gearAtk = weaponBase[bName] || 0;
                if (user.equipment.weapon.includes("+")) {
                    const lv = parseInt(user.equipment.weapon.split('+')[1]);
                    gearAtk = Math.floor(gearAtk * (1 + lv * 0.5));
                }
                if (user.equipment.durability?.weapon <= 0) gearAtk = 0;
            }

            // 3. 寶石加成
            let gemAtk = 0;
            if (user.equipment?.slots?.weapon) {
                user.equipment.slots.weapon.forEach(gem => {
                    gemAtk += (gemValues[gem] || 0);
                });
            }

            let finalAtk = baseAtk + gearAtk + gemAtk;
            if (user.job === "影刃") finalAtk = Math.floor(finalAtk * 1.2);
            if (user.job === "⚔️ 狂戰士") finalAtk = Math.floor(finalAtk * 1.5);

            return {
                name: displayName,
                level: user.level || 1,
                exp: user.exp || 0,
                totalAtk: finalAtk
            };
        }));

        let title = "";
        let desc = "";

        if (mode === 'LEVEL') {
            leaderboard.sort((a, b) => b.level - a.level || b.exp - a.exp);
            title = "🏆 | 遺蹟等級英雄榜";
            leaderboard.slice(0, 5).forEach((user, i) => {
                const medal = ["🥇", "🥈", "🥉", "🏅", "🏅"][i];
                desc += `${medal} **${user.name}** - \`Lv.${user.level}\` (${user.exp} Exp)\n`;
            });
        } else {
            leaderboard.sort((a, b) => b.totalAtk - a.totalAtk);
            title = "⚔️ | 遺蹟戰力英雄榜";
            leaderboard.slice(0, 5).forEach((user, i) => {
                const medal = ["🥇", "🥈", "🥉", "🏅", "🏅"][i];
                desc += `${medal} **${user.name}** - 戰力: \`🔥 ${user.totalAtk}\` (Lv.${user.level})\n`;
            });
        }

        const embed = new EmbedBuilder()
            .setColor(mode === 'LEVEL' ? 0x3498db : 0xf1c40f)
            .setTitle(title)
            .setDescription(desc || "目前尚無資料")
            .setFooter({ text: "輸入 ~top 查看戰力榜 | 輸入 ~top lv 查看等級榜" });

        await message.reply({ embeds: [embed] });
    }
};