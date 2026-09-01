(function() {
    'use strict';

    function t(key) { return window.__t ? window.__t(key) : key; }

    // Paleta monocroma "HaxBion": negros profundos + plata/blanco como acento.
    // Nada de colores saturados — toda la personalidad visual viene del
    // contraste, el brillo y las texturas, no del color.
    var THEMES = {
        dark: {
            nameKey: 'HaxBion',
            colors: {
                '--theme-bg-primary':    '#08080a',
                '--theme-bg-secondary':  '#101013',
                '--theme-bg-tertiary':   '#17171c',
                '--theme-bg-hover':      '#1f1f26',
                '--theme-bg-selected':   '#e8e8ee',
                '--theme-border':        '#26262e',
                '--theme-text-primary':  '#f2f2f5',
                '--theme-text-secondary':'#8b8b96'
            },
            fx: ''
        }
    };


    var STORAGE_KEY = 'haxball-theme';
    var CUSTOM_STORAGE_KEY = 'haxball-custom-themes';
    var currentTheme = 'dark';
    var root = document.documentElement;

    var _inGame = false;
    var _styleEl = null;
    var _fxDiv = null;
    var _transStyleEl = null;
    var _rafHandle = null;
    var _transRafHandle = null;
    var _previewThemeDef = null;

    var ALL_VARS = [
        '--theme-bg-primary','--theme-bg-secondary','--theme-bg-tertiary',
        '--theme-bg-hover','--theme-bg-selected','--theme-border',
        '--theme-text-primary','--theme-text-secondary'
    ];
    var ALL_VARS_LEN = ALL_VARS.length;

    var _colorKeyCache = {};
    function _normalizeThemeKey(name) {
        return 'custom_' + String(name || 'theme').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 32);
    }
    function _saveColorCache(key) {
        var c = THEMES[key] && THEMES[key].colors;
        _colorKeyCache[key] = c ? Object.keys(c) : [];
    }
    function _loadCustomThemes() {
        try {
            var raw = JSON.parse(localStorage.getItem(CUSTOM_STORAGE_KEY) || '{}');
            for (var key in raw) {
                if (!raw[key] || !raw[key].colors) continue;
                THEMES[key] = {
                    nameKey: raw[key].name || key,
                    customName: raw[key].name || key,
                    colors: raw[key].colors,
                    fx: raw[key].fx || ''
                };
                _saveColorCache(key);
            }
        } catch (e) {}
    }
    (function() {
        for (var k in THEMES) {
            var c = THEMES[k].colors;
            _colorKeyCache[k] = c ? Object.keys(c) : [];
        }
    })();
    _loadCustomThemes();

    function _getStyleEl() {
        if (!_styleEl) {
            _styleEl = document.createElement('style');
            _styleEl.id = '__hax-theme-style';
            document.head.appendChild(_styleEl);
        }
        return _styleEl;
    }

    function _getFxDiv() {
        if (!_fxDiv) {
            _fxDiv = document.createElement('div');
            _fxDiv.id = '__hax-fx';
            _fxDiv.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:0;will-change:opacity,transform;contain:strict';
            document.body.prepend(_fxDiv);
        }
        return _fxDiv;
    }

    function _getTransStyleEl() {
        if (!_transStyleEl) {
            _transStyleEl = document.createElement('style');
            _transStyleEl.id = '__hax-trans-style';
            document.head.appendChild(_transStyleEl);
        }
        return _transStyleEl;
    }

    function _flashTransition() {
        var el = _getTransStyleEl();
        el.textContent = ':root{transition:--theme-bg-primary .22s,--theme-bg-secondary .22s,--theme-bg-tertiary .22s,--theme-bg-hover .22s,--theme-bg-selected .18s,--theme-border .22s,--theme-text-primary .22s,--theme-text-secondary .22s}#__hax-fx{transition:opacity .18s ease}';
        if (_transRafHandle !== null) cancelAnimationFrame(_transRafHandle);
        _transRafHandle = requestAnimationFrame(function() {
            _transRafHandle = requestAnimationFrame(function() {
                setTimeout(function() {
                    el.textContent = '';
                    _transRafHandle = null;
                }, 300);
            });
        });
    }

    function _setFxVisible(visible) {
        if (!_fxDiv) return;
        _fxDiv.style.display = visible ? 'block' : 'none';
        _fxDiv.style.animationPlayState = visible ? 'running' : 'paused';
    }

    function _updateFx() {
        var def = THEMES[currentTheme];
        _setFxVisible(!!(def && def.fx && !_inGame));
    }

    function _isGameActive() {
        return !!document.querySelector('.game-state-view');
    }

    function _startGameObserver() {
        // Coalescido via rAF: esto corria un querySelector en CADA mutacion de
        // toda la pagina (chat, marcador, etc), incluso durante la partida,
        // que es justo cuando mas mutaciones por segundo hay.
        var scheduled = false;
        function check() {
            scheduled = false;
            var nowInGame = _isGameActive();
            if (nowInGame !== _inGame) {
                _inGame = nowInGame;
                _updateFx();
            }
        }
        new MutationObserver(function() {
            if (scheduled) return;
            scheduled = true;
            requestAnimationFrame(check);
        }).observe(document.body, { childList: true, subtree: true });
    }

    function _applyDefinition(def, theme, persist, opts) {
        opts = opts || {};
        if (!def) return;

        if (theme) currentTheme = theme;
        if (persist) {
            try { localStorage.setItem(STORAGE_KEY, theme); } catch(e) {}
        }

        opts.skipTransition || _flashTransition();

        for (var i = 0; i < ALL_VARS_LEN; i++) root.style.removeProperty(ALL_VARS[i]);

        var colors = def.colors;
        var keys = theme ? _colorKeyCache[theme] : Object.keys(colors);
        for (var j = 0, len = keys.length; j < len; j++) {
            root.style.setProperty(keys[j], colors[keys[j]], 'important');
        }
        root.style.setProperty('--ac', colors['--theme-bg-selected'] || '#e8e8ee', 'important');

        _getStyleEl().textContent = def.fx || '';

        if (document.body) {
            _getFxDiv();
            _updateFx();
        }

        root.setAttribute('data-theme', theme);
        opts.silent || (function() {
            try { window.dispatchEvent(new CustomEvent('hax-theme-change', { detail: { theme: theme } })); } catch (e) {}
        })();
        try {
            if (window.top && window.top !== window) {
                var topRoot = window.top.document.documentElement;
                for (var i2 = 0; i2 < ALL_VARS_LEN; i2++) {
                    var key = ALL_VARS[i2];
                    topRoot.style.setProperty(key, getComputedStyle(root).getPropertyValue(key).trim(), 'important');
                }
                topRoot.style.setProperty('--ac', getComputedStyle(root).getPropertyValue('--theme-bg-selected').trim() || '#e8e8ee', 'important');
                topRoot.setAttribute('data-theme', theme);
                if (!opts.silent) window.top.dispatchEvent(new CustomEvent('hax-theme-change', { detail: { theme: theme } }));
            }
        } catch (e) {}
    }
    function _doApply(theme) {
        _rafHandle = null;
        _previewThemeDef = null;
        _applyDefinition(THEMES[theme], theme, true);
    }

    function applyTheme(theme) {
        if (!THEMES[theme]) return;
        if (_rafHandle !== null) cancelAnimationFrame(_rafHandle);
        _rafHandle = requestAnimationFrame(function() { _doApply(theme); });
    }
    function saveCustomTheme(name, colors, fx) {
        var key = _normalizeThemeKey(name);
        var next = {};
        for (var i = 0; i < ALL_VARS_LEN; i++) {
            var varKey = ALL_VARS[i];
            next[varKey] = colors[varKey] || '#000000';
        }
        THEMES[key] = {
            nameKey: name,
            customName: name,
            colors: next,
            fx: fx || ''
        };
        _saveColorCache(key);
        try {
            var raw = JSON.parse(localStorage.getItem(CUSTOM_STORAGE_KEY) || '{}');
            raw[key] = { name: name, colors: next, fx: fx || '' };
            localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(raw));
        } catch (e) {}
        return key;
    }
    function deleteCustomTheme(key) {
        if (!/^custom_/.test(key || '')) return;
        try {
            var raw = JSON.parse(localStorage.getItem(CUSTOM_STORAGE_KEY) || '{}');
            delete raw[key];
            localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(raw));
        } catch (e) {}
        delete THEMES[key];
        delete _colorKeyCache[key];
        if (currentTheme === key) applyTheme('dark');
    }
    function exportTheme(key) {
        var def = THEMES[key || currentTheme];
        if (!def) return '';
        return JSON.stringify({
            key: key || currentTheme,
            name: def.customName || def.nameKey || key || currentTheme,
            colors: def.colors,
            fx: def.fx || ''
        }, null, 2);
    }
    function getThemeDefinition(key) {
        var def = THEMES[key];
        if (!def) return null;
        return {
            key: key,
            name: def.customName || def.nameKey || key,
            colors: def.colors,
            fx: def.fx || ''
        };
    }
    function previewTheme(colors, fx) {
        var base = THEMES[currentTheme];
        if (!base) return;
        var nextColors = {};
        for (var i = 0; i < ALL_VARS_LEN; i++) {
            var varKey = ALL_VARS[i];
            nextColors[varKey] = colors[varKey] || base.colors[varKey] || '#000000';
        }
        _previewThemeDef = {
            colors: nextColors,
            fx: fx || ''
        };
        _applyDefinition(_previewThemeDef, currentTheme, false, { skipTransition: true, silent: true });
    }
    function clearPreview() {
        if (!_previewThemeDef) return;
        _previewThemeDef = null;
        _applyDefinition(THEMES[currentTheme], currentTheme, false, { skipTransition: true, silent: true });
    }

    function init() {
        try {
            var saved = localStorage.getItem(STORAGE_KEY);
            if (saved && THEMES[saved]) currentTheme = saved;
        } catch(e) {}

        function start() {
            _inGame = _isGameActive();
            _doApply(currentTheme);
            _startGameObserver();
        }

        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            start();
        } else {
            document.addEventListener('DOMContentLoaded', start);
        }
    }

    window.HaxThemes = {
        apply:      applyTheme,
        toggle:     function() {
            var keys = Object.keys(THEMES);
            var next = keys[(keys.indexOf(currentTheme) + 1) % keys.length];
            applyTheme(next);
            return next;
        },
        prev:       function() {
            var keys = Object.keys(THEMES);
            var idx = keys.indexOf(currentTheme);
            var prev = keys[(idx - 1 + keys.length) % keys.length];
            applyTheme(prev);
            return prev;
        },
        getCurrent: function() { return currentTheme; },
        getList:    function() { return Object.keys(THEMES); },
        getCount:   function() { return Object.keys(THEMES).length; },
        hasFx:      function(t) { return !!(THEMES[t] && THEMES[t].fx); },
        isInGame:   function() { return _inGame; },
        getVars:    function() { return ALL_VARS.slice(); },
        getThemeDefinition: getThemeDefinition,
        previewCustom: previewTheme,
        clearPreview: clearPreview,
        saveCustom: saveCustomTheme,
        deleteCustom: deleteCustomTheme,
        exportTheme: exportTheme,
        random:     function() {
            var keys = Object.keys(THEMES);
            var pick = keys[Math.floor(Math.random() * keys.length)];
            applyTheme(pick);
            return pick;
        },
        getThemes:  function() {
            var res = {};
            for (var k in THEMES) res[k] = { name: THEMES[k].customName || t(THEMES[k].nameKey), colors: THEMES[k].colors, custom: /^custom_/.test(k), fx: THEMES[k].fx || '' };
            return res;
        }
    };

    init();
})();
