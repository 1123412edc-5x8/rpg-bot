const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
    });

    // --- 1. 自動指令讀取 ---
    client.commands = new Collection();
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
            client.commands.set(command.name, command);
            }
            console.log(`📦 已成功載入 ${client.commands.size} 個指令`);

            // --- 2. 存檔讀取系統 (防呆加強版) ---
            let players = {};
            if (fs.existsSync('./players.json')) {
                try {
                        const data = fs.readFileSync('./players.json', 'utf8');
                                players = data.trim() ? JSON.parse(data) : {};
                                    } catch (e) {
                                            console.error("❌ players.json 讀取失敗，格式可能毀損！");
                                                    players = {};
                                                        }
                                                        }

                                                        client.once('ready', () => console.log(`✅ RPG 系統已啟動！身份：${client.user.tag}`));

                                                        // --- 3. 指令處理器 ---
                                                        client.on('messageCreate', async message => {
                                                            if (message.author.bot || !message.content.startsWith('~')) return;

                                                                const args = message.content.slice(1).trim().split(/ +/);
                                                                    const commandName = args.shift().toLowerCase();

                                                                        // 自動別名偵測
                                                                            const command = client.commands.get(commandName) 
                                                                                    || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

                                                                                        if (!command) return;

                                                                                            const userId = message.author.id;
                                                                                                // 玩家初始化
                                                                                                    if (!players[userId]) {
                                                                                                            players[userId] = { 
                                                                                                                        level: 1, exp: 0, money: 1000, hp: 100, maxHp: 100, energy: 12,
                                                                                                                                    inventory: {}, 
                                                                                                                                                equipment: { weapon: null, head: null, armor: null, boots: null, plus: { weapon: 0, head: 0, armor: 0, boots: 0 } }
                                                                                                                                                        };
                                                                                                                                                                fs.writeFileSync('./players.json', JSON.stringify(players, null, 2));
                                                                                                                                                                    }

                                                                                                                                                                        try {
                                                                                                                                                                                // 🚀 執行指令
                                                                                                                                                                                        await command.execute(message, args, players[userId], players);
                                                                                                                                                                                                
                                                                                                                                                                                                        // 💾 全域自動存檔：指令執行完必存，解決回檔問題！
                                                                                                                                                                                                                fs.writeFileSync('./players.json', JSON.stringify(players, null, 2));
                                                                                                                                                                                                                    } catch (error) {
                                                                                                                                                                                                                            console.error(error);
                                                                                                                                                                                                                                    message.reply('❌ 執行指令時發生錯誤！');
                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                        });

                                                                                                                                                                                                                                        client.login(process.env.DISCORD_TOKEN);