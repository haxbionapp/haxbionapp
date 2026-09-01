(function() {
    if (Injector.isMainFrame()) return;

    var roomListObserver = null;
    var cachedRows = null;
    var selectedCountry = 'all';
    var searchTimeout = null;
    var isFilteringFavs = false;

    // ── "Cardskin" (pantalla de salas rediseñada) ────────────────────────────
    // Es una prueba visual pedida por el usuario: pantalla monocroma tipo
    // brutalist/terminal, salas en tarjetas en vez de filas de tabla, que se
    // ponen blancas y giran un poco al pasar el mouse. Todo va detrás de este
    // flag y de un solo <style> con id propio para poder sacarlo entero de un
    // saque si no convence (poner HBX_CARDSKIN en false, o borrar este bloque
    // y el <style> que arma buildCardSkinCss). No toca el sidebar de iconos
    // de la derecha (#sidebar-panel) ni cambia ninguna logica real: la tabla
    // original sigue existiendo (oculta) y las tarjetas solo reenvian los
    // clicks/doble-click/click-derecho a la fila real correspondiente.
    var HBX_CARDSKIN = false;

    // ── Banner de Discord (reconstruido 2026-08-03) ───────────────────────
    // Este archivo corre en el frame del juego (otro origen que el frame
    // principal), asi que no puede leer localStorage directo: le pregunta
    // el estado al frame principal por postMessage (keysystem.js contesta)
    // y se queda escuchando actualizaciones en vivo.
    // Arranca en "unknown" (todavia no contesto el frame principal) para
    // no mostrar "No estás conectado" durante un instante a alguien que SI
    // esta conectado. El banner se mantiene oculto hasta saber la verdad.
    var discordLink = { status: 'unknown' };

    // Unicos origenes con los que este iframe habla. La pagina de HaxBall
    // carga iframes de terceros (publicidad), asi que sin este filtro
    // cualquiera de ellos podria mandarnos mensajes falsos.
    var HBX_TRUSTED_ORIGINS = [
        'https://www.haxball.com',
        'https://html5.haxball.com',
        (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : null
    ].filter(Boolean);

    // Averigua UNA sola vez el origen real del frame de arriba, y solo lo
    // acepta si esta en la lista de confianza.
    //
    // Antes se mandaba el mensaje a los dos origenes de la lista "por las
    // dudas". Eso funcionaba, pero por cada envio el que no coincidia hacia
    // que Chrome escribiera un error ("target origin provided does not match
    // the recipient window's origin"). El try/catch no lo tapa: el navegador
    // lo reporta igual. Y como esto se repite cada 5 segundos, llenaba el
    // registro de errores de la extension.
    var _origenPadre;
    function origenDelPadre() {
        if (_origenPadre !== undefined) return _origenPadre;
        var o = '';
        // Mismo origen (que es el caso real: el juego corre en un iframe de
        // www.haxball.com): se puede leer directo.
        try { o = window.parent.location.origin; } catch (e) {}
        // Si fuera de otro origen, el referrer nos dice de donde venimos.
        if (!o && document.referrer) {
            try { o = new URL(document.referrer).origin; } catch (e) {}
        }
        _origenPadre = (HBX_TRUSTED_ORIGINS.indexOf(o) !== -1) ? o : null;
        return _origenPadre;
    }

    function requestDiscordStatus() {
        var origen = origenDelPadre();
        if (!origen) return; // el frame de arriba no es HaxBall: no se manda nada
        try { window.parent.postMessage({ type: 'HBX_DISCORD_STATUS_REQUEST' }, origen); } catch (e) {}
    }

    window.addEventListener('message', function (ev) {
        // FILTRO DE ORIGEN — no sacar. Sin esto, cualquier iframe vecino
        // (por ejemplo el de publicidad) podria mandarnos un estado
        // inventado y, por ejemplo, esconderle el banner al jugador o
        // hacerle creer que esta vinculado cuando no lo esta.
        if (HBX_TRUSTED_ORIGINS.indexOf(ev.origin) === -1) return;
        if (!ev.data || ev.data.type !== 'HBX_DISCORD_STATUS_RESPONSE') return;
        var p = ev.data.payload;
        // Solo se acepta el campo "status", y solo con valores conocidos.
        var st = p && typeof p.status === 'string' ? p.status : 'unlinked';
        if (['linked', 'pending', 'unlinked', 'error'].indexOf(st) === -1) st = 'unlinked';
        discordLink = { status: st };
        updateDiscordBanner();
    });

    var _discordPollTimer = null;
    function startDiscordStatusPolling() {
        if (_discordPollTimer) return;
        requestDiscordStatus();
        _discordPollTimer = setInterval(requestDiscordStatus, 5000);
    }

    function buildDiscordBanner(iframeDoc, dialog) {
        if (iframeDoc.getElementById('hbx-discord-banner')) return;

        if (!iframeDoc.getElementById('hbx-discord-banner-css')) {
            var style = iframeDoc.createElement('style');
            style.id = 'hbx-discord-banner-css';
            style.textContent =
                '#hbx-discord-banner{display:flex;align-items:center;gap:10px;justify-content:space-between;' +
                'background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);border-radius:8px;' +
                'padding:9px 14px;margin-bottom:12px;font-family:"Outfit","Inter",-apple-system,sans-serif;' +
                'font-size:12px;color:var(--theme-text-primary,#f2f2f5);flex-shrink:0;}' +
                '#hbx-discord-banner.hbx-hidden{display:none;}' +
                '#hbx-discord-banner-btn{background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.18);' +
                'color:var(--theme-text-primary,#f2f2f5);font-weight:700;font-size:10.5px;letter-spacing:0.6px;' +
                'text-transform:uppercase;padding:6px 12px;border-radius:6px;cursor:pointer;flex-shrink:0;}' +
                '#hbx-discord-banner-btn:hover{background:rgba(255,255,255,0.2);}';
            iframeDoc.head.appendChild(style);
        }

        var banner = iframeDoc.createElement('div');
        banner.id = 'hbx-discord-banner';
        banner.className = 'hbx-hidden'; // nace oculto; se revela recien cuando sabemos el estado
        banner.innerHTML =
            '<span id="hbx-discord-banner-text">No estás conectado con Discord</span>' +
            '<button id="hbx-discord-banner-btn">Conectar</button>';

        // Se inserta debajo del buscador ("Buscar salas...") y arriba del
        // encabezado/tabla de salas — no al principio del dialog (ahi
        // pisaba el titulo y el contador de jugadores).
        var searchBar = iframeDoc.getElementById('room-search') || dialog.querySelector('.search');
        if (searchBar && searchBar.parentNode) {
            searchBar.parentNode.insertBefore(banner, searchBar.nextSibling);
        } else {
            var headerTable = dialog.querySelector('table.header');
            var contentEl = dialog.querySelector('.content');
            var anchor = headerTable || contentEl;
            if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(banner, anchor);
            else dialog.insertBefore(banner, dialog.firstChild);
        }

        banner.querySelector('#hbx-discord-banner-btn').addEventListener('click', function () {
            var origen = origenDelPadre();
            if (!origen) return;
            try { window.parent.postMessage({ type: 'HBX_DISCORD_CONNECT_REQUEST' }, origen); } catch (e) {}
        });

        updateDiscordBanner();
        // Se pide el estado en el momento de dibujar el banner. Antes se
        // dependia solo del ciclo de consulta (cada 5s), asi que si ya
        // estabas vinculado el banner podia quedar diciendo "no estas
        // conectado" hasta 5 segundos antes de corregirse.
        requestDiscordStatus();
    }

    function updateDiscordBanner() {
        var banner = document.getElementById('hbx-discord-banner');
        if (!banner) return;
        // Oculto si ya esta vinculado, y tambien mientras todavia no
        // sabemos (asi no parpadea un cartel equivocado al abrir).
        if (discordLink.status === 'linked' || discordLink.status === 'unknown') {
            banner.classList.add('hbx-hidden');
        } else {
            banner.classList.remove('hbx-hidden');
            var text = banner.querySelector('#hbx-discord-banner-text');
            if (text) {
                text.textContent = discordLink.status === 'pending'
                    ? 'Vinculando con Discord…'
                    : 'No estás conectado con Discord';
            }
        }
    }

    function buildCardSkinCss() {
        return '' +
        '.roomlist-view .dialog.hbx-cardskin{background:#000 !important;border:1px solid rgba(255,255,255,0.14) !important;border-radius:4px !important;padding:38px 44px !important;display:flex !important;flex-direction:column !important;max-height:88vh !important;overflow:hidden !important;font-family:"Outfit","Inter",-apple-system,sans-serif !important;}' +
        '.hbx-cardskin-title-row{display:flex;justify-content:space-between;align-items:flex-end;flex-shrink:0;margin-bottom:24px;gap:20px;}' +
        '.hbx-cardskin-title{font-size:52px;font-weight:800;line-height:0.92;letter-spacing:-1px;color:#fff;text-transform:uppercase;margin:0;}' +
        '.hbx-cardskin-stats{font-family:"DM Mono",monospace;color:#8b8b96;font-size:12.5px;text-align:right;line-height:1.6;white-space:nowrap;flex-shrink:0;}' +
        '.hbx-cardskin-hr{height:1px;background:rgba(255,255,255,0.15);margin:0 0 22px 0;flex-shrink:0;}' +
        '.hbx-cardskin-sep{height:1px;background:rgba(255,255,255,0.15);margin-bottom:20px;flex-shrink:0;}' +
        '.roomlist-view .dialog.hbx-cardskin table.header{display:none !important;}' +
        '.roomlist-view .dialog.hbx-cardskin #room-search{padding:0 0 18px 0 !important;flex-shrink:0;}' +
        '.roomlist-view .dialog.hbx-cardskin #room-search svg{stroke:#555 !important;}' +
        '.roomlist-view .dialog.hbx-cardskin #room-search-input{background:none !important;border:none !important;border-bottom:1px solid rgba(255,255,255,0.15) !important;border-radius:0 !important;color:#fff !important;font-family:"DM Mono",monospace !important;font-size:14px !important;padding:6px 0 !important;}' +
        '.roomlist-view .dialog.hbx-cardskin #country-filter-btn{background:none !important;border:1px solid rgba(255,255,255,0.25) !important;color:#ccc !important;font-family:"DM Mono",monospace !important;border-radius:2px !important;letter-spacing:1px;}' +
        '.roomlist-view .dialog.hbx-cardskin .content{flex:1 1 auto !important;overflow-y:auto !important;min-height:0 !important;margin:0 -6px !important;padding:0 6px !important;}' +
        '.roomlist-view .dialog.hbx-cardskin .content table{display:none !important;}' +
        '#hbx-card-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;padding-bottom:8px;}' +
        '.hbx-room-card{background:#0c0c0e;border:1px solid rgba(255,255,255,0.08);border-radius:2px;padding:18px 18px 16px;cursor:pointer;transition:transform .15s ease,background .15s ease,color .15s ease;color:#fff;}' +
        '.hbx-room-card:hover{background:#fff !important;color:#08080a !important;transform:rotate(-1deg) scale(1.02);position:relative;z-index:2;box-shadow:0 10px 30px rgba(0,0,0,0.4);}' +
        '.hbx-room-card:hover .hbx-room-meta{color:#55555c !important;}' +
        '.hbx-room-card.hbx-has-password{opacity:0.55;}' +
        '.hbx-room-card.hbx-pinned{border-color:rgba(59,130,246,0.5);}' +
        '.hbx-room-name{font-size:16.5px;font-weight:800;text-transform:uppercase;margin-bottom:14px;word-break:break-word;}' +
        '.hbx-room-meta{display:flex;justify-content:space-between;align-items:center;font-family:"DM Mono",monospace;font-size:11px;color:#8b8b96;letter-spacing:0.3px;}' +
        '.hbx-room-meta .flagico{width:18px;height:13px;display:inline-block;margin-left:8px;flex-shrink:0;}';
    }

    // ── "Indexskin" (pedido 2026-08-22): la lista de salas adaptada al
    // mockup que mando el usuario (index.html) — tarjeta oscura translucida
    // con esquinas redondeadas, buscador en pildora, columnas NOMBRE/
    // JUGADORES (se esconde la de Password, que ya se resuelve atenuando
    // la fila con .has-password) y flag antes del nombre. No cambia la
    // estructura real: solo CSS + reordenar columnas con flex, asi que
    // favoritos/fijados/menu contextual/filtro de pais siguen igual.
    function injectIndexSkinCss(iframeDoc) {
        if (iframeDoc.getElementById('hbx-indexskin-css')) return;
        var style = iframeDoc.createElement('style');
        style.id = 'hbx-indexskin-css';
        style.textContent = '' +
            '.roomlist-view .dialog{background:rgba(36,47,58,0.92) !important;border-radius:10px !important;border:1px solid rgba(255,255,255,0.05) !important;box-shadow:0 15px 35px rgba(0,0,0,0.4) !important;}' +
            '.roomlist-view .dialog>h1{font-size:20px !important;font-weight:500 !important;color:rgba(255,255,255,0.9) !important;text-align:center !important;}' +
            '.roomlist-view .dialog p[data-hook="numplayers"]{font-size:12.5px !important;color:rgba(255,255,255,0.4) !important;position:absolute !important;top:17px;right:26px;margin:0 !important;}' +
            '#hbx-discord-banner{background:rgba(0,0,0,0.15) !important;border-radius:6px !important;border:1px solid rgba(255,255,255,0.08) !important;padding:12px 20px !important;}' +
            '#hbx-discord-banner-btn{background:#2b4ba7 !important;color:#fff !important;padding:6px 18px !important;border-radius:4px !important;font-weight:700 !important;font-size:11px !important;letter-spacing:0.5px !important;text-transform:uppercase !important;border:none !important;}' +
            '#hbx-discord-banner-btn:hover{background:#356 !important;}' +
            '#room-search-input{background:rgba(0,0,0,0.25) !important;border:1px solid rgba(255,255,255,0.1) !important;border-radius:6px !important;padding:10px 14px !important;font-size:14.5px !important;}' +
            '#room-search svg{stroke:rgba(255,255,255,0.4) !important;}' +
            '#country-filter-btn{background:rgba(255,255,255,0.05) !important;border-radius:6px !important;}' +
            'table.header{background:rgba(0,0,0,0.05) !important;border-bottom:1px solid rgba(255,255,255,0.05) !important;}' +
            'table.header tr{display:flex !important;padding-left:46px;box-sizing:border-box;}' +
            'table.header td{padding:8px 25px !important;font-size:11px !important;font-weight:600 !important;color:rgba(255,255,255,0.45) !important;text-transform:uppercase !important;letter-spacing:0.3px;background:none !important;border:none !important;}' +
            'table.header td:nth-child(1){flex:1 1 auto;}' +
            'table.header td:nth-child(2){width:80px;flex-shrink:0;text-align:right;}' +
            'table.header td:nth-child(3){display:none !important;}' +
            '.roomlist-view .content tbody[data-hook="list"] tr{display:flex !important;align-items:center;padding:7px 25px !important;border-bottom:1px solid rgba(255,255,255,0.02) !important;cursor:pointer;}' +
            '.roomlist-view .content tbody[data-hook="list"] tr:hover{background:rgba(255,255,255,0.04) !important;}' +
            '.roomlist-view .content tbody[data-hook="list"] tr td{display:flex !important;align-items:center;box-sizing:border-box;padding:0 !important;border:none !important;background:none !important;font-size:13px;color:rgba(255,255,255,0.85);}' +
            '.roomlist-view .content tbody[data-hook="list"] tr td[data-hook="flag"]{order:1;width:34px;flex-shrink:0;justify-content:center;margin-right:8px;}' +
            '.roomlist-view .content tbody[data-hook="list"] tr td[data-hook="name"]{order:2;flex:1 1 auto;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block !important;}' +
            '.roomlist-view .content tbody[data-hook="list"] tr td[data-hook="players"]{order:3;width:80px;flex-shrink:0;justify-content:flex-end;font-weight:500;}' +
            '.roomlist-view .content tbody[data-hook="list"] tr td[data-hook="pass"]{display:none !important;}' +
            '#sidebar-panel{background:rgba(36,47,58,0.92) !important;border:1px solid rgba(255,255,255,0.05) !important;border-radius:10px !important;}' +
            '#sidebar-panel button{width:30px !important;height:30px !important;background:rgba(255,255,255,0.07) !important;border:1px solid rgba(255,255,255,0.1) !important;border-radius:6px !important;color:rgba(255,255,255,0.6) !important;display:flex;align-items:center;justify-content:center;}' +
            '#sidebar-panel button:hover{background:rgba(255,255,255,0.12) !important;color:rgba(255,255,255,0.9) !important;}' +
            '#fav-filter-btn.hbx-active{background:#eab308 !important;color:#1a202c !important;border:none !important;box-shadow:0 0 10px rgba(234,179,8,0.3);}';
        iframeDoc.head.appendChild(style);
    }

    var _cachedAccent = '';
    function getAccentColor() {
        if (!_cachedAccent) _cachedAccent = getComputedStyle(document.documentElement).getPropertyValue('--theme-text-secondary').trim() || '#f59e0b';
        return _cachedAccent;
    }
    new MutationObserver(function() { _cachedAccent = ''; }).observe(document.documentElement, { attributes: true, attributeFilter: ['style', 'data-theme'] });

    var FAV_STORAGE_KEY = 'fav_rooms';

    function getFavRooms() {
        try {
            return JSON.parse(localStorage.getItem(FAV_STORAGE_KEY) || '[]');
        } catch (e) {
            return [];
        }
    }

    function saveFavRooms(rooms) {
        localStorage.setItem(FAV_STORAGE_KEY, JSON.stringify(rooms));
    }

    function toggleFavRoom(roomName) {
        var cleanName = roomName.trim();
        var favRooms = getFavRooms();
        var index = favRooms.indexOf(cleanName);

        if (index === -1) {
            favRooms.push(cleanName);
            saveFavRooms(favRooms);
            return true;
        } else {
            favRooms.splice(index, 1);
            saveFavRooms(favRooms);
            return false;
        }
    }

    function isFavRoom(roomName) {
        return getFavRooms().indexOf(roomName) !== -1;
    }

    var PINNED_STORAGE_KEY = 'pinned_rooms';

    function getPinnedRooms() {
        try {
            return JSON.parse(sessionStorage.getItem(PINNED_STORAGE_KEY) || '[]');
        } catch (e) {
            return [];
        }
    }

    function savePinnedRooms(rooms) {
        sessionStorage.setItem(PINNED_STORAGE_KEY, JSON.stringify(rooms));
    }

    function togglePinnedRoom(roomName) {
        var cleanName = roomName.trim();
        var pinnedRooms = getPinnedRooms();
        var index = pinnedRooms.indexOf(cleanName);

        if (index === -1) {
            pinnedRooms.push(cleanName);
            savePinnedRooms(pinnedRooms);
            return true;
        } else {
            pinnedRooms.splice(index, 1);
            savePinnedRooms(pinnedRooms);
            return false;
        }
    }

    function isPinnedRoom(roomName) {
        return getPinnedRooms().indexOf(roomName.trim()) !== -1;
    }

    function clearPinnedRooms() {
        sessionStorage.removeItem(PINNED_STORAGE_KEY);
    }

    function movePinnedToTop(listContainer) {
        if (!listContainer) return;
        var pinned = getPinnedRooms();
        if (!pinned.length) return;
        var rows = listContainer.querySelectorAll('tr');
        var pinnedArr = [];
        for (var i = 0; i < rows.length; i++) {
            var nc = rows[i].querySelector('[data-hook="name"]');
            if (nc && pinned.indexOf((nc.textContent||'').trim()) !== -1) pinnedArr.push(rows[i]);
        }
        if (!pinnedArr.length) return;
        if (rows[0] === pinnedArr[0] && pinnedArr.length === 1) return;
        for (var j = pinnedArr.length - 1; j >= 0; j--) listContainer.prepend(pinnedArr[j]);
    }

    function updatePinnedHighlight(container) {
        var rows = container.querySelectorAll('tr');
        var pinnedRooms = getPinnedRooms();

        for (var i = 0; i < rows.length; i++) {
            var nameCell = rows[i].querySelector('[data-hook="name"]');
            if (!nameCell) continue;
            var name = (nameCell.textContent || '').trim();
            if (pinnedRooms.indexOf(name) !== -1) {
                rows[i].classList.add('pinned-room');
            } else {
                rows[i].classList.remove('pinned-room');
            }
        }
    }

    function cleanupRoomList() {
        if (roomListObserver) {
            roomListObserver.disconnect();
            roomListObserver = null;
        }
        cachedRows = null;
    }

    function buildCache(iframeDoc) {
        var table = iframeDoc.querySelector("[data-hook='list']");
        if (!table) return [];

        cachedRows = [];
        var rows = table.querySelectorAll('tr');
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var nameCell = row.querySelector("[data-hook='name']");
            var flagCell = row.querySelector("[data-hook='flag']");
            cachedRows.push({
                row: row,
                name: nameCell ? (nameCell.textContent || '').toLowerCase() : '',
                country: (function(fc) { if(!fc) return ''; var cls = fc.className; var idx = cls.indexOf('f-'); return idx !== -1 ? cls.slice(idx+2).split(' ')[0] : ''; })(flagCell)
            });
        }
        return cachedRows;
    }

    function doSearch(iframeDoc, searchTerm) {
        cachedRows = buildCache(iframeDoc);
        var rows = cachedRows || [];
        var len = rows.length;
        if (!len) return;
        var all = selectedCountry === 'all';
        var empty = searchTerm === '';
        for (var i = 0; i < len; i++) {
            var item = rows[i];
            var ok = (empty || item.name.indexOf(searchTerm) !== -1) && (all || item.country === selectedCountry);
            item.row.classList.toggle('search-hidden', !ok);
        }
        if (HBX_CARDSKIN) {
            var lc = iframeDoc.querySelector('.roomlist-view tbody[data-hook="list"]');
            if (lc) renderCardGrid(iframeDoc, lc);
        }
    }

    // Reemplaza (sin tocarla) la vista de tabla por una grilla de tarjetas.
    // La tabla real sigue existiendo escondida: cada tarjeta solo reenvia los
    // eventos de mouse a su <tr> correspondiente, asi toda la logica real del
    // juego (seleccionar sala, unirse, menu de fijar/favorito) sigue intacta.
    function forwardMouseSeries(el, type) {
        var doc = el.ownerDocument;
        var view = doc && doc.defaultView;
        var seq = type === 'dblclick' ? ['mousedown', 'mouseup', 'click', 'mousedown', 'mouseup', 'dblclick'] : ['mousedown', 'mouseup', 'click'];
        for (var i = 0; i < seq.length; i++) {
            try { el.dispatchEvent(new MouseEvent(seq[i], { bubbles: true, cancelable: true, view: view })); } catch (e) {}
        }
    }

    function renderCardGrid(iframeDoc, listContainer) {
        if (!HBX_CARDSKIN) return;
        var content = listContainer.closest ? listContainer.closest('.content') : null;
        if (!content) return;

        var grid = iframeDoc.getElementById('hbx-card-grid');
        if (!grid) {
            grid = iframeDoc.createElement('div');
            grid.id = 'hbx-card-grid';
            content.appendChild(grid);
        }

        var statsEl = iframeDoc.getElementById('hbx-cardskin-stats');
        if (statsEl) {
            var dlg = content.closest ? content.closest('.dialog') : null;
            var statsP = dlg ? dlg.querySelector('p:not([data-hook])') : null;
            if (statsP) statsEl.textContent = statsP.textContent;
        }

        var t = window.__t || function(k) { return k; };
        var rows = listContainer.querySelectorAll('tr');
        var frag = iframeDoc.createDocumentFragment();

        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            if (row.classList.contains('search-hidden') || row.classList.contains('fav-hidden')) continue;

            var nameCell = row.querySelector('[data-hook="name"]');
            var name = nameCell ? nameCell.textContent.trim() : '';
            if (!name) continue;

            var playersCell = row.querySelector('[data-hook="players"]');
            var players = playersCell ? playersCell.textContent.trim() : '';

            var flagCell = row.querySelector('[data-hook="flag"]');
            var country = '';
            if (flagCell) {
                var cls = flagCell.className;
                var idx = cls.indexOf('f-');
                if (idx !== -1) country = cls.slice(idx + 2).split(' ')[0];
            }

            var card = iframeDoc.createElement('div');
            card.className = 'hbx-room-card';
            if (row.classList.contains('has-password')) card.classList.add('hbx-has-password');
            if (row.classList.contains('pinned-room')) card.classList.add('hbx-pinned');

            var safeName = name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            var flagHtml = country ? '<span class="flagico f-' + country + '"></span>' : '';
            card.innerHTML =
                '<div class="hbx-room-name">' + safeName + '</div>' +
                '<div class="hbx-room-meta"><span>' + (players ? players + ' ' + t('JUGADORES') : '') + '</span>' + flagHtml + '</div>';

            (function (realRow, cardEl) {
                cardEl.addEventListener('click', function () { forwardMouseSeries(realRow, 'click'); });
                cardEl.addEventListener('dblclick', function () { forwardMouseSeries(realRow, 'dblclick'); });
                cardEl.addEventListener('contextmenu', function (e) {
                    e.preventDefault();
                    try {
                        realRow.dispatchEvent(new MouseEvent('contextmenu', {
                            bubbles: true, cancelable: true, view: realRow.ownerDocument.defaultView,
                            clientX: e.clientX, clientY: e.clientY
                        }));
                    } catch (err) {}
                });
            })(row, card);

            frag.appendChild(card);
        }

        grid.innerHTML = '';
        grid.appendChild(frag);
    }

    // Arma el encabezado nuevo (titulo grande + contador) una sola vez.
    function buildCardSkinHeader(iframeDoc, dialog) {
        if (iframeDoc.getElementById('hbx-cardskin-header')) return;

        if (!iframeDoc.getElementById('hbx-cardskin-css')) {
            var style = iframeDoc.createElement('style');
            style.id = 'hbx-cardskin-css';
            style.textContent = buildCardSkinCss();
            iframeDoc.head.appendChild(style);
        }

        dialog.classList.add('hbx-cardskin');

        var t = window.__t || function (k) { return k; };

        var titleRow = iframeDoc.createElement('div');
        titleRow.id = 'hbx-cardskin-header';
        titleRow.className = 'hbx-cardskin-title-row';
        titleRow.innerHTML =
            '<h1 class="hbx-cardskin-title">' + t('Salas Activas') + '</h1>' +
            '<div class="hbx-cardskin-stats" id="hbx-cardskin-stats"></div>';
        dialog.insertBefore(titleRow, dialog.firstChild);

        var hr1 = iframeDoc.createElement('div');
        hr1.className = 'hbx-cardskin-hr';
        titleRow.parentNode.insertBefore(hr1, titleRow.nextSibling);

        // El separador entre el buscador y las tarjetas: todo lo que queda
        // despues de esta linea es lo unico que scrollea (la tabla real,
        // escondida, y la grilla de tarjetas viven adentro de ".content",
        // que ya tiene el scroll propio via CSS).
        var content = dialog.querySelector('.content');
        if (content) {
            var sep = iframeDoc.createElement('div');
            sep.className = 'hbx-cardskin-sep';
            content.parentNode.insertBefore(sep, content);
        }
    }

    function modifyRoomList(iframeDoc) {
        var listContainer = iframeDoc.querySelector('.roomlist-view tbody[data-hook="list"]');
        var roomlistView = iframeDoc.querySelector('.roomlist-view');

        if (!listContainer || !roomlistView) {
            cleanupRoomList();
            return;
        }

        var dialog = roomlistView.querySelector('.dialog');
        if (!dialog) return;

        injectIndexSkinCss(iframeDoc);
        if (HBX_CARDSKIN) buildCardSkinHeader(iframeDoc, dialog);
        buildDiscordBanner(iframeDoc, dialog);

        if (!iframeDoc.getElementById('sidebar-panel')) {
            if (!iframeDoc.getElementById('roomlist-search-style')) {
                var searchStyle = iframeDoc.createElement('style');
                searchStyle.id = 'roomlist-search-style';
                searchStyle.textContent = 'tr.search-hidden{display:none!important;}';
                iframeDoc.head.appendChild(searchStyle);
            }
            var tooltip = iframeDoc.createElement('div');
            tooltip.id = 'sidebar-tooltip';
            tooltip.style.cssText = 'position:fixed;background:var(--theme-tooltip-bg, #222);color:var(--theme-text-primary, #fff);padding:6px 10px;border-radius:6px;font-size:12px;pointer-events:none;opacity:0;transition:opacity 0.15s;z-index:10000;white-space:nowrap;border:1px solid var(--theme-tooltip-border, #333);box-shadow:0 4px 16px rgba(0,0,0,0.3);';
            iframeDoc.body.appendChild(tooltip);

            function showTooltip(el, text) {
                var rect = el.getBoundingClientRect();
                tooltip.textContent = text;
                tooltip.style.left = (rect.right + 8) + 'px';
                tooltip.style.top = (rect.top + rect.height / 2 - 12) + 'px';
                tooltip.style.opacity = '1';
            }

            function hideTooltip() {
                tooltip.style.opacity = '0';
            }

            function addTooltip(el, text) {
                if (!el) return;
                el.addEventListener('mouseenter', function() { showTooltip(el, text); });
                el.addEventListener('mouseleave', hideTooltip);
                el.addEventListener('click', hideTooltip);
            }

            var sidebar = iframeDoc.createElement('div');
            sidebar.id = 'sidebar-panel';
            // z-index EN POSITIVO (antes -1): con -1 el sidebar quedaba
            // pintado por detras de cualquier fondo/overlay del dialogo (el
            // dialog no arma su propio contexto de apilamiento solo con
            // position:relative, asi que ese -1 se comparaba contra el
            // stacking context de mas arriba y el panel entero -- todos los
            // botones de accion, favoritos, volver -- terminaba invisible
            // aunque siguiera ahi y ocupando lugar).
            sidebar.style.cssText = 'position:absolute;right:-50px;top:5px;bottom:5px;width:50px;background:var(--theme-bg-primary, #141414);border:1px solid var(--theme-border, #232323);border-radius:0 8px 8px 0;display:flex;flex-direction:column;gap:8px;padding:10px 6px;box-sizing:border-box;z-index:1;';

            sidebar.addEventListener('mouseleave', hideTooltip);

            var refreshBtn = iframeDoc.querySelector('.roomlist-view button[data-hook="refresh"]');
            var joinBtn = iframeDoc.querySelector('.roomlist-view button[data-hook="join"]');
            var createBtn = iframeDoc.querySelector('.roomlist-view button[data-hook="create"]');
            var replaysLabel = iframeDoc.querySelector('.roomlist-view label[for="replayfile"]');
            var settingsBtn = iframeDoc.querySelector('.roomlist-view button[data-hook="settings"]');

            if (refreshBtn) {
                refreshBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 11-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>';
                var t = window.__t || function(k) { return k; };
                addTooltip(refreshBtn, t('Atualizar'));
                sidebar.appendChild(refreshBtn);
            }
            if (joinBtn) {
                var joinWrapper = iframeDoc.createElement('div');
                joinWrapper.style.cssText = 'display:flex;justify-content:center;';
                joinBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/></svg>';
                addTooltip(joinWrapper, t('Entrar'));
                joinWrapper.appendChild(joinBtn);
                sidebar.appendChild(joinWrapper);
            }
            if (createBtn) {
                createBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14"/><path d="M5 12h14"/></svg>';
                addTooltip(createBtn, t('Criar Sala'));
                sidebar.appendChild(createBtn);
            }

            var sep = iframeDoc.createElement('div');
            sep.style.cssText = 'height:1px;background:var(--theme-border,#232323);margin:2px 4px;flex-shrink:0';
            sidebar.appendChild(sep);

            var favBtn = iframeDoc.createElement('button');
            favBtn.id = 'fav-filter-btn';
            addTooltip(favBtn, t('Favoritos'));
            favBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>';
            favBtn.onclick = function() {
                isFilteringFavs = !isFilteringFavs;
                var svgEl = favBtn.querySelector('svg');
                if (isFilteringFavs) {
                    var ac = getAccentColor();
                    svgEl.setAttribute('fill', ac);
                    svgEl.setAttribute('stroke', ac);
                    var favRooms = getFavRooms();
                    if (favRooms.length === 0) { isFilteringFavs = false; svgEl.setAttribute('fill','none'); svgEl.setAttribute('stroke','currentColor'); favBtn.classList.remove('hbx-active'); return; }
                    favBtn.classList.add('hbx-active');
                    var rows = listContainer.querySelectorAll('tr');
                    for (var i = 0; i < rows.length; i++) {
                        var nameEl = rows[i].querySelector('[data-hook="name"]');
                        if (!nameEl) continue;
                        var rn = (nameEl.textContent || '').trim();
                        rows[i].classList.toggle('fav-hidden', favRooms.indexOf(rn) === -1);
                    }
                } else {
                    svgEl.setAttribute('fill', 'none');
                    svgEl.setAttribute('stroke', 'currentColor');
                    favBtn.classList.remove('hbx-active');
                    var rows = listContainer.querySelectorAll('tr');
                    for (var i = 0; i < rows.length; i++) rows[i].classList.remove('fav-hidden');
                }
                if (HBX_CARDSKIN) renderCardGrid(iframeDoc, listContainer);
            };
            sidebar.appendChild(favBtn);

            var spacer = iframeDoc.createElement('div');
            spacer.style.cssText = 'flex:1;';
            sidebar.appendChild(spacer);

            if (replaysLabel) {
                replaysLabel.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
                addTooltip(replaysLabel, t('Replays'));
                sidebar.appendChild(replaysLabel);
            }
            if (settingsBtn) {
                settingsBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>';
                addTooltip(settingsBtn, t('Configurações'));
                sidebar.appendChild(settingsBtn);
            }

            var buttonsContainer = iframeDoc.querySelector('.roomlist-view .buttons');
            if (buttonsContainer) {
                buttonsContainer.style.display = 'none';
            }

            var backBtn = iframeDoc.createElement('button');
            backBtn.id = 'back-btn';
            addTooltip(backBtn, t('Voltar'));
            backBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>';
            backBtn.onclick = function() {
                window.top.location.reload();
            };
            sidebar.insertBefore(backBtn, sidebar.firstChild);

            dialog.style.position = 'relative';
            dialog.appendChild(sidebar);

            if (refreshBtn) {
                refreshBtn.addEventListener('click', function() {
                    cachedRows = null;
                    isFilteringFavs = false;
                    var favBtnEl = iframeDoc.getElementById('fav-filter-btn');
                    if (favBtnEl) {
                        var favSvgR = favBtnEl.querySelector('svg');
                        if (favSvgR) {
                            favSvgR.setAttribute('fill', 'none');
                            favSvgR.setAttribute('stroke', 'currentColor');
                            isFilteringFavs = false;
                        }
                    }
                });
            }

            var contextMenu = null;

            function createContextMenu() {
                var menu = iframeDoc.createElement('div');
                menu.id = 'room-context-menu';
                menu.style.cssText = 'position:fixed;background:var(--theme-bg-secondary, #1a1a1a);border:1px solid var(--theme-border-light, #333);border-radius:8px;padding:6px;min-width:180px;z-index:99999;box-shadow:0 8px 32px rgba(0,0,0,0.5);display:none;animation:ctxFadeIn .1s ease;';
                if (!iframeDoc.getElementById('ctx-menu-styles')) {
                    var ctxStyle = iframeDoc.createElement('style');
                    ctxStyle.id = 'ctx-menu-styles';
                    ctxStyle.textContent = '@keyframes ctxFadeIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}';
                    iframeDoc.head.appendChild(ctxStyle);
                }
                iframeDoc.body.appendChild(menu);
                return menu;
            }

            function showContextMenu(e, roomName) {
                e.preventDefault();
                if (!contextMenu) contextMenu = createContextMenu();

                var isFav = isFavRoom(roomName);
                var isPinned = isPinnedRoom(roomName);
                var _ac = getAccentColor(); var bookmarkIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="' + (isFav ? _ac : 'none') + '" stroke="' + (isFav ? _ac : 'var(--theme-text-secondary, #888)') + '" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>';
                var pinIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="' + (isPinned ? '#3b82f6' : 'none') + '" stroke="' + (isPinned ? '#3b82f6' : 'var(--theme-text-secondary, #888)') + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>';

                var t = window.__t || function(k) { return k; };
                contextMenu.innerHTML = '<div class="ctx-item ctx-pin" style="padding:10px 14px;cursor:pointer;color:var(--theme-text-primary, #fff);font-size:13px;display:flex;align-items:center;gap:10px;border-radius:6px;transition:background 0.1s;">' + pinIcon + '<span>' + (isPinned ? t('Desafixar Sala') : t('Fixar no Topo')) + '</span></div>' +
                    '<div class="ctx-item ctx-fav" style="padding:10px 14px;cursor:pointer;color:var(--theme-text-primary, #fff);font-size:13px;display:flex;align-items:center;gap:10px;border-radius:6px;transition:background 0.1s;">' + bookmarkIcon + '<span>' + (isFav ? t('Remover dos Favoritos') : t('Adicionar aos Favoritos')) + '</span></div>';

                var items = contextMenu.querySelectorAll('.ctx-item');
                for (var i = 0; i < items.length; i++) {
                    (function(item) {
                        item.onmouseenter = function() { item.style.background = 'rgba(255,255,255,0.05)'; };
                        item.onmouseleave = function() { item.style.background = ''; };
                    })(items[i]);
                }

                var pinItem = contextMenu.querySelector('.ctx-pin');
                pinItem.onclick = function() {
                    togglePinnedRoom(roomName);
                    contextMenu.style.display = 'none';
                    updatePinnedHighlight(listContainer);
                    movePinnedToTop(listContainer);
                    if (HBX_CARDSKIN) renderCardGrid(iframeDoc, listContainer);
                };

                var favItem = contextMenu.querySelector('.ctx-fav');
                favItem.onclick = function() {
                    toggleFavRoom(roomName);
                    contextMenu.style.display = 'none';
                    updateFavHighlight(listContainer);

                    if (isFilteringFavs && !isFavRoom(roomName)) {
                        var rows = listContainer.querySelectorAll('tr');
                        for (var i = 0; i < rows.length; i++) {
                            var nameCell = rows[i].querySelector('[data-hook="name"]');
                            if (nameCell && (nameCell.textContent || '').trim() === roomName) {
                                rows[i].classList.add('fav-hidden');
                            }
                        }
                    }
                    if (HBX_CARDSKIN) renderCardGrid(iframeDoc, listContainer);
                };

                contextMenu.style.display = 'block';
                var _mw = contextMenu.offsetWidth || 200;
                var _mh = contextMenu.offsetHeight || 80;
                var _vw = window.innerWidth || 800;
                var _vh = window.innerHeight || 600;
                var _x = Math.min(e.clientX, _vw - _mw - 8);
                var _y = Math.min(e.clientY, _vh - _mh - 8);
                contextMenu.style.left = Math.max(0, _x) + 'px';
                contextMenu.style.top = Math.max(0, _y) + 'px';
            }

            iframeDoc.addEventListener('click', function() {
                if (contextMenu) contextMenu.style.display = 'none';
            });

            iframeDoc.addEventListener('contextmenu', function(e) {
                var target = e.target;
                var row = target.closest ? target.closest('tr') : null;
                if (!row) {
                    var el = target;
                    while (el && el.tagName !== 'TR') el = el.parentElement;
                    row = el;
                }

                if (row && listContainer.contains(row)) {
                    var nameCell = row.querySelector('[data-hook="name"]');
                    if (nameCell) {
                        var roomName = (nameCell.textContent || '').trim();
                        if (roomName) showContextMenu(e, roomName);
                    }
                }
            });

            function updateFavHighlight(container) {
                var rows = container.querySelectorAll('tr');
                var favRooms = getFavRooms();

                for (var i = 0; i < rows.length; i++) {
                    var nameCell = rows[i].querySelector('[data-hook="name"]');
                    if (!nameCell) continue;
                    var name = (nameCell.textContent || '').trim();
                    if (favRooms.indexOf(name) !== -1) {
                        nameCell.classList.add('fav-room');
                    } else {
                        nameCell.classList.remove('fav-room');
                    }
                }
            }

            var observerTimeout = null;
            var isReordering = false;
            var favObserver = new MutationObserver(function(mutations) {
                if (isReordering) return;

                if (observerTimeout) clearTimeout(observerTimeout);
                observerTimeout = setTimeout(function() {
                    updateFavHighlight(listContainer);
                    updatePinnedHighlight(listContainer);
                    isReordering = true;
                    movePinnedToTop(listContainer);
                    isReordering = false;
                }, 100);
            });
            favObserver.observe(listContainer, { childList: true });
            updateFavHighlight(listContainer);
            updatePinnedHighlight(listContainer);
            movePinnedToTop(listContainer);
        }

        if (!iframeDoc.getElementById('room-search-input')) {
            var searchContainer = iframeDoc.createElement('div');
            searchContainer.id = 'room-search';
            searchContainer.style.cssText = 'padding:0 12px 8px 12px;display:flex;gap:8px;align-items:center;';

            var svgNS = 'http://www.w3.org/2000/svg';
            var svg = iframeDoc.createElementNS(svgNS, 'svg');
            svg.setAttribute('width', '16');
            svg.setAttribute('height', '16');
            svg.setAttribute('viewBox', '0 0 24 24');
            svg.setAttribute('fill', 'none');
            svg.setAttribute('stroke', '#666');
            svg.setAttribute('stroke-width', '2');
            var circle = iframeDoc.createElementNS(svgNS, 'circle');
            circle.setAttribute('cx', '11');
            circle.setAttribute('cy', '11');
            circle.setAttribute('r', '8');
            var path = iframeDoc.createElementNS(svgNS, 'path');
            path.setAttribute('d', 'm21 21-4.35-4.35');
            svg.appendChild(circle);
            svg.appendChild(path);

            var input = iframeDoc.createElement('input');
            input.type = 'text';
            input.id = 'room-search-input';
            var t = window.__t || function(k) { return k; };
            input.placeholder = t('Pesquisar salas...');
            input.autocomplete = 'off';
            input.style.cssText = 'flex:1;background:var(--theme-bg-secondary,#1a1a1a);border:1px solid var(--theme-border,#232323);border-radius:6px;padding:7px 12px;color:var(--theme-text-primary,#fff);font-size:13px;outline:none;transition:border-color .15s;';

            var _searchTimer = null;
            input.oninput = function() {
                var val = input.value;
                sessionStorage.setItem('roomlist_search_term', val);
                if (_searchTimer) clearTimeout(_searchTimer);
                _searchTimer = setTimeout(function() {
                    _searchTimer = null;
                    doSearch(iframeDoc, val.toLowerCase());
                }, 50);
            };

            input.onfocus = function() { input.style.borderColor = 'var(--theme-border-light, #444)'; };
            input.onblur = function() { input.style.borderColor = 'var(--theme-border-light, #333)'; };

            var savedSearch = sessionStorage.getItem('roomlist_search_term');
            if (savedSearch) {
                input.value = savedSearch;
                setTimeout(function() {
                    doSearch(iframeDoc, savedSearch.toLowerCase());
                }, 100);
            }

            var refreshBtn = iframeDoc.querySelector('[data-hook="refresh"]');
            if (refreshBtn) {
                refreshBtn.addEventListener('click', function() {
                    cachedRows = null;
                    setTimeout(function() {
                        doSearch(iframeDoc, input.value.toLowerCase());
                    }, 80);
                });
            }

            var filterBtn = iframeDoc.createElement('button');
            filterBtn.id = 'country-filter-btn';
            filterBtn.style.cssText = 'background:var(--theme-bg-tertiary, #272727);border:1px solid var(--theme-border, #232323);padding:0 10px;color:var(--theme-text-secondary, #888);cursor:pointer;display:flex;align-items:center;justify-content:center;border-radius:6px;font-size:12px;font-weight:600;height:34px;transition:background .15s,color .15s;';
            filterBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
            filterBtn.onmouseenter = function() { filterBtn.style.background = 'var(--theme-bg-hover, #333)'; filterBtn.style.color = 'var(--theme-text-primary, #fff)'; };
            filterBtn.onmouseleave = function() { if (selectedCountry === 'all') { filterBtn.style.background = 'var(--theme-bg-secondary, #1a1a1a)'; filterBtn.style.color = 'var(--theme-text-muted, #666)'; } };

            var dropdown = iframeDoc.createElement('div');
            dropdown.id = 'country-dropdown';
            dropdown.style.cssText = 'display:none;position:absolute;top:100%;right:0;background:var(--theme-bg-secondary, #1a1a1a);border:1px solid var(--theme-border-light, #333);border-radius:8px;max-height:240px;overflow-y:auto;z-index:1000;min-width:160px;margin-top:4px;box-shadow:0 8px 32px rgba(0,0,0,0.4);padding:4px 0;';

            var filterWrapper = iframeDoc.createElement('div');
            filterWrapper.style.cssText = 'position:relative;';
            filterWrapper.appendChild(filterBtn);
            filterWrapper.appendChild(dropdown);

            function updateCountryList() {
                var table = iframeDoc.querySelector("[data-hook='list']");
                if (!table) return;

                var countries = {};
                var rows = table.querySelectorAll('tr');
                for (var i = 0; i < rows.length; i++) {
                    var flagCell = rows[i].querySelector("[data-hook='flag']");
                    if (flagCell) {
                        var code = flagCell.className.replace('flagico f-', '').trim();
                        if (code) countries[code] = true;
                    }
                }

                dropdown.innerHTML = '';

                var sortedCountries = [];
                for (var c in countries) {
                    sortedCountries.push(c);
                }
                sortedCountries.sort();

                var t = window.__t || function(k) { return k; };
                var allItem = iframeDoc.createElement('div');
                allItem.style.cssText = 'padding:10px 14px;cursor:pointer;display:flex;align-items:center;gap:10px;border-radius:4px;margin:0 4px;';
                allItem.onmouseenter = function() { allItem.style.background = 'var(--theme-bg-tertiary, #272727)'; };
                allItem.onmouseleave = function() { allItem.style.background = ''; };
                allItem.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--theme-text-muted, #666)" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg><span style="color:var(--theme-text-primary, #fff);font-size:13px;">' + t('Todos os países') + '</span>';
                allItem.onclick = function() {
                    selectedCountry = 'all';
                    dropdown.style.display = 'none';
                    filterBtn.style.background = 'var(--theme-bg-secondary, #1a1a1a)';
                    filterBtn.style.color = 'var(--theme-text-muted, #666)';
                    filterBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
                    clearPinnedRooms();
                    updatePinnedHighlight(listContainer);
                    doSearch(iframeDoc, input.value.toLowerCase());
                };
                dropdown.appendChild(allItem);

                for (var j = 0; j < sortedCountries.length; j++) {
                    (function(code) {
                        var item = iframeDoc.createElement('div');
                        item.style.cssText = 'padding:10px 14px;cursor:pointer;display:flex;align-items:center;gap:10px;border-radius:4px;margin:0 4px;';
                        item.onmouseenter = function() { item.style.background = 'rgba(255,255,255,0.05)'; };
                        item.onmouseleave = function() { item.style.background = ''; };
                        item.innerHTML = '<span class="flagico f-' + code + '" style="width:20px;height:15px;display:inline-block;"></span><span style="color:var(--theme-text-primary, #fff);font-size:13px;">' + code.toUpperCase() + '</span>';

                        item.onclick = function() {
                            selectedCountry = code;
                            dropdown.style.display = 'none';
                            filterBtn.style.background = 'var(--theme-bg-hover, #333)';
                            filterBtn.style.color = 'var(--theme-text-primary, #fff)';
                            filterBtn.innerHTML = '<span style="font-size:12px;font-weight:600;">' + code.toUpperCase() + '</span>';
                            clearPinnedRooms();
                            updatePinnedHighlight(listContainer);
                            doSearch(iframeDoc, input.value.toLowerCase());
                        };

                        dropdown.appendChild(item);
                    })(sortedCountries[j]);
                }
            }

            filterBtn.onclick = function(e) {
                e.stopPropagation();
                updateCountryList();
                dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
            };

            iframeDoc.addEventListener('click', function() {
                dropdown.style.display = 'none';
            });

            searchContainer.appendChild(svg);
            searchContainer.appendChild(input);
            searchContainer.appendChild(filterWrapper);

            var dialog = roomlistView.querySelector('.dialog');
            if (dialog) {
                var headerTable = dialog.querySelector('table.header');
                if (headerTable && headerTable.parentNode) {
                    headerTable.parentNode.insertBefore(searchContainer, headerTable);
                } else {
                    var content = dialog.querySelector('.content');
                    if (content && content.parentNode) {
                        content.parentNode.insertBefore(searchContainer, content);
                    }
                }
            }
        }

        if (roomListObserver && listContainer.dataset.observing) return;
        listContainer.dataset.observing = 'true';

        // OPTIMIZACION DE RENDIMIENTO: esta funcion antes se enganchaba
        // directo al MutationObserver, SIN debounce, y siempre volvia a
        // recorrer TODAS las filas de la tabla (querySelectorAll('tr') +
        // un querySelector por fila) por cada tanda de mutaciones. Con la
        // lista global (puede tener 1000+ salas activas actualizandose todo
        // el tiempo), cada sala que entra/sale/cambia disparaba un recorrido
        // completo de la tabla entera, muchas veces por segundo — eso era
        // el lag/los bajones reportados. Ahora: (1) se debounce a 120ms para
        // agrupar rafagas de mutaciones en una sola pasada, y (2) solo se
        // procesan las filas realmente nuevas (rowsToCheck) en vez de la
        // tabla completa, salvo la primera carga o un caso raro no
        // contemplado donde se cae a un escaneo completo por las dudas.
        function applyPasswordOpacity(rowsToCheck) {
            var rows = rowsToCheck || listContainer.querySelectorAll('tr');
            for (var i = 0, len = rows.length; i < len; i++) {
                var pc = rows[i].querySelector('[data-hook="pass"]');
                if (pc) rows[i].classList.toggle('has-password', (pc.textContent||'').indexOf('Yes')!==-1);
            }
            if (HBX_CARDSKIN) renderCardGrid(iframeDoc, listContainer);
        }

        cleanupRoomList();

        var _pwTimer = null;
        var _pwPending = [];
        roomListObserver = new MutationObserver(function(mutations) {
            for (var i = 0; i < mutations.length; i++) {
                var added = mutations[i].addedNodes;
                for (var j = 0; j < added.length; j++) {
                    var node = added[j];
                    if (node.nodeType !== 1) continue;
                    if (_pwPending === null) continue; // ya se decidio hacer un escaneo completo esta vuelta
                    if (node.tagName === 'TR') _pwPending.push(node);
                    else _pwPending = null; // estructura inesperada -> respaldo seguro: escaneo completo
                }
            }
            if (_pwTimer) clearTimeout(_pwTimer);
            _pwTimer = setTimeout(function() {
                var toCheck = _pwPending;
                _pwPending = [];
                _pwTimer = null;
                if (toCheck === null) applyPasswordOpacity();
                else if (toCheck.length) applyPasswordOpacity(toCheck);
            }, 120);
        });
        roomListObserver.observe(listContainer, { childList: true });

        applyPasswordOpacity();
    }

    function init() {
        if (!Injector.isGameFrame()) return;

        function hideTooltipAndMenu() {
            var tooltip = document.getElementById('sidebar-tooltip');
            if (tooltip) tooltip.style.opacity = '0';
            var ctxMenu = document.getElementById('room-context-menu');
            if (ctxMenu) ctxMenu.remove();
        }

        function checkAndModify() {
            var roomlistView = document.querySelector('.roomlist-view');
            var sidebar = document.getElementById('sidebar-panel');
            if (roomlistView && !sidebar) modifyRoomList(document);
            else if (!roomlistView) hideTooltipAndMenu();
        }

        var _pendingCheck = false;
        function scheduleCheck() {
            if (_pendingCheck) return;
            _pendingCheck = true;
            requestAnimationFrame(function() {
                _pendingCheck = false;
                checkAndModify();
            });
        }

        var _rlObs = new MutationObserver(function(muts) {
            for (var i = 0; i < muts.length; i++) {
                var added = muts[i].addedNodes;
                var removed = muts[i].removedNodes;
                for (var j = 0; j < added.length; j++) {
                    if (added[j].nodeType === 1) { scheduleCheck(); return; }
                }
                for (var k = 0; k < removed.length; k++) {
                    if (removed[k].nodeType === 1) { scheduleCheck(); return; }
                }
            }
        });
        _rlObs.observe(document.body, { childList: true, subtree: true });

        Injector.onView('game-view', function() { hideTooltipAndMenu(); });
        checkAndModify();
        startDiscordStatusPolling();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
