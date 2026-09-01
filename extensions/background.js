(function() {
    if (Injector.isMainFrame()) return;
    Injector.injectCSS('custom-bg',
        'html:not(:has(.game-state-view)), body:not(:has(.game-state-view)) { background: var(--theme-bg-primary, #141414) !important; }' +
        'html:has(.game-state-view), body:has(.game-state-view) { background: transparent !important; }'
    );
})();