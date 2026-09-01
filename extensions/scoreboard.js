(function () {
    if (window.__HAXBALL_SCOREBOARD_LOADED__) return;
    window.__HAXBALL_SCOREBOARD_LOADED__ = true;

    const STORAGE_KEY = 'hbx_scoreboard_style'; // 'haxball' | 'worldcup' | 'classic' | 'premier'
    const POS_KEY = 'hbx_scoreboard_pos'; // {left, top} en px, ausente = centrado por defecto

    function getScoreboardStyle() {
        return localStorage.getItem(STORAGE_KEY) || 'classic';
    }

    function setScoreboardStyle(style) {
        localStorage.setItem(STORAGE_KEY, style);
        ScoreboardManager.setStyle(style);
    }

    function getScoreboardPos() {
        try { return JSON.parse(localStorage.getItem(POS_KEY) || 'null'); } catch (e) { return null; }
    }

    function setScoreboardPos(pos) {
        if (pos) localStorage.setItem(POS_KEY, JSON.stringify(pos));
        else localStorage.removeItem(POS_KEY);
    }

    // ==========================================
    // 1. SCOREBOARD COMPONENTS WITH DOM CACHING
    // ==========================================

    class BaseScoreboard {
        constructor(container) {
            this.container = container;
            this.mounted = false;
        }
        mount() {}
        render(data) {}
        destroy() {
            this.mounted = false;
        }
    }

    // A) Custom Dark Pill Scoreboard (Image 2 style)
    class CustomPillScoreboard extends BaseScoreboard {
        mount() {
            this.container.className = 'hbx-sb-container hbx-sb-haxball';
            this.container.innerHTML = `
                <div class="hbx-hb-pill">
                    <div class="hbx-hb-team red">
                        <span class="hbx-hb-dot red-dot"></span>
                        <span class="hbx-hb-score red-score-val">0</span>
                    </div>
                    <div class="hbx-hb-center">
                        <span class="hbx-hb-timer">00-00</span>
                    </div>
                    <div class="hbx-hb-team blue">
                        <span class="hbx-hb-score blue-score-val">0</span>
                        <span class="hbx-hb-dot blue-dot"></span>
                    </div>
                </div>
            `;
            this.redScoreEl = this.container.querySelector('.red-score-val');
            this.blueScoreEl = this.container.querySelector('.blue-score-val');
            this.timerEl = this.container.querySelector('.hbx-hb-timer');
            this.mounted = true;
        }

        render(data) {
            if (!this.mounted) this.mount();
            if (this.redScoreEl.textContent !== data.redScore) this.redScoreEl.textContent = data.redScore;
            if (this.blueScoreEl.textContent !== data.blueScore) this.blueScoreEl.textContent = data.blueScore;
            const tText = data.timeText.replace(':', '-');
            if (this.timerEl.textContent !== tText) this.timerEl.textContent = tText;
        }
    }

    // B) WorldCupScoreboard (FIFA World Cup 2026 Broadcast Style)
    class WorldCupScoreboard extends BaseScoreboard {
        mount() {
            this.container.className = 'hbx-sb-container hbx-sb-worldcup';
            this.container.innerHTML = `
                <div class="hbx-wc-wrapper">
                    <div class="hbx-wc-banner">
                        <div class="hbx-wc-team red-side">
                            <span class="hbx-wc-dot red-dot"></span>
                            <span class="hbx-wc-name">RED</span>
                            <div class="hbx-wc-accent red-accent"></div>
                        </div>
                        <div class="hbx-wc-score-box red-score-box">0</div>
                        <div class="hbx-wc-badge">
                            <svg viewBox="0 0 40 50" class="hbx-wc-trophy-svg">
                                <path fill="#FFD700" d="M20 4c-3.5 0-6 3.2-6 7.5 0 3.2 1.8 6.2 3.5 8.2-2.2 2-4.5 5.2-4.5 9.3 0 3.2 2.8 5.5 7 5.5s7-2.3 7-5.5c0-4.1-2.3-7.3-4.5-9.3 1.7-2 3.5-5 3.5-8.2 0-4.3-2.5-7.5-6-7.5z"/>
                                <path fill="#F0C000" d="M14 36h12v4H14zM12 41h16v4H12z"/>
                                <text x="20" y="24" font-size="10" font-weight="900" text-anchor="middle" fill="#000" font-family="'Outfit', Arial, sans-serif">20</text>
                                <text x="20" y="32" font-size="10" font-weight="900" text-anchor="middle" fill="#000" font-family="'Outfit', Arial, sans-serif">26</text>
                                <text x="20" y="47" font-size="5" font-weight="900" text-anchor="middle" fill="#000" font-family="sans-serif">FIFA</text>
                            </svg>
                        </div>
                        <div class="hbx-wc-score-box blue-score-box">0</div>
                        <div class="hbx-wc-team blue-side">
                            <span class="hbx-wc-name">BLUE</span>
                            <span class="hbx-wc-dot blue-dot"></span>
                            <div class="hbx-wc-accent blue-accent"></div>
                        </div>
                    </div>
                    <div class="hbx-wc-timer-pill">00:00</div>
                </div>
            `;
            this.redScoreEl = this.container.querySelector('.red-score-box');
            this.blueScoreEl = this.container.querySelector('.blue-score-box');
            this.timerPill = this.container.querySelector('.hbx-wc-timer-pill');
            this.mounted = true;
        }

        render(data) {
            if (!this.mounted) this.mount();
            if (this.redScoreEl.textContent !== data.redScore) this.redScoreEl.textContent = data.redScore;
            if (this.blueScoreEl.textContent !== data.blueScore) this.blueScoreEl.textContent = data.blueScore;
            if (this.timerPill.textContent !== data.timeText) this.timerPill.textContent = data.timeText;
            this.timerPill.classList.toggle('overtime', !!data.isOvertime);
        }
    }

    // C) PremierScoreboard — usa la imagen real que paso el usuario
    // (preview.html) para todo lo que NO cambia (banderines blanco/negro,
    // cintas rojo/azul, escudo con corona al centro): es un recorte de
    // esa imagen, no una recreacion. Solo los dos numeros de gol y el
    // reloj son dinamicos, asi que esos se dibujan encima con HTML/CSS
    // en el mismo lugar exacto donde estaban los "0"/"00:00" de muestra.
    const PREMIER_BANNER_PNG = 'data:image/png;base64,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';

    class PremierScoreboard extends BaseScoreboard {
        mount() {
            this.container.className = 'hbx-sb-container hbx-sb-premier';
            this.container.innerHTML = `
                <div class="hbx-pr-wrapper">
                    <div class="hbx-pr-banner">
                        <img class="hbx-pr-img" src="${PREMIER_BANNER_PNG}" draggable="false" alt="">
                        <div class="hbx-pr-score red-score-val">0</div>
                        <div class="hbx-pr-score blue-score-val">0</div>
                    </div>
                    <div class="hbx-pr-timer">00:00</div>
                </div>
            `;
            this.redScoreEl = this.container.querySelector('.red-score-val');
            this.blueScoreEl = this.container.querySelector('.blue-score-val');
            this.timerPill = this.container.querySelector('.hbx-pr-timer');
            this.mounted = true;
        }

        render(data) {
            if (!this.mounted) this.mount();
            if (this.redScoreEl.textContent !== data.redScore) this.redScoreEl.textContent = data.redScore;
            if (this.blueScoreEl.textContent !== data.blueScore) this.blueScoreEl.textContent = data.blueScore;
            if (this.timerPill.textContent !== data.timeText) this.timerPill.textContent = data.timeText;
            this.timerPill.classList.toggle('overtime', !!data.isOvertime);
        }
    }

    // ==========================================
    // 2. SCOREBOARD MANAGER WITH ZERO-LAG LOOP
    // ==========================================

    const ScoreboardManager = {
        activeStyle: 'classic',
        currentComponent: null,
        containerEl: null,
        updateTimer: null,
        lastDataKey: '',

        moveMode: false,

        init() {
            this.activeStyle = getScoreboardStyle();
            this.injectStyles();
            this.setupObserver();
            this.mountScoreboard();
            this.setupSettingsTab();
            this.setupDrag();

            // Si el usuario cambia la opcion "Menos refrescos" se reconstruye
            // el temporizador al instante, sin reiniciar la app.
            window.addEventListener('hbx-perf-changed', () => this.setupObserver());
        },

        applySavedPos() {
            if (!this.containerEl) return;
            var pos = getScoreboardPos();
            if (pos && typeof pos.left === 'number' && typeof pos.top === 'number') {
                this.containerEl.style.left = pos.left + 'px';
                this.containerEl.style.top = pos.top + 'px';
                this.containerEl.style.transform = 'none';
            } else {
                this.containerEl.style.left = '50%';
                this.containerEl.style.top = '38px';
                this.containerEl.style.transform = 'translateX(-50%)';
            }
        },

        setMoveMode(on) {
            this.moveMode = !!on;
            if (!this.containerEl) return;
            this.containerEl.style.pointerEvents = this.moveMode ? 'auto' : 'none';
            this.containerEl.classList.toggle('hbx-sb-movable', this.moveMode);
        },

        resetPos() {
            setScoreboardPos(null);
            this.applySavedPos();
        },

        setupDrag() {
            if (this._dragSetup) return;
            this._dragSetup = true;
            var self = this;
            var dragging = false;
            var startX = 0, startY = 0, origLeft = 0, origTop = 0;

            function onDown(e) {
                if (!self.moveMode || !self.containerEl) return;
                var p = e.touches ? e.touches[0] : e;
                dragging = true;
                var rect = self.containerEl.getBoundingClientRect();
                startX = p.clientX;
                startY = p.clientY;
                origLeft = rect.left;
                origTop = rect.top;
                e.preventDefault();
            }
            function onMove(e) {
                if (!dragging || !self.containerEl) return;
                var p = e.touches ? e.touches[0] : e;
                var newLeft = origLeft + (p.clientX - startX);
                var newTop = origTop + (p.clientY - startY);
                newLeft = Math.max(0, Math.min(window.innerWidth - self.containerEl.offsetWidth, newLeft));
                newTop = Math.max(0, Math.min(window.innerHeight - self.containerEl.offsetHeight, newTop));
                self.containerEl.style.left = newLeft + 'px';
                self.containerEl.style.top = newTop + 'px';
                self.containerEl.style.transform = 'none';
            }
            function onUp() {
                if (!dragging) return;
                dragging = false;
                if (self.containerEl) {
                    setScoreboardPos({
                        left: parseFloat(self.containerEl.style.left) || 0,
                        top: parseFloat(self.containerEl.style.top) || 0
                    });
                }
            }

            document.addEventListener('mousedown', onDown, true);
            document.addEventListener('mousemove', onMove, true);
            document.addEventListener('mouseup', onUp, true);
            document.addEventListener('touchstart', onDown, { passive: false, capture: true });
            document.addEventListener('touchmove', onMove, { passive: false, capture: true });
            document.addEventListener('touchend', onUp, true);
        },

        setStyle(style) {
            if (this.activeStyle === style) return;
            this.activeStyle = style;
            this.mountScoreboard();
            this.update(true);
            this.updateNativeScoreboardVisibility();
        },

        mountScoreboard() {
            let container = document.getElementById('hbx-scoreboard-root');
            if (!container) {
                container = document.createElement('div');
                container.id = 'hbx-scoreboard-root';
                document.body.appendChild(container);
            }
            this.containerEl = container;
            container.innerHTML = '';

            if (this.currentComponent && this.currentComponent.destroy) {
                this.currentComponent.destroy();
            }

            if (this.activeStyle === 'worldcup') {
                this.currentComponent = new WorldCupScoreboard(container);
            } else if (this.activeStyle === 'classic') {
                this.currentComponent = new CustomPillScoreboard(container);
            } else if (this.activeStyle === 'premier') {
                this.currentComponent = new PremierScoreboard(container);
            } else {
                this.currentComponent = null;
            }

            this.lastDataKey = '';
            this.updateNativeScoreboardVisibility();
            this.applySavedPos();
            this.setMoveMode(this.moveMode);
            this.update(true);
        },

        updateNativeScoreboardVisibility() {
            document.body.classList.remove('hbx-sb-active-worldcup', 'hbx-sb-active-classic', 'hbx-sb-active-haxball', 'hbx-sb-active-premier');
            document.body.classList.add('hbx-sb-active-' + this.activeStyle);
        },

        fetchLiveData() {
            const redScoreEl = document.querySelector('[data-hook="red-score"]');
            const blueScoreEl = document.querySelector('[data-hook="blue-score"]');
            const timerEl = document.querySelector('.game-timer-view, .game-timer, [data-hook="game-timer"]');

            let redScore = redScoreEl ? redScoreEl.textContent.trim() : '0';
            let blueScore = blueScoreEl ? blueScoreEl.textContent.trim() : '0';
            
            let timeText = '00:00';
            let isOvertime = false;

            if (timerEl) {
                const text = timerEl.textContent.trim();
                if (text.toUpperCase().includes('OVERTIME')) isOvertime = true;
                const match = text.match(/\d{1,2}:\d{2}/) || text.match(/\d{1,2}-\d{2}/);
                if (match) {
                    timeText = match[0].replace('-', ':');
                } else {
                    const digits = timerEl.querySelectorAll('.digit');
                    if (digits.length >= 4) {
                        timeText = `${digits[0].textContent}${digits[1].textContent}:${digits[2].textContent}${digits[3].textContent}`;
                    }
                }
            }

            return { redScore, blueScore, timeText, isOvertime };
        },

        update(force = false) {
            if (!this.containerEl) return;
            if (document.hidden && !force) return; // evita trabajo con la pestaña en segundo plano

            if (this.activeStyle === 'haxball') {
                this.containerEl.style.display = 'none';
                return;
            }

            const redScoreEl = document.querySelector('[data-hook="red-score"]');
            const canvasEl = document.querySelector('.game-view canvas, canvas');
            const isPlaying = !!(redScoreEl && canvasEl);

            if (!isPlaying) {
                if (this.containerEl.style.display !== 'none') {
                    this.containerEl.style.display = 'none';
                }
                return;
            }

            if (this.containerEl.style.display !== 'flex') {
                this.containerEl.style.display = 'flex';
            }

            const data = this.fetchLiveData();
            const dataKey = `${data.redScore}_${data.blueScore}_${data.timeText}_${data.isOvertime}`;

            // Skip DOM rendering if score/timer data hasn't changed (ZERO LAG Optimization)
            if (!force && dataKey === this.lastDataKey) return;
            this.lastDataKey = dataKey;
            
            if (this.currentComponent) {
                this.currentComponent.render(data);
            }
        },

        setupObserver() {
            if (this.updateTimer) clearInterval(this.updateTimer);

            // Con la opcion "Menos refrescos" activada (pestaña Desempeño) el
            // marcador se actualiza ~2 veces por segundo en vez de ~7. El
            // reloj se ve un pelin menos fluido pero se libera trabajo del
            // hilo principal, que es justo lo que causa los tirones.
            var lowPoll = false;
            try {
                var isOnFn = window._hbxPerfOptIsOn ||
                             (window.top && window.top._hbxPerfOptIsOn);
                if (isOnFn) lowPoll = !!isOnFn('lowPoll');
            } catch (e) {}

            this.updateTimer = setInterval(() => {
                this.update();
            }, lowPoll ? 500 : 150);
        },

        // ==========================================
        // 3. SETTINGS UI & PREVIEW
        // ==========================================

        // La seccion de "Personalizacion de Cancha" (color de lineas, color de
        // fondo y color de jugadores) fue removida a pedido del usuario. Los
        // hooks correspondientes tambien se sacaron del motor en patch.js, asi
        // que no queda nada corriendo de esa funcion.
        //
        // La eleccion de ESTILO de marcador (nativo/clasico/world cup) y su
        // posicion en pantalla si tienen pestaña propia — se reconstruyo aca
        // porque no vivia en ningun lado y por eso no se podia cambiar.
        setupSettingsTab() {
            var self = this;

            function inject(doc) {
                var settingsView = doc.querySelector('.settings-view');
                if (!settingsView || settingsView.dataset.scoreboardSetup) return;
                settingsView.dataset.scoreboardSetup = 'true';

                var tabs = settingsView.querySelector('.tabs');
                var tabContents = settingsView.querySelector('.tabcontents');
                if (!tabs || !tabContents) return;

                var sbBtn = doc.createElement('button');
                sbBtn.setAttribute('data-hook', 'scoreboardbtn');
                sbBtn.textContent = 'Marcador';
                sbBtn.style.display = 'none';
                tabs.appendChild(sbBtn);

                var sbSection = doc.createElement('div');
                sbSection.className = 'section';
                sbSection.setAttribute('data-hook', 'scoreboard-section');
                sbSection.style.display = 'none';
                tabContents.appendChild(sbSection);

                var STYLES = [
                    { id: 'haxball', title: 'Haxball (por defecto)', desc: 'El marcador original del juego, sin cambios.' },
                    { id: 'classic', title: 'Clásico HaxBion', desc: 'Pill oscuro con nombres y reloj estilo consola.' },
                    { id: 'worldcup', title: 'World Cup', desc: 'Estilo transmisión, banda negra con trofeo.' },
                    { id: 'premier', title: 'Premier League', desc: 'Banderines rojo/azul con escudo de corona al centro.' }
                ];

                function render() {
                    var current = getScoreboardStyle();
                    var moving = self.moveMode;

                    sbSection.innerHTML = '<div class="hbx-settings-panel">' +
                        '<div class="hbx-settings-desc">Elegí cómo se ve el marcador durante la partida.</div>' +
                        '<div class="hbx-options-grid" id="sb-options-grid"></div>' +
                        '<div class="hbx-preview-wrapper" style="margin-bottom:16px;">' +
                            '<h3>Posición en pantalla</h3>' +
                            '<div style="display:flex; gap:10px;">' +
                                '<button id="sb-move-toggle" style="flex:1; padding:10px; border-radius:8px; border:2px solid ' + (moving ? '#1E88E5' : 'rgba(255,255,255,0.15)') + '; background:' + (moving ? 'rgba(30,136,229,0.15)' : 'rgba(255,255,255,0.05)') + '; color:#fff; font-weight:700; font-size:12.5px; cursor:pointer;">' +
                                    (moving ? 'Listo (soltar)' : 'Mover marcador') +
                                '</button>' +
                                '<button id="sb-reset-pos" style="padding:10px 14px; border-radius:8px; border:2px solid rgba(255,255,255,0.15); background:rgba(255,255,255,0.05); color:#fff; font-size:12.5px; cursor:pointer;">Centrar</button>' +
                            '</div>' +
                            '<div style="font-size:11px; color:#94A3B8; margin-top:10px; line-height:1.5;">Tocá "Mover marcador", arrastralo con el mouse a donde quieras (incluso durante la partida) y tocá "Listo" para fijarlo.</div>' +
                        '</div>' +
                    '</div>';

                    var grid = sbSection.querySelector('#sb-options-grid');
                    STYLES.forEach(function (s) {
                        var card = doc.createElement('div');
                        card.className = 'hbx-option-card' + (current === s.id ? ' selected' : '');
                        card.innerHTML = '<div class="hbx-card-content"><div class="hbx-card-title">' + s.title + '</div><div class="hbx-card-desc">' + s.desc + '</div></div>';
                        card.onclick = function () {
                            setScoreboardStyle(s.id);
                            render();
                        };
                        grid.appendChild(card);
                    });

                    var moveBtn = sbSection.querySelector('#sb-move-toggle');
                    moveBtn.onclick = function () {
                        self.setMoveMode(!self.moveMode);
                        render();
                    };
                    var resetBtn = sbSection.querySelector('#sb-reset-pos');
                    resetBtn.onclick = function () {
                        self.resetPos();
                    };
                }

                sbBtn.addEventListener('click', function () {
                    var sections = settingsView.querySelectorAll('.tabcontents > .section');
                    for (var i = 0; i < sections.length; i++) sections[i].style.display = 'none';
                    sbSection.style.display = 'block';
                    var allTabs = tabs.querySelectorAll('button');
                    for (var i = 0; i < allTabs.length; i++) allTabs[i].classList.remove('selected');
                    sbBtn.classList.add('selected');
                    render();
                });

                tabs.querySelectorAll('button:not([data-hook="scoreboardbtn"])').forEach(function (btn) {
                    btn.addEventListener('click', function () { sbSection.style.display = 'none'; });
                });
            }

            // OJO: subtree tiene que quedar en true. El dialogo de
            // configuracion NO se monta como hijo directo de <body> — con
            // subtree:false esta pestaña deja de aparecer del todo (paso lo
            // mismo con avatar y fondo de cancha al probar este atajo).
            var observer = new MutationObserver(function (mutations) {
                for (var i = 0; i < mutations.length; i++) {
                    var nodes = mutations[i].addedNodes;
                    for (var j = 0; j < nodes.length; j++) {
                        var node = nodes[j];
                        if (node.nodeType === 1 && (node.classList.contains('settings-view') || node.querySelector('.settings-view'))) {
                            inject(document);
                            return;
                        }
                    }
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
            inject(document);
        },

        // ==========================================
        // 4. CSS STYLES INJECTION
        // ==========================================

        injectStyles() {
            const css = `
                /* Hide ONLY match score bar elements when custom scoreboards (worldcup or classic) are active */
                body.hbx-sb-active-worldcup .game-view .bar-container,
                body.hbx-sb-active-worldcup .game-view .game-timer-view,
                body.hbx-sb-active-worldcup .game-view [data-hook="red-score"],
                body.hbx-sb-active-worldcup .game-view [data-hook="blue-score"],
                body.hbx-sb-active-worldcup .game-view [data-hook="game-timer"],
                body.hbx-sb-active-classic .game-view .bar-container,
                body.hbx-sb-active-classic .game-view .game-timer-view,
                body.hbx-sb-active-classic .game-view [data-hook="red-score"],
                body.hbx-sb-active-classic .game-view [data-hook="blue-score"],
                body.hbx-sb-active-classic .game-view [data-hook="game-timer"],
                body.hbx-sb-active-premier .game-view .bar-container,
                body.hbx-sb-active-premier .game-view .game-timer-view,
                body.hbx-sb-active-premier .game-view [data-hook="red-score"],
                body.hbx-sb-active-premier .game-view [data-hook="blue-score"],
                body.hbx-sb-active-premier .game-view [data-hook="game-timer"] {
                    display: none !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                    pointer-events: none !important;
                }

                /* Ensure native score bar is FULLY VISIBLE when haxball (factory default) is selected */
                body.hbx-sb-active-haxball .game-view .bar-container,
                body.hbx-sb-active-haxball .game-view .game-timer-view,
                body.hbx-sb-active-haxball .game-view [data-hook="red-score"],
                body.hbx-sb-active-haxball .game-view [data-hook="blue-score"],
                body.hbx-sb-active-haxball .game-view [data-hook="game-timer"] {
                    display: flex !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                    pointer-events: auto !important;
                }

                /* Root Custom Scoreboard Container */
                #hbx-scoreboard-root {
                    position: fixed;
                    top: 38px;
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    pointer-events: none;
                    user-select: none;
                    font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }

                .hbx-sb-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.2s ease, opacity 0.2s ease;
                }

                #hbx-scoreboard-root.hbx-sb-movable {
                    cursor: move;
                    outline: 2px dashed #1E88E5;
                    outline-offset: 4px;
                    border-radius: 12px;
                }

                /* Native Haxball Scorebar Preview Representation */
                .hbx-native-preview-pill {
                    background: #111;
                    border: 1px solid #333;
                    border-radius: 6px;
                    padding: 6px 14px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .hbx-np-red-sq { width: 12px; height: 12px; background: #e53935; border-radius: 2px; }
                .hbx-np-blue-sq { width: 12px; height: 12px; background: #1e88e5; border-radius: 2px; }
                .hbx-np-score { font-size: 16px; font-weight: 800; color: #FFF; font-family: monospace; }
                .hbx-np-timer-box { background: #000; padding: 3px 8px; border-radius: 4px; color: #EEE; font-size: 14px; font-family: monospace; }

                /* -----------------------------------
                   A) CUSTOM DARK PILL SCOREBOARD (IMAGE 2)
                ----------------------------------- */
                .hbx-sb-haxball .hbx-hb-pill {
                    /* Fondo subido a opaco y backdrop-filter removido: este
                       marcador esta EN PANTALLA TODA LA PARTIDA, encima del
                       canvas que se repinta a cada frame, asi que el blur
                       obligaba a recomponer esa capa continuamente. Visualmente
                       es casi identico (el fondo ya era 92% opaco). */
                    background: #121212;
                    border: 1.5px solid rgba(255, 255, 255, 0.15);
                    border-radius: 10px;
                    padding: 4px 14px;
                    display: flex;
                    align-items: center;
                    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.5);
                }

                .hbx-hb-team {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .hbx-hb-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    display: inline-block;
                }
                .hbx-hb-dot.red-dot {
                    background: #E53935;
                    box-shadow: 0 0 8px rgba(229, 57, 53, 0.8);
                }
                .hbx-hb-dot.blue-dot {
                    background: #1E88E5;
                    box-shadow: 0 0 8px rgba(30, 136, 229, 0.8);
                }

                .hbx-hb-score {
                    font-size: 18px;
                    font-weight: 800;
                    color: #FFFFFF;
                }

                .hbx-hb-center {
                    background: rgba(0, 0, 0, 0.5);
                    border-radius: 5px;
                    padding: 2px 10px;
                    margin: 0 10px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }

                .hbx-hb-timer {
                    font-family: 'Courier New', Consolas, monospace;
                    font-size: 15px;
                    font-weight: 800;
                    color: #E2E8F0;
                    letter-spacing: 1px;
                }

                /* -----------------------------------
                   B) WORLD CUP SCOREBOARD (IMAGE 1)
                ----------------------------------- */
                .hbx-sb-worldcup .hbx-wc-wrapper {
                    display: flex;
                    align-items: center;
                }

                .hbx-wc-banner {
                    display: flex;
                    align-items: center;
                    background: #000000;
                    border-radius: 12px;
                    height: 34px;
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
                    position: relative;
                    border: 1.5px solid #0A0A0A;
                }

                .hbx-wc-team {
                    display: flex;
                    align-items: center;
                    height: 100%;
                    position: relative;
                    padding: 0 10px;
                    background: #050505;
                }
                .hbx-wc-team.red-side {
                    border-radius: 10px 0 0 10px;
                    padding-right: 12px;
                }
                .hbx-wc-team.blue-side {
                    border-radius: 0 10px 10px 0;
                    padding-left: 12px;
                }

                .hbx-wc-accent {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 3px;
                }
                .red-accent {
                    background: linear-gradient(90deg, #FF3B5C, #FF2A4B);
                    border-radius: 0 0 0 10px;
                }
                .blue-accent {
                    background: linear-gradient(90deg, #8A2BE2, #2E5BFF);
                    border-radius: 0 0 10px 0;
                }

                .hbx-wc-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    border: 1.5px solid #FFFFFF;
                    display: inline-block;
                }
                .hbx-wc-dot.red-dot {
                    background: #FF2A4B;
                    margin-right: 6px;
                    box-shadow: 0 0 5px rgba(255, 42, 75, 0.6);
                }
                .hbx-wc-dot.blue-dot {
                    background: #2E5BFF;
                    margin-left: 6px;
                    box-shadow: 0 0 5px rgba(46, 91, 255, 0.6);
                }

                .hbx-wc-name {
                    font-size: 13px;
                    font-weight: 900;
                    color: #FFFFFF;
                    letter-spacing: 1px;
                    font-family: 'Outfit', 'Inter', Arial, sans-serif;
                }

                .hbx-wc-score-box {
                    background: #1DF0D6;
                    color: #02201B;
                    font-weight: 900;
                    font-size: 18px;
                    width: 32px;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'Outfit', 'Inter', Arial, sans-serif;
                }
                .red-score-box {
                    border-radius: 6px 0 0 6px;
                }
                .blue-score-box {
                    border-radius: 0 6px 6px 0;
                }

                .hbx-wc-badge {
                    background: #FFFFFF;
                    border: 2px solid #000000;
                    border-radius: 8px;
                    width: 30px;
                    height: 42px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10;
                    margin: 0 -3px;
                    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.5);
                    position: relative;
                    top: 0px;
                }
                .hbx-wc-trophy-svg {
                    width: 20px;
                    height: 28px;
                }

                .hbx-wc-timer-pill {
                    background: #FFFFFF;
                    color: #050505;
                    border-radius: 10px;
                    padding: 0 12px;
                    height: 34px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 900;
                    font-size: 16px;
                    font-family: 'Courier New', Consolas, monospace;
                    letter-spacing: 1px;
                    margin-left: 8px;
                    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3);
                    border: 1.5px solid #E2E8F0;
                }
                .hbx-wc-timer-pill.overtime {
                    background: #FF3B5C;
                    color: #FFFFFF;
                }

                /* -----------------------------------
                   C) PREMIER LEAGUE SCOREBOARD — recorte real de la
                   imagen que paso el usuario (banderines + cintas +
                   escudo con corona), con los dos goles y el reloj
                   dibujados encima en el lugar exacto de los "0"/"00:00"
                   de muestra. Nada de esto es una recreacion en CSS.
                ----------------------------------- */
                .hbx-sb-premier .hbx-pr-wrapper {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .hbx-pr-banner {
                    position: relative;
                    height: 40px;
                    width: 310px;
                    filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.5));
                }
                .hbx-pr-img {
                    display: block;
                    width: 100%;
                    height: 100%;
                    -webkit-user-drag: none;
                    user-select: none;
                }
                .hbx-pr-score {
                    position: absolute;
                    top: 1px;
                    bottom: 1px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 900;
                    font-size: 19px;
                    color: #fff;
                    font-family: 'Outfit', 'Inter', Arial, sans-serif;
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
                }
                .hbx-pr-score.red-score-val {
                    left: 98px;
                    width: 36px;
                    background: #ED0A13;
                }
                .hbx-pr-score.blue-score-val {
                    left: 177px;
                    width: 34px;
                    background: #0236AE;
                }
                .hbx-pr-timer {
                    margin-top: 6px;
                    background: #3E1987;
                    color: #fff;
                    font-weight: 900;
                    font-size: 16px;
                    letter-spacing: 1px;
                    font-family: 'Courier New', Consolas, monospace;
                    padding: 5px 20px 6px;
                    border-radius: 9px;
                    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.4);
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
                }
                .hbx-pr-timer.overtime {
                    background: #c21f3c;
                }

                /* -----------------------------------
                   SETTINGS & PREVIEW STYLES
                ----------------------------------- */
                .hbx-settings-panel {
                    padding: 10px;
                    color: #E2E8F0;
                }
                .hbx-settings-panel h2 {
                    margin-top: 0;
                    margin-bottom: 6px;
                    font-size: 22px;
                    color: #FFF;
                }
                .hbx-settings-desc {
                    color: #A0AEC0;
                    font-size: 14px;
                    margin-bottom: 20px;
                }
                .hbx-options-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-bottom: 24px;
                }
                .hbx-option-card {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    background: rgba(255, 255, 255, 0.04);
                    border: 2px solid rgba(255, 255, 255, 0.08);
                    border-radius: 12px;
                    padding: 14px 18px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .hbx-option-card:hover {
                    background: rgba(255, 255, 255, 0.08);
                    border-color: rgba(255, 255, 255, 0.2);
                }
                .hbx-option-card.selected {
                    background: rgba(30, 136, 229, 0.15);
                    border-color: #1E88E5;
                }
                .hbx-card-content {
                    display: flex;
                    flex-direction: column;
                }
                .hbx-card-title {
                    font-weight: 700;
                    font-size: 16px;
                    color: #FFF;
                }
                .hbx-card-desc {
                    font-size: 13px;
                    color: #94A3B8;
                    margin-top: 2px;
                }

                .hbx-preview-wrapper {
                    background: rgba(0, 0, 0, 0.3);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 14px;
                    padding: 20px;
                    text-align: center;
                }
                .hbx-preview-wrapper h3 {
                    margin-top: 0;
                    margin-bottom: 16px;
                    font-size: 16px;
                    color: #CBD5E1;
                }
                .hbx-preview-box {
                    min-height: 80px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: radial-gradient(circle, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.9) 100%);
                    border-radius: 10px;
                    padding: 20px;
                }
            `;

            const styleEl = document.createElement('style');
            styleEl.id = 'hbx-scoreboard-styles';
            styleEl.textContent = css;
            (document.head || document.documentElement).appendChild(styleEl);
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => ScoreboardManager.init());
    } else {
        ScoreboardManager.init();
    }
})();
