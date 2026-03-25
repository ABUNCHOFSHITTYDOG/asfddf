const WebSocket = require('ws');
const fs = require('fs');

const wasmBuffer = fs.readFileSync("./app.wasm");
const SERVER = "wss://kvn3s3cpcdk4fl6j-c.uvwx.xyz:8443/5103/";
const workerId = process.env.WORKER_ID || 0;

async function spawnBot(botNum) {
    const ws = new WebSocket(SERVER, {
        headers: { 'Origin': 'https://arras.io' }
    });

    ws.on('open', () => {
        // Step 1: Handshake (You must use your WASM logic here)
        console.log(`[Worker ${workerId}] Bot ${botNum} Connected.`);
        
        // Step 2: Spawn after a small delay
        setTimeout(() => {
            const name = `Bot_${workerId}_${botNum}`;
            ws.send(new Uint8Array([0x00, ...new TextEncoder().encode(name)]));
        }, 2000);
    });

    ws.on('close', () => {
        // Auto-reconnect after 30 seconds if kicked
        setTimeout(() => spawnBot(botNum), 30000);
    });
}

// Start 50 bots, but wait 3 seconds between each one to avoid IP flags
(async () => {
    for (let i = 0; i < 50; i++) {
        spawnBot(i);
        await new Promise(r => setTimeout(r, 3000));
    }
})();
