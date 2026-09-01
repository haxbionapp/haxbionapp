(function() {
    if (typeof Injector !== 'undefined' && !Injector.isGameFrame()) return;

    function setupLeaveObserver() {
        if (!document.body) {
            setTimeout(setupLeaveObserver, 100);
            return;
        }

        const observer = new MutationObserver((mutations) => {
            for (let i = 0; i < mutations.length; i++) {
                const added = mutations[i].addedNodes;
                for (let j = 0; j < added.length; j++) {
                    const node = added[j];
                    if (node.nodeType === 1 && node.classList && node.classList.contains('leave-room-view')) {
                        const leaveBtn = node.querySelector('[data-hook="leave"]');
                        if (leaveBtn) {
                            leaveBtn.click();
                        }
                    }
                }
            }
        });

        // OJO: subtree tiene que quedar en true. Se probo subtree:false
        // asumiendo que leave-room-view se monta como hijo directo de
        // <body>, pero el mismo supuesto rompio del todo las pestañas de
        // avatar/fondo de cancha/marcador en otros archivos — mejor no
        // arriesgarse aca tampoco sin poder probarlo en vivo.
        observer.observe(document.body, { childList: true, subtree: true });
    }

    setupLeaveObserver();
})();