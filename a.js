const fs = require('fs');
const WebSocket = require('ws');
const { SocksProxyAgent } = require('socks-proxy-agent');

const SERVER = "wss://ak7oqfc2u4qqcu6i-c.uvwx.xyz:8443/5003/";
const proxyList = fs.readFileSync('proxies.txt', 'utf8').split('\n').filter(p => p.trim());

function spawnBot(index) {
    const proxy = proxyList[Math.floor(Math.random() * proxyList.length)];
    const agent = new SocksProxyAgent(`socks5://${proxy}`);

    const ws = new WebSocket(SERVER, {
        agent: agent,
        headers: { 'Origin': 'https://arras.io' }
    });

    ws.on('open', () => {
        console.log(`[Bot ${index}] Joined via ${proxy}`);

        // THE "ENTER KEY" ACTION:
        // Sending 0x00 tells the server "Spawn me now"
        ws.send(Buffer.from([0x00]));

        // WAIT 2 SECONDS, THEN SPAWN THE NEXT ONE
        // This keeps the previous bot alive while starting a new one
        setTimeout(() => spawnBot(index + 1), 2000);
    });

    ws.on('error', () => {
        // If proxy is dead, just skip and try the next one
        spawnBot(index);
    });

    // CRITICAL: Handle 'Ping' from server so bots don't time out
    ws.on('message', (data) => {
        const msg = new Uint8Array(data);
        if (msg[0] === 0x05) { // 0x05 is usually a Ping in Arras protocols
            ws.send(new Uint8Array([0x05])); // Send Pong back
        }
    });
}

// Start the loop
spawnBot(1);
