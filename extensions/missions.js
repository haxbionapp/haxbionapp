(function () {
    if (window.__HAXBALL_MISSIONS_LOADED__) return;
    window.__HAXBALL_MISSIONS_LOADED__ = true;
    if (!Injector.isMainFrame()) return;

    const STORAGE_KEY = 'hbx_missions_data';
    const DISCORD_BASE_URL = 'https://haxbion-backend.onrender.com';

    // ---- Misiones sin Discord obligatorio (2026-08-03) ----
    // Las misiones son 100% locales y estan disponibles para cualquiera
    // desde que abre la app, sin vincular nada. Vincular Discord es
    // opcional (solo para tener el rango/rol en el servidor); cuando esta
    // vinculada, se manda un aviso de "misión cumplida" al backend (que es
    // el que tiene la URL del webhook — el cliente nunca la ve, asi que
    // aunque alguien mire este archivo no puede mandar nada al canal salvo
    // "cumplí tal misión").
    function notifyMissionWebhook(missionLabel, value, unit) {
        try {
            const link = window._hbxGetDiscordLinkData ? window._hbxGetDiscordLinkData() : null;
            if (!link || link.status !== 'linked') return; // opcional: sin vincular, no se avisa nada
            fetch(`${DISCORD_BASE_URL}/webhook/mission`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    missionLabel: String(missionLabel).slice(0, 60),
                    value: String(value).slice(0, 20),
                    unit: String(unit || '').slice(0, 20),
                    nick: String(link.username || 'Jugador').slice(0, 30)
                })
            }).catch(() => {});
        } catch (e) {}
    }

    // ---- Persistencia ----
    function todayStr() {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    function daysBetween(a, b) {
        const da = new Date(a + 'T00:00:00');
        const db = new Date(b + 'T00:00:00');
        return Math.round((db - da) / 86400000);
    }

    function loadData() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) return Object.assign(defaultData(), JSON.parse(raw));
        } catch (e) {}
        return defaultData();
    }

    function defaultData() {
        return {
            lastLoginDate: null,
            loginStreak: 0,
            bestLoginStreak: 0,
            lastPlayDate: null,
            playStreak: 0,
            bestPlayStreak: 0,
            totalMatches: 0,
            // Contadores de las misiones diarias (se resetean solos cuando
            // cambia el dia, ver ensureDailyReset).
            dailyDate: null,
            dailyMatches: 0,
            dailySeconds: 0
        };
    }

    function saveData(data) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
    }

    let data = loadData();

    // Milestones de las misiones de progresion (declarados antes de usarse:
    // tanto la racha de login como la de partidas pueden completar una
    // misión apenas cargar o al terminar un partido, antes de que se
    // dibuje el panel).
    const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];
    const MATCH_MILESTONES = [10, 25, 50, 100, 250, 500, 1000];

    // ---- Misiones diarias (nuevo 2026-08-03) ----
    // "Que cambien cada dia": en vez de un unico set fijo de misiones, cada
    // dia se eligen metas nuevas para "partidos jugados hoy" y "minutos
    // jugados hoy" de una lista de valores posibles. La eleccion es
    // determinística por fecha (mismo dia = mismas metas para todos, no
    // hace falta ningun servidor), asi que alcanza con la fecha del
    // sistema para saber que le toca a cada dia.
    const DAILY_MATCH_TARGETS = [2, 3, 4, 5];
    const DAILY_MINUTE_TARGETS = [10, 15, 20, 25, 30];

    function dayIndex() {
        return Math.floor(Date.now() / 86400000);
    }

    // Pseudo-random determinístico y estable a partir de un numero entero
    // (mismo "seed" siempre da el mismo resultado, sin depender de nada
    // externo ni de Math.random).
    function seededPick(seed, arr) {
        const x = Math.sin(seed) * 10000;
        const r = x - Math.floor(x);
        return arr[Math.floor(r * arr.length)];
    }

    function getDailyTargets() {
        const d = dayIndex();
        return {
            matches: seededPick(d * 7 + 1, DAILY_MATCH_TARGETS),
            minutes: seededPick(d * 7 + 2, DAILY_MINUTE_TARGETS)
        };
    }

    // Si cambio el dia desde la ultima vez, arranca de cero los contadores
    // diarios (pero NO toca las rachas ni el total, que son acumulados).
    function ensureDailyReset() {
        const today = todayStr();
        if (data.dailyDate === today) return;
        data.dailyDate = today;
        data.dailyMatches = 0;
        data.dailySeconds = 0;
        saveData(data);
    }
    ensureDailyReset();

    // Detecta si al pasar de "before" a "after" se cruzo alguno de los
    // milestones de la lista (por si el contador salta mas de uno de una,
    // aunque en la practica siempre sube de a 1). Devuelve el milestone mas
    // alto cruzado, o null si ninguno.
    function crossedMilestone(before, after, list) {
        let crossed = null;
        for (const m of list) {
            if (before < m && after >= m) crossed = m;
        }
        return crossed;
    }

    // ---- Racha de conexion diaria ----
    (function trackLoginStreak() {
        const today = todayStr();
        if (data.lastLoginDate === today) return; // ya contabilizado hoy

        const before = data.loginStreak;
        if (data.lastLoginDate && daysBetween(data.lastLoginDate, today) === 1) {
            data.loginStreak += 1;
        } else {
            data.loginStreak = 1;
        }
        data.lastLoginDate = today;
        data.bestLoginStreak = Math.max(data.bestLoginStreak, data.loginStreak);
        saveData(data);

        const crossed = crossedMilestone(before, data.loginStreak, STREAK_MILESTONES);
        if (crossed) notifyMissionWebhook('Racha de conexión diaria', crossed, 'días');
    })();

    // ---- Deteccion de partidas jugadas (racha + contador + diarias) ----
    // El marcador y el canvas del juego viven DENTRO del iframe (otro
    // documento), no en la pagina principal. Por eso antes nunca detectaba
    // partidas: buscaba en el document equivocado.
    let wasPlaying = false;
    let _cachedGameDoc = null;

    function getGameDoc() {
        if (_cachedGameDoc) {
            try {
                if (_cachedGameDoc.body && _cachedGameDoc.defaultView) return _cachedGameDoc;
            } catch (e) {}
            _cachedGameDoc = null;
        }
        try {
            const f = document.querySelector('iframe');
            if (f && f.contentDocument && f.contentDocument.body) {
                _cachedGameDoc = f.contentDocument;
                return _cachedGameDoc;
            }
        } catch (e) {}
        return document;
    }

    function isCurrentlyPlaying() {
        const doc = getGameDoc();
        const redScoreEl = doc.querySelector('[data-hook="red-score"]');
        const canvasEl = doc.querySelector('.game-view canvas, canvas');
        return !!(redScoreEl && canvasEl);
    }

    function registerMatchPlayed() {
        ensureDailyReset();
        const beforeTotal = data.totalMatches;
        const beforePlayStreak = data.playStreak;
        const targets = getDailyTargets();
        const beforeDailyMatches = data.dailyMatches;

        data.totalMatches += 1;
        data.dailyMatches += 1;

        const today = todayStr();
        if (data.lastPlayDate !== today) {
            if (data.lastPlayDate && daysBetween(data.lastPlayDate, today) === 1) {
                data.playStreak += 1;
            } else {
                data.playStreak = 1;
            }
            data.lastPlayDate = today;
            data.bestPlayStreak = Math.max(data.bestPlayStreak, data.playStreak);
        }
        saveData(data);
        refreshPanelIfOpen();

        const crossedTotal = crossedMilestone(beforeTotal, data.totalMatches, MATCH_MILESTONES);
        if (crossedTotal) notifyMissionWebhook('Partidos jugados', crossedTotal, 'partidos');
        const crossedStreak = crossedMilestone(beforePlayStreak, data.playStreak, STREAK_MILESTONES);
        if (crossedStreak) notifyMissionWebhook('Racha de partidos jugados', crossedStreak, 'días');
        if (beforeDailyMatches < targets.matches && data.dailyMatches >= targets.matches) {
            notifyMissionWebhook('Misión diaria: partidos', targets.matches, 'partidos hoy');
        }
    }

    // Con "Menos refrescos" activado se chequea cada 6s en vez de cada 2s. La
    // deteccion de partidas sigue funcionando igual (una partida dura minutos),
    // solo se registra con unos segundos mas de demora. El mismo tick suma el
    // tiempo jugado hoy (para la mision diaria de minutos).
    let _matchTimer = null;
    function startMatchWatcher() {
        if (_matchTimer) clearInterval(_matchTimer);

        let lowPoll = false;
        try {
            const isOnFn = window._hbxPerfOptIsOn ||
                           (window.top && window.top._hbxPerfOptIsOn);
            if (isOnFn) lowPoll = !!isOnFn('lowPoll');
        } catch (e) {}

        const intervalMs = lowPoll ? 6000 : 2000;

        _matchTimer = setInterval(() => {
            if (document.hidden) return; // no hace falta chequear con la pestaña en segundo plano
            const playingNow = isCurrentlyPlaying();
            if (playingNow) {
                ensureDailyReset();
                const beforeMinutes = Math.floor(data.dailySeconds / 60);
                data.dailySeconds += intervalMs / 1000;
                const afterMinutes = Math.floor(data.dailySeconds / 60);
                if (afterMinutes > beforeMinutes) {
                    const targets = getDailyTargets();
                    if (beforeMinutes < targets.minutes && afterMinutes >= targets.minutes) {
                        notifyMissionWebhook('Misión diaria: minutos', targets.minutes, 'minutos hoy');
                    }
                }
                // No se guarda en cada tick (seria escribir a localStorage
                // varias veces por segundo mientras se juega); alcanza con
                // guardarlo junto al resto de los cambios reales.
            }
            if (wasPlaying && !playingNow) {
                registerMatchPlayed();
            }
            wasPlaying = playingNow;
        }, intervalMs);
    }
    startMatchWatcher();
    window.addEventListener('hbx-perf-changed', startMatchWatcher);
    // Guarda el tiempo jugado hoy cada tanto (y al cerrar), asi no se pierde
    // si el jugador cierra la app en medio de un partido largo.
    setInterval(() => saveData(data), 20000);
    window.addEventListener('beforeunload', () => saveData(data));

    // ---- Definicion de misiones (progresion / rachas, sin recompensas) ----
    // (STREAK_MILESTONES y MATCH_MILESTONES ya se declararon mas arriba)

    function nextMilestone(value, list) {
        for (const m of list) if (value < m) return m;
        return list[list.length - 1];
    }

    const STRINGS = {
        title: 'Misiones',
        subtitle: 'Seguimiento de tu progreso. Sin premios, solo para presumir.',
        dailyTitle: 'Misiones de hoy',
        dailyMatches: 'Jugá {n} partidos hoy',
        dailyMinutes: 'Jugá {n} minutos hoy',
        loginStreak: 'Racha de conexión diaria',
        playStreak: 'Racha de partidos jugados',
        totalMatches: 'Partidos jugados',
        current: 'Actual',
        best: 'Récord',
        next: 'Próxima meta',
        days: 'días',
        matches: 'partidos',
        min: 'min',
        done: 'Cumplida',
        close: 'Cerrar'
    };

    function getStrings() {
        return STRINGS;
    }

    const CSS = `
        #hbx-missions-overlay {
            position: fixed; inset: 0; z-index: 1000001;
            /* Oscurecido solido en vez de blur: el desenfoque de fondo es de
               los efectos mas caros que hay y aca no aporta casi nada. */
            background: rgba(0,0,0,0.72);
            display: none; align-items: center; justify-content: center;
            font-family: 'Outfit', sans-serif;
        }
        #hbx-missions-overlay.open { display: flex; animation: hbx-m-fade .18s ease; }
        @keyframes hbx-m-fade { from { opacity: 0; } to { opacity: 1; } }
        #hbx-missions-panel {
            width: 380px; max-width: 90vw; max-height: 80vh; overflow-y: auto;
            position: relative;
            background: linear-gradient(160deg, #101013, #08080a);
            color: var(--theme-text-primary, #f2f2f5);
            border: 1px solid rgba(255,255,255,0.10);
            border-radius: 16px; padding: 24px;
            box-shadow: 0 28px 80px -10px rgba(0,0,0,0.85),
                        inset 0 1px 0 rgba(255,255,255,0.10);
            animation: hbx-rise .28s cubic-bezier(0.22,1,0.36,1);
        }
        /* Filo de luz superior, mismo lenguaje que los dialogos del juego */
        #hbx-missions-panel::before {
            content: ''; position: absolute; left: 15%; right: 15%; top: 0; height: 1px;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
        }
        #hbx-missions-panel h2 {
            margin: 0 0 4px 0; font-size: 19px; font-weight: 800;
            letter-spacing: 1.6px; text-transform: uppercase;
        }
        #hbx-missions-panel .hbx-m-sub { margin: 0 0 18px 0; font-size: 12px; opacity: 0.55; }
        .hbx-m-section-title {
            font-size: 10.5px; font-weight: 700; letter-spacing: 1.4px; text-transform: uppercase;
            opacity: 0.5; margin: 0 0 10px 0;
        }
        .hbx-m-card {
            position: relative; overflow: hidden;
            background: linear-gradient(158deg, rgba(255,255,255,0.055), rgba(255,255,255,0.015));
            border: 1px solid rgba(255,255,255,0.09);
            border-radius: 12px; padding: 14px 14px 14px 17px; margin-bottom: 12px;
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.07);
        }
        .hbx-m-card::before {
            content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 2px;
            background: linear-gradient(180deg, #ffffff, #6e6e7a);
        }
        .hbx-m-card.hbx-m-done::before { background: linear-gradient(180deg, #4ade80, #22c55e); }
        .hbx-m-card-title {
            font-size: 12px; font-weight: 700; margin-bottom: 9px;
            letter-spacing: 1px; text-transform: uppercase;
            display: flex; align-items: center; justify-content: space-between; gap: 8px;
        }
        .hbx-m-done-badge {
            font-size: 9.5px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;
            color: #4ade80; flex-shrink: 0;
        }
        .hbx-m-row { display: flex; justify-content: space-between; font-size: 11px; opacity: 0.7; margin-bottom: 6px; }
        .hbx-m-bar-track {
            height: 7px; border-radius: 4px; overflow: hidden;
            background: rgba(255,255,255,0.07);
            box-shadow: inset 0 1px 2px rgba(0,0,0,0.5);
        }
        .hbx-m-bar-fill {
            height: 100%; border-radius: 4px;
            transition: width .45s cubic-bezier(0.22,1,0.36,1);
            background: linear-gradient(90deg, #6e6e7a, #ffffff);
            box-shadow: 0 0 10px -1px rgba(255,255,255,0.7);
        }
        .hbx-m-card.hbx-m-done .hbx-m-bar-fill { background: linear-gradient(90deg, #22c55e, #4ade80); }
        .hbx-m-divider { height: 1px; background: rgba(255,255,255,0.08); margin: 18px 0 16px 0; }
        #hbx-m-discord {
            display: flex; align-items: center; gap: 10px;
            background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09);
            border-radius: 12px; padding: 10px 12px; margin-bottom: 16px;
        }
        #hbx-m-discord img {
            width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
        }
        #hbx-m-discord .hbx-m-discord-text { flex: 1; min-width: 0; }
        #hbx-m-discord .hbx-m-discord-name { font-size: 11.5px; font-weight: 700; }
        #hbx-m-discord .hbx-m-discord-sub { font-size: 10px; opacity: 0.55; margin-top: 2px; }
        #hbx-m-discord-link-btn {
            border: 1px solid rgba(255,255,255,0.16); background: rgba(255,255,255,0.06);
            color: var(--theme-text-primary,#f2f2f5); font-weight: 700; cursor: pointer;
            font-size: 10px; letter-spacing: 1px; text-transform: uppercase;
            padding: 8px 12px; border-radius: 7px; flex-shrink: 0; white-space: nowrap;
        }
        #hbx-m-discord-link-btn:hover { background: rgba(255,255,255,0.14); }
        #hbx-missions-close {
            margin-top: 4px; width: 100%; padding: 11px; border-radius: 9px;
            border: 1px solid rgba(255,255,255,0.12);
            background: rgba(255,255,255,0.05);
            color: var(--theme-text-primary,#f2f2f5); font-weight: 700; cursor: pointer;
            font-size: 11px; letter-spacing: 1.4px; text-transform: uppercase;
        }
        #hbx-missions-close:hover {
            background: linear-gradient(135deg,#ffffff,#c2c2cc);
            color: #08080a;
            border-color: rgba(255,255,255,0.9);
            box-shadow: 0 4px 20px -4px rgba(255,255,255,0.6);
        }
    `;

    let overlay = null, panelBody = null;

    function buildPanel() {
        Injector.injectCSS('hbx-missions-css', CSS);
        overlay = document.createElement('div');
        overlay.id = 'hbx-missions-overlay';
        overlay.innerHTML = `
            <div id="hbx-missions-panel">
                <h2 id="hbx-m-title" class="hbx-chrome"></h2>
                <p class="hbx-m-sub" id="hbx-m-subtitle"></p>
                <div id="hbx-m-discord"></div>
                <div id="hbx-m-body"></div>
                <button id="hbx-missions-close"></button>
            </div>`;
        document.body.appendChild(overlay);
        window.addEventListener('hbx-discord-status-changed', () => renderDiscordCard());
        panelBody = overlay.querySelector('#hbx-m-body');

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closePanel();
        });
        overlay.querySelector('#hbx-missions-close').addEventListener('click', closePanel);
    }

    // ---- Saneado de datos que vienen de afuera ----
    // Mismo criterio que en keysystem.js: lo que sale de localStorage o de
    // la API de Discord no es confiable. (Se repite aca a proposito: cada
    // extension es un archivo independiente con su propio scope.)
    function safeText(v, max, fallback) {
        if (typeof v !== 'string') return fallback;
        const limpio = v.replace(/[\x00-\x1f\x7f]/g, '').trim().slice(0, max);
        return limpio || fallback;
    }

    function sanitizeAvatarUrl(u) {
        if (typeof u !== 'string' || u.length > 300) return null;
        if (/["'()\\\s<>]/.test(u)) return null;
        let parsed;
        try { parsed = new URL(u); } catch (e) { return null; }
        if (parsed.protocol !== 'https:') return null;
        if (parsed.hostname !== 'cdn.discordapp.com') return null;
        return parsed.href;
    }

    function renderDiscordCard() {
        const box = overlay && overlay.querySelector('#hbx-m-discord');
        if (!box) return;
        const link = window._hbxGetDiscordLinkData ? window._hbxGetDiscordLinkData() : { status: 'unlinked' };

        if (link.status === 'linked') {
            // Nada de "link" se interpola en HTML: ese objeto sale de
            // localStorage (escribible por cualquier script de la pagina) y
            // de la API de Discord. Con innerHTML, un avatarUrl con
            // comillas se escapaba del atributo src y ejecutaba codigo.
            // Ahora el texto va por textContent y la URL se valida.
            box.innerHTML = '';

            const safeAvatar = sanitizeAvatarUrl(link.avatarUrl);
            if (safeAvatar) {
                const img = document.createElement('img');
                img.src = safeAvatar;   // asignado como propiedad, nunca como markup
                img.alt = '';
                box.appendChild(img);
            }

            const txt = document.createElement('div');
            txt.className = 'hbx-m-discord-text';

            const name = document.createElement('div');
            name.className = 'hbx-m-discord-name';
            name.textContent = '@' + safeText(link.username, 40, 'Discord');

            const sub = document.createElement('div');
            sub.className = 'hbx-m-discord-sub';
            sub.textContent = link.roleAssigned
                ? 'Rango de jugador asignado'
                : safeText(link.roleError, 160, 'Vinculado');

            txt.appendChild(name);
            txt.appendChild(sub);
            box.appendChild(txt);
        } else if (link.status === 'pending') {
            box.innerHTML = `
                <div class="hbx-m-discord-text">
                    <div class="hbx-m-discord-name">Vinculando con Discord…</div>
                    <div class="hbx-m-discord-sub">Autorizá en la pestaña que se abrió</div>
                </div>`;
        } else {
            box.innerHTML = `
                <div class="hbx-m-discord-text">
                    <div class="hbx-m-discord-name">Cuenta de Discord</div>
                    <div class="hbx-m-discord-sub">Opcional: vinculá para tener tu rango</div>
                </div>
                <button id="hbx-m-discord-link-btn">Vincular</button>`;
            const btn = box.querySelector('#hbx-m-discord-link-btn');
            if (btn) btn.addEventListener('click', () => {
                if (window._hbxStartDiscordLink) window._hbxStartDiscordLink();
                renderDiscordCard();
            });
        }
    }

    function renderCard(title, currentLabel, currentVal, bestLabel, bestVal, nextLabel, target, unit) {
        const pct = Math.min(100, Math.round((currentVal / target) * 100));
        return `
            <div class="hbx-m-card">
                <div class="hbx-m-card-title hbx-chrome">${title}</div>
                <div class="hbx-m-row"><span>${currentLabel}: ${currentVal} ${unit}</span><span>${bestLabel}: ${bestVal}</span></div>
                <div class="hbx-m-bar-track"><div class="hbx-m-bar-fill" style="width:${pct}%"></div></div>
                <div class="hbx-m-row" style="margin-top:6px;margin-bottom:0;"><span>${nextLabel}: ${target} ${unit}</span><span>${pct}%</span></div>
            </div>`;
    }

    function renderDailyCard(title, currentVal, target, unit, doneLabel) {
        const done = currentVal >= target;
        const pct = Math.min(100, Math.round((currentVal / target) * 100));
        return `
            <div class="hbx-m-card${done ? ' hbx-m-done' : ''}">
                <div class="hbx-m-card-title hbx-chrome">
                    <span>${title}</span>
                    ${done ? `<span class="hbx-m-done-badge">✓ ${doneLabel}</span>` : ''}
                </div>
                <div class="hbx-m-bar-track"><div class="hbx-m-bar-fill" style="width:${pct}%"></div></div>
                <div class="hbx-m-row" style="margin-top:6px;margin-bottom:0;"><span>${Math.min(currentVal, target)} / ${target} ${unit}</span><span>${pct}%</span></div>
            </div>`;
    }

    function renderPanel() {
        if (!overlay) buildPanel();
        ensureDailyReset();
        renderDiscordCard();
        const s = getStrings();
        overlay.querySelector('#hbx-m-title').textContent = s.title;
        overlay.querySelector('#hbx-m-subtitle').textContent = s.subtitle;
        overlay.querySelector('#hbx-missions-close').textContent = s.close;

        const targets = getDailyTargets();
        const dailyMinutesPlayed = Math.floor(data.dailySeconds / 60);

        const nextLogin = nextMilestone(data.loginStreak, STREAK_MILESTONES);
        const nextPlay = nextMilestone(data.playStreak, STREAK_MILESTONES);
        const nextMatches = nextMilestone(data.totalMatches, MATCH_MILESTONES);

        panelBody.innerHTML =
            `<div class="hbx-m-section-title">${s.dailyTitle}</div>` +
            renderDailyCard(s.dailyMatches.replace('{n}', targets.matches), data.dailyMatches, targets.matches, s.matches, s.done) +
            renderDailyCard(s.dailyMinutes.replace('{n}', targets.minutes), dailyMinutesPlayed, targets.minutes, s.min, s.done) +
            `<div class="hbx-m-divider"></div>` +
            renderCard(s.loginStreak, s.current, data.loginStreak, s.best, data.bestLoginStreak, s.next, nextLogin, s.days) +
            renderCard(s.playStreak, s.current, data.playStreak, s.best, data.bestPlayStreak, s.next, nextPlay, s.days) +
            renderCard(s.totalMatches, s.current, data.totalMatches, s.best, data.totalMatches, s.next, nextMatches, s.matches);
    }

    function refreshPanelIfOpen() {
        if (overlay && overlay.classList.contains('open')) renderPanel();
    }

    function openPanel() {
        renderPanel();
        overlay.classList.add('open');
    }

    function closePanel() {
        if (overlay) overlay.classList.remove('open');
    }

    window.addEventListener('toggle-missions-panel', () => {
        if (overlay && overlay.classList.contains('open')) {
            closePanel();
        } else {
            openPanel();
        }
    });
})();
