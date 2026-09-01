(function() {
    if (typeof Injector === 'undefined' || Injector.isMainFrame()) return;

    const CAMERA_STORAGE_KEY = 'haxclient_camera_level';
    let cameraLevel = 3;
    let zoomSetup = false;

    function loadCameraLevel() {
        try {
            const saved = localStorage.getItem(CAMERA_STORAGE_KEY);
            if (saved !== null) {
                const parsed = parseInt(saved);
                cameraLevel = (parsed >= 0 && parsed <= 7) ? parsed : 3;
            }
        } catch (e) {
            cameraLevel = 3;
        }
    }

    function saveCameraLevel() {
        try {
            localStorage.setItem(CAMERA_STORAGE_KEY, cameraLevel.toString());
        } catch (e) {}
    }

   
    function applyZoomToGame(level) {
        const keyCode = 48 + level; // 48 es '0'
        const key = level.toString();
        
        const eventProps = {
            key: key,
            code: `Digit${key}`,
            keyCode: keyCode,
            which: keyCode,
            bubbles: true,
            cancelable: true
        };

        const keydown = new KeyboardEvent('keydown', eventProps);
        const keyup = new KeyboardEvent('keyup', eventProps);
        
        document.dispatchEvent(keydown);
        document.dispatchEvent(keyup);
    }

    function setCameraLevel(level, force = false) {
        const newLevel = Math.max(0, Math.min(7, level));
        
        if (newLevel !== cameraLevel || force) {
            cameraLevel = newLevel;
            saveCameraLevel();
            applyZoomToGame(cameraLevel);
            if (window.showToast) {
            }
        }
    }

    function setupZoomControls() {
        if (zoomSetup) return;
        zoomSetup = true;

        document.addEventListener('keydown', function(e) {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            if (e.ctrlKey && e.code !== 'KeyV') return; 

            const isPlus = (e.code === 'Equal' || e.code === 'NumpadAdd' || e.key === '+');
            const isMinus = (e.code === 'Minus' || e.code === 'NumpadSubtract' || e.key === '-');

            if (isPlus) {
                e.preventDefault();
                setCameraLevel(cameraLevel + 1); 
            } else if (isMinus) {
                e.preventDefault();
                setCameraLevel(cameraLevel - 1);
            }
            
            if (e.code.startsWith('Digit') && e.code.length === 6) {
                const num = parseInt(e.key);
                if (num >= 0 && num <= 7) {
                    cameraLevel = num;
                    saveCameraLevel();
                }
            }
        }, true);

        document.addEventListener('wheel', function(e) {
            if (e.ctrlKey) {
                e.preventDefault();
                if (e.deltaY < 0) {
                    setCameraLevel(cameraLevel + 1);
                } else {
                    setCameraLevel(cameraLevel - 1);
                }
            }
        }, { passive: false });

    }

    function init() {
        loadCameraLevel();
        setupZoomControls();
        
        setTimeout(() => setCameraLevel(cameraLevel, true), 1000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
