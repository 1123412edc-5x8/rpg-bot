const cooldowns = new Map();

module.exports = {
    name: 'enhance',
    async execute(message, p, players) {
        const now = Date.now();
        if (cooldowns.has(message.author.id)) {
            if (now < cooldowns.get(message.author.id) + 3000) return; // 沒到 3 秒直接無視
        }
        
        // 執行強化邏輯...

        cooldowns.set(message.author.id, now);
    }
};
//EOFcat <<'EOF' > commands/enhance.j

//module.exports = {
  //  name: 'enhance',
///async execute(message, p, players) {
///const now = Date.now();
       // if (cooldowns.has(message.author.id)) {
        //    if (now < cooldowns.get(message.author.id) + 3000) return; // 沒到 3 秒直接無視
      //  }
        
        // 執行強化邏輯...

       // c////ooldowns.set(message.author.id, now);
    //}
//}//;
