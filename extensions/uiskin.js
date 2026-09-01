/**
 * uiskin.js - HaxBion Modern UI Skin & Tweaks Hub
 * Adapta toda la interfaz a diseño moderno (Fotos 1, 2 y 3)
 * Agrupa Cancha, Pelota, Avatar/Jugador, Marcador, Indicador de teclas y Sonidos dentro de Tweaks (sin replays).
 */
(function () {
    if (typeof Injector !== 'undefined' && Injector.isMainFrame()) return;

    // ─────────────────────────────────────────────────────────────────────────────
    // 1. ESTILOS GLOBALES (CSS) - DISEÑO MODERNO (Fotos 1, 2 y 3)
    // ─────────────────────────────────────────────────────────────────────────────
    var SKIN_CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

    :root {
        --hbx-bg: #f8f9fa;
        --hbx-card-bg: #ffffff;
        --hbx-border: #eaecf0;
        --hbx-border-hover: #d0d5dd;
        --hbx-text-main: #101828;
        --hbx-text-muted: #667085;
        --hbx-text-light: #98a2b3;
        --hbx-primary: #2563eb;
        --hbx-primary-hover: #1d4ed8;
        --hbx-primary-light: #eff6ff;
        --hbx-radius: 12px;
        --hbx-shadow-sm: 0 1px 2px rgba(16, 24, 40, 0.05);
        --hbx-shadow-md: 0 4px 12px rgba(16, 24, 40, 0.08);
    }

    /* ═══════════════════════════════════════════════════════════════
       Remapeo del tema, acotado a los dos dialogos que rediseñamos.
       El styles.js del juego pinta .dialog button / select / range con
       var(--theme-*) del tema OSCURO y con !important, asi que le gana
       a cualquier clase nuestra. En vez de pelear regla por regla, se
       redefinen esas variables a valores CLAROS solo aca adentro: todo
       lo que las usa (botones de subpanel, "Volver", sliders...) se
       aclara solo. El F2, el marcador en pantalla y el juego quedan con
       su tema de siempre.
       ═══════════════════════════════════════════════════════════════ */
    .dialog.settings-view, .roomlist-view .dialog {
        --theme-bg-primary: #ffffff;
        --theme-bg-secondary: #ffffff;
        --theme-bg-tertiary: #f5f6f8;
        --theme-bg-hover: #eef1f5;
        --theme-bg-selected: #eef4ff;
        --theme-border: #eaecf0;
        --theme-border-light: #e2e4e8;
        --theme-text-primary: #101828;
        --theme-text-secondary: #667085;
        --theme-text-muted: #98a2b3;
    }

    /* Botones nativos dentro de los subpaneles (Abrir presets, Clásico
       HaxBion, Arial Black, etc.): tarjeta clara con borde, no negro. */
    .dialog.settings-view .hbx-settings-content button:not(.hbx-nav-btn):not(.hbx-subpanel-back):not(.hbx-discord-btn) {
        background: #ffffff !important;
        border: 1px solid var(--hbx-border) !important;
        color: var(--hbx-text-main) !important;
        border-radius: 9px !important;
        padding: 9px 16px !important;
        font-weight: 600 !important;
        font-size: 13px !important;
    }
    .dialog.settings-view .hbx-settings-content button:not(.hbx-nav-btn):not(.hbx-subpanel-back):not(.hbx-discord-btn):hover {
        background: var(--hbx-primary-light) !important;
        border-color: #bcd2fb !important;
        color: var(--hbx-primary) !important;
    }
    /* Botones "primarios" (azules) siguen azules */
    .dialog.settings-view .hbx-settings-content button.hbx-btn-primary,
    .dialog.settings-view .hbx-settings-content button[data-primary] {
        background: var(--hbx-primary) !important;
        border-color: var(--hbx-primary) !important;
        color: #ffffff !important;
    }

    /* Barra "← Volver a Tweaks": link suave, no barra negra a lo ancho */
    .dialog.settings-view .hbx-subpanel-back {
        display: inline-flex !important;
        width: auto !important;
        background: transparent !important;
        border: none !important;
        color: var(--hbx-primary) !important;
        font-size: 14px !important;
        font-weight: 600 !important;
        padding: 0 !important;
        margin-bottom: 18px !important;
    }
    .dialog.settings-view .hbx-subpanel-back:hover {
        background: transparent !important;
        text-decoration: underline !important;
    }

    /* Selects e inputs de los subpaneles */
    .dialog.settings-view .hbx-settings-content select {
        background: #ffffff !important;
        border: 1px solid var(--hbx-border) !important;
        color: var(--hbx-text-main) !important;
        border-radius: 9px !important;
    }
    .dialog.settings-view .hbx-settings-content input[type="range"] {
        background: #e7e9ee !important;
    }
    .dialog.settings-view .hbx-settings-content input[type="range"]::-webkit-slider-thumb {
        background: var(--hbx-primary) !important;
        border: 2px solid #ffffff !important;
    }
    .dialog.settings-view .hbx-settings-content input[type="range"]::-moz-range-thumb {
        background: var(--hbx-primary) !important;
        border: 2px solid #ffffff !important;
    }
    .dialog.settings-view .hbx-settings-content input[type="range"]::-webkit-slider-runnable-track {
        background: #e7e9ee !important;
    }

    /* Hide old banners and layouts */
    #hbx-discord-banner { display: none !important; }
    
    /* Fondo principal de la ventana y diálogos */
    body, html {
        background-color: var(--hbx-bg) !important;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
        color: var(--hbx-text-main) !important;
    }

    /* Dialogo base */
    .dialog {
        background: var(--hbx-card-bg) !important;
        border: 1px solid var(--hbx-border) !important;
        border-radius: 16px !important;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0,0,0,0.05) !important;
        color: var(--hbx-text-main) !important;
        box-sizing: border-box !important;
        /* Restore explicit centering for original Haxball wrapper */
        position: absolute !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        margin: 0 !important;
    }

    /* ─────────────────────────────────────────────────────────────────────────────
       LISTA DE SALAS (Foto 2)
       ───────────────────────────────────────────────────────────────────────────── */
    .roomlist-view .dialog {
        width: 860px !important;
        max-width: calc(100vw - 160px) !important;
        height: 620px !important;
        max-height: 92vh !important;
        padding: 28px 32px !important;
        display: flex !important;
        flex-direction: column !important;
        position: absolute !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        margin: 0 !important;
        overflow: visible !important;
    }

    /* Ocultar elementos viejos / redundantes */
    .roomlist-view .dialog > h1,
    .roomlist-view .dialog > p:not([data-hook]) {
        display: none !important;
    }

    /* Header superior personalizado */
    .hbx-roomlist-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
        flex-shrink: 0;
    }

    .hbx-roomlist-title {
        font-size: 24px;
        font-weight: 700;
        color: var(--hbx-text-main);
        letter-spacing: -0.5px;
        margin: 0;
    }

    .hbx-roomlist-stats {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        font-weight: 500;
        color: var(--hbx-text-muted);
    }

    /* Banner Discord */
    .hbx-discord-card {
        background: #ffffff;
        border: 1px solid var(--hbx-border);
        border-radius: var(--hbx-radius);
        padding: 12px 18px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 14px;
        box-shadow: var(--hbx-shadow-sm);
        flex-shrink: 0;
    }

    .hbx-discord-info {
        display: flex;
        align-items: center;
        gap: 12px;
        color: var(--hbx-text-main);
        font-size: 13.5px;
        font-weight: 500;
    }

    .hbx-discord-btn {
        background: #5865F2 !important;
        color: #ffffff !important;
        border: none !important;
        border-radius: 8px !important;
        padding: 8px 18px !important;
        font-size: 12px !important;
        font-weight: 700 !important;
        letter-spacing: 0.5px !important;
        cursor: pointer !important;
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
        transition: background 0.15s ease !important;
    }

    .hbx-discord-btn:hover {
        background: #4752C4 !important;
    }

    /* Buscador y filtro */
    #room-search {
        padding: 0 0 14px 0 !important;
        display: flex !important;
        gap: 10px !important;
        align-items: center !important;
        flex-shrink: 0 !important;
    }

    .hbx-search-wrapper {
        position: relative;
        flex: 1;
        display: flex;
        align-items: center;
    }

    .hbx-search-icon {
        position: absolute;
        left: 14px;
        pointer-events: none;
        color: var(--hbx-text-light);
    }

    #room-search-input {
        width: 100% !important;
        background: #ffffff !important;
        border: 1px solid var(--hbx-border) !important;
        border-radius: var(--hbx-radius) !important;
        padding: 10px 14px 10px 40px !important;
        color: var(--hbx-text-main) !important;
        font-size: 13.5px !important;
        font-family: inherit !important;
        outline: none !important;
        box-shadow: var(--hbx-shadow-sm) !important;
        transition: border-color 0.15s, box-shadow 0.15s !important;
        box-sizing: border-box !important;
    }

    #room-search-input:focus {
        border-color: #93c5fd !important;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1) !important;
    }

    #room-search-input::placeholder {
        color: var(--hbx-text-light) !important;
    }

    #country-filter-btn {
        background: #ffffff !important;
        border: 1px solid var(--hbx-border) !important;
        border-radius: var(--hbx-radius) !important;
        width: 42px !important;
        height: 42px !important;
        padding: 0 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        color: var(--hbx-text-muted) !important;
        cursor: pointer !important;
        box-shadow: var(--hbx-shadow-sm) !important;
        transition: all 0.15s !important;
    }

    #country-filter-btn:hover {
        border-color: var(--hbx-border-hover) !important;
        color: var(--hbx-text-main) !important;
        background: #f9fafb !important;
    }

    /* Tabla de salas */
    .roomlist-view .dialog .content {
        flex: 1 1 auto !important;
        overflow-y: auto !important;
        min-height: 0 !important;
        border: 1px solid var(--hbx-border) !important;
        border-radius: var(--hbx-radius) !important;
        background: #ffffff !important;
    }

    .roomlist-view .dialog table.header {
        display: table !important;
        width: 100% !important;
        border-collapse: collapse !important;
        background: #ffffff !important;
        border-bottom: 1px solid var(--hbx-border) !important;
        position: sticky !important;
        top: 0 !important;
        z-index: 5 !important;
    }

    .roomlist-view .dialog table.header th {
        color: var(--hbx-text-muted) !important;
        font-size: 11px !important;
        font-weight: 700 !important;
        letter-spacing: 0.8px !important;
        text-transform: uppercase !important;
        padding: 12px 16px !important;
        border: none !important;
    }

    .roomlist-view .dialog table.header th[data-hook="name"] { text-align: left !important; }
    .roomlist-view .dialog table.header th[data-hook="players"] { text-align: right !important; }
    .roomlist-view .dialog table.header th[data-hook="pass"],
    .roomlist-view .dialog table.header th[data-hook="dist"] { display: none !important; }

    .roomlist-view .dialog .content table {
        width: 100% !important;
        border-collapse: collapse !important;
    }

    .roomlist-view .dialog .content tr {
        border-bottom: 1px solid #f2f4f7 !important;
        cursor: pointer !important;
        transition: background 0.12s ease !important;
        height: 46px !important;
    }

    .roomlist-view .dialog .content tr:last-child {
        border-bottom: none !important;
    }

    .roomlist-view .dialog .content tr:hover {
        background: #f9fafb !important;
    }

    .roomlist-view .dialog .content tr.selected {
        background: #eff6ff !important;
    }

    .roomlist-view .dialog .content td {
        padding: 8px 16px !important;
        font-size: 13.5px !important;
        color: var(--hbx-text-main) !important;
        border: none !important;
    }

    .roomlist-view .dialog .content td[data-hook="name"] {
        font-weight: 500 !important;
        text-align: left !important;
    }

    .roomlist-view .dialog .content td[data-hook="flag"] {
        width: 32px !important;
        padding-right: 0 !important;
    }

    .roomlist-view .dialog .content td[data-hook="players"] {
        text-align: right !important;
        font-weight: 600 !important;
        color: var(--hbx-text-muted) !important;
        font-size: 13px !important;
        white-space: nowrap !important;
    }

    .roomlist-view .dialog .content td[data-hook="pass"],
    .roomlist-view .dialog .content td[data-hook="dist"] {
        display: none !important;
    }

    /* Barra lateral de acciones de salas (derecha - Foto 2) */
    #sidebar-panel {
        position: absolute !important;
        right: -66px !important;
        top: 20px !important;
        bottom: 20px !important;
        width: 48px !important;
        background: transparent !important;
        border: none !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        gap: 8px !important;
        padding: 0 !important;
        box-sizing: border-box !important;
        z-index: 10 !important;
    }

    #sidebar-panel button,
    #sidebar-panel label {
        width: 42px !important;
        height: 42px !important;
        border-radius: var(--hbx-radius) !important;
        background: #ffffff !important;
        border: 1px solid var(--hbx-border) !important;
        color: var(--hbx-text-muted) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        cursor: pointer !important;
        box-shadow: var(--hbx-shadow-sm) !important;
        transition: all 0.15s !important;
        padding: 0 !important;
        margin: 0 !important;
    }

    #sidebar-panel button:hover,
    #sidebar-panel label:hover {
        border-color: var(--hbx-border-hover) !important;
        color: var(--hbx-text-main) !important;
        background: #f9fafb !important;
        transform: translateY(-1px) !important;
    }

    /* Botón Play Azul Primario */
    #sidebar-panel button[data-hook="join"],
    #sidebar-panel .hbx-primary-play-btn {
        background: var(--hbx-primary) !important;
        border-color: var(--hbx-primary) !important;
        color: #ffffff !important;
    }

    #sidebar-panel button[data-hook="join"]:hover,
    #sidebar-panel .hbx-primary-play-btn:hover {
        background: var(--hbx-primary-hover) !important;
        border-color: var(--hbx-primary-hover) !important;
        color: #ffffff !important;
    }

    /* ─────────────────────────────────────────────────────────────────────────────
       VENTANA DE CONFIGURACIÓN Y TWEAKS (Fotos 1 y 3)
       ───────────────────────────────────────────────────────────────────────────── */
    .dialog.settings-view {
        width: min(1440px, calc(100vw - 60px)) !important;
        max-width: none !important;
        height: min(940px, calc(100vh - 56px)) !important;
        max-height: none !important;
        padding: 0 !important;
        display: flex !important;
        flex-direction: row !important;
        position: absolute !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        margin: 0 !important;
        border-radius: 18px !important;
        overflow: visible !important;
    }
    
    /* Hide the old settings panel content so it doesn't bleed through the middle */
    .dialog.settings-view > *:not(.hbx-settings-nav):not(.hbx-settings-content) {
        display: none !important;
    }

    /* Ocultar pestañas viejas horizontales y botón viejo */
    

    /* Panel lateral de navegación integrado (Foto 1) */
    .hbx-settings-nav {
        width: 266px !important;
        background: #ffffff !important;
        border-right: 1px solid var(--hbx-border) !important;
        display: flex !important;
        flex-direction: column !important;
        padding: 26px 18px 18px !important;
        box-sizing: border-box !important;
        flex-shrink: 0 !important;
    }

    .hbx-nav-list {
        display: flex;
        flex-direction: column;
        gap: 4px;
        flex: 1;
        overflow-y: auto;
    }

    /* Se esconde por clase y no por style inline: la regla de abajo
       lleva !important y le ganaria al inline. */
    .hbx-nav-btn.hbx-nav-oculto { display: none !important; }
    .hbx-nav-btn {
        display: flex !important;
        align-items: center !important;
        gap: 14px !important;
        height: 52px !important;
        padding: 0 16px !important;
        border-radius: 9px !important;
        border: none !important;
        background: transparent !important;
        color: #475467 !important;
        font-size: 15px !important;
        font-weight: 500 !important;
        cursor: pointer !important;
        text-align: left !important;
        width: 100% !important;
        box-sizing: border-box !important;
        transition: all 0.12s ease !important;
    }

    .hbx-nav-btn:hover {
        background: #f9fafb !important;
        color: var(--hbx-text-main) !important;
    }

    .hbx-nav-btn.active {
        background: #eff6ff !important;
        color: #2563eb !important;
        font-weight: 600 !important;
        box-shadow: inset 3px 0 0 #2563eb !important;
    }

    .hbx-nav-btn svg {
        flex-shrink: 0;
    }

    .hbx-nav-close {
        margin-top: auto;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 11px !important;
        height: 54px !important;
        padding: 0 10px !important;
        border-radius: 11px !important;
        border: 1px solid var(--hbx-border) !important;
        background: #ffffff !important;
        color: #344054 !important;
        font-size: 15px !important;
        font-weight: 600 !important;
        cursor: pointer !important;
        transition: all 0.15s !important;
    }

    .hbx-nav-close:hover {
        background: #f9fafb !important;
        border-color: #d0d5dd !important;
        color: #dc2626 !important;
    }

    /* Área de contenido de la configuración */
    .hbx-settings-content {
        flex: 1 1 auto !important;
        padding: 34px 44px 40px !important;
        overflow-y: auto !important;
        display: flex !important;
        flex-direction: column !important;
        background: #ffffff !important;
    }

    .hbx-settings-title {
        font-size: 34px;
        font-weight: 700;
        color: var(--hbx-text-main);
        letter-spacing: -0.6px;
        margin: 0 0 22px 0;
        padding-bottom: 20px;
        border-bottom: 1px solid var(--hbx-border);
    }
    /* En los subpaneles el titulo va mas chico y sin la linea */
    .hbx-subpanel-back + .hbx-settings-title {
        font-size: 26px;
        padding-bottom: 0;
        border-bottom: none;
        margin-bottom: 16px;
    }
    .hbx-settings-sub {
        font-size: 15px;
        color: var(--hbx-text-muted);
        margin: -10px 0 22px 0;
    }

    .hbx-settings-subtitle {
        font-size: 13px;
        color: var(--hbx-text-muted);
        margin: 0 0 20px 0;
    }

    /* Tarjetas de opciones (Foto 1) */
    .hbx-option-card {
        background: #ffffff;
        border: 1px solid var(--hbx-border);
        border-radius: 12px;
        padding: 20px 24px;
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        gap: 18px;
        cursor: pointer;
        transition: all 0.12s ease;
        box-shadow: var(--hbx-shadow-sm);
        user-select: none;
    }

    .hbx-option-card:hover {
        border-color: var(--hbx-border-hover);
        background: #fcfcfd;
    }

    .hbx-checkbox {
        width: 24px;
        height: 24px;
        border-radius: 6px;
        border: 1.5px solid #d0d5dd;
        background: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: all 0.12s ease;
    }

    .hbx-checkbox.checked {
        background: var(--hbx-primary);
        border-color: var(--hbx-primary);
        color: #ffffff;
    }

    .hbx-option-body {
        flex: 1;
        min-width: 0;
    }

    .hbx-option-name {
        font-size: 16px;
        font-weight: 600;
        color: var(--hbx-text-main);
        margin-bottom: 2px;
    }

    .hbx-option-desc {
        font-size: 14px;
        color: var(--hbx-text-muted);
    }

    .hbx-card-chevron {
        color: var(--hbx-text-light);
        flex-shrink: 0;
    }

    /* ─────────────────────────────────────────────────────────────────────────────
       Pestaña TWEAKS (Foto 3)
       ───────────────────────────────────────────────────────────────────────────── */
    .hbx-tweak-category-card {
        background: #ffffff;
        border: 1px solid var(--hbx-border);
        border-radius: var(--hbx-radius);
        padding: 16px 20px;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 16px;
        cursor: pointer;
        transition: all 0.15s ease;
        box-shadow: var(--hbx-shadow-sm);
    }

    .hbx-tweak-category-card:hover {
        border-color: var(--hbx-border-hover);
        box-shadow: var(--hbx-shadow-md);
        transform: translateY(-1px);
    }

    .hbx-category-icon-box {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .hbx-icon-green { background: #dcfce7; color: #16a34a; }
    .hbx-icon-purple { background: #f3e8ff; color: #9333ea; }
    .hbx-icon-orange { background: #fef3c7; color: #d97706; }
    .hbx-icon-blue { background: #dbeafe; color: #2563eb; }
    .hbx-icon-pink { background: #fce7f3; color: #db2777; }
    .hbx-icon-red { background: #fee2e2; color: #dc2626; }

    .hbx-subpanel-back {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: none;
        border: none;
        color: var(--hbx-primary);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        padding: 0;
        margin-bottom: 16px;
    }

    .hbx-subpanel-back:hover {
        text-decoration: underline;
    }

    /* Scrollbars elegantes */
    ::-webkit-scrollbar {
        width: 6px;
        height: 6px;
    }
    ::-webkit-scrollbar-track {
        background: transparent;
    }
    ::-webkit-scrollbar-thumb {
        background: #d0d5dd;
        border-radius: 999px;
    }
    ::-webkit-scrollbar-thumb:hover {
        background: #98a2b3;
    }

    /* ───────── selector de canchas y pelotas ───────── */
    .hbx-pick-clear {
        width: 100%;
        margin: 0 0 16px;
        padding: 11px;
        border-radius: 10px;
        border: 1px solid #fecaca;
        background: #fef2f2;
        color: #dc2626;
        font-weight: 600;
        font-size: 13.5px;
        cursor: pointer;
    }
    .hbx-pick-clear:hover { background: #fee2e2; }

    .hbx-pick-grid { display: grid; gap: 14px; padding-bottom: 24px; }
    .hbx-pick-grid.canchas { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
    .hbx-pick-grid.pelotas { grid-template-columns: repeat(auto-fill, minmax(92px, 1fr)); }

    .hbx-pick-item {
        border: 1px solid var(--hbx-border, #e7e9ee);
        border-radius: 12px;
        overflow: hidden;
        background: #fff;
        cursor: pointer;
        transition: border-color .12s, box-shadow .12s, transform .12s;
    }
    .hbx-pick-item:hover {
        border-color: #93b4f7;
        box-shadow: 0 4px 14px rgba(16,24,40,.10);
        transform: translateY(-1px);
    }
    .hbx-pick-item.sel {
        border-color: #2563eb;
        box-shadow: 0 0 0 2px rgba(37,99,235,.18);
    }
    .hbx-pick-item img { display: block; width: 100%; background: #f5f6f8; }
    .hbx-pick-grid.canchas .hbx-pick-item img { height: 116px; object-fit: cover; }
    .hbx-pick-grid.pelotas .hbx-pick-item img {
        height: 72px; object-fit: contain; padding: 10px; box-sizing: border-box;
    }
    .hbx-pick-item.rota img { min-height: 56px; }
    .hbx-pick-cap {
        padding: 9px 8px;
        font-size: 12.5px;
        font-weight: 600;
        text-align: center;
        color: #101828;
        border-top: 1px solid #f0f1f4;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .hbx-pick-empty {
        padding: 26px; text-align: center; color: #667085; font-size: 13.5px;
        border: 1px dashed var(--hbx-border, #e7e9ee); border-radius: 12px;
    }

    .hbx-cat-card {
        display: flex; align-items: center; gap: 14px;
        border: 1px solid var(--hbx-border, #e7e9ee);
        border-radius: 12px; background: #fff;
        padding: 12px 16px; margin-bottom: 12px; cursor: pointer;
        transition: border-color .12s, box-shadow .12s;
    }
    .hbx-cat-card:hover { border-color: #93b4f7; box-shadow: 0 4px 14px rgba(16,24,40,.08); }
    .hbx-cat-thumbs { display: flex; flex-shrink: 0; }
    .hbx-cat-thumbs img {
        width: 38px; height: 38px; object-fit: contain;
        border-radius: 50%; background: #f5f6f8;
        border: 2px solid #fff; margin-left: -12px;
    }
    .hbx-cat-thumbs img:first-child { margin-left: 0; }
    .hbx-cat-txt { flex: 1; min-width: 0; }

    .hbx-chips { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 16px; }
    .hbx-chip {
        padding: 7px 14px; border-radius: 999px;
        border: 1px solid var(--hbx-border, #e7e9ee);
        background: #fff; color: #475467;
        font-size: 13px; font-weight: 600; cursor: pointer;
    }
    .hbx-chip:hover { background: #f7f8fa; }
    .hbx-chip.on { background: #eef4ff; border-color: #2563eb; color: #2563eb; }
    
    /* ═════════ Lista de salas: ajustes al diseño de la foto ═════════ */
    /* El juego mete un <span class="bool">true</span> adentro del nombre
       de cada sala; sin esto queda pegado al final del texto. */
    .roomlist-view span.bool { display: none !important; }

    /* El dialogo ocupa casi toda la ventana y deja lugar a la derecha
       para la columna de iconos. */
    .roomlist-view .dialog {
        width: min(1400px, calc(100vw - 150px)) !important;
        max-width: none !important;
        height: min(960px, calc(100vh - 48px)) !important;
        max-height: none !important;
        padding: 30px 34px !important;
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        left: 46px !important;
        right: auto !important;
        top: 0 !important;
        transform: none !important;
        display: flex !important;
        flex-direction: column !important;
        box-sizing: border-box !important;
        overflow: visible !important;
    }
    /* Restos del dialogo nativo que la capa reemplaza */
    .roomlist-view .dialog > p[data-hook="numplayers"],
    .roomlist-view .dialog > .search,
    .roomlist-view .dialog > .buttons,
    .roomlist-view .dialog > button[data-hook="ok"] { display: none !important; }

    .hbx-roomlist-title { font-size: 30px !important; }
    .hbx-roomlist-stats { font-size: 14.5px !important; }
    .hbx-discord-card { padding: 16px 18px !important; border-radius: 12px !important; }
    .hbx-discord-info { font-size: 14.5px !important; }
    .hbx-discord-btn { padding: 12px 20px !important; border-radius: 9px !important; }
    #room-search-input { height: 56px !important; font-size: 15px !important; border-radius: 12px !important; }

    /* La cabecera de la tabla usa <td>, no <th>: apuntarle solo a th
       era el motivo de que se viera sin estilo y en ingles. */
    .roomlist-view .dialog table.header,
    .roomlist-view .dialog table.header tbody,
    .roomlist-view .dialog .content table,
    .roomlist-view .dialog .content tbody {
        display: block !important;
        width: 100% !important;
        box-sizing: border-box !important;
    }
    .roomlist-view .dialog table.header {
        background: #ffffff !important;
        border: 1px solid var(--hbx-border) !important;
        border-bottom: none !important;
        border-radius: 12px 12px 0 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        flex-shrink: 0 !important;
    }
    .roomlist-view .dialog table.header tr,
    .roomlist-view .dialog .content tr {
        display: flex !important;
        align-items: center !important;
        width: 100% !important;
        padding: 0 24px !important;
        gap: 14px !important;
        box-sizing: border-box !important;
    }
    .roomlist-view .dialog table.header tr {
        height: 58px !important;
        border-bottom: 1px solid #f0f1f4 !important;
    }
    .roomlist-view .dialog table.header td {
        color: var(--hbx-text-muted) !important;
        font-size: 11.5px !important;
        font-weight: 600 !important;
        letter-spacing: 0.7px !important;
        text-transform: uppercase !important;
        padding: 0 !important;
        border: none !important;
    }
    .roomlist-view .dialog .content {
        border-radius: 0 0 12px 12px !important;
        border-top: none !important;
    }
    .roomlist-view .dialog .content tr { height: 45px !important; }
    .roomlist-view .dialog .content td { padding: 0 !important; }

    /* columnas: bandera | nombre (se estira) | jugadores */
    .roomlist-view .dialog td[data-hook="flag"],
    .roomlist-view .dialog table.header td:last-child {
        order: -1 !important;
        width: 34px !important;
        flex: 0 0 34px !important;
        font-size: 0 !important;
        text-align: left !important;
    }
    .roomlist-view .dialog td[data-hook="name"],
    .roomlist-view .dialog table.header td:first-child {
        flex: 1 1 auto !important;
        min-width: 0 !important;
        text-align: left !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
    }
    .roomlist-view .dialog td[data-hook="players"],
    .roomlist-view .dialog table.header td:nth-child(2) {
        flex: 0 0 auto !important;
        width: 110px !important;
        text-align: right !important;
        position: static !important;
    }
    .roomlist-view .dialog td[data-hook="pass"] { display: none !important; }
    .roomlist-view .flagico { border-radius: 3px !important; box-shadow: 0 0 0 1px rgba(16,24,40,.06) !important; }

    /* La columna de iconos, fija contra el borde de la ventana */
    #sidebar-panel {
        position: fixed !important;
        right: 22px !important;
        left: auto !important;
        top: 30px !important;
        bottom: 24px !important;
        width: 52px !important;
        z-index: 3 !important;
    }
    #sidebar-panel button, #sidebar-panel label {
        width: 52px !important;
        height: 52px !important;
        border-radius: 12px !important;
    }

    .hbx-native-section[data-hbx-tweaks-native="1"],
    .hbx-native-wrap {
        width: 100%;
        margin-top: 4px;
        padding: 0 !important;
        background: transparent !important;
        border: 0 !important;
        box-sizing: border-box;
    }
    .hbx-native-section[data-hbx-tweaks-native="1"] > * { max-width: 100%; box-sizing: border-box; }
    .hbx-interface-card { cursor: default; }
    .hbx-interface-preview {
        width: 92px; height: 54px; flex: 0 0 92px; border-radius: 10px;
        background: radial-gradient(circle at 50% 0%, #39495c 0%, #1b2430 48%, #0f141b 100%);
        background-size: cover; background-position: center; border: 1px solid var(--hbx-border);
    }
    .hbx-interface-actions { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-bottom: 16px; }
    .hbx-interface-choice, .hbx-interface-upload {
        min-height: 42px; padding: 10px 14px; border-radius: 10px;
        border: 1px solid var(--hbx-border); background: #fff; color: var(--hbx-text-main);
        font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; text-align: center;
        box-shadow: var(--hbx-shadow-sm); box-sizing: border-box;
    }
    .hbx-interface-choice:hover, .hbx-interface-upload:hover, .hbx-interface-choice.active {
        border-color: var(--hbx-primary); color: var(--hbx-primary); background: #eff6ff;
    }
`;

    function injectSkinCSS() {
        if (document.getElementById('hbx-skin-styles')) return;
        var style = document.createElement('style');
        style.id = 'hbx-skin-styles';
        style.textContent = SKIN_CSS;
        (document.head || document.documentElement).appendChild(style);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 2. SVG ICONS HELPER
    // ─────────────────────────────────────────────────────────────────────────────
    var ICONS = {
        sound: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>',
        screen: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
        ui: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>',
        keys: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
        replays: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>',
        teams: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
        lang: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
        advanced: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0 .33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
        tweaks: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>',
        close: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
        chevron: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',
        check: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
        discord: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>',
        user: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
        ball: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/></svg>',
        pitch: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="4"/><line x1="3" y1="12" x2="21" y2="12"/></svg>',
        scoreboard: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>',
        usersCount: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'
    };

    // ─────────────────────────────────────────────────────────────────────────────
    // 3. ENHANCE ROOM LIST (Foto 2)
    // ─────────────────────────────────────────────────────────────────────────────
    function enhanceRoomListView(dialog) {
        if (!dialog || dialog.dataset.hbxEnhanced) return;
        dialog.dataset.hbxEnhanced = 'true';

        // 1. Header con contador
        if (!dialog.querySelector('.hbx-roomlist-header')) {
            var header = document.createElement('div');
            header.className = 'hbx-roomlist-header';
            header.innerHTML = `
                <h1 class="hbx-roomlist-title">Lista de Salas</h1>
                <div class="hbx-roomlist-stats" id="hbx-live-stats">
                    ${ICONS.usersCount} <span id="hbx-stats-text">Cargando salas...</span>
                </div>
            `;
            dialog.insertBefore(header, dialog.firstChild);
        }

        // 2. Banner de Discord
        if (!dialog.querySelector('.hbx-discord-card') && !document.getElementById('hbx-discord-connect-btn')) {
            var discordCard = document.createElement('div');
            discordCard.className = 'hbx-discord-card';
            discordCard.innerHTML = `
                <div class="hbx-discord-info">
                    <span style="color:#5865F2;">${ICONS.discord}</span>
                    <span id="hbx-discord-status-label">No estás conectado con Discord</span>
                </div>
                <button class="hbx-discord-btn" id="hbx-discord-connect-btn">
                    ${ICONS.discord} CONECTAR
                </button>
            `;
            var headerEl = dialog.querySelector('.hbx-roomlist-header');
            dialog.insertBefore(discordCard, headerEl ? headerEl.nextSibling : dialog.firstChild);

            discordCard.querySelector('#hbx-discord-connect-btn').addEventListener('click', function () {
                try {
                    window.parent.postMessage({ type: 'HBX_DISCORD_CONNECT_REQUEST' }, '*');
                } catch(e) {}
            });
        }

        // 2b. Cabecera de la tabla en castellano y en mayusculas, como
        //     en la foto. La tercera celda (Pass) se esconde y la ultima
        //     hace de columna de bandera.
        (function () {
            var celdas = dialog.querySelectorAll('table.header td');
            if (celdas.length) {
                if (celdas[0]) celdas[0].textContent = 'SALA';
                if (celdas[1]) celdas[1].textContent = 'JUGADORES';
                for (var i = 2; i < celdas.length - 1; i++) celdas[i].style.display = 'none';
            }
        })();

        // 3. Estadísticas dinámicas de jugadores y salas
        function updateStats() {
            var statsEl = document.getElementById('hbx-stats-text');
            if (!statsEl) return;
            // El total real lo publica el juego en p[data-hook="numplayers"]
            // ("4435 players in 1025 rooms"). Sumar las filas visibles daba
            // solo las cargadas en pantalla.
            var nativo = dialog.querySelector('p[data-hook="numplayers"]');
            if (nativo) {
                var nums = (nativo.textContent || '').match(/\d+/g);
                if (nums && nums.length >= 2) {
                    statsEl.textContent = nums[0] + ' jugadores en ' + nums[1] + ' salas';
                    return;
                }
            }
            var rows = dialog.querySelectorAll('.content tr:not(.search-hidden):not(.fav-hidden)');
            var totalRooms = rows.length;
            var totalPlayers = 0;
            rows.forEach(function (r) {
                var pCell = r.querySelector('[data-hook="players"]');
                if (pCell) {
                    var m = (pCell.textContent || '').match(/(\d+)\s*\/\s*\d+/);
                    if (m && m[1]) totalPlayers += parseInt(m[1], 10);
                }
            });
            statsEl.textContent = totalPlayers + ' jugadores en ' + totalRooms + ' salas';
        }

        var content = dialog.querySelector('.content');
        if (content) {
            var statsObserver = new MutationObserver(function () {
                updateStats();
            });
            statsObserver.observe(content, { childList: true, subtree: true });
            setTimeout(updateStats, 200);

            // Click directo sin scroll jump
            content.addEventListener('click', function(e) {
                var tr = e.target.closest('tr');
                if (!tr) return;
                var curScroll = content.scrollTop;
                content.scrollTop = curScroll;
                requestAnimationFrame(function() {
                    content.scrollTop = curScroll;
                });
            });
        }
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 4. ENHANCE SETTINGS DIALOG & TWEAKS HUB (Fotos 1 y 3)
    // ─────────────────────────────────────────────────────────────────────────────
    function enhanceSettingsDialog(dialog) {
        if (!dialog || dialog.dataset.hbxSettingsReady) return;
        dialog.dataset.hbxSettingsReady = 'true';

        // Ocultar tabs nativos viejos
        var oldTabs = dialog.querySelector('.tabs');
        if (oldTabs) oldTabs.style.display = 'none';

        // Crear contenedor Nav lateral (Foto 1)
        var nav = document.createElement('div');
        nav.className = 'hbx-settings-nav';
        nav.innerHTML = `
            <div class="hbx-nav-list">
                <button class="hbx-nav-btn active" data-tab="sound">${ICONS.sound} Sonido</button>
                <button class="hbx-nav-btn" data-tab="screen">${ICONS.screen} Pantalla</button>
                <button class="hbx-nav-btn" data-tab="ui">${ICONS.ui} Interfaz</button>
                <button class="hbx-nav-btn" data-tab="keys">${ICONS.keys} Teclas</button>
                <button class="hbx-nav-btn" data-tab="replays">${ICONS.replays} Repeticiones</button>
                <button class="hbx-nav-btn" data-tab="teams">${ICONS.teams} Equipos</button>
                <button class="hbx-nav-btn" data-tab="lang">${ICONS.lang} Idioma</button>
                <button class="hbx-nav-btn" data-tab="advanced">${ICONS.advanced} Avanzado</button>
                <button class="hbx-nav-btn" data-tab="tweaks">${ICONS.tweaks} Tweaks</button>
            </div>
            <button class="hbx-nav-close" id="hbx-close-settings-btn">
                ${ICONS.close} Cerrar
            </button>
        `;
        dialog.insertBefore(nav, dialog.firstChild);

        // Crear contenedor principal de contenido
        var contentWrapper = document.createElement('div');
        contentWrapper.className = 'hbx-settings-content';
        contentWrapper.id = 'hbx-settings-content-pane';
        dialog.appendChild(contentWrapper);

        // Botón de cierre
        nav.querySelector('#hbx-close-settings-btn').addEventListener('click', function () {
            var closeBtn = dialog.querySelector('button[data-hook="close"]') || dialog.querySelector('button[data-hook="cancel"]');
            if (closeBtn) closeBtn.click();
            else dialog.style.display = 'none';
        });

        // Manejo de cambio de pestañas
        var navButtons = nav.querySelectorAll('.hbx-nav-btn');
        navButtons.forEach(function (btn) {
            btn.addEventListener('click', function () {
                navButtons.forEach(function (b) { b.classList.remove('active'); });
                btn.classList.add('active');
                renderSettingsSection(btn.dataset.tab, contentWrapper, dialog);
            });
        });

        // Una entrada que al abrirla no muestra nada es peor que no
        // tenerla: se esconden las que no tienen ninguna seccion detras.
        // 'lang' y 'tweaks' los arma la propia capa, siempre tienen.
        navButtons.forEach(function (btn) {
            var tab = btn.dataset.tab;
            if (tab === 'tweaks' || tab === 'lang') return;
            var hooks = infoTab(tab).hooks;
            var hay = hooks.some(function (h) {
                var sec = dialog.querySelector('.section[data-hook="' + h + '"]');
                return !!(sec && (sec.children.length || (sec.textContent || '').trim()));
            });
            if (!hay) btn.classList.add('hbx-nav-oculto');
        });

        // Render inicial: Sonido
        renderSettingsSection('sound', contentWrapper, dialog);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 5. RENDER SECTIONS & TWEAKS (Foto 1 y Foto 3)
    // ─────────────────────────────────────────────────────────────────────────────
    // Las secciones nativas que se mueven al panel se devuelven aca antes
    // de limpiarlo: si se las dejara adentro, el container.innerHTML = ''
    // las borraria del DOM y se perderian los controles del juego.
    function guardadoOculto(dialog) {
        var g = dialog.querySelector('#hbx-native-parking');
        if (!g) {
            g = document.createElement('div');
            g.id = 'hbx-native-parking';
            g.style.display = 'none';
            dialog.appendChild(g);
        }
        return g;
    }

    var DESCRIPCIONES = [
        ['sounds enabled',   'Activa o desactiva todos los sonidos del juego.'],
        ['chat sound',       'Activa o desactiva los sonidos del chat.'],
        ['nick highlight',   'Activa o desactiva el sonido cuando mencionan tu nick.'],
        ['crowd sound',      'Activa o desactiva los sonidos de la multitud.'],
        ['fullscreen',       'Cambia entre pantalla completa y ventana.'],
        ['show fps',         'Muestra el contador de cuadros por segundo.'],
        ['fps',              'Limita los cuadros por segundo para ahorrar recursos.'],
        ['extrapolation',    'Compensa el retraso de red prediciendo el movimiento.'],
        ['team colors',      'Usa los colores personalizados de cada equipo.'],
        ['show chat',        'Muestra u oculta el chat durante la partida.'],
        ['vsync',            'Sincroniza el dibujado con la pantalla para evitar cortes.'],
        ['resolution',       'Calidad de resolucion con la que se dibuja la cancha.'],
        ['zoom',             'Que tan cerca se ve la accion.']
    ];

    function descripcionDe(titulo) {
        var t = (titulo || '').toLowerCase();
        for (var i = 0; i < DESCRIPCIONES.length; i++) {
            if (t.indexOf(DESCRIPCIONES[i][0]) !== -1) return DESCRIPCIONES[i][1];
        }
        return '';
    }

    // Titulo + secciones nativas detras de cada entrada del menu.
    function infoTab(tabName) {
        var tabTitle = '', hookNames = [];
        switch (tabName) {
            case 'sound': tabTitle = 'Sonido'; hookNames = ['soundsec']; break;
            case 'screen': tabTitle = 'Pantalla'; hookNames = ['videosec']; break;
            case 'ui': tabTitle = 'Interfaz'; hookNames = ['miscsec']; break;
            case 'keys': tabTitle = 'Teclas'; hookNames = ['inputsec']; break;
            case 'replays': tabTitle = 'Repeticiones'; hookNames = ['replay-section', 'record-section', 'replaysec']; break;
            case 'teams': tabTitle = 'Equipos'; hookNames = ['teams-section', 'teamsec', 'camisetassec']; break;
            case 'lang': tabTitle = 'Idioma'; hookNames = []; break;
            case 'advanced': tabTitle = 'Avanzado'; hookNames = ['perf-section', 'extra-section', 'theme-section', 'multiauth-section', 'geo-section', 'tokensec']; break;
            default: tabTitle = tabName; break;
        }
        return { title: tabTitle, hooks: hookNames };
    }


    function renderSettingsSection(tabName, container, dialog) {
        var guardado = guardadoOculto(dialog);
        var prestadas = container.querySelectorAll('.hbx-native-section');
        for (var gi = 0; gi < prestadas.length; gi++) guardado.appendChild(prestadas[gi]);

        container.innerHTML = '';
        if (tabName === 'tweaks') {
            renderTweaksMainMenu(container);
            return;
        }

        var _i = infoTab(tabName);
        var tabTitle = _i.title;
        var hookNames = _i.hooks;

        // OJO con los nombres: las secciones nativas de Haxball llevan el
        // sufijo "sec" (soundsec, videosec, inputsec, miscsec). Antes aca
        // decia 'sound', 'video', 'input'... y no coincidia con NINGUNA
        // seccion, asi que todas las pestañas salian vacias.

        // Como en la foto: el titulo del panel siempre dice "Configuración"
        // (cual seccion es se ve en el menu de la izquierda, resaltada).
        container.innerHTML = `
            <h2 class="hbx-settings-title">Configuración</h2>
            <div id="hbx-dynamic-options" style="display:flex; flex-direction:column; gap:8px;"></div>
        `;
        
        var optsContainer = container.querySelector('#hbx-dynamic-options');

        // Se busca en todo el dialogo y no solo en .tabcontents porque las
        // secciones que no se pueden convertir en tarjetas se mueven tal
        // cual a este panel (y de ahi a un guardado oculto al cambiar).
        var sections = dialog.querySelectorAll('.section');
        
        hookNames.forEach(function(hookName) {
            var oldSection = null;
            for (var i=0; i<sections.length; i++) {
                if (sections[i].getAttribute('data-hook') === hookName || sections[i].className.indexOf(hookName) !== -1) {
                    oldSection = sections[i];
                    break;
                }
            }

            if (oldSection) {
                // Parse labels inside
                var labels = oldSection.querySelectorAll('label');
                labels.forEach(function(lbl) {
                    var chk = lbl.querySelector('input[type="checkbox"]');
                    var sel = lbl.querySelector('select');
                    var rng = lbl.querySelector('input[type="range"]');
                    
                    if (chk) {
                        // Limpiar texto
                        var clone = lbl.cloneNode(true);
                        var cInput = clone.querySelector('input');
                        if(cInput) clone.removeChild(cInput);
                        var title = clone.textContent.trim();
                        if (!title) return;

                        var desc = '';
                        var pDesc = lbl.nextElementSibling;
                        if (pDesc && pDesc.tagName === 'P') {
                            desc = pDesc.textContent.trim();
                        }
                        if (!desc) desc = descripcionDe(title);

                        var card = document.createElement('div');
                        card.className = 'hbx-option-card';
                        card.innerHTML = `
                            <div class="hbx-checkbox ${chk.checked ? 'checked' : ''}">${chk.checked ? ICONS.check : ''}</div>
                            <div class="hbx-option-body">
                                <div class="hbx-option-name">${title}</div>
                                ${desc ? `<div class="hbx-option-desc">${desc}</div>` : ''}
                            </div>
                            <div class="hbx-card-chevron">${ICONS.chevron}</div>
                        `;
                        card.addEventListener('click', function(e) {
                            if (e.target.tagName.toLowerCase() === 'input' || e.target.tagName.toLowerCase() === 'select') return;
                            chk.click(); // Triggers original Haxball logic
                        });

                        // Keep UI in sync with hidden native input
                        chk.addEventListener('change', function() {
                            var box = card.querySelector('.hbx-checkbox');
                            if (chk.checked) {
                                box.classList.add('checked');
                                box.innerHTML = ICONS.check;
                            } else {
                                box.classList.remove('checked');
                                box.innerHTML = '';
                            }
                        });

                        optsContainer.appendChild(card);
                    } else if (sel) {
                        var clone = lbl.cloneNode(true);
                        var cSel = clone.querySelector('select');
                        if(cSel) clone.removeChild(cSel);
                        var title = clone.textContent.trim();

                        var card = document.createElement('div');
                        card.className = 'hbx-option-card';
                        card.style.cursor = 'default';
                        card.innerHTML = `
                            <div class="hbx-option-body">
                                <div class="hbx-option-name">${title}</div>
                            </div>
                            <div class="hbx-select-wrapper" style="flex-shrink:0;"></div>
                        `;
                        
                        var selWrapper = card.querySelector('.hbx-select-wrapper');
                        var newSel = document.createElement('select');
                        newSel.style.cssText = 'padding:8px 12px; border-radius:8px; border:1px solid #d0d5dd; font-family:inherit; font-size:13px; outline:none; background:#f9fafb; cursor:pointer; min-width: 120px;';
                        newSel.innerHTML = sel.innerHTML;
                        newSel.value = sel.value;
                        
                        newSel.addEventListener('change', function() {
                            sel.value = newSel.value;
                            sel.dispatchEvent(new Event('change', { bubbles: true }));
                        });
                        sel.addEventListener('change', function() {
                            newSel.value = sel.value;
                        });

                        selWrapper.appendChild(newSel);
                        optsContainer.appendChild(card);
                    } else if (rng) {
                        var clone = lbl.cloneNode(true);
                        var cRng = clone.querySelector('input');
                        if(cRng) clone.removeChild(cRng);
                        var cSpan = clone.querySelector('span');
                        var title = clone.textContent.replace(cSpan ? cSpan.textContent : '', '').trim();

                        var card = document.createElement('div');
                        card.className = 'hbx-option-card';
                        card.style.cursor = 'default';
                        card.style.flexDirection = 'column';
                        card.style.alignItems = 'flex-start';
                        card.innerHTML = `
                            <div class="hbx-option-body" style="width:100%; display:flex; justify-content:space-between; margin-bottom: 8px;">
                                <div class="hbx-option-name">${title}</div>
                                ${cSpan ? `<div class="hbx-option-value" style="font-weight:600; color:var(--hbx-primary);">${cSpan.textContent}</div>` : ''}
                            </div>
                            <input type="range" min="${rng.min}" max="${rng.max}" step="${rng.step}" value="${rng.value}" style="width:100%; cursor:pointer;" />
                        `;
                        var newRng = card.querySelector('input[type="range"]');
                        var spanVal = card.querySelector('.hbx-option-value');
                        
                        newRng.addEventListener('input', function() {
                            rng.value = newRng.value;
                            rng.dispatchEvent(new Event('input', { bubbles: true }));
                            rng.dispatchEvent(new Event('change', { bubbles: true }));
                            if(spanVal) spanVal.textContent = newRng.value;
                        });
                        rng.addEventListener('input', function() {
                            newRng.value = rng.value;
                            if(spanVal) spanVal.textContent = rng.value;
                        });
                        optsContainer.appendChild(card);
                    }
                });

                // Si de los labels no salio NINGUNA tarjeta, la seccion no se
                // puede representar asi (ej: Teclas, que son filas de atajos).
                // En ese caso se trae entera y no se clonan botones sueltos,
                // que quedaban como un "Set ✖ Set ✖" sin contexto.
                var salieronTarjetas = optsContainer.children.length > 0;

                var buttons = salieronTarjetas
                    ? oldSection.querySelectorAll('button:not([data-hook])')
                    : [];
                if (buttons && buttons.length > 0) {
                    var btnGroup = document.createElement('div');
                    btnGroup.style.cssText = 'display:flex; gap:10px; margin-top:10px; margin-bottom:12px; flex-wrap:wrap; width: 100%;';
                    buttons.forEach(function(btn) {
                        var nBtn = document.createElement('button');
                        nBtn.innerHTML = btn.innerHTML;
                        nBtn.style.cssText = 'flex: 1; padding:10px 16px; border-radius:10px; border:1px solid var(--hbx-border); background:#ffffff; color:var(--hbx-text-main); font-weight:600; font-size:13px; cursor:pointer; box-shadow:var(--hbx-shadow-sm); display:flex; align-items:center; justify-content:center; gap:6px;';
                        nBtn.addEventListener('click', function(e) { e.preventDefault(); btn.click(); });
                        btnGroup.appendChild(nBtn);
                    });
                    optsContainer.appendChild(btnGroup);
                }

                // Se MUEVE, no se clona, para no perder los handlers nativos.
                if (!salieronTarjetas) {
                    oldSection.classList.add('hbx-native-section');
                    oldSection.style.display = 'block';
                    optsContainer.appendChild(oldSection);
                }
            }
        });

        if (tabName === 'lang') renderIdioma(optsContainer);

        if (!optsContainer.children.length) {
            var vacio = document.createElement('div');
            vacio.className = 'hbx-pick-empty';
            vacio.textContent = 'Esta sección no tiene opciones en esta versión.';
            optsContainer.appendChild(vacio);
        }
    }

    // Idioma: translate.js expone __haxGetLanguage / __haxSetLanguage.
    function renderIdioma(cont) {
        var IDIOMAS = [
            { id: 'es', label: 'Español' },
            { id: 'pt', label: 'Português' },
            { id: 'en', label: 'English' }
        ];
        var actual = 'es';
        try { if (window.__haxGetLanguage) actual = window.__haxGetLanguage(); } catch (e) {}

        IDIOMAS.forEach(function (l) {
            var card = document.createElement('div');
            card.className = 'hbx-option-card';
            card.style.cursor = 'pointer';
            card.innerHTML =
                '<div class="hbx-checkbox ' + (l.id === actual ? 'checked' : '') + '">' +
                    (l.id === actual ? ICONS.check : '') + '</div>' +
                '<div class="hbx-option-body"><div class="hbx-option-name"></div></div>';
            card.querySelector('.hbx-option-name').textContent = l.label;
            card.addEventListener('click', function () {
                try { if (window.__haxSetLanguage) window.__haxSetLanguage(l.id); } catch (e) {}
                var todas = cont.querySelectorAll('.hbx-checkbox');
                for (var i = 0; i < todas.length; i++) {
                    todas[i].classList.remove('checked');
                    todas[i].innerHTML = '';
                }
                var box = card.querySelector('.hbx-checkbox');
                box.classList.add('checked');
                box.innerHTML = ICONS.check;
            });
            cont.appendChild(card);
        });
    }

    function renderTweaksMainMenu(container) {
        var menuDialog = container.closest('.settings-view');
        if (menuDialog) {
            var menuParked = guardadoOculto(menuDialog);
            var menuMounted = container.querySelectorAll('.hbx-native-section');
            for (var mj = 0; mj < menuMounted.length; mj++) menuParked.appendChild(menuMounted[mj]);
        }
        container.innerHTML = `
            <h2 class="hbx-settings-title">Tweaks</h2>
            <div class="hbx-settings-subtitle">Ajustes avanzados para personalizar tu experiencia.</div>
            <div id="hbx-tweaks-list"></div>
        `;

        var list = container.querySelector('#hbx-tweaks-list');

        var categories = [
            { id: 'player', title: 'Jugador', desc: 'Ajustes visuales y de comportamiento del jugador.', icon: ICONS.user, color: 'hbx-icon-green' },
            { id: 'ball', title: 'Pelota', desc: 'Personaliza el aspecto y comportamiento de la pelota.', icon: ICONS.ball, color: 'hbx-icon-purple' },
            { id: 'pitch', title: 'Cancha', desc: 'Ajustes visuales de la cancha y sus elementos.', icon: ICONS.pitch, color: 'hbx-icon-orange' },
            { id: 'interface', title: 'Fondo de interfaz', desc: 'Cambia el fondo que se ve detrás de toda la aplicación.', icon: ICONS.screen, color: 'hbx-icon-blue' },
            { id: 'keys', title: 'Indicador de teclas', desc: 'Personaliza el indicador de teclas en pantalla.', icon: ICONS.keys, color: 'hbx-icon-blue' },
            { id: 'scoreboard', title: 'Marcador', desc: 'Ajustes del marcador y elementos en pantalla.', icon: ICONS.scoreboard, color: 'hbx-icon-pink' },
            { id: 'sounds', title: 'Sonidos', desc: 'Configura todos los sonidos del juego.', icon: ICONS.sound, color: 'hbx-icon-red' }
        ];

        categories.forEach(function (cat) {
            var card = document.createElement('div');
            card.className = 'hbx-tweak-category-card';
            card.innerHTML = `
                <div class="hbx-category-icon-box ${cat.color}">
                    ${cat.icon}
                </div>
                <div class="hbx-option-body">
                    <div class="hbx-option-name">${cat.title}</div>
                    <div class="hbx-option-desc">${cat.desc}</div>
                </div>
                <div class="hbx-card-chevron">${ICONS.chevron}</div>
            `;
            card.addEventListener('click', function () {
                renderTweakSubPanel(cat.id, cat.title, container);
            });
            list.appendChild(card);
        });
    }

    // ═════════════════════════════════════════════════════════════════════════════
    //  ACCESO A LA CARPETA assets/
    // ─────────────────────────────────────────────────────────────────────────────
    //  La lista de canchas y pelotas NO va escrita a mano: se lee de
    //  assets/index.json, que arma scripts/build-assets-index.js. Cada
    //  subcarpeta de assets/pelotas/ es una subseccion del selector, asi
    //  que agregar una tanda nueva es crear la carpeta y correr el script.
    // ═════════════════════════════════════════════════════════════════════════════
    var _assetIndex = null;
    var _dataUrlCache = {};

    // Las rutas relativas resuelven contra haxball.com y no existen ahi.
    // En el cliente de escritorio los archivos se sirven por hbx://, y en
    // la extension de Chrome por chrome-extension://.
    function assetUrl(rel) {
        try {
            if (window.chrome && chrome.runtime && chrome.runtime.getURL) {
                return chrome.runtime.getURL(rel);
            }
        } catch (e) {}
        if (window.HBX_BUILD === 'web' || (typeof window !== 'undefined' && window.location && (window.location.protocol === 'http:' || window.location.protocol === 'https:' || window.location.protocol === 'file:'))) {
            return rel;
        }
        return 'hbx://ext/' + rel;
    }

    function cargarIndice() {
        if (_assetIndex) return Promise.resolve(_assetIndex);
        return fetch(assetUrl('assets/index.json'))
            .then(function (r) { return r.json(); })
            .then(function (j) {
                _assetIndex = { canchas: j.canchas || [], pelotas: j.pelotas || [] };
                return _assetIndex;
            })
            .catch(function () { return { canchas: [], pelotas: [] }; });
    }

    // La imagen termina dibujandose sobre el canvas del juego. Si se pasa
    // una URL de otro esquema el canvas queda "tainted" y getImageData()
    // deja de funcionar, asi que se convierte a data: antes de aplicarla.
    // Ademas asi sobrevive al reinicio: runtime.js relee el data: guardado.
    function aDataUrl(rel) {
        if (_dataUrlCache[rel]) return Promise.resolve(_dataUrlCache[rel]);
        return fetch(assetUrl(rel))
            .then(function (r) {
                if (!r.ok) throw new Error('no se pudo leer ' + rel);
                return r.blob();
            })
            .then(function (b) {
                return new Promise(function (res, rej) {
                    var fr = new FileReader();
                    fr.onload = function () { res(fr.result); };
                    fr.onerror = rej;
                    fr.readAsDataURL(b);
                });
            })
            .then(function (d) { _dataUrlCache[rel] = d; return d; });
    }

    function guardar(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

    function aplicarCancha(it) {
        return aDataUrl(it.full).then(function (data) {
            guardar('hbx_custom_field_bg_data', data);
            guardar('hbx_custom_field_bg_enabled', '1');
            guardar('hbx_custom_field_bg_id', it.id);
            if (window.setCustomFieldBg) window.setCustomFieldBg(data, true);
            if (window.broadcastFieldBg) window.broadcastFieldBg(data, true);
        });
    }

    function limpiarCancha() {
        guardar('hbx_custom_field_bg_enabled', '0');
        guardar('hbx_custom_field_bg_id', '');
        if (window.setCustomFieldBg) window.setCustomFieldBg(undefined, false);
        if (window.broadcastFieldBg) window.broadcastFieldBg(undefined, false);
    }

    function aplicarPelota(it) {
        return aDataUrl(it.full).then(function (data) {
            guardar('hbx_custom_ball_img_data', data);
            guardar('hbx_custom_ball_img_enabled', '1');
            guardar('hbx_custom_ball_color_enabled', '1');
            guardar('hbx_custom_ball_id', it.id);
            if (window.setCustomBallImg) window.setCustomBallImg(data, true);
            if (window.broadcastBallImg) window.broadcastBallImg(data, true, 1, 0, 0);
        });
    }

    function limpiarPelota() {
        guardar('hbx_custom_ball_img_enabled', '0');
        guardar('hbx_custom_ball_id', '');
        if (window.setCustomBallImg) window.setCustomBallImg(undefined, false);
        if (window.broadcastBallImg) window.broadcastBallImg(undefined, false, 1, 0, 0);
    }

    // ── armazon comun de los selectores ──────────────────────────────────
    function panelSelector(container, textoVolver, titulo, onVolver) {
        container.innerHTML = '';
        var back = document.createElement('button');
        back.className = 'hbx-subpanel-back';
        back.textContent = '← ' + textoVolver;
        back.addEventListener('click', onVolver);
        container.appendChild(back);

        var h = document.createElement('h2');
        h.className = 'hbx-settings-title';
        h.textContent = titulo;
        container.appendChild(h);

        var body = document.createElement('div');
        container.appendChild(body);
        return body;
    }

    function botonQuitar(texto, onClick) {
        var b = document.createElement('button');
        b.className = 'hbx-pick-clear';
        b.textContent = texto;
        b.addEventListener('click', onClick);
        return b;
    }

    function avisoVacio(texto) {
        var d = document.createElement('div');
        d.className = 'hbx-pick-empty';
        d.textContent = texto;
        return d;
    }

    // Una tarjeta con vista previa. La imagen va como <img> y no como
    // background CSS a proposito: el CSP del sitio bloquea las imagenes
    // en CSS pero no las etiquetas <img>.
    function tarjetaPreview(it, tipo, seleccionado, onClick) {
        var d = document.createElement('div');
        d.className = 'hbx-pick-item' + (seleccionado ? ' sel' : '');
        d.title = it.label;

        var img = document.createElement('img');
        img.loading = 'lazy';
        img.alt = it.label;
        img.src = assetUrl(it.thumb || it.full);
        img.addEventListener('error', function () { d.classList.add('rota'); });
        d.appendChild(img);

        var cap = document.createElement('div');
        cap.className = 'hbx-pick-cap';
        cap.textContent = it.label;
        d.appendChild(cap);

        d.addEventListener('click', function () {
            var grid = d.parentNode;
            if (grid) {
                var otros = grid.querySelectorAll('.hbx-pick-item.sel');
                for (var i = 0; i < otros.length; i++) otros[i].classList.remove('sel');
            }
            d.classList.add('sel');
            onClick(it, d);
        });
        return d;
    }

    // ── selector de canchas ──────────────────────────────────────────────
    function abrirSelectorCanchas(container) {
        var body = panelSelector(container, 'Volver a Cancha', 'Fondos de cancha', function () {
            renderTweakSubPanel('pitch', 'Cancha', container);
        });

        body.appendChild(botonQuitar('Quitar fondo personalizado', function () {
            limpiarCancha();
            abrirSelectorCanchas(container);
        }));

        var grid = document.createElement('div');
        grid.className = 'hbx-pick-grid canchas';
        body.appendChild(grid);

        cargarIndice().then(function (idx) {
            if (!idx.canchas.length) {
                body.appendChild(avisoVacio('No hay imagenes en assets/canchas.'));
                return;
            }
            var actual = localStorage.getItem('hbx_custom_field_bg_id') || '';
            var activo = localStorage.getItem('hbx_custom_field_bg_enabled') === '1';
            idx.canchas.forEach(function (it) {
                grid.appendChild(tarjetaPreview(it, 'cancha', activo && actual === it.id, aplicarCancha));
            });
        });
    }

    // ── selector de pelotas: primero las subsecciones ────────────────────
    function abrirCategoriasPelotas(container) {
        var body = panelSelector(container, 'Volver a Pelota', 'Pelotas', function () {
            renderTweakSubPanel('ball', 'Pelota', container);
        });

        body.appendChild(botonQuitar('Quitar pelota personalizada', function () {
            limpiarPelota();
            abrirCategoriasPelotas(container);
        }));

        cargarIndice().then(function (idx) {
            if (!idx.pelotas.length) {
                body.appendChild(avisoVacio('No hay carpetas en assets/pelotas.'));
                return;
            }
            idx.pelotas.forEach(function (cat) {
                var card = document.createElement('div');
                card.className = 'hbx-cat-card';

                var tiras = document.createElement('div');
                tiras.className = 'hbx-cat-thumbs';
                cat.items.slice(0, 4).forEach(function (it) {
                    var im = document.createElement('img');
                    im.loading = 'lazy';
                    im.alt = '';
                    im.src = assetUrl(it.thumb || it.full);
                    tiras.appendChild(im);
                });
                card.appendChild(tiras);

                var txt = document.createElement('div');
                txt.className = 'hbx-cat-txt';
                txt.innerHTML = '<div class="hbx-option-name"></div><div class="hbx-option-desc"></div>';
                txt.querySelector('.hbx-option-name').textContent = cat.label;
                txt.querySelector('.hbx-option-desc').textContent =
                    cat.items.length + (cat.items.length === 1 ? ' modelo' : ' modelos');
                card.appendChild(txt);

                var chev = document.createElement('div');
                chev.className = 'hbx-card-chevron';
                chev.innerHTML = ICONS.chevron;
                card.appendChild(chev);

                card.addEventListener('click', function () {
                    abrirGrillaPelotas(container, cat.id);
                });
                body.appendChild(card);
            });
        });
    }

    // ── pelotas de una subseccion, con atajos para saltar a las otras ────
    function abrirGrillaPelotas(container, catId) {
        cargarIndice().then(function (idx) {
            var cat = idx.pelotas.filter(function (c) { return c.id === catId; })[0];
            if (!cat) { abrirCategoriasPelotas(container); return; }

            var body = panelSelector(container, 'Volver a Pelotas', cat.label, function () {
                abrirCategoriasPelotas(container);
            });

            // fichas para cambiar de subseccion sin volver atras
            if (idx.pelotas.length > 1) {
                var chips = document.createElement('div');
                chips.className = 'hbx-chips';
                idx.pelotas.forEach(function (c) {
                    var ch = document.createElement('button');
                    ch.className = 'hbx-chip' + (c.id === catId ? ' on' : '');
                    ch.textContent = c.label;
                    ch.addEventListener('click', function () {
                        if (c.id !== catId) abrirGrillaPelotas(container, c.id);
                    });
                    chips.appendChild(ch);
                });
                body.appendChild(chips);
            }

            body.appendChild(botonQuitar('Quitar pelota personalizada', function () {
                limpiarPelota();
                abrirGrillaPelotas(container, catId);
            }));

            var grid = document.createElement('div');
            grid.className = 'hbx-pick-grid pelotas';
            body.appendChild(grid);

            var actual = localStorage.getItem('hbx_custom_ball_id') || '';
            var activo = localStorage.getItem('hbx_custom_ball_img_enabled') === '1';
            cat.items.forEach(function (it) {
                grid.appendChild(tarjetaPreview(it, 'pelota', activo && actual === it.id, aplicarPelota));
            });
        });
    }

    function montarSeccionNativaEnTweaks(container, sectionHook, buttonHook) {
        var dialog = container.closest('.settings-view');
        if (!dialog) return;
        var section = dialog.querySelector('.section[data-hook="' + sectionHook + '"]');
        var button = dialog.querySelector('.tabs button[data-hook="' + buttonHook + '"]');
        if (!section) { window.setTimeout(function () { montarSeccionNativaEnTweaks(container, sectionHook, buttonHook); }, 250); return; }
        if (button) { try { button.click(); } catch (e) {} }
        section.classList.add('hbx-native-section');
        section.setAttribute('data-hbx-tweaks-native', '1');
        section.style.display = 'block';
        container.appendChild(section);
    }

    function renderTweakSubPanel(id, title, container) {
        var currentDialog = container.closest('.settings-view');
        if (currentDialog) {
            var parked = guardadoOculto(currentDialog);
            var mounted = container.querySelectorAll('.hbx-native-section');
            for (var mi = 0; mi < mounted.length; mi++) parked.appendChild(mounted[mi]);
        }
        container.innerHTML = `
            <button class="hbx-subpanel-back" id="hbx-back-to-tweaks">
                ← Volver a Tweaks
            </button>
            <h2 class="hbx-settings-title">${title}</h2>
            <div id="hbx-subpanel-content"></div>
        `;

        container.querySelector('#hbx-back-to-tweaks').addEventListener('click', function () {
            renderTweaksMainMenu(container);
        });

        var content = container.querySelector('#hbx-subpanel-content');

        if (id === 'pitch') {
            // CANCHA: Fondo de cancha, Grosor, Presets
            content.innerHTML = `
                <div class="hbx-option-card">
                    <div class="hbx-option-body">
                        <div class="hbx-option-name">Fondo de cancha personalizado</div>
                        <div class="hbx-option-desc">Activa o cambia la imagen/textura del campo de juego.</div>
                    </div>
                    <button id="hbx-fieldbg-toggle-btn" style="padding:8px 14px;background:#2563eb;color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer;">
                        Seleccionar Fondo
                    </button>
                </div>
                <div class="hbx-option-card">
                    <div class="hbx-option-body">
                        <div class="hbx-option-name">Grosor de líneas de cancha</div>
                        <div class="hbx-option-desc">Ajusta el ancho de las líneas del estadio.</div>
                    </div>
                    <input type="range" min="1" max="6" step="0.5" id="hbx-grosor-cancha-slider" style="width:160px;" value="${window.grosorCancha || 3}">
                </div>
                <div class="hbx-option-card">
                    <div class="hbx-option-body">
                        <div class="hbx-option-name">Grosor de arcos</div>
                        <div class="hbx-option-desc">Ajusta el ancho de los postes de las porterías.</div>
                    </div>
                    <input type="range" min="0.5" max="5" step="0.5" id="hbx-grosor-arco-slider" style="width:160px;" value="${window.grosorArco || 1}">
                </div>
            `;
            var gcSlider = content.querySelector('#hbx-grosor-cancha-slider');
            gcSlider.addEventListener('input', function() {
                var v = parseFloat(gcSlider.value);
                window.grosorCancha = v;
                localStorage.setItem('hbx_grosor_cancha', v);
            });
            var gaSlider = content.querySelector('#hbx-grosor-arco-slider');
            gaSlider.addEventListener('input', function() {
                var v = parseFloat(gaSlider.value);
                window.grosorArco = v;
                localStorage.setItem('hbx_grosor_arco', v);
            });
            montarSeccionNativaEnTweaks(container, 'fieldbg-section', 'fieldbgbtn');
        }
        else if (id === 'ball') {
            // PELOTA: Color, Multicolor, Grosor
            var isMulti = localStorage.getItem('hbx_ball_multicolor') === '1';
            content.innerHTML = `
                <div class="hbx-option-card" id="hbx-ball-multi-card">
                    <div class="hbx-checkbox ${isMulti ? 'checked' : ''}">${isMulti ? ICONS.check : ''}</div>
                    <div class="hbx-option-body">
                        <div class="hbx-option-name">Pelota Multicolor (RGB)</div>
                        <div class="hbx-option-desc">Cicla los colores de la pelota en tiempo real.</div>
                    </div>
                </div>
                <div class="hbx-option-card">
                    <div class="hbx-option-body">
                        <div class="hbx-option-name">Grosor de pelota</div>
                        <div class="hbx-option-desc">Ajusta el contorno del balón.</div>
                    </div>
                    <input type="range" min="0.5" max="5" step="0.5" id="hbx-grosor-pelota-slider" style="width:160px;" value="${window.grosorPelota || 1}">
                </div>
            `;
            content.querySelector('#hbx-ball-multi-card').addEventListener('click', function() {
                isMulti = !isMulti;
                localStorage.setItem('hbx_ball_multicolor', isMulti ? '1' : '0');
                if (typeof window.setBallMulticolor === 'function') window.setBallMulticolor(isMulti);
                var cb = this.querySelector('.hbx-checkbox');
                cb.className = 'hbx-checkbox ' + (isMulti ? 'checked' : '');
                cb.innerHTML = isMulti ? ICONS.check : '';
            });
            var gpSlider = content.querySelector('#hbx-grosor-pelota-slider');
            gpSlider.addEventListener('input', function() {
                var v = parseFloat(gpSlider.value);
                window.grosorPelota = v;
                localStorage.setItem('hbx_grosor_pelota', v);
            });
            var ballMount = document.createElement('div');
            ballMount.className = 'hbx-native-wrap';
            content.appendChild(ballMount);
            if (window.hbxRenderAvatarTweaks) window.hbxRenderAvatarTweaks(ballMount, 'ball');
            else montarSeccionNativaEnTweaks(container, 'avatarsec', 'avatarbtn');
        }
        else if (id === 'player') {
            // JUGADOR: Avatar, Fuente, Grosor
            content.innerHTML = `
                <div class="hbx-option-card">
                    <div class="hbx-option-body">
                        <div class="hbx-option-name">Fuente del Avatar</div>
                        <div class="hbx-option-desc">Tipografía usada en los números y letras sobre los jugadores.</div>
                    </div>
                    <select id="hbx-avatar-font-sel" style="padding:6px 10px;border:1px solid #eaecf0;border-radius:8px;font-weight:600;">
                        <option value="900 34px 'Arial Black','Arial Bold',Gadget,sans-serif">Arial Black (Original)</option>
                        <option value="900 34px 'Verdana',sans-serif">Verdana</option>
                        <option value="900 34px 'Impact',sans-serif">Impact</option>
                        <option value="900 34px 'Courier New',monospace">Courier New</option>
                    </select>
                </div>
                <div class="hbx-option-card">
                    <div class="hbx-option-body">
                        <div class="hbx-option-name">Grosor de jugadores</div>
                        <div class="hbx-option-desc">Ajusta el contorno de los discos de los jugadores.</div>
                    </div>
                    <input type="range" min="0.5" max="5" step="0.5" id="hbx-grosor-jugador-slider" style="width:160px;" value="${window.grosorJugador || 1}">
                </div>
            `;
            var fontSel = content.querySelector('#hbx-avatar-font-sel');
            fontSel.value = localStorage.getItem('hbx_fuente_avatar') || fontSel.value;
            fontSel.addEventListener('change', function() {
                window.fuenteAvatar = fontSel.value;
                localStorage.setItem('hbx_fuente_avatar', fontSel.value);
            });
            var gjSlider = content.querySelector('#hbx-grosor-jugador-slider');
            gjSlider.addEventListener('input', function() {
                var v = parseFloat(gjSlider.value);
                window.grosorJugador = v;
                localStorage.setItem('hbx_grosor_jugador', v);
            });
            var avatarMount = document.createElement('div');
            avatarMount.className = 'hbx-native-wrap';
            content.appendChild(avatarMount);
            if (window.hbxRenderAvatarTweaks) window.hbxRenderAvatarTweaks(avatarMount, 'avatar');
            else montarSeccionNativaEnTweaks(container, 'avatarsec', 'avatarbtn');
        }
        else if (id === 'scoreboard') {
            // MARCADOR: Estilo Clásico, Premier League, Mundial
            var curStyle = localStorage.getItem('hbx_scoreboard_style') || 'classic';
            content.innerHTML = `
                <div class="hbx-option-card">
                    <div class="hbx-option-body">
                        <div class="hbx-option-name">Estilo de Marcador</div>
                        <div class="hbx-option-desc">Elige el diseño visual del marcador superior.</div>
                    </div>
                    <select id="hbx-score-style-sel" style="padding:6px 10px;border:1px solid #eaecf0;border-radius:8px;font-weight:600;">
                        <option value="classic">Clásico HaxBion</option>
                        <option value="premier">Premier League</option>
                        <option value="worldcup">Copa del Mundo</option>
                        <option value="haxball">Nativo Haxball</option>
                    </select>
                </div>
            `;
            var scSel = content.querySelector('#hbx-score-style-sel');
            scSel.value = curStyle;
            scSel.addEventListener('change', function() {
                localStorage.setItem('hbx_scoreboard_style', scSel.value);
            });
            montarSeccionNativaEnTweaks(container, 'scoreboard-section', 'scoreboardbtn');
        }
        else if (id === 'interface') {
            var ifaceEnabled = localStorage.getItem('hbx_interfaz_bg_enabled') !== '0';
            var ifacePreset = localStorage.getItem('hbx_interfaz_bg_preset') || 'estadio';
            content.innerHTML = '<div class="hbx-option-card hbx-interface-card"><div class="hbx-option-body"><div class="hbx-option-name">Fondo de interfaz</div><div class="hbx-option-desc">Elegí el fondo detrás de la lista de salas y de toda la aplicación.</div></div><div class="hbx-interface-preview"></div></div><div class="hbx-interface-actions"><button type="button" class="hbx-interface-choice" data-bg="normal">Normal</button><button type="button" class="hbx-interface-choice" data-bg="stadium">Estadio</button><label class="hbx-interface-upload">Subir imagen<input type="file" accept="image/*" id="hbx-interface-file" hidden></label></div>';
            var ifacePreview = content.querySelector('.hbx-interface-preview');
            var ifaceChoices = content.querySelectorAll('.hbx-interface-choice');
            function ifacePaint(data) {
                document.body.style.setProperty('background-image', 'linear-gradient(rgba(8,12,24,.24), rgba(8,12,24,.34)), url("' + data + '")', 'important');
                document.body.style.setProperty('background-size', 'cover', 'important');
                document.body.style.setProperty('background-position', 'center center', 'important');
                document.body.style.setProperty('background-attachment', 'fixed', 'important');
                document.body.style.setProperty('background-repeat', 'no-repeat', 'important');
                if (ifacePreview) ifacePreview.style.backgroundImage = 'url("' + data + '")';
            }
            function ifaceNormal() {
                localStorage.setItem('hbx_interfaz_bg_enabled', '0');
                localStorage.removeItem('hbx_interfaz_bg_data'); localStorage.removeItem('hbx_interfaz_bg_preset');
                ['background-image','background-size','background-position','background-attachment','background-repeat'].forEach(function (p) { document.body.style.removeProperty(p); });
                if (ifacePreview) ifacePreview.style.backgroundImage = '';
                ifaceChoices.forEach(function (b) { b.classList.toggle('active', b.dataset.bg === 'normal'); });
            }
            function ifaceStadium() {
                aDataUrl('assets/interface/estadio.jpg').then(function (data) {
                    localStorage.setItem('hbx_interfaz_bg_enabled', '1'); localStorage.setItem('hbx_interfaz_bg_preset', 'estadio'); localStorage.removeItem('hbx_interfaz_bg_data');
                    ifacePaint(data); ifaceChoices.forEach(function (b) { b.classList.toggle('active', b.dataset.bg === 'stadium'); });
                });
            }
            ifaceChoices.forEach(function (b) { b.addEventListener('click', function () { b.dataset.bg === 'normal' ? ifaceNormal() : ifaceStadium(); }); });
            content.querySelector('#hbx-interface-file').addEventListener('change', function (ev) {
                var file = ev.target.files && ev.target.files[0]; if (!file) return;
                var reader = new FileReader(); reader.onload = function () { var data = reader.result; localStorage.setItem('hbx_interfaz_bg_enabled', '1'); localStorage.removeItem('hbx_interfaz_bg_preset'); localStorage.setItem('hbx_interfaz_bg_data', data); ifacePaint(data); ifaceChoices.forEach(function (b) { b.classList.remove('active'); }); }; reader.readAsDataURL(file);
            });
            if (!ifaceEnabled) ifaceNormal(); else if (ifacePreset === 'estadio') ifaceStadium(); else { var savedIface = localStorage.getItem('hbx_interfaz_bg_data'); if (savedIface) ifacePaint(savedIface); else ifaceStadium(); }
        }
        else if (id === 'keys') {
            // INDICADOR DE TECLAS
            var isKeyInd = localStorage.getItem('hbx_keyind_enabled') === '1';
            content.innerHTML = `
                <div class="hbx-option-card" id="hbx-keyind-card">
                    <div class="hbx-checkbox ${isKeyInd ? 'checked' : ''}">${isKeyInd ? ICONS.check : ''}</div>
                    <div class="hbx-option-body">
                        <div class="hbx-option-name">Activar indicador de teclas</div>
                        <div class="hbx-option-desc">Muestra en pantalla las teclas presionadas en tiempo real.</div>
                    </div>
                </div>
            `;
            content.querySelector('#hbx-keyind-card').addEventListener('click', function() {
                isKeyInd = !isKeyInd;
                localStorage.setItem('hbx_keyind_enabled', isKeyInd ? '1' : '0');
                var cb = this.querySelector('.hbx-checkbox');
                cb.className = 'hbx-checkbox ' + (isKeyInd ? 'checked' : '');
                cb.innerHTML = isKeyInd ? ICONS.check : '';
            });
        }

        // ── Cancha: el boton abre el selector con las vistas previas ──
        if (id === 'pitch') {
            var btnCancha = content.querySelector('#hbx-fieldbg-toggle-btn');
            if (btnCancha) {
                btnCancha.innerText = 'Abrir presets';
                btnCancha.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    abrirSelectorCanchas(container);
                });
            }
        }

        // ── Pelota: idem, pero primero muestra las subsecciones ──
        if (id === 'ball' && !content.querySelector('#hbx-btn-pelota-presets')) {
            var cardPelota = document.createElement('div');
            cardPelota.className = 'hbx-option-card';
            cardPelota.id = 'hbx-btn-pelota-presets';
            cardPelota.style.cursor = 'pointer';
            cardPelota.innerHTML =
                '<div class="hbx-option-body">' +
                    '<div class="hbx-option-name">Pelotas personalizadas</div>' +
                    '<div class="hbx-option-desc">Elegí una tanda y mirá los modelos.</div>' +
                '</div>' +
                '<div class="hbx-card-chevron">' + ICONS.chevron + '</div>';
            content.insertBefore(cardPelota, content.firstChild);
            cardPelota.addEventListener('click', function () {
                abrirCategoriasPelotas(container);
            });
        }

        if (id === 'sounds') {
            // SONIDOS
            content.innerHTML = `
                <div class="hbx-option-card">
                    <div class="hbx-option-body">
                        <div class="hbx-option-name">Efectos de sonido personalizados</div>
                        <div class="hbx-option-desc">Sonidos de patada, postes y goles optimizados.</div>
                    </div>
                </div>
            `;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 7. OBSERVER & INICIALIZACIÓN
    // ─────────────────────────────────────────────────────────────────────────────
    function scanAndApply() {
        injectSkinCSS();

        var roomlistView = document.querySelector('.roomlist-view .dialog');
        if (roomlistView) enhanceRoomListView(roomlistView);

        var settingsView = document.querySelector('.dialog.settings-view');
        if (settingsView) enhanceSettingsDialog(settingsView);
    }

    var observer = new MutationObserver(function () {
        scanAndApply();
    });

    function init() {
        injectSkinCSS();
        scanAndApply();
        if (document.body) {
            observer.observe(document.body, { childList: true, subtree: true });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
