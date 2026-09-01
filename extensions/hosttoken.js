(function () {
    if (Injector.isMainFrame()) return;

    var STORAGE_KEY = 'haxball_host_token';
    function t(key) { return window.__t ? window.__t(key) : key; }

    function injectSettingsTab(doc) {
        var settingsView = doc.querySelector('.settings-view');
        if (!settingsView || settingsView.dataset.hostTokenSetup) return;
        settingsView.dataset.hostTokenSetup = 'true';

        var tabs = settingsView.querySelector('.tabs');
        var tabContents = settingsView.querySelector('.tabcontents');
        if (!tabs || !tabContents) return;

        var tokenTabBtn = doc.createElement('button');
        tokenTabBtn.setAttribute('data-hook', 'tokenbtn');
        tokenTabBtn.textContent = 'Host Token';
        tabs.appendChild(tokenTabBtn);

        var tokenSection = doc.createElement('div');
        tokenSection.className = 'section';
        tokenSection.setAttribute('data-hook', 'tokensec');
        tabContents.appendChild(tokenSection);

        function renderTokenSection() {
            var currentToken = '';
            try { currentToken = localStorage.getItem(STORAGE_KEY) || ''; } catch(e) {}

            tokenSection.innerHTML = '<div style="padding:16px 20px;">' +
                '<div style="margin-bottom:20px;color:var(--theme-text-secondary,#888);font-size:13px;line-height:1.5;">' + t('Configure seu host token para criar salas sem captcha.') + '</div>' +
                '<div style="margin-bottom:16px;">' +
                '<label style="display:block;color:var(--theme-text-secondary,#888);font-size:12px;margin-bottom:6px;font-weight:500;">Host Token</label>' +
                '<input id="host-token-input" type="text" value="' + (currentToken || '') + '" placeholder="' + t('Cole seu host token aqui') + '" style="width:100%;padding:8px 10px;background:var(--theme-bg-secondary,#1a1a1a);border:1px solid var(--theme-border-light,#333);border-radius:4px;color:var(--theme-text-primary,#fff);font-size:13px;box-sizing:border-box;outline:none;font-family:monospace;" /></div>' +
                '<div style="display:flex;gap:10px;">' +
                '<button id="clear-token-btn" style="flex:1;padding:10px 16px;background:var(--theme-bg-tertiary,#272727);border:none;border-radius:6px;color:var(--theme-text-primary,#fff);cursor:pointer;font-size:13px;">' + t('Limpar') + '</button>' +
                '<button id="save-token-btn" style="flex:1;padding:10px 16px;background:var(--theme-bg-tertiary,#272727);border:none;border-radius:6px;color:var(--theme-text-primary,#fff);cursor:pointer;font-size:13px;font-weight:600;">' + t('Salvar') + '</button>' +
                '</div></div>';

            var tokenInput = tokenSection.querySelector('#host-token-input');
            var clearBtn   = tokenSection.querySelector('#clear-token-btn');
            var saveBtn    = tokenSection.querySelector('#save-token-btn');

            clearBtn.onclick = function() {
                tokenInput.value = '';
                try { localStorage.removeItem(STORAGE_KEY); } catch(e) {}
            };
            saveBtn.onclick = function() {
                var token = tokenInput.value.trim();
                try {
                    if (token) localStorage.setItem(STORAGE_KEY, token);
                    else localStorage.removeItem(STORAGE_KEY);
                    tokenInput.style.borderColor = '#4ade80';
                    setTimeout(function() { tokenInput.style.borderColor = ''; }, 1000);
                } catch(e) {}
            };
            tokenInput.onkeydown = function(e) { if (e.key === 'Enter') saveBtn.click(); };
        }

        tokenTabBtn.onclick = function() {
            tabs.querySelectorAll('button').forEach(function(b) { b.classList.remove('selected'); });
            tokenTabBtn.classList.add('selected');
            tabContents.querySelectorAll('.section').forEach(function(s) { s.classList.remove('selected'); });
            tokenSection.classList.add('selected');
            renderTokenSection();
        };

        tabs.querySelectorAll('button:not([data-hook="tokenbtn"])').forEach(function(btn) {
            btn.addEventListener('click', function() {
                tokenTabBtn.classList.remove('selected');
                tokenSection.classList.remove('selected');
            }, true);
        });
    }

    // Observer en vez de setInterval — solo reacciona cuando aparece settings-view
    var _injected = false;
    new MutationObserver(function(mutations) {
        for (var i = 0; i < mutations.length; i++) {
            var nodes = mutations[i].addedNodes;
            for (var j = 0; j < nodes.length; j++) {
                var node = nodes[j];
                if (node.nodeType === 1 && node.classList && node.classList.contains('settings-view')) {
                    injectSettingsTab(document);
                    return;
                }
            }
        }
        // fallback por si ya existe
        if (!_injected) {
            var sv = document.querySelector('.settings-view');
            if (sv && !sv.dataset.hostTokenSetup) {
                injectSettingsTab(document);
                _injected = true;
            }
        }
    }).observe(document.body || document.documentElement, { childList: true, subtree: false });

    // Check inicial por si ya está abierto
    var sv = document.querySelector('.settings-view');
    if (sv) injectSettingsTab(document);
})();
