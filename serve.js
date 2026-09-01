'use strict';

// ============================================================
//  HaxBion Web Server & WebSocket Proxy
// ------------------------------------------------------------
//  Levanta un servidor HTTP local super liviano para servir
//  la app web de HaxBion, proxear la API REST sin CORS y proxear
//  los WebSockets hacia el master signaling de Haxball con el
//  Origin oficial para permitir unirse y crear salas libremente.
// ============================================================

const http = require('node:http');
const https = require('node:https');
const fs = require('node:fs');
const path = require('node:path');
const { exec } = require('node:child_process');

let WebSocketModule = null;
const wsCandidatePaths = [
    path.join(__dirname, 'node_modules', 'ws'),
    path.join(__dirname, '..', 'electron', 'rpc', 'node_modules', 'ws'),
    path.join(__dirname, 'electron', 'rpc', 'node_modules', 'ws'),
    path.join(__dirname, '..', 'node_modules', 'ws'),
    'ws'
];
for (const p of wsCandidatePaths) {
    try {
        WebSocketModule = require(p);
        if (WebSocketModule) {
            console.log('[HaxBion Server] Módulo WebSocket cargado correctamente desde:', p);
            break;
        }
    } catch (e) {}
}
if (!WebSocketModule) {
    console.warn('[HaxBion Server Warning] No se encontró el módulo "ws".');
}

const PORT = parseInt(process.env.PORT, 10) || 8080;
const ROOT_DIR = __dirname;
const WEB_DIR = fs.existsSync(path.join(ROOT_DIR, 'index.html'))
    ? ROOT_DIR
    : (fs.existsSync(path.join(ROOT_DIR, 'web')) ? path.join(ROOT_DIR, 'web') : ROOT_DIR);

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.mjs': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.ico': 'image/x-icon',
    '.wasm': 'application/wasm',
    '.dat': 'application/octet-stream',
};

function proxyHaxballApi(req, res, targetPath) {
    const options = {
        hostname: 'www.haxball.com',
        port: 443,
        path: targetPath,
        method: req.method,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Origin': 'https://html5.haxball.com',
            'Referer': 'https://html5.haxball.com/',
            'Accept': '*/*',
        }
    };

    if (req.headers['content-type']) {
        options.headers['Content-Type'] = req.headers['content-type'];
    }
    if (req.headers['content-length']) {
        options.headers['Content-Length'] = req.headers['content-length'];
    }

    const proxyReq = https.request(options, (proxyRes) => {
        const headers = { ...proxyRes.headers };
        headers['Access-Control-Allow-Origin'] = '*';
        headers['Access-Control-Allow-Methods'] = 'GET, POST, HEAD, OPTIONS';
        headers['Access-Control-Allow-Headers'] = '*';
        delete headers['x-frame-options'];
        delete headers['content-security-policy'];

        res.writeHead(proxyRes.statusCode, headers);
        proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
        console.error('[HaxBion Proxy Error]:', err.message);
        res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8', 'Access-Control-Allow-Origin': '*' });
        res.end('502: Error de conexión con Haxball');
    });

    if (req.method === 'POST' || req.method === 'PUT') {
        req.pipe(proxyReq);
    } else {
        proxyReq.end();
    }
}

function getFilePath(urlPath) {
    let clean = decodeURIComponent(urlPath.split('?')[0]);
    if (clean === '/' || clean === '') {
        clean = '/index.html';
    }
    
    // 1. Probar en WEB_DIR
    const candidateWeb = path.normalize(path.join(WEB_DIR, clean));
    if (candidateWeb.startsWith(WEB_DIR) && fs.existsSync(candidateWeb)) {
        try {
            const stat = fs.statSync(candidateWeb);
            if (stat.isFile()) return candidateWeb;
            if (stat.isDirectory() && fs.existsSync(path.join(candidateWeb, 'index.html'))) {
                return path.join(candidateWeb, 'index.html');
            }
        } catch(e) {}
    }

    // 2. Probar en ROOT_DIR
    const candidateRoot = path.normalize(path.join(ROOT_DIR, clean));
    if (candidateRoot.startsWith(ROOT_DIR) && fs.existsSync(candidateRoot)) {
        try {
            const stat = fs.statSync(candidateRoot);
            if (stat.isFile()) return candidateRoot;
            if (stat.isDirectory() && fs.existsSync(path.join(candidateRoot, 'index.html'))) {
                return path.join(candidateRoot, 'index.html');
            }
        } catch(e) {}
    }

    // 3. Probar si la ruta tenia prefijo /web/
    if (clean.startsWith('/web/')) {
        const sub = clean.replace(/^\/web/, '');
        const candidateSub = path.normalize(path.join(WEB_DIR, sub));
        if (candidateSub.startsWith(WEB_DIR) && fs.existsSync(candidateSub)) {
            try {
                const stat = fs.statSync(candidateSub);
                if (stat.isFile()) return candidateSub;
            } catch(e) {}
        }
    }

    return null;
}

