const fs = require('fs');
const WebSocket = require('ws');
const { SocksProxyAgent } = require('socks-proxy-agent'); // This works in v7
const SERVER = "wss://ak7oqfc2u4qqcu6i-c.uvwx.xyz:8443/5003/";
function spawnBot(index) {
    const proxy = proxyList[Math.floor(Math.random() * proxyList.length)];
    const agent = new SocksProxyAgent(`socks5://${proxy}`);

   const ws = new WebSocket(SERVER, {
        agent: agent,
        headers: { 'Origin': 'https://arras.io' }
    });

    ws.on('error', (err) => {
        // This will print the EXACT reason if Arras blocks you
        console.log(`[Bot ${index}] Connection Error: ${err.message}`);
    });

    ws.on('open', () => {
        console.log(`[Bot ${index}] SUCCESS: Connected!`);
        ws.send(Buffer.from([0x00])); // The "Enter" key
        
        setTimeout(() => spawnBot(index + 1), 2000);
    });
}
// Start the loop
spawnBot(1);
