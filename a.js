const fs = require('fs');
const WebSocket = require('ws');
const { SocksProxyAgent } = require('socks-proxy-agent/dist/index').SocksProxyAgent;

// Load your personal Asocks list
const proxyList = fs.readFileSync('asocks_proxies.txt', 'utf8')
    .split('\n')
    .filter(p => p.trim());

function spawnBot(index) {
    if (index > 50) return;

    // Pick a random rotating endpoint from your list
    const proxyString = proxyList[Math.floor(Math.random() * proxyList.length)];
    
    // Asocks lists usually come in the format: host:port:user:pass
    // We need to convert it to: socks5://user:pass@host:port
    const [host, port, user, pass] = proxyString.split(':');
    const proxyUrl = `socks5://${user}:${pass}@${host}:${port}`;

    const agent = new SocksProxyAgent(proxyUrl);
    const ws = new WebSocket("wss://ak7oqfc2u4qqcu6i-c.uvwx.xyz:8443/5003/", {
        agent: agent,
        headers: { 'Origin': 'https://arras.io' }
    });

    ws.on('open', () => {
        console.log(`[Bot ${index}] ✅ SUCCESS! Joined via Asocks Rotation.`);
        ws.send(Buffer.from([0x00])); // The "Enter" Key
        
        // Wait 1.5 seconds and spawn the next one
        setTimeout(() => spawnBot(index + 1), 1500);
    });

    ws.on('error', (err) => {
        console.log(`[Bot ${index}] ❌ Failed: ${err.message}. Retrying...`);
        setTimeout(() => spawnBot(index), 1000);
    });
}

spawnBot(1);
