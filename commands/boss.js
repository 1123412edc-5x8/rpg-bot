const cooldowns = new Map();

module.exports = {
    name: 'boss',
    async execute(message, p, players) {
        const now = Date.now();
        const cooldownAmount = 5 * 60 * 1000; // 5 分鐘
        
        if (cooldowns.has(message.author.id)) {
            const expirationTime = cooldowns.get(message.author.id) + cooldownAmount;
            if (now < expirationTime) {
                const timeLeft = Math.ceil((expirationTime - now) / 1000 / 60);
                return message.reply(`🛡️ 你剛挑戰過首領，還需要休息 \`${timeLeft}\` 分鐘。`);
            }
        }

        // 執行原本的 boss 挑戰邏輯...

        cooldowns.set(message.author.id, now);
        setTimeout(() => cooldowns.delete(message.author.id), cooldownAmount);
    }
};
