(function() {
    if (Injector.isMainFrame()) return;

    const t = (key) => window.__t ? window.__t(key) : key;
    const STORAGE_KEY = 'hideui_settings';

    let settings = {
        hideChat: false,
        hideScoreboard: false,
        hidePingFps: false
    };

    const injectStyles = () => {
        const css = `
            body.h-chat .chatbox-view { visibility: hidden !important; pointer-events: none !important; }
            body.h-score .bar-container { visibility: hidden !important; pointer-events: none !important; }
            body.h-score .game-timer-view { display: none !important; }
            body.h-stats .stats-view { visibility: hidden !important; pointer-events: none !important; }
            .toggle-hbx { cursor: pointer; transition: opacity 0.2s; }
            .toggle-hbx:hover { opacity: 0.8; }
        `;
        Injector.injectCSS('hideui-core-styles', css);
    };

    const loadSettings = () => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) Object.assign(settings, JSON.parse(saved));
        } catch(e) {}
    };

    const saveSettings = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        applyStyles();
    };

    const applyStyles = () => {
        const b = document.body;
        b.classList.toggle('h-chat', settings.hideChat);
        b.classList.toggle('h-score', settings.hideScoreboard);
        b.classList.toggle('h-stats', settings.hidePingFps);
    };

    const createToggle = (id, label, key) => {
        if (document.getElementById(id)) return null;
        const wrapper = document.createElement('div');
        wrapper.id = id;
        wrapper.className = 'toggle toggle-hbx';
        wrapper.setAttribute('data-hook', id);

        const render = () => {
            const isAct = settings[key];
            wrapper.innerHTML = `<i class="${isAct ? 'icon-ok' : 'icon-cancel'}"></i><span>${label}</span>`;
        };

        wrapper.onclick = (e) => {
            e.preventDefault();
            settings[key] = !settings[key];
            render();
            saveSettings();
        };

        render();
        return wrapper;
    };

    const injectOptions = () => {
        const miscSection = document.querySelector('[data-hook="miscsec"]');
        if (!miscSection || document.getElementById('hideui-chat')) return;
        const lastToggle = miscSection.querySelector('[data-hook="tmisc-showchat"]');
        if (!lastToggle) return;

        const fragment = document.createDocumentFragment();
        fragment.appendChild(createToggle('hideui-chat', t('Ocultar Chat'), 'hideChat'));
        fragment.appendChild(createToggle('hideui-scoreboard', t('Ocultar Placar/Timer'), 'hideScoreboard'));
        fragment.appendChild(createToggle('hideui-pingfps', t('Ocultar Ping/FPS'), 'hidePingFps'));
        lastToggle.parentNode.insertBefore(fragment, lastToggle.nextSibling);
    };

    const initObservers = () => {
        
        const mainObserver = new MutationObserver((mutations) => {
            for (const m of mutations) {
                for (const node of m.addedNodes) {
                    if (node.nodeType === 1 && node.classList?.contains('settings-view')) {
                        setTimeout(injectOptions, 50);
                        return;
                    }
                }
            }
        });
        mainObserver.observe(document.body, { childList: true }); 

        
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-hook="miscbtn"], [data-hook-ref="miscbtn"]');
            if (target) setTimeout(injectOptions, 150);
        }, { passive: true });

    };

    const init = () => {
        if (!Injector.isGameFrame()) return;
        loadSettings();
        injectStyles();
        applyStyles();
        setTimeout(() => {
            initObservers();
            injectOptions();
        }, 1000);
    };

    if (document.readyState === 'complete') init();
    else window.addEventListener('load', init);
})();
