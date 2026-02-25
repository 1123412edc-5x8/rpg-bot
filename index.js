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
console.log(`📦 已成功載入 ${client.commands.size} 個指令：${commandFiles.join(', ')}`);

// --- 2. 存檔讀取系統 ---
let players = {};
if (fs.existsSync('./players.json')) {
    players = JSON.parse(fs.readFileSync('./players.json', 'utf8'));
}

// 💡 定義別名映射表 (讓程式知道 ~ts 就是 explore)
const aliasMap = {
    '探索': 'explore', 'ts': 'explore',
    '背包': 'bag', 'bb': 'bag',
    '市場': 'market', '交易所': 'market', 'sc': 'market',
    '賣': 'sell', 'm': 'sell',
    '清包': 'sellall',
    '強化': 'upgrade', 'qh': 'upgrade',
    '合成': 'craft', 'hc': 'craft',
    '狀態': 'stats', 'st': 'stats'
};

client.once('ready', () => {
    console.log(`✅ RPG 系統已啟動！登入身份：${client.user.tag}`);
});

// --- 3. 訊息監聽與分流 ---
client.on('messageCreate', async message => {
    if (message.author.bot || !message.content.startsWith('~')) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const inputCommand = args.shift().toLowerCase();

    // 💡 關鍵：透過映射表抓取真實指令名稱，如果沒映射就用原始輸入
    const commandName = aliasMap[inputCommand] || inputCommand;

    // 初始化新玩家 (加入背包與裝備物件)
    const userId = message.author.id;
    if (!players[userId]) {
        players[userId] = { 
            level: 1, 
            exp: 0, 
            money: 1000, // 給新手一點啟動資金
            hp: 100,
            maxHp: 100,
            inventory: {}, // 存放那 80 種材料與藥水
            equipment: {   // 存放穿戴中的裝備
                weapon: null,
                head: null,
                armor: null,
                boots: null,
                plus: { weapon: 0, head: 0, armor: 0, boots: 0 }
            }
        };
        fs.writeFileSync('./players.json', JSON.stringify(players, null, 2));
    }

    const command = client.commands.get(commandName);
    if (!command) return;

    try {
        // 💡 傳入 args 給 execute，這樣指令檔案裡才能讀到等級、數量等參數
        await command.execute(message, args, players[userId], players);
    } catch (error) {
        console.error(error);
        message.reply('❌ 執行指令時發生錯誤！請聯繫管理員。');
    }
});

// --- 自動備份系統 (保持不變) ---
setInterval(() => {
    if (!fs.existsSync('./backups')) fs.mkdirSync('./backups');
    const date = new Date();
    const timestamp = `${date.getMonth()+1}月${date.getDate()}日_${date.getHours()}時`;
    const backupPath = `./backups/auto_backup_${timestamp}.json`;

    if (fs.existsSync('./players.json')) {
        fs.copyFileSync('./players.json', backupPath);
        console.log(`[系統] 已完成定時備份: ${timestamp}`);
    }
}, 60 * 60 * 1000); 

client.login(process.env.DISCORD_TOKEN);