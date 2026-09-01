(function () {
    if (window.__HAXBALL_KEYSYSTEM_LOADED__) return;
    window.__HAXBALL_KEYSYSTEM_LOADED__ = true;

    // ---- Discord: vinculacion de cuenta (reconstruido 2026-08-03) ----
    // La version vieja tenia un backend/CLIENT_ID/bot propios del dueño de
    // la app hardcodeados en este archivo — eso fue lo que casi genera un
    // raid a su servidor. Ahora: (1) el CLIENT_ID de abajo es publico (es
    // el ID de la app de Discord, no una credencial — Discord lo expone en
    // cualquier link de login, no sirve para nada sin el client_secret,
    // que vive SOLO como variable de entorno en el backend, nunca aca).
    // (2) el backend es uno nuevo, en un repo separado, sin nada de la
    // carpeta de la app. (3) las misiones siguen funcionando 100% sin
    // vincular nada — esto es opcional, solo para tener el rango en
    // Discord.
    const DISCORD_CLIENT_ID = '1533931740895379657';
    const DISCORD_BASE_URL = 'https://haxbion-backend.onrender.com';
    const DISCORD_LINK_STORAGE_KEY = 'hbx_discord_link';

    function isMainFrame() {
        try { return window.Injector ? window.Injector.isMainFrame() : (window.top === window); } catch (e) { return true; }
    }

    function genState() {
        try {
            const arr = new Uint8Array(16);
            crypto.getRandomValues(arr);
            return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
        } catch (e) {
            return 'st' + Date.now().toString(36) + Math.random().toString(36).slice(2);
        }
    }

    function loadLinkData() {
        try {
            const raw = localStorage.getItem(DISCORD_LINK_STORAGE_KEY);
            if (raw) return JSON.parse(raw);
        } catch (e) {}
        return { status: 'unlinked' };
    }

    function saveLinkData(data) {
        try { localStorage.setItem(DISCORD_LINK_STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
        broadcastDiscordStatus(data);
    }

    // ---- Origenes de confianza para hablar entre frames ----
    const HBX_TRUSTED_ORIGINS = [
        'https://www.haxball.com',
        'https://html5.haxball.com',
        (typeof window !== 'undefined' && window.location && window.location.origin && window.location.origin !== 'null') ? window.location.origin : null
    ].filter(Boolean);

    // Lo unico que necesita saber el iframe del juego es SI hay cuenta
    // vinculada o no (para mostrar/ocultar el banner). No necesita el
    // discordId, ni el nombre de usuario, ni el avatar — asi que no se los
    // mandamos. Si algun dia se filtrara este canal, lo unico que se
    // escapa es un "true/false".
    function publicStatus(data) {
        return { status: (data && data.status) || 'unlinked' };
    }

    // ---- Saneado de datos que vienen de afuera ----
    // Todo lo que sale de localStorage o de la API de Discord se trata como
    // no confiable: localStorage lo puede escribir cualquier script de la
    // pagina, y la respuesta de Discord puede traer texto arbitrario.
    function safeText(v, max, fallback) {
        if (typeof v !== 'string') return fallback;
        // Se sacan los caracteres de control y se corta el largo. No hace
        // falta escapar HTML porque esto siempre se asigna con textContent
        // (el navegador lo trata como texto plano, nunca como markup).
        const limpio = v.replace(/[\x00-\x1f\x7f]/g, '').trim().slice(0, max);
        return limpio || fallback;
    }

    // Solo se acepta una URL https del CDN de Discord. Cualquier otra cosa
    // (javascript:, data:, un dominio ajeno, comillas para escaparse del
    // atributo) se descarta y simplemente no se muestra foto.
    function sanitizeAvatarUrl(u) {
        if (typeof u !== 'string' || u.length > 300) return null;
        if (/["'()\\\s<>]/.test(u)) return null;
        let parsed;
        try { parsed = new URL(u); } catch (e) { return null; }
        if (parsed.protocol !== 'https:') return null;
        if (parsed.hostname !== 'cdn.discordapp.com') return null;
        return parsed.href;
    }

    function broadcastDiscordStatus(data) {
        try {
            window.dispatchEvent(new CustomEvent('hbx-discord-status-changed', { detail: data }));
        } catch (e) {}
        // El estado real solo vive en el frame principal (localStorage no
        // se comparte entre origenes distintos: el juego corre en un
        // iframe de otro origen). Empujamos el estado a los iframes DE
        // CONFIANZA para que, por ejemplo, la lista de salas pueda mostrar
        // el banner sin estar preguntando todo el tiempo.
        const publico = publicStatus(data);
        try {
            document.querySelectorAll('iframe').forEach((f) => {
                // Se mira el origen REAL de cada iframe y se le manda solo a
                // ese, si esta en la lista de confianza. Los iframes de
                // publicidad quedan afuera solos, sin necesidad de nombrarlos.
                //
                // Antes se le mandaba a cada iframe con los dos origenes de la
                // lista: funcionaba, pero el que no coincidia hacia que Chrome
                // escribiera un error en el registro de la extension (y el
                // try/catch no lo tapa, lo reporta el navegador igual).
                let origen = null;
                try { origen = new URL(f.src, location.href).origin; } catch (e) {}
                if (!origen || HBX_TRUSTED_ORIGINS.indexOf(origen) === -1) return;
                // Al pasar un targetOrigin concreto (no '*'), el navegador NO
                // entrega el mensaje si el iframe no es realmente de ese
                // origen. Esa garantia la da el navegador, no nosotros.
                try { f.contentWindow.postMessage({ type: 'HBX_DISCORD_STATUS_RESPONSE', payload: publico }, origen); } catch (e) {}
            });
        } catch (e) {}
    }

    function getDiscordLinkData() {
        return loadLinkData();
    }

    function clearDiscordLink() {
        try { localStorage.removeItem(DISCORD_LINK_STORAGE_KEY); } catch (e) {}
        broadcastDiscordStatus({ status: 'unlinked' });
    }

    let _pollTimer = null;
    function pollLinkStatus(state, attemptsLeft) {
        if (attemptsLeft <= 0) {
            saveLinkData({ status: 'error', message: 'Se agotó el tiempo de espera. Volvé a intentar.' });
            return;
        }
        fetch(`${DISCORD_BASE_URL}/auth/discord/status?state=${encodeURIComponent(state)}`)
            .then(r => r.json())
            .then(data => {
                if (!data || data.status === 'unknown' || data.status === 'pending') {
                    _pollTimer = setTimeout(() => pollLinkStatus(state, attemptsLeft - 1), 2000);
                    return;
                }
                saveLinkData(data);
            })
            .catch(() => {
                _pollTimer = setTimeout(() => pollLinkStatus(state, attemptsLeft - 1), 2000);
            });
    }

    // Cuanto puede quedar una vinculacion "en curso" antes de darla por
    // abandonada. Si el jugador cierra la pestaña de Discord sin autorizar,
    // el estado quedaba en "pending" PARA SIEMPRE: el banner decia
    // "Vinculando con Discord..." eternamente y no habia forma de volver a
    // intentar. Con esto se limpia solo.
    const PENDIENTE_MAX_MS = 5 * 60 * 1000; // 5 minutos

    // Se llama al arrancar la app. Si quedo una vinculacion a medias de una
    // sesion anterior: si es reciente, se retoma la consulta (por si el
    // jugador SI autorizo pero cerro la app antes de que llegara la
    // respuesta); si ya es vieja, se descarta y vuelve a "sin vincular".
    function sanearVinculacionPendiente() {
        const d = loadLinkData();
        if (!d || d.status !== 'pending') return;
        const edad = Date.now() - (d.startedAt || 0);
        if (d.startedAt && edad < PENDIENTE_MAX_MS && d.state) {
            const restantes = Math.max(1, Math.floor((PENDIENTE_MAX_MS - edad) / 2000));
            pollLinkStatus(d.state, restantes);
        } else {
            clearDiscordLink();
        }
    }

    function startDiscordLink() {
        if (_pollTimer) { clearTimeout(_pollTimer); _pollTimer = null; }
        const state = genState();
        saveLinkData({ status: 'pending', state, startedAt: Date.now() });

        const params = new URLSearchParams({
            client_id: DISCORD_CLIENT_ID,
            redirect_uri: `${DISCORD_BASE_URL}/auth/discord/callback`,
            response_type: 'code',
            scope: 'identify',
            state
        });
        const authUrl = `https://discord.com/api/oauth2/authorize?${params.toString()}`;

        // Se abre en un navegador de verdad (no adentro de Iron) via el
        // bridge local, igual que el link de descarga de actualizaciones.
        _hbxOpenExternal(authUrl);
        pollLinkStatus(state, 150); // ~5 minutos (150 * 2s)
    }

    if (isMainFrame()) {
        window._hbxStartDiscordLink = startDiscordLink;
        window._hbxGetDiscordLinkData = getDiscordLinkData;
        window._hbxClearDiscordLink = clearDiscordLink;

        // Limpia (o retoma) una vinculacion que quedo a medias.
        sanearVinculacionPendiente();

        // Los iframes (la lista de salas, etc.) no pueden leer localStorage
        // del frame principal (otro origen), asi que piden el estado por
        // postMessage y nosotros contestamos con lo que tengamos.
        window.addEventListener('message', (ev) => {
            // FILTRO DE ORIGEN — no sacar.
            // Sin esto, CUALQUIER iframe de la pagina (incluidos los de
            // publicidad de terceros) puede pedir y recibir el Discord ID,
            // el nombre y el avatar del jugador, o disparar la ventana de
            // autorizacion sin que el jugador la haya pedido.
            if (HBX_TRUSTED_ORIGINS.indexOf(ev.origin) === -1) return;
            if (!ev.data || typeof ev.data !== 'object') return;

            if (ev.data.type === 'HBX_DISCORD_STATUS_REQUEST') {
                // Se contesta solo al origen que pregunto (nunca '*') y
                // solo con el estado, sin datos personales.
                try { ev.source.postMessage({ type: 'HBX_DISCORD_STATUS_RESPONSE', payload: publicStatus(getDiscordLinkData()) }, ev.origin); } catch (e) {}
            } else if (ev.data.type === 'HBX_DISCORD_CONNECT_REQUEST') {
                startDiscordLink();
            }
        });
    }

    // ---- Pantalla de Discord al entrar (reconstruido 2026-08-03) ----
    // Cada vez que se abre la app: si no está vinculada la cuenta, se
    // ofrece conectar (con opción de saltarlo, nunca bloquea el juego); si
    // ya está vinculada, se muestra una tarjeta corta confirmando la
    // cuenta y el rango. Estilo "media foto": el avatar ocupa la mitad
    // izquierda de la tarjeta a tamaño grande.
    function showDiscordScreen() {
        const old = document.getElementById('hbx-discord-screen');
        if (old) old.remove();

        const link = getDiscordLinkData();
        if (link.status === 'pending') return; // ya hay un intento en curso, no molestar

        const box = document.createElement('div');
        box.id = 'hbx-discord-screen';
        box.style.cssText = `
            position: fixed; inset: 0; z-index: 2147483645;
            background: rgba(0,0,0,0.78);
            display: flex; align-items: center; justify-content: center;
            font-family: 'Outfit','Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
        `;

        if (link.status === 'linked') {
            // OJO: nada de lo que viene en "link" se mete con innerHTML.
            // Ese objeto sale de localStorage (que cualquier script de la
            // pagina puede escribir) y de la API de Discord, asi que
            // interpolarlo en HTML permitiria inyectar codigo (por ejemplo
            // un avatarUrl con comillas que se escapa del atributo). Todo
            // texto va por textContent y la URL del avatar se valida.
            const card = document.createElement('div');
            card.setAttribute('style', 'position:relative; width:420px; max-width:90vw; display:flex; background:#0b0b0d; border:1px solid rgba(255,255,255,0.14); border-radius:10px; overflow:hidden; box-shadow:0 30px 80px rgba(0,0,0,0.6); color:#f2f2f5;');

            const photo = document.createElement('div');
            photo.setAttribute('style', 'width:42%; flex-shrink:0; background-size:cover; background-position:center; background-color:#141418;');
            const safeAvatar = sanitizeAvatarUrl(link.avatarUrl);
            if (safeAvatar) photo.style.backgroundImage = 'url("' + safeAvatar + '")';
            card.appendChild(photo);

            const info = document.createElement('div');
            info.setAttribute('style', 'flex:1; padding:26px 22px; display:flex; flex-direction:column; justify-content:center; min-width:0;');

            const label = document.createElement('div');
            label.setAttribute('style', 'font-size:10px; font-weight:800; letter-spacing:1.6px; text-transform:uppercase; opacity:0.5; margin-bottom:8px;');
            label.textContent = 'Discord conectado';

            const name = document.createElement('div');
            name.setAttribute('style', 'font-size:17px; font-weight:800; margin-bottom:6px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;');
            name.textContent = '@' + safeText(link.username, 40, 'usuario');

            const sub = document.createElement('div');
            sub.setAttribute('style', 'font-size:12px; opacity:0.6; line-height:1.5; margin-bottom:18px;');
            sub.textContent = link.roleAssigned
                ? 'Tenés el rango de jugador asignado.'
                : safeText(link.roleError, 160, 'Vinculado.');

            const btn = document.createElement('button');
            btn.id = 'hbx-ds-close';
            btn.setAttribute('style', 'align-self:flex-start; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.16); color:#f2f2f5; font-weight:700; font-size:11px; letter-spacing:1px; text-transform:uppercase; padding:9px 16px; border-radius:7px; cursor:pointer;');
            btn.textContent = 'Continuar';

            info.appendChild(label);
            info.appendChild(name);
            info.appendChild(sub);
            info.appendChild(btn);
            card.appendChild(info);
            box.appendChild(card);
        } else {
            box.innerHTML = `
                <div style="position:relative; width:400px; max-width:90vw; background:#0b0b0d; border:1px solid rgba(255,255,255,0.14); border-radius:10px; padding:30px 28px; color:#f2f2f5; box-shadow:0 30px 80px rgba(0,0,0,0.6); text-align:center;">
                    <h3 style="margin:0 0 10px 0; font-size:18px; font-weight:800;">Conectate con Discord</h3>
                    <p style="margin:0 0 20px 0; font-size:12.5px; color:#8b8b96; line-height:1.6;">Opcional: vinculá tu cuenta para tener tu rango de jugador y aparecer en los avisos de misiones. Podés jugar igual sin hacerlo.</p>
                    <button id="hbx-ds-connect" style="width:100%; background:#f2f2f5; color:#08080a; border:none; padding:13px; border-radius:7px; font-weight:800; font-size:12px; letter-spacing:1.2px; text-transform:uppercase; cursor:pointer; margin-bottom:10px;">Conectar con Discord</button>
                    <button id="hbx-ds-skip" style="width:100%; background:transparent; border:none; color:#8b8b96; font-size:11.5px; cursor:pointer; padding:6px;">Ahora no</button>
                </div>`;
        }

        document.body.appendChild(box);
        box.addEventListener('click', (e) => { if (e.target === box) box.remove(); });

        const closeBtn = box.querySelector('#hbx-ds-close');
        if (closeBtn) closeBtn.addEventListener('click', () => box.remove());

        const skipBtn = box.querySelector('#hbx-ds-skip');
        if (skipBtn) skipBtn.addEventListener('click', () => box.remove());

        const connectBtn = box.querySelector('#hbx-ds-connect');
        if (connectBtn) connectBtn.addEventListener('click', () => {
            startDiscordLink();
            box.remove();
        });
    }

    function releaseBootGate() {
        try {
            const gate = document.getElementById('hbx-boot-gate');
            if (gate) gate.remove();
        } catch (e) {}
        try {
            if (window.top && window.top.document) {
                const topGate = window.top.document.getElementById('hbx-boot-gate');
                if (topGate) topGate.remove();
            }
        } catch (e) {}
    }

    // Abre una URL en un navegador real (no adentro de Iron). Se usa por
    // ejemplo para el link de descarga de una actualizacion nueva
    // (header.js). Habla con el bridge local (Iron/RPC/bridge.js,
    // ws://127.0.0.1:3000): le manda un pedido "open_external" y espera la
    // confirmacion de si pudo abrirlo. Si el bridge no esta corriendo, o no
    // encontro ningun navegador instalado, se muestra el link para copiar a
    // mano.
    //
    // Por que esto y no window.open: interceptor.js (el service worker de
    // la extension) cierra AL INSTANTE cualquier pestaña nueva que no sea
    // la principal, asi que abrir una pestaña dentro de Iron no funciona.
    function _hbxShowLinkFallback(url) {
        const old = document.getElementById('hbx-link-fallback');
        if (old) old.remove();

        const box = document.createElement('div');
        box.id = 'hbx-link-fallback';
        box.style.cssText = `
            position: fixed; inset: 0; z-index: 2147483646;
            background: rgba(0,0,0,0.82);
            display: flex; align-items: center; justify-content: center;
            font-family: 'Outfit','Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
        `;
        box.innerHTML = `
            <div style="position:relative; width:460px; max-width:90vw; background:#0b0b0d; border:1px solid rgba(255,255,255,0.14); border-radius:6px; padding:32px 30px; color:#f2f2f5; box-shadow:0 30px 80px rgba(0,0,0,0.6);">
                <button id="hbx-lf-x" title="Cerrar" style="position:absolute; top:10px; left:12px; width:26px; height:26px; border:none; background:transparent; color:#8b8b96; font-size:18px; line-height:1; cursor:pointer; border-radius:4px;">✕</button>
                <h3 style="margin:6px 0 10px 0; font-size:18px; font-weight:800; text-align:center;">Abrí este link en tu navegador</h3>
                <p style="margin:0 0 18px 0; font-size:12.5px; color:#8b8b96; line-height:1.6; text-align:center;">No se pudo abrir el navegador automáticamente. Copiá este link y pegalo en Chrome, Edge o Firefox para continuar.</p>
                <input id="hbx-lf-url" readonly style="width:100%; box-sizing:border-box; background:#141418; border:1px solid rgba(255,255,255,0.16); border-radius:5px; color:#f2f2f5; padding:11px 12px; font-size:11.5px; margin-bottom:14px;" />
                <button id="hbx-lf-copy" style="width:100%; background:#f2f2f5; color:#08080a; border:none; padding:13px; border-radius:5px; font-weight:800; font-size:12px; letter-spacing:1.2px; text-transform:uppercase; cursor:pointer;">Copiar link</button>
            </div>
        `;
        // El valor se setea via propiedad, no interpolado en el HTML: asi no
        // importa que caracteres tenga la URL, nunca se puede escapar del
        // atributo ni inyectar HTML/JS en la pagina.
        box.querySelector('#hbx-lf-url').value = url;
        document.body.appendChild(box);

        const input = box.querySelector('#hbx-lf-url');
        const copyBtn = box.querySelector('#hbx-lf-copy');
        copyBtn.addEventListener('click', () => {
            try {
                input.select();
                input.setSelectionRange(0, 99999);
                document.execCommand('copy');
                copyBtn.textContent = '¡Copiado!';
                setTimeout(() => { copyBtn.textContent = 'Copiar link'; }, 1800);
            } catch (e) {}
        });
        box.querySelector('#hbx-lf-x').addEventListener('click', () => box.remove());
        box.addEventListener('click', (e) => { if (e.target === box) box.remove(); });
    }

    // Ultimo recurso antes de mostrar el cartel de "copia el link a mano":
    // pedirle al service worker de la extension que abra la pestaña. En
    // Chrome de escritorio este es el camino que funciona (no existe el
    // bridge local del cliente propio). Si tampoco contesta, recien ahi se
    // muestra el cartel.
    function _hbxOpenViaBridge(url, onFail) {
        try {
            const replyId = 'hbx' + Date.now() + Math.random().toString(36).slice(2);
            let done = false;
            const onReply = (ev) => {
                const d = ev.data;
                if (!d || d.__hbxBridgeReply !== 1 || d.replyId !== replyId) return;
                done = true;
                window.removeEventListener('message', onReply);
                clearTimeout(t);
                if (!d.ok) onFail();
            };
            window.addEventListener('message', onReply);
            const t = setTimeout(() => {
                if (done) return;
                window.removeEventListener('message', onReply);
                onFail();
            }, 1500);
            window.postMessage({ __hbxBridge: 1, action: 'openExternalLink', url: url, replyId: replyId }, '*');
        } catch (e) {
            onFail();
        }
    }

    function _hbxOpenExternal(url) {
        if (window.HBX_BUILD === 'web' || typeof window.chrome === 'undefined' || !window.chrome?.runtime?.sendMessage) {
            try {
                const w = window.open(url, '_blank');
                if (w) return;
            } catch (e) {}
        }
        let settled = false;
        const fallback = () => {
            if (settled) return;
            settled = true;
            _hbxOpenViaBridge(url, () => _hbxShowLinkFallback(url));
        };
        try {
            const ws = new WebSocket('ws://127.0.0.1:3000');
            const timer = setTimeout(fallback, 3000);
            ws.onopen = () => {
                try { ws.send(JSON.stringify({ type: 'open_external', url })); } catch (e) {}
            };
            ws.onmessage = (ev) => {
                let msg = null;
                try { msg = JSON.parse(ev.data); } catch (e) { return; }
                if (!msg || msg.type !== 'open_external_result') return;
                clearTimeout(timer);
                if (msg.ok) {
                    settled = true;
                } else {
                    fallback();
                }
                setTimeout(() => { try { ws.close(); } catch (e) {} }, 200);
            };
            ws.onerror = () => {
                clearTimeout(timer);
                fallback();
            };
        } catch (e) {
            fallback();
        }
    }
    window._hbxOpenExternal = _hbxOpenExternal;

    // Ya no hay nada que verificar: se destapa el juego apenas este
    // archivo corre, en ambos frames (principal y el del juego).
    releaseBootGate();

    // La pantalla de Discord se muestra una vez por apertura de la app.
    // Antes habia un setTimeout fijo de 1200ms "por las dudas", y eso se
    // notaba como un tiron: la app ya estaba lista y la pantalla seguia
    // sin aparecer. Ahora se muestra apenas existe document.body, sin
    // esperar de mas.
    if (isMainFrame()) {
        // La foto del avatar se pide YA (apenas arranca la app), no
        // cuando se abre la pantalla. Asi cuando el jugador la ve, la
        // imagen ya esta en la cache del navegador y entra de una, en vez
        // de aparecer un cuadro gris que se completa un segundo despues.
        (function precargarAvatar() {
            try {
                const d = getDiscordLinkData();
                if (d && d.status === 'linked') {
                    const url = sanitizeAvatarUrl(d.avatarUrl);
                    if (url) { const img = new Image(); img.src = url; }
                }
            } catch (e) {}
        })();

        (function mostrarApenasSePueda() {
            if (document.body) { showDiscordScreen(); return; }
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', showDiscordScreen, { once: true });
            } else {
                // Caso raro: readyState ya avanzo pero body todavia no
                // esta. Se reintenta en el proximo frame en vez de fijar
                // un tiempo arbitrario.
                requestAnimationFrame(mostrarApenasSePueda);
            }
        })();
    }
})();
