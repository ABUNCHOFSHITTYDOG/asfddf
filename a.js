const fs = require('fs');
const WebSocket = require('ws');
let SocksProxyAgent = require('socks-proxy-agent');

if (SocksProxyAgent.SocksProxyAgent) SocksProxyAgent = SocksProxyAgent.SocksProxyAgent;

const SERVER = "wss://kvn3s3cpcdk4fl6j-c.uvwx.xyz:8443/5103/";

// These are the exact packets you captured from your console
const captureSequence = [
    [0, 1, 0, 1, 114, 34, 126, 194, 6, 80, 35, 77], // Init
    [81, 238, 54, 110, 4, 33, 2, 5, 81, 167, 194, 44, 237, 175, 112, 176, 34, 115, 137, 162, 244, 244, 193, 134, 145, 184, 214, 155, 70, 79, 151, 73], // Verification
    [193, 233, 189, 50, 33, 199, 16, 81, 83, 216, 7, 97, 154, 164, 58, 169, 180, 163, 58, 237, 6, 91, 7, 169, 173, 156, 206, 79, 198, 80, 229, 43, 34, 55, 222, 137, 243, 49, 116, 145, 185, 105, 136, 4], // Protocol Sync
    [167, 135, 110, 145, 204, 184, 111], // Potential Spawn / Input Start
    [199, 139, 33, 83, 236, 136, 10]     // Movement/Heartbeat
];

// Proxy list loader
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
        console.log(`[Bot ${index}] 🔌 Connection open. Replaying packets...`);
        
        let pIndex = 0;
        const sendNext = () => {
            if (pIndex < captureSequence.length) {
                ws.send(new Uint8Array(captureSequence[pIndex]));
                console.log(`[Bot ${index}] 📤 Sent Packet ${pIndex + 1}`);
                pIndex++;
                setTimeout(sendNext, 250); // Small delay between packets
            } else {
                console.log(`[Bot ${index}] 🚀 Sequence complete. Tank should be spawned.`);
                
                // Keep-alive loop: Replay the last 7-byte packet to stay active
                setInterval(() => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(new Uint8Array(captureSequence[captureSequence.length - 1]));
                    }
                }, 3000);

                // Start next bot
                setTimeout(() => spawnBot(index + 1), 1000);
            }
        };

        sendNext();
    });

    ws.on('error', () => setTimeout(() => spawnBot(index), 2000));
}

spawnBot(1);
