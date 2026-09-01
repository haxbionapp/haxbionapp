(function () {
    if (window.__HAX_MENU_V12_LOADED) return;
    window.__HAX_MENU_V12_LOADED = true;

    const link = document.createElement('link');
    link.rel  = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Syne:wght@400;700;900&display=swap';
    document.head.appendChild(link);

    let shirt = {
        team: 'red', angle: 90,
        textColor: '#ffffff',
        c1: '#de0019', c2: '#b80017', c3: '#820217',
        count: 3
    };

    const $ = id => document.getElementById(id);

    function getGradient(s) {
        const ang = (parseInt(s.angle) || 0) + 90;
        if (s.count === 1) return s.c1;
        if (s.count === 2) return `linear-gradient(${ang}deg, ${s.c1} 50%, ${s.c2} 50%)`;
        return `linear-gradient(${ang}deg, ${s.c1} 33%, ${s.c2} 33% 66%, ${s.c3} 66%)`;
    }

    function syncPreview() {
        const p = $('hm-preview');
        if (!p) return;
        p.style.background = getGradient(shirt);
        p.style.color = shirt.textColor;
        $('hm-c2-row').style.display = shirt.count >= 2 ? 'flex' : 'none';
        $('hm-c3-row').style.display = shirt.count >= 3 ? 'flex' : 'none';
    }

    function updateInputs() {
        $('hm-team').value      = shirt.team;
        $('hm-mode').value      = shirt.count;
        $('hm-angle').value     = shirt.angle;
        $('hm-ctext').value     = shirt.textColor;
        $('hm-c1').value        = shirt.c1;
        $('hm-c2').value        = shirt.c2;
        $('hm-c3').value        = shirt.c3;
    }

    const CSS = `
        #hm-root {
            position: fixed; top: 50%; left: 20px;
            transform: translateY(-50%) translateX(-110%) scale(0.96);
            width: 250px;
            background: #080808;
            border: 1px solid rgba(255,255,255,0.07);
            border-radius: 16px;
            z-index: 999999;
            font-family: 'Syne', sans-serif;
            color: #fff;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-shadow: 0 32px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.04);
            opacity: 0;
            pointer-events: none;
            transition:
                transform 0.42s cubic-bezier(0.16, 1, 0.3, 1),
                opacity   0.42s cubic-bezier(0.16, 1, 0.3, 1);
            will-change: transform, opacity;
        }
        #hm-root.open {
            transform: translateY(-50%) translateX(0) scale(1);
            opacity: 1;
            pointer-events: all;
        }

        #hm-tabs {
            display: flex;
            background: #050505;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            position: relative;
        }
        .hm-tab {
            flex: 1; padding: 14px 8px;
            font-size: 9px; font-weight: 900;
            letter-spacing: 2.5px; text-transform: uppercase;
            color: rgba(255,255,255,0.2);
            background: none; border: none;
            cursor: pointer;
            transition: color 0.25s ease;
        }
        .hm-tab.active { color: #fff; }
        #hm-tab-bar {
            position: absolute; bottom: 0; height: 2px;
            background: #fff;
            box-shadow: 0 0 8px rgba(255,255,255,0.35);
            transition: left 0.35s cubic-bezier(0.16, 1, 0.3, 1);
            width: 50%;
        }

        #hm-close {
            position: absolute; top: 13px; right: 14px;
            background: none; border: none;
            color: rgba(255,255,255,0.18);
            font-size: 14px; cursor: pointer;
            line-height: 1;
            transition: color 0.2s ease;
            z-index: 10;
        }
        #hm-close:hover { color: rgba(255,255,255,0.6); }

        #hm-preview-wrap {
            padding: 20px;
            background: radial-gradient(circle at 50% 40%, #0d0d0d, #000);
            display: flex; justify-content: center; align-items: center;
        }
        #hm-preview {
            width: 70px; height: 70px; border-radius: 50%;
            border: 2px solid rgba(255,255,255,0.06);
            font-weight: 900; font-size: 20px;
            display: flex; align-items: center; justify-content: center;
            transition: background 0.3s ease;
            letter-spacing: 1px;
        }

        .hm-view { display: none; flex-direction: column; }
        .hm-view.active { display: flex; }

        #hm-studio { padding: 16px 18px 18px; gap: 10px; }
        .hm-row {
            display: flex; align-items: center;
            justify-content: space-between;
        }
        .hm-label {
            font-size: 9px; font-weight: 900;
            letter-spacing: 1.5px; text-transform: uppercase;
            color: rgba(255,255,255,0.3);
        }
        .hm-input {
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.08);
            color: #fff; padding: 6px 10px;
            border-radius: 6px; font-size: 10px;
            font-weight: 700; font-family: 'Syne', sans-serif;
            width: 100px; text-align: center; outline: none;
            transition: border-color 0.2s ease;
        }
        .hm-input:focus { border-color: rgba(255,255,255,0.25); }
        select.hm-input { cursor: pointer; }
        input[type="color"].hm-input {
            padding: 2px 4px; height: 30px; cursor: pointer;
            width: 60px;
        }

        #hm-btns { display: flex; flex-direction: column; gap: 6px; padding-top: 4px; }
        #hm-apply {
            background: #fff; color: #000;
            padding: 12px; border-radius: 8px;
            border: none; font-weight: 900; cursor: pointer;
            font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
            font-family: 'Syne', sans-serif;
            transition: opacity 0.2s ease, transform 0.15s ease;
        }
        #hm-apply:hover  { opacity: 0.88; }
        #hm-apply:active { transform: scale(0.97); }
        #hm-save {
            background: none; color: rgba(255,255,255,0.18);
            border: none; font-size: 8px; font-weight: 900;
            letter-spacing: 2px; text-transform: uppercase;
            cursor: pointer; padding: 6px;
            font-family: 'Syne', sans-serif;
            transition: color 0.2s ease;
        }
        #hm-save:hover { color: rgba(255,255,255,0.5); }

        #hm-library {
            padding: 14px; gap: 0;
            max-height: 340px; overflow-y: auto;
        }
        #hm-library::-webkit-scrollbar { width: 0; }
        .hm-lib-item {
            display: flex; align-items: center; gap: 12px;
            background: rgba(255,255,255,0.02);
            border: 1px solid rgba(255,255,255,0.05);
            padding: 11px 12px; border-radius: 10px;
            cursor: pointer; margin-bottom: 7px;
            transition: background 0.2s ease, border-color 0.2s ease;
        }
        .hm-lib-item:hover {
            background: rgba(255,255,255,0.05);
            border-color: rgba(255,255,255,0.1);
        }
        .hm-lib-dot {
            width: 28px; height: 28px; border-radius: 50%;
            border: 1.5px solid rgba(255,255,255,0.08);
            flex-shrink: 0;
        }
        .hm-lib-name {
            flex: 1; font-size: 10px; font-weight: 900;
            color: rgba(255,255,255,0.5);
            text-transform: uppercase; letter-spacing: 1.5px;
        }
        .hm-lib-del {
            color: rgba(255,255,255,0.15); font-size: 11px;
            background: none; border: none; cursor: pointer;
            padding: 4px; transition: color 0.2s ease;
            line-height: 1;
        }
        .hm-lib-del:hover { color: rgba(255,80,80,0.8); }
        .hm-empty {
            text-align: center; padding: 50px 20px;
            font-size: 9px; font-weight: 900;
            letter-spacing: 3px; color: rgba(255,255,255,0.08);
        }

        .hm-divider {
            height: 1px;
            background: rgba(255,255,255,0.05);
            margin: 4px 0 10px;
        }
    `;

    const HTML = `
        <button id="hm-close" title="Cerrar (F4)">✕</button>

        <div id="hm-tabs">
            <button class="hm-tab active" data-tab="studio">Design</button>
            <button class="hm-tab"        data-tab="library">Library</button>
            <div id="hm-tab-bar" style="left:0"></div>
        </div>

        <div id="hm-preview-wrap">
            <div id="hm-preview">TL</div>
        </div>

        <div id="hm-studio" class="hm-view active">
            <div class="hm-row">
                <span class="hm-label">Team</span>
                <select class="hm-input" id="hm-team">
                    <option value="red">RED</option>
                    <option value="blue">BLUE</option>
                </select>
            </div>
            <div class="hm-row">
                <span class="hm-label">Style</span>
                <select class="hm-input" id="hm-mode">
                    <option value="1">Solid</option>
                    <option value="2">Split</option>
                    <option value="3" selected>Triple</option>
                </select>
            </div>
            <div class="hm-row">
                <span class="hm-label">Angle</span>
                <input type="number" class="hm-input" id="hm-angle" value="90" min="0" max="360">
            </div>
            <div class="hm-divider"></div>
            <div class="hm-row">
                <span class="hm-label">Text color</span>
                <input type="color" class="hm-input" id="hm-ctext" value="#ffffff">
            </div>
            <div class="hm-row">
                <span class="hm-label">Color 1</span>
                <input type="color" class="hm-input" id="hm-c1" value="#de0019">
            </div>
            <div class="hm-row" id="hm-c2-row">
                <span class="hm-label">Color 2</span>
                <input type="color" class="hm-input" id="hm-c2" value="#b80017">
            </div>
            <div class="hm-row" id="hm-c3-row">
                <span class="hm-label">Color 3</span>
                <input type="color" class="hm-input" id="hm-c3" value="#820217">
            </div>
            <div id="hm-btns">
                <button id="hm-apply">Apply design</button>
                <button id="hm-save">Save to library</button>
            </div>
        </div>

        <div id="hm-library" class="hm-view"></div>
    `;

    function init() {
        const style = document.createElement('style');
        style.textContent = CSS;
        document.head.appendChild(style);

        const root = document.createElement('div');
        root.id = 'hm-root';
        root.innerHTML = HTML;
        document.body.appendChild(root);

        let activeTab = 'studio';

        function setTab(tab) {
            activeTab = tab;
            document.querySelectorAll('.hm-tab').forEach(b =>
                b.classList.toggle('active', b.dataset.tab === tab)
            );
            $('hm-tab-bar').style.left = tab === 'studio' ? '0' : '50%';
            $('hm-studio').classList.toggle('active',  tab === 'studio');
            $('hm-library').classList.toggle('active', tab === 'library');
            $('hm-preview-wrap').style.display = tab === 'studio' ? 'flex' : 'none';
            if (tab === 'library') renderLibrary();
        }

        document.querySelectorAll('.hm-tab').forEach(b =>
            b.addEventListener('click', () => setTab(b.dataset.tab))
        );

        function openMenu() {
            root.classList.add('open');
            syncPreview();
        }
        function closeMenu() {
            root.classList.remove('open');
        }
        function toggleMenu() {
            root.classList.contains('open') ? closeMenu() : openMenu();
        }

        $('hm-close').addEventListener('click', closeMenu);

        window.addEventListener('keydown', e => {
            if (e.key === 'F4') {
                e.stopImmediatePropagation();
                toggleMenu();
            }
        }, true);

        window.__haxToggleMenu = toggleMenu;

        function bind(id, key, parser) {
            const el = $(id);
            if (!el) return;
            el.addEventListener('input', e => {
                shirt[key] = parser ? parser(e.target.value) : e.target.value;
                syncPreview();
            });
        }

        bind('hm-team',  'team');
        bind('hm-mode',  'count', v => parseInt(v));
        bind('hm-angle', 'angle', v => parseInt(v) || 0);
        bind('hm-ctext', 'textColor');
        bind('hm-c1',    'c1');
        bind('hm-c2',    'c2');
        bind('hm-c3',    'c3');

        $('hm-apply').addEventListener('click', () => {
            const cl = c => c.replace('#', '');
            let cmd = `/colors ${shirt.team} ${shirt.angle} ${cl(shirt.textColor)} ${cl(shirt.c1)}`;
            if (shirt.count >= 2) cmd += ` ${cl(shirt.c2)}`;
            if (shirt.count === 3) cmd += ` ${cl(shirt.c3)}`;

            const chatInput =
                document.querySelector('[data-hook="input"]') ||
                document.querySelector('textarea[name="chat"]') ||
                document.querySelector('input[type="text"]');

            if (chatInput) {
                chatInput.value = cmd;
                chatInput.dispatchEvent(new Event('input',  { bubbles: true }));
                chatInput.dispatchEvent(new Event('change', { bubbles: true }));
                chatInput.focus();
            }
        });

        $('hm-save').addEventListener('click', () => {
            const name = prompt('Nombre del jersey:');
            if (!name?.trim()) return;
            const db = getDB();
            db.push({ ...shirt, name: name.trim() });
            saveDB(db);
        });

        function getDB()       { return JSON.parse(localStorage.getItem('hax_v12_db') || '[]'); }
        function saveDB(db)    { localStorage.setItem('hax_v12_db', JSON.stringify(db)); }

        function renderLibrary() {
            const lib = $('hm-library');
            const db  = getDB();

            if (!db.length) {
                lib.innerHTML = '<div class="hm-empty">LIBRARY EMPTY</div>';
                return;
            }

            lib.innerHTML = '';
            db.forEach((item, i) => {
                const row = document.createElement('div');
                row.className = 'hm-lib-item';

                const dot = document.createElement('div');
                dot.className = 'hm-lib-dot';
                dot.style.background = getGradient(item);

                const name = document.createElement('div');
                name.className = 'hm-lib-name';
                name.textContent = item.name;

                const del = document.createElement('button');
                del.className = 'hm-lib-del';
                del.textContent = '✕';
                del.title = 'Eliminar';
                del.addEventListener('click', e => {
                    e.stopPropagation();
                    const updated = getDB();
                    updated.splice(i, 1);
                    saveDB(updated);
                    renderLibrary();
                });

                row.appendChild(dot);
                row.appendChild(name);
                row.appendChild(del);

                row.addEventListener('click', () => {
                    shirt = { ...item };
                    updateInputs();
                    setTab('studio');
                    syncPreview();
                });

                lib.appendChild(row);
            });
        }

        updateInputs();
        syncPreview();
    }

    if (document.body) {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})();