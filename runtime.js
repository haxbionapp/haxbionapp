'use strict';

(function () {
    if (window.__HAXBALL_RUNTIME_LOADED__) return;
    if (window.location.href.includes('cpmstar') || window.location.href.includes('google')) return;

    window.__HAXBALL_RUNTIME_LOADED__ = true;

    // ─────────────────────────────────────────────────────────────────────
    // AUTO-GEOLOCALIZACION REGIONAL (Corrige salas lejanas en Vercel/Hosting)
    // ─────────────────────────────────────────────────────────────────────
    (function initSmartGeo() {
        try {
            var existingOverride = localStorage.getItem('geo_override');
            if (existingOverride && localStorage.getItem('geo_bypass_tick') === 'true') {
                return; // Ya existe una configuración personalizada
            }

            var tz = '';
            try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch(e) {}

            var tzMap = {
                'America/Argentina/Buenos_Aires': { lat: -34.6037, lon: -58.3816, code: 'ar', flag: 'ar' },
                'America/Argentina/Cordoba': { lat: -31.4201, lon: -64.1888, code: 'ar', flag: 'ar' },
                'America/Argentina/Mendoza': { lat: -32.8895, lon: -68.8458, code: 'ar', flag: 'ar' },
                'America/Argentina/Rosario': { lat: -32.9468, lon: -60.6393, code: 'ar', flag: 'ar' },
                'America/Argentina/Tucuman': { lat: -26.8241, lon: -65.2226, code: 'ar', flag: 'ar' },
                'America/Argentina/Salta': { lat: -24.7821, lon: -65.4232, code: 'ar', flag: 'ar' },
                'America/Argentina/San_Juan': { lat: -31.5375, lon: -68.5364, code: 'ar', flag: 'ar' },
                'America/Argentina/San_Luis': { lat: -33.2950, lon: -66.3356, code: 'ar', flag: 'ar' },
                'America/Argentina/Catamarca': { lat: -28.4696, lon: -65.7852, code: 'ar', flag: 'ar' },
                'America/Argentina/La_Rioja': { lat: -29.4135, lon: -66.8565, code: 'ar', flag: 'ar' },
                'America/Argentina/Jujuy': { lat: -24.1858, lon: -65.2995, code: 'ar', flag: 'ar' },
                'America/Argentina/Ushuaia': { lat: -54.8019, lon: -68.3030, code: 'ar', flag: 'ar' },
                'America/Sao_Paulo': { lat: -23.5505, lon: -46.6333, code: 'br', flag: 'br' },
                'America/Rio_Branco': { lat: -9.9753, lon: -67.8249, code: 'br', flag: 'br' },
                'America/Fortaleza': { lat: -3.7327, lon: -38.5270, code: 'br', flag: 'br' },
                'America/Santiago': { lat: -33.4489, lon: -70.6693, code: 'cl', flag: 'cl' },
                'America/Punta_Arenas': { lat: -53.1638, lon: -70.9171, code: 'cl', flag: 'cl' },
                'America/Montevideo': { lat: -34.9011, lon: -56.1645, code: 'uy', flag: 'uy' },
                'America/Asuncion': { lat: -25.2637, lon: -57.5759, code: 'py', flag: 'py' },
                'America/La_Paz': { lat: -16.5000, lon: -68.1193, code: 'bo', flag: 'bo' },
                'America/Lima': { lat: -12.0464, lon: -77.0428, code: 'pe', flag: 'pe' },
                'America/Bogota': { lat: 4.7110, lon: -74.0721, code: 'co', flag: 'co' },
                'America/Caracas': { lat: 10.4806, lon: -66.9036, code: 've', flag: 've' },
                'America/Mexico_City': { lat: 19.4326, lon: -99.1332, code: 'mx', flag: 'mx' },
                'Europe/Madrid': { lat: 40.4168, lon: -3.7038, code: 'es', flag: 'es' },
                'Atlantic/Canary': { lat: 28.1235, lon: -15.4363, code: 'es', flag: 'es' }
            };

            var selectedGeo = null;
            if (tz && tzMap[tz]) {
                selectedGeo = tzMap[tz];
            } else if (tz && tz.startsWith('America/Argentina')) {
                selectedGeo = { lat: -34.6037, lon: -58.3816, code: 'ar', flag: 'ar' };
            } else if (tz && (tz.includes('Sao_Paulo') || tz.includes('Brazil'))) {
                selectedGeo = { lat: -23.5505, lon: -46.6333, code: 'br', flag: 'br' };
            } else if (tz && tz.includes('Madrid')) {
                selectedGeo = { lat: 40.4168, lon: -3.7038, code: 'es', flag: 'es' };
            } else {
                var lang = (navigator.language || '').toLowerCase();
                if (lang.includes('ar') || lang.includes('419')) {
                    selectedGeo = { lat: -34.6037, lon: -58.3816, code: 'ar', flag: 'ar' };
                } else if (lang.includes('br') || lang.includes('pt')) {
                    selectedGeo = { lat: -23.5505, lon: -46.6333, code: 'br', flag: 'br' };
                } else if (lang.includes('es')) {
                    selectedGeo = { lat: 40.4168, lon: -3.7038, code: 'es', flag: 'es' };
                } else {
                    selectedGeo = { lat: -34.6037, lon: -58.3816, code: 'ar', flag: 'ar' };
                }
            }

            if (selectedGeo) {
                localStorage.setItem('geo_override', JSON.stringify(selectedGeo));
                localStorage.setItem('geo_bypass_tick', 'true');
            }
        } catch(e) {}
    })();

    // ─────────────────────────────────────────────────────────────────────
    // ADAPTADOR DE RED WEB (Proxy / CORS bypass para navegador)
    // ─────────────────────────────────────────────────────────────────────
    (function hookNetwork() {
        if (window.__HBX_NET_HOOKED__) return;
        window.__HBX_NET_HOOKED__ = true;

        function rewriteUrl(url) {
            if (!url || typeof url !== 'string') return url;
            var host = window.location.hostname || '';
            if (host.includes('github.io') || host.includes('pages.dev')) {
                // En GitHub Pages o Cloudflare Pages, las llamadas van directo a HaxBall
                if (url.startsWith('/api/') || url.startsWith('api/') || url.startsWith('rs/api/') || url.startsWith('/rs/api/')) {
                    var clean = url.replace(/^\/?rs\//, '').replace(/^\/?api\//, '');
                    return 'https://www.haxball.com/rs/api/' + clean;
                }
                return url;
            }
            // En servidor local (localhost) o proxy Node
            if (url.startsWith('https://www.haxball.com/') || url.startsWith('https://html5.haxball.com/') || url.startsWith('http://www.haxball.com/')) {
                url = url.replace(/^https?:\/\/(?:www|html5)\.haxball\.com\//, '/');
            }
            if (url.startsWith('rs/api/') || url.startsWith('api/') || url.startsWith('/api/')) {
                if (url.startsWith('/api/')) url = '/rs' + url;
                else if (url.startsWith('api/')) url = '/rs/' + url;
                else if (url.startsWith('rs/api/')) url = '/' + url;
            }
            return url;
        }

        var origXhrOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function (method, url) {
            var target = rewriteUrl(url);
            var rest = Array.prototype.slice.call(arguments, 2);
            return origXhrOpen.apply(this, [method, target].concat(rest));
        };

        var origXhrSend = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.send = function (body) {
            if (typeof body === 'string' && (body.includes('&rcr=') || body.includes('token='))) {
                var hostToken = '';
                try { hostToken = localStorage.getItem('haxball_host_token') || ''; } catch(e) {}
                if (hostToken) {
                    body = body.replace(/token=([^&]*)/, 'token=' + encodeURIComponent(hostToken));
                }
            }
            return origXhrSend.call(this, body);
        };

        if (window.fetch) {
            var origFetch = window.fetch;
            window.fetch = function (input, init) {
                if (typeof input === 'string') {
                    input = rewriteUrl(input);
                } else if (input && input.url) {
                    input = new Request(rewriteUrl(input.url), input);
                }
                return origFetch.call(this, input, init);
            };
        }
    })();

    // ─────────────────────────────────────────────────────────────────────
    // ADAPTADOR DE WEBSOCKET (Proxy para master signaling / WebRTC)
    // ─────────────────────────────────────────────────────────────────────
    (function hookWebSocket() {
        if (window.__HBX_WS_HOOKED__) return;
        window.__HBX_WS_HOOKED__ = true;

        var OrigWebSocket = window.WebSocket;
        window.WebSocket = function (url, protocols) {
            var host = window.location.hostname || '';
            if (host.includes('github.io') || host.includes('pages.dev')) {
                // En GitHub Pages, conectar directamente sin proxear a github.io
                return protocols ? new OrigWebSocket(url, protocols) : new OrigWebSocket(url);
            }
            if (typeof url === 'string' && (url.includes('haxball.com') || url.startsWith('wss://') || url.startsWith('ws://'))) {
                try {
                    var u = new URL(url);
                    if (u.hostname.includes('haxball.com')) {
                        var loc = window.location;
                        var isSsl = loc.protocol === 'https:';
                        var targetProto = isSsl ? 'wss:' : 'ws:';
                        url = targetProto + '//' + loc.host + '/p2p/' + u.host + u.pathname + u.search;
                    }
                } catch(e) {}
            }
            return protocols ? new OrigWebSocket(url, protocols) : new OrigWebSocket(url);
        };
        window.WebSocket.prototype = OrigWebSocket.prototype;
        window.WebSocket.CONNECTING = 0;
        window.WebSocket.OPEN = 1;
        window.WebSocket.CLOSING = 2;
        window.WebSocket.CLOSED = 3;
    })();

    // ─────────────────────────────────────────────────────────────────────
    // PUENTE DE RECAPTCHA PARA NAVEGADOR
    // ─────────────────────────────────────────────────────────────────────
    (function hookRecaptcha() {
        var _widgetCounter = 0;
        var _widgets = {};

        window.grecaptcha = {
            render: function (container, options) {
                var widgetId = ++_widgetCounter;
                _widgets[widgetId] = options;

                if (typeof container === 'string') {
                    container = document.getElementById(container);
                }
                if (!container) return widgetId;

                container.innerHTML = '';
                var box = document.createElement('div');
                box.style.cssText = 'padding:12px 14px;background:#18181b;border:1px solid #3f3f46;border-radius:8px;display:flex;flex-direction:column;gap:8px;font-family:Outfit,sans-serif;font-size:12px;color:#f4f4f5;text-align:center;box-sizing:border-box;margin:4px 0;';

                var desc = document.createElement('div');
                desc.textContent = 'Verificación requerida para conectar a esta sala';
                desc.style.color = '#a1a1aa';
                desc.style.fontSize = '12px';
                box.appendChild(desc);

                var btn = document.createElement('button');
                btn.textContent = 'Resolver Captcha';
                btn.style.cssText = 'padding:8px 16px;background:#2563eb;color:#fff;border:none;border-radius:6px;font-weight:600;font-size:12px;cursor:pointer;transition:background 0.15s;';
                btn.onmouseenter = function () { btn.style.background = '#1d4ed8'; };
                btn.onmouseleave = function () { btn.style.background = '#2563eb'; };

                var tokenInput = document.createElement('input');
                tokenInput.type = 'text';
                tokenInput.placeholder = 'O pega aquí tu Host Token / Captcha Token';
                tokenInput.style.cssText = 'width:100%;padding:6px 10px;background:#09090b;border:1px solid #27272a;border-radius:4px;color:#fff;font-size:11px;box-sizing:border-box;outline:none;display:none;';

                tokenInput.onkeydown = function(e) {
                    if (e.key === 'Enter' && tokenInput.value.trim()) {
                        var val = tokenInput.value.trim();
                        box.innerHTML = '<span style="color:#4ade80;font-weight:600;">✓ Token aplicado</span>';
                        if (options.callback) options.callback(val);
                    }
                };

                btn.onclick = function (e) {
                    e.preventDefault();
                    tokenInput.style.display = 'block';
                    tokenInput.focus();
                    window.open('https://www.haxball.com/headlesstoken', '_blank');
                };

                box.appendChild(btn);
                box.appendChild(tokenInput);
                container.appendChild(box);

                return widgetId;
            },
            reset: function () {},
            getResponse: function () { return ''; }
        };
    })();

    // ─────────────────────────────────────────────────────────────────────
    // PORTON DE ARRANQUE (boot gate)
    //
    // La app ya no tiene sistema de licencias (es gratuita), pero este
    // porton se deja igual: tapa HaxBall con una pantalla opaca desde el
    // primer instante (document_start, antes de que la pagina pinte un solo
    // pixel) mientras terminan de cargar e inicializarse el resto de las
    // extensiones (keysystem.js, header.js, etc.), asi nunca se ve un
    // HaxBall "pelado" sin los mods
    // durante la carga. keysystem.js lo levanta apenas termina de
    // inicializar, que ahora es casi instantaneo (ya no depende de una
    // consulta de red a Firebase antes de decidir).
    //
    // Va montado sobre documentElement (no body) porque a esta altura body
    // todavia no existe. Se comunica por DOM (no por variables) a proposito:
    // este archivo corre en el mundo aislado de la extension y keysystem.js
    // en el mundo de la pagina, y no comparten "window" — pero si el DOM.
    //
    // Sigue siendo a prueba de fallos: si keysystem.js nunca llegara a
    // cargar (archivo corrupto, error), el porton no se abre solo; avisa y
    // ofrece reintentar en vez de dejar una pantalla congelada.
    (function bootGate() {
        // En modo web (index.html), no tapar la pantalla principal
        try {
            var p = window.location.pathname || '';
            if (p.endsWith('index.html') || p === '/' || p === '' || (window.top === window && !p.includes('game.html') && !p.includes('play'))) {
                return;
            }
        } catch(e) {}

        var GATE_ID = 'hbx-boot-gate';
        if (document.getElementById(GATE_ID)) return;

        var gate = document.createElement('div');
        gate.id = GATE_ID;
        gate.setAttribute('style', [
            'position:fixed',
            'top:0', 'left:0', 'right:0', 'bottom:0',
            'width:100vw', 'height:100vh',
            'z-index:2147483647',
            'background-color:#08080a',
            'background-image:linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
            'background-size:42px 42px',
            'display:flex',
            'flex-direction:column',
            'align-items:center',
            'justify-content:center',
            'gap:18px',
            'font-family:Outfit,Inter,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif',
            'color:#f2f2f5',
            'user-select:none'
        ].join(';'));

        var brand = document.createElement('div');
        brand.setAttribute('style', 'display:flex;align-items:center;gap:10px;color:#c9c9d2;letter-spacing:4px;font-size:12px;font-weight:600;text-transform:uppercase;');
        var diamond = document.createElement('span');
        diamond.setAttribute('style', 'width:8px;height:8px;background:#fff;transform:rotate(45deg);display:inline-block;');
        brand.appendChild(diamond);
        brand.appendChild(document.createTextNode('HAXBION APP'));

        var msg = document.createElement('div');
        msg.id = 'hbx-boot-gate-msg';
        msg.setAttribute('style', 'font-size:13px;color:#8b8b96;letter-spacing:0.5px;');
        msg.textContent = 'Cargando...';

        gate.appendChild(brand);
        gate.appendChild(msg);
        (document.documentElement || document).appendChild(gate);

        // Red de seguridad: si a los 30s keysystem.js no tomo el control
        // (no cargo, error de red, archivo corrupto), no se abre el porton.
        // Se avisa con un mensaje claro y un boton para reintentar, que es
        // mucho mejor que dejar al jugador mirando un cartel congelado sin
        // saber que hacer.
        setTimeout(function () {
            var g = document.getElementById(GATE_ID);
            if (!g) return; // keysystem ya tomo el control, todo bien
            var m = document.getElementById('hbx-boot-gate-msg');
            if (!m) return;
            if (m.dataset.failed === '1') return;
            m.dataset.failed = '1';
            m.textContent = 'No se pudo cargar la app.';
            var retry = document.createElement('button');
            retry.textContent = 'Reintentar';
            retry.setAttribute('style', 'margin-top:6px;background:#f2f2f5;color:#08080a;border:none;padding:12px 26px;border-radius:5px;font-weight:800;font-size:12px;letter-spacing:1.2px;text-transform:uppercase;cursor:pointer;');
            retry.addEventListener('click', function () { window.location.reload(); });
            g.appendChild(retry);
        }, 30000);
    })();

    // El hook completo (avatar/foto/video/gif, fondo de cancha, lineas,
    // estela de color, pelota, limite de FPS) se inyecta aca, al toque de
    // document_start, en vez de depender del redirect de rules.json sobre
    // game-min.js — ese redirect no estaba disparando en la practica (el
    // sitio pide el archivo desde una ruta con un hash que cambia, y aunque
    // el patron de la regla matchea esa URL iguel iguel, nunca se via el
    // marcador de diagnostico "HOOK OK" en una partida real, asi que el
    // motor real seguia cargando sin ningun parche). Este mismo mecanismo
    // (script inline armado en runtime.js) es el que ya se usaba antes para
    // una version vieja y mucho mas chica del hook (solo la foto de
    // avatar), y ese sí confirmadamente funciona.
    const hookScript = document.createElement('script');
    hookScript.textContent = `(function(){
    if (typeof window === 'undefined' || typeof CanvasRenderingContext2D === 'undefined') return;

    // Este hook ahora se inyecta desde runtime.js (document_start), pero el
    // redirect viejo de rules.json sobre game-min.js sigue ahi sin
    // desinstalar — si algun dia llegara a disparar (aunque hoy no lo
    // hace), instalaria este MISMO hook una segunda vez en el mismo frame:
    // dos requestAnimationFrame envueltos uno dentro del otro, dos
    // detecciones de fondo de cancha con su propio estado privado
    // pisandose entre si. Eso da exactamente el tipo de bug reportado (FPS
    // erraticos, fondo parpadeando) si alguna vez las dos vias coinciden.
    // Esta guarda lo vuelve imposible: la segunda instalacion es un no-op.
    if (window._hbxHookInstalled) return;
    window._hbxHookInstalled = true;

    // PANEL DE DIAGNOSTICO (Ctrl+Shift+D para mostrarlo/ocultarlo).
    // Muestra en pantalla lo que esta pasando adentro de los hooks, sin
    // depender de la consola (que en este proyecto confunde porque el juego
    // vive en un sub-frame y la consola apunta a "top" por defecto).
    var D = window._hbxDiag = {
        patternFills: 0, pitchDetected: 0, bgApplied: 0,
        lineFills: 0, lineStrokes: 0, discStrokesSkipped: 0,
        avatarCanvasSet: 0, avatarComposites: 0, videoDrawn: 0,
        lastPatternBounds: null, lastLineColor: '', lastStrokeColor: '',
        playerDiscsSeen: 0, glowDrawn: 0, lastGlowDist: null
    };
    (function () {
        var panel = null, timer = null;
        function fmtRect(r) { return r ? (Math.round(r.x) + ',' + Math.round(r.y) + ' ' + Math.round(r.w) + 'x' + Math.round(r.h)) : 'null'; }
        function render() {
            if (!panel) return;
            var cvs = document.querySelectorAll('canvas');
            var big = null;
            for (var i = 0; i < cvs.length; i++) if (!big || cvs[i].width > big.width) big = cvs[i];
            var vEl = window.customAvatarVideoEl;
            var vState = !vEl ? 'sin elemento' :
                (vEl.tagName === 'VIDEO' ? ('video readyState=' + vEl.readyState) : ('img complete=' + vEl.complete + ' nw=' + vEl.naturalWidth));
            panel.textContent = [
                '=== HAXBION DIAG (Ctrl+Shift+D) ===',
                'hook instalado: ' + !!window._hbxHookInstalled,
                '',
                '-- FONDO DE CANCHA --',
                'fondo foto activo: ' + !!window.customFieldBgEnabled + ' | img lista: ' + !!(window.customFieldBgImg && window.customFieldBgImg.complete && window.customFieldBgImg.naturalWidth > 0),
                'fondo color activo: ' + !!window.customFieldBgColorEnabled + ' (' + (window.customFieldBgColor || '-') + ')',
                'pattern-fills vistos: ' + D.patternFills,
                'cancha detectada (veces): ' + D.pitchDetected,
                'fondo aplicado (veces): ' + D.bgApplied,
                'pitchRect: ' + fmtRect(window._hbxPitchRect),
                'ultimo pattern bounds: ' + fmtRect(D.lastPatternBounds),
                '',
                '-- LINEAS --',
                'lineas activo: ' + !!window.customFieldLineEnabled + ' | transparente: ' + !!window.customFieldLineTransparent,
                'fills de linea tocados: ' + D.lineFills + ' (ult. color ' + D.lastLineColor + ')',
                'strokes de linea tocados: ' + D.lineStrokes + ' (ult. color ' + D.lastStrokeColor + ')',
                'strokes salteados por ser disco: ' + D.discStrokesSkipped,
                '',
                '-- AVATAR / GIF --',
                'mi tag: "' + (window.customAvatarTargetText || '') + '"',
                'canvas de mi avatar identificado: ' + (D.avatarCanvasSet > 0) + ' (' + D.avatarCanvasSet + ' veces)',
                'composiciones de ese canvas: ' + D.avatarComposites,
                'video/gif activo: ' + !!window.customAvatarVideoEnabled + ' | tipo: ' + (window.customAvatarVideoKind || '-'),
                'estado del elemento: ' + vState,
                'frames de video/gif dibujados: ' + D.videoDrawn,
                '',
                '-- ESTELA (GLOW) --',
                'estela jugador activa: ' + !!window.trailPlayerEnabled + ' (' + (window.trailPlayerColor || '-') + ')',
                'estela pelota activa: ' + !!window.trailBallEnabled,
                'mi posicion conocida (_hbxMyPos): ' + (window._hbxMyPos ? Math.round(window._hbxMyPos.x) + ',' + Math.round(window._hbxMyPos.y) : 'NULL <-- sin esto no hay estela'),
                'discos de jugador vistos: ' + D.playerDiscsSeen,
                'estelas dibujadas: ' + D.glowDrawn,
                'ultima distancia a mi disco: ' + (D.lastGlowDist === null ? '-' : D.lastGlowDist.toFixed(1)),
                '',
                '-- FPS / CANVAS --',
                'fps_limit (localStorage): ' + localStorage.getItem('fps_limit'),
                'resolution_scale: ' + localStorage.getItem('resolution_scale'),
                'estirado activo: ' + document.documentElement.classList.contains('hbx-stretched-active'),
                'canvas buffer: ' + (big ? big.width + 'x' + big.height : '-') + ' | en pantalla: ' + (big ? Math.round(big.getBoundingClientRect().width) + 'x' + Math.round(big.getBoundingClientRect().height) : '-')
            ].join('\\n');
        }
        function toggle() {
            if (panel) {
                clearInterval(timer); timer = null;
                if (panel.parentNode) panel.parentNode.removeChild(panel);
                panel = null;
                return;
            }
            panel = document.createElement('pre');
            panel.setAttribute('style', 'position:fixed; top:8px; left:8px; z-index:2147483647; background:rgba(0,0,0,0.88); color:#0f0; font:11px/1.35 monospace; padding:10px 12px; border:1px solid #0f0; border-radius:5px; margin:0; pointer-events:none; white-space:pre; max-height:96vh; overflow:hidden;');
            (document.body || document.documentElement).appendChild(panel);
            render();
            timer = setInterval(render, 400);
        }
        window.addEventListener('keydown', function (e) {
            if (e.ctrlKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) { e.preventDefault(); toggle(); }
        }, true);
        window._hbxToggleDiag = toggle;
    })();

    // MARCADOR TEMPORAL DE DIAGNOSTICO — confirma si el hook llega a
    // ejecutarse de verdad en el juego real, sin necesitar abrir la
    // consola. Sacar despues de confirmar.
    try {
        window._hbxHookLoaded = true;
        console.log('[HaxBion] game-min.js parcheado CARGADO Y EJECUTADO.');
        var _hbxMarkerAdd = function () {
            if (!document.body) { setTimeout(_hbxMarkerAdd, 100); return; }
            var m = document.createElement('div');
            m.textContent = 'HOOK OK';
            m.setAttribute('style', 'position:fixed; top:6px; right:6px; z-index:2147483647; background:#16a34a; color:#fff; font:bold 11px monospace; padding:4px 8px; border-radius:4px; pointer-events:none; opacity:0.9;');
            document.body.appendChild(m);
            setTimeout(function () { if (m.parentNode) m.parentNode.removeChild(m); }, 10000);
        };
        _hbxMarkerAdd();
    } catch (e) {}

    // LIMITE DE FPS.
    //
    // El motor trae helpers propios (_hbxFpsInterval con la tabla de
    // intervalos y un planificador con setTimeout), pero en la practica el
    // selector no frena nada: se puede elegir 60 y seguir con 260 FPS. Asi
    // que el limite se aplica aca.
    //
    // Los dos intentos anteriores fallaron por el mismo motivo de fondo:
    // compartir un unico timestamp entre TODOS los callbacks de rAF. El
    // primero que corria en un frame lo actualizaba y los demas quedaban
    // "demasiado pronto", postergandose indefinidamente — de ahi los
    // tirones y que el fondo de cancha parpadeara.
    //
    // Version correcta: la decision de "este frame nativo esta permitido"
    // se toma UNA sola vez por frame y se memoriza por timestamp, asi todos
    // los callbacks de ese frame reciben la misma respuesta y ninguno se
    // queda afuera. Se respeta la semantica normal de rAF (cada callback
    // sigue siendo independiente, no se juntan en tandas) y el tick interno
    // del fondo de cancha usa el rAF nativo sin limitar, para que su
    // bookkeeping por frame nunca se saltee.
    var _rafNative = window.requestAnimationFrame.bind(window);
    var _cafNative = window.cancelAnimationFrame ? window.cancelAnimationFrame.bind(window) : function () {};
    window._hbxRafUnthrottled = _rafNative;
    (function () {
        var FPS_TABLE = [0, 30, 60, 90, 120, 144, 165, 180, 240, 244];
        var lastAllowedTs = 0, decisionTs = -1, decision = true;
        var cancelled = Object.create(null), nextId = 1;

        function currentLimit() {
            try {
                var i = parseInt(localStorage.getItem('fps_limit'), 10);
                if (isNaN(i) || i < 0 || i >= FPS_TABLE.length) return 0;
                return FPS_TABLE[i];
            } catch (e) { return 0; }
        }

        function frameAllowed(ts) {
            if (ts === decisionTs) return decision;
            decisionTs = ts;
            var limit = currentLimit();
            if (!limit) { decision = true; lastAllowedTs = ts; return true; }
            // Si el reloj retrocede (timeline reiniciada, pestaña dormida),
            // sin esto lastAllowedTs queda en el futuro y NUNCA se vuelve a
            // permitir un frame: el juego se congelaria del todo.
            if (ts < lastAllowedTs) lastAllowedTs = ts;
            // Margen de medio milisegundo: sin el, un frame que llega apenas
            // antes del intervalo exacto se descarta y el limite real
            // termina siendo la mitad del elegido.
            if (ts - lastAllowedTs >= (1000 / limit) - 0.5) {
                lastAllowedTs = ts;
                decision = true;
            } else {
                decision = false;
            }
            return decision;
        }

        window.requestAnimationFrame = function (cb) {
            var id = nextId++;
            _rafNative(function step(ts) {
                if (cancelled[id]) { delete cancelled[id]; return; }
                if (frameAllowed(ts)) { cb(ts); return; }
                _rafNative(step);
            });
            return id;
        };
        window.cancelAnimationFrame = function (id) {
            cancelled[id] = true;
        };
    })();

    // Pelota multicolor: el motor original ya lee window.customBallColor
    // como el color a usar (esa parte es del engine, no se toca). En vez de
    // agregar una rama nueva ahi adentro, se convierte customBallColor en
    // una propiedad con getter: si el modo multicolor esta activo, calcula
    // un color que va rotando con el tiempo en vez de devolver el fijo. El
    // motor sigue leyendo "window.customBallColor" exactamente igual que
    // siempre, sin saber que ahora es dinamico.
    var _customBallColorStatic = localStorage.getItem('hbx_custom_ball_color') || null;
    var _ballMulticolor = localStorage.getItem('hbx_ball_multicolor') === '1';
    function _hbxHueToHex(h) {
        // HSL(h, 85%, 55%) a hex, sin depender de canvas/DOM para calcularlo.
        var s = 0.85, l = 0.55;
        var c = (1 - Math.abs(2 * l - 1)) * s;
        var hh = h / 60;
        var xx = c * (1 - Math.abs(hh % 2 - 1));
        var r, g, b;
        if (hh < 1) { r = c; g = xx; b = 0; }
        else if (hh < 2) { r = xx; g = c; b = 0; }
        else if (hh < 3) { r = 0; g = c; b = xx; }
        else if (hh < 4) { r = 0; g = xx; b = c; }
        else if (hh < 5) { r = xx; g = 0; b = c; }
        else { r = c; g = 0; b = xx; }
        var m = l - c / 2;
        function toHex(v) { var n = Math.round((v + m) * 255); return (n < 16 ? '0' : '') + n.toString(16); }
        return '#' + toHex(r) + toHex(g) + toHex(b);
    }
    Object.defineProperty(window, 'customBallColor', {
        get: function() {
            if (_ballMulticolor) return _hbxHueToHex((Date.now() / 8) % 360);
            return _customBallColorStatic;
        },
        set: function(v) { _customBallColorStatic = v; },
        configurable: true
    });
    window.customBallColorEnabled = localStorage.getItem('hbx_custom_ball_color_enabled') === '1';
    window.setCustomBallColor = function(color, enabled) {
        if (color !== undefined) {
            if (color) { localStorage.setItem('hbx_custom_ball_color', color); window.customBallColor = color; }
            else { localStorage.removeItem('hbx_custom_ball_color'); window.customBallColor = null; }
        }
        if (enabled !== undefined) {
            localStorage.setItem('hbx_custom_ball_color_enabled', enabled ? '1' : '0');
            window.customBallColorEnabled = !!enabled;
        }
    };
    window.setBallMulticolor = function(enabled) {
        _ballMulticolor = !!enabled;
        localStorage.setItem('hbx_ball_multicolor', enabled ? '1' : '0');
    };

    // Estela de color (aura brillante) en la pelota y/o los jugadores.
    window.trailBallEnabled = localStorage.getItem('hbx_trail_ball_enabled') === '1';
    window.trailBallColor = localStorage.getItem('hbx_trail_ball_color') || '#22d3ee';
    window.trailPlayerEnabled = localStorage.getItem('hbx_trail_player_enabled') === '1';
    window.trailPlayerColor = localStorage.getItem('hbx_trail_player_color') || '#22d3ee';
    window.setTrailSettings = function(target, enabled, color) {
        var prefix = target === 'ball' ? 'hbx_trail_ball_' : 'hbx_trail_player_';
        var enabledKey = target === 'ball' ? 'trailBallEnabled' : 'trailPlayerEnabled';
        var colorKey = target === 'ball' ? 'trailBallColor' : 'trailPlayerColor';
        if (enabled !== undefined) {
            localStorage.setItem(prefix + 'enabled', enabled ? '1' : '0');
            window[enabledKey] = !!enabled;
        }
        if (color !== undefined) {
            localStorage.setItem(prefix + 'color', color);
            window[colorKey] = color;
        }
    };

    // Foto personalizada en la pelota
    window.customBallImgData = localStorage.getItem('hbx_custom_ball_img_data') || null;
    window.customBallImgEnabled = localStorage.getItem('hbx_custom_ball_img_enabled') === '1';
    window.customBallImgScale = parseFloat(localStorage.getItem('hbx_custom_ball_img_scale')) || 1.0;
    window.customBallImgOffsetX = parseFloat(localStorage.getItem('hbx_custom_ball_img_offset_x')) || 0;
    window.customBallImgOffsetY = parseFloat(localStorage.getItem('hbx_custom_ball_img_offset_y')) || 0;
    window.customBallImg = null;
    if (window.customBallImgData) {
        window.customBallImg = new Image();
        window.customBallImg.src = window.customBallImgData;
    }
    window.setCustomBallImg = function(dataUrl, enabled, scale, offX, offY) {
        if (dataUrl !== undefined) {
            if (dataUrl) {
                localStorage.setItem('hbx_custom_ball_img_data', dataUrl);
                window.customBallImg = new Image();
                window.customBallImg.src = dataUrl;
            } else {
                localStorage.removeItem('hbx_custom_ball_img_data');
                window.customBallImg = null;
            }
        }
        if (enabled !== undefined) {
            localStorage.setItem('hbx_custom_ball_img_enabled', enabled ? '1' : '0');
            window.customBallImgEnabled = !!enabled;
        }
        if (scale !== undefined) {
            localStorage.setItem('hbx_custom_ball_img_scale', scale);
            window.customBallImgScale = parseFloat(scale) || 1.0;
        }
        if (offX !== undefined) {
            localStorage.setItem('hbx_custom_ball_img_offset_x', offX);
            window.customBallImgOffsetX = parseFloat(offX) || 0;
        }
        if (offY !== undefined) {
            localStorage.setItem('hbx_custom_ball_img_offset_y', offY);
            window.customBallImgOffsetY = parseFloat(offY) || 0;
        }
    };
    window.customAvatarImgData = localStorage.getItem('hbx_custom_avatar_img_data');
    window.customAvatarTargetText = localStorage.getItem('hbx_custom_avatar_target_text') || 'ME';
    window.customAvatarMatchAll = localStorage.getItem('hbx_custom_avatar_match_all') === '1';
    window.customAvatarScale = parseFloat(localStorage.getItem('hbx_custom_avatar_scale')) || 1.0;
    window.customAvatarOffsetX = parseFloat(localStorage.getItem('hbx_custom_avatar_offset_x')) || 0;
    window.customAvatarOffsetY = parseFloat(localStorage.getItem('hbx_custom_avatar_offset_y')) || 0;
    
    window.customAvatarImg = null;
    if (window.customAvatarImgData) {
        window.customAvatarImg = new Image();
        window.customAvatarImg.src = window.customAvatarImgData;
    }

    var origSetItem = localStorage.setItem;
    localStorage.setItem = function(key, val) {
        if (key === 'haxclient_gif_emojis') return; 
        return origSetItem.apply(this, arguments);
    };
    localStorage.removeItem('haxclient_gif_emojis');
    window._haxGifActive = false;
    window._haxGifEmojis = null;
    if (window._haxGifInterval) clearInterval(window._haxGifInterval);

    // Limpia el cache de avatares ya dibujados del motor. Sin esto el juego
    // sigue mostrando la imagen vieja hasta que se vuelve a entrar a la sala.
    function _hbxRefreshAvatars() {
        if (window._hbxClearAvatarCache) {
            try { window._hbxClearAvatarCache(); } catch (e) {}
        }
    }

    window.setCustomAvatarImg = function(dataUrl, targetText, scale, offX, offY, matchAll) {
        if (dataUrl !== undefined) {
            if (dataUrl) {
                try { localStorage.setItem('hbx_custom_avatar_img_data', dataUrl); } catch (e) {}
                var nuevaImg = new Image();
                // CLAVE para poder cambiar la foto EN PLENO PARTIDO: cargar una
                // imagen es asincronico. Antes se limpiaba el cache al instante,
                // cuando la foto nueva todavia no habia terminado de cargar, asi
                // que el motor volvia a cachear la VIEJA y ahi se quedaba hasta
                // salir de la sala. Ahora se limpia de nuevo cuando la nueva ya
                // esta lista, que es cuando realmente se puede dibujar.
                nuevaImg.onload = function () { _hbxRefreshAvatars(); };
                nuevaImg.src = dataUrl;
                window.customAvatarImg = nuevaImg;
            } else {
                // Antes esto era "else if (dataUrl === null)", asi que borrar la
                // foto desde la interfaz (que manda cadena vacia) no hacia nada
                // y la imagen seguia puesta. Ahora cualquier valor vacio borra.
                localStorage.removeItem('hbx_custom_avatar_img_data');
                window.customAvatarImg = null;
            }
        }
        if (targetText !== undefined) {
            localStorage.setItem('hbx_custom_avatar_target_text', targetText);
            window.customAvatarTargetText = targetText;
        }
        if (scale !== undefined) {
            localStorage.setItem('hbx_custom_avatar_scale', scale);
            window.customAvatarScale = scale;
        }
        if (offX !== undefined) {
            localStorage.setItem('hbx_custom_avatar_offset_x', offX);
            window.customAvatarOffsetX = offX;
        }
        if (offY !== undefined) {
            localStorage.setItem('hbx_custom_avatar_offset_y', offY);
            window.customAvatarOffsetY = offY;
        }
        if (matchAll !== undefined) {
            localStorage.setItem('hbx_custom_avatar_match_all', matchAll ? '1' : '0');
            window.customAvatarMatchAll = !!matchAll;
        }
        _hbxRefreshAvatars();
    };

    // _hbxRefreshAvatars() no alcanza aca: solo limpia un cache que en la
    // practica nunca se llega a rellenar (window._hbxClearAvatarCache no
    // esta definido en ningun lado). El mecanismo que SI fuerza al motor a
    // redibujar es el truco de mandar "/avatar" con un texto dummy y despues
    // el real (forceAvatarVideoRefresh, expuesto en window por
    // quickavatar.js) — el mismo que ya usa la foto. Sin esto, si el
    // video/gif todavia no habia terminado de decodificar en el momento del
    // primer refresh forzado (al subir el archivo), se quedaba mostrando el
    // texto de siempre para siempre porque nada volvia a reintentar despues.
    function _hbxTriggerAvatarVideoRefresh() {
        var frames = [window];
        try { if (window.top) frames.push(window.top); } catch (e) {}
        for (var f = 0; f < window.frames.length; f++) {
            try { frames.push(window.frames[f]); } catch (e) {}
        }
        var found = 0;
        for (var i = 0; i < frames.length; i++) {
            try {
                if (frames[i].forceAvatarVideoRefresh) {
                    frames[i].forceAvatarVideoRefresh();
                    found++;
                }
            } catch (e) {}
        }
        if (window._hbxAvatarDebug) {
            try { console.log('[HaxBion avatar] _hbxTriggerAvatarVideoRefresh: ' + frames.length + ' frames revisados, forceAvatarVideoRefresh encontrada en ' + found + '.'); } catch (e) {}
        }
    }

    window.customAvatarVideoData = localStorage.getItem('hbx_custom_avatar_video_data') || null;
    window.customAvatarVideoEnabled = localStorage.getItem('hbx_custom_avatar_video_enabled') === '1';
    window.customAvatarVideoKind = localStorage.getItem('hbx_custom_avatar_video_kind') || 'video';
    window.customAvatarVideoEl = null;
    function _hbxBuildAvatarVideoEl(dataUrl, kind) {
        if (kind === 'gif') {
            var img = new Image();
            img.onload = function () { _hbxTriggerAvatarVideoRefresh(); };
            img.src = dataUrl;
            return img;
        }
        var v = document.createElement('video');
        v.muted = true;
        v.loop = true;
        v.playsInline = true;
        v.autoplay = true;
        v.oncanplay = function () { _hbxTriggerAvatarVideoRefresh(); };
        v.onloadeddata = function () { _hbxTriggerAvatarVideoRefresh(); };
        v.src = dataUrl;
        var p = v.play();
        if (p && p.catch) p.catch(function () {});
        return v;
    }
    if (window.customAvatarVideoData && window.customAvatarVideoEnabled) {
        window.customAvatarVideoEl = _hbxBuildAvatarVideoEl(window.customAvatarVideoData, window.customAvatarVideoKind);
    }
    window.setCustomAvatarVideo = function (dataUrl, enabled, kind) {
        if (kind !== undefined) {
            localStorage.setItem('hbx_custom_avatar_video_kind', kind);
            window.customAvatarVideoKind = kind;
        }
        if (dataUrl !== undefined) {
            if (dataUrl) {
                try { localStorage.setItem('hbx_custom_avatar_video_data', dataUrl); } catch (e) {}
                window.customAvatarVideoEl = _hbxBuildAvatarVideoEl(dataUrl, window.customAvatarVideoKind);
            } else {
                localStorage.removeItem('hbx_custom_avatar_video_data');
                window.customAvatarVideoEl = null;
            }
        }
        if (enabled !== undefined) {
            localStorage.setItem('hbx_custom_avatar_video_enabled', enabled ? '1' : '0');
            window.customAvatarVideoEnabled = !!enabled;
        }
        _hbxRefreshAvatars();
    };

    var origArc = CanvasRenderingContext2D.prototype.arc;
    var origFillText = CanvasRenderingContext2D.prototype.fillText;
    var origFill = CanvasRenderingContext2D.prototype.fill;
    // Objeto reutilizado en vez de crear uno nuevo por cada disco dibujado (se llama
    // decenas de veces por frame durante un partido, evita presion sobre el GC).
    var lastArc = { x: 0, y: 0, r: 0 };
    var lastArcIsBall = false;
    window._hbxMyPos = null;
    var _hbxMyPosPending = null;
    window._hbxMyAvatarCanvas = null;
    var _hbxGlowDebugCounter = 0;
    var _hbxMineIsOnScratch = false;

    // Lista de discos (jugadores + pelota) dibujados en el frame actual, para
    // el minimapa. Se resetea por frame igual que el resto del bookkeeping de
    // fondo de cancha. El color real se completa en fill() (ahi es donde el
    // motor ya seteo this.fillStyle con el color del equipo/pelota).
    window._hbxFrameDiscs = [];
    var _hbxFrameDiscsBuf = [];
    var _hbxArcPendingFill = false;

    // Bookkeeping del path actual, para detectar el fondo de cancha (ver mas
    // abajo, en fill()). Diagnostico en vivo confirmo que la cancha NO se
    // traza con rect() (eso dio 0 llamadas siempre) sino con moveTo/lineTo
    // formando un rectangulo a mano, en un espacio de coordenadas
    // TRANSFORMADO (translate ya aplicado — los bounds dieron cosas como
    // x:-370 en vez de valores relativos a 0,0 del canvas). Por eso, mas
    // abajo, la deteccion NO compara estos bounds contra el ancho/alto del
    // canvas (esa comparacion no tiene sentido en un espacio transformado):
    // solo se usa el criterio de "contiene a los jugadores".
    var origBeginPath = CanvasRenderingContext2D.prototype.beginPath;
    var origMoveTo = CanvasRenderingContext2D.prototype.moveTo;
    var origLineTo = CanvasRenderingContext2D.prototype.lineTo;
    var lastPathBounds = null;
    var _pathMinX, _pathMinY, _pathMaxX, _pathMaxY, _pathHasPts;
    CanvasRenderingContext2D.prototype.beginPath = function() {
        lastPathBounds = null;
        _pathHasPts = false;
        return origBeginPath.call(this);
    };
    function _hbxTrackPathPoint(x, y) {
        if (!_pathHasPts) {
            _pathMinX = _pathMaxX = x;
            _pathMinY = _pathMaxY = y;
            _pathHasPts = true;
        } else {
            if (x < _pathMinX) _pathMinX = x;
            if (x > _pathMaxX) _pathMaxX = x;
            if (y < _pathMinY) _pathMinY = y;
            if (y > _pathMaxY) _pathMaxY = y;
        }
        lastPathBounds = { x: _pathMinX, y: _pathMinY, w: _pathMaxX - _pathMinX, h: _pathMaxY - _pathMinY };
    }
    CanvasRenderingContext2D.prototype.moveTo = function(x, y) {
        // Salida rapida en canvases chicos (avatares, pelota): moveTo/lineTo
        // se llaman muy seguido para dibujar texto y otras cosas, no vale la
        // pena trackear bounds ahi, nunca va a ser la cancha.
        if (this.canvas && this.canvas.width > 200) _hbxTrackPathPoint(x, y);
        return origMoveTo.call(this, x, y);
    };
    CanvasRenderingContext2D.prototype.lineTo = function(x, y) {
        if (this.canvas && this.canvas.width > 200) _hbxTrackPathPoint(x, y);
        return origLineTo.call(this, x, y);
    };

    CanvasRenderingContext2D.prototype.arc = function(x, y, radius, startAngle, endAngle, counterclockwise) {
        // El bookkeeping va SIEMPRE, sin condicionarlo a que la foto en la
        // pelota este activada. Condicionarlo ahorraba unas pocas escrituras
        // pero metia riesgo en una funcion que pediste no tocar, asi que
        // vuelve a como estaba.
        lastArc.x = x;
        lastArc.y = y;
        lastArc.r = radius;
        // Posicion del disco EN PANTALLA (no en coordenadas de mundo). Sirve
        // para saber cual disco es el nuestro: la camara del juego sigue a
        // tu jugador, asi que el tuyo es el que queda mas cerca del centro
        // de la pantalla. Es la unica señal que no depende del avatar.
        lastArc.sx = null; lastArc.sy = null; lastArc.cw = 0; lastArc.ch = 0;
        // Los limites del trazo se alimentaban solo desde moveTo/lineTo, asi
        // que una figura hecha con arc() (circulo central, arcos de esquina,
        // curvas del area) quedaba sin limites y nunca se la reconocia como
        // linea de la cancha. Ahora el arco tambien aporta su caja.
        if (this.canvas && this.canvas.width > 200) {
            _hbxTrackPathPoint(x - radius, y - radius);
            _hbxTrackPathPoint(x + radius, y + radius);
        }
        try {
            if (this.canvas && this.canvas.width > 200 && this.getTransform) {
                var _m = this.getTransform();
                lastArc.sx = _m.a * x + _m.c * y + _m.e;
                lastArc.sy = _m.b * x + _m.d * y + _m.f;
                lastArc.cw = this.canvas.width;
                lastArc.ch = this.canvas.height;
            }
        } catch (e) {}
        lastArcIsBall = !!window._hbxRenderingBall;
        _hbxArcPendingFill = true;

        // Estela de color (aura brillante), apagada por defecto. Se dibuja
        // ANTES del disco real para que el disco quede encima y la estela
        // se vea como un halo detras. Usa origArc/origFill (NUNCA
        // this.arc/this.fill, que son estas mismas funciones envueltas —
        // llamarlas recursaria) para no interferir con el resto de los
        // hooks. Como save()/restore() NO guardan el path actual (solo
        // estilos/transform), dibujar la estela pisa el path que el motor
        // acaba de empezar para el disco — por eso, si se dibujo la estela,
        // se vuelve a armar ese path con origBeginPath+origArc antes de
        // devolver el control, para que el fill() que el motor haga
        // despues actue sobre el circulo correcto. Si la funcion esta
        // apagada (por defecto) no se toca el path en absoluto: cero riesgo
        // para quien no usa esto.
        // BUG REAL (arreglado con datos reales, medidos en vivo jugando en
        // una sala): "no es la pelota" no significa "es un jugador" — con
        // solo un piso de radio (>=9) la estela tambien se pegaba al
        // circulo de "alcance de patada" (radio 25, se dibuja una vez por
        // jugador igual que el disco real, por eso parecia estar "en el
        // centro" — en realidad rodea al jugador) y a los palos/curvas de
        // los arcos (radios 65 y 97). Medido en consola: la pelota es
        // radio 6, el jugador real es radio 15 (el default clasico de
        // Haxball), y kick-range/curvas quedan bien afuera de un rango
        // 12-20. Ese rango dejaria un margen chico por si algun mapa usa un
        // radio de jugador levemente distinto al default.
        var myPos = window._hbxMyPos;
        // BUG REAL (arreglado): el rango fijo 12-20 px asumia el zoom por
        // defecto. Con Viewport Mode en 1.75x (o cualquier zoom/estirado) el
        // disco se dibuja bastante mas grande y quedaba fuera del rango, asi
        // que la estela dejaba de salir aunque todo lo demas estuviera bien.
        // Ahora el tamaño esperado sale del propio avatar compuesto
        // (myPos.r), asi que acompaña cualquier zoom. Ademas ese radio deja
        // afuera el circulo de alcance de patada, que es mucho mas grande.
        var wantsGlow;
        if (lastArcIsBall) {
            wantsGlow = window.trailBallEnabled;
        } else {
            // El glow de jugador ahora se dibuja directo en motor-dervi.js
            // (lm()), enganchado a b.__DerviIsMe real en vez de esta
            // heuristica de posicion (myPos por drawImage/camara), que
            // fallaba de a ratos y hacia que el glow "se fuera" a
            // intervalos. Se desactiva aca para no dibujarlo dos veces.
            wantsGlow = false;
        }
        if (!lastArcIsBall && myPos && myPos.r > 0 && Math.abs(radius - myPos.r) <= Math.max(5, myPos.r * 0.6)) {
            D.playerDiscsSeen++;
            if (myPos) D.lastGlowDist = Math.sqrt((x - myPos.x) * (x - myPos.x) + (y - myPos.y) * (y - myPos.y));
        }
        if (wantsGlow) D.glowDrawn++;
        if (window._hbxAvatarDebug && !lastArcIsBall && window.trailPlayerEnabled && radius >= 12 && radius <= 20) {
            _hbxGlowDebugCounter = (_hbxGlowDebugCounter + 1) % 60;
            if (_hbxGlowDebugCounter === 0) {
                try {
                    console.log('[HaxBion glow] disco jugador en (' + x.toFixed(1) + ', ' + y.toFixed(1) + '), myPos=' + (myPos ? '(' + myPos.x.toFixed(1) + ', ' + myPos.y.toFixed(1) + ')' : 'null') + ', wantsGlow=' + wantsGlow);
                } catch (e) {}
            }
        }
        if (wantsGlow) {
            try {
                var glowColor = lastArcIsBall ? window.trailBallColor : window.trailPlayerColor;
                var glowR = radius * 2.4;
                var grad = this.createRadialGradient(x, y, radius * 0.4, x, y, glowR);
                grad.addColorStop(0, glowColor + 'AA');
                grad.addColorStop(0.6, glowColor + '44');
                grad.addColorStop(1, glowColor + '00');
                this.save();
                origBeginPath.call(this);
                origArc.call(this, x, y, glowR, 0, Math.PI * 2);
                this.fillStyle = grad;
                origFill.call(this);
                this.restore();
            } catch (e) {}
            origBeginPath.call(this);
        }

        // .call con argumentos explicitos en vez de .apply(this, arguments):
        // evita crear/leer el objeto "arguments" en el path mas caliente del
        // renderer. Esto no cambia el comportamiento, solo el costo.
        return origArc.call(this, x, y, radius, startAngle, endAngle, counterclockwise);
    };

    // Si la pelota tiene una foto activa, se dibuja en vez del relleno solido.
    // El zoom y el desplazamiento se ajustan desde el panel de Avatares.
    //
    // Nota: los overrides de stroke() y fillRect() que existian aca (para
    // recolorear lineas/fondo de cancha y discos de jugador) fueron removidos
    // por completo. El motor vuelve a dibujar esas cosas sin ninguna capa
    // intermedia, que es tambien lo mas rapido posible.

    // Decide si un path es una LINEA de la cancha (mitad de cancha,
    // laterales, borde del area) y no cualquier otra cosa que tambien se
    // dibuje con relleno solido dentro del rectangulo de la cancha.
    //
    // Hace falta ser estricto: adentro de la cancha tambien se pintan con
    // fill() solido el propio fondo (cuando no hay textura), los discos de
    // los jugadores y la pelota, y los palos del arco. Recolorear
    // cualquiera de esos era el bug — se veian jugadores o la cancha
    // entera cambiados de color en vez de solo las lineas.
    //
    // Criterios (todos deben cumplirse):
    //  - Contenida en la cancha (con un margen chico).
    //  - FINA: el lado corto es a lo sumo el 3% de la altura de la cancha.
    //    Una linea real es un rectangulo largo y finito; el fondo, los
    //    discos y los palos no pasan este filtro.
    //  - LARGA: el lado largo es al menos el 15% de la altura de la
    //    cancha, para descartar detalles chiquitos.
    //  - No pegada al borde izquierdo/derecho siendo corta (los palos del
    //    arco), que se pidio dejar con su color original.
    function _hbxIsFieldLineShape(lr, pr) {
        if (!(lr.x >= pr.x - 10 && lr.y >= pr.y - 10 && (lr.x + lr.w) <= pr.x + pr.w + 10 && (lr.y + lr.h) <= pr.y + pr.h + 10)) return false;

        var shortSide = Math.min(lr.w, lr.h);
        var longSide = Math.max(lr.w, lr.h);
        if (shortSide > pr.h * 0.03) return false;
        if (longSide < pr.h * 0.15) return false;

        var nearLeftEdge = Math.abs(lr.x - pr.x) < 30 || Math.abs((lr.x + lr.w) - pr.x) < 30;
        var nearRightEdge = Math.abs(lr.x - (pr.x + pr.w)) < 30 || Math.abs((lr.x + lr.w) - (pr.x + pr.w)) < 30;
        if ((nearLeftEdge || nearRightEdge) && longSide < pr.h * 0.25) return false;

        return true;
    }

    CanvasRenderingContext2D.prototype.fill = function() {
        // Bookkeeping para el minimapa: el primer fill() despues de un arc()
        // es el que efectivamente pinta ese disco (jugador o pelota), y para
        // entonces el motor ya seteo this.fillStyle con el color real
        // (equipo/pelota). No condiciona nada del dibujado real, solo lee.
        var _hbxWasDiscFill = _hbxArcPendingFill;
        if (_hbxArcPendingFill) {
            _hbxArcPendingFill = false;
            try {
                var _pushed = { x: lastArc.x, y: lastArc.y, r: lastArc.r, isBall: lastArcIsBall, color: this.fillStyle, sx: lastArc.sx, sy: lastArc.sy, cw: lastArc.cw, ch: lastArc.ch };
                _hbxFrameDiscsBuf.push(_pushed);
                D.lastDisc = _pushed;
            } catch (e) {}
        }
        // GIF/VIDEO SOBRE MI JUGADOR. Se dibuja aca, sobre la cancha,
        // exactamente igual que la foto de la pelota (el unico metodo que
        // esta comprobado que funciona). El motor cachea el avatar y no lo
        // vuelve a componer en cada frame, asi que pintar en el canvas del
        // avatar no servia: el cuadro quedaba congelado. Aca en cambio el
        // disco se repinta en TODOS los frames, asi que el gif se anima
        // solo y en bucle. clip() recorta al circulo del disco, que es el
        // path que el motor acaba de armar con arc().
        if (_hbxWasDiscFill && !lastArcIsBall && window.customAvatarVideoEnabled) {
            var _myP = window._hbxMyPos;
            var _mv = window.customAvatarVideoEl;
            var _mvOk = _mv && (_mv.tagName === 'VIDEO' ? _mv.readyState >= 2 : (_mv.complete && _mv.naturalWidth > 0));
            if (_myP && _mvOk && Math.abs(lastArc.x - _myP.x) < lastArc.r && Math.abs(lastArc.y - _myP.y) < lastArc.r) {
                var _mr = lastArc.r;
                var _msc = window.customAvatarScale || 1.0;
                var _mrat = _mr / 35;
                var _mox = (window.customAvatarOffsetX || 0) * _mrat;
                var _moy = (window.customAvatarOffsetY || 0) * _mrat;
                var _msz = _mr * 2 * _msc;
                this.save();
                this.clip();
                origDrawImage.call(this, _mv, lastArc.x - _msz / 2 + _mox, lastArc.y - _msz / 2 + _moy, _msz, _msz);
                this.restore();
                D.videoDrawn++;
                return;
            }
        }

        if (lastArcIsBall && window.customBallImgEnabled && window.customBallImg &&
            window.customBallImg.complete && window.customBallImg.naturalWidth > 0) {
            lastArcIsBall = false;
            var ctx = this;
            var r = lastArc.r;
            var scale = window.customBallImgScale || 1.0;
            var offX = ((window.customBallImgOffsetX || 0) / 100) * r;
            var offY = ((window.customBallImgOffsetY || 0) / 100) * r;
            var size = r * 2 * scale;
            ctx.save();
            ctx.clip();
            ctx.drawImage(window.customBallImg, lastArc.x - size / 2 + offX, lastArc.y - size / 2 + offY, size, size);
            ctx.restore();
            return;
        }

        // Fondo de cancha (intento #8, confirmado con diagnostico en vivo
        // moviendo un jugador real en una sala real): la cancha se pinta
        // con fillStyle = un CanvasPattern (textura repetida) + fill()
        // sobre un path armado a mano con moveTo/lineTo (NO con rect(), eso
        // dio 0 llamadas siempre — intento #7 fallaba por eso). Ademas ese
        // path esta en un espacio de coordenadas YA TRANSFORMADO (translate
        // aplicado antes: los bounds reales fueron cosas como x:-370,
        // y:-170, no relativos a 0,0 del canvas) — por eso NO se compara
        // contra el ancho/alto del canvas como en los intentos anteriores,
        // esa comparacion no tenia sentido en este espacio y por eso nunca
        // matcheaba nada. Los jugadores (window._hbxFrameDiscs) se trackean
        // en ese MISMO espacio transformado via arc(), asi que "contiene a
        // los jugadores" sigue siendo una comparacion valida.
        // La cancha se puede pintar de DOS formas segun el mapa:
        //  - con una textura repetida (fillStyle = CanvasPattern, un objeto)
        //  - con un color plano (fillStyle = string), en mapas sin textura
        // Antes solo se contemplaba la primera. En un mapa de color liso la
        // deteccion no disparaba nunca, y como las lineas dependen de tener
        // el rectangulo de la cancha ya detectado, fallaban las dos juntas.
        // Para el relleno solido se exige ademas que el path sea GRANDE y
        // que contenga a los discos, para no confundirlo con una linea.
        var _fsIsPattern = this.fillStyle && typeof this.fillStyle === 'object';
        var _fsIsSolid = typeof this.fillStyle === 'string';
        var _bigEnoughForPitch = lastPathBounds && lastPathBounds.w > 100 && lastPathBounds.h > 60;
        var _pitchCandidate = _fsIsPattern || (_fsIsSolid && _bigEnoughForPitch && !window._hbxPitchDetectedThisFrame);
        if (lastPathBounds && _pitchCandidate) {
            if (_fsIsPattern) { D.patternFills++; D.lastPatternBounds = lastPathBounds; }
            var rb = lastPathBounds;
            // Sanity check minimo (no relativo al canvas): descarta paths
            // chiquitos que nunca podrian ser la cancha.
            var isReasonableSize = rb.w > 40 && rb.h > 40;
            if (isReasonableSize) {
                var containsDiscsB = true;
                var discsB = window._hbxFrameDiscs;
                if (discsB && discsB.length) {
                    // El margen fijo (20) fallaba en canchas mas grandes: ahi
                    // las unidades de mundo son mas grandes, asi que un
                    // jugador cerca del borde (algo normal en el juego, no
                    // solo "afuera de la cancha") quedaba a mas de 20
                    // unidades del rectangulo y tiraba abajo la deteccion
                    // entera. El margen ahora escala con el tamaño real de
                    // la cancha detectada. Ademas se tolera algun disco
                    // suelto afuera (jugador que efectivamente salio de la
                    // cancha, o la pelota en un tiro de esquina) en vez de
                    // descartar todo por uno solo.
                    var marginB = Math.max(20, rb.w * 0.06, rb.h * 0.06);
                    var outliersB = 0;
                    for (var iB = 0; iB < discsB.length; iB++) {
                        var dB = discsB[iB];
                        if (dB.x < rb.x - marginB || dB.x > rb.x + rb.w + marginB || dB.y < rb.y - marginB || dB.y > rb.y + rb.h + marginB) {
                            outliersB++;
                        }
                    }
                    containsDiscsB = outliersB <= Math.max(1, Math.floor(discsB.length * 0.15));
                }
                var cachedRectB = window._hbxPitchRect;
                var matchesCachedB = !!cachedRectB && Math.abs(rb.x - cachedRectB.x) < 3 && Math.abs(rb.y - cachedRectB.y) < 3 && Math.abs(rb.w - cachedRectB.w) < 3 && Math.abs(rb.h - cachedRectB.h) < 3;
                if (window._hbxFieldBgDebug) {
                    try { console.log('[HaxBion fieldbg] pattern-fill candidato', { rb: rb, containsDiscsB: containsDiscsB, matchesCachedB: matchesCachedB }); } catch (e) {}
                }
                var _accept = _fsIsPattern ? (containsDiscsB || matchesCachedB)
                                           : (containsDiscsB && discsB && discsB.length > 0);
                if (_accept) {
                    window._hbxPitchRect = { x: rb.x, y: rb.y, w: rb.w, h: rb.h };
                    window._hbxPitchDetectedThisFrame = true;
                    D.pitchDetected++;
                    if (window.customFieldBgColorEnabled) {
                        _hbxFieldBgAppliedThisFrame = true; D.bgApplied++;
                        this.fillStyle = window.customFieldBgColor || '#1a8a3d';
                        origFill.call(this);
                        return;
                    }
                    if (window.customFieldBgEnabled && window.customFieldBgImg &&
                        window.customFieldBgImg.complete && window.customFieldBgImg.naturalWidth > 0) {
                        _hbxFieldBgAppliedThisFrame = true; D.bgApplied++;
                        var fbImg = window.customFieldBgImg;
                        var irB = fbImg.naturalWidth / fbImg.naturalHeight;
                        var drB = rb.w / rb.h;
                        var sxB, syB, swB, shB;
                        if (irB > drB) {
                            shB = fbImg.naturalHeight;
                            swB = shB * drB;
                            sxB = (fbImg.naturalWidth - swB) / 2;
                            syB = 0;
                        } else {
                            swB = fbImg.naturalWidth;
                            shB = swB / drB;
                            sxB = 0;
                            syB = (fbImg.naturalHeight - shB) / 2;
                        }
                        this.save();
                        // clip() recorta al PATH ACTUAL (el moveTo/lineTo de
                        // recien), que sigue activo aca porque fill()
                        // todavia no corrio.
                        this.clip();
                        this.drawImage(fbImg, sxB, syB, swB, shB, rb.x, rb.y, rb.w, rb.h);
                        this.restore();
                        if (window._hbxFieldBgDebug) {
                            this.save();
                            this.lineWidth = 4;
                            this.strokeStyle = '#ff00ff';
                            this.strokeRect(rb.x + 2, rb.y + 2, rb.w - 4, rb.h - 4);
                            this.restore();
                        }
                        return;
                    }
                }
            }
        }

        // Lineas de la cancha (mismo patron que el fondo: relleno solido,
        // NO patron, sobre un path armado a mano con moveTo/lineTo, y
        // contenido dentro del rectangulo de cancha ya detectado por el
        // bloque de arriba). Se exige contencion en window._hbxPitchRect
        // para no tocar nada fuera de la cancha (otros elementos de UI que
        // tambien usen fill() con color solido en el mismo canvas grande).
        // Los palos del arco quedan afuera a proposito (ver
        // _hbxIsFieldLineShape mas arriba): son formas chicas pegadas al
        // borde izquierdo/derecho de la cancha, bien distintas de las
        // lineas largas (mitad de cancha, laterales, area).
        if (window.customFieldLineEnabled && !_hbxWasDiscFill && _pathHasPts && lastPathBounds && typeof this.fillStyle === 'string') {
            var lr = lastPathBounds;
            var pr = window._hbxPitchRect;
            if (pr && _hbxIsFieldLineShape(lr, pr)) {
                if (window._hbxFieldBgDebug) {
                    try { console.log('[HaxBion linea] fill solido "' + this.fillStyle + '" dentro de la cancha, bounds', lr); } catch (e) {}
                }
                D.lineFills++; D.lastLineColor = String(this.fillStyle);
                if (window.customFieldLineTransparent) {
                    return;
                }
                this.fillStyle = window.customFieldLineColor || '#ffffff';
            }
        }

        // fill() se llama sin argumentos casi siempre; evitar apply()+arguments
        // en ese caso comun es mas rapido.
        return arguments.length ? origFill.apply(this, arguments) : origFill.call(this);
    };

    // Mismo detector que arriba pero para lineas dibujadas con stroke() en
    // vez de fill() solido — algunos mapas/temas usan una u otra tecnica
    // para las lineas de la cancha, asi que se cubren las dos.
    //
    // OJO: en stroke() el grosor NO sale de los bounds del path (esos son
    // la linea "central"), sale de lineWidth. Por eso aca el filtro de
    // "fina" no aplica: una linea de mitad de cancha trazada con stroke
    // tiene bounds de ancho 0. Se pide que sea larga, que este contenida
    // en la cancha, que no sea un disco y que no sea un palo del arco.
    //
    // OJO 2: NO se descarta todo lo que venga despues de un arc(). El
    // circulo central y los arcos de las esquinas tambien se trazan con
    // arc(), asi que descartarlos dejaba esas lineas sin borrar al poner
    // "transparente" (se borraban las rectas pero quedaba el circulo del
    // medio). Lo unico que hay que dejar afuera son los discos de
    // jugadores y la pelota, que se distinguen por el radio (la pelota es
    // ~6 y el jugador ~15; el circulo central y los arcos son mucho mas
    // grandes).
    // El circulo de 'alcance de patada' va centrado exactamente sobre un
    // jugador. Se lo distingue asi, y no por radio, para no tener que dejar
    // afuera tambien al circulo central y a los arcos de esquina, que si son
    // lineas de la cancha.
    function _hbxArcCenteredOnPlayer(x, y) {
        var ds = window._hbxFrameDiscs;
        if (!ds || !ds.length) return false;
        for (var i = 0; i < ds.length; i++) {
            if (!ds[i].isBall && Math.abs(ds[i].x - x) < 6 && Math.abs(ds[i].y - y) < 6) return true;
        }
        return false;
    }

    var origStroke = CanvasRenderingContext2D.prototype.stroke;
    CanvasRenderingContext2D.prototype.stroke = function() {
        var _hbxStrokeIsDisc = (_hbxArcPendingFill && lastArc.r > 0 && lastArc.r <= 22) ||
                               _hbxArcCenteredOnPlayer(lastArc.x, lastArc.y);
        if (_hbxStrokeIsDisc && window.customFieldLineEnabled) D.discStrokesSkipped++;
        if (window.customFieldLineEnabled && !_hbxStrokeIsDisc && _pathHasPts && lastPathBounds && typeof this.strokeStyle === 'string') {
            var lrS = lastPathBounds;
            var prS = window._hbxPitchRect;
            if (prS && _hbxIsFieldLineStroke(lrS, prS)) {
                if (window._hbxFieldBgDebug) {
                    try { console.log('[HaxBion linea] stroke solido "' + this.strokeStyle + '" dentro de la cancha, bounds', lrS); } catch (e) {}
                }
                D.lineStrokes++; D.lastStrokeColor = String(this.strokeStyle);
                if (window.customFieldLineTransparent) {
                    return;
                }
                this.strokeStyle = window.customFieldLineColor || '#ffffff';
            }
        }
        return arguments.length ? origStroke.apply(this, arguments) : origStroke.call(this);
    };

    function _hbxIsFieldLineStroke(lr, pr) {
        if (!(lr.x >= pr.x - 10 && lr.y >= pr.y - 10 && (lr.x + lr.w) <= pr.x + pr.w + 10 && (lr.y + lr.h) <= pr.y + pr.h + 10)) return false;

        // Umbral bajo a proposito: los arcos de las esquinas son chicos y
        // tambien son "lineas de la cancha", asi que con un umbral alto
        // quedaban sin borrar al poner transparente.
        var longSide = Math.max(lr.w, lr.h);
        if (longSide < pr.h * 0.05) return false;

        var nearLeftEdge = Math.abs(lr.x - pr.x) < 30 || Math.abs((lr.x + lr.w) - pr.x) < 30;
        var nearRightEdge = Math.abs(lr.x - (pr.x + pr.w)) < 30 || Math.abs((lr.x + lr.w) - (pr.x + pr.w)) < 30;
        if ((nearLeftEdge || nearRightEdge) && longSide < pr.h * 0.25) return false;

        return true;
    }

    // Regex creada UNA sola vez. Antes estaba escrita como literal adentro de
    // la funcion, o sea que se evaluaba en cada llamada a fillText.
    var _hbxGoalRe = /GOL|GOAL/i;

    CanvasRenderingContext2D.prototype.fillText = function(text, x, y, maxWidth) {
        // Logica original de la foto en el avatar, sin cambios. Lo unico que
        // se conserva de la optimizacion es que el regex se crea una sola vez
        // (arriba) en vez de en cada llamada — eso no altera el resultado.
        var ctx = this;
        var w = ctx.canvas ? ctx.canvas.width : 0;
        var h = ctx.canvas ? ctx.canvas.height : 0;

        if (w > 512 || h > 512) {
            return origFillText.call(this, text, x, y, maxWidth);
        }

        var isGoalOrUI = !text || text.length > 4 || _hbxGoalRe.test(text);
        var targetText = (window.customAvatarTargetText || 'ME').trim();
        var isTargetAvatar = (text === targetText);
        // BUG REAL (arreglado): comparar solo la IDENTIDAD del canvas no
        // alcanza. El motor reutiliza el mismo canvas chico para dibujar el
        // avatar de TODOS los jugadores (lo limpia y lo vuelve a usar), asi
        // que la comparacion daba verdadera para cualquiera y la posicion
        // guardada terminaba siendo la del ultimo jugador dibujado, no la
        // mia. Ahora se marca 'lo que se acaba de dibujar es lo mio' y esa
        // marca la consume el composite inmediatamente siguiente.
        if (!isGoalOrUI) _hbxMineIsOnScratch = false;
        if (isTargetAvatar) {
            window._hbxMyAvatarCanvas = ctx.canvas; D.avatarCanvasSet++;
            _hbxMineIsOnScratch = true;
            if (window._hbxAvatarDebug) {
                try { console.log('[HaxBion avatar] fillText matcheo mi tag "' + text + '", canvas ' + w + 'x' + h + ' guardado como _hbxMyAvatarCanvas.'); } catch (e) {}
            }
        }

        if (!isGoalOrUI && window.customAvatarImg && window.customAvatarImg.complete && (isTargetAvatar || window.customAvatarMatchAll)) {
            var size = Math.min(w, h) * (window.customAvatarScale || 1.0);
            var cx = w / 2;
            var cy = h / 2;
            var r = Math.min(w, h) / 2;
            var ratio = r / 35;
            var finalOffX = (window.customAvatarOffsetX || 0) * ratio;
            var finalOffY = (window.customAvatarOffsetY || 0) * ratio;

            ctx.clearRect(0, 0, w, h);
            ctx.save();
            ctx.beginPath();
            origArc.call(ctx, cx, cy, r, 0, 2 * Math.PI);
            ctx.clip();
            ctx.drawImage(window.customAvatarImg, cx - size/2 + finalOffX, cy - size/2 + finalOffY, size, size);
            ctx.restore();
            return;
        }
        var videoEl = window.customAvatarVideoEl;
        var videoReady = videoEl && (videoEl.tagName === 'VIDEO' ? videoEl.readyState >= 2 : videoEl.complete);
        if (!isGoalOrUI && window.customAvatarVideoEnabled && videoReady && (isTargetAvatar || window.customAvatarMatchAll)) {
            var sizeV = Math.min(w, h) * (window.customAvatarScale || 1.0);
            var cxV = w / 2;
            var cyV = h / 2;
            var rV = Math.min(w, h) / 2;
            var ratioV = rV / 35;
            var finalOffXV = (window.customAvatarOffsetX || 0) * ratioV;
            var finalOffYV = (window.customAvatarOffsetY || 0) * ratioV;

            ctx.clearRect(0, 0, w, h);
            ctx.save();
            ctx.beginPath();
            origArc.call(ctx, cxV, cyV, rV, 0, 2 * Math.PI);
            ctx.clip();
            ctx.drawImage(videoEl, cxV - sizeV/2 + finalOffXV, cyV - sizeV/2 + finalOffYV, sizeV, sizeV);
            ctx.restore();
            return;
        }
        return origFillText.call(this, text, x, y, maxWidth);
    };

    // Fondo de cancha personalizado (textura en vez de color solido).
    window.customFieldBgData = localStorage.getItem('hbx_custom_field_bg_data') || null;
    window.customFieldBgEnabled = localStorage.getItem('hbx_custom_field_bg_enabled') === '1';
    window.customFieldBgImg = null;
    if (window.customFieldBgData) {
        window.customFieldBgImg = new Image();
        window.customFieldBgImg.src = window.customFieldBgData;
    }
    window.setCustomFieldBg = function(dataUrl, enabled) {
        if (dataUrl !== undefined) {
            if (dataUrl) {
                localStorage.setItem('hbx_custom_field_bg_data', dataUrl);
                var img = new Image();
                img.src = dataUrl;
                window.customFieldBgImg = img;
            } else {
                localStorage.removeItem('hbx_custom_field_bg_data');
                window.customFieldBgImg = null;
            }
        }
        if (enabled !== undefined) {
            localStorage.setItem('hbx_custom_field_bg_enabled', enabled ? '1' : '0');
            window.customFieldBgEnabled = !!enabled;
        }
    };

    // Fondo de cancha en color solido, alternativa a la textura de arriba.
    // Mutuamente excluyente con ella (la UI se encarga de apagar una al
    // prender la otra), por eso el hook de fill()/drawImage revisa primero
    // customFieldBgColorEnabled.
    window.customFieldBgColor = localStorage.getItem('hbx_custom_field_bg_color') || '#1a8a3d';
    window.customFieldBgColorEnabled = localStorage.getItem('hbx_custom_field_bg_color_enabled') === '1';
    window.setCustomFieldBgColor = function(color, enabled) {
        if (color !== undefined) {
            localStorage.setItem('hbx_custom_field_bg_color', color);
            window.customFieldBgColor = color;
        }
        if (enabled !== undefined) {
            localStorage.setItem('hbx_custom_field_bg_color_enabled', enabled ? '1' : '0');
            window.customFieldBgColorEnabled = !!enabled;
        }
    };

    // Color de las lineas de la cancha, o transparente para ocultarlas.
    window.customFieldLineColor = localStorage.getItem('hbx_custom_field_line_color') || '#ffffff';
    window.customFieldLineEnabled = localStorage.getItem('hbx_custom_field_line_enabled') === '1';
    window.customFieldLineTransparent = localStorage.getItem('hbx_custom_field_line_transparent') === '1';
    window.setCustomFieldLine = function(color, enabled, transparent) {
        if (color !== undefined) {
            localStorage.setItem('hbx_custom_field_line_color', color);
            window.customFieldLineColor = color;
        }
        if (enabled !== undefined) {
            localStorage.setItem('hbx_custom_field_line_enabled', enabled ? '1' : '0');
            window.customFieldLineEnabled = !!enabled;
        }
        if (transparent !== undefined) {
            localStorage.setItem('hbx_custom_field_line_transparent', transparent ? '1' : '0');
            window.customFieldLineTransparent = !!transparent;
        }
    };

    // El campo se pinta con drawImage() (una textura pre-renderizada que se
    // blitea entera cada frame), NO con fillRect(). Confirmado con un
    // diagnostico en vivo (28/8): en una sala real, en 3 segundos, el canvas
    // grande tuvo fillRect=0, fill=902, drawImage=2255. Los intentos previos
    // (documentados abajo, todos fallaron) asumian fillRect por un
    // comentario viejo que ya no aplica a esta version del motor.
    //
    // INTENTOS ANTERIORES CON fillRect (todos descartados): filtrar por
    // porcentaje del canvas, filtrar por "el segundo rect grande del
    // frame". Nunca podian funcionar porque fillRect no se llama nunca con
    // un tamaño grande en este motor.
    //
    // Enfoque actual: mismo criterio de "contiene a los jugadores" que se
    // uso para fillRect, pero aplicado a los argumentos de DESTINO de
    // drawImage (donde se dibuja en el canvas, no de donde se recorta la
    // imagen origen). drawImage tiene 3 formas distintas de llamarse segun
    // cuantos argumentos recibe; se cubren las 3.
    var origDrawImage = CanvasRenderingContext2D.prototype.drawImage;
    var _hbxFieldBgAppliedThisFrame = false;
    window._hbxPitchDetectedThisFrame = false;
    var _hbxLargeDrawCount = 0;
    window._hbxPitchRect = null;
    // GIF/VIDEO ANIMADO Y AURA, PINTADOS SOBRE EL CANVAS DEL AVATAR.
    //
    // El motor dibuja el avatar UNA vez en un canvas chico y despues
    // reutiliza ese mismo canvas en cada frame sin volver a dibujarlo (por
    // eso el gif quedaba congelado en el cuadro que le toco al armarse el
    // cache, y por eso tampoco se podia seguir la posicion del jugador).
    //
    // En vez de pelear con ese cache, se le escribe encima: como el objeto
    // canvas es el mismo que el motor sigue mostrando, actualizar sus
    // pixeles alcanza para que se vea el cambio, sin importar COMO lo
    // componga (drawImage, patron, lo que sea).
    function _hbxPaintOnAvatarCanvas() {
        var cv = window._hbxMyAvatarCanvas;
        if (!cv || !cv.width || !cv.height) return;

        var vEl = window.customAvatarVideoEl;
        var mediaReady = vEl && (vEl.tagName === 'VIDEO'
            ? vEl.readyState >= 2
            : (vEl.complete && vEl.naturalWidth > 0));
        var drawMedia = !!(window.customAvatarVideoEnabled && mediaReady);
        var drawGlow = !!window.trailPlayerEnabled;
        if (!drawMedia && !drawGlow) return;

        var ctx;
        try { ctx = cv.getContext('2d'); } catch (e) { return; }
        if (!ctx) return;

        var w = cv.width, h = cv.height;
        var cx = w / 2, cy = h / 2;
        var r = Math.min(w, h) / 2;

        try {
            if (drawMedia) {
                var scale = window.customAvatarScale || 1.0;
                var ratio = r / 35;
                var offX = (window.customAvatarOffsetX || 0) * ratio;
                var offY = (window.customAvatarOffsetY || 0) * ratio;
                var size = Math.min(w, h) * scale;
                ctx.clearRect(0, 0, w, h);
                ctx.save();
                origBeginPath.call(ctx);
                origArc.call(ctx, cx, cy, r, 0, Math.PI * 2);
                ctx.clip();
                origDrawImage.call(ctx, vEl, cx - size / 2 + offX, cy - size / 2 + offY, size, size);
                ctx.restore();
                D.videoDrawn++;
            }

            if (drawGlow) {
                // Aro luminoso pegado al borde del disco. Va sobre este
                // mismo canvas, asi que acompaña al jugador solo, sin
                // necesitar saber en que parte de la cancha esta.
                var color = window.trailPlayerColor || '#22d3ee';
                ctx.save();
                // 'lighter' SOLO cuando el canvas se limpio recien (caso
                // gif/video). Sin limpiar, el modo aditivo se suma sobre lo
                // ya pintado en cada frame y el aro termina volviendose
                // blanco a los pocos segundos.
                if (drawMedia) ctx.globalCompositeOperation = 'lighter';
                origBeginPath.call(ctx);
                origArc.call(ctx, cx, cy, Math.max(1, r - 2), 0, Math.PI * 2);
                ctx.strokeStyle = color;
                ctx.lineWidth = Math.max(2, r * 0.18);
                ctx.globalAlpha = 0.85;
                ctx.shadowColor = color;
                ctx.shadowBlur = r * 0.9;
                origStroke.call(ctx);
                ctx.restore();
                D.glowDrawn++;
            }
        } catch (e) {}
    }
    window._hbxPaintAvatar = _hbxPaintOnAvatarCanvas;

    (function _hbxFieldBgFrameTick() {
        _hbxFieldBgAppliedThisFrame = false;
        window._hbxPitchDetectedThisFrame = false;
        _hbxLargeDrawCount = 0;
        // Publica los discos acumulados del frame que acaba de terminar y
        // arranca un buffer nuevo para el que viene. La deteccion de la
        // cancha de aca abajo lee window._hbxFrameDiscs, nunca el buffer en
        // construccion.
        window._hbxFrameDiscs = _hbxFrameDiscsBuf;
        _hbxFrameDiscsBuf = [];
        // La posicion solo se limpia cuando llego una nueva. El motor
        // CACHEA el avatar: no vuelve a componerlo en cada frame, asi que
        // borrarla cada vez la dejaba en null casi siempre y la estela no
        // se dibujaba nunca.
        if (_hbxMyPosPending) {
            window._hbxMyPos = _hbxMyPosPending;
            _hbxMyPosPending = null;
        } else {
            // Sin dato del avatar: se deduce cual disco es el nuestro por la
            // camara. El juego centra la vista en tu jugador, asi que de
            // todos los discos de jugador el tuyo es el que quedo mas cerca
            // del centro de la pantalla. Se exige que este razonablemente
            // cerca (25% del ancho) para no elegir a otro cuando la camara
            // topa contra el borde de la cancha.
            var _ds = window._hbxFrameDiscs;
            if (_ds && _ds.length) {
                var _best = null, _bestD = Infinity;
                for (var _i = 0; _i < _ds.length; _i++) {
                    var _d = _ds[_i];
                    if (_d.isBall || _d.sx === null || _d.sx === undefined || !_d.cw) continue;
                    var _ex = _d.sx - _d.cw / 2, _ey = _d.sy - _d.ch / 2;
                    var _dist = Math.sqrt(_ex * _ex + _ey * _ey);
                    if (_dist < _bestD) { _bestD = _dist; _best = _d; }
                }
                if (_best && _bestD < _best.cw * 0.25) {
                    window._hbxMyPos = { x: _best.x, y: _best.y, r: _best.r };
                }
            }
        }

        _hbxPaintOnAvatarCanvas();
        (window._hbxRafUnthrottled || requestAnimationFrame)(_hbxFieldBgFrameTick);
    })();

    CanvasRenderingContext2D.prototype.drawImage = function(img, a1, a2, a3, a4, a5, a6, a7, a8) {
        if (img === window._hbxMyAvatarCanvas && _hbxMineIsOnScratch) {
            _hbxMineIsOnScratch = false;
            var _mdx, _mdy, _mdw, _mdh;
            if (arguments.length >= 9) { _mdx = a5; _mdy = a6; _mdw = a7; _mdh = a8; }
            else if (arguments.length >= 5) { _mdx = a1; _mdy = a2; _mdw = a3; _mdh = a4; }
            else { _mdx = a1; _mdy = a2; _mdw = img.width || 0; _mdh = img.height || 0; }
            _hbxMyPosPending = { x: _mdx + _mdw / 2, y: _mdy + _mdh / 2, r: Math.min(_mdw, _mdh) / 2 }; D.avatarComposites++;
            if (window._hbxAvatarDebug) {
                try { console.log('[HaxBion avatar] drawImage compuso mi canvas de avatar en (' + _hbxMyPosPending.x.toFixed(1) + ', ' + _hbxMyPosPending.y.toFixed(1) + ') sobre canvas ' + (this.canvas ? this.canvas.width + 'x' + this.canvas.height : '?')); } catch (e) {}
            }

            // VIDEO/GIF EN EL AVATAR — se dibuja ACA, no en fillText.
            //
            // Por que aca: el motor dibuja el circulito del avatar UNA vez
            // en un canvas chico y despues lo CACHEA; ese canvas cacheado
            // es el que se pega en la cancha en cada frame. Por eso un gif
            // puesto desde fillText no se movia nunca (se decodificaba un
            // solo frame, el del momento en que se armo el cache) y hacia
            // falta el truco de reenviar /avatar para verlo cambiar.
            //
            // Interceptando el momento en que ese canvas cacheado se pega
            // sobre la cancha, se puede pisar con el frame ACTUAL del
            // video/gif. Eso corre en cada frame dibujado, asi que la
            // animacion se ve fluida y sin depender de ningun refresco
            // forzado ni de comandos de chat.
            var _vEl = window.customAvatarVideoEl;
            var _vReady = _vEl && (_vEl.tagName === 'VIDEO' ? _vEl.readyState >= 2 : (_vEl.complete && _vEl.naturalWidth > 0));
            if (window.customAvatarVideoEnabled && _vReady && _mdw > 0 && _mdh > 0) {
                try {
                    var _vr = Math.min(_mdw, _mdh) / 2;
                    var _vcx = _mdx + _mdw / 2;
                    var _vcy = _mdy + _mdh / 2;
                    var _vsize = Math.min(_mdw, _mdh) * (window.customAvatarScale || 1.0);
                    var _vratio = _vr / 35;
                    var _voffX = (window.customAvatarOffsetX || 0) * _vratio;
                    var _voffY = (window.customAvatarOffsetY || 0) * _vratio;
                    this.save();
                    origBeginPath.call(this);
                    origArc.call(this, _vcx, _vcy, _vr, 0, Math.PI * 2);
                    this.clip();
                    origDrawImage.call(this, _vEl, _vcx - _vsize / 2 + _voffX, _vcy - _vsize / 2 + _voffY, _vsize, _vsize);
                    D.videoDrawn++;
                    this.restore();
                    return;
                } catch (e) {}
            }
        } else if (window._hbxAvatarDebug && window._hbxMyAvatarCanvas && img && img.tagName === 'CANVAS') {
            try { console.log('[HaxBion avatar] drawImage con OTRO canvas (no matchea _hbxMyAvatarCanvas), tamaño ' + img.width + 'x' + img.height); } catch (e) {}
        }
        var cw = this.canvas ? this.canvas.width : 0;
        // Salida rapida ANTES de calcular nada mas: drawImage se llama
        // muchas veces por frame (fotos de avatar/pelota, iconos chicos,
        // etc), la gran mayoria en canvases chicos que nunca van a ser la
        // cancha. Evita todo el trabajo de abajo para esos casos, que es el
        // camino mas transitado.
        if (cw <= 200) {
            return origDrawImage.apply(this, arguments);
        }

        var ch = this.canvas.height;
        var dx, dy, dw, dh;
        if (arguments.length >= 9) { dx = a5; dy = a6; dw = a7; dh = a8; }
        else if (arguments.length >= 5) { dx = a1; dy = a2; dw = a3; dh = a4; }
        else { dx = a1; dy = a2; dw = (img && (img.naturalWidth || img.width)) || 0; dh = (img && (img.naturalHeight || img.height)) || 0; }

        var isLarge = dw >= cw * 0.15 && dh >= ch * 0.15;
        if (!isLarge) {
            return origDrawImage.apply(this, arguments);
        }

        var isFullCanvas = dx <= cw * 0.01 && dy <= ch * 0.01 && dw >= cw * 0.98 && dh >= ch * 0.98;
        var isPitchCandidate = !isFullCanvas;
        _hbxLargeDrawCount++;

        var containsDiscs = true;
        if (isPitchCandidate) {
            var discs = window._hbxFrameDiscs;
            if (discs && discs.length) {
                var margin = Math.max(4, dw * 0.06, dh * 0.06);
                var outliers = 0;
                for (var i = 0; i < discs.length; i++) {
                    var d = discs[i];
                    if (d.x < dx - margin || d.x > dx + dw + margin || d.y < dy - margin || d.y > dy + dh + margin) {
                        outliers++;
                    }
                }
                containsDiscs = outliers <= Math.max(1, Math.floor(discs.length * 0.15));
            }
        }

        var cachedRect = window._hbxPitchRect;
        var matchesCached = isPitchCandidate && !!cachedRect && Math.abs(dx - cachedRect.x) < 3 && Math.abs(dy - cachedRect.y) < 3 && Math.abs(dw - cachedRect.w) < 3 && Math.abs(dh - cachedRect.h) < 3;

        if (window._hbxFieldBgDebug) {
            try {
                console.log('[HaxBion fieldbg] drawImage candidato #' + _hbxLargeDrawCount, {
                    dx: dx, dy: dy, dw: dw, dh: dh, cw: cw, ch: ch,
                    isFullCanvas: isFullCanvas, contieneDiscos: isPitchCandidate ? containsDiscs : 'n/a (es el fondo exterior)', matchesCached: matchesCached
                });
            } catch (e) {}
        }

        if (isPitchCandidate && (containsDiscs || matchesCached)) {
            window._hbxPitchRect = { x: dx, y: dy, w: dw, h: dh };
            if (window.customFieldBgColorEnabled) {
                _hbxFieldBgAppliedThisFrame = true; D.bgApplied++;
                this.save();
                this.fillStyle = window.customFieldBgColor || '#1a8a3d';
                this.fillRect(dx, dy, dw, dh);
                this.restore();
                return;
            }
            if (window.customFieldBgEnabled && window.customFieldBgImg &&
                window.customFieldBgImg.complete && window.customFieldBgImg.naturalWidth > 0) {
                _hbxFieldBgAppliedThisFrame = true; D.bgApplied++;
                var repl = window.customFieldBgImg;
                var ir = repl.naturalWidth / repl.naturalHeight;
                var dr = dw / dh;
                var sx, sy, sw, sh;
                if (ir > dr) {
                    sh = repl.naturalHeight;
                    sw = sh * dr;
                    sx = (repl.naturalWidth - sw) / 2;
                    sy = 0;
                } else {
                    sw = repl.naturalWidth;
                    sh = sw / dr;
                    sx = 0;
                    sy = (repl.naturalHeight - sh) / 2;
                }
                // origDrawImage, NUNCA this.drawImage: this.drawImage sigue
                // apuntando a ESTA MISMA funcion, llamarla recursaria.
                origDrawImage.call(this, repl, sx, sy, sw, sh, dx, dy, dw, dh);
                if (window._hbxFieldBgDebug) {
                    this.save();
                    this.lineWidth = 4;
                    this.strokeStyle = '#ff00ff';
                    this.strokeRect(dx + 2, dy + 2, dw - 4, dh - 4);
                    this.restore();
                }
                return;
            }
        }

        var __hbxResult = origDrawImage.apply(this, arguments);

        if (window._hbxFieldBgDebug) {
            this.save();
            this.lineWidth = 3;
            this.strokeStyle = isFullCanvas ? '#3388ff' : (containsDiscs ? '#00ff00' : '#ff8800');
            this.strokeRect(dx + 2, dy + 2, Math.max(0, dw - 4), Math.max(0, dh - 4));
            this.font = 'bold 20px monospace';
            this.fillStyle = '#ffffff';
            this.strokeStyle = '#000000';
            this.lineWidth = 3;
            var label = '#' + _hbxLargeDrawCount + (isFullCanvas ? ' fondo ext.' : (containsDiscs ? ' CONTIENE jugadores' : ' sin jugadores'));
            this.strokeText(label, dx + 10, dy + 26);
            this.fillText(label, dx + 10, dy + 26);
            this.restore();
        }

        return __hbxResult;
    };
})();
`;
    (document.head || document.documentElement).appendChild(hookScript);

    function preventTranslation() {
        const meta = document.createElement('meta');
        meta.name = 'google';
        meta.content = 'notranslate';
        document.head.appendChild(meta);
        document.documentElement.setAttribute('lang', 'es');
        document.documentElement.classList.add('notranslate');
        document.body.translate = false;
    }

    function injectScript(fileName) {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            const isChrome = typeof chrome !== 'undefined' && chrome.runtime?.getURL;
            const fullUrl = isChrome ? chrome.runtime.getURL(fileName) : fileName;

            script.src = fullUrl;
            script.async = false;

            if (fileName === 'extensions/intro.js' && isChrome) {
                script.dataset.videoUrl = chrome.runtime.getURL('extensions/intro.mp4');
            }

            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            (document.head || document.documentElement).appendChild(script);
        });
    }

    function injectParallel(paths) {
        return Promise.all(paths.map(p => injectScript(p)));
    }

    async function initializeApp() {
        preventTranslation();

        window.Modernizr = {
            canvas: true,
            datachannel: true,
            dataview: true,
            es6collections: true,
            peerconnection: true,
            promises: true,
            websockets: true
        };
        await injectScript('extensions/buildflag.js');
        await injectScript('extensions/core.js');
        await injectScript('extensions/security.js');

        // keysystem.js va PRIMERO (antes se cargaba en la ultima tanda,
        // detras de ~28 archivos, y por eso la pantalla de la key tardaba
        // una eternidad en aparecer). No depende de Injector ni de ninguna
        // otra extension, asi que puede arrancar apenas esta core.js y
        // empezar a validar contra Firebase mientras el resto sigue
        // cargando en paralelo. Es lo que levanta el porton de arranque.
        await injectScript('extensions/keysystem.js');

        await injectParallel([
            'extensions/styles.js',
            'extensions/themes.js',
            'extensions/translate.js',
            'extensions/background.js',
            'extensions/fluidui.js',
            'extensions/perfopts.js',
        ]);

        await injectParallel([
            'extensions/header.js',
            'extensions/settings.js',
            'extensions/tweaks.js',
        ]);

        await injectParallel([
            'extensions/stretched.js',
            'extensions/hideui.js',
            'extensions/welcome.js',
            'extensions/auto_join.js',
            'extensions/chatlinks.js',
            'extensions/geo.js',
            'extensions/commands.js',
            'extensions/quickavatar.js',
            'extensions/fieldbg.js',
            'extensions/keyindicator.js',
            'extensions/stadiumpresets.js',
            'extensions/scoreboard.js',
            'extensions/hosttoken.js',
            'extensions/camisetas.js',
            'extensions/leaveroom.js',
            'extensions/shortcuts.js',
            'extensions/recaptcha-block.js',
            'extensions/ads.js',
            'extensions/inputboost.js',
            'extensions/roomlist.js',
            'extensions/missions.js',
            'extensions/discord.js',
        ]);
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initializeApp();
    } else {
        window.addEventListener('DOMContentLoaded', initializeApp);
    }
})();
