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

    // Safety check: if proxies didn't download, don't loop forever
    if (proxyList.length === 0) {
        console.log("❌ No proxies found in proxies.txt!");
        return;
    }

    const rawProxy = proxyList[Math.floor(Math.random() * proxyList.length)];
    const [host, port] = rawProxy.split(':');
    
    // Safety check for malformed proxy lines
    if (!host || !port) return setTimeout(() => spawnBot(index), 100);

    const agent = new SocksProxyAgent({
        hostname: host.trim(),
        port: parseInt(port),
        protocol: 'socks5:',
        timeout: 5000 
    });

    const ws = new WebSocket(SERVER, {
        agent: agent,
        handshakeTimeout: 5000,
        headers: { 'Origin': 'https://arras.io' }
    });

    ws.on('open', () => {
        console.log(`[Bot ${index}] Joined! IP: ${host}`);
        ws.send(Buffer.from([0x00])); 
        setTimeout(() => spawnBot(index + 1), 2000); // Wait 2s for next bot
    });

    ws.on('error', (err) => {
        // IMPORTANT: The 500ms delay here prevents the RangeError crash
        setTimeout(() => spawnBot(index), 500); 
    });
}

spawnBot(1);
