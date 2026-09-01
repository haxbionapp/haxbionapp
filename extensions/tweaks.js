(function () {
    'use strict';
    if (typeof Injector !== 'undefined' && Injector.isMainFrame && Injector.isMainFrame()) return;

    // ============================================================
    //  Seccion "Tweaks" para la configuracion nativa.
    // ------------------------------------------------------------
    //  Agrupa TODAS las subsecciones visuales bajo una sola entrada
    //  del menu, con sus controles completos:
    //    - Fondo de Cancha    -> se arma aca (presets assets/, foto, color)
    //    - Fondo de Interfaz  -> se arma aca (Normal / Estadio / foto propia)
    //    - Avatar             -> reusa la seccion nativa "Avatares" completa
    //    - Pelota             -> se arma aca (RGB, grosor, presets de assets/)
    //    - Marcador           -> reusa la seccion nativa de scoreboard.js
    //
    //  Avatar y Marcador no se reimplementan: se les hace click al tab
    //  nativo que ya existe, asi mantienen TODOS sus controles. Los tabs
    //  sueltos de cancha/marcador/avatar se esconden de la barra de la
    //  config para que esas opciones vivan solo dentro de "Tweaks".
    //
    //  Estilo OSCURO, para que combine con la config de siempre.
    // ============================================================

    var GREEN = '#4ade80';

    var ICON = {
        tweaks:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>',
        field: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="1"/><line x1="12" y1="5" x2="12" y2="19"/><circle cx="12" cy="12" r="2.5"/></svg>',
        player:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>',
        ball:  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7.5 15.6 10l-1.4 4.3H9.8L8.4 10z"/></svg>',
        board: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="10" rx="2"/><line x1="8" y1="7" x2="8" y2="17"/><line x1="16" y1="7" x2="16" y2="17"/></svg>',
        iface: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 15l5-5 4 4 5-5 4 4"/><circle cx="8.5" cy="8" r="1.5"/></svg>',
        chevron:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>',
        back:  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
        check: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
    };

    // ── CSS ──────────────────────────────────────────────────────────────
    function injectCss() {
        if (document.getElementById('hbx-tweaks-css')) return;
        var s = document.createElement('style');
        s.id = 'hbx-tweaks-css';
        s.textContent = [
            '.hbx-tw-menu{display:flex;flex-direction:column;gap:12px;}',
            '.hbx-tw-card{display:flex;align-items:center;gap:16px;padding:16px 18px;border-radius:12px;',
            '  background:var(--theme-bg-secondary,#1a1a1e);border:1px solid var(--theme-border,#2d2d35);',
            '  cursor:pointer;transition:border-color .12s,transform .08s;}',
            '.hbx-tw-card:hover{border-color:'+GREEN+';transform:translateY(-1px);}',
            '.hbx-tw-ico{width:42px;height:42px;border-radius:11px;flex-shrink:0;display:flex;align-items:center;',
            '  justify-content:center;background:rgba(74,222,128,0.12);color:'+GREEN+';}',
            '.hbx-tw-txt{flex:1;min-width:0;}',
            '.hbx-tw-title{font-weight:700;color:#fff;font-size:14.5px;}',
            '.hbx-tw-desc{font-size:12px;color:#aaa;margin-top:3px;line-height:1.4;}',
            '.hbx-tw-card .hbx-tw-chev{color:#666;flex-shrink:0;}',
            '.hbx-tw-back{display:inline-flex;align-items:center;gap:7px;background:none;border:none;',
            '  color:'+GREEN+';font-size:13px;font-weight:700;cursor:pointer;padding:0;margin-bottom:16px;}',
            '.hbx-tw-back:hover{text-decoration:underline;}',
            '.hbx-tw-h2{font-size:20px;font-weight:800;color:#fff;margin:0 0 16px;letter-spacing:-0.3px;}',
            '.hbx-tw-opt{display:flex;align-items:center;gap:14px;padding:16px 18px;border-radius:10px;',
            '  background:var(--theme-bg-secondary,#1a1a1e);border:1px solid var(--theme-border,#2d2d35);margin-bottom:12px;}',
            '.hbx-tw-opt.click{cursor:pointer;}',
            '.hbx-tw-opt.click:hover{border-color:'+GREEN+';}',
            '.hbx-tw-optb{flex:1;min-width:0;}',
            '.hbx-tw-optn{font-weight:700;color:#fff;font-size:13.5px;}',
            '.hbx-tw-optd{font-size:11.5px;color:#aaa;margin-top:3px;line-height:1.4;}',
            '.hbx-tw-chk{width:22px;height:22px;border-radius:6px;flex-shrink:0;border:2px solid #4b5563;',
            '  background:#1e293b;display:flex;align-items:center;justify-content:center;}',
            '.hbx-tw-chk.on{background:'+GREEN+';border-color:'+GREEN+';}',
            '.hbx-tw-range{width:170px;accent-color:'+GREEN+';flex-shrink:0;}',
            '.hbx-tw-sel{padding:8px 12px;border-radius:8px;border:1px solid var(--theme-border,#2d2d35);',
            '  background:var(--theme-bg-tertiary,#222228);color:#fff;font-weight:600;font-size:13px;cursor:pointer;flex-shrink:0;}',
            '.hbx-tw-btn{padding:9px 16px;border-radius:8px;border:none;background:#2563eb;color:#fff;',
            '  font-weight:600;font-size:12.5px;cursor:pointer;flex-shrink:0;}',
            '.hbx-tw-btn:hover{background:#1d4fd8;}',
            '.hbx-tw-clear{width:100%;padding:11px;border-radius:9px;border:1px solid rgba(239,68,68,0.4);',
            '  background:rgba(239,68,68,0.1);color:#f87171;font-weight:700;font-size:13px;cursor:pointer;margin-bottom:16px;}',
            '.hbx-tw-clear:hover{background:rgba(239,68,68,0.18);}',
            '.hbx-tw-h3{font-size:14px;font-weight:700;color:'+GREEN+';margin:2px 0 10px;}',
            '.hbx-tw-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(84px,1fr));gap:10px;margin-bottom:18px;}',
            '.hbx-tw-grid:has(.hbx-tw-item-wide){grid-template-columns:repeat(auto-fill,minmax(150px,1fr));}',
            '.hbx-tw-item-wide img{width:100%;height:78px;object-fit:cover;border-radius:6px;}',
            '.hbx-tw-item{border:2px solid var(--theme-border,#2d2d35);border-radius:10px;padding:8px;cursor:pointer;',
            '  display:flex;flex-direction:column;align-items:center;gap:6px;background:var(--theme-bg-tertiary,#222228);}',
            '.hbx-tw-item:hover{border-color:#4b5563;}',
            '.hbx-tw-item.sel{border-color:'+GREEN+';box-shadow:0 0 0 2px rgba(74,222,128,0.25);}',
            '.hbx-tw-item img{width:42px;height:42px;object-fit:contain;}',
            '.hbx-tw-item .cap{font-size:10.5px;font-weight:600;color:#cbd5e1;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;}',
            '.hbx-tw-catcard{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:10px;',
            '  background:var(--theme-bg-secondary,#1a1a1e);border:1px solid var(--theme-border,#2d2d35);cursor:pointer;margin-bottom:10px;}',
            '.hbx-tw-catcard:hover{border-color:'+GREEN+';}',
            '.hbx-tw-catthumbs{display:flex;flex-shrink:0;}',
            '.hbx-tw-catthumbs img{width:34px;height:34px;object-fit:contain;border-radius:50%;background:#222228;border:2px solid var(--theme-bg-secondary,#1a1a1e);margin-left:-10px;}',
            '.hbx-tw-catthumbs img:first-child{margin-left:0;}',
            '.hbx-tw-empty{padding:24px;text-align:center;color:#94a3b8;font-size:13px;border:1px dashed var(--theme-border,#2d2d35);border-radius:10px;}',
            '.hbx-tw-chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;}',
            '.hbx-tw-chip{padding:6px 13px;border-radius:999px;border:1px solid var(--theme-border,#2d2d35);',
            '  background:var(--theme-bg-tertiary,#222228);color:#cbd5e1;font-size:12.5px;font-weight:600;cursor:pointer;}',
            '.hbx-tw-chip.on{background:rgba(74,222,128,0.15);border-color:'+GREEN+';color:'+GREEN+';}'
        ].join('');
        (document.head || document.documentElement).appendChild(s);
    }

    // ── acceso a assets/ (mismo criterio que el resto de la extension) ────
    var _idx = null, _cache = {};
    function assetUrl(rel) {
        try {
            if (window.chrome && chrome.runtime && chrome.runtime.getURL) {
                return chrome.runtime.getURL(rel);
            }
        } catch (e) {}
        if (window.HBX_BUILD === 'web' || (typeof window !== 'undefined' && window.location && (window.location.protocol === 'http:' || window.location.protocol === 'https:' || window.location.protocol === 'file:'))) {
            return rel;
        }
        return 'hbx://ext/' + rel;
    }
    function cargarIndice() {
        if (_idx) return Promise.resolve(_idx);
        return fetch(assetUrl('assets/index.json'))
            .then(function (r) { return r.json(); })
            .then(function (j) { _idx = { canchas: j.canchas || [], pelotas: j.pelotas || [] }; return _idx; })
            .catch(function () { return { canchas: [], pelotas: [] }; });
    }
    function aDataUrl(rel) {
        if (_cache[rel]) return Promise.resolve(_cache[rel]);
        return fetch(assetUrl(rel)).then(function (r) {
            if (!r.ok) throw new Error('x');
            return r.blob();
        }).then(function (b) {
            return new Promise(function (res, rej) {
                var fr = new FileReader();
                fr.onload = function () { res(fr.result); };
                fr.onerror = rej;
                fr.readAsDataURL(b);
            });
        }).then(function (d) { _cache[rel] = d; return d; });
    }
    function guardar(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

    function aplicarPelota(it) {
        return aDataUrl(it.full).then(function (data) {
            guardar('hbx_custom_ball_img_data', data);
            guardar('hbx_custom_ball_img_enabled', '1');
            guardar('hbx_custom_ball_color_enabled', '1');
            guardar('hbx_custom_ball_id', it.id);
            if (window.setCustomBallImg) window.setCustomBallImg(data, true);
            if (window.broadcastBallImg) window.broadcastBallImg(data, true, 1, 0, 0);
        });
    }
    function limpiarPelota() {
        guardar('hbx_custom_ball_img_enabled', '0');
        guardar('hbx_custom_ball_id', '');
        if (window.setCustomBallImg) window.setCustomBallImg(undefined, false);
        if (window.broadcastBallImg) window.broadcastBallImg(undefined, false, 1, 0, 0);
    }

    function aplicarCancha(it) {
        return aDataUrl(it.full).then(function (data) {
            guardar('hbx_custom_field_bg_data', data);
            guardar('hbx_custom_field_bg_enabled', '1');
            guardar('hbx_custom_field_bg_preset', it.id);
            guardar('hbx_custom_field_bg_color_enabled', '0');
            if (window.setCustomFieldBg) window.setCustomFieldBg(data, true);
            if (window.setCustomFieldBgColor) window.setCustomFieldBgColor(undefined, false);
            if (window.broadcastFieldBg) window.broadcastFieldBg(data, true);
        });
    }
    function aplicarCanchaData(dataUrl) {
        guardar('hbx_custom_field_bg_data', dataUrl);
        guardar('hbx_custom_field_bg_enabled', '1');
        try { localStorage.removeItem('hbx_custom_field_bg_preset'); } catch (e) {}
        guardar('hbx_custom_field_bg_color_enabled', '0');
        if (window.setCustomFieldBg) window.setCustomFieldBg(dataUrl, true);
        if (window.setCustomFieldBgColor) window.setCustomFieldBgColor(undefined, false);
        if (window.broadcastFieldBg) window.broadcastFieldBg(dataUrl, true);
    }
    function aplicarCanchaColor(color) {
        guardar('hbx_custom_field_bg_color', color);
        guardar('hbx_custom_field_bg_color_enabled', '1');
        guardar('hbx_custom_field_bg_enabled', '0');
        try { localStorage.removeItem('hbx_custom_field_bg_preset'); } catch (e) {}
        if (window.setCustomFieldBgColor) window.setCustomFieldBgColor(color, true);
        if (window.setCustomFieldBg) window.setCustomFieldBg(undefined, false);
    }
    function limpiarCancha() {
        guardar('hbx_custom_field_bg_enabled', '0');
        guardar('hbx_custom_field_bg_color_enabled', '0');
        try { localStorage.removeItem('hbx_custom_field_bg_preset'); } catch (e) {}
        if (window.setCustomFieldBg) window.setCustomFieldBg(undefined, false);
        if (window.setCustomFieldBgColor) window.setCustomFieldBgColor(undefined, false);
    }

    // ── FONDO DE INTERFAZ (fondo de toda la pantalla, detras de la lista
    // de salas / avatar / etc — no confundir con Fondo de Cancha, que es
    // solo el campo de juego). Preset fijo "Estadio" + subida propia.
    var IFACE_ESTADIO_REL = 'assets/interface/estadio.jpg';
    var IFACE_ESTADIO_THUMB = 'assets/interface/estadio_thumb.jpg';

    function aplicarFondoInterfaz(dataUrl) {
        // OJO: background.js pinta el body con
        //   body:not(:has(.game-state-view)) { background: ... !important; }
        // El shorthand "background" con !important resetea y tapa cualquier
        // background-image inline SIN !important. Por eso aca cada longhand
        // se setea con prioridad 'important': una regla inline !important le
        // gana a la de la hoja de estilos, y recien ahi se ve el estadio
        // detras de la lista de salas (como en index.html).
        var st = document.body.style;
        st.setProperty('background-image',
            'linear-gradient(rgba(8,12,24,0.24), rgba(8,12,24,0.34)), url("' + dataUrl + '")', 'important');
        st.setProperty('background-size', 'cover', 'important');
        st.setProperty('background-position', 'center center', 'important');
        st.setProperty('background-attachment', 'fixed', 'important');
        st.setProperty('background-repeat', 'no-repeat', 'important');
    }
    function limpiarFondoInterfazDom() {
        var st = document.body.style;
        st.removeProperty('background-image');
        st.removeProperty('background-size');
        st.removeProperty('background-position');
        st.removeProperty('background-attachment');
        st.removeProperty('background-repeat');
    }
    function usarEstadioInterfaz() {
        return aDataUrl(IFACE_ESTADIO_REL).then(function (data) {
            guardar('hbx_interfaz_bg_enabled', '1');
            guardar('hbx_interfaz_bg_preset', 'estadio');
            try { localStorage.removeItem('hbx_interfaz_bg_data'); } catch (e) {}
            aplicarFondoInterfaz(data);
        });
    }
    function usarFondoInterfazPropio(dataUrl) {
        guardar('hbx_interfaz_bg_enabled', '1');
        guardar('hbx_interfaz_bg_data', dataUrl);
        try { localStorage.removeItem('hbx_interfaz_bg_preset'); } catch (e) {}
        aplicarFondoInterfaz(dataUrl);
    }
    function quitarFondoInterfaz() {
        guardar('hbx_interfaz_bg_enabled', '0');
        try { localStorage.removeItem('hbx_interfaz_bg_data'); } catch (e) {}
        try { localStorage.removeItem('hbx_interfaz_bg_preset'); } catch (e) {}
        limpiarFondoInterfazDom();
    }
    function restaurarFondoInterfaz() {
        var enabled = localStorage.getItem('hbx_interfaz_bg_enabled');
        // "Normal": el usuario desactivo el fondo a proposito -> no se pone nada.
        if (enabled === '0') return;
        var preset = localStorage.getItem('hbx_interfaz_bg_preset');
        // Fondo propio subido por el usuario.
        if (enabled === '1' && preset !== 'estadio') {
            var d = localStorage.getItem('hbx_interfaz_bg_data');
            if (d) { aplicarFondoInterfaz(d); return; }
        }
        // Por defecto (nunca se toco) o preset "Estadio": el .jpg del estadio.
        // El estadio es el fondo POR DEFECTO — asi la interfaz (lista de salas,
        // etc.) se ve como el mockup index.html sin tener que activarlo a mano.
        aDataUrl(IFACE_ESTADIO_REL).then(aplicarFondoInterfaz);
    }

    // ── helpers de UI ─────────────────────────────────────────────────────
    function el(tag, cls, html) {
        var e = document.createElement(tag);
        if (cls) e.className = cls;
        if (html != null) e.innerHTML = html;
        return e;
    }
    function backHeader(sec, titulo, onBack) {
        var b = el('button', 'hbx-tw-back', ICON.back + '<span>Volver a Tweaks</span>');
        b.addEventListener('click', onBack);
        sec.appendChild(b);
        sec.appendChild(el('h2', 'hbx-tw-h2', titulo));
    }

    // ============================================================
    //  Subseccion: FONDO DE CANCHA (presets con foto desde assets/)
    // ============================================================
    function appendNativaEnTweaks(dialog, sec, tabHook, secHook) {
        if (!dialog) return;
        var tabContents = dialog.querySelector('.tabcontents') || dialog;
        var tabs = dialog.querySelector('.tabs');
        var tabBtn = tabs && tabs.querySelector('button[data-hook="' + tabHook + '"]');
        if (tabBtn) { try { tabBtn.click(); } catch (e) {} }

        var nativeSec = tabContents.querySelector('.section[data-hook="' + secHook + '"]');
        if (nativeSec) {
            nativeSec.style.display = 'block';
            nativeSec.setAttribute('data-hbx-tweaks-native', '1');
            sec.appendChild(nativeSec);
        }
        // El tab nativo oculta todas las secciones al hacer click; Tweaks es
        // el contenedor padre y debe quedar visible para mostrar esta subsección.
        sec.style.display = 'block';
    }
    function renderCancha(sec, volver, dialog) {
        if (dialog) rehomeNatives(dialog);
        sec.innerHTML = '';
        backHeader(sec, 'Fondo de Cancha', volver);

        // Se conserva únicamente la sección nativa anterior.
        // Las tarjetas de carga/color/grosores y el menú de presets visual
        // se quitaron de esta vista porque ya no forman parte del diseño.
        appendNativaEnTweaks(dialog, sec, 'fieldbgbtn', 'fieldbg-section');
    }
    function canchaCategorias(sec, volver, dialog) {
        if (dialog) rehomeNatives(dialog);
        sec.innerHTML = '';
        backHeader(sec, 'Canchas', function () { renderCancha(sec, volver, dialog); });

        var clr = el('button', 'hbx-tw-clear', 'Quitar fondo personalizado');
        clr.addEventListener('click', function () { limpiarCancha(); canchaCategorias(sec, volver, dialog); });
        sec.appendChild(clr);

        var cont = el('div');
        sec.appendChild(cont);
        cargarIndice().then(function (idx) {
            if (!idx.canchas.length) { cont.appendChild(el('div', 'hbx-tw-empty', 'Todavía no hay carpetas en assets/canchas. Creá una subcarpeta y poné tus imágenes ahí.')); return; }
            idx.canchas.forEach(function (cat) {
                var card = el('div', 'hbx-tw-catcard');
                var thumbs = el('div', 'hbx-tw-catthumbs');
                cat.items.slice(0, 4).forEach(function (it) {
                    var im = document.createElement('img'); im.loading = 'lazy'; im.src = assetUrl(it.thumb || it.full); thumbs.appendChild(im);
                });
                card.appendChild(thumbs);
                card.appendChild(el('div', 'hbx-tw-txt',
                    '<div class="hbx-tw-optn">' + cat.label + '</div><div class="hbx-tw-optd">' +
                    cat.items.length + (cat.items.length === 1 ? ' fondo' : ' fondos') + '</div>'));
                card.appendChild(el('div', null, '<span style="color:#666;">' + ICON.chevron + '</span>'));
                card.addEventListener('click', function () { canchaGrilla(sec, volver, cat.id, dialog); });
                cont.appendChild(card);
            });
        });
    }

    function canchaGrilla(sec, volver, catId, dialog) {
        cargarIndice().then(function (idx) {
            var cat = idx.canchas.filter(function (c) { return c.id === catId; })[0];
            if (!cat) { canchaCategorias(sec, volver, dialog); return; }
            sec.innerHTML = '';
            backHeader(sec, cat.label, function () { canchaCategorias(sec, volver, dialog); });

            if (idx.canchas.length > 1) {
                var chips = el('div', 'hbx-tw-chips');
                idx.canchas.forEach(function (c) {
                    var ch = el('button', 'hbx-tw-chip' + (c.id === catId ? ' on' : ''), c.label);
                    ch.addEventListener('click', function () { if (c.id !== catId) canchaGrilla(sec, volver, c.id, dialog); });
                    chips.appendChild(ch);
                });
                sec.appendChild(chips);
            }

            var clr = el('button', 'hbx-tw-clear', 'Quitar fondo personalizado');
            clr.addEventListener('click', function () { limpiarCancha(); canchaGrilla(sec, volver, catId, dialog); });
            sec.appendChild(clr);

            var grid = el('div', 'hbx-tw-grid');
            sec.appendChild(grid);
            var actual = localStorage.getItem('hbx_custom_field_bg_preset') || '';
            var activo = localStorage.getItem('hbx_custom_field_bg_enabled') === '1';
            cat.items.forEach(function (it) {
                var d = el('div', 'hbx-tw-item hbx-tw-item-wide' + (activo && actual === it.id ? ' sel' : ''));
                d.title = it.label;
                var im = document.createElement('img'); im.loading = 'lazy'; im.src = assetUrl(it.thumb || it.full);
                d.appendChild(im);
                d.appendChild(el('div', 'cap', it.label));
                d.addEventListener('click', function () {
                    var s = grid.querySelectorAll('.hbx-tw-item.sel');
                    for (var i = 0; i < s.length; i++) s[i].classList.remove('sel');
                    d.classList.add('sel');
                    aplicarCancha(it);
                });
                grid.appendChild(d);
            });
        });
    }

    // ============================================================
    //  Subseccion: FONDO DE INTERFAZ
    // ============================================================
    function renderInterfaz(sec, volver) {
        sec.innerHTML = '';
        backHeader(sec, 'Fondo de Interfaz', volver);

        var enabled = localStorage.getItem('hbx_interfaz_bg_enabled');
        var preset = localStorage.getItem('hbx_interfaz_bg_preset') || '';
        var esNormal = enabled === '0';
        var esCustom = enabled === '1' && preset !== 'estadio' && !!localStorage.getItem('hbx_interfaz_bg_data');
        // El estadio es el fondo POR DEFECTO: queda activo salvo que se haya
        // elegido "Normal" o subido una foto propia.
        var esEstadio = !esNormal && !esCustom;

        sec.appendChild(el('div', 'hbx-tw-h3', 'Presets'));
        var grid = el('div', 'hbx-tw-grid');
        sec.appendChild(grid);

        function marcar(item) {
            var s = grid.querySelectorAll('.hbx-tw-item.sel');
            for (var i = 0; i < s.length; i++) s[i].classList.remove('sel');
            item.classList.add('sel');
        }

        // Normal (degradado original del tema, como el body de index.html)
        var dN = el('div', 'hbx-tw-item hbx-tw-item-wide' + (esNormal ? ' sel' : ''));
        dN.title = 'Normal';
        var pv = document.createElement('div');
        pv.style.cssText = 'width:100%;height:78px;border-radius:6px;background:radial-gradient(circle at 50% 0%,#39495c 0%,#1b2430 44%,#0f141b 100%);';
        dN.appendChild(pv);
        dN.appendChild(el('div', 'cap', 'Normal'));
        dN.addEventListener('click', function () { quitarFondoInterfaz(); marcar(dN); });
        grid.appendChild(dN);

        // Estadio (imagen .jpg — el fondo por defecto)
        var dE = el('div', 'hbx-tw-item hbx-tw-item-wide' + (esEstadio ? ' sel' : ''));
        dE.title = 'Estadio';
        var im = document.createElement('img'); im.loading = 'lazy'; im.src = assetUrl(IFACE_ESTADIO_THUMB);
        dE.appendChild(im);
        dE.appendChild(el('div', 'cap', 'Estadio'));
        dE.addEventListener('click', function () { usarEstadioInterfaz(); marcar(dE); });
        grid.appendChild(dE);

        // Subir imagen propia (cualquier foto)
        var row = el('div', 'hbx-tw-opt',
            '<div class="hbx-tw-optb"><div class="hbx-tw-optn">Subir imagen propia</div>' +
            '<div class="hbx-tw-optd">Usá cualquier foto tuya de fondo en toda la interfaz.</div></div>');
        var lbl = document.createElement('label');
        lbl.className = 'hbx-tw-btn'; lbl.textContent = 'Elegir archivo';
        var file = document.createElement('input'); file.type = 'file'; file.accept = 'image/*'; file.style.display = 'none';
        file.addEventListener('change', function (e) {
            var f = e.target.files[0]; if (!f) return;
            var fr = new FileReader();
            fr.onload = function (ev) { usarFondoInterfazPropio(ev.target.result); renderInterfaz(sec, volver); };
            fr.readAsDataURL(f);
        });
        lbl.appendChild(file);
        row.appendChild(lbl);
        sec.appendChild(row);
    }

    // ============================================================
    //  Subseccion: PELOTA
    // ============================================================
    function renderPelota(sec, volver, dialog) {
        sec.innerHTML = '';
        backHeader(sec, 'Pelota', volver);

        // presets de assets/pelotas/  (boton que abre las tandas)
        var presetCard = el('div', 'hbx-tw-opt click',
            '<div class="hbx-tw-optb"><div class="hbx-tw-optn">Pelotas personalizadas</div>' +
            '<div class="hbx-tw-optd">Elegí una tanda (Champions, World Cup...) y mirá los modelos.</div></div>' +
            '<div style="color:#666;flex-shrink:0;">' + ICON.chevron + '</div>');
        presetCard.addEventListener('click', function () { pelotaCategorias(sec, volver, dialog); });
        sec.appendChild(presetCard);

        var ballMount = el('div', 'hbx-tw-native-wrap');
        sec.appendChild(ballMount);
        if (window.hbxRenderAvatarTweaks) window.hbxRenderAvatarTweaks(ballMount, 'ball');
        else appendNativaEnTweaks(dialog, sec, 'avatarbtn', 'avatarsec');
    }

    function pelotaCategorias(sec, volver, dialog) {
        sec.innerHTML = '';
        backHeader(sec, 'Pelotas', function () { renderPelota(sec, volver, dialog); });

        var clr = el('button', 'hbx-tw-clear', 'Quitar pelota personalizada');
        clr.addEventListener('click', function () { limpiarPelota(); pelotaCategorias(sec, volver, dialog); });
        sec.appendChild(clr);

        var cont = el('div');
        sec.appendChild(cont);
        cargarIndice().then(function (idx) {
            if (!idx.pelotas.length) { cont.appendChild(el('div', 'hbx-tw-empty', 'No hay carpetas en assets/pelotas.')); return; }
            idx.pelotas.forEach(function (cat) {
                var card = el('div', 'hbx-tw-catcard');
                var thumbs = el('div', 'hbx-tw-catthumbs');
                cat.items.slice(0, 4).forEach(function (it) {
                    var im = document.createElement('img'); im.loading = 'lazy'; im.src = assetUrl(it.thumb || it.full); thumbs.appendChild(im);
                });
                card.appendChild(thumbs);
                card.appendChild(el('div', 'hbx-tw-txt',
                    '<div class="hbx-tw-optn">' + cat.label + '</div><div class="hbx-tw-optd">' +
                    cat.items.length + (cat.items.length === 1 ? ' modelo' : ' modelos') + '</div>'));
                card.appendChild(el('div', null, '<span style="color:#666;">' + ICON.chevron + '</span>'));
                card.addEventListener('click', function () { pelotaGrilla(sec, volver, cat.id, dialog); });
                cont.appendChild(card);
            });
        });
    }

    function pelotaGrilla(sec, volver, catId, dialog) {
        cargarIndice().then(function (idx) {
            var cat = idx.pelotas.filter(function (c) { return c.id === catId; })[0];
            if (!cat) { pelotaCategorias(sec, volver, dialog); return; }
            sec.innerHTML = '';
            backHeader(sec, cat.label, function () { pelotaCategorias(sec, volver, dialog); });

            if (idx.pelotas.length > 1) {
                var chips = el('div', 'hbx-tw-chips');
                idx.pelotas.forEach(function (c) {
                    var ch = el('button', 'hbx-tw-chip' + (c.id === catId ? ' on' : ''), c.label);
                    ch.addEventListener('click', function () { if (c.id !== catId) pelotaGrilla(sec, volver, c.id, dialog); });
                    chips.appendChild(ch);
                });
                sec.appendChild(chips);
            }

            var clr = el('button', 'hbx-tw-clear', 'Quitar pelota personalizada');
            clr.addEventListener('click', function () { limpiarPelota(); pelotaGrilla(sec, volver, catId, dialog); });
            sec.appendChild(clr);

            var grid = el('div', 'hbx-tw-grid');
            sec.appendChild(grid);
            var actual = localStorage.getItem('hbx_custom_ball_id') || '';
            var activo = localStorage.getItem('hbx_custom_ball_img_enabled') === '1';
            cat.items.forEach(function (it) {
                var d = el('div', 'hbx-tw-item' + (activo && actual === it.id ? ' sel' : ''));
                d.title = it.label;
                var im = document.createElement('img'); im.loading = 'lazy'; im.src = assetUrl(it.thumb || it.full);
                d.appendChild(im);
                d.appendChild(el('div', 'cap', it.label));
                d.addEventListener('click', function () {
                    var s = grid.querySelectorAll('.hbx-tw-item.sel');
                    for (var i = 0; i < s.length; i++) s[i].classList.remove('sel');
                    d.classList.add('sel');
                    aplicarPelota(it);
                });
                grid.appendChild(d);
            });
        });
    }

    // ============================================================
    //  Menu principal de Tweaks
    // ============================================================
    // ── Reubicar secciones nativas ADENTRO de Tweaks ──────────────────────
    // El pedido es que TODO viva dentro de "Tweaks" y que nada quede suelto en
    // el menu de config. Avatar y Marcador ya tienen secciones nativas
    // completas (quickavatar.js / scoreboard.js). En vez de re-implementarlas
    // (y arriesgar perder controles), se MUEVE el nodo de esa seccion nativa
    // adentro del panel de Tweaks, con un boton "Volver a Tweaks". appendChild
    // conserva todos los eventos, asi que siguen funcionando igual — solo que
    // ahora se muestran DENTRO de Tweaks y no como una seccion aparte de config.
    var NATIVE_SECS = ['avatarsec', 'scoreboard-section', 'fieldbg-section'];

    // Devuelve cualquier seccion nativa que este anidada dentro del panel de
    // Tweaks a su lugar original (oculta). Se llama antes de re-dibujar el menu
    // para no destruir el nodo nativo al hacer sec.innerHTML = ''.
    function rehomeNatives(dialog) {
        var tabContents = dialog.querySelector('.tabcontents');
        if (!tabContents) return;
        NATIVE_SECS.forEach(function (h) {
            var n = tabContents.querySelector('[data-hook="' + h + '"]');
            var p = n && n.parentNode;
            if (p && p.getAttribute && p.getAttribute('data-hook') === 'tweaks-section') {
                n.style.display = 'none';
                tabContents.appendChild(n);
            }
        });
    }

    function abrirNativaEnTweaks(dialog, sec, tabHook, secHook, titulo, volver) {
        var tabContents = dialog.querySelector('.tabcontents') || dialog;
        // El click al tab nativo arma/rellena la seccion on-demand.
        var tabBtn = dialog.querySelector('.tabs button[data-hook="' + tabHook + '"]');
        if (tabBtn) tabBtn.click();
        var nativeSec = tabContents.querySelector('[data-hook="' + secHook + '"]');

        sec.innerHTML = '';
        backHeader(sec, titulo, function () {
            if (nativeSec && nativeSec.parentNode === sec) {
                nativeSec.style.display = 'none';
                tabContents.appendChild(nativeSec);
            }
            volver();
        });

        if (nativeSec) {
            nativeSec.style.display = 'block';
            sec.appendChild(nativeSec);
        } else {
            sec.appendChild(el('div', 'hbx-tw-empty', 'No se pudo cargar esta sección todavía. Probá de nuevo en un momento.'));
        }

        // El click al tab nativo oculto la seccion de Tweaks: se vuelve a mostrar.
        sec.style.display = 'block';
    }

    function renderJugadorEnTweaks(dialog, sec, volver) {
        sec.innerHTML = '';
        backHeader(sec, 'Jugador', volver);
        var mount = el('div', 'hbx-tw-native-wrap');
        sec.appendChild(mount);
        if (window.hbxRenderAvatarTweaks) {
            window.hbxRenderAvatarTweaks(mount, 'avatar');
        } else {
            appendNativaEnTweaks(dialog, sec, 'avatarbtn', 'avatarsec');
        }
    }

    function renderTeclasEnTweaks(dialog, sec, volver) {
        sec.innerHTML = '';
        backHeader(sec, 'Indicador de teclas', volver);

        var api = window._hbxKeyIndicator;
        var enabled = api ? api.isEnabled() : localStorage.getItem('hbx_keyind_enabled') === '1';
        var card = el('div', 'hbx-tw-opt click',
            '<div class="hbx-tw-chk ' + (enabled ? 'on' : '') + '">' + (enabled ? ICON.check : '') + '</div>' +
            '<div class="hbx-tw-optb"><div class="hbx-tw-optn">Activar indicador de teclas</div>' +
            '<div class="hbx-tw-optd">Muestra WASD y KICK durante el partido.</div></div>');
        card.addEventListener('click', function () {
            enabled = !enabled;
            if (api) api.setEnabled(enabled);
            else localStorage.setItem('hbx_keyind_enabled', enabled ? '1' : '0');
            var box = card.querySelector('.hbx-tw-chk');
            box.className = 'hbx-tw-chk ' + (enabled ? 'on' : '');
            box.innerHTML = enabled ? ICON.check : '';
        });
        sec.appendChild(card);

        var sizeRow = el('div', 'hbx-tw-opt',
            '<div class="hbx-tw-optb"><div class="hbx-tw-optn">Tamaño del indicador</div>' +
            '<div class="hbx-tw-optd">Cambia el tamaño de las teclas en pantalla.</div></div>');
        var size = el('input', 'hbx-tw-range');
        size.type = 'range';
        size.min = '60';
        size.max = '220';
        size.step = '5';
        size.value = api ? api.getSize() : (localStorage.getItem('hbx_keyind_size') || '100');
        size.addEventListener('input', function () {
            if (api) api.setSize(parseInt(size.value, 10));
            else localStorage.setItem('hbx_keyind_size', size.value);
        });
        sizeRow.appendChild(size);
        sec.appendChild(sizeRow);

        var moving = api ? api.isMoveMode() : false;
        var moveCard = el('div', 'hbx-tw-opt');
        moveCard.style.display = 'block';
        moveCard.innerHTML =
            '<div class="hbx-tw-optn">Posición en pantalla</div>' +
            '<div class="hbx-tw-optd">Activá “Mover indicador”, arrastralo a donde quieras y tocá “Listo” para fijarlo.</div>' +
            '<div style="display:flex;gap:10px;margin-top:12px;">' +
                '<button id="keyind-move-toggle" style="flex:1;padding:10px;border-radius:8px;border:2px solid ' + (moving ? '#1E88E5' : 'rgba(255,255,255,0.15)') + ';background:' + (moving ? 'rgba(30,136,229,0.15)' : 'rgba(255,255,255,0.05)') + ';color:#fff;font-weight:700;font-size:12.5px;cursor:pointer;">' +
                    (moving ? 'Listo (soltar)' : 'Mover indicador') +
                '</button>' +
                '<button id="keyind-reset-pos" style="padding:10px 14px;border-radius:8px;border:2px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.05);color:#fff;font-size:12.5px;cursor:pointer;">Centrar</button>' +
            '</div>';
        var moveBtn = moveCard.querySelector('#keyind-move-toggle');
        moveBtn.onclick = function () {
            if (!api) return;
            api.setMoveMode(!api.isMoveMode());
            renderTeclasEnTweaks(dialog, sec, volver);
        };
        var resetBtn = moveCard.querySelector('#keyind-reset-pos');
        resetBtn.onclick = function () {
            if (api && api.resetPosition) api.resetPosition();
            else localStorage.removeItem('hbx_keyind_pos');
            renderTeclasEnTweaks(dialog, sec, volver);
        };
        sec.appendChild(moveCard);

        sec.appendChild(el('div', 'hbx-tw-h3', 'Tecla de KICK'));
        var customCode = api && api.getKickCustomKey ? api.getKickCustomKey() : localStorage.getItem('hbx_keyind_kick_custom');
        function kickLabel(code) {
            if (!code) return '';
            if (api && api.codeToLabel) return api.codeToLabel(code);
            if (code === 'Space') return 'Espacio';
            if (code.indexOf('Key') === 0) return code.slice(3);
            if (code.indexOf('Digit') === 0) return code.slice(5);
            return code;
        }

        var kickRow = el('div', 'hbx-tw-opt');
        var kickText = el('div', 'hbx-tw-optb',
            '<div class="hbx-tw-optn">Modo de KICK</div><div class="hbx-tw-optd"></div>');
        kickRow.appendChild(kickText);
        var kickButtons = el('div');
        kickButtons.style.cssText = 'display:flex;flex-direction:column;gap:6px;flex-shrink:0;';
        var normalBtn = el('button', 'hbx-tw-btn', 'Usar normales');
        var customBtn = el('button', 'hbx-tw-btn', 'Elegir personalizada');
        kickButtons.appendChild(normalBtn);
        kickButtons.appendChild(customBtn);
        kickRow.appendChild(kickButtons);
        sec.appendChild(kickRow);

        function updateKickUI() {
            customCode = api && api.getKickCustomKey ? api.getKickCustomKey() : localStorage.getItem('hbx_keyind_kick_custom');
            var custom = !!customCode;
            kickText.querySelector('.hbx-tw-optd').textContent = custom
                ? 'Personalizada: ' + kickLabel(customCode)
                : 'Normales: Espacio, X o Shift.';
            normalBtn.style.opacity = custom ? '0.65' : '1';
            customBtn.textContent = custom ? 'Cambiar personalizada' : 'Elegir personalizada';
        }
        normalBtn.addEventListener('click', function () {
            if (api && api.clearKickCustomKey) api.clearKickCustomKey();
            else localStorage.removeItem('hbx_keyind_kick_custom');
            updateKickUI();
        });
        customBtn.addEventListener('click', function () {
            if (!api || !api.captureNextKey) return;
            customBtn.textContent = 'Presioná una tecla...';
            api.captureNextKey(function (code) {
                api.setKickCustomKey(code);
                updateKickUI();
            });
        });
        updateKickUI();
    }
    function renderMenu(dialog, sec) {
        rehomeNatives(dialog);
        sec.innerHTML = '';
        var menu = el('div', 'hbx-tw-menu');
        var items = [
            { ico: ICON.field,  t: 'Fondo de Cancha', d: 'Presets por categorías y opciones originales del fondo.', go: function () { renderCancha(sec, function () { renderMenu(dialog, sec); }, dialog); } },
            { ico: ICON.iface,  t: 'Fondo de Interfaz', d: 'Fondo normal, Estadio o una imagen propia.', go: function () { renderInterfaz(sec, function () { renderMenu(dialog, sec); }); } },
            { ico: ICON.player, t: 'Jugador', d: 'Solo las opciones del avatar y jugador.', go: function () { renderJugadorEnTweaks(dialog, sec, function () { renderMenu(dialog, sec); }); } },
            { ico: ICON.ball,   t: 'Pelota', d: 'Presets por categorías y controles originales de la pelota.', go: function () { renderPelota(sec, function () { renderMenu(dialog, sec); }, dialog); } },
            { ico: ICON.board,  t: 'Marcador', d: 'Todos los estilos y controles originales del marcador.', go: function () { abrirNativaEnTweaks(dialog, sec, 'scoreboardbtn', 'scoreboard-section', 'Marcador', function () { renderMenu(dialog, sec); }); } },
            { ico: ICON.tweaks, t: 'Teclas', d: 'Indicador de teclas, posición y KICK personalizado.', go: function () { renderTeclasEnTweaks(dialog, sec, function () { renderMenu(dialog, sec); }); } },
        ];       items.forEach(function (it) {
            var card = el('div', 'hbx-tw-card',
                '<div class="hbx-tw-ico">' + it.ico + '</div>' +
                '<div class="hbx-tw-txt"><div class="hbx-tw-title">' + it.t + '</div><div class="hbx-tw-desc">' + it.d + '</div></div>' +
                '<span class="hbx-tw-chev">' + ICON.chevron + '</span>');
            card.addEventListener('click', it.go);
            menu.appendChild(card);
        });
        sec.appendChild(menu);
    }

    // ============================================================
    //  Integracion con la config nativa
    // ============================================================
    function setup(doc) {
        var view = doc.querySelector('.settings-view');
        if (!view) return;
        var tabs = view.querySelector('.tabs');
        var tabContents = view.querySelector('.tabcontents');
        if (!tabs || !tabContents) return;

        if (!view.dataset.hbxTweaksReady) {
            view.dataset.hbxTweaksReady = '1';
            var tabBtn = doc.createElement('button');
            tabBtn.setAttribute('data-hook', 'tweaksbtn');
            tabBtn.textContent = 'Tweaks';
            tabBtn.style.display = 'none';
            tabs.appendChild(tabBtn);

            var sec = doc.createElement('div');
            sec.className = 'section';
            sec.setAttribute('data-hook', 'tweaks-section');
            sec.style.display = 'none';
            tabContents.appendChild(sec);

            tabBtn.addEventListener('click', function () {
                var sections = tabContents.querySelectorAll('.section');
                for (var i = 0; i < sections.length; i++) sections[i].style.display = 'none';
                sec.style.display = 'block';
                renderMenu(view, sec);
            });
            tabs.querySelectorAll('button:not([data-hook="tweaksbtn"])').forEach(function (btn) {
                btn.addEventListener('click', function () { sec.style.display = 'none'; });
            });
        }

        var sidebar = doc.getElementById('settings-sidebar-panel');
        if (sidebar) {
            ['fieldbgbtn', 'scoreboardbtn', 'avatarbtn'].forEach(function (hook) {
                var old = sidebar.querySelector('[data-hook-ref="' + hook + '"]');
                if (old) old.style.display = 'none';
            });
            if (!sidebar.querySelector('[data-hook-ref="tweaksbtn"]')) {
                var sbBtn = doc.createElement('button');
                sbBtn.className = 'settings-sidebar-btn';
                sbBtn.setAttribute('data-hook-ref', 'tweaksbtn');
                sbBtn.setAttribute('data-order', '5.55');
                sbBtn.innerHTML = ICON.tweaks;
                sbBtn.title = 'Tweaks';
                sbBtn.onclick = function () {
                    var all = sidebar.querySelectorAll('.settings-sidebar-btn:not([data-close])');
                    for (var j = 0; j < all.length; j++) all[j].classList.remove('selected');
                    sbBtn.classList.add('selected');
                    var t = tabs.querySelector('button[data-hook="tweaksbtn"]');
                    if (t) t.click();
                };
                var spacer = sidebar.querySelector('[data-spacer]');
                if (spacer) sidebar.insertBefore(sbBtn, spacer); else sidebar.appendChild(sbBtn);
            }
        }
    }

    injectCss();
    if (document.body) {
        try { restaurarFondoInterfaz(); } catch (e) {}
    } else {
        document.addEventListener('DOMContentLoaded', function () {
            try { restaurarFondoInterfaz(); } catch (e) {}
        });
    }
    var scheduled = false;
    var obs = new MutationObserver(function () {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(function () { scheduled = false; try { setup(document); } catch (e) {} });
    });
    if (document.body) obs.observe(document.body, { childList: true, subtree: true });
    try { setup(document); } catch (e) {}
})();
