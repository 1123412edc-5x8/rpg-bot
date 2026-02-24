const fs = require('fs');

function checkAndResetSeason(players, guilds) {
    const now = new Date();
    // 取得當前月份字串，例如 "2026-2"
    const currentMonth = `${now.getFullYear()}-${now.getMonth() + 1}`;
    
    // 讀取/初始化紀錄檔
    let config = { lastReset: "" };
    if (fs.existsSync('./config.json')) {
        config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
    }

    // 判斷是否跨月
    if (config.lastReset !== currentMonth && config.lastReset !== "") {
        console.log(`[系統] 檢測到新月份 ${currentMonth}，執行賽季結算...`);

        // 1. 找出積分第一名的公會
        const sorted = Object.entries(guilds)
            .sort(([,a], [,b]) => (b.score || 0) - (a.score || 0));

        if (sorted.length > 0) {
            const [winnerName, winnerData] = sorted[0];
            // 團體獎勵：發放金幣到金庫
            guilds[winnerName].bank = (guilds[winnerName].bank || 0) + 100000;
        }

        // 2. 結算個人貢獻獎勵並重置
        for (let id in players) {
            const p = players[id];
            if (p.contribution > 0) {
                p.money += Math.floor(p.contribution * 10); // 1 積分換 10 金幣
                p.contribution = 0; 
            }
        }

        // 3. 重置公會積分
        for (let gName in guilds) {
            guilds[gName].score = 0;
        }

        // 4. 更新紀錄
        config.lastReset = currentMonth;
        fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
        fs.writeFileSync('./players.json', JSON.stringify(players, null, 2));
        fs.writeFileSync('./guilds.json', JSON.stringify(guilds, null, 2));
        
        return { success: true, winner: sorted[0]?.[0] };
    }

    // 初次執行初始化
    if (config.lastReset === "") {
        config.lastReset = currentMonth;
        fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
    }
    return { success: false };
}

module.exports = { checkAndResetSeason };
