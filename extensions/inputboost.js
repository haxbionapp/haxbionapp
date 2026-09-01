(function() {
    const CONFIG = Object.freeze({
        key: 'ib_v11',
        tag: 'INPUT BOOST - TLS',
        keys: new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'ShiftLeft', 'ControlLeft', 'KeyX'])
    });

    window.InputBoost = {
        isEnabled: () => {
            try { return localStorage.getItem(CONFIG.key) !== 'false'; } catch(e) { return true; }
        },
        setEnabled: (v) => {
            setTimeout(() => {
                try { localStorage.setItem(CONFIG.key, v); } catch(e) {}
            }, 0);
        }
    };

    if (typeof Injector === 'undefined' || Injector.isMainFrame()) return;

    const IS_ENABLED = window.InputBoost.isEnabled();

    

    const applyPointerLogic = (c) => {
        if (!c || !('onpointerrawupdate' in window)) return;

        let lx = 0, ly = 0, rafPending = false;
        c.addEventListener('pointerrawupdate', (e) => {
            lx = e.clientX;
            ly = e.clientY;
            if (!rafPending) {
                rafPending = true;
                requestAnimationFrame(() => {
                    rafPending = false;
                    c.dispatchEvent(new MouseEvent('mousemove', {
                        clientX: lx, clientY: ly, bubbles: true, cancelable: false
                    }));
                });
            }
        }, { passive: true });
    };

    const applyKeyLogic = () => {
        const active = new Set();
        const sched = window.scheduler;
        document.addEventListener('keydown', (e) => {
            if (CONFIG.keys.has(e.code) && !active.has(e.code)) {
                active.add(e.code);
                if (sched) sched.postTask(() => {}, { priority: 'user-blocking' });
            }
        }, { capture: true, passive: true });
        document.addEventListener('keyup', (e) => active.delete(e.code), { capture: true, passive: true });
    };

    const applyVsyncLogic = () => {
        const mc = new MessageChannel();
        let cb = null;
        mc.port1.onmessage = () => { if (cb) { const f = cb; cb = null; f(); } };
        window.scheduleImmediate = (f) => { cb = f; mc.port2.postMessage(null); };
    };

    const injectInterface = () => {
        Injector.onView('settings-view', (el) => {
            const parent = el.querySelector('[data-hook="miscsec"]');
            if (!parent || parent.querySelector('#ib-row')) return;

            const row = document.createElement('div');
            row.id = 'ib-row';
            row.style.cssText = 'display:flex;align-items:center;margin-top:10px;padding:10px 0;border-top:1px solid #1a1a1a;contain:content;';
            row.innerHTML = `<div style="flex:1;font-weight:900;font-size:11px;color:#fff;letter-spacing:1px;pointer-events:none;">${CONFIG.tag}</div>
                           <button id="ib-tgl" class="toggle ${IS_ENABLED ? 'on' : ''}" style="width:45px;height:22px;border-radius:11px;cursor:pointer;will-change:transform;">
                                <i class="icon-${IS_ENABLED ? 'ok' : 'cancel'}"></i>
                           </button>`;

            parent.appendChild(row);
            row.querySelector('#ib-tgl').onclick = function() {
                const state = !window.InputBoost.isEnabled();
                window.InputBoost.setEnabled(state);
                this.className = `toggle ${state ? 'on' : ''}`;
                this.innerHTML = `<i class="icon-${state ? 'ok' : 'cancel'}"></i>`;
            };
        });
    };

    const bootstrap = () => {
        if (!Injector.isGameFrame()) return;
        if (IS_ENABLED) {
            applyKeyLogic();
            applyVsyncLogic();

            const style = document.createElement('style');
            style.id = 'ib-core-styles';
            
            style.textContent = 'input, button, select, textarea { scroll-behavior: auto !important; -webkit-appearance: none; outline: none !important; }';
            document.head.appendChild(style);

            let attempts = 0;
            const findCanvas = () => {
                const canvas = document.querySelector('canvas');
                if (canvas) applyPointerLogic(canvas);
                else if (attempts++ < 60) requestAnimationFrame(findCanvas);
            };
            findCanvas();
        }
        injectInterface();
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootstrap);
    else bootstrap();
})();
