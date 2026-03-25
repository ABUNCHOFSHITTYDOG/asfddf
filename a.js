const fs = require('fs');
const WebSocket = require('ws');
let SocksProxyAgent = require('socks-proxy-agent');

if (SocksProxyAgent.SocksProxyAgent) SocksProxyAgent = SocksProxyAgent.SocksProxyAgent;

const SERVER = "wss://ak7oqfc2u4qqcu6i-c.uvwx.xyz:8443/5003/";

// 1. IMPROVED CLEANING: This extracts the proxy even if it's trapped in a curl command
const proxyList = fs.readFileSync('asocks_proxies.txt', 'utf8')
    .split('\n')
    .map(line => {
        // Regex: Find the pattern user:pass@ip:port
        const match = line.match(/([a-zA-Z0-9.\-_]+:[a-zA-Z0-9.\-_]+@[0-9.]+:[0-9]+)/);
        return match ? `socks5://${match[1]}` : null;
    })
    .filter(line => line !== null);

console.log(`📡 Swarm Engine Loaded. ${proxyList.length} German Proxies cleaned from Curl format.`);

function spawnBot(index) {
    if (index > 25) return; 

    const proxyUrl = proxyList[Math.floor(Math.random() * proxyList.length)];

    if (!proxyUrl) {
        console.log(`⚠️ No valid proxies found in list.`);
        return;
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
            
            // Handshake (arras.io init)
            ws.send(Uint8Array.from([0x00, 0x61, 0x72, 0x72, 0x61, 0x73, 0x2e, 0x69, 0x6f]));

            setTimeout(() => {
                // Spawn (Enter key)
                ws.send(Uint8Array.from([0x00, 0x00]));
                
                // Heartbeat (Keep-alive)
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
        console.log(`[Bot ${index}] ❌ Error: ${e.message}`);
        setTimeout(() => spawnBot(index), 1000);
    }
}

spawnBot(1);
