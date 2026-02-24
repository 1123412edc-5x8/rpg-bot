const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'backup',
    async execute(message) {
        // 安全檢查：只有管理員（你）能執行
        if (!message.member.permissions.has('Administrator')) {
            return message.reply("❌ **權限不足：** 只有遺蹟管理員能執行存檔備份。");
        }

        const date = new Date();
        const timestamp = `${date.getFullYear()}${date.getMonth()+1}${date.getDate()}_${date.getHours()}${date.getMinutes()}`;
        const backupPath = path.join(__dirname, `../backups/players_manual_${timestamp}.json`);

        try {
            fs.copyFileSync('./players.json', backupPath);
            message.reply(`✅ **系統存檔成功！**\n> 檔案已備份至：\`backups/players_manual_${timestamp}.json\``);
        } catch (err) {
            message.reply("❌ **備份失敗：** 請檢查伺服器權限。");
            console.error(err);
        }
    }
};
