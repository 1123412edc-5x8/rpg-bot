const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
require('dotenv').config();
const { handleCommands } = require('./commands');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// 確保 players.json 存在，如果不存在就建立一個空物件
let players = {};
if (fs.existsSync('./players.json')) {
    players = JSON.parse(fs.readFileSync('./players.json', 'utf8'));
} else {
    fs.writeFileSync('./players.json', '{}');
}

client.once('ready', () => {
    console.log(`✅ 系統啟動！${client.user.tag} 準備就緒。`);
});

client.on('messageCreate', message => {
    // 忽略機器人與沒帶波浪號的訊息
    if (message.author.bot || !message.content.startsWith('~')) return;

    const userId = message.author.id;

    // 初始化新玩家 (確保包含背包)
    if (!players[userId]) {
        players[userId] = { 
            level: 1, 
            exp: 0, 
            job: 'appraiser', 
            stats: { STR: 5, LUK: 10 },
            backpack: [] 
        };
        fs.writeFileSync('./players.json', JSON.stringify(players, null, 2));
    }

    // 呼叫外部指令
    handleCommands(message, players);
});

client.login(process.env.DISCORD_TOKEN);