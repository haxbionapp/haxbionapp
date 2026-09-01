(function() {
    'use strict';

    const CONFIG = {
        allowedHost: 'haxball.com/play',
        allowedParam: '?c=',
        cssId: 'security-pro-css'
    };

    window.addEventListener('keydown', function(e) {
        if (e.key === 'F1') {
            e.preventDefault();
            e.stopImmediatePropagation();
        }
    }, true);

    Object.defineProperty(window, 'onbeforeunload', {
        get: () => null,
        set: () => {},
        configurable: false
    });
    
    window.addEventListener('beforeunload', function(e) {
        delete e.returnValue;
    });

    document.addEventListener('click', function(e) {
        // No tocar clicks adentro del dialogo "Only humans" (recaptcha):
        // interceptar/objetar ese click podria interferir con la
        // verificacion real de Google.
        var dlg = e.target.closest && e.target.closest('.simple-dialog-view');
        if (dlg && /recaptcha/i.test(dlg.innerHTML)) return;
        const link = e.target.closest('a');
        if (!link || !link.href) return;
        const href = link.href;
        if (href.includes(CONFIG.allowedHost) && href.includes(CONFIG.allowedParam)) return;
        const isWebProtocol = href.startsWith('http');
        const isInternal    = href.startsWith('#') || href.startsWith('javascript:');
        if (isWebProtocol && !isInternal) {
            e.preventDefault();
            e.stopPropagation();
            window.open(href, '_blank', 'noopener,noreferrer');
        }
    }, true);

    if (window.Injector) {
        Injector.injectCSS(CONFIG.cssId, `
            html, body {
                overflow: hidden !important;
                touch-action: none;
            }
            ::-webkit-scrollbar { display: none !important; }
            body {
                user-select: none !important;
                -webkit-user-select: none !important;
                -webkit-drag: none;
            }
            .chatbox-view, .log, .log-contents,
            input, textarea, [contenteditable="true"] {
                user-select: text !important;
                -webkit-user-select: text !important;
            }
            /* BUG REAL (arreglado): touch-action:none en toda la pagina
               interfiere con el toque real sobre el checkbox del recaptcha
               (vive en un iframe de Google adentro del dialogo "Only
               humans"), asi que en pantallas tactiles no respondia al
               tocarlo. Se restaura el comportamiento normal solo para ese
               dialogo. */
            .simple-dialog-view:has(iframe[title="reCAPTCHA"]),
            .simple-dialog-view:has(iframe[title="reCAPTCHA"]) * {
                touch-action: auto !important;
                pointer-events: auto !important;
            }
        `);

        if (Injector.isMainFrame()) {
            try {
                const left = Math.max(0, Math.round((screen.availWidth  - window.outerWidth)  / 2));
                const top  = Math.max(0, Math.round((screen.availHeight - window.outerHeight) / 2));
                window.moveTo(left, top);
            } catch(_) {}
        }
    }
})();
