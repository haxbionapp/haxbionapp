(function() {
    'use strict';

    
    var _isGame = (typeof Injector !== 'undefined')
        ? (Injector.isGameFrame ? Injector.isGameFrame() : !Injector.isMainFrame())
        : (!window.__headerInjected && window.location.href.includes('haxball.com'));

    if (!_isGame) return;

    window.beep = function() {
        try {
            var snd = new Audio("data:audio/wav;base64,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");
            snd.play();
        } catch(e) {}
    };

    var autoJoinActive = false;
    var _refreshCycle   = null;
    var _joinObserver   = null;

    var ICON_PLAY = '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
    var ICON_STOP = '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>';

    function setActive(btn, active) {
        if (!btn) return;
        if (active) {
            btn.style.setProperty('background-color', '#c0392b', 'important');
            btn.style.setProperty('color', '#fff', 'important');
            btn.innerHTML = ICON_STOP;
            btn.title = 'Detener AutoJoin';
        } else {
            btn.style.setProperty('background-color', '#c9a227', 'important');
            btn.style.setProperty('color', '#000', 'important');
            btn.innerHTML = ICON_PLAY;
            btn.title = 'AutoJoin — entrar cuando haya lugar';
        }
    }

    function stopAutoJoin() {
        autoJoinActive = false;
        if (_refreshCycle)  { clearInterval(_refreshCycle);  _refreshCycle  = null; }
        if (_joinObserver)  { _joinObserver.disconnect();     _joinObserver  = null; }
        setActive(document.querySelector('[data-hook="autoJoinBtn"]'), false);
    }

    function startAutoJoin(selectedRow, refreshButton) {
        var roomName = (selectedRow.cells[0] && selectedRow.cells[0].innerText) || '';
        var playersTxt = (selectedRow.cells[1] && selectedRow.cells[1].innerText) || '';

        autoJoinActive = true;
        setActive(document.querySelector('[data-hook="autoJoinBtn"]'), true);

        _refreshCycle = setInterval(function() {
            if (!autoJoinActive) { clearInterval(_refreshCycle); _refreshCycle = null; return; }
            refreshButton.click();
        }, 600);

        _joinObserver = new MutationObserver(function() {
            if (!autoJoinActive || refreshButton.disabled) return;

            var rows = document.querySelectorAll('[data-hook="list"] tr');
            for (var i = 0; i < rows.length; i++) {
                var nameCell = rows[i].cells[0];
                if (!nameCell || nameCell.innerText !== roomName) continue;

                var playersCell = rows[i].cells[1];
                if (!playersCell) continue;
                var parts = playersCell.innerText.split('/');
                if (parts.length !== 2) continue;
                var current = parseInt(parts[0].trim());
                var max     = parseInt(parts[1].trim());
                if (!isNaN(current) && !isNaN(max) && current < max) {
                    // Hay lugar — entrar
                    stopAutoJoin();
                    rows[i].dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
                    for (var j = 0; j < 4; j++) setTimeout(beep, j * 200);
                    return;
                }
                break;
            }
        });

        _joinObserver.observe(refreshButton, { attributes: true, attributeFilter: ['disabled'] });
    }

    function onButtonClick() {
        var refreshButton = document.querySelector('[data-hook="refresh"]');
        if (!refreshButton) return;

        if (autoJoinActive) { stopAutoJoin(); return; }

        var selectedRow = document.querySelector('[data-hook="list"] tr.selected');
        if (!selectedRow) {
            if (window.showToast) window.showToast('AutoJoin: selecciona una sala primero', 'error');
            else alert('Selecciona una sala antes de activar AutoJoin.');
            return;
        }

        try {
            startAutoJoin(selectedRow, refreshButton);
        } catch(e) {
            stopAutoJoin();
        }
    }

    function injectButton() {
        if (document.querySelector('[data-hook="autoJoinBtn"]')) return;
        var sidebar = document.getElementById('sidebar-panel');
        if (!sidebar) return;
        var refreshBtn = sidebar.querySelector('button[data-hook="refresh"]');
        if (!refreshBtn) return;

        var btn = document.createElement('button');
        btn.setAttribute('data-hook', 'autoJoinBtn');
        btn.style.cssText = [
            'display:flex', 'align-items:center', 'justify-content:center',
            'width:36px', 'height:36px', 'padding:0',
            'border:none', 'border-radius:5px', 'cursor:pointer',
            'flex-shrink:0', 'transition:opacity .15s,transform .1s', 'font-size:0'
        ].join(';');
        setActive(btn, false);
        btn.onmouseenter = function() { btn.style.opacity = '0.82'; btn.style.transform = 'scale(1.06)'; };
        btn.onmouseleave = function() { btn.style.opacity = '1'; btn.style.transform = ''; };
        btn.addEventListener('click', onButtonClick);

        if (refreshBtn.nextSibling) sidebar.insertBefore(btn, refreshBtn.nextSibling);
        else sidebar.appendChild(btn);
    }

    // Coalesca todas las mutaciones de un mismo frame en una sola revision.
    // Antes corria 3 querySelector por cada mutacion de TODA la pagina
    // (subtree:true en <body>), incluso durante la partida — eso sumaba
    // trabajo constante al hilo principal sin necesidad.
    var _checkScheduled = false;
    function _scheduledCheck() {
        if (_checkScheduled) return;
        _checkScheduled = true;
        requestAnimationFrame(function() {
            _checkScheduled = false;
            var sidebar = document.getElementById('sidebar-panel');
            if (sidebar && sidebar.querySelector('button[data-hook="refresh"]')) {
                injectButton();
            }
            if (!document.querySelector('.roomlist-view') && autoJoinActive) {
                stopAutoJoin();
            }
        });
    }
    var _obs = new MutationObserver(_scheduledCheck);

    function init() {
        if (!document.body) { setTimeout(init, 200); return; }
        injectButton();
        _obs.observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();