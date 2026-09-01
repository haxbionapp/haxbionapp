(function () {
    if (window.__HAXBALL_PERFOPTS_LOADED__) return;
    window.__HAXBALL_PERFOPTS_LOADED__ = true;

    // Opciones extra de rendimiento de HaxBion.
    //
    // Importante: aca SOLO hay opciones que realmente hacen algo medible.
    // Cada una apaga trabajo concreto que el navegador estaria haciendo
    // (repintados, composicion de capas, calculos de estilo). Todas empiezan
    // APAGADAS y se pueden revertir en cualquier momento — no tocan el motor
    // del juego ni la jugabilidad, solo la parte visual de la interfaz.

    var STYLE_ID = 'hbx-perf-opts-style';

    var OPTIONS = {
        // Quita sombras y degradados decorativos de la interfaz. Las sombras
        // grandes son de lo mas caro de pintar porque obligan a redibujar
        // areas mucho mas grandes que el elemento en si.
        liteUi: {
            key: 'hbx_perf_lite_ui',
            css: [
                '*, *::before, *::after { box-shadow: none !important; text-shadow: none !important; }',
                '.hbx-card::after, #hbx-missions-panel::before, .dialog::before { display: none !important; }',
                '.hbx-chrome { background: none !important; -webkit-text-fill-color: currentColor !important; color: #f2f2f5 !important; }'
            ].join('\n')
        },

        // Desactiva TODAS las transiciones y animaciones de la interfaz.
        // Cada transicion activa es un elemento que el navegador tiene que
        // recomponer frame a frame mientras dura.
        noAnim: {
            key: 'hbx_perf_no_anim',
            css: [
                '*, *::before, *::after {',
                '  animation: none !important;',
                '  transition: none !important;',
                '}'
            ].join('\n')
        },

        // Elimina desenfoques de fondo (backdrop-filter) y filtros CSS. Es el
        // efecto mas caro de todos: fuerza al navegador a releer y desenfocar
        // lo que hay detras del elemento en cada frame.
        noBlur: {
            key: 'hbx_perf_no_blur',
            css: [
                '* { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }',
                'button:hover, .btn:hover, .action-btn:hover { filter: none !important; }'
            ].join('\n')
        },

        // Fuerza esquinas rectas. Los bordes redondeados obligan a recortar
        // (clipping) cada capa; con muchos elementos en pantalla suma.
        noRadius: {
            key: 'hbx_perf_no_radius',
            css: '*, *::before, *::after { border-radius: 0 !important; }'
        },

        // Apaga los efectos al pasar el mouse. Cada hover dispara recalculo de
        // estilo + repintado del elemento; moviendo el mouse por una lista de
        // salas larga eso se dispara decenas de veces por segundo.
        noHoverFx: {
            key: 'hbx_perf_no_hover',
            css: [
                'button:hover, .btn:hover, .action-btn:hover, a:hover {',
                '  filter: none !important;',
                '  transform: none !important;',
                '  box-shadow: none !important;',
                '}'
            ].join('\n')
        },

        // Simplifica el fondo de la interfaz a un color plano, sin degradados.
        // Un degradado grande se re-rasteriza cada vez que la capa cambia de
        // tamaño; un color solido es practicamente gratis.
        flatBg: {
            key: 'hbx_perf_flat_bg',
            css: [
                '#hbx-missions-panel, .hbx-card, .dialog {',
                '  background-image: none !important;',
                '}'
            ].join('\n')
        },

        // Opcion sin CSS: baja la frecuencia de los temporizadores internos de
        // HaxBion (marcador y misiones). El marcador se refresca 6-7 veces por
        // segundo por defecto; con esto pasa a ~2. Se nota apenas en el timer
        // pero libera bastante trabajo del hilo principal.
        //
        // NO afecta la foto del avatar, el color de la pelota ni la foto en la
        // pelota — esos no dependen de estos temporizadores.
        lowPoll: {
            key: 'hbx_perf_low_poll',
            css: ''
        }
    };

    function isOn(name) {
        var opt = OPTIONS[name];
        if (!opt) return false;
        try { return localStorage.getItem(opt.key) === '1'; } catch (e) { return false; }
    }

    function setOpt(name, enabled) {
        var opt = OPTIONS[name];
        if (!opt) return;
        try { localStorage.setItem(opt.key, enabled ? '1' : '0'); } catch (e) {}
    }

    // Construye una sola hoja de estilos con las opciones activas. Se usa un
    // unico <style> que se reescribe entero, en vez de agregar/quitar reglas
    // sueltas: es mas barato para el navegador y no deja restos.
    function apply() {
        var parts = [];
        for (var name in OPTIONS) {
            if (isOn(name) && OPTIONS[name].css) {
                parts.push('/* ' + name + ' */\n' + OPTIONS[name].css);
            }
        }

        // Aviso para los modulos que ajustan sus temporizadores (marcador,
        // misiones). Se emite siempre que se aplica, asi el cambio se nota al
        // instante sin tener que reiniciar la app.
        try {
            window.dispatchEvent(new CustomEvent('hbx-perf-changed'));
        } catch (e) {}

        var el = document.getElementById(STYLE_ID);
        if (!parts.length) {
            if (el && el.parentNode) el.parentNode.removeChild(el);
            return;
        }
        if (!el) {
            el = document.createElement('style');
            el.id = STYLE_ID;
            (document.head || document.documentElement).appendChild(el);
        }
        el.textContent = parts.join('\n\n');
    }

    // Propaga el cambio a todos los frames (la pagina principal y el iframe
    // del juego son origenes distintos con su propio DOM y localStorage).
    function applyEverywhere() {
        apply();
        var frames = [];
        try { if (window.top && window.top !== window) frames.push(window.top); } catch (e) {}
        for (var i = 0; i < window.frames.length; i++) {
            try { frames.push(window.frames[i]); } catch (e) {}
        }
        for (var j = 0; j < frames.length; j++) {
            try {
                if (frames[j]._hbxApplyPerfOpts) frames[j]._hbxApplyPerfOpts();
            } catch (e) {}
        }
    }

    window._hbxApplyPerfOpts = apply;
    window._hbxPerfOptIsOn = isOn;
    window._hbxPerfOptToggle = function (name) {
        var next = !isOn(name);
        setOpt(name, next);
        applyEverywhere();
        return next;
    };
    window._hbxPerfOptNames = Object.keys(OPTIONS);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', apply);
    } else {
        apply();
    }
})();
