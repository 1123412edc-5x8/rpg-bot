const cooldowns = new Map();

/**
 * 檢查玩家是否在冷卻中
 * @param {string} userId 玩家 Discord ID
 * @param {string} cmdName 指令名稱
 * @param {number} seconds 冷卻秒數
 * @returns {number|null} 剩餘秒數，若不在冷卻中則回傳 null
 */
function checkCooldown(userId, cmdName, seconds) {
    const key = `${userId}-${cmdName}`;
    const now = Date.now();
    const expirationTime = cooldowns.get(key) || 0;

    if (now < expirationTime) {
        return Math.ceil((expirationTime - now) / 1000);
    }

    cooldowns.set(key, now + (seconds * 1000));
    return null;
}

module.exports = { checkCooldown };