const server = http.createServer((req, res) => {
    // Enable CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Proxy para todas las llamadas a la API de Haxball (/rs/api/* o /api/* o /web/rs/api/* o /web/api/*)
    if (req.url.includes('/api/')) {
        let clean = req.url.replace(/^\/web/, '');
        if (clean.startsWith('/api/')) {
            clean = '/rs' + clean;
        }
        proxyHaxballApi(req, res, clean);
        return;
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.writeHead(405, { 'Content-Type': 'text/plain' });
        res.end('Method Not Allowed');
        return;
    }

    const filePath = getFilePath(req.url);
    if (!filePath) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404: Archivo no encontrado');
        return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('500: Error leyendo archivo');
            return;
        }

        res.writeHead(200, {
            'Content-Type': contentType,
            'Cache-Control': 'no-cache',
            'Content-Length': data.length
        });
        
        if (req.method === 'HEAD') {
            res.end();
        } else {
            res.end(data);
        }
    });
});

// ─────────────────────────────────────────────────────────────
// PROXY WEBSOCKET HACIA EL MASTER SIGNALING DE HAXBALL
// ─────────────────────────────────────────────────────────────
if (WebSocketModule) {
    const wss = new WebSocketModule.Server({ noServer: true });

    server.on('upgrade', (request, socket, head) => {
        if (request.url.startsWith('/p2p/')) {
            wss.handleUpgrade(request, socket, head, (clientWs) => {
                const rawTarget = request.url.replace(/^\/p2p\//, '');
                const targetUrl = 'wss://' + rawTarget;

                const remoteWs = new WebSocketModule(targetUrl, {
                    headers: {
                        'Origin': 'https://html5.haxball.com',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                    }
                });

                const clientBuffer = [];
                let isRemoteReady = false;

                // Capturar mensajes del cliente inmediatamente para no perder la registración
                clientWs.on('message', (data, isBinary) => {
                    if (isRemoteReady && remoteWs.readyState === WebSocketModule.OPEN) {
                        remoteWs.send(data, { binary: isBinary });
                    } else {
                        clientBuffer.push({ data, isBinary });
                    }
                });

                remoteWs.on('open', () => {
                    isRemoteReady = true;
                    while (clientBuffer.length > 0) {
                        const item = clientBuffer.shift();
                        remoteWs.send(item.data, { binary: item.isBinary });
                    }
                    remoteWs.on('message', (data, isBinary) => {
                        if (clientWs.readyState === WebSocketModule.OPEN) {
                            clientWs.send(data, { binary: isBinary });
                        }
                    });
                });

                remoteWs.on('error', (err) => {
                    console.error('[HaxBion WS Proxy Error]:', err.message);
                    try { clientWs.close(); } catch(e) {}
                });

                remoteWs.on('close', (code, reason) => {
                    try { clientWs.close(code, reason); } catch(e) {}
                });

                clientWs.on('error', () => {
                    try { remoteWs.close(); } catch(e) {}
                });

                clientWs.on('close', (code, reason) => {
                    try { remoteWs.close(code, reason); } catch(e) {}
                });
            });
        } else {
            socket.destroy();
        }
    });
}

function openBrowser(url) {
    const start = process.platform === 'darwin' ? 'open' :
                  process.platform === 'win32' ? 'start ""' : 'xdg-open';
    exec(`${start} "${url}"`, (err) => {
        if (err) console.log(`[HaxBion Web] Podés abrir manualmente tu navegador en: ${url}`);
    });
}

function startServer(port) {
    server.listen(port, () => {
        const url = `http://localhost:${port}/`;
        console.log('====================================================');
        console.log('       HAXBION WEB - SERVIDOR LOCAL INICIADO       ');
        console.log('====================================================');
        console.log(`URL local: ${url}`);
        console.log(`Abriendo en tu navegador predeterminado...`);
        console.log('Presioná Ctrl+C en esta consola para detener.');
        console.log('----------------------------------------------------');
        
        // Abrir navegador tras medio segundo
        setTimeout(() => openBrowser(url), 500);
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Puerto ${port} ocupado, probando puerto ${port + 1}...`);
            startServer(port + 1);
        } else {
            console.error('Error al iniciar el servidor:', err);
        }
    });
}

// Ejecutar primero la sincronización si la carpeta web aún no tiene extensions
const webExt = path.join(WEB_DIR, 'extensions');
if (!fs.existsSync(webExt) || fs.readdirSync(webExt).length === 0 || !fs.existsSync(path.join(WEB_DIR, 'res.dat'))) {
    console.log('[HaxBion Web] Sincronizando archivos web...');
    try {
        require(path.join(ROOT_DIR, 'scripts', 'build-web.js'));
    } catch (e) {
        console.error('Error durante la sincronizacion inicial:', e);
    }
}

startServer(PORT);
