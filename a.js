const fs = require('fs');
const WebSocket = require('ws');
let SocksProxyAgent = require('socks-proxy-agent');

if (SocksProxyAgent.SocksProxyAgent) SocksProxyAgent = SocksProxyAgent.SocksProxyAgent;

const SERVER = "wss://ak7oqfc2u4qqcu6i-c.uvwx.xyz:8443/5003/";

// 1. IMPROVED CLEANING: This handles spaces, brackets, and empty lines much better
const proxyList = fs.readFileSync('asocks_proxies.txt', 'utf8')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 10) // Ignore tiny/empty lines
    .map(line => line.split('[')[0].trim()); // Strip the refresh link and extra spaces

console.log(`📡 Swarm Engine Loaded. ${proxyList.length} German Proxies verified.`);

function spawnBot(index) {
    if (index > 25) return; 

    // Pick a random proxy
    const proxyUrl = proxyList[Math.floor(Math.random() * proxyList.length)];

    // DEBUG: If it's still failing, this will tell us exactly why
    if (!proxyUrl || !proxyUrl.startsWith('socks5://')) {
        console.log(`⚠️ Skipping invalid line: "${proxyUrl}"`);
        return spawnBot(index);
    }

    try {
        const agent = new SocksProxyAgent(proxyUrl);
        const ws = new WebSocket(SERVER, {
            agent: agent,
            handshakeTimeout: 10000,
            headers: { 
                'Origin': 'https://arras.io',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        ws.on('open', () => {
            console.log(`[Bot ${index}] ✅ CONNECTED. Sending Spawn Packets...`);
            
            // Handshake
            ws.send(Uint8Array.from([0x00, 0x61, 0x72, 0x72, 0x61, 0x73, 0x2e, 0x69, 0x6f]));

            setTimeout(() => {
                // Spawn
                ws.send(Uint8Array.from([0x00, 0x00]));
                
                // Heartbeat
                const pulse = setInterval(() => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(Uint8Array.from([0x01, 0x00]));
                    } else {
                        clearInterval(pulse);
                    }
                }, 5000);

                setTimeout(() => spawnBot(index + 1), 1200);
            }, 1000);
        });

        ws.on('error', (err) => {
            console.log(`[Bot ${index}] ❌ Connection Error: ${err.message}`);
            setTimeout(() => spawnBot(index), 2000);
        });

    } catch (e) {
        console.log(`[Bot ${index}] ❌ CRITICAL PARSE ERROR: ${e.message}`);
        console.log(`Broken URL was: ${proxyUrl}`);
        setTimeout(() => spawnBot(index), 1000);
    }
}

spawnBot(1);
