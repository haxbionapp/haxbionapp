const Injector = {
    waitForHead: function() {
        return new Promise((resolve) => {
            if (document.head) return resolve(document.head);
            const observer = new MutationObserver((_, obs) => {
                if (document.head) {
                    obs.disconnect();
                    resolve(document.head);
                }
            });
            observer.observe(document.documentElement || document, { childList: true, subtree: true });
        });
    },

    waitForElement: function(selector, timeout = 10000) {
        return new Promise((resolve, reject) => {
            const el = document.querySelector(selector);
            if (el) return resolve(el);

            const observer = new MutationObserver((_, obs) => {
                const found = document.querySelector(selector);
                if (found) {
                    obs.disconnect();
                    clearTimeout(timer);
                    resolve(found);
                }
            });

            const timer = setTimeout(() => {
                observer.disconnect();
                reject(new Error('Timeout buscando: ' + selector));
            }, timeout);

            observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
        });
    },

    injectCSS: function(id, css) {
        if (document.getElementById(id)) return Promise.resolve();
        return this.waitForHead().then((head) => {
            if (document.getElementById(id)) return;
            const style = document.createElement('style');
            style.id = id;
            style.textContent = css;
            head.appendChild(style);
        });
    },

    
    isMainFrame: () => window.self === window.top,
    
    isGameFrame: function() {
        const loc = window.location.href;
        return !this.isMainFrame() && (loc.includes('game.html') || loc.includes('haxball.com'));
    },

    _viewListeners: {},
    _lastView: null,
    
    onView: function(viewClass, callback) {
        if (!this._viewListeners[viewClass]) this._viewListeners[viewClass] = [];
        this._viewListeners[viewClass].push(callback);
    },

    onViewLeave: function(viewClass, callback) {
        const key = `_leave_${viewClass}`;
        if (!this._viewListeners[key]) this._viewListeners[key] = [];
        this._viewListeners[key].push(callback);
    },

    _initViewObserver: function() {
        this.waitForElement("div[class$='view']").then((el) => {
            const currentViewContainer = el.parentNode;
            
            const observer = new MutationObserver((mutations) => {
                const addedNodes = mutations.flatMap(m => Array.from(m.addedNodes))
                                            .filter(n => n.nodeType === 1 && n.className && typeof n.className === 'string');

                addedNodes.forEach(node => {
                    const viewClass = node.className;
                    if (viewClass.includes('chat-row')) return; 

                    if (this._lastView && this._lastView !== viewClass) {
                        Object.keys(this._viewListeners).forEach(key => {
                            if (key.startsWith('_leave_')) {
                                const target = key.replace('_leave_', '');
                                if (this._lastView.includes(target)) {
                                    this._viewListeners[key].forEach(cb => { try { cb(); } catch(e){} });
                                }
                            }
                        });
                    }
                    
                    this._lastView = viewClass;
                    
                    Object.keys(this._viewListeners).forEach(key => {
                        if (!key.startsWith('_leave_') && viewClass.includes(key)) {
                            this._viewListeners[key].forEach(cb => { try { cb(node, viewClass); } catch(e){} });
                        }
                    });
                });
            });
            
            observer.observe(currentViewContainer, { childList: true });
        }).catch(() => {});
    }
};

window.Injector = Injector;

(function() {
    let toastContainer = null;
    
    const getContainer = () => {
        if (toastContainer && document.body.contains(toastContainer)) return toastContainer;
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = 'position:fixed;top:20px;right:20px;z-index:1000000;display:flex;flex-direction:column;gap:8px;pointer-events:none;';
        document.body.appendChild(toastContainer);
        return toastContainer;
    };
    
    window.showToast = function(message, type = 'info', duration = 4000) {
        const container = getContainer();
        const toast = document.createElement('div');
        
        const colors = {
            error: '#dc2626',
            success: '#22c55e',
            info: '#3b82f6',
            default: '#1f2937'
        };

        toast.style.cssText = `
            background: ${colors[type] || colors.default};
            color: #fff;
            padding: 10px 18px;
            border-radius: 6px;
            font-size: 13px;
            font-family: sans-serif;
            max-width: 300px;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.4);
            pointer-events: auto;
            opacity: 0;
            transform: translateX(50px);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        `;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        });
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(50px)';
            setTimeout(() => toast.remove(), 400);
        }, duration);
    };
    
    window.alert = (msg) => window.showToast(msg, 'info', 5000);
})();

if (Injector.isGameFrame()) {
    Injector._initViewObserver();

    document.addEventListener('keydown', (e) => {
        if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

        if (e.key === "'") {
            e.preventDefault();
            window.parent.postMessage({ type: 'toggleHeader' }, '*');
        }

        
        
        if (e.key === 'F8' || e.keyCode === 119) {
            e.preventDefault();
            e.stopImmediatePropagation();
            if (typeof window._hbxMenuToggle === 'function') {
                window._hbxMenuToggle();
            }
        }
    }, true);
}

if (Injector.isMainFrame()) {
    window.addEventListener('message', (event) => {
        if (event.data?.type === 'haxball-save-replay') {
            try {
                const byteChars = atob(event.data.data);
                const byteNumbers = new Array(byteChars.length);
                for (let i = 0; i < byteChars.length; i++) {
                    byteNumbers[i] = byteChars.charCodeAt(i);
                }
                const blob = new Blob([new Uint8Array(byteNumbers)], { type: 'application/octet-stream' });
                const filename = event.data.filename || 'replay.hbr2';
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                setTimeout(() => { link.remove(); URL.revokeObjectURL(url); }, 200);
                window.showToast('Replay guardado: ' + filename, 'success');
            } catch (err) {
                window.showToast('Error al procesar el replay', 'error');
            }
        }
    });
}