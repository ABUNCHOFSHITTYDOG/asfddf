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

const proxyList = fs.readFileSync('proxies.txt', 'utf8')
    .replace(/\r/g, '') // Remove Windows line endings
    .split('\n')
    .filter(p => p.trim() && p.includes(':')); // Only keep lines with IP:PORT

function spawnBot(index) {
    if (index > 50) {
        console.log("🏁 All 50 bots have attempted to join for this worker.");
        return;
    }

    const rawProxy = proxyList[Math.floor(Math.random() * proxyList.length)];
    const [host, port] = rawProxy.split(':');
    
    // Log the attempt immediately
    console.log(`[Bot ${index}] 🛡️ Attempting join via Proxy: ${host}:${port}...`);

    const agent = new SocksProxyAgent({
        hostname: host.trim(),
        port: parseInt(port),
        protocol: 'socks5:',
        timeout: 5000 
    });

    const ws = new WebSocket(SERVER, {
        agent: agent,
        handshakeTimeout: 8000, // Give free proxies a bit more time
        headers: { 'Origin': 'https://arras.io' }
    });

    ws.on('open', () => {
        // THIS IS THE BIG ONE - YOU WILL SEE THIS WHEN IT WORKS
        console.log(`[Bot ${index}] ✅ SUCCESS! Joined the game.`);
        ws.send(Buffer.from([0x00])); 
        
        // Don't stop! Keep spawning the rest.
        setTimeout(() => spawnBot(index + 1), 1500);
    });

    ws.on('error', (err) => {
        // Log the failure so you know it didn't freeze
        console.log(`[Bot ${index}] ❌ Proxy Dead (${err.message}). Retrying...`);
        setTimeout(() => spawnBot(index), 500); 
    });
}
spawnBot(1);
