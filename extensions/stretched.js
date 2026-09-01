(function () {
    'use strict';

    var STORAGE_KEY = 'stretched_resolution';
    var CUSTOM_KEY = 'stretched_custom_resolutions';

    if (!window.location.href.includes('game.html')) return;

    function t(key) {
        return window.__t ? window.__t(key) : key;
    }

    var BASE_RESOLUTIONS = [
        { label: t('Nativo'), width: 0, height: 0 },
        { label: '800x600 (4:3)', width: 800, height: 600 },
        { label: '1024x768 (4:3)', width: 1024, height: 768 },
        { label: '1280x960 (4:3)', width: 1280, height: 960 },
        { label: '1280x1024 (5:4)', width: 1280, height: 1024 },
        { label: '1440x1080 (4:3)', width: 1440, height: 1080 }
    ];

    var _styleEl = null;

    function isValid(res) {
        return !!res &&
            Number.isFinite(res.width) &&
            Number.isFinite(res.height) &&
            res.width >= 0 &&
            res.height >= 0;
    }

    function loadCustom() {
        try {
            var raw = localStorage.getItem(CUSTOM_KEY);
            var parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed.filter(isValid) : [];
        } catch (e) {
            return [];
        }
    }

    function saveCustom(items) {
        try {
            localStorage.setItem(CUSTOM_KEY, JSON.stringify(items));
        } catch (e) {}
    }

    function getAllRes() {
        return BASE_RESOLUTIONS.concat(loadCustom());
    }

    function getSaved() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            var parsed = raw ? JSON.parse(raw) : null;
            return isValid(parsed) ? parsed : { width: 0, height: 0 };
        } catch (e) {
            return { width: 0, height: 0 };
        }
    }

    function setSaved(res) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                width: res.width || 0,
                height: res.height || 0
            }));
        } catch (e) {}
    }

    function makeValue(res) {
        return String(res.width) + 'x' + String(res.height);
    }

    function ensureStyleEl() {
        if (_styleEl && _styleEl.isConnected) return _styleEl;
        _styleEl = document.createElement('style');
        _styleEl.id = 'hbx-stretched-style';
        (document.head || document.documentElement).appendChild(_styleEl);
        return _styleEl;
    }

    function applyStretchCss() {
        var styleEl = ensureStyleEl();
        var res = getSaved();
        var hasRes = !!(res.width && res.height);

        if (!hasRes) {
            document.documentElement.classList.remove('hbx-stretched-active');
            styleEl.textContent = '';
            return;
        }

        document.documentElement.classList.add('hbx-stretched-active');
        styleEl.textContent = [
            'html.hbx-stretched-active body {',
            '  overflow: hidden !important;',
            '}',
            'html.hbx-stretched-active .game-state-view .canvas canvas {',
            '  position: fixed !important;',
            '  inset: 0 !important;',
            '  width: 100vw !important;',
            '  height: 100vh !important;',
            '  max-width: none !important;',
            '  max-height: none !important;',
            '  object-fit: fill !important;',
            '  image-rendering: pixelated !important;',
            '}'
        ].join('\n');
    }

    function syncUi(root) {
        var current = getSaved();

        var select = root.querySelector('#stretch-select');
        if (select) select.value = makeValue(current);

        var del = root.querySelector('#stretch-del-btn');
        if (del) {
            var isBase = BASE_RESOLUTIONS.some(function (res) {
                return res.width === current.width && res.height === current.height;
            });
            del.disabled = !current.width || !current.height || isBase;
            del.style.opacity = del.disabled ? '0.45' : '1';
            del.style.cursor = del.disabled ? 'default' : 'pointer';
        }
    }

    function renderOptions() {
        return getAllRes().map(function (res) {
            return '<option value="' + makeValue(res) + '">' + res.label + '</option>';
        }).join('');
    }

    function addCustom(root) {
        var widthInput = root.querySelector('#stretch-w');
        var heightInput = root.querySelector('#stretch-h');
        if (!widthInput || !heightInput) return;

        var width = parseInt(widthInput.value, 10);
        var height = parseInt(heightInput.value, 10);
        if (!width || !height) return;

        var exists = getAllRes().some(function (res) {
            return res.width === width && res.height === height;
        });

        if (!exists) {
            var customs = loadCustom();
            customs.push({ label: width + 'x' + height, width: width, height: height });
            saveCustom(customs);
            var select = root.querySelector('#stretch-select');
            if (select) select.innerHTML = renderOptions();
        }

        setSaved({ width: width, height: height });
        applyStretchCss();
        syncUi(root);
        widthInput.value = '';
        heightInput.value = '';
    }

    function deleteCurrent(root) {
        var current = getSaved();
        if (!current.width || !current.height) return;

        var customs = loadCustom();
        var next = customs.filter(function (res) {
            return !(res.width === current.width && res.height === current.height);
        });

        if (next.length === customs.length) return;

        saveCustom(next);
        setSaved({ width: 0, height: 0 });

        var select = root.querySelector('#stretch-select');
        if (select) select.innerHTML = renderOptions();

        applyStretchCss();
        syncUi(root);
    }

    function buildRow(doc, container) {
        if (!container || container.querySelector('#stretched-res-row')) return;

        var inputCss = 'background:#222;color:#fff;border:1px solid #444;padding:2px 4px;font-size:12px;';

        var row = doc.createElement('div');
        row.id = 'stretched-res-row';
        row.style.cssText = 'display:flex;align-items:center;padding:4px 0;margin-top:6px;gap:6px;flex-wrap:wrap;';
        row.innerHTML =
            '<span style="font-size:13px;white-space:nowrap;">' + t('Estirar') + ':</span>' +
            '<select id="stretch-select" style="' + inputCss + '">' + renderOptions() + '</select>' +
            '<button id="stretch-del-btn" title="' + t('Borrar') + '" style="' + inputCss + 'color:#f66;">x</button>';

        var customRow = doc.createElement('div');
        customRow.id = 'stretched-custom-row';
        customRow.style.cssText = 'display:flex;align-items:center;padding:2px 0;gap:4px;flex-wrap:wrap;';
        customRow.innerHTML =
            '<input id="stretch-w" type="number" min="1" placeholder="W" style="' + inputCss + 'width:58px;" />' +
            '<input id="stretch-h" type="number" min="1" placeholder="H" style="' + inputCss + 'width:58px;" />' +
            '<button id="stretch-add-btn" style="' + inputCss + 'color:#4ade80;cursor:pointer;">' + t('Guardar') + '</button>';

        container.appendChild(row);
        container.appendChild(customRow);

        row.querySelector('#stretch-select').onchange = function (event) {
            var parts = event.target.value.split('x');
            setSaved({
                width: parseInt(parts[0], 10) || 0,
                height: parseInt(parts[1], 10) || 0
            });
            applyStretchCss();
            syncUi(container);
        };

        customRow.querySelector('#stretch-add-btn').onclick = function () {
            addCustom(container);
        };

        row.querySelector('#stretch-del-btn').onclick = function () {
            if (!this.disabled) deleteCurrent(container);
        };

        syncUi(container);
    }

    window._stretchedBuildRow = buildRow;

    // Convierte el <select> de "Resolution Scaling" (opciones sueltas) en
    // un slider con todos los porcentajes intermedios.
    //
    // El select nativo NO se reemplaza ni se borra: se oculta y se sigue
    // usando como unico mecanismo real para aplicar el cambio (se le
    // agrega una <option> con el valor pedido, se selecciona y se dispara
    // un 'change' de verdad). Asi el motor procesa el cambio exactamente
    // igual que si lo hubiese elegido el jugador a mano.
    //
    // IMPORTANTE: aca NO se toca el canvas con CSS. Un intento anterior
    // agregaba un transform:scale() para "compensar" el alejado de camara
    // y eso rompia el render del jugador y tapaba las flechitas nativas de
    // fuera-de-vista. El escalado se deja 100% en manos del motor.
    function findResolutionSelect(root) {
        var selects = root.querySelectorAll('select');
        for (var i = 0; i < selects.length; i++) {
            var opts = selects[i].querySelectorAll('option');
            if (opts.length < 2) continue;
            var allPercent = true;
            for (var j = 0; j < opts.length; j++) {
                if (!/^\s*\d+\s*%\s*$/.test(opts[j].textContent)) { allPercent = false; break; }
            }
            if (allPercent) return selects[i];
        }
        return null;
    }

    function buildResolutionSlider(doc, container) {
        if (!container || container.querySelector('#hbx-resscale-row')) return;
        var sel = findResolutionSelect(container);
        if (!sel) return;

        // BUG REAL (arreglado): la version anterior deducia una formula
        // (val = a*pct+b) por regresion e INVENTABA valores intermedios que
        // el motor nunca habia ofrecido. Si esos values no son porcentajes
        // por dentro (pueden ser indices, ratios, etc.), un valor inventado
        // deja al motor en un estado invalido — de ahi que la camara se
        // fuera a cualquier lado al mover el escalado.
        //
        // Ahora el slider se mueve por INDICE sobre las opciones reales: se
        // siente como una barra continua, pero cada posicion corresponde
        // siempre a una opcion que el motor ya soportaba. Es imposible
        // generar un estado invalido.
        // Limpieza de estados rotos que pudo dejar la version anterior: se
        // borran las <option> inventadas que hayan quedado, y si el valor
        // guardado no corresponde a ninguna opcion real del motor, se lo
        // devuelve a 100% (o a la opcion mas cercana disponible). Sin esto,
        // un valor invalido ya guardado seguiria rompiendo la camara aunque
        // el slider ya no pueda generar valores nuevos.
        Array.prototype.forEach.call(sel.querySelectorAll('option[data-hbx-custom="1"]'), function (o) { o.remove(); });

        var opts = Array.prototype.filter.call(sel.querySelectorAll('option'), function (o) {
            return !isNaN(parseInt(o.textContent, 10));
        });
        if (opts.length < 2) return;
        opts.sort(function (x, y) { return parseInt(x.textContent, 10) - parseInt(y.textContent, 10); });

        var curIdx = -1;
        for (var k = 0; k < opts.length; k++) {
            if (opts[k].selected) { curIdx = k; break; }
        }
        if (curIdx === -1) {
            for (var k2 = 0; k2 < opts.length; k2++) {
                if (parseInt(opts[k2].textContent, 10) === 100) { curIdx = k2; break; }
            }
            if (curIdx === -1) curIdx = opts.length - 1;
            sel.value = opts[curIdx].value;
            sel.dispatchEvent(new Event('change', { bubbles: true }));
        }

        sel.style.display = 'none';

        function pctOf(i) { return parseInt(opts[i].textContent, 10); }

        var row = doc.createElement('div');
        row.id = 'hbx-resscale-row';
        row.style.cssText = 'display:flex;align-items:center;padding:4px 0;gap:8px;';
        row.innerHTML =
            '<input id="hbx-resscale-slider" type="range" min="0" max="' + (opts.length - 1) + '" step="1" value="' + curIdx + '" style="flex:1;" />' +
            '<span id="hbx-resscale-val" style="font-size:12px;color:#aaa;min-width:40px;text-align:right;">' + pctOf(curIdx) + '%</span>';
        sel.parentNode.insertBefore(row, sel.nextSibling);

        var slider = row.querySelector('#hbx-resscale-slider');
        var label = row.querySelector('#hbx-resscale-val');

        slider.addEventListener('input', function () {
            label.textContent = pctOf(parseInt(slider.value, 10)) + '%';
        });
        slider.addEventListener('change', function () {
            var i = parseInt(slider.value, 10);
            label.textContent = pctOf(i) + '%';
            sel.value = opts[i].value;
            sel.dispatchEvent(new Event('change', { bubbles: true }));
        });
    }

    function tryInsertMenu() {
        var videoSec = document.querySelector('[data-hook="videosec"]');
        if (videoSec) {
            buildRow(document, videoSec);
            try { buildResolutionSlider(document, videoSec); } catch (e) {}
        }
        watchCanvasResize();
    }

    applyStretchCss();
    tryInsertMenu();

    // BUG DE RENDIMIENTO (arreglado): este observer escucha TODO el documento
    // con subtree:true, asi que durante una partida se disparaba con cada
    // mensaje de chat, cambio de marcador, etc. — y cada vez corria un
    // querySelector. Ahora se coalescen todas las mutaciones de un mismo frame
    // en una sola llamada via requestAnimationFrame.
    var _insertScheduled = false;
    function scheduleInsertMenu() {
        if (_insertScheduled) return;
        _insertScheduled = true;
        requestAnimationFrame(function () {
            _insertScheduled = false;
            tryInsertMenu();
        });
    }
    new MutationObserver(scheduleInsertMenu).observe(document.documentElement, { childList: true, subtree: true });

    window.addEventListener('storage', function (event) {
        if (event.key === STORAGE_KEY || event.key === CUSTOM_KEY) {
            applyStretchCss();
            var roots = document.querySelectorAll('[data-hook="videosec"]');
            for (var i = 0; i < roots.length; i++) syncUi(roots[i]);
        }
    });

    // BUG (arreglado): applyStretchCss solo se volvia a ejecutar con el
    // evento 'resize' de la ventana. Pero cambiar "Resolution Scaling" o
    // "Viewport Mode" (ambas opciones nativas de Haxball) no dispara ese
    // evento — solo cambian el tamaño/atributos del propio <canvas> por
    // dentro — asi que nuestro CSS forzado quedaba desincronizado y el
    // canvas se veia recortado, deformado o parpadeaba un frame hasta el
    // proximo resize real. Un ResizeObserver sobre el canvas mismo detecta
    // ese cambio directamente, sin importar que lo dispare.
    var _canvasRO = null;
    var _observedCanvas = null;
    function watchCanvasResize() {
        var canvas = document.querySelector('.game-state-view .canvas canvas, .game-view canvas, canvas');
        if (!canvas || canvas === _observedCanvas) return;
        if (_canvasRO) _canvasRO.disconnect();
        _observedCanvas = canvas;
        if (typeof ResizeObserver === 'undefined') return;
        _canvasRO = new ResizeObserver(function () {
            if (_resizeScheduled) return;
            _resizeScheduled = true;
            requestAnimationFrame(function () {
                _resizeScheduled = false;
                applyStretchCss();
            });
        });
        _canvasRO.observe(canvas);
    }

    // BUG DE RENDIMIENTO (arreglado): 'resize' se dispara decenas de veces por
    // segundo mientras se arrastra el borde de la ventana, y applyStretchCss
    // lee localStorage y reescribe un <style> cada vez. Con rAF se ejecuta
    // como maximo una vez por frame.
    var _resizeScheduled = false;
    window.addEventListener('resize', function () {
        if (_resizeScheduled) return;
        _resizeScheduled = true;
        requestAnimationFrame(function () {
            _resizeScheduled = false;
            applyStretchCss();
        });
    }, { passive: true });
})();
