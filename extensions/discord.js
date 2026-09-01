'use strict';

// ---- Presencia Rica de Discord (reconstruida 2026-08-03) ----
// Este archivo corre en la pagina y le avisa al bridge local (Iron/RPC/
// bridge.js, el mismo que ya se usaba para abrir links en un navegador de
// verdad) un texto genérico de estado cada tanto: "En el menú" o "En una
// sala". El bridge es el que realmente habla con Discord (via discord-rpc)
// y muestra "Jugando a HaxBion" en el perfil. Este archivo NUNCA manda
// nada identificable (nombre de sala real, nick, IP, etc.) — solo esos dos
// textos fijos — asi que no hay forma de que termine filtrando datos de
// nadie aunque alguien mire el codigo.
(function () {
    if (window.__HAXBALL_DISCORD_LOADED__) return;
    window.__HAXBALL_DISCORD_LOADED__ = true;
    if (!(window.Injector ? window.Injector.isMainFrame() : window.top === window)) return;

    let ws = null;
    let lastSentState = null;
    let reconnectTimer = null;

    function currentState() {
        try {
            const f = document.querySelector('iframe');
            const doc = f && f.contentDocument;
            const canvasEl = doc && doc.querySelector('.game-view canvas, canvas');
            return canvasEl ? 'En una sala' : 'En el menú';
        } catch (e) {
            return 'En el menú';
        }
    }

    function send(state) {
        if (!ws || ws.readyState !== WebSocket.OPEN) return;
        if (state === lastSentState) return; // no reenviar si no cambio
        try {
            ws.send(JSON.stringify({ type: 'presence_update', state }));
            lastSentState = state;
        } catch (e) {}
    }

    function connect() {
        try {
            ws = new WebSocket('ws://127.0.0.1:3000');
            ws.onopen = () => { send(currentState()); };
            ws.onclose = () => { scheduleReconnect(); };
            ws.onerror = () => { try { ws.close(); } catch (e) {} };
        } catch (e) {
            scheduleReconnect();
        }
    }

    function scheduleReconnect() {
        if (reconnectTimer) return;
        reconnectTimer = setTimeout(() => {
            reconnectTimer = null;
            connect();
        }, 10000);
    }

    connect();
    // Chequea el estado cada 20s (no hace falta mas seguido: es solo texto
    // de presencia, no algo que necesite actualizarse en tiempo real).
    setInterval(() => send(currentState()), 20000);
})();
