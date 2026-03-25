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
    if (index > 25) return; // Start with 25 bots to save your 3GB data

    const rawLine = proxyList[Math.floor(Math.random() * proxyList.length)];
    
    // THE FIX: We split the string by spaces and take the part after '-x http://'
    // If the line is: curl -x http://USER:PASS@IP:PORT https://...
    // We want the part at index 3.
    const parts = rawLine.split(' ');
    const proxyAuth = parts[3]; // This grabs 'USER:PASS@IP:PORT'

    if (!proxyAuth || !proxyAuth.includes('@')) {
        console.log(`⚠️ Skipping malformed line.`);
        return setTimeout(() => spawnBot(index), 100);
    }

    // We convert it to a format the Proxy Agent understands
    const proxyUrl = `http://${proxyAuth}`; 

    try {
        const agent = new SocksProxyAgent(proxyUrl);
        const ws = new WebSocket(SERVER, {
            agent: agent,
            handshakeTimeout: 7000,
            headers: { 
                'Origin': 'https://arras.io',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        ws.on('open', () => {
            console.log(`[Bot ${index}] ✅ SUCCESS! Joined from Germany (DE).`);
            ws.send(Buffer.from([0x00])); 
            setTimeout(() => spawnBot(index + 1), 2000);
        });

        ws.on('error', (err) => {
            console.log(`[Bot ${index}] ❌ Connection failed: ${err.message}`);
            // If the proxy is dead, try a different one after a short delay
            setTimeout(() => spawnBot(index), 2000);
        });
    } catch (e) {
        spawnBot(index);
    }
}

spawnBot(1);
