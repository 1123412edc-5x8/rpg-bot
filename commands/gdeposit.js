const fs = require('fs');

module.exports = {
    name: 'gdeposit',
    async execute(message, p, players) {
        const args = message.content.split(' ');
        const amount = parseInt(args[1]);

        if (!p.guild) return message.reply("❌ **你還沒加入任何公會！**");
        if (!amount || amount <= 0) return message.reply("❌ **請輸入正確的捐款金額。** (例如：`~gdeposit 1000`) ");
        if (p.money < amount) return message.reply("❌ **你的錢包不夠捐這麼多！**");

        const guilds = JSON.parse(fs.readFileSync('./guilds.json'));
        if (!guilds[p.guild]) return message.reply("❌ **公會資料錯誤。**");

        // 扣玩家錢，加公會錢
        p.money -= amount;
        guilds[p.guild].bank = (guilds[p.guild].bank || 0) + amount;

        // 存檔
        players[message.author.id] = p;
        fs.writeFileSync('./players.json', JSON.stringify(players, null, 2));
        fs.writeFileSync('./guilds.json', JSON.stringify(guilds, null, 2));

        message.reply(`✅ **感謝貢獻！** 你向公會 【${p.guild}】 捐贈了 \`$${amount}\` 金幣。\n> *目前公會總資產：\`$${guilds[p.guild].bank}\`*`);
    }
};
