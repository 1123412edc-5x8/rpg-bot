const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// --- 1. 自動指令讀取系統 ---
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    // 將指令存入 Collection，key 是指令名稱 (例如 'status')
    client.commands.set(command.name, command);
}
console.log(`📦 已成功載入 ${client.commands.size} 個指令：${commandFiles.join(', ')}`);

// --- 2. 存檔讀取系統 ---
let players = {};
if (fs.existsSync('./players.json')) {
    players = JSON.parse(fs.readFileSync('./players.json', 'utf8'));
}

client.once('ready', () => {
    console.log(`✅ RPG 系統已啟動！登入身份：${client.user.tag}`);
});

// --- 3. 訊息監聽與分流 ---
client.on('messageCreate', async message => {
    if (message.author.bot || !message.content.startsWith('~')) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // 初始化新玩家 (確保包含所有基礎數值)
    const userId = message.author.id;
    if (!players[userId]) {
        players[userId] = { 
            level: 1, 
            exp: 0, 
            job: 'appraiser', 
            money: 0,
            stats: { STR: 5, LUK: 10 },
            backpack: [] 
        };
        fs.writeFileSync('./players.json', JSON.stringify(players, null, 2));
    }

    // 尋找並執行指令檔案
    const command = client.commands.get(commandName);
    if (!command) return;

    try {
        // 傳入 message, 當前玩家資料, 以及全部玩家資料(方便存檔)
        await command.execute(message, players[userId], players);
    } catch (error) {
        console.error(error);
        message.reply('❌ 執行指令時發生錯誤！');
    }
});

client.login(process.env.DISCORD_TOKEN);