const fs = require('fs');
const WebSocket = require('ws');
let SocksProxyAgent = require('socks-proxy-agent');

if (SocksProxyAgent.SocksProxyAgent) SocksProxyAgent = SocksProxyAgent.SocksProxyAgent;

const SERVER = "wss://ak7oqfc2u4qqcu6i-c.uvwx.xyz:8443/5003/";

// REPLACING with the full sequence logic
const captureSequence = [
    [0, 1, 0, 1, 114, 34, 126, 194, 6, 80, 35, 77], // Packet 1
    [81, 238, 54, 110, 4, 33, 2, 5, 81, 167, 194, 44, 237, 175, 112, 176, 34, 115, 137, 162, 244, 244, 193, 134, 145, 184, 214, 155, 70, 79, 151, 73], // Packet 2
    [193, 233, 189, 50, 33, 199, 16, 81, 83, 216, 7, 97, 154, 164, 58, 169, 180, 163, 58, 237, 6, 91, 7, 169, 173, 156, 206, 79, 198, 80, 229, 43, 34, 55, 222, 137, 243, 49, 116, 145, 185, 105, 136, 4] // Packet 3
];

// SPAWN COMMAND: Arras usually uses 0x00 followed by the name length
// Let's use a clear name so you can see them: "BOT"
const spawnPacket = new Uint8Array([0x00, 0x03, 0x42, 0x4f, 0x54]); 

const proxyList = fs.readFileSync('asocks_proxies.txt', 'utf8')
    .split('\n')
    .map(line => {
        const match = line.match(/([a-zA-Z0-9.\-_]+:[a-zA-Z0-9.\-_]+@[0-9.]+:[0-9]+)/);
        return match ? `socks5://${match[1]}` : null;
    })
    .filter(line => line !== null);

function spawnBot(index) {
    if (index > 25) return; 

    const proxyUrl = proxyList[Math.floor(Math.random() * proxyList.length)];
    const agent = new SocksProxyAgent(proxyUrl);

    const ws = new WebSocket(SERVER, {
        agent: agent,
        headers: { 
            'Origin': 'https://arras.io',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    });

    ws.on('open', () => {
        console.log(`[Bot ${index}] ✅ Open. Running Sync...`);
        
        // Step 1: Send the Handshake sequence
        setTimeout(() => ws.send(new Uint8Array(captureSequence[0])), 100);
        setTimeout(() => ws.send(new Uint8Array(captureSequence[1])), 300);
        setTimeout(() => ws.send(new Uint8Array(captureSequence[2])), 600);
        
        // Step 2: The Spawn Request (Crucial!)
        setTimeout(() => {
            console.log(`[Bot ${index}] 🚀 Sending SPAWN...`);
            ws.send(spawnPacket);
        }, 1200);

        // Step 3: Keep-Alive
        const heartbeat = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                // Send a generic input packet to stay on map
                ws.send(new Uint8Array([0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]));
            } else {
                clearInterval(heartbeat);
            }
        }, 2000);

        setTimeout(() => spawnBot(index + 1), 1500);
    });

    ws.on('error', () => {});
}

spawnBot(1);
