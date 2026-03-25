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
    if (index > 50) return;

    // Pick a proxy, but make sure it exists
    const rawProxy = proxyList[Math.floor(Math.random() * proxyList.length)];
    if (!rawProxy) return spawnBot(index);

    const [host, port] = rawProxy.split(':');
    
    const agent = new SocksProxyAgent({
        hostname: host.trim(),
        port: parseInt(port),
        protocol: 'socks5:',
        // This stops the EAI_AGAIN hang
        timeout: 5000 
    });

    const ws = new WebSocket(SERVER, {
        agent: agent,
        handshakeTimeout: 5000, // Don't wait more than 5s to connect
        headers: { 'Origin': 'https://arras.io' }
    });

    ws.on('open', () => {
        console.log(`[Bot ${index}] Joined! IP: ${host}`);
        ws.send(Buffer.from([0x00])); 
        setTimeout(() => spawnBot(index + 1), 1500);
    });

    ws.on('error', (err) => {
        // If it's a DNS error or Timeout, just try a new proxy immediately
        spawnBot(index); 
    });
}

spawnBot(1);
