const fs = require('fs');

module.exports = {
    name: 'checkin',
    async execute(message, p, players) {
        // 1. 基礎簽到獎勵
        let reward = 1000;
        let bonusMsg = "";

        // 2. 獲取公會排名
        if (p.guild && fs.existsSync('./guilds.json')) {
            const guildsData = JSON.parse(fs.readFileSync('./guilds.json'));
            const sortedGuilds = Object.entries(guildsData)
                .map(([name, data]) => ({ name, ...data }))
                .sort((a, b) => (b.bank || 0) - (a.bank || 0));

            // 檢查是否為第一名
            if (sortedGuilds.length > 0 && p.guild === sortedGuilds[0].name) {
                const bonus = Math.floor(reward * 0.5); // 50% 加成
                reward += bonus;
                bonusMsg = `\n> 👑 **最強公會加成：+$${bonus} (50%)**`;
            }
        }

        // 3. 檢查冷卻與發放獎勵
        const now = Date.now();
        if (p.lastCheckin && now - p.lastCheckin < 86400000) {
            return message.reply("❌ **今天已經領過獎勵囉！** 明天再來吧。");
        }

        p.money = (p.money || 0) + reward;
        p.lastCheckin = now;

        players[message.author.id] = p;
        fs.writeFileSync('./players.json', JSON.stringify(players, null, 2));

        message.reply(`🧧 **簽到成功！** 獲得了 \`$${reward}\` 金幣！${bonusMsg}`);
    }
};
