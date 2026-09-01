(function () {
    if (typeof Injector !== 'undefined' && Injector.isMainFrame()) return;

    var ENABLED_KEY = 'hbx_keyind_enabled';
    var SIZE_KEY = 'hbx_keyind_size';
    var POS_KEY = 'hbx_keyind_pos';
    var KICK_CUSTOM_KEY = 'hbx_keyind_kick_custom';
    var DEFAULT_SIZE = 100; // alto de cada tecla en px, el resto escala en proporcion

    function isEnabled() { return localStorage.getItem(ENABLED_KEY) === '1'; }
    function setEnabled(v) { localStorage.setItem(ENABLED_KEY, v ? '1' : '0'); }

    // Tecla de kick personalizada: por defecto se escuchan Espacio/X/Shift
    // (las mas comunes, porque no hay forma de leer el keybind real que
    // cada uno configuro adentro de Haxball). Si el jugador usa otra tecla
    // para patear, puede fijarla aca — a partir de ese momento SOLO esa
    // tecla prende el indicador de kick, en vez de las 4 de siempre.
    function getKickCustomKey() { return localStorage.getItem(KICK_CUSTOM_KEY) || null; }
    function setKickCustomKey(code) {
        if (code) localStorage.setItem(KICK_CUSTOM_KEY, code);
        else localStorage.removeItem(KICK_CUSTOM_KEY);
    }
    // Nombre lindo para mostrar en la UI (KeyX -> "X", Space -> "Espacio", etc.)
    function codeToLabel(code) {
        if (!code) return null;
        if (code === 'Space') return 'Espacio';
        if (code.indexOf('Key') === 0) return code.slice(3);
        if (code.indexOf('Digit') === 0) return code.slice(5);
        if (code === 'ShiftLeft' || code === 'ShiftRight') return 'Shift';
        if (code === 'ControlLeft' || code === 'ControlRight') return 'Ctrl';
        if (code === 'AltLeft' || code === 'AltRight') return 'Alt';
        return code;
    }

    function getSize() {
        var v = parseInt(localStorage.getItem(SIZE_KEY), 10);
        if (isNaN(v) || v < 60 || v > 220) return DEFAULT_SIZE;
        return v;
    }
    function setSize(v) { localStorage.setItem(SIZE_KEY, String(v)); }

    function getPos() {
        try { return JSON.parse(localStorage.getItem(POS_KEY) || 'null'); } catch (e) { return null; }
    }
    function setPos(p) {
        if (p) localStorage.setItem(POS_KEY, JSON.stringify(p));
        else localStorage.removeItem(POS_KEY);
    }

    // Teclas de movimiento (WASD + flechas) y de patada (las mas comunes:
    // Espacio, X, Shift). No hay forma de leer el keybind real que cada uno
    // configuro adentro de Haxball, asi que se escuchan todas las
    // habituales — el indicador prende con cualquiera de ellas.
    var KEY_MAP = {
        w: ['KeyW', 'ArrowUp'],
        a: ['KeyA', 'ArrowLeft'],
        s: ['KeyS', 'ArrowDown'],
        d: ['KeyD', 'ArrowRight'],
        kick: ['Space', 'KeyX', 'ShiftLeft', 'ShiftRight']
    };

    var root = null;
    var boxes = {};
    var moveMode = false;
    var pressed = {};

    function codeToAction(code) {
        var customKick = getKickCustomKey();
        if (customKick) {
            // Con tecla personalizada fijada, el kick SOLO reacciona a esa
            // tecla (no a las 4 comunes de antes).
            if (code === customKick) return 'kick';
            for (var action2 in KEY_MAP) {
                if (action2 === 'kick') continue;
                if (KEY_MAP[action2].indexOf(code) !== -1) return action2;
            }
            return null;
        }
        for (var action in KEY_MAP) {
            if (KEY_MAP[action].indexOf(code) !== -1) return action;
        }
        return null;
    }

    function setPressed(action, on) {
        pressed[action] = on;
        var box = boxes[action];
        if (!box) return;
        box.style.background = on ? '#ffffff' : 'rgba(255,255,255,0.06)';
        box.style.color = on ? '#0a0a0a' : '#fff';
        box.style.borderColor = on ? '#ffffff' : 'rgba(255,255,255,0.25)';
        box.style.transform = on ? 'scale(0.94)' : 'scale(1)';
    }

    document.addEventListener('keydown', function (e) {
        var action = codeToAction(e.code);
        if (action) setPressed(action, true);
    }, true);
    document.addEventListener('keyup', function (e) {
        var action = codeToAction(e.code);
        if (action) setPressed(action, false);
    }, true);
    window.addEventListener('blur', function () {
        for (var action in KEY_MAP) setPressed(action, false);
    });

    function keyBoxCss(size) {
        return 'display:flex; align-items:center; justify-content:center;' +
            'width:' + size + 'px; height:' + size + 'px; border-radius:' + Math.round(size * 0.16) + 'px;' +
            'border:2px solid rgba(255,255,255,0.25); background:rgba(255,255,255,0.06); color:#fff;' +
            'font-weight:800; font-size:' + Math.round(size * 0.32) + 'px; font-family:system-ui, sans-serif;' +
            'transition:background .08s, transform .08s, border-color .08s; user-select:none;';
    }

    function build() {
        if (root) return;
        var size = getSize();

        root = document.createElement('div');
        root.id = 'hbx-keyind-root';
        root.style.cssText = [
            'position:fixed',
            'z-index:998',
            'display:flex',
            'align-items:center',
            'gap:' + Math.round(size * 0.14) + 'px',
            'padding:' + Math.round(size * 0.14) + 'px',
            'border-radius:14px',
            'background:rgba(20,20,20,0.55)',
            'box-shadow:0 4px 16px rgba(0,0,0,0.4)',
            'user-select:none'
        ].join(';');

        var wasd = document.createElement('div');
        wasd.style.cssText = 'display:flex; flex-direction:column; gap:' + Math.round(size * 0.12) + 'px; align-items:center;';

        var wRow = document.createElement('div');
        wRow.style.cssText = 'display:flex; justify-content:center;';
        boxes.w = document.createElement('div');
        boxes.w.style.cssText = keyBoxCss(size * 0.42);
        boxes.w.textContent = 'W';
        wRow.appendChild(boxes.w);

        var adsRow = document.createElement('div');
        adsRow.style.cssText = 'display:flex; gap:' + Math.round(size * 0.12) + 'px;';
        boxes.a = document.createElement('div');
        boxes.a.style.cssText = keyBoxCss(size * 0.42);
        boxes.a.textContent = 'A';
        boxes.s = document.createElement('div');
        boxes.s.style.cssText = keyBoxCss(size * 0.42);
        boxes.s.textContent = 'S';
        boxes.d = document.createElement('div');
        boxes.d.style.cssText = keyBoxCss(size * 0.42);
        boxes.d.textContent = 'D';
        adsRow.appendChild(boxes.a);
        adsRow.appendChild(boxes.s);
        adsRow.appendChild(boxes.d);

        wasd.appendChild(wRow);
        wasd.appendChild(adsRow);

        boxes.kick = document.createElement('div');
        boxes.kick.style.cssText = 'display:flex; align-items:center; justify-content:center;' +
            'width:' + Math.round(size * 0.78) + 'px; height:' + Math.round(size * 0.42) + 'px;' +
            'border-radius:' + Math.round(size * 0.14) + 'px; border:2px solid rgba(255,255,255,0.25);' +
            'background:rgba(255,255,255,0.06); color:#fff; font-weight:800; font-size:' + Math.round(size * 0.16) + 'px;' +
            'font-family:system-ui, sans-serif; transition:background .08s, transform .08s, border-color .08s;';
        boxes.kick.textContent = codeToLabel(getKickCustomKey()) || 'KICK';

        root.appendChild(wasd);
        root.appendChild(boxes.kick);
        document.body.appendChild(root);

        var pos = getPos();
        if (pos && typeof pos.left === 'number' && typeof pos.top === 'number') {
            root.style.left = pos.left + 'px';
            root.style.top = pos.top + 'px';
        } else {
            root.style.left = '14px';
            root.style.bottom = '54px';
        }

        setupDrag();
    }

    function setupDrag() {
        if (!root || root._hbxDragSetup) return;
        root._hbxDragSetup = true;
        var dragging = false;
        var startX = 0, startY = 0, origLeft = 0, origTop = 0;

        function onDown(e) {
            if (!moveMode || !root) return;
            var p = e.touches ? e.touches[0] : e;
            dragging = true;
            var rect = root.getBoundingClientRect();
            startX = p.clientX;
            startY = p.clientY;
            origLeft = rect.left;
            origTop = rect.top;
            root.style.bottom = '';
            root.style.left = origLeft + 'px';
            root.style.top = origTop + 'px';
            root.style.cursor = 'move';
            root.style.outline = '2px dashed #4ade80';
            e.preventDefault();
        }
        function onMove(e) {
            if (!dragging || !root) return;
            var p = e.touches ? e.touches[0] : e;
            var newLeft = origLeft + (p.clientX - startX);
            var newTop = origTop + (p.clientY - startY);
            newLeft = Math.max(0, Math.min(window.innerWidth - root.offsetWidth, newLeft));
            newTop = Math.max(0, Math.min(window.innerHeight - root.offsetHeight, newTop));
            root.style.left = newLeft + 'px';
            root.style.top = newTop + 'px';
            e.preventDefault();
        }
        function onUp() {
            if (!dragging) return;
            dragging = false;
            if (root) {
                setPos({
                    left: parseFloat(root.style.left) || 0,
                    top: parseFloat(root.style.top) || 0
                });
            }
        }

        document.addEventListener('mousedown', onDown, true);
        document.addEventListener('mousemove', onMove, true);
        document.addEventListener('mouseup', onUp, true);
        document.addEventListener('touchstart', onDown, { passive: false, capture: true });
        document.addEventListener('touchmove', onMove, { passive: false, capture: true });
        document.addEventListener('touchend', onUp, true);
    }
    function resetPosition() {
        setPos(null);
        if (root) {
            root.style.left = '14px';
            root.style.top = '';
            root.style.bottom = '54px';
        }
    }
    function setMoveMode(on) {
        moveMode = !!on;
        if (root) {
            root.style.cursor = moveMode ? 'move' : 'default';
            root.style.outline = moveMode ? '2px dashed #4ade80' : '';
        }
    }

    function rebuild() {
        if (root && root.parentNode) root.parentNode.removeChild(root);
        root = null;
        boxes = {};
        build();
    }

    function inRoom() {
        // Solo .game-state-view (no un "canvas" suelto): ese existe incluso
        // detras del cartel de "Choose nickname" antes de entrar de verdad,
        // lo que causaba bugs de deteccion en otras partes de la extension.
        return !!document.querySelector('.game-state-view');
    }

    function start() {
        if (!root) build();
        root.style.display = inRoom() ? 'flex' : 'none';
    }

    function stop() {
        if (root) root.style.display = 'none';
        setMoveMode(false);
    }

    function sync() {
        if (isEnabled()) start(); else stop();
    }

    // El indicador solo tiene sentido dentro de una partida — se oculta en
    // el menu/lobby aunque este activado en la configuracion. No hay un
    // evento propio para "entraste/saliste de sala", asi que se revisa cada
    // segundo (barato: un solo querySelector).
    setInterval(function () {
        if (isEnabled() && root) root.style.display = inRoom() ? 'flex' : 'none';
    }, 1000);

    // Escucha la PROXIMA tecla que se apriete en cualquier lado (captura en
    // fase de "capture" y bloquea que llegue al juego, para no patear/mover
    // por accidente mientras se esta asignando) y la devuelve por callback.
    // Ignora modificadores solos (Shift/Ctrl/Alt/Meta apretados sin nada mas)
    // salvo que se suelten sin combinar con otra tecla, en cuyo caso SI
    // cuentan (mucha gente patea con Shift solo).
    var capturing = false;
    function captureNextKey(callback) {
        if (capturing) return;
        capturing = true;
        var combined = false;
        function onDown(e) {
            var isModifierOnly = ['ShiftLeft', 'ShiftRight', 'ControlLeft', 'ControlRight', 'AltLeft', 'AltRight', 'MetaLeft', 'MetaRight'].indexOf(e.code) !== -1;
            e.preventDefault();
            e.stopImmediatePropagation();
            if (isModifierOnly) return; // esperar a ver si se combina o se suelta solo
            combined = true;
            finish(e.code);
        }
        function onUp(e) {
            if (combined) return;
            var isModifierOnly = ['ShiftLeft', 'ShiftRight', 'ControlLeft', 'ControlRight', 'AltLeft', 'AltRight', 'MetaLeft', 'MetaRight'].indexOf(e.code) !== -1;
            if (!isModifierOnly) return;
            e.preventDefault();
            e.stopImmediatePropagation();
            finish(e.code);
        }
        function finish(code) {
            document.removeEventListener('keydown', onDown, true);
            document.removeEventListener('keyup', onUp, true);
            capturing = false;
            callback(code);
        }
        document.addEventListener('keydown', onDown, true);
        document.addEventListener('keyup', onUp, true);
    }

    window._hbxKeyIndicator = {
        isEnabled: isEnabled,
        setEnabled: function (v) { setEnabled(v); sync(); },
        getSize: getSize,
        setSize: function (v) { setSize(v); rebuild(); if (isEnabled()) start(); },
        isMoveMode: function () { return moveMode; },
        setMoveMode: setMoveMode,
        getKickCustomKey: getKickCustomKey,
        setKickCustomKey: function (code) { setKickCustomKey(code); if (boxes.kick) boxes.kick.textContent = codeToLabel(code) || 'KICK'; },
        clearKickCustomKey: function () { setKickCustomKey(null); if (boxes.kick) boxes.kick.textContent = 'KICK'; },
        codeToLabel: codeToLabel,
        captureNextKey: captureNextKey,
        isCapturing: function () { return capturing; }
    };

    sync();
})();
