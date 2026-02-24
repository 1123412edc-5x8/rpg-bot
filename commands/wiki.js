const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'wiki',
    async execute(message) {
        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle("📜 | 遺蹟全裝備百科")
            .addFields(
                { name: "⚔️ 武器庫 (增加攻擊力)", value: "• **生鏽的短劍**: +10\n• **【精良】探險家短弓**: +45\n• **【史詩】符文重錘**: +150\n• **【傳說】亞特蘭提斯之鋒**: +500", inline: false },
                { name: "🛡️ 防具庫 (增加體力/生存)", value: "• **礦工頭盔**: 體力 +1\n• **【精良】皮製胸甲**: 體力 +3\n• **【史詩】祭司銀袍**: 體力 +8\n• **【傳說】永恆神諭盔甲**: 體力 +20", inline: false }
            )
            .setFooter({ text: "用法：~equip [裝備全名] | 系統會自動辨識種類" });

        await message.reply({ embeds: [embed] });
    }
};
