const fs = require('fs');
const WebSocket = require('ws');
let SocksProxyAgent = require('socks-proxy-agent');

// Node 20 Constructor Fix
if (SocksProxyAgent.SocksProxyAgent) {
    SocksProxyAgent = SocksProxyAgent.SocksProxyAgent;
}

const SERVER = "wss://kvn3s3cpcdk4fl6j-c.uvwx.xyz:8443/5103/";

// Load the file and clean the brackets [] off the end
const proxyList = fs.readFileSync('asocks_proxies.txt', 'utf8')
    .split('\n')
    .map(line => line.trim())
    // This removes everything from the first '[' to the end of the line
    .map(line => line.split('[')[0]) 
    .filter(line => line.startsWith('socks5://'));

console.log(`📡 Ready! Found ${proxyList.length} German Mobile Proxies.`);

function spawnBot(index) {
    if (index > 25) return; // Limits to 25 bots per GitHub Worker

    const proxyUrl = proxyList[Math.floor(Math.random() * proxyList.length)];

    try {
        const agent = new SocksProxyAgent(proxyUrl);
        const ws = new WebSocket(SERVER, {
            agent: agent,
            handshakeTimeout: 8000,
            headers: { 
                'Origin': 'https://arras.io',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        ws.on('open', () => {
            console.log(`[Bot ${index}] ✅ SUCCESS: Joined from Germany.`);
            
            // Send the "Enter" packet to spawn the tank
            ws.send(Buffer.from([0x00])); 
            
            // Spawn next bot after 1.5 seconds
            setTimeout(() => spawnBot(index + 1), 1500);
        });

        ws.on('error', (err) => {
            console.log(`[Bot ${index}] ❌ Connection Error: ${err.message}`);
            // Try again immediately with a different proxy
            setTimeout(() => spawnBot(index), 1000);
        });

    } catch (e) {
        console.log(`[Bot ${index}] ❌ Parsing Error. Retrying...`);
        spawnBot(index);
    }
}

spawnBot(1);
