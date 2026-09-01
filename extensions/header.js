(function () {
    const HEADER_HEIGHT = 52;

    // ---- Sistema de actualizacion ----
    // Subi este numero cada vez que empaquetes una version nueva del cliente.
    // Importante: cuando lo subas, actualiza tambien VERSION en welcome.js
    // (mismo numero) para que se muestre el popup de novedades correcto.
    const APP_VERSION = '3.0';
    // Mismo proyecto Firebase que usa keysystem.js. Se lee el nodo /appUpdate,
    // que debe tener la forma: { "version": "1.1.0", "url": "https://tu-link-de-descarga" }
    const UPDATE_FIREBASE_URL = 'https://key-sistem-2875a-default-rtdb.firebaseio.com';

    function compareVersions(a, b) {
        const pa = String(a).split('.').map(n => parseInt(n, 10) || 0);
        const pb = String(b).split('.').map(n => parseInt(n, 10) || 0);
        for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
            const na = pa[i] || 0, nb = pb[i] || 0;
            if (na > nb) return 1;
            if (na < nb) return -1;
        }
        return 0;
    }

    const onF2 = (e) => {
        if (e.key !== 'F2') return;
        e.preventDefault();
        e.stopImmediatePropagation();
        if (Injector.isMainFrame()) {
            window.dispatchEvent(new CustomEvent('toggle-ult-ui'));
        } else {
            try { window.top.dispatchEvent(new CustomEvent('toggle-ult-ui')); } catch (_) {
                window.parent.postMessage({ action: 'FORCE_TOGGLE_UI' }, '*');
            }
        }
    };
    window.addEventListener('keydown', onF2, true);

    if (Injector.isMainFrame()) {
        window.addEventListener('message', (e) => {
            if (e.data?.action === 'FORCE_TOGGLE_UI')
                window.dispatchEvent(new CustomEvent('toggle-ult-ui'));
        });
    }

    if (!Injector.isMainFrame()) return;
    if (window.__headerInjected) return;
    window.__headerInjected = true;

    // Abre un link afuera de Iron. Usa el helper compartido de keysystem.js
    // (que habla con el bridge local y, si no puede abrir ningun navegador,
    // muestra el link para copiar). Se busca en el momento del click, no al
    // cargar, porque keysystem.js se inyecta despues que este archivo.
    //
    // Importante: NO se usa window.open como respaldo. interceptor.js cierra
    // al instante cualquier pestaña nueva que no sea la principal, asi que
    // abrir una pestaña dentro de Iron no funciona: se abre y se cierra sola,
    // y desde afuera parece que el boton no hace nada.
    function hbxOpenLink(url) {
        if (window._hbxOpenExternal) {
            window._hbxOpenExternal(url);
            return;
        }
        if (window.showToast) {
            window.showToast('No se pudo abrir el link. Copialo a mano: ' + url, 'error', 9000);
        }
    }

    // Color fijo (no sigue el acento del tema) para que el logo no cambie de color solo.
    const HX_LOGO_SVG = `<svg id="logo-hx" viewBox="0 0 240 40" width="120" height="20"
         xmlns="http://www.w3.org/2000/svg"
         style="cursor:pointer; overflow:visible; display:block; filter:drop-shadow(0 0 7px color-mix(in srgb, var(--local-accent) 55%, transparent));">
        <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="#f4f6f8" font-family="Outfit, sans-serif" font-weight="700" font-size="28" letter-spacing="8">H Λ X B I O N</text>
    </svg>`;

    const DISCORD_SVG = `<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.419-2.157 2.419z"/></svg>`;
    const GITHUB_SVG  = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>`;
    const CHEVRON_UP   = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 15l-6-6-6 6"/></svg>`;
    const CHEVRON_DOWN = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>`;
    const UPDATE_SVG   = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16"/></svg>`;
    const TROPHY_SVG   = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z"/><path d="M17 5h2.5a1 1 0 0 1 1 1.2c-.4 2-1.8 3.6-3.8 4.1M7 5H4.5a1 1 0 0 0-1 1.2c.4 2 1.8 3.6 3.8 4.1"/></svg>`;
    const INFO_SVG     = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;

    const CSS = `
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Outfit:wght@300;500;700&display=swap');
        :root { --hbx-h: ${HEADER_HEIGHT}px; --hbx-ease: cubic-bezier(0.22,1,0.36,1); }
        #ult-header {
            position: fixed; top: 0; left: 0; right: 0;
            height: var(--hbx-h);
            display: grid; grid-template-columns: 1fr 2fr 1fr;
            align-items: center; padding: 0 24px;
            z-index: 999999; font-family: 'Outfit', sans-serif; user-select: none;
            background: var(--theme-bg-primary, #08080a);
            /* backdrop-filter: blur(28px) removido a proposito. El fondo del
               header es OPACO, asi que el desenfoque no se veia — pero el
               navegador igual tenia que recomponer esa capa en cada frame,
               permanentemente, mientras jugabas. Era costo puro sin beneficio. */
            border-bottom: 1px solid var(--theme-border, rgba(255,255,255,0.06));
            box-shadow: 0 4px 32px -4px color-mix(in srgb, var(--local-accent,#a78bfa) 8%, transparent);
            will-change: transform, opacity; contain: layout style;
            transition: transform .42s var(--hbx-ease), opacity .42s var(--hbx-ease);
            --local-accent: var(--theme-accent, var(--theme-text-secondary, #a78bfa));
        }
        #ult-header.hidden { transform: translateY(-100%); opacity: 0; pointer-events: none; }
        .hdr-left { display:flex; align-items:center; }
        #logo-hx-wrap { display:flex; align-items:center; text-decoration:none; cursor:pointer; transition:transform .25s var(--hbx-ease), filter .25s ease; }
        #logo-hx-wrap:hover { transform:translateY(-2px); filter:drop-shadow(0 0 10px var(--local-accent)); }
        .hdr-center { display:flex; justify-content:center; }
        .input-wrap { width:100%; max-width:420px; position:relative; }
        #room-input {
            width:100%; box-sizing:border-box;
            background: color-mix(in srgb, var(--theme-text-primary,#fff) 3%, transparent);
            border: 1px solid color-mix(in srgb, var(--local-accent) 20%, transparent);
            border-radius:7px; padding:8px 16px;
            color:var(--theme-text-primary,#e8e8e8);
            font-family:'DM Mono',monospace; font-size:10px; letter-spacing:2.2px;
            text-transform:uppercase; text-align:center; outline:none;
            transition:border-color .25s ease, background .25s ease, box-shadow .25s ease;
        }
        #room-input::placeholder { color:color-mix(in srgb,var(--theme-text-secondary,#fff) 30%,transparent); }
        #room-input:focus {
            border-color:var(--local-accent);
            background:color-mix(in srgb,var(--local-accent) 6%,transparent);
            box-shadow:0 0 0 3px color-mix(in srgb,var(--local-accent) 14%,transparent);
        }
        .hdr-right { display:flex; justify-content:flex-end; align-items:center; gap:4px; }
        .action-btn {
            background:none; border:none; cursor:pointer; padding:7px; border-radius:6px;
            color:color-mix(in srgb,var(--theme-text-secondary,#fff) 45%,transparent);
            display:flex; align-items:center; justify-content:center;
            transition:color .2s ease, background .2s ease, transform .2s var(--hbx-ease), filter .2s ease;
        }
        .action-btn:hover { color:var(--theme-text-primary,#fff); background:color-mix(in srgb,var(--local-accent) 10%,transparent); transform:translateY(-2px); filter:drop-shadow(0 0 6px var(--local-accent)); }
        .action-btn:active { transform:translateY(0); }
        #btn-discord:hover { color:#5865F2; background:rgba(88,101,242,0.12); filter:drop-shadow(0 0 6px rgba(88,101,242,0.6)); }
        #lang-btn { min-width:44px; font-family:'DM Mono',monospace; font-size:10px; letter-spacing:1px; }
        /* Boton de actualizar: estado normal discreto (mismo look que el resto
           de los iconos del header) para no gritar cuando no hay nada nuevo. */
        #btn-update-app {
            background:rgba(255,255,255,0.06); color:var(--theme-text-secondary,#8b8b96);
            border:1px solid rgba(255,255,255,0.10);
            border-radius:6px; padding:6px 9px; gap:6px;
            font-family:'DM Mono',monospace; font-size:10px; letter-spacing:1px; text-transform:uppercase;
        }
        #btn-update-app:hover {
            background:rgba(255,255,255,0.12); color:var(--theme-text-primary,#f2f2f5);
            border-color:rgba(255,255,255,0.28); filter:none;
        }
        #btn-update-app .upd-dot {
            width:6px; height:6px; border-radius:50%; background:currentColor; display:none; flex:none;
        }
        /* Con actualizacion disponible: se vuelve solido y claro, PERO fijo.
           Antes tenia dos animaciones infinitas (pulso + ping) que parpadeaban
           feo y ademas repintaban sin parar. Ahora el aviso es solo contraste. */
        #btn-update-app.has-update {
            background:linear-gradient(135deg,#ffffff,#c8c8d2);
            color:#08080a; border-color:rgba(255,255,255,0.9);
        }
        #btn-update-app.has-update:hover {
            background:#ffffff; color:#08080a;
        }
        #btn-update-app.has-update .upd-dot { display:block; }
        #btn-close-ui { position:relative; }
        #btn-close-ui::after { content:'F2'; position:absolute; bottom:-1px; right:-1px; font-family:'DM Mono',monospace; font-size:7px; font-weight:500; color:color-mix(in srgb,var(--local-accent) 65%,transparent); }
        #trigger-pill {
            position:fixed; top:0; left:50%;
            transform:translateX(-50%) translateY(-100%);
            display:flex; align-items:center; gap:5px;
            padding:5px 14px 5px 12px;
            background:color-mix(in srgb,var(--theme-bg-primary,#08080c) 88%,transparent);
            backdrop-filter:blur(16px);
            border:1px solid color-mix(in srgb,var(--local-accent,#a78bfa) 18%,transparent);
            border-top:none; border-radius:0 0 10px 10px;
            cursor:pointer; z-index:999998;
            color:color-mix(in srgb,var(--theme-text-secondary,#fff) 40%,transparent);
            font-family:'DM Mono',monospace; font-size:9px; letter-spacing:1.5px; text-transform:uppercase;
            will-change:transform;
            transition:transform .36s var(--hbx-ease), background .2s ease, color .2s ease;
            --local-accent:var(--theme-accent,var(--theme-text-secondary,#a78bfa));
        }
        #trigger-pill.visible { transform:translateX(-50%) translateY(0%); }
        #trigger-pill:hover { background:color-mix(in srgb,var(--local-accent) 12%,var(--theme-bg-primary,#08080c)); color:var(--local-accent); }
        iframe { transition: top .42s var(--hbx-ease), height .42s var(--hbx-ease) !important; }
    `;

    function updateLayout(visible) {
        const h = visible ? HEADER_HEIGHT : 0;
        document.querySelectorAll('iframe').forEach(f => {
            f.style.setProperty('top',    `${h}px`,               'important');
            f.style.setProperty('height', `calc(100vh - ${h}px)`, 'important');
            f.style.setProperty('position', 'fixed',              'important');
        });
    }

    // syncTheme: usar CSS custom properties en vez de leer y re-aplicar cada vez
    // Solo se ejecuta cuando cambia la clase/style del documentElement
    let _lastAccent = '';
    function syncTheme() {
        const cs = getComputedStyle(document.documentElement);
        const accent = cs.getPropertyValue('--ac').trim()
            || cs.getPropertyValue('--theme-bg-selected').trim()
            || cs.getPropertyValue('--theme-text-secondary').trim();
        if (!accent || accent === _lastAccent) return;
        _lastAccent = accent;
        const header = document.getElementById('ult-header');
        const pill   = document.getElementById('trigger-pill');
        if (header) header.style.setProperty('--local-accent', accent);
        if (pill)   pill.style.setProperty('--local-accent', accent);
    }

    const LANG_KEY = 'haxball_language';

    function readLanguage() {
        try {
            const saved = localStorage.getItem(LANG_KEY);
            if (saved === 'en' || saved === 'es' || saved === 'pt') return saved;
        } catch (e) {}
        if (typeof window.__haxGetLanguage === 'function') {
            const current = window.__haxGetLanguage();
            if (current === 'en' || current === 'es' || current === 'pt') return current;
        }
        return 'en';
    }

    function writeLanguage(lang) {
        try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
        if (typeof window.__haxSetLanguage === 'function') window.__haxSetLanguage(lang);
    }

    function getNextLanguage(current) {
        const order = ['en', 'es', 'pt'];
        const idx = order.indexOf(current);
        return order[(idx + 1 + order.length) % order.length];
    }

    function getLanguageLabel(lang) {
        return (lang || 'en').toUpperCase();
    }

    function getHeaderStrings(lang) {
        const strings = {
            en: {
                roomPlaceholder: 'Paste the room link...',
                languageTitle: 'Language',
                logoTitle: 'Go to Haxball',
                hideTitle: 'Hide (F2)',
                updateTitle: 'Check for updates',
                updateAvailableTitle: 'New version available',
                upToDateToast: 'You already have the latest version.',
                updateAvailableToast: 'New version available: v'
            },
            es: {
                roomPlaceholder: 'Pega el link de la sala...',
                languageTitle: 'Idioma',
                logoTitle: 'Ir a Haxball',
                hideTitle: 'Ocultar (F2)',
                updateTitle: 'Buscar actualizaciones',
                updateAvailableTitle: 'Nueva version disponible',
                upToDateToast: 'Ya tenes la ultima version instalada.',
                updateAvailableToast: 'Nueva version disponible: v'
            },
            pt: {
                roomPlaceholder: 'Cole o link da sala...',
                languageTitle: 'Idioma',
                logoTitle: 'Ir para o Haxball',
                hideTitle: 'Esconder (F2)',
                updateTitle: 'Verificar atualizacoes',
                updateAvailableTitle: 'Nova versao disponivel',
                upToDateToast: 'Voce ja tem a versao mais recente.',
                updateAvailableToast: 'Nova versao disponivel: v'
            }
        };
        return strings[lang] || strings.en;
    }

    Injector.waitForElement('body').then(() => {
        Injector.injectCSS('ult-v18-prestige', CSS);

        const header = document.createElement('div');
        header.id = 'ult-header';
        header.innerHTML = `
            <div class="hdr-left">
                <div id="logo-hx-wrap" title="Go to Haxball" onclick="window.location.href='https://www.haxball.com/play'">
                    ${HX_LOGO_SVG}
                </div>
            </div>
            <div class="hdr-center">
                <div class="input-wrap">
                    <input type="text" id="room-input" placeholder="Paste the room link..." autocomplete="off" spellcheck="false">
                </div>
            </div>
            <div class="hdr-right">
                <button id="btn-welcome" class="action-btn" title="Novedades y Ayuda">${INFO_SVG}</button>
                <button id="btn-missions" class="action-btn" title="Misiones">${TROPHY_SVG}</button>
                <button id="btn-discord" class="action-btn" title="Unirse al Discord">${DISCORD_SVG}</button>
                <button id="btn-update-app" class="action-btn" title="Check for updates">${UPDATE_SVG}<span class="upd-dot"></span></button>
                <button id="lang-btn" class="action-btn" title="Language">EN</button>
                <button id="btn-close-ui" class="action-btn" title="Hide (F2)">${CHEVRON_UP}</button>
            </div>`;
        document.body.prepend(header);

        const trigger = document.createElement('div');
        trigger.id = 'trigger-pill';
        trigger.innerHTML = `${CHEVRON_DOWN}<span>F2</span>`;
        document.body.appendChild(trigger);

        let visible = true;
        const toggle = () => {
            visible = !visible;
            header.classList.toggle('hidden', !visible);
            trigger.classList.toggle('visible', !visible);
            updateLayout(visible);
        };

        document.getElementById('btn-close-ui').addEventListener('click', toggle);
        trigger.addEventListener('click', toggle);
        window.addEventListener('toggle-ult-ui', toggle);

        const langBtn = document.getElementById('lang-btn');
        const roomInput = document.getElementById('room-input');
        const logoWrap = document.getElementById('logo-hx-wrap');
        const closeBtn = document.getElementById('btn-close-ui');
        const updateBtn = document.getElementById('btn-update-app');

        let updateInfo = { available: false, url: '', version: '' };

        const applyHeaderLanguage = () => {
            const current = readLanguage();
            const strings = getHeaderStrings(current);
            roomInput.placeholder = strings.roomPlaceholder;
            langBtn.title = strings.languageTitle;
            logoWrap.title = strings.logoTitle;
            closeBtn.title = strings.hideTitle;
            langBtn.textContent = getLanguageLabel(current);
            updateBtn.title = updateInfo.available ? strings.updateAvailableTitle : strings.updateTitle;
        };

        // Devuelve una promesa para poder encadenar la comprobacion manual.
        function checkForUpdate() {
            return fetch(`${UPDATE_FIREBASE_URL}/appUpdate.json`)
                .then(res => res.json())
                .then(data => {
                    if (!data || !data.version) return false;
                    if (compareVersions(data.version, APP_VERSION) > 0) {
                        updateInfo = { available: true, url: data.url || '', version: data.version };
                        updateBtn.classList.add('has-update');
                        applyHeaderLanguage();
                        return true;
                    }
                    // Si ya estabamos al dia (o se publico una version igual),
                    // aseguramos que el boton vuelva a su estado discreto.
                    updateInfo = { available: false, url: '', version: '' };
                    updateBtn.classList.remove('has-update');
                    applyHeaderLanguage();
                    return false;
                })
                .catch(() => false);
        }

        // Al hacer click se comprueba EN EL MOMENTO en vez de contestar con el
        // ultimo dato cacheado (que podia estar viejo o ni haber llegado aun).
        // Se bloquea el boton mientras consulta para que no se pueda spamear.
        let checking = false;
        updateBtn.addEventListener('click', () => {
            if (checking) return;
            const strings = getHeaderStrings(readLanguage());

            if (updateInfo.available) {
                if (updateInfo.url) hbxOpenLink(updateInfo.url);
                window.showToast(strings.updateAvailableToast + updateInfo.version, 'info', 6000);
                return;
            }

            checking = true;
            updateBtn.style.opacity = '0.55';
            checkForUpdate().then(hasUpdate => {
                checking = false;
                updateBtn.style.opacity = '';
                if (hasUpdate) {
                    if (updateInfo.url) hbxOpenLink(updateInfo.url);
                    window.showToast(strings.updateAvailableToast + updateInfo.version, 'info', 6000);
                } else {
                    window.showToast(strings.upToDateToast, 'success', 3000);
                }
            });
        });

        // La comprobacion inicial se difiere a un momento libre del navegador.
        // Antes salia disparada durante la carga, peleando ancho de banda y
        // tiempo de CPU justo cuando la app esta arrancando.
        if (window.requestIdleCallback) {
            requestIdleCallback(() => checkForUpdate(), { timeout: 8000 });
        } else {
            setTimeout(checkForUpdate, 4000);
        }
        setInterval(checkForUpdate, 30 * 60 * 1000);

        const welcomeBtn = document.getElementById('btn-welcome');
        if (welcomeBtn) {
            welcomeBtn.addEventListener('click', () => {
                if (typeof window.__showWelcomePopup === 'function') {
                    window.__showWelcomePopup();
                }
                try {
                    for (let i = 0; i < window.frames.length; i++) {
                        try { window.frames[i].postMessage({ type: 'HBX_SHOW_WELCOME' }, '*'); } catch (e) {}
                    }
                } catch (e) {}
            });
        }

        const missionsBtn = document.getElementById('btn-missions');
        missionsBtn.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('toggle-missions-panel'));
        });

        const discordBtn = document.getElementById('btn-discord');
        discordBtn.addEventListener('click', () => {
            hbxOpenLink('https://discord.gg/w7BpFuFKr4');
        });

        const updateLangLabel = () => {
            applyHeaderLanguage();
        };
        langBtn.addEventListener('click', () => {
            const current = readLanguage();
            const next = getNextLanguage(current);
            writeLanguage(next);
            window.location.reload();
        });
        updateLangLabel();

        const input = roomInput;
        input.addEventListener('keydown', e => {
            e.stopPropagation();
            if (e.key !== 'Enter') return;
            const val = input.value.trim();
            if (!val) return;
            const cMatch  = val.match(/c=([a-zA-Z0-9_-]+)/);
            const pwMatch = val.match(/pw=([a-zA-Z0-9_-]+)/);
            if (cMatch) {
                let url = `https://www.haxball.com/play?c=${cMatch[1]}`;
                if (pwMatch) url += `&pw=${pwMatch[1]}`;
                window.location.href = url;
            } else if (val.startsWith('http')) {
                window.location.href = val;
            } else {
                window.location.href = `https://www.haxball.com/play?c=${val}`;
            }
        });

        // Observer con throttle para syncTheme — evita dispararse en cada micro-cambio
        let themeRaf = null;
        new MutationObserver(() => {
            if (themeRaf) return;
            themeRaf = requestAnimationFrame(() => { themeRaf = null; syncTheme(); });
        }).observe(document.documentElement, { attributes: true, attributeFilter: ['style', 'class', 'data-theme'] });

        window.addEventListener('hax-theme-change', syncTheme);
        syncTheme();
        updateLayout(true);
    });
})();
