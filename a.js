const fs = require('fs');
const WebSocket = require('ws');
// WE BYPASS THE EXPORT ERROR BY POINTING TO THE DIST FOLDER
const SocksProxyAgent = require('socks-proxy-agent/dist/index').SocksProxyAgent;

const SERVER = "wss://ak7oqfc2u4qqcu6i-c.uvwx.xyz:8443/5003/";

// Check if files exist before starting
if (!fs.existsSync('proxies.txt')) {
    console.log("❌ Error: proxies.txt not found! Make sure the curl command in yml worked.");
    process.exit(1);
}

const proxyList = fs.readFileSync('proxies.txt', 'utf8').split('\n').filter(p => p.trim());

function spawnBot(index) {
    if (index > 50) return; // Limit to 50 bots per worker

    const rawProxy = proxyList[Math.floor(Math.random() * proxyList.length)];
    const agent = new SocksProxyAgent(`socks5://${rawProxy}`);

    const ws = new WebSocket(SERVER, {
        agent: agent,
        timeout: 10000,
        headers: { 'Origin': 'https://arras.io' }
    });

    ws.on('open', () => {
        console.log(`[Bot ${index}] Joined! IP: ${rawProxy}`);
        ws.send(Buffer.from([0x00])); // Press "Enter"
        
        // Wait 2 seconds before spawning next bot
        setTimeout(() => spawnBot(index + 1), 2000);
    });

    ws.on('error', (err) => {
        console.log(`[Bot ${index}] Failed: ${err.message}. Retrying...`);
        spawnBot(index); // Try again with a different proxy
    });
}

spawnBot(1);
