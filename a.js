const fs = require('fs');
const WebSocket = require('ws');
let { SocksProxyAgent } = require('socks-proxy-agent');

// Bulletproof constructor check
if (typeof SocksProxyAgent !== 'function' && SocksProxyAgent.SocksProxyAgent) {
    SocksProxyAgent = SocksProxyAgent.SocksProxyAgent;
}

const SERVER = "wss://ak7oqfc2u4qqcu6i-c.uvwx.xyz:8443/5003/";

// Load and CLEAN the proxy list
const proxyList = fs.readFileSync('asocks_proxies.txt', 'utf8')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 10); // Ignore empty/short lines

function spawnBot(index) {
    if (index > 50) return;

    const rawLine = proxyList[Math.floor(Math.random() * proxyList.length)];
    
    // This Regex extracts ONLY the host:port:user:pass part, ignoring the 'curl' junk
    // It looks for a pattern like: something.com:1234:user:pass
    const match = rawLine.match(/([^\s]+:[0-9]+:[^\s]+:[^\s]+)/);
    
    if (!match) {
        console.log(`⚠️ Skipping messy line: ${rawLine.substring(0, 30)}...`);
        return spawnBot(index); 
    }

    const [host, port, user, pass] = match[1].split(':');
    const proxyUrl = `socks5://${user}:${pass}@${host}:${port}`;

    try {
        const agent = new SocksProxyAgent(proxyUrl);
        const ws = new WebSocket(SERVER, {
            agent: agent,
            handshakeTimeout: 5000,
            headers: { 'Origin': 'https://arras.io' }
        });

        ws.on('open', () => {
            console.log(`[Bot ${index}] ✅ Joined! (Proxy: ${host})`);
            ws.send(Buffer.from([0x00])); 
            setTimeout(() => spawnBot(index + 1), 1500);
        });

        ws.on('error', (err) => {
            console.log(`[Bot ${index}] ❌ Connection failed: ${err.message}`);
            setTimeout(() => spawnBot(index), 1000);
        });
    } catch (e) {
        console.log("❌ URL Formatting Error. Trying next proxy...");
        spawnBot(index);
    }
}

spawnBot(1);
