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
    client.commands.set(command.name, command);
}
console.log(`📦 已成功載入 ${client.commands.size} 個指令`);

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

    // 💡 自動偵測：先找指令名稱，找不到再去找 aliases 別名
    const command = client.commands.get(commandName) 
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    // 初始化新玩家
    const userId = message.author.id;
    if (!players[userId]) {
        players[userId] = { 
            level: 1, 
            exp: 0, 
            money: 1000,
            hp: 100,
            maxHp: 100,
            energy: 12, // 💡 補上遺失的體力初始化
            inventory: {}, 
            equipment: {
                weapon: null, head: null, armor: null, boots: null,
                plus: { weapon: 0, head: 0, armor: 0, boots: 0 }
            }
        };
        fs.writeFileSync('./players.json', JSON.stringify(players, null, 2));
    }

    try {
        await command.execute(message, args, players[userId], players);
    } catch (error) {
        console.error(error);
        message.reply('❌ 執行指令時發生錯誤！');
    }
});

// --- 自動備份系統 ---
setInterval(() => {
    if (!fs.existsSync('./backups')) fs.mkdirSync('./backups');
    const date = new Date();
    const timestamp = `${date.getMonth()+1}月${date.getDate()}日_${date.getHours()}時`;
    if (fs.existsSync('./players.json')) {
        fs.copyFileSync('./players.json', `./backups/auto_backup_${timestamp}.json`);
        console.log(`[系統] 已完成自動備份`);
    }
}, 3600000); 

client.login(process.env.DISCORD_TOKEN);