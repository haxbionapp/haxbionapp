(function () {
    if (Injector.isMainFrame()) return;

        (function() {
        var _n = function(k,d){ var v=parseFloat(localStorage.getItem(k)); return isNaN(v)?d:v; };
        window.grosorJugador = _n('hbx_grosor_jugador', 1);
        window.grosorPelota  = _n('hbx_grosor_pelota',  1);
        window.grosorCancha  = _n('hbx_grosor_cancha',  3);
        window.grosorArco    = _n('hbx_grosor_arco',    1);
        var _sf = localStorage.getItem('hbx_fuente_avatar');
        window.fuenteAvatar  = _sf || "900 34px 'Arial Black','Arial Bold',Gadget,sans-serif";
        window.jimer         = localStorage.getItem('hbx_jimer') === '1';
        window.jimer_turbo   = localStorage.getItem('hbx_jimer_turbo') === '1';
        var _jp = localStorage.getItem('hbx_jimer_ping');
        window.jimer_ping    = (_jp && _jp !== 'false') ? parseInt(_jp) : false;
    })();

    function applyStatsVisibility(doc, hidden) {
        try {
            var sv = doc.querySelector('.stats-view-container');
            if (!sv) return;
            var styleEl = doc.getElementById('hbx-hide-fps-style');
            if (!styleEl) {
                styleEl = doc.createElement('style');
                styleEl.id = 'hbx-hide-fps-style';
                (doc.head || doc.documentElement).appendChild(styleEl);
            }
            styleEl.textContent = hidden
                ? '.stats-view-container,.stats-view-container *{visibility:hidden!important;opacity:0!important;pointer-events:none!important;}'
                : '';
            sv.style.visibility = hidden ? 'hidden' : '';
            sv.style.opacity = hidden ? '0' : '';
            sv.style.pointerEvents = hidden ? 'none' : '';
        } catch (e) {}
    }

   
    (function() {
        if (window._hbxF8Blocked) return;
        window._hbxF8Blocked = true;
        document.addEventListener('keydown', function(e) {
            if (e.key === 'F8' || e.keyCode === 119) {
                e.stopImmediatePropagation();
            }
        }, true);
        try {
            if (window.top && window.top !== window) {
                window.top.addEventListener('keydown', function(e) {
                    if (e.key === 'F8' || e.keyCode === 119) {
                        e.stopImmediatePropagation();
                    }
                }, true);
            }
        } catch(e) {}
    })();

    
    (function() {
        if (window._hbxFpsThemeSync) return;
        window._hbxFpsThemeSync = true;

        function _syncFpsColor() {
            try {
                var rootStyle = document.documentElement.style;
                var ac = getComputedStyle(document.documentElement).getPropertyValue('--theme-bg-selected').trim() ||
                         getComputedStyle(document.documentElement).getPropertyValue('--ac').trim() ||
                         '#c9a227';
                var frames = [window];
                try { if (window.top) frames.push(window.top); } catch(e) {}
                for (var f = 0; f < window.frames.length; f++) {
                    try { frames.push(window.frames[f]); } catch(e) {}
                }
                for (var i = 0; i < frames.length; i++) {
                    try {
                        frames[i].document.documentElement.style.setProperty('--ac', ac, 'important');
                    } catch(e) {}
                }
            } catch(e) {}
        }

        new MutationObserver(function(mutations) {
            for (var i = 0; i < mutations.length; i++) {
                if (mutations[i].attributeName === 'data-theme' ||
                    mutations[i].attributeName === 'style') {
                    setTimeout(_syncFpsColor, 30);
                    break;
                }
            }
        }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'style'] });

        setTimeout(_syncFpsColor, 200);
    })();

    function t(key) {
        return window.__t ? window.__t(key) : key;
    }

    function modifySettingsDialog(doc) {
        var dialog = doc.querySelector('.dialog.settings-view');
        if (!dialog) return;
        if (doc.getElementById('settings-sidebar-panel')) return;

        (function enhanceVideoOptions() {
            var fpsSelect = dialog.querySelector('[data-hook="fps"]');
            if (!fpsSelect || fpsSelect.getAttribute('data-hbx-fps-patched') === '1') return;
            var values = ['None (Recommended)', '30', '60', '90', '120', '144', '165', '180', '240', '244'];
            var currentIndex = fpsSelect.selectedIndex;
            try {
                var savedIndex = parseInt(localStorage.getItem('fps_limit'), 10);
                if (!isNaN(savedIndex)) currentIndex = savedIndex;
            } catch (e) {}
            fpsSelect.innerHTML = values.map(function(v) { return '<option>' + v + '</option>'; }).join('');
            fpsSelect.selectedIndex = Math.min(currentIndex, values.length - 1);
            fpsSelect.addEventListener('change', function() {
                try { localStorage.setItem('fps_limit', String(fpsSelect.selectedIndex)); } catch (e) {}
            });
            fpsSelect.setAttribute('data-hbx-fps-patched', '1');
        })();

        if (!doc.getElementById('settings-sidebar-anim')) {
            var animStyle = doc.createElement('style');
            animStyle.id = 'settings-sidebar-anim';
            animStyle.textContent = [
                '@keyframes sbSlideIn{from{opacity:0;transform:translateX(8px)}to{opacity:1;transform:translateX(0)}}',
                '@keyframes sbFadeIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}',
                '.settings-sidebar-btn{transition:background 0.18s,color 0.18s,box-shadow 0.18s,transform 0.12s!important;}',
                '.settings-sidebar-btn:active{transform:scale(0.88)!important;}',
                '.settings-sidebar-btn.selected{box-shadow:inset 2px 0 0 #c9a227!important;}',
                '#settings-sidebar-panel .settings-sidebar-btn{animation:sbSlideIn 0.22s ease both;}',
                '#settings-sidebar-panel .settings-sidebar-btn:nth-child(1){animation-delay:0.02s}',
                '#settings-sidebar-panel .settings-sidebar-btn:nth-child(2){animation-delay:0.04s}',
                '#settings-sidebar-panel .settings-sidebar-btn:nth-child(3){animation-delay:0.06s}',
                '#settings-sidebar-panel .settings-sidebar-btn:nth-child(4){animation-delay:0.08s}',
                '#settings-sidebar-panel .settings-sidebar-btn:nth-child(5){animation-delay:0.10s}',
                '#settings-sidebar-panel .settings-sidebar-btn:nth-child(6){animation-delay:0.12s}',
                '#settings-sidebar-panel .settings-sidebar-btn:nth-child(7){animation-delay:0.14s}',
                '#settings-sidebar-panel .settings-sidebar-btn:nth-child(8){animation-delay:0.16s}',
                '#settings-sidebar-panel .settings-sidebar-btn:nth-child(9){animation-delay:0.18s}',
                '.perf-option-row{transition:background 0.15s!important;}',
                '.perf-checkbox{transition:background 0.18s,border-color 0.18s!important;}',
                '.theme-option{transition:background 0.18s,border-color 0.18s,box-shadow 0.18s!important;}',
                '.theme-option.selected{box-shadow:0 0 0 1px #c9a227!important;}',
                '.theme-option:hover{box-shadow:0 2px 8px rgba(0,0,0,0.3)!important;}',
                '#settings-sidebar-tooltip{transition:opacity 0.14s,transform 0.14s!important;transform:translateX(0);}',
                '#settings-sidebar-tooltip.visible{opacity:1!important;transform:translateX(0)!important;}',
                '#settings-sidebar-tooltip.hidden{opacity:0!important;transform:translateX(-4px)!important;}',
                '.tabcontents>.section[data-hook="theme-section"],.tabcontents>.section[data-hook="perf-section"],.tabcontents>.section[data-hook="multiauth-section"],.tabcontents>.section[data-hook="geo-section"],.tabcontents>.section[data-hook="avatarsec"],.tabcontents>.section[data-hook="extra-section"],.theme-section,.perf-section,.multiauth-section{animation:sbFadeIn 0.2s ease both!important;}'
            ].join('');
            doc.head && doc.head.appendChild(animStyle);
        }

        var tooltip = doc.getElementById('settings-sidebar-tooltip');
        if (!tooltip) {
            tooltip = doc.createElement('div');
            tooltip.id = 'settings-sidebar-tooltip';
            tooltip.style.cssText = [
                'position:fixed',
                'background:var(--theme-tooltip-bg)',
                'color:var(--theme-text-primary)',
                'padding:5px 10px',
                'border-radius:6px',
                'font-size:11px',
                'font-weight:500',
                'pointer-events:none',
                'opacity:0',
                'z-index:10001',
                'white-space:nowrap',
                'border:1px solid var(--theme-tooltip-border)',
                'box-shadow:0 4px 16px rgba(0,0,0,0.4)',
                'letter-spacing:0.3px'
            ].join(';');
            doc.body.appendChild(tooltip);
        }

        var tooltipTimer = null;
        function showTooltip(el, text) {
            clearTimeout(tooltipTimer);
            var rect = el.getBoundingClientRect();
            tooltip.textContent = text;
            tooltip.style.left = (rect.right + 10) + 'px';
            tooltip.style.top = (rect.top + rect.height / 2 - 14) + 'px';
            tooltip.className = 'visible';
            tooltip.style.opacity = '1';
        }

        function hideTooltip() {
            tooltip.className = 'hidden';
            tooltip.style.opacity = '0';
        }

        function addTooltip(el, text) {
            if (!el) return;
            el.addEventListener('mouseenter', function () { showTooltip(el, text); });
            el.addEventListener('mouseleave', hideTooltip);
            el.addEventListener('click', hideTooltip);
        }

        var sidebar = doc.createElement('div');
        sidebar.id = 'settings-sidebar-panel';
        sidebar.style.cssText = [
            'position:absolute',
            'left:-52px',
            'top:0',
            'bottom:0',
            'width:52px',
            'background:var(--theme-bg-primary)',
            'border:1px solid var(--theme-border)',
            'border-right:none',
            'border-radius:10px 0 0 10px',
            'display:flex',
            'flex-direction:column',
            'align-items:center',
            'gap:4px',
            'padding:10px 0 8px 0',
            'box-sizing:border-box',
            'z-index:1',
            'overflow-y:auto',
            'overflow-x:hidden',
            'scrollbar-width:none'
        ].join(';');

        var sbScrollStyle = doc.createElement('style');
        sbScrollStyle.textContent = '#settings-sidebar-panel::-webkit-scrollbar{display:none!important;}';
        doc.head && doc.head.appendChild(sbScrollStyle);

        sidebar.addEventListener('mouseleave', hideTooltip);

        var tabs = dialog.querySelector('.tabs');

        var tabIcons = {
            'soundbtn':     { icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>', tooltip: t('Som'), order: 1 },
            'videobtn':     { icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>', tooltip: t('Vídeo'), order: 2 },
            'inputbtn':     { icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M6 16h12"/></svg>', tooltip: t('Controles'), order: 3 },
            'perfbtn':      { icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>', tooltip: t('Desempenho'), order: 4 },
            'avatarbtn':    { icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>', tooltip: t('Avatares'), order: 5 },
            'fieldbgbtn':   { icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>', tooltip: t('Fondo de Cancha'), order: 5.6 },
            'scoreboardbtn':{ icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="10" rx="2"/><line x1="8" y1="7" x2="8" y2="17"/><line x1="16" y1="7" x2="16" y2="17"/></svg>', tooltip: t('Marcador'), order: 5.7 },
            'extrabtn':     { icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>', tooltip: t('Atajos de Extrapolación'), order: 5.5 },

            'tokenbtn':     { icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>', tooltip: t('Host Token'), order: 7 },
            'multiauthbtn': { icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="9" r="4"/><path d="M9 13c-4 0-6 2-6 5v1h12v-1c0-3-2-5-6-5"/><path d="M16 11h6m-3-3v6"/></svg>', tooltip: t('Multi-Auth'), order: 9 },
            'geobtn':       { icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>', tooltip: t('Geo Bypass'), order: 10 },
            'miscbtn':      { icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.6 9a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>', tooltip: t('Diversos'), order: 11 },
        };

        var tabOrder = ['soundbtn','videobtn','inputbtn','perfbtn','avatarbtn','fieldbgbtn','scoreboardbtn','extrabtn','tokenbtn','multiauthbtn','geobtn','miscbtn'];

        
        function createThemeTab(doc, tabs) {
            if (tabs.querySelector('button[data-hook="themebtn"]')) return;

            var themeBtn = doc.createElement('button');
            themeBtn.setAttribute('data-hook', 'themebtn');
            themeBtn.textContent = t('Temas');
            themeBtn.style.display = 'none';
            tabs.appendChild(themeBtn);

            var themeSection = doc.createElement('section');
            themeSection.className = 'theme-section section';
            themeSection.setAttribute('data-hook', 'theme-section');
            themeSection.style.display = 'none';

            var container = doc.createElement('div');
            container.className = 'theme-container';

            var themeGroup = doc.createElement('div');
            themeGroup.className = 'settings-group';

            var themeLabel = doc.createElement('div');
            themeLabel.className = 'settings-group-label';
            themeLabel.textContent = t('Tema');
            themeGroup.appendChild(themeLabel);

            var themes = window.HaxThemes ? window.HaxThemes.getThemes() : { default: { name: t('Padrão') }, dark: { name: t('Escuro') }, light: { name: t('Claro') } };
            var currentTheme = window.HaxThemes ? window.HaxThemes.getCurrent() : 'dark';
            var themeOptions = doc.createElement('div');
            themeOptions.className = 'theme-options';
            var loadThemeIntoEditor = null;

            var themeDescs = {
                default: t('Sem alterações de cor'),
                dark: t('Reduz o cansaço visual'),
                light: t('Melhor visibilidade'),
                onix: t('Preto total, escuridão absoluta')
            };

            for (var key in themes) {
                var option = doc.createElement('div');
                option.className = 'theme-option' + (key === currentTheme ? ' selected' : '');
                option.setAttribute('data-theme', key);

                var textWrapper = doc.createElement('div');
                textWrapper.className = 'theme-text';

                var name = doc.createElement('span');
                name.className = 'theme-name';
                name.textContent = themes[key].name;
                textWrapper.appendChild(name);

                var desc = doc.createElement('span');
                desc.className = 'theme-desc';
                desc.textContent = themeDescs[key] || '';
                textWrapper.appendChild(desc);

                option.appendChild(textWrapper);

                var check = doc.createElement('div');
                check.className = 'theme-check';
                check.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>';
                option.appendChild(check);

                option.addEventListener('click', (function(themeKey) {
                    return function() {
                        var allOptions = themeOptions.querySelectorAll('.theme-option');
                        for (var i = 0; i < allOptions.length; i++) allOptions[i].classList.remove('selected');
                        this.classList.add('selected');
                        if (window.HaxThemes) window.HaxThemes.apply(themeKey);
                        if (loadThemeIntoEditor) loadThemeIntoEditor(themeKey);
                    };
                })(key));

                themeOptions.appendChild(option);
            }

            if (window.HaxThemes && window.HaxThemes.getThemeDefinition) {
                var editorGroup = doc.createElement('div');
                editorGroup.className = 'settings-group';

                var editorLabel = doc.createElement('div');
                editorLabel.className = 'settings-group-label';
                editorLabel.textContent = 'Theme Editor';
                editorGroup.appendChild(editorLabel);

                var editorInfo = doc.createElement('div');
                editorInfo.style.cssText = 'color:var(--theme-text-muted);font-size:11px;line-height:1.5;margin-bottom:10px;';
                editorInfo.textContent = 'Create your own theme, preview gradients, save it, and export it.';
                editorGroup.appendChild(editorInfo);

                var nameInput = doc.createElement('input');
                nameInput.type = 'text';
                nameInput.placeholder = 'Theme name';
                nameInput.style.cssText = 'width:100%;padding:8px 10px;background:var(--theme-bg-secondary);border:1px solid var(--theme-border);border-radius:6px;color:var(--theme-text-primary);font-size:12px;box-sizing:border-box;margin-bottom:10px;';
                editorGroup.appendChild(nameInput);

                var preview = doc.createElement('div');
                preview.style.cssText = 'height:146px;border-radius:12px;border:1px solid var(--theme-border);margin-bottom:10px;position:relative;overflow:hidden;background:var(--theme-bg-primary);padding:10px;box-sizing:border-box;';
                editorGroup.appendChild(preview);

                var previewShell = doc.createElement('div');
                previewShell.style.cssText = 'position:absolute;inset:0;padding:10px;box-sizing:border-box;background:linear-gradient(180deg,var(--theme-bg-primary),var(--theme-bg-secondary));';
                preview.appendChild(previewShell);

                var previewHeader = doc.createElement('div');
                previewHeader.style.cssText = 'display:flex;align-items:center;justify-content:space-between;height:26px;padding:0 8px;border:1px solid var(--theme-border);border-radius:8px;background:var(--theme-bg-secondary);color:var(--theme-text-primary);font-size:11px;font-weight:700;letter-spacing:.35px;margin-bottom:8px;';
                previewHeader.innerHTML = '<span>Theme Editor</span><span style="color:var(--theme-bg-selected)">Live</span>';
                previewShell.appendChild(previewHeader);

                var previewBody = doc.createElement('div');
                previewBody.style.cssText = 'display:grid;grid-template-columns:1.15fr .85fr;gap:8px;height:calc(100% - 34px);';
                previewShell.appendChild(previewBody);

                var previewLeft = doc.createElement('div');
                previewLeft.style.cssText = 'display:flex;flex-direction:column;gap:8px;';
                previewBody.appendChild(previewLeft);

                var previewHero = doc.createElement('div');
                previewHero.style.cssText = 'flex:1;border-radius:10px;border:1px solid var(--theme-border);background:linear-gradient(135deg,var(--theme-bg-tertiary),var(--theme-bg-hover));padding:10px;box-sizing:border-box;color:var(--theme-text-primary);display:flex;flex-direction:column;justify-content:space-between;';
                previewHero.innerHTML = '<div style="font-size:15px;font-weight:800;">Room List</div><div style="display:flex;gap:6px;"><div style="flex:1;height:8px;border-radius:999px;background:var(--theme-bg-selected);opacity:.9;"></div><div style="width:34px;height:8px;border-radius:999px;background:var(--theme-text-secondary);opacity:.5;"></div></div>';
                previewLeft.appendChild(previewHero);

                var previewFooter = doc.createElement('div');
                previewFooter.style.cssText = 'height:26px;border-radius:8px;border:1px solid var(--theme-border);background:var(--theme-bg-secondary);display:flex;align-items:center;justify-content:space-between;padding:0 8px;box-sizing:border-box;font-size:10px;color:var(--theme-text-secondary);';
                previewFooter.innerHTML = '<span>Buttons</span><span style="color:var(--theme-bg-selected)">Accent</span>';
                previewLeft.appendChild(previewFooter);

                var previewRight = doc.createElement('div');
                previewRight.style.cssText = 'display:flex;flex-direction:column;gap:8px;';
                previewBody.appendChild(previewRight);

                function makePreviewRow(strong) {
                    var row = doc.createElement('div');
                    row.style.cssText = 'height:20px;border-radius:7px;border:1px solid var(--theme-border);background:' + (strong ? 'var(--theme-bg-hover)' : 'var(--theme-bg-secondary)') + ';display:flex;align-items:center;padding:0 8px;box-sizing:border-box;color:' + (strong ? 'var(--theme-text-primary)' : 'var(--theme-text-secondary)') + ';font-size:10px;';
                    row.textContent = strong ? 'Selected row' : 'Normal row';
                    return row;
                }
                previewRight.appendChild(makePreviewRow(true));
                previewRight.appendChild(makePreviewRow(false));
                previewRight.appendChild(makePreviewRow(false));

                var previewBadge = doc.createElement('div');
                previewBadge.style.cssText = 'margin-top:auto;height:28px;border-radius:8px;background:var(--theme-bg-selected);display:flex;align-items:center;justify-content:center;color:#111;font-size:11px;font-weight:800;';
                previewBadge.textContent = 'Accent';
                previewRight.appendChild(previewBadge);

                var colorKeys = [
                    ['--theme-bg-primary', 'BG Primary'],
                    ['--theme-bg-secondary', 'BG Secondary'],
                    ['--theme-bg-tertiary', 'BG Tertiary'],
                    ['--theme-bg-hover', 'BG Hover'],
                    ['--theme-bg-selected', 'Accent'],
                    ['--theme-border', 'Border'],
                    ['--theme-text-primary', 'Text Primary'],
                    ['--theme-text-secondary', 'Text Secondary']
                ];
                var colorInputs = {};
                var colorGrid = doc.createElement('div');
                colorGrid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;';
                editorGroup.appendChild(colorGrid);

                function collectEditorColors() {
                    var colors = {};
                    colorKeys.forEach(function(pair) { colors[pair[0]] = colorInputs[pair[0]].value; });
                    return colors;
                }
                var previewTimer = null;
                function applyEditorPreview() {
                    var colors = collectEditorColors();
                    Object.keys(colors).forEach(function(key) {
                        preview.style.setProperty(key, colors[key]);
                    });
                    preview.style.borderColor = colors['--theme-border'];
                }
                function updatePreview() {
                    if (previewTimer) clearTimeout(previewTimer);
                    previewTimer = setTimeout(function() {
                        previewTimer = null;
                        applyEditorPreview();
                    }, 60);
                }

                colorKeys.forEach(function(pair) {
                    var wrap = doc.createElement('label');
                    wrap.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:8px;padding:7px 8px;background:var(--theme-bg-secondary);border:1px solid var(--theme-border);border-radius:6px;';
                    var span = doc.createElement('span');
                    span.style.cssText = 'font-size:11px;color:var(--theme-text-primary);';
                    span.textContent = pair[1];
                    var input = doc.createElement('input');
                    input.type = 'color';
                    input.style.cssText = 'width:36px;height:24px;padding:0;border:none;background:transparent;cursor:pointer;';
                    input.oninput = updatePreview;
                    colorInputs[pair[0]] = input;
                    wrap.appendChild(span);
                    wrap.appendChild(input);
                    colorGrid.appendChild(wrap);
                });

                var fxInput = doc.createElement('textarea');
                fxInput.placeholder = 'Optional FX CSS for #__hax-fx';
                fxInput.style.cssText = 'width:100%;min-height:88px;padding:8px 10px;background:var(--theme-bg-secondary);border:1px solid var(--theme-border);border-radius:6px;color:var(--theme-text-primary);font-size:11px;box-sizing:border-box;resize:vertical;margin-bottom:10px;';
                editorGroup.appendChild(fxInput);

                loadThemeIntoEditor = function(themeKey) {
                    var def = window.HaxThemes.getThemeDefinition(themeKey) || window.HaxThemes.getThemeDefinition(window.HaxThemes.getCurrent());
                    if (!def) return;
                    nameInput.value = def.name || themeKey;
                    colorKeys.forEach(function(pair) {
                        colorInputs[pair[0]].value = def.colors[pair[0]] || '#000000';
                    });
                    fxInput.value = def.fx || '';
                    applyEditorPreview();
                };

                var btnRow = doc.createElement('div');
                btnRow.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:8px;';
                editorGroup.appendChild(btnRow);

                function makeEditorBtn(label, onClick) {
                    var btn = doc.createElement('button');
                    btn.type = 'button';
                    btn.style.cssText = 'padding:8px 10px;background:var(--theme-bg-secondary);border:1px solid var(--theme-border);border-radius:6px;color:var(--theme-text-primary);font-size:11px;cursor:pointer;';
                    btn.textContent = label;
                    btn.onclick = onClick;
                    btnRow.appendChild(btn);
                    return btn;
                }

                makeEditorBtn('Load Current', function() {
                    loadThemeIntoEditor(window.HaxThemes.getCurrent());
                });
                makeEditorBtn('Reset Preview', function() {
                    loadThemeIntoEditor(window.HaxThemes.getCurrent());
                });
                makeEditorBtn('Save Theme', function() {
                    var colors = collectEditorColors();
                    var key = window.HaxThemes.saveCustom(nameInput.value || 'My Theme', colors, fxInput.value || '');
                    window.HaxThemes.apply(key);
                    themeBtn.click();
                });
                makeEditorBtn('Export JSON', function() {
                    var text = window.HaxThemes.exportTheme(window.HaxThemes.getCurrent());
                    navigator.clipboard.writeText(text);
                });

                loadThemeIntoEditor(currentTheme);
                container.appendChild(editorGroup);
            }
            themeGroup.appendChild(themeOptions);
            container.appendChild(themeGroup);
            themeSection.appendChild(container);

            var dialogContent = dialog.querySelector('.section') || dialog;
            dialogContent.parentNode.insertBefore(themeSection, dialogContent.nextSibling);

            themeBtn.addEventListener('click', function() {
                var sections = dialog.querySelectorAll('.tabcontents > .section');
                for (var i = 0; i < sections.length; i++) sections[i].style.display = 'none';
                themeSection.style.display = 'block';
                var allTabs = tabs.querySelectorAll('button');
                for (var i = 0; i < allTabs.length; i++) allTabs[i].classList.remove('selected');
                themeBtn.classList.add('selected');
                if (loadThemeIntoEditor && window.HaxThemes) loadThemeIntoEditor(window.HaxThemes.getCurrent());
            });

            var originalTabs = tabs.querySelectorAll('button:not([data-hook="themebtn"])');
            for (var i = 0; i < originalTabs.length; i++) {
                originalTabs[i].addEventListener('click', function() {
                    themeSection.style.display = 'none';
                    if (window.HaxThemes && window.HaxThemes.clearPreview) window.HaxThemes.clearPreview();
                    var sections = dialog.querySelectorAll('.tabcontents > .section');
                    for (var j = 0; j < sections.length; j++) sections[j].style.display = '';
                });
            }

            return themeBtn;
        }

        
        function createPerfTab(doc, tabs) {
            if (tabs.querySelector('button[data-hook="perfbtn"]')) return;

            var perfBtn = doc.createElement('button');
            perfBtn.setAttribute('data-hook', 'perfbtn');
            perfBtn.textContent = t('Desempenho');
            perfBtn.style.display = 'none';
            tabs.appendChild(perfBtn);

            var perfSection = doc.createElement('section');
            perfSection.className = 'perf-section section';
            perfSection.setAttribute('data-hook', 'perf-section');
            perfSection.style.display = 'none';

            var PERF_OPTIONS = [
                { hook: 'noGoalGray',    title: t('Sin gris al gol'),   desc: t('Elimina el efecto gris del canvas al marcar gol.'),  custom:true },
                { hook: 'noGoalBar',     title: t('Sin barra de gol'),  desc: t('Oculta la barra blanca animada al marcar gol.'),     custom:true },
                { hook: 'noGoalAnim',    title: t('Sin texto de gol'),  desc: t('Elimina el texto Scores!/Victorious! al gol.'),      custom:true },
                { hook: 'showKickRange', title: t('Sin kick range'),    desc: t('Oculta el circulo de alcance de patada.'),           custom:true, inverted:true },
                { hook: 'simple_field', title: t('Campo simplificado'), desc: t('Usa colores sólidos en el campo en lugar de degradados. Renderizado más simple.'), customStorage:'simple_field' },
                { hook: 'low_quality_circles', title: t('Círculos de baja calidad'), desc: t('Pre-renderiza los círculos. Más rápido pero visual pixelado.'), customStorage:'low_quality_circles' },
                { hook: 'hideFpsGraph',  title: 'Ocultar gráfico FPS', desc: 'Oculta el gráfico de FPS/ping del juego.',        custom:true },
                // --- Opciones de interfaz de HaxBion (hbxPerf) ---
                // Estas no tocan el motor del juego: apagan trabajo de dibujado
                // de la INTERFAZ, que es lo que suele causar tirones fuera del
                // canvas. Se aplican al instante y son reversibles.
                { hook: 'noBlur',   title: 'Sin desenfoques',        desc: 'Quita los efectos de vidrio esmerilado. Es el efecto más caro de todos: el navegador tiene que desenfocar el fondo en cada frame.', hbxPerf:true },
                { hook: 'liteUi',   title: 'Interfaz ligera',        desc: 'Quita sombras, brillos y degradados decorativos. Las sombras grandes obligan a repintar áreas mucho mayores que el elemento.', hbxPerf:true },
                { hook: 'noAnim',   title: 'Sin animaciones de UI',  desc: 'Desactiva todas las transiciones y animaciones de la interfaz. Se siente más seco pero ahorra composición constante.', hbxPerf:true },
                { hook: 'noRadius', title: 'Esquinas rectas',        desc: 'Elimina los bordes redondeados. Cada esquina redonda obliga a recortar la capa; con muchos elementos suma.', hbxPerf:true },
                { hook: 'noHoverFx', title: 'Sin efectos al pasar el mouse', desc: 'Apaga brillos y movimientos al pasar el cursor. Cada hover fuerza un repintado; recorriendo la lista de salas se dispara decenas de veces por segundo.', hbxPerf:true },
                { hook: 'flatBg',   title: 'Fondos planos',          desc: 'Reemplaza los degradados de paneles y tarjetas por color sólido. Se ve más simple pero el navegador deja de re-rasterizar esas áreas.', hbxPerf:true },
                { hook: 'lowPoll',  title: 'Menos refrescos',        desc: 'El marcador pasa de ~7 a ~2 actualizaciones por segundo y la detección de partidas de 2s a 6s. El reloj se ve un poco menos fluido. No afecta el avatar ni la pelota.', hbxPerf:true }
            ];

            var container = doc.createElement('div');
            container.style.cssText = 'display:flex;flex-direction:column;gap:2px;';

            var header = doc.createElement('div');
            header.style.cssText = 'color:var(--theme-text-muted);font-size:11px;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid var(--theme-border);letter-spacing:0.3px;';
            header.textContent = t('Ative as opções para melhorar o FPS.');
            container.appendChild(header);

            PERF_OPTIONS.forEach(function(opt) {
                var row = doc.createElement('div');
                row.className = 'perf-option-row';
                row.style.cssText = 'display:flex;align-items:flex-start;gap:10px;padding:7px 8px;border-radius:6px;cursor:pointer;';
                row.setAttribute('data-perf-hook', opt.hook);
                row.onmouseenter = function() { row.style.background = 'var(--theme-bg-hover)'; };
                row.onmouseleave = function() { row.style.background = ''; };

                var checkbox = doc.createElement('div');
                checkbox.className = 'perf-checkbox';
                checkbox.style.cssText = 'width:17px;height:17px;border:2px solid var(--theme-border-light);border-radius:4px;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;';
                checkbox.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="opacity:0;"><polyline points="20 6 9 17 4 12"/></svg>';

                var textDiv = doc.createElement('div');
                textDiv.style.cssText = 'flex:1;min-width:0;';

                var titleRow = doc.createElement('div');
                titleRow.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:2px;';

                var title = doc.createElement('span');
                title.style.cssText = 'color:var(--theme-text-primary);font-size:12.5px;font-weight:500;';
                title.textContent = opt.title;
                titleRow.appendChild(title);

                if (opt.warning) {
                    var warning = doc.createElement('span');
                    warning.style.cssText = 'color:#f59e0b;font-size:9.5px;font-weight:600;padding:2px 5px;background:rgba(245,158,11,0.12);border-radius:4px;letter-spacing:0.3px;';
                    warning.textContent = 'Cuidado';
                    titleRow.appendChild(warning);
                }

                textDiv.appendChild(titleRow);

                var desc = doc.createElement('div');
                desc.style.cssText = 'color:var(--theme-text-muted);font-size:10.5px;line-height:1.4;';
                desc.textContent = opt.desc;
                textDiv.appendChild(desc);

                row.appendChild(checkbox);
                row.appendChild(textDiv);

                (function(hookName, isCustom, isInverted, customStorage, isHbxPerf) {
                    row.onclick = function() {
                        // Opciones propias de HaxBion: perfopts.js se encarga de
                        // guardar el estado y aplicar el CSS en todos los frames.
                        if (isHbxPerf) {
                            try {
                                var toggleFn = window._hbxPerfOptToggle ||
                                               (window.top && window.top._hbxPerfOptToggle);
                                if (toggleFn) toggleFn(hookName);
                            } catch (e) {}
                            setTimeout(updatePerfCheckboxes, 30);
                            return;
                        }
                        if (isCustom) {
                            if (hookName === 'hideFpsGraph') {
                                try {
                                    var _po = JSON.parse(localStorage.getItem('hbx_perf_opts') || '{}');
                                    _po.hideFpsGraph = !(_po.hideFpsGraph === true);
                                    localStorage.setItem('hbx_perf_opts', JSON.stringify(_po));
                                    var _syncFn = function() {
                                        try {
                                            applyStatsVisibility(document, _po.hideFpsGraph);
                                            var frames = [window];
                                            if (window.top && window.top !== window) frames.push(window.top);
                                            for (var f = 0; f < window.frames.length; f++) {
                                                try { frames.push(window.frames[f]); } catch(e) {}
                                            }
                                            for (var i = 0; i < frames.length; i++) {
                                                try {
                                                    frames[i]._hbxHideStats = _po.hideFpsGraph;
                                                    applyStatsVisibility(frames[i].document, _po.hideFpsGraph);
                                                } catch(e) {}
                                            }
                                        } catch(e) {}
                                    };
                                    if (window.requestIdleCallback) requestIdleCallback(_syncFn);
                                    else setTimeout(_syncFn, 0);
                                } catch(e) {}
                                setTimeout(updatePerfCheckboxes, 50);
                                return;
                            }
                            try {
                                var _po = JSON.parse(localStorage.getItem('hbx_perf_opts') || '{}');
                                if (isInverted) {
                                    _po[hookName] = (_po[hookName] === false) ? undefined : false;
                                } else {
                                    _po[hookName] = !(_po[hookName] === true);
                                }
                                localStorage.setItem('hbx_perf_opts', JSON.stringify(_po));
                                var _syncFn = function() {
                                    try {
                                        var frames = [window];
                                        if (window.top && window.top !== window) frames.push(window.top);
                                        for (var f = 0; f < window.frames.length; f++) {
                                            try { frames.push(window.frames[f]); } catch(e) {}
                                        }
                                        for (var i = 0; i < frames.length; i++) {
                                            try {
                                                var _api = frames[i]._hbxGameAPI;
                                                if (_api && _api.refresh) _api.refresh();
                                                if (frames[i]._hbxNoGoalGray !== undefined) {
                                                    frames[i]._hbxNoGoalGray = !!_po.noGoalGray;
                                                    frames[i]._hbxNoGoalBar  = !!_po.noGoalBar;
                                                    frames[i]._hbxNoGoalAnim = !!_po.noGoalAnim;
                                                    frames[i]._hbxShowKickRange = _po.showKickRange !== false;
                                                }
                                            } catch(e) {}
                                        }
                                    } catch(e) {}
                                };
                                if (window.requestIdleCallback) requestIdleCallback(_syncFn);
                                else setTimeout(_syncFn, 0);
                            } catch(e) {}
                            setTimeout(updatePerfCheckboxes, 50);
                        } else if (customStorage) {
                            try {
                                var current = localStorage.getItem(customStorage) === 'true';
                                localStorage.setItem(customStorage, current ? 'false' : 'true');
                                var frames = [window];
                                if (window.top && window.top !== window) frames.push(window.top);
                                for (var f = 0; f < window.frames.length; f++) {
                                    try { frames.push(window.frames[f]); } catch(e) {}
                                }
                                for (var i = 0; i < frames.length; i++) {
                                    try {
                                        var _api2 = frames[i]._hbxGameAPI;
                                        if (_api2 && _api2.refresh) _api2.refresh();
                                    } catch(e) {}
                                }
                            } catch(e) {}
                            setTimeout(updatePerfCheckboxes, 50);
                        } else {
                            var miscSection = dialog.querySelector('[data-hook="miscsec"]');
                            if (miscSection) {
                                var originalToggle = miscSection.querySelector('[data-hook="' + hookName + '"]');
                                if (originalToggle) {
                                    originalToggle.click();
                                    setTimeout(updatePerfCheckboxes, 150);
                                } else {
                                    var globalToggle = document.querySelector('[data-hook="' + hookName + '"]');
                                    if (globalToggle) {
                                        globalToggle.click();
                                        setTimeout(updatePerfCheckboxes, 150);
                                    }
                                }
                            }
                        }
                    };
                })(opt.hook, !!opt.custom, !!opt.inverted, opt.customStorage || null, !!opt.hbxPerf);

                container.appendChild(row);
            });

            var exportImportSection = doc.createElement('div');
            exportImportSection.style.cssText = 'display:flex;gap:8px;margin-top:16px;padding-top:12px;border-top:1px solid var(--theme-border);';

            var PERF_STORAGE_KEYS = ['simple_lines','ultra_simple_lines','culling_enabled','show_avatars','show_names','simple_field','low_quality_circles','show_animations','show_indicator','show_chat_indicator','high_priority','canvas_boost_scale','input_boost_enabled','fps_limit','resolution_scale','viewmode'];

            function generatePerfCode() {
                var config = {};
                PERF_STORAGE_KEYS.forEach(function(key) {
                    var val = localStorage.getItem(key);
                    if (val !== null) config[key] = val;
                });
                return btoa(JSON.stringify(config)).replace(/=/g, '');
            }

            function applyPerfCode(code) {
                try {
                    while (code.length % 4 !== 0) code += '=';
                    var config = JSON.parse(atob(code));
                    PERF_STORAGE_KEYS.forEach(function(key) { localStorage.removeItem(key); });
                    for (var key in config) {
                        if (PERF_STORAGE_KEYS.indexOf(key) !== -1) localStorage.setItem(key, config[key]);
                    }
                    return true;
                } catch(e) { return false; }
            }

            function makePerfBtn(innerHTML, onCk) {
                var btn = doc.createElement('button');
                btn.style.cssText = 'flex:1;padding:9px;background:var(--theme-bg-secondary);border:1px solid var(--theme-border);border-radius:6px;color:var(--theme-text-primary);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;font-size:11.5px;';
                btn.innerHTML = innerHTML;
                btn.onmouseenter = function() { btn.style.background = 'var(--theme-bg-hover)'; };
                btn.onmouseleave = function() { btn.style.background = 'var(--theme-bg-secondary)'; };
                btn.onclick = onCk;
                return btn;
            }

            var exportBtn = makePerfBtn(
                '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Exportar',
                function() {
                    var code = generatePerfCode();
                    var orig = exportBtn.innerHTML;
                    navigator.clipboard.writeText(code).then(function() {
                        exportBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>Copiado!';
                        exportBtn.style.borderColor = '#22c55e';
                        setTimeout(function() { exportBtn.innerHTML = orig; exportBtn.style.borderColor = ''; }, 2000);
                    });
                }
            );

            var importBtn = makePerfBtn(
                '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>Importar',
                function() {
                    var orig = importBtn.innerHTML;
                    navigator.clipboard.readText().then(function(code) {
                        code = code.trim();
                        if (!code) {
                            importBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>Portapapeles vacio';
                            importBtn.style.borderColor = '#dc2626';
                            setTimeout(function() { importBtn.innerHTML = orig; importBtn.style.borderColor = ''; }, 2000);
                            return;
                        }
                        if (applyPerfCode(code)) {
                            importBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>Aplicado! Recarga la pagina';
                            importBtn.style.borderColor = '#22c55e';
                            setTimeout(function() { importBtn.innerHTML = orig; importBtn.style.borderColor = ''; }, 3000);
                        } else {
                            importBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>Codigo invalido';
                            importBtn.style.borderColor = '#dc2626';
                            setTimeout(function() { importBtn.innerHTML = orig; importBtn.style.borderColor = ''; }, 2000);
                        }
                    }).catch(function() {
                        importBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>Sin permiso';
                        importBtn.style.borderColor = '#dc2626';
                        setTimeout(function() { importBtn.innerHTML = orig; importBtn.style.borderColor = ''; }, 2000);
                    });
                }
            );

            exportImportSection.appendChild(exportBtn);
            exportImportSection.appendChild(importBtn);
            container.appendChild(exportImportSection);

            var exportImportTip = doc.createElement('div');
            exportImportTip.style.cssText = 'color:var(--theme-text-muted);font-size:10px;margin-top:5px;text-align:center;';
            exportImportTip.textContent = 'Comparte tu configuracion con amigos!';
            container.appendChild(exportImportTip);

            function _makeSlider(doc, label, lsKey, winKey, min, max, step, defVal) {
                var saved = parseFloat(localStorage.getItem(lsKey));
                var val = isNaN(saved) ? defVal : saved;
                window[winKey] = val;
                var row = doc.createElement('div');
                row.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:6px;padding:0 4px;';
                var lbl = doc.createElement('div');
                lbl.style.cssText = 'flex:1;max-width:130px;font-size:12px;color:var(--theme-text-primary);';
                lbl.textContent = label;
                var valD = doc.createElement('div');
                valD.style.cssText = 'width:88px;text-align:right;font-size:11px;font-weight:700;color:var(--theme-color-primary,#c9a227);';
                function formatSliderValue(v) {
                    return v + 'px' + (Number(v) === Number(defVal) ? ' (default)' : '');
                }
                valD.textContent = formatSliderValue(val);
                var sl = doc.createElement('input');
                sl.type = 'range'; sl.className = 'slider';
                sl.min = min; sl.max = max; sl.step = step; sl.value = val;
                sl.style.flex = '1';
                var _slDebounce = null;
                sl.oninput = function() {
                    var v = parseFloat(sl.value);
                    window[winKey] = v; valD.textContent = formatSliderValue(v);
                    localStorage.setItem(lsKey, v);
                    clearTimeout(_slDebounce);
                    _slDebounce = setTimeout(function() {
                        try {
                            var framesArray = [window];
                            if (window.top) {
                                framesArray.push(window.top);
                                for (var f = 0; f < window.top.frames.length; f++) {
                                    try { framesArray.push(window.top.frames[f]); } catch(e) {}
                                }
                            }
                            for (var i = 0; i < framesArray.length; i++) {
                                try { framesArray[i][winKey] = v; } catch(e) {}
                            }
                        } catch(e) {}
                    }, 80);
                };
                row.appendChild(lbl); row.appendChild(sl); row.appendChild(valD);
                return row;
            }

            function _makeSectionTitle(doc, text) {
                var h = doc.createElement('div');
                h.style.cssText = 'font-size:10px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:var(--theme-text-muted);margin:12px 4px 4px;padding-top:8px;border-top:1px solid var(--theme-border);';
                h.textContent = text;
                return h;
            }

            container.appendChild(_makeSectionTitle(doc, t('Grosor de líneas')));
            container.appendChild(_makeSlider(doc, t('Jugadores'), 'hbx_grosor_jugador', 'grosorJugador', 0.5, 5,   0.5, 1));
            container.appendChild(_makeSlider(doc, t('Pelota'),    'hbx_grosor_pelota',  'grosorPelota',  0.5, 5,   0.5, 1));
            container.appendChild(_makeSlider(doc, t('Cancha'),    'hbx_grosor_cancha',  'grosorCancha',  0.5, 6,   0.5, 3));
            container.appendChild(_makeSlider(doc, t('Arco'),      'hbx_grosor_arco',    'grosorArco',    0.5, 6,   0.5, 1));
            var resetThicknessBtn = doc.createElement('button');
            resetThicknessBtn.style.cssText = 'margin:4px 4px 0;padding:8px 10px;background:var(--theme-bg-secondary);border:1px solid var(--theme-border);border-radius:6px;color:var(--theme-text-primary);font-size:11px;cursor:pointer;';
            resetThicknessBtn.textContent = t('Resetear a valores por defecto');
            resetThicknessBtn.onclick = function() {
                localStorage.setItem('hbx_grosor_jugador', '1');
                localStorage.setItem('hbx_grosor_pelota', '1');
                localStorage.setItem('hbx_grosor_cancha', '3');
                localStorage.setItem('hbx_grosor_arco', '1');
                window.grosorJugador = 1;
                window.grosorPelota = 1;
                window.grosorCancha = 3;
                window.grosorArco = 1;
                perfSection.style.display = 'none';
                setTimeout(function() { perfBtn.click(); }, 0);
            };
            container.appendChild(resetThicknessBtn);

            container.appendChild(_makeSectionTitle(doc, t('Fuente del avatar')));
            var _fontPresets = [
                { label: 'Arial Black (original)', value: "900 34px 'Arial Black','Arial Bold',Gadget,sans-serif" },
                { label: 'Verdana',                value: "900 34px 'Verdana',sans-serif" },
                { label: 'Comic Sans',             value: "900 34px 'Comic Sans MS',cursive" },
                { label: 'Impact',                 value: "900 34px 'Impact',sans-serif" },
                { label: 'Courier New',            value: "900 34px 'Courier New',monospace" },
                { label: 'Times New Roman',        value: "900 34px 'Times New Roman',serif" }
            ];
            var _savedFont = localStorage.getItem('hbx_fuente_avatar') || _fontPresets[0].value;
            window.fuenteAvatar = _savedFont;
            var _fontRow = doc.createElement('div');
            _fontRow.style.cssText = 'padding:0 4px 4px;';
            var _fontSel = doc.createElement('select');
            _fontSel.style.cssText = 'width:100%;padding:4px 6px;border-radius:4px;border:1px solid var(--theme-border);background:var(--theme-bg-secondary);color:var(--theme-text-primary);font-size:11px;';
            _fontPresets.forEach(function(p) {
                var o = doc.createElement('option');
                o.value = p.value; o.textContent = p.label;
                if (p.value === _savedFont) o.selected = true;
                _fontSel.appendChild(o);
            });
            _fontSel.onchange = function() {
                var newFont = _fontSel.value;
                window.fuenteAvatar = newFont;
                localStorage.setItem('hbx_fuente_avatar', newFont);
                try {
                    var framesArray = [window];
                    if (window.top) {
                        framesArray.push(window.top);
                        for (var f = 0; f < window.top.frames.length; f++) {
                            try { framesArray.push(window.top.frames[f]); } catch(e) {}
                        }
                    }
                    for (var i = 0; i < framesArray.length; i++) {
                        try { framesArray[i].fuenteAvatar = newFont; } catch(e) {}
                    }
                } catch(e) {}
            };
            _fontRow.appendChild(_fontSel);
            container.appendChild(_fontRow);

            perfSection.appendChild(container);

            function updatePerfCheckboxes() {
                PERF_OPTIONS.forEach(function(opt) {
                    var perfRow = perfSection.querySelector('[data-perf-hook="' + opt.hook + '"]');
                    if (!perfRow) return;
                    var perfCheckbox = perfRow.querySelector('.perf-checkbox');
                    if (!perfCheckbox) return;
                    var svg = perfCheckbox.querySelector('svg');
                    if (!svg) return;
                    var isActive = false;

                    if (opt.custom) {
                        try {
                            var _po = JSON.parse(localStorage.getItem('hbx_perf_opts') || '{}');
                            if (opt.hook === 'hideFpsGraph') {
                                isActive = (_po.hideFpsGraph === true);
                            } else if (opt.inverted) {
                                isActive = (_po[opt.hook] === false);
                            } else {
                                isActive = (_po[opt.hook] === true);
                            }
                        } catch(e) {}
                    } else if (opt.customStorage) {
                        isActive = localStorage.getItem(opt.customStorage) === 'true';
                    } else if (opt.hbxPerf) {
                        try {
                            var isOnFn = window._hbxPerfOptIsOn ||
                                         (window.top && window.top._hbxPerfOptIsOn);
                            isActive = isOnFn ? !!isOnFn(opt.hook) : false;
                        } catch (e) {}
                    }

                    if (isActive) {
                        // Estado activo en blanco, acorde a la paleta monocroma
                        // (antes era dorado, del sistema de temas viejo).
                        perfCheckbox.style.background = '#f2f2f5';
                        perfCheckbox.style.borderColor = '#f2f2f5';
                        svg.style.opacity = '1';
                        svg.style.stroke = '#08080a';
                    } else {
                        perfCheckbox.style.background = '';
                        perfCheckbox.style.borderColor = '';
                        svg.style.opacity = '0';
                    }
                });
            }

            var dialogContent = dialog.querySelector('.section') || dialog;
            dialogContent.parentNode.insertBefore(perfSection, dialogContent.nextSibling);

            perfBtn.addEventListener('click', function() {
                var sections = dialog.querySelectorAll('.tabcontents > .section');
                for (var i = 0; i < sections.length; i++) sections[i].style.display = 'none';
                var themeSection = dialog.querySelector('[data-hook="theme-section"]');
                if (themeSection) themeSection.style.display = 'none';
                perfSection.style.display = 'block';
                dialog.style.maxHeight = '90vh';
                dialog.style.height = 'auto';
                var tabcontents = dialog.querySelector('.tabcontents');
                if (tabcontents) { tabcontents.style.maxHeight = 'calc(90vh - 100px)'; tabcontents.style.overflowY = 'auto'; }
                updatePerfCheckboxes();
                var allTabs = tabs.querySelectorAll('button');
                for (var i = 0; i < allTabs.length; i++) allTabs[i].classList.remove('selected');
                perfBtn.classList.add('selected');
            });

            var originalTabs2 = tabs.querySelectorAll('button:not([data-hook="perfbtn"])');
            for (var i = 0; i < originalTabs2.length; i++) {
                originalTabs2[i].addEventListener('click', function() {
                    perfSection.style.display = 'none';
                    dialog.style.maxHeight = '';
                    dialog.style.height = '';
                    var tabcontents = dialog.querySelector('.tabcontents');
                    if (tabcontents) { tabcontents.style.maxHeight = ''; tabcontents.style.overflowY = ''; }
                });
            }

            return perfBtn;
        }

        
        function createMultiAuthTab(doc, tabs) {
            if (tabs.querySelector('button[data-hook="multiauthbtn"]')) return;

            var multiAuthBtn = doc.createElement('button');
            multiAuthBtn.setAttribute('data-hook', 'multiauthbtn');
            multiAuthBtn.textContent = t('Multi-Auth');
            multiAuthBtn.style.display = 'none';
            tabs.appendChild(multiAuthBtn);

            var multiAuthSection = doc.createElement('section');
            multiAuthSection.className = 'multiauth-section section';
            multiAuthSection.setAttribute('data-hook', 'multiauth-section');
            multiAuthSection.style.display = 'none';

            var MAX_AUTHS = 5;
            var STORAGE_KEY = 'haxdesk_multi_auths';
            var CURRENT_AUTH_KEY = 'player_auth_key';

            function getStoredAuths() {
                try { var d = localStorage.getItem(STORAGE_KEY); return d ? JSON.parse(d) : []; } catch(e) { return []; }
            }
            function saveAuths(auths) { localStorage.setItem(STORAGE_KEY, JSON.stringify(auths)); }
            function getCurrentAuth() { return localStorage.getItem(CURRENT_AUTH_KEY) || ''; }
            function setCurrentAuth(authKey) { if (authKey) localStorage.setItem(CURRENT_AUTH_KEY, authKey); }
            function truncateAuth(auth) {
                if (!auth || auth.length < 20) return auth || '';
                return auth.substring(0, 8) + '...' + auth.substring(auth.length - 8);
            }
            function isValidAuth(auth) {
                if (!auth || typeof auth !== 'string') return false;
                var parts = auth.split('.');
                return parts.length === 4 && parts[0].length > 0;
            }

            var container = doc.createElement('div');
            container.style.cssText = 'display:flex;flex-direction:column;gap:12px;';

            var header = doc.createElement('div');
            header.style.cssText = 'color:var(--theme-text-muted);font-size:11px;margin-bottom:4px;padding-bottom:8px;border-bottom:1px solid var(--theme-border);';

            var currentAuth = getCurrentAuth();
            var auths = getStoredAuths();
            var currentAuthObj = auths.find(function(a) { return a.key === currentAuth; });
            var currentName = currentAuthObj ? currentAuthObj.name : '';

            if (currentAuth) {
                header.innerHTML = t('Auth atual: ') + '<span style="color:var(--theme-text-primary);font-family:monospace;">' + truncateAuth(currentAuth) + '</span>' + (currentName ? ' (' + currentName + ')' : '');
            } else {
                header.innerHTML = t('Nenhuma auth ativa. Máximo de 5 auths.');
            }
            container.appendChild(header);

            function updateHeader() {
                var current = getCurrentAuth();
                var al = getStoredAuths();
                var found = al.find(function(a) { return a.key === current; });
                var name = found ? found.name : '';
                if (current) {
                    header.innerHTML = t('Auth atual: ') + '<span style="color:var(--theme-text-primary);font-family:monospace;">' + truncateAuth(current) + '</span>' + (name ? ' (' + name + ')' : '');
                } else {
                    header.innerHTML = t('Nenhuma auth ativa. Máximo de 5 auths.');
                }
            }

            var listContainer = doc.createElement('div');
            listContainer.style.cssText = 'display:flex;flex-direction:column;gap:6px;max-height:200px;overflow-y:auto;';

            function renderAuthList() {
                listContainer.innerHTML = '';
                var al = getStoredAuths();
                var ca = getCurrentAuth();
                if (al.length === 0) {
                    var emptyMsg = doc.createElement('div');
                    emptyMsg.style.cssText = 'color:var(--theme-text-muted);font-size:12px;text-align:center;padding:20px;';
                    emptyMsg.textContent = t('Nenhuma auth salva. Adicione uma abaixo.');
                    listContainer.appendChild(emptyMsg);
                    return;
                }
                al.forEach(function(authObj, index) {
                    var row = doc.createElement('div');
                    var isActive = authObj.key === ca;
                    row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:10px;background:' + (isActive ? 'rgba(201,162,39,0.08)' : 'var(--theme-bg-secondary)') + ';border:1px solid ' + (isActive ? '#c9a227' : 'var(--theme-border)') + ';border-radius:6px;';

                    var indicator = doc.createElement('div');
                    indicator.style.cssText = 'width:7px;height:7px;border-radius:50%;flex-shrink:0;background:' + (isActive ? '#c9a227' : 'var(--theme-border)') + ';';
                    row.appendChild(indicator);

                    var info = doc.createElement('div');
                    info.style.cssText = 'flex:1;min-width:0;';

                    var name = doc.createElement('div');
                    name.style.cssText = 'color:var(--theme-text-primary);font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
                    name.textContent = authObj.name || (t('Auth ') + (index + 1));
                    info.appendChild(name);

                    var keyPreview = doc.createElement('div');
                    keyPreview.style.cssText = 'color:var(--theme-text-muted);font-size:10px;font-family:monospace;';
                    keyPreview.textContent = truncateAuth(authObj.key);
                    info.appendChild(keyPreview);
                    row.appendChild(info);

                    if (!isActive) {
                        var useBtn = doc.createElement('button');
                        useBtn.style.cssText = 'padding:5px 11px;background:#c9a227;border:none;border-radius:4px;color:#000;font-size:11px;font-weight:600;cursor:pointer;';
                        useBtn.textContent = t('Usar');
                        useBtn.onmouseenter = function() { useBtn.style.background = '#b8911f'; };
                        useBtn.onmouseleave = function() { useBtn.style.background = '#c9a227'; };
                        useBtn.onclick = function() {
                            setCurrentAuth(authObj.key);
                            updateHeader();
                            renderAuthList();
                            if (window.showToast) window.showToast(t('Auth alterada! Feche e abra o app para aplicar.'), 'success');
                        };
                        row.appendChild(useBtn);
                    }

                    var removeBtn = doc.createElement('button');
                    removeBtn.style.cssText = 'padding:5px 7px;background:transparent;border:1px solid var(--theme-border);border-radius:4px;color:var(--theme-text-muted);font-size:11px;cursor:pointer;';
                    removeBtn.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
                    removeBtn.onmouseenter = function() { removeBtn.style.borderColor = '#dc2626'; removeBtn.style.color = '#dc2626'; };
                    removeBtn.onmouseleave = function() { removeBtn.style.borderColor = ''; removeBtn.style.color = ''; };
                    removeBtn.onclick = function() {
                        var newAuths = al.filter(function(_, i) { return i !== index; });
                        saveAuths(newAuths);
                        renderAuthList();
                        if (window.showToast) window.showToast(t('Auth removida'), 'info');
                    };
                    row.appendChild(removeBtn);
                    listContainer.appendChild(row);
                });
            }

            container.appendChild(listContainer);

            var addSection = doc.createElement('div');
            addSection.style.cssText = 'margin-top:12px;padding-top:12px;border-top:1px solid var(--theme-border);';

            var addLabel = doc.createElement('div');
            addLabel.style.cssText = 'color:var(--theme-text-primary);font-size:12px;font-weight:500;margin-bottom:8px;';
            addLabel.textContent = t('Adicionar Nova Auth');
            addSection.appendChild(addLabel);

            var inputCss = 'width:100%;padding:8px 12px;background:var(--theme-bg-secondary);border:1px solid var(--theme-border);border-radius:6px;color:var(--theme-text-primary);font-size:12px;margin-bottom:8px;box-sizing:border-box;';
            var nameInput = doc.createElement('input');
            nameInput.type = 'text';
            nameInput.placeholder = t('Nome (opcional)');
            nameInput.style.cssText = inputCss;
            addSection.appendChild(nameInput);

            var authInput = doc.createElement('input');
            authInput.type = 'text';
            authInput.placeholder = t('Auth Key (ex: idkey.xxx.xxx.xxx)');
            authInput.style.cssText = inputCss + 'font-family:monospace;';
            addSection.appendChild(authInput);

            var btnRow = doc.createElement('div');
            btnRow.style.cssText = 'display:flex;gap:8px;';

            var addBtn = doc.createElement('button');
            addBtn.style.cssText = 'flex:1;padding:9px;background:#c9a227;border:none;border-radius:6px;color:#000;font-size:12px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;';
            addBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' + t('Adicionar');
            addBtn.onmouseenter = function() { addBtn.style.background = '#b8911f'; };
            addBtn.onmouseleave = function() { addBtn.style.background = '#c9a227'; };
            addBtn.onclick = function() {
                var authKey = authInput.value.trim();
                var authName = nameInput.value.trim();
                if (!authKey) { if (window.showToast) window.showToast(t('Digite uma auth key'), 'error'); return; }
                if (!isValidAuth(authKey)) { if (window.showToast) window.showToast(t('Formato inválido. Use: idkey.xxx.xxx.xxx'), 'error'); return; }
                var al = getStoredAuths();
                if (al.some(function(a) { return a.key === authKey; })) { if (window.showToast) window.showToast(t('Esta auth já está salva'), 'error'); return; }
                if (al.length >= MAX_AUTHS) { if (window.showToast) window.showToast(t('Limite de ' + MAX_AUTHS + ' auths atingido'), 'error'); return; }
                al.push({ name: authName || '', key: authKey });
                saveAuths(al);
                authInput.value = '';
                nameInput.value = '';
                renderAuthList();
                if (window.showToast) window.showToast(t('Auth adicionada!'), 'success');
            };
            btnRow.appendChild(addBtn);

            var saveCurrentBtn = doc.createElement('button');
            saveCurrentBtn.style.cssText = 'padding:9px 14px;background:var(--theme-bg-secondary);border:1px solid var(--theme-border);border-radius:6px;color:var(--theme-text-primary);font-size:12px;cursor:pointer;';
            saveCurrentBtn.textContent = t('Salvar Atual');
            saveCurrentBtn.onmouseenter = function() { saveCurrentBtn.style.background = 'var(--theme-bg-hover)'; };
            saveCurrentBtn.onmouseleave = function() { saveCurrentBtn.style.background = 'var(--theme-bg-secondary)'; };
            saveCurrentBtn.onclick = function() {
                var ca = getCurrentAuth();
                if (!ca) { if (window.showToast) window.showToast(t('Nenhuma auth atual para salvar'), 'error'); return; }
                var al = getStoredAuths();
                if (al.some(function(a) { return a.key === ca; })) { if (window.showToast) window.showToast(t('Auth atual já está salva'), 'info'); return; }
                if (al.length >= MAX_AUTHS) { if (window.showToast) window.showToast(t('Limite de ' + MAX_AUTHS + ' auths atingido'), 'error'); return; }
                var authName = nameInput.value.trim() || (t('Auth ') + (al.length + 1));
                al.push({ name: authName, key: ca });
                saveAuths(al);
                nameInput.value = '';
                renderAuthList();
                if (window.showToast) window.showToast(t('Auth atual salva!'), 'success');
            };
            btnRow.appendChild(saveCurrentBtn);

            addSection.appendChild(btnRow);
            container.appendChild(addSection);

            var tip = doc.createElement('div');
            tip.style.cssText = 'color:var(--theme-text-muted);font-size:10px;margin-top:10px;padding:8px;background:var(--theme-bg-secondary);border-radius:6px;';
            tip.textContent = t('Após trocar de auth, feche e abra o app para aplicar.');
            container.appendChild(tip);

            multiAuthSection.appendChild(container);
            renderAuthList();

            var dialogContent = dialog.querySelector('.section') || dialog;
            dialogContent.parentNode.insertBefore(multiAuthSection, dialogContent.nextSibling);

            multiAuthBtn.addEventListener('click', function() {
                var sections = dialog.querySelectorAll('.tabcontents > .section');
                for (var i = 0; i < sections.length; i++) sections[i].style.display = 'none';
                var ts = dialog.querySelector('[data-hook="theme-section"]'); if (ts) ts.style.display = 'none';
                var ps = dialog.querySelector('[data-hook="perf-section"]'); if (ps) ps.style.display = 'none';
                multiAuthSection.style.display = 'block';
                updateHeader();
                renderAuthList();
                var allTabs = tabs.querySelectorAll('button');
                for (var i = 0; i < allTabs.length; i++) allTabs[i].classList.remove('selected');
                multiAuthBtn.classList.add('selected');
            });

            var originalTabsM = tabs.querySelectorAll('button:not([data-hook="multiauthbtn"])');
            for (var i = 0; i < originalTabsM.length; i++) {
                originalTabsM[i].addEventListener('click', function() { multiAuthSection.style.display = 'none'; });
            }

            return multiAuthBtn;
        }

        
        function createExtraTab(doc, tabs) {
            if (tabs.querySelector('button[data-hook="extrabtn"]')) return;

            var extraBtn = doc.createElement('button');
            extraBtn.setAttribute('data-hook', 'extrabtn');
            extraBtn.textContent = t('Extrapolación');
            extraBtn.style.display = 'none';
            tabs.appendChild(extraBtn);

            var extraSection = doc.createElement('section');
            extraSection.className = 'extra-section section';
            extraSection.setAttribute('data-hook', 'extra-section');
            extraSection.style.display = 'none';

            var STORAGE_KEY = 'hbx_extra_shortcuts';
            var MAX_SLOTS   = 8;

            function loadSlots() {
                try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch(e) { return []; }
            }
            function saveSlots(arr) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
            }

            function applyExtra(val) {
                val = parseInt(val);
                if (isNaN(val) || val < 0) return;
                var inp = document.querySelector('[data-hook="input"]');
                if (inp) {
                    var prev = inp.value;
                    inp.value = '/extrapolation ' + val;
                    inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }));
                    inp.dispatchEvent(new KeyboardEvent('keyup',   { key: 'Enter', keyCode: 13, bubbles: true }));
                    inp.value = prev;
                }
                try { var q = window.__hm_qa; if (q && q.za && q.za.Fm) q.za.Fm(val); } catch(e) {}
                localStorage.setItem('extrapolation', val);
                showExtraToast(val);
            }

            function showExtraToast(val) {
                var id = 'hbx-extra-toast';
                var el = document.getElementById(id);
                if (!el) {
                    el = document.createElement('div');
                    el.id = id;
                    el.style.cssText = [
                        'position:fixed;bottom:60px;left:50%;transform:translateX(-50%)',
                        'background:rgba(5,5,9,.9);border:1px solid rgba(201,162,39,.5)',
                        'color:#c9a227;font-family:monospace;font-size:13px;font-weight:700',
                        'padding:6px 18px;border-radius:99px;z-index:2147483647',
                        'pointer-events:none;opacity:0;transition:opacity .15s'
                    ].join(';');
                    document.body.appendChild(el);
                }
                el.textContent = 'EXTRA: ' + val + ' ms';
                el.style.opacity = '1';
                clearTimeout(el._t);
                el._t = setTimeout(function() { el.style.opacity = '0'; }, 1200);
            }

            var KEY_LISTENER_ID = 'hbx-extra-keydown';
            if (!window[KEY_LISTENER_ID]) {
                window[KEY_LISTENER_ID] = function(e) {
                    var tag = document.activeElement && document.activeElement.tagName;
                    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
                    var slots = loadSlots();
                    for (var i = 0; i < slots.length; i++) {
                        if (slots[i].key && slots[i].key.toLowerCase() === e.key.toLowerCase()) {
                            e.stopPropagation();
                            applyExtra(slots[i].value);
                            return;
                        }
                    }
                };
                document.addEventListener('keydown', window[KEY_LISTENER_ID], true);
            }

            var container = doc.createElement('div');
            container.style.cssText = 'display:flex;flex-direction:column;gap:10px;';

            var header = doc.createElement('div');
            header.style.cssText = 'color:var(--theme-text-muted);font-size:11px;padding-bottom:8px;border-bottom:1px solid var(--theme-border);line-height:1.6;';
            header.textContent = t('Asigná una tecla a un valor de extrapolación. Al presionar la tecla durante el juego, se aplica automáticamente.');
            container.appendChild(header);

            var listWrap = doc.createElement('div');
            listWrap.style.cssText = 'display:flex;flex-direction:column;gap:5px;';

            function renderSlots() {
                listWrap.innerHTML = '';
                var slots = loadSlots();

                if (slots.length === 0) {
                    var empty = doc.createElement('div');
                    empty.style.cssText = 'color:var(--theme-text-muted);font-size:11.5px;text-align:center;padding:14px;';
                    empty.textContent = t('No hay atajos configurados. Añadí uno abajo.');
                    listWrap.appendChild(empty);
                    return;
                }

                slots.forEach(function(slot, idx) {
                    var row = doc.createElement('div');
                    row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:7px 10px;background:var(--theme-bg-secondary);border:1px solid var(--theme-border);border-radius:7px;';

                    var keyBadge = doc.createElement('div');
                    keyBadge.style.cssText = 'min-width:28px;height:24px;display:flex;align-items:center;justify-content:center;background:var(--theme-bg-primary);border:1px solid var(--theme-border-light);border-radius:5px;font-family:monospace;font-size:12px;font-weight:700;color:#c9a227;flex-shrink:0;padding:0 4px;';
                    keyBadge.textContent = slot.key ? slot.key.toUpperCase() : '?';

                    var arrow = doc.createElement('span');
                    arrow.style.cssText = 'color:var(--theme-text-muted);font-size:12px;flex-shrink:0;';
                    arrow.textContent = '→';

                    var valLabel = doc.createElement('span');
                    valLabel.style.cssText = 'color:var(--theme-text-primary);font-size:13px;font-weight:600;font-family:monospace;flex:1;';
                    valLabel.textContent = slot.value + ' ms';

                    var testBtn = doc.createElement('button');
                    testBtn.style.cssText = 'padding:3px 9px;background:rgba(201,162,39,.15);border:1px solid rgba(201,162,39,.3);border-radius:4px;color:#c9a227;font-size:10px;font-weight:600;cursor:pointer;';
                    testBtn.textContent = t('Test');
                    testBtn.onclick = function() { applyExtra(slot.value); };

                    var delBtn = doc.createElement('button');
                    delBtn.style.cssText = 'padding:3px 7px;background:transparent;border:1px solid var(--theme-border);border-radius:4px;color:var(--theme-text-muted);font-size:11px;cursor:pointer;';
                    delBtn.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
                    delBtn.onmouseenter = function() { delBtn.style.borderColor='#dc2626';delBtn.style.color='#dc2626'; };
                    delBtn.onmouseleave = function() { delBtn.style.borderColor='';delBtn.style.color=''; };
                    delBtn.onclick = function() {
                        var s = loadSlots(); s.splice(idx, 1); saveSlots(s); renderSlots();
                    };

                    row.appendChild(keyBadge);
                    row.appendChild(arrow);
                    row.appendChild(valLabel);
                    row.appendChild(testBtn);
                    row.appendChild(delBtn);
                    listWrap.appendChild(row);
                });
            }

            container.appendChild(listWrap);

            var addSection = doc.createElement('div');
            addSection.style.cssText = 'padding-top:10px;border-top:1px solid var(--theme-border);display:flex;flex-direction:column;gap:8px;';

            var addLabel = doc.createElement('div');
            addLabel.style.cssText = 'color:var(--theme-text-primary);font-size:12px;font-weight:500;';
            addLabel.textContent = t('Nuevo atajo');
            addSection.appendChild(addLabel);

            var inputRow = doc.createElement('div');
            inputRow.style.cssText = 'display:flex;gap:8px;align-items:center;';

            var keyInput = doc.createElement('input');
            keyInput.type = 'text';
            keyInput.maxLength = 1;
            keyInput.placeholder = t('Tecla');
            keyInput.style.cssText = 'width:52px;padding:8px;text-align:center;background:var(--theme-bg-secondary);border:1px solid var(--theme-border);border-radius:6px;color:#c9a227;font-family:monospace;font-size:14px;font-weight:700;text-transform:uppercase;box-sizing:border-box;';
            keyInput.addEventListener('keydown', function(e) {
                e.stopPropagation();
                if (e.key === 'Backspace') { keyInput.value = ''; return; }
                if (e.key.length === 1) {
                    e.preventDefault();
                    keyInput.value = e.key.toUpperCase();
                }
            });

            var sep = doc.createElement('span');
            sep.style.cssText = 'color:var(--theme-text-muted);font-size:13px;';
            sep.textContent = '→';

            var valInput = doc.createElement('input');
            valInput.type = 'number';
            valInput.min = '0';
            valInput.max = '500';
            valInput.step = '10';
            valInput.placeholder = 'ms';
            valInput.style.cssText = 'width:70px;padding:8px;text-align:center;background:var(--theme-bg-secondary);border:1px solid var(--theme-border);border-radius:6px;color:var(--theme-text-primary);font-family:monospace;font-size:13px;font-weight:600;box-sizing:border-box;';
            valInput.addEventListener('keydown', function(e) { e.stopPropagation(); });

            var addBtnE = doc.createElement('button');
            addBtnE.style.cssText = 'flex:1;padding:8px;background:#c9a227;border:none;border-radius:6px;color:#000;font-size:12px;font-weight:700;cursor:pointer;';
            addBtnE.textContent = t('Añadir');
            addBtnE.onmouseenter = function() { addBtnE.style.background='#b8911f'; };
            addBtnE.onmouseleave = function() { addBtnE.style.background='#c9a227'; };
            addBtnE.onclick = function() {
                var key = keyInput.value.trim();
                var val = parseInt(valInput.value);
                if (!key || key.length !== 1) { if (window.showToast) window.showToast(t('Ingresá una tecla'), 'error'); return; }
                if (isNaN(val) || val < 0 || val > 500) { if (window.showToast) window.showToast(t('Valor entre 0 y 500'), 'error'); return; }
                var slots = loadSlots();
                if (slots.length >= MAX_SLOTS) { if (window.showToast) window.showToast(t('Máximo ' + MAX_SLOTS + ' atajos'), 'error'); return; }
                if (slots.some(function(s) { return s.key.toLowerCase() === key.toLowerCase(); })) { if (window.showToast) window.showToast(t('Esa tecla ya está usada'), 'error'); return; }
                slots.push({ key: key.toLowerCase(), value: val });
                saveSlots(slots);
                keyInput.value = '';
                valInput.value = '';
                renderSlots();
                if (window.showToast) window.showToast(t('Atajo añadido!'), 'success');
            };

            inputRow.appendChild(keyInput);
            inputRow.appendChild(sep);
            inputRow.appendChild(valInput);
            inputRow.appendChild(addBtnE);
            addSection.appendChild(inputRow);

            var tip = doc.createElement('div');
            tip.style.cssText = 'color:var(--theme-text-muted);font-size:10px;padding:6px 8px;background:var(--theme-bg-secondary);border-radius:5px;line-height:1.5;';
            tip.textContent = t('Ej: tecla X → 300 ms. Funciona durante la partida siempre que no estés escribiendo en el chat.');
            addSection.appendChild(tip);

            container.appendChild(addSection);
            extraSection.appendChild(container);
            renderSlots();

            var dialogContent = dialog.querySelector('.section') || dialog;
            dialogContent.parentNode.insertBefore(extraSection, dialogContent.nextSibling);

            extraBtn.addEventListener('click', function() {
                var sections = dialog.querySelectorAll('.tabcontents > .section');
                for (var i = 0; i < sections.length; i++) sections[i].style.display = 'none';
                ['theme-section','perf-section','multiauth-section','geo-section'].forEach(function(h) {
                    var s = dialog.querySelector('[data-hook="' + h + '"]'); if (s) s.style.display = 'none';
                });
                extraSection.style.display = 'block';
                renderSlots();
                var allTabs = tabs.querySelectorAll('button');
                for (var i = 0; i < allTabs.length; i++) allTabs[i].classList.remove('selected');
                extraBtn.classList.add('selected');
            });

            var originalTabsEx = tabs.querySelectorAll('button:not([data-hook="extrabtn"])');
            for (var i = 0; i < originalTabsEx.length; i++) {
                originalTabsEx[i].addEventListener('click', function() { extraSection.style.display = 'none'; });
            }

            return extraBtn;
        }

        
        function createGeoTab(doc, tabs) {
            if (tabs.querySelector('button[data-hook="geobtn"]')) return;

            var geoBtn = doc.createElement('button');
            geoBtn.setAttribute('data-hook', 'geobtn');
            geoBtn.textContent = t('Geo');
            geoBtn.style.display = 'none';
            tabs.appendChild(geoBtn);

            var geoSection = doc.createElement('section');
            geoSection.className = 'geo-section section';
            geoSection.setAttribute('data-hook', 'geo-section');
            geoSection.style.display = 'none';

            var container = doc.createElement('div');
            container.style.cssText = 'display:flex;flex-direction:column;gap:14px;padding:4px 0;';

            var infoBox = doc.createElement('div');
            infoBox.style.cssText = 'color:var(--theme-text-muted);font-size:11px;padding-bottom:10px;border-bottom:1px solid var(--theme-border);line-height:1.6;';
            infoBox.innerHTML = t('Sincroniza tu ubicación real con la bandera elegida. Útil para evitar restricciones geográficas.');
            container.appendChild(infoBox);

            var statusRow = doc.createElement('div');
            statusRow.style.cssText = 'display:flex;flex-direction:column;gap:8px;';

            function getGeoInfo() {
                try {
                    var realRaw = localStorage.getItem('geo');
                    var overrideRaw = localStorage.getItem('geo_override');
                    var isActive = localStorage.getItem('geo_bypass_tick') === 'true';
                    var real = realRaw ? JSON.parse(realRaw) : null;
                    var override = overrideRaw ? JSON.parse(overrideRaw) : null;
                    return { real: real, override: override, isActive: isActive };
                } catch(e) { return { real: null, override: null, isActive: false }; }
            }

            function renderStatus() {
                statusRow.innerHTML = '';
                var info = getGeoInfo();

                function makeRow(label, value, flagCode) {
                    var row = doc.createElement('div');
                    row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:8px 10px;background:var(--theme-bg-secondary);border:1px solid var(--theme-border);border-radius:6px;';
                    var lbl = doc.createElement('span');
                    lbl.style.cssText = 'color:var(--theme-text-muted);font-size:11.5px;';
                    lbl.textContent = label;
                    var val = doc.createElement('span');
                    val.style.cssText = 'color:var(--theme-text-primary);font-size:12px;font-weight:500;display:flex;align-items:center;gap:6px;';
                    if (flagCode) {
                        var flag = doc.createElement('span');
                        flag.className = 'flagico f-' + flagCode.toLowerCase();
                        flag.style.cssText = 'display:inline-block;width:18px;height:14px;';
                        val.appendChild(flag);
                    }
                    var txt = doc.createElement('span');
                    txt.textContent = value || '—';
                    val.appendChild(txt);
                    row.appendChild(lbl);
                    row.appendChild(val);
                    return row;
                }

                var realCode = info.real ? info.real.code : null;
                var realCoords = info.real ? (info.real.lat.toFixed(2) + ', ' + info.real.lon.toFixed(2)) : '—';
                statusRow.appendChild(makeRow(t('Ubicación real:'), (realCode ? realCode.toUpperCase() : '—') + '  ' + realCoords, realCode));

                var ovCode = info.override ? info.override.code : null;
                statusRow.appendChild(makeRow(t('Override activo:'), ovCode ? ovCode.toUpperCase() : t('Ninguno'), ovCode));

                var statusIndicator = doc.createElement('div');
                statusIndicator.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:6px;background:' + (info.isActive ? 'rgba(201,162,39,0.1)' : 'var(--theme-bg-secondary)') + ';border:1px solid ' + (info.isActive ? '#c9a227' : 'var(--theme-border)') + ';';
                var dot = doc.createElement('div');
                dot.style.cssText = 'width:7px;height:7px;border-radius:50%;background:' + (info.isActive ? '#c9a227' : 'var(--theme-text-muted)') + ';flex-shrink:0;';
                var statusTxt = doc.createElement('span');
                statusTxt.style.cssText = 'font-size:12px;color:' + (info.isActive ? '#c9a227' : 'var(--theme-text-muted)') + ';font-weight:500;';
                statusTxt.textContent = info.isActive ? t('Bypass ACTIVO — usando coords reales + bandera override') : t('Bypass inactivo');
                statusIndicator.appendChild(dot);
                statusIndicator.appendChild(statusTxt);
                statusRow.appendChild(statusIndicator);
            }

            container.appendChild(statusRow);

            var btnGroup = doc.createElement('div');
            btnGroup.style.cssText = 'display:flex;flex-direction:column;gap:8px;margin-top:4px;';

            function makeGeoBtn(label, icon, style, onClick) {
                var btn = doc.createElement('button');
                btn.style.cssText = 'width:100%;padding:10px 14px;border:1px solid var(--theme-border);border-radius:6px;font-size:12.5px;font-weight:500;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;' + style;
                btn.innerHTML = icon + label;
                btn.onclick = function() { onClick(); renderStatus(); };
                return btn;
            }

            var syncBtn = makeGeoBtn(
                t('Sincronizar Bypass'),
                '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>',
                'background:#c9a227;color:#000;border-color:#c9a227;',
                function() {
                    if (window.GeoManager) {
                        window.GeoManager.sync(true);
                        if (window.showToast) window.showToast(t('¡Bypass activado y sincronizado!'), 'success');
                    } else {
                        if (window.showToast) window.showToast(t('GeoManager no disponible'), 'error');
                    }
                }
            );
            syncBtn.onmouseenter = function() { syncBtn.style.background = '#b8911f'; };
            syncBtn.onmouseleave = function() { syncBtn.style.background = '#c9a227'; };

            var deactivateBtn = makeGeoBtn(
                t('Desactivar Bypass'),
                '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
                'background:var(--theme-bg-secondary);color:var(--theme-text-primary);',
                function() {
                    if (window.GeoManager) {
                        window.GeoManager.sync(false);
                        if (window.showToast) window.showToast(t('Bypass desactivado'), 'info');
                    }
                }
            );
            deactivateBtn.onmouseenter = function() { deactivateBtn.style.background = 'var(--theme-bg-hover)'; };
            deactivateBtn.onmouseleave = function() { deactivateBtn.style.background = 'var(--theme-bg-secondary)'; };

            var removeGeoBtn = makeGeoBtn(
                t('Eliminar Override'),
                '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>',
                'background:var(--theme-bg-secondary);color:#dc2626;border-color:var(--theme-border);',
                function() {
                    localStorage.removeItem('geo_override');
                    localStorage.setItem('geo_bypass_tick', 'false');
                    if (window.showToast) window.showToast(t('Override eliminado'), 'info');
                }
            );
            removeGeoBtn.onmouseenter = function() { removeGeoBtn.style.borderColor = '#dc2626'; removeGeoBtn.style.background = 'rgba(220,38,38,0.08)'; };
            removeGeoBtn.onmouseleave = function() { removeGeoBtn.style.borderColor = 'var(--theme-border)'; removeGeoBtn.style.background = 'var(--theme-bg-secondary)'; };

            btnGroup.appendChild(syncBtn);
            btnGroup.appendChild(deactivateBtn);
            btnGroup.appendChild(removeGeoBtn);
            container.appendChild(btnGroup);

            var geoTip = doc.createElement('div');
            geoTip.style.cssText = 'color:var(--theme-text-muted);font-size:10px;padding:8px;background:var(--theme-bg-secondary);border-radius:6px;line-height:1.5;';
            geoTip.textContent = t('Selecciona una bandera desde la pantalla de sala y luego activa el bypass aquí.');
            container.appendChild(geoTip);

            geoSection.appendChild(container);

            var dialogContent = dialog.querySelector('.section') || dialog;
            dialogContent.parentNode.insertBefore(geoSection, dialogContent.nextSibling);

            geoBtn.addEventListener('click', function() {
                var sections = dialog.querySelectorAll('.tabcontents > .section');
                for (var i = 0; i < sections.length; i++) sections[i].style.display = 'none';
                ['theme-section','perf-section','multiauth-section'].forEach(function(h) {
                    var s = dialog.querySelector('[data-hook="' + h + '"]'); if (s) s.style.display = 'none';
                });
                geoSection.style.display = 'block';
                renderStatus();
                var allTabs = tabs.querySelectorAll('button');
                for (var i = 0; i < allTabs.length; i++) allTabs[i].classList.remove('selected');
                geoBtn.classList.add('selected');
            });

            var originalTabsG = tabs.querySelectorAll('button:not([data-hook="geobtn"])');
            for (var i = 0; i < originalTabsG.length; i++) {
                originalTabsG[i].addEventListener('click', function() { geoSection.style.display = 'none'; });
            }

            return geoBtn;
        }

        function createMiscTab(doc, tabs) { return null; }


        
        var sidebarButtons = [];
        var pendingButtons = {};

        function createSidebarButton(originalBtn) {
            var hook = originalBtn.getAttribute('data-hook');
            if (['avatarbtn', 'fieldbgbtn', 'scoreboardbtn', 'tweaksbtn'].indexOf(hook) !== -1) {
                originalBtn.style.display = 'none';
                return;
            }
            if (hook === 'miscbtn_hbx') return;
            if (sidebar.querySelector('[data-hook-ref="' + hook + '"]')) return;

            var iconData = tabIcons[hook] || {
                icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>',
                tooltip: originalBtn.textContent,
                order: 99
            };

            var sidebarBtn = doc.createElement('button');
            sidebarBtn.className = 'settings-sidebar-btn';
            sidebarBtn.setAttribute('data-hook-ref', hook);
            sidebarBtn.setAttribute('data-order', iconData.order || 99);
            sidebarBtn.innerHTML = iconData.icon;

            if (originalBtn.classList.contains('selected')) sidebarBtn.classList.add('selected');

            addTooltip(sidebarBtn, iconData.tooltip);

            var _customSections = ['theme-section','perf-section','multiauth-section','geo-section','extra-section','avatarsec','avatar-section','marcadorsec','marcador-section','fieldbg-section','scoreboard-section'];

            sidebarBtn.onclick = function () {
                var allBtns = sidebar.querySelectorAll('.settings-sidebar-btn:not([data-close])');
                for (var j = 0; j < allBtns.length; j++) allBtns[j].classList.remove('selected');
                sidebarBtn.classList.add('selected');

                _customSections.forEach(function(sec) {
                    var dataHook = sec;
                    var corresponds = false;
                    if (hook === 'themebtn'    && sec === 'theme-section')     corresponds = true;
                    if (hook === 'perfbtn'     && sec === 'perf-section')      corresponds = true;
                    if (hook === 'multiauthbtn'&& sec === 'multiauth-section') corresponds = true;
                    if (hook === 'geobtn'      && sec === 'geo-section')       corresponds = true;
                    if (hook === 'extrabtn'    && sec === 'extra-section')     corresponds = true;
                    if (hook === 'avatarbtn'   && (sec === 'avatarsec' || sec === 'avatar-section')) corresponds = true;
                    if (hook === 'fieldbgbtn'  && sec === 'fieldbg-section') corresponds = true;
                    if (hook === 'scoreboardbtn' && sec === 'scoreboard-section') corresponds = true;
                    if (!corresponds) {
                        var s = dialog.querySelector('[data-hook="' + dataHook + '"]');
                        if (s) s.style.display = 'none';
                    }
                });

                if (hook !== 'perfbtn') {
                    dialog.style.maxHeight = '';
                    dialog.style.height = '';
                    var tabcontents = dialog.querySelector('.tabcontents');
                    if (tabcontents) { tabcontents.style.maxHeight = ''; tabcontents.style.overflowY = ''; }
                }

                var isCustom = ['themebtn','perfbtn','multiauthbtn','geobtn','extrabtn','avatarbtn','fieldbgbtn','scoreboardbtn'].indexOf(hook) !== -1;
                if (!isCustom) {
                    var sections = dialog.querySelectorAll('.tabcontents > .section');
                    for (var k = 0; k < sections.length; k++) sections[k].style.display = '';
                }

                originalBtn.click();
            };

            originalBtn.addEventListener('click', function () {
                var allBtns = sidebar.querySelectorAll('.settings-sidebar-btn:not([data-close])');
                for (var j = 0; j < allBtns.length; j++) allBtns[j].classList.remove('selected');
                sidebarBtn.classList.add('selected');
            });

            pendingButtons[hook] = sidebarBtn;
            sidebarButtons.push(sidebarBtn);
        }

        function insertButtonsInOrder() {
            var spacer = sidebar.querySelector('[data-spacer]');
            for (var i = 0; i < tabOrder.length; i++) {
                var hook = tabOrder[i];
                if (pendingButtons[hook]) {
                    if (spacer) sidebar.insertBefore(pendingButtons[hook], spacer);
                    else sidebar.appendChild(pendingButtons[hook]);
                }
            }
        }

        var tabButtons = tabs ? tabs.querySelectorAll('button') : [];
        for (var i = 0; i < tabButtons.length; i++) createSidebarButton(tabButtons[i]);

        if (tabs) {
            // Se saco el selector de temas: un unico look prolijo para todos.
            var perfTabBtn = createPerfTab(doc, tabs);
            if (perfTabBtn) createSidebarButton(perfTabBtn);

            var multiAuthTabBtn = createMultiAuthTab(doc, tabs);
            if (multiAuthTabBtn) createSidebarButton(multiAuthTabBtn);

            var extraTabBtn = createExtraTab(doc, tabs);
            if (extraTabBtn) createSidebarButton(extraTabBtn);

            var geoTabBtn = createGeoTab(doc, tabs);
            if (geoTabBtn) createSidebarButton(geoTabBtn);

        }

        var spacer = doc.createElement('div');
        spacer.style.cssText = 'flex:1;min-height:8px;';
        spacer.setAttribute('data-spacer', 'true');
        sidebar.appendChild(spacer);

        insertButtonsInOrder();

        var divider = doc.createElement('div');
        divider.style.cssText = 'width:28px;height:1px;background:var(--theme-border);margin:2px auto;flex-shrink:0;';
        sidebar.appendChild(divider);

        var closeBtn = dialog.querySelector('button[data-hook="close"]');
        if (closeBtn) {
            var sidebarCloseBtn = doc.createElement('button');
            sidebarCloseBtn.className = 'settings-sidebar-btn';
            sidebarCloseBtn.setAttribute('data-close', 'true');
            sidebarCloseBtn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
            sidebarCloseBtn.style.cssText = sidebarCloseBtn.style.cssText + ';color:var(--theme-text-muted)!important;';
            addTooltip(sidebarCloseBtn, t('Fechar'));
            sidebarCloseBtn.onmouseenter = function() { sidebarCloseBtn.style.color = '#dc2626'; };
            sidebarCloseBtn.onmouseleave = function() { sidebarCloseBtn.style.color = ''; };
            sidebarCloseBtn.onclick = function () { closeBtn.click(); };
            sidebar.appendChild(sidebarCloseBtn);
        }

        if (tabs) {
            var _tabsExpected = tabOrder.length;
            var tabsObserver = new MutationObserver(function (mutations) {
                var needsReorder = false;
                for (var m = 0; m < mutations.length; m++) {
                    var added = mutations[m].addedNodes;
                    for (var n = 0; n < added.length; n++) {
                        if (added[n].tagName === 'BUTTON') {
                            createSidebarButton(added[n]);
                            needsReorder = true;
                        }
                    }
                }
                if (needsReorder) {
                    insertButtonsInOrder();
                    if (sidebar.querySelectorAll('.settings-sidebar-btn').length >= _tabsExpected) {
                        tabsObserver.disconnect();
                    }
                }
            });
            tabsObserver.observe(tabs, { childList: true });
        }

        if (tabs) tabs.style.display = 'none';
        if (closeBtn) closeBtn.style.display = 'none';

        dialog.style.position = 'relative';
        dialog.appendChild(sidebar);

        injectOpacitySliders(doc, dialog);
    }

    function injectOpacitySliders(doc, dialog) {
        if (doc.getElementById('hbx-opacity-injected')) return;

        var BAR_KEY  = 'hbx_bar_opacity';
        function getVal(key, def) {
            var v = parseFloat(localStorage.getItem(key));
            return isNaN(v) ? def : v;
        }

        function applyBarOpacity(val) {
            var bar = document.querySelector('.bar-container');
            if (bar) bar.style.opacity = val;
        }

        var _cachedBarOpacity  = getVal(BAR_KEY, 1);

        function applyAll() {
            applyBarOpacity(_cachedBarOpacity);
            var legacyChatStyle = document.getElementById('hbx-chat-opacity-style');
            if (legacyChatStyle) legacyChatStyle.textContent = '';
        }

        function makeOpacityRow(labelText, storageKey, defaultVal, applyFn) {
            var row = doc.createElement('div');
            row.className = 'option-row';
            row.style.cssText = 'display:flex;align-items:center;';

            var label = doc.createElement('div');
            label.style.cssText = 'margin-right:10px;flex:1;max-width:115px;';
            label.textContent = labelText;

            var valDisplay = doc.createElement('div');
            valDisplay.style.cssText = 'width:40px;';
            var cur = getVal(storageKey, defaultVal);
            valDisplay.textContent = Math.round(cur * 100) + '%';

            var slider = doc.createElement('input');
            slider.className = 'slider';
            slider.type = 'range';
            slider.min = '0';
            slider.max = '1';
            slider.step = '0.01';
            slider.value = cur;

            slider.addEventListener('input', function () {
                var v = parseFloat(slider.value);
                valDisplay.textContent = Math.round(v * 100) + '%';
                localStorage.setItem(storageKey, v);
                if (storageKey === BAR_KEY)  _cachedBarOpacity  = v;
                applyFn(v);
            });

            row.appendChild(label);
            row.appendChild(valDisplay);
            row.appendChild(slider);
            return row;
        }

        function tryInject() {
            var videosec = dialog.querySelector('[data-hook="videosec"]');
            if (!videosec) return false;
            if (videosec.querySelector('#hbx-opacity-injected')) return true;

            var barRow  = makeOpacityRow(t('Opacidad del marcador'), BAR_KEY, 1, applyBarOpacity);
            barRow.id   = 'hbx-opacity-injected';

            var chatbgSel = videosec.querySelector('[data-hook="chatbgmode"]');
            var anchor = chatbgSel ? chatbgSel.closest('div') || chatbgSel.parentNode : null;
            if (anchor && anchor.parentNode === videosec) {
                videosec.insertBefore(barRow, anchor.nextSibling);
            } else {
                videosec.appendChild(barRow);
            }

            applyAll();
            return true;
        }

        if (!tryInject()) {
            var obs = new MutationObserver(function() { if (tryInject()) obs.disconnect(); });
            obs.observe(dialog, { childList: true });
        }

        (function() {
            // bar-container/chatbox-view pueden aparecer anidados en cualquier
            // profundidad, asi que hace falta subtree:true aca. Para no pagar
            // el costo de recorrer addedNodes en cada mutacion de TODA la
            // pagina (chat, marcador, etc, disparandose varias veces por
            // segundo durante la partida), se coalescen todas las mutaciones
            // de un mismo frame y se revisa una sola vez via rAF.
            var _applyScheduled = false;
            var _pendingMuts = [];
            function _flushApplyCheck() {
                _applyScheduled = false;
                var muts = _pendingMuts;
                _pendingMuts = [];
                for (var i = 0; i < muts.length; i++) {
                    var added = muts[i].addedNodes;
                    for (var j = 0; j < added.length; j++) {
                        var n = added[j];
                        if (n.nodeType === 1 && (
                            (n.classList && (n.classList.contains('bar-container') || n.classList.contains('chatbox-view') || n.classList.contains('game-state-view'))) ||
                            (n.querySelector && n.querySelector('.bar-container, .chatbox-view'))
                        )) {
                            applyAll();
                            return;
                        }
                    }
                }
            }
            var _applyObs = new MutationObserver(function(muts) {
                for (var i = 0; i < muts.length; i++) _pendingMuts.push(muts[i]);
                if (_applyScheduled) return;
                _applyScheduled = true;
                requestAnimationFrame(_flushApplyCheck);
            });
            _applyObs.observe(document.body, { childList: true, subtree: true });
        })();
    }

    
    function initPlayerActions() {
        if (document.getElementById('hbx-pa-style')) return;

        var MUTE_KEY = 'haxclient_muted_players';

        var _mutedCache = null;
        function getMuted() {
            if (_mutedCache !== null) return _mutedCache;
            try { _mutedCache = JSON.parse(localStorage.getItem(MUTE_KEY) || '[]'); } catch(e) { _mutedCache = []; }
            return _mutedCache;
        }
        function saveMuted(arr) {
            _mutedCache = arr;
            localStorage.setItem(MUTE_KEY, JSON.stringify(arr));
        }
        function isMuted(name) {
            return getMuted().indexOf(name.toLowerCase()) !== -1;
        }
        function toggleMute(name) {
            var list = getMuted().slice();
            var low  = name.toLowerCase();
            var idx  = list.indexOf(low);
            if (idx !== -1) list.splice(idx, 1);
            else list.push(low);
            saveMuted(list);
        }

        var _chatObserver = null;

        function hideMutedMessage(node) {
            if (node.nodeType !== 1) return;
            var authorEl = node.querySelector('[data-hook="author"], .author, .chat-author, .player-name');
            if (!authorEl) {
                authorEl = node.querySelector('span:first-child, strong:first-child');
            }
            if (!authorEl) return;
            var name = authorEl.textContent.trim();
            if (name && isMuted(name)) {
                node.style.setProperty('display', 'none', 'important');
            }
        }

        function scanExistingMessages(container) {
            var msgs = container.querySelectorAll('.chat-message, [data-hook="message"], .message');
            for (var i = 0; i < msgs.length; i++) hideMutedMessage(msgs[i]);
        }

        function attachChatObserver() {
            if (_chatObserver) { try { _chatObserver.disconnect(); } catch(e) {} }

            var container = document.querySelector(
                '[data-hook="chat-content"], [data-hook="chatcontent"], ' +
                '.chat-content, .chat-messages, .chatbox-view .content'
            );

            if (!container) return false;

            scanExistingMessages(container);

            _chatObserver = new MutationObserver(function(muts) {
                for (var i = 0; i < muts.length; i++) {
                    var added = muts[i].addedNodes;
                    for (var j = 0; j < added.length; j++) {
                        hideMutedMessage(added[j]);
                    }
                }
            });
            _chatObserver.observe(container, { childList: true });
            return true;
        }

        if (!attachChatObserver()) {
            var chatRetry = setInterval(function() {
                if (attachChatObserver()) clearInterval(chatRetry);
            }, 1000);
        }

        if (!window._hbxBodyObserverCallbacks) window._hbxBodyObserverCallbacks = [];
        window._hbxBodyObserverCallbacks.push(function(n) {
            if (n.nodeType === 1 && (
                (n.classList && (n.classList.contains('chatbox-view') || n.classList.contains('chat-content'))) ||
                (n.querySelector && n.querySelector('[data-hook=\'chat-content\'], .chat-content'))
            )) {
                setTimeout(attachChatObserver, 100);
            }
        });

        var st = document.createElement('style');
        st.id = 'hbx-pa-style';
        st.textContent = [
            '.player-list-item{position:relative;display:flex;align-items:center;}',
            '.hbx-pa{display:none;position:absolute;right:4px;top:50%;',
            '  transform:translateY(-50%);gap:3px;align-items:center;}',
            '.player-list-item:hover .hbx-pa{display:flex;}',
            '.hbx-pb{font-size:9px;font-weight:800;line-height:1;padding:3px 7px;',
            '  border-radius:4px;cursor:pointer;border:1px solid transparent;',
            '  transition:all .12s;white-space:nowrap;letter-spacing:.3px;',
            '  font-family:inherit;}',
            '.hbx-pk{',
            '  background:rgba(201,162,39,.15);',
            '  color:var(--theme-color-secondary,rgba(201,162,39,.9));',
            '  border-color:rgba(201,162,39,.35);}',
            '.hbx-pk:hover{background:rgba(201,162,39,.35);color:#fff;',
            '  border-color:rgba(201,162,39,.7);box-shadow:0 0 6px rgba(201,162,39,.3);}',
            '.hbx-pk:active{transform:scale(.88);}',
            '.hbx-pbn{',
            '  background:rgba(239,68,68,.15);',
            '  color:rgba(239,68,68,.9);',
            '  border-color:rgba(239,68,68,.35);}',
            '.hbx-pbn:hover{background:rgba(239,68,68,.35);color:#fff;',
            '  border-color:rgba(239,68,68,.7);box-shadow:0 0 6px rgba(239,68,68,.3);}',
            '.hbx-pbn:active{transform:scale(.88);}',
            '.hbx-pm{',
            '  background:var(--theme-bg-secondary,rgba(255,255,255,.07));',
            '  color:var(--theme-text-muted,rgba(255,255,255,.45));',
            '  border-color:var(--theme-border,rgba(255,255,255,.12));',
            '  font-size:10px;padding:2px 5px;}',
            '.hbx-pm:hover{',
            '  background:var(--theme-bg-hover,rgba(255,255,255,.18));',
            '  color:var(--theme-text-primary,#fff);}',
            '.hbx-pm.on{',
            '  background:rgba(139,92,246,.2);color:rgba(139,92,246,.95);',
            '  border-color:rgba(139,92,246,.4);}',
            '.hbx-admin-btn{display:none !important;}',
            '.hbx-is-admin .hbx-admin-btn{display:inline-block !important;}'
        ].join('');
        document.head.appendChild(st);

        function _myId() { return window.__haxLocalPlayerId || -1; }

        function _isAdmin() {
            var tools = document.querySelector('.tools.admin-only');
            if (!tools) return false;
            var cs = window.getComputedStyle(tools);
            return cs.display !== 'none' && cs.visibility !== 'hidden';
        }

        function _triggerKick(item, doBan) {
            var pid = parseInt(item.dataset.playerId);
            if (isNaN(pid) || pid < 0) return;

            var rect = item.getBoundingClientRect();
            item.dispatchEvent(new MouseEvent('contextmenu', {
                bubbles: true, cancelable: false,
                view: window, button: 2, buttons: 0,
                clientX: rect.left + 4,
                clientY: rect.top + rect.height / 2
            }));

            var gf = document.querySelector('.gameframe') ||
                     document.querySelector('iframe[class*="game"]') ||
                     null;
            var gDoc = gf ? gf.contentDocument || gf.contentWindow.document : document;

            var step = 1;
            var attempts = 0;
            var iv = setInterval(function() {
                attempts++;
                if (attempts > 40) { clearInterval(iv); return; }

                if (step === 1) {
                    var kickLink = gDoc.querySelector('[data-hook="kick"]');
                    if (!kickLink) return;
                    kickLink.click();
                    step = 2;
                    attempts = 0;
                } else if (step === 2) {
                    var banBtn  = gDoc.querySelector('[data-hook="ban-btn"]');
                    var kickBtn = gDoc.querySelector('[data-hook="kick"]');
                    if (!banBtn || !kickBtn) return;
                    clearInterval(iv);
                    if (doBan) {
                        var banText = gDoc.querySelector('[data-hook="ban-text"]');
                        if (banText && banText.textContent.trim() === 'No') {
                            banBtn.click();
                        }
                    }
                    setTimeout(function() {
                        var finalKick = gDoc.querySelector('[data-hook="kick"]');
                        if (finalKick) finalKick.click();
                    }, 50);
                }
            }, 30);
        }

        function decorateItem(item) {
            if (item.querySelector('.hbx-pa')) return;

            var pid  = parseInt(item.dataset.playerId);
            var myId = _myId();
            var nameEl = item.querySelector('[data-hook="name"]');
            var name   = nameEl ? nameEl.textContent.trim() : '';
            if (!name) return;

            var wrap = document.createElement('div');
            wrap.className = 'hbx-pa';

            if (pid !== myId) {
                var kickBtn = document.createElement('button');
                kickBtn.className = 'hbx-pb hbx-pk hbx-admin-btn';
                kickBtn.textContent = 'K';
                kickBtn.title = 'Kickear a ' + name;
                kickBtn.addEventListener('click', function(e) {
                    e.stopPropagation(); e.preventDefault();
                    _triggerKick(item, false);
                });

                var banBtn = document.createElement('button');
                banBtn.className = 'hbx-pb hbx-pbn hbx-admin-btn';
                banBtn.textContent = 'B';
                banBtn.title = 'Banear a ' + name;
                banBtn.addEventListener('click', function(e) {
                    e.stopPropagation(); e.preventDefault();
                    _triggerKick(item, true);
                });

                wrap.appendChild(kickBtn);
                wrap.appendChild(banBtn);
            }

            var muteBtn = document.createElement('button');
            muteBtn.className = 'hbx-pb hbx-pm' + (isMuted(name) ? ' on' : '');
            muteBtn.textContent = isMuted(name) ? '🔇' : '🔈';
            muteBtn.title = 'Mutear/desmutear (solo vos)';
            muteBtn.addEventListener('click', function(e) {
                e.stopPropagation(); e.preventDefault();
                toggleMute(name);
                var m = isMuted(name);
                muteBtn.classList.toggle('on', m);
                muteBtn.textContent = m ? '🔇' : '🔈';
                var chatContainer = document.querySelector(
                    '[data-hook="chat-content"], [data-hook="chatcontent"], ' +
                    '.chat-content, .chat-messages, .chatbox-view .content'
                );
                if (chatContainer) {
                    var msgs = chatContainer.querySelectorAll('.chat-message, [data-hook="message"], .message');
                    for (var mi = 0; mi < msgs.length; mi++) {
                        var authorEl = msgs[mi].querySelector('[data-hook="author"], .author, .chat-author, .player-name, span:first-child, strong:first-child');
                        if (authorEl && authorEl.textContent.trim().toLowerCase() === name.toLowerCase()) {
                            msgs[mi].style.setProperty('display', m ? 'none' : '', 'important');
                        }
                    }
                }
            });
            wrap.appendChild(muteBtn);

            item.appendChild(wrap);
        }

        function updateAdminClass() {
            var room = document.querySelector('.room-view, .game-view');
            if (!room) return;
            room.classList.toggle('hbx-is-admin', _isAdmin());
        }

        function scanItems() {
            updateAdminClass();
            var items = document.querySelectorAll('.player-list-item[data-player-id]');
            for (var i = 0; i < items.length; i++) decorateItem(items[i]);
        }

        if (!window._hbxBodyObserverCallbacks) window._hbxBodyObserverCallbacks = [];
        window._hbxBodyObserverCallbacks.push(function(n) {
            if (n.nodeType === 1) scanItems();
        });

        setInterval(updateAdminClass, 2000);
        scanItems();
    }


    function hideTooltip() {
        var tooltip = document.getElementById('settings-sidebar-tooltip');
        if (tooltip) { tooltip.className = 'hidden'; tooltip.style.opacity = '0'; }
    }

    function init() {
        if (!Injector.isGameFrame()) return;

        function applyStatsVisibility(doc, hidden) {
            try {
                var sv = doc.querySelector('.stats-view-container');
                if (!sv) return;
                var styleEl = doc.getElementById('hbx-hide-fps-style');
                if (!styleEl) {
                    styleEl = doc.createElement('style');
                    styleEl.id = 'hbx-hide-fps-style';
                    (doc.head || doc.documentElement).appendChild(styleEl);
                }
                styleEl.textContent = hidden
                    ? '.stats-view-container,.stats-view-container *{visibility:hidden!important;opacity:0!important;pointer-events:none!important;}'
                    : '';
                sv.style.visibility = hidden ? 'hidden' : '';
                sv.style.opacity = hidden ? '0' : '';
                sv.style.pointerEvents = hidden ? 'none' : '';
            } catch (e) {}
        }

        (function applyHideFpsGraph() {
            try {
                var _po = JSON.parse(localStorage.getItem('hbx_perf_opts') || '{}');
                if (_po.hideFpsGraph) {
                    window._hbxHideStats = true;
                }
                applyStatsVisibility(document, !!_po.hideFpsGraph);
            } catch(e) {}
        })();
        if (!window._hbxBodyObserverCallbacks) window._hbxBodyObserverCallbacks = [];
        window._hbxBodyObserverCallbacks.push(function(n) {
            try {
                if (!n || n.nodeType !== 1) return;
                if ((n.classList && n.classList.contains('stats-view-container')) ||
                    (n.querySelector && n.querySelector('.stats-view-container'))) {
                    var _po3 = JSON.parse(localStorage.getItem('hbx_perf_opts') || '{}');
                    window._hbxHideStats = !!_po3.hideFpsGraph;
                    applyStatsVisibility(document, !!_po3.hideFpsGraph);
                }
            } catch(e) {}
        });

        (function applyOpacitiesOnLoad() {
            function doApply() {
                var barVal  = parseFloat(localStorage.getItem('hbx_bar_opacity'));
                if (!isNaN(barVal)) {
                    var bar = document.querySelector('.bar-container');
                    if (bar) bar.style.opacity = barVal;
                }
                var legacyChatStyle = document.getElementById('hbx-chat-opacity-style');
                if (legacyChatStyle) legacyChatStyle.textContent = '';
            }
            doApply();
            if (!window._hbxBodyObserverCallbacks) window._hbxBodyObserverCallbacks = [];
            var _opacityApplied = false;
            window._hbxBodyObserverCallbacks.push(function(n) {
                if (!_opacityApplied && n.nodeType === 1 && n.classList &&
                    (n.classList.contains('bar-container') || n.classList.contains('game-state-view'))) {
                    doApply();
                    try {
                        var _po2 = JSON.parse(localStorage.getItem('hbx_perf_opts') || '{}');
                        if (_po2.hideFpsGraph) {
                            window._hbxHideStats = true;
                        }
                        applyStatsVisibility(document, !!_po2.hideFpsGraph);
                    } catch(e) {}
                    _opacityApplied = true;
                    setTimeout(function(){ _opacityApplied = false; }, 2000);
                }
            });
        })();

        initPlayerActions();

        (function() {
            if (window._hbxRecKeyHooked) return;
            window._hbxRecKeyHooked = true;
            window._hbxRecKey = localStorage.getItem('hxpro_rec_key') || 'r';
            var _lastRecToggleTs = 0;
            function handleRecKey(ev) {
                var rk = window._hbxRecKey || 'r';
                if (ev.key !== rk && ev.key !== rk.toUpperCase()) return;
                var now = Date.now();
                if (now - _lastRecToggleTs < 250) return;
                if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) return;
                try {
                    var frames = [window];
                    for (var f = 0; f < window.frames.length; f++) {
                        try { frames.push(window.frames[f]); } catch(e) {}
                    }
                    for (var i = 0; i < frames.length; i++) {
                        try {
                            var recBtn = frames[i].document && frames[i].document.querySelector('[data-hook="rec-btn"]');
                            if (recBtn) {
                                _lastRecToggleTs = now;
                                recBtn.click();
                                ev.preventDefault();
                                break;
                            }
                            var qa = frames[i].__hm_qa;
                            if (!qa || !qa.za) continue;
                            if (qa.l && qa.l.Xa && qa.l.Xa.yq) {
                                _lastRecToggleTs = now;
                                qa.l.Xa.yq();
                            } else if (null == qa.Od) qa.ks();
                            else {
                                _lastRecToggleTs = now;
                                frames[i]._hbxSilentNext = true;
                                var r = qa.Od.stop();
                                qa.Od = null;
                                if (typeof frames[i].Ea !== 'undefined' && frames[i].Ea.wm) frames[i].Ea.wm(r);
                            }
                            if (qa.l && qa.l.Xa && qa.l.Xa.$r) qa.l.Xa.$r(null != qa.Od);
                            frames[i]._hbxRecording = (null != qa.Od);
                            ev.preventDefault();
                            break;
                        } catch(e) {}
                    }
                } catch(e) {}
            }
            document.addEventListener('keydown', handleRecKey, true);
        })();

        if (!window._hbxBodyObserverCallbacks) window._hbxBodyObserverCallbacks = [];
        var _settingsInjected = false;
        // Coalescido via rAF: antes procesaba cada tanda de mutaciones al
        // instante, asi que con varios mensajes de chat/actualizaciones de
        // marcador por segundo terminaba corriendo este bloque (y todos los
        // callbacks registrados en _hbxBodyObserverCallbacks) igual de
        // seguido. Ahora como mucho corre una vez por frame.
        var _pendingMasterMuts = [];
        var _masterFlushScheduled = false;
        function _flushMasterMuts() {
            _masterFlushScheduled = false;
            var muts = _pendingMasterMuts;
            _pendingMasterMuts = [];
            _masterBodyObsHandler(muts);
        }
        var _masterBodyObs = new MutationObserver(function(muts) {
            for (var i = 0; i < muts.length; i++) _pendingMasterMuts.push(muts[i]);
            if (_masterFlushScheduled) return;
            _masterFlushScheduled = true;
            requestAnimationFrame(_flushMasterMuts);
        });
        function _masterBodyObsHandler(muts) {
            for (var i = 0; i < muts.length; i++) {
                var nodes = muts[i].addedNodes;
                for (var j = 0; j < nodes.length; j++) {
                    var n = nodes[j];
                    if (!_settingsInjected && n.nodeType === 1) {
                        if ((n.classList && n.classList.contains('settings-view')) ||
                            (n.querySelector && n.querySelector('.dialog.settings-view'))) {
                            modifySettingsDialog(document);
                            _settingsInjected = true;
                            setTimeout(function(){ _settingsInjected = false; }, 500);
                        }
                    }
                    var cbs = window._hbxBodyObserverCallbacks;
                    for (var k = 0; k < cbs.length; k++) {
                        try { cbs[k](n); } catch(e) {}
                    }
                }
            }
        }
        _masterBodyObs.observe(document.body, { childList: true, subtree: true });
        window._hbxMasterBodyObs = _masterBodyObs;

        var settingsDialog = document.querySelector('.dialog.settings-view');
        if (settingsDialog && !document.getElementById('settings-sidebar-panel')) {
            modifySettingsDialog(document);
        }
    }

    // Nota: el ícono de Discord ya no se inyecta acá (se enganchaba mal, arriba
    // de la lista de salas). Ahora vive como botón fijo en el header (header.js).

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

