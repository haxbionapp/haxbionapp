(function () {
    if (window.__HAXBALL_FLUIDUI_LOADED__) return;
    window.__HAXBALL_FLUIDUI_LOADED__ = true;

    // Capa visual de HaxBion: estetica monocroma (negro + plata) aplicada de
    // forma BARATA. Version reescrita para rendimiento — la anterior tenia
    // tres problemas serios que causaban bajones:
    //
    //   1. Una animacion infinita (brillo metalico recorriendo el texto) que
    //      repintaba sin parar aunque el panel estuviera cerrado.
    //   2. Selectores por subcadena tipo [class*="row"] / [class*="item"], que
    //      matcheaban cientos de elementos del juego (filas de chat, lista de
    //      salas, jugadores) y obligaban al navegador a recalcular estilos de
    //      todos ellos con cada cambio del DOM.
    //   3. backdrop-filter con blur grande, que es de los efectos mas caros
    //      que existen y se recompone en cada frame.
    //
    // Ahora: selectores concretos, cero animaciones en bucle, sin blur.
    var CSS = `
        /* Transiciones SOLO en elementos interactivos concretos, y solo en
           propiedades baratas de animar (color/opacidad/transform). */
        button, .btn, input, select, textarea {
            transition: background-color .15s ease,
                        border-color .15s ease,
                        color .15s ease,
                        transform .12s ease;
        }

        button:not(:disabled):hover, .btn:not(:disabled):hover {
            filter: brightness(1.15);
        }
        button:not(:disabled):active, .btn:not(:disabled):active {
            transform: scale(0.97);
        }
        button:focus-visible, input:focus-visible,
        select:focus-visible, textarea:focus-visible {
            outline: 1px solid rgba(255,255,255,0.45);
            outline-offset: 1px;
        }

        /* Dialogos: profundidad con sombra estatica (barata) en vez de blur. */
        .dialog {
            box-shadow: 0 20px 60px -12px rgba(0,0,0,0.85),
                        0 0 0 1px rgba(255,255,255,0.07);
        }

        input[type="text"], input[type="password"], input[type="number"],
        select, textarea {
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.10);
            border-radius: 7px;
            color: var(--theme-text-primary, #f2f2f5);
        }

        /* Scrollbar plateado (puramente declarativo, sin costo de runtime). */
        ::-webkit-scrollbar { width: 9px; height: 9px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
        ::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.28);
            border-radius: 9px;
            border: 2px solid transparent;
            background-clip: padding-box;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: rgba(255,255,255,0.55);
            background-clip: padding-box;
        }

        /* ---- Utilidades para los paneles de HaxBion ---- */

        /* Texto cromado: MISMO look metalico que antes, pero con un degradado
           estatico. El brillo animado quedaba lindo pero repintaba para
           siempre; esto se ve practicamente igual y cuesta cero. */
        .hbx-chrome {
            background: linear-gradient(135deg, #ffffff 0%, #b8b8c4 45%, #7a7a86 62%, #ffffff 100%);
            -webkit-background-clip: text; background-clip: text;
            color: transparent;
        }

        .hbx-card {
            position: relative;
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.09);
            border-radius: 12px;
        }
        .hbx-card::after {
            content: '';
            position: absolute; left: 0; top: 0; bottom: 0; width: 2px;
            border-radius: 12px 0 0 12px;
            background: linear-gradient(180deg, #ffffff, #6e6e7a);
        }

        @keyframes hbx-rise {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: none; }
        }

        @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
                animation-duration: .01ms !important;
                transition-duration: .01ms !important;
            }
        }
    `;

    if (typeof Injector !== 'undefined' && Injector.injectCSS) {
        Injector.injectCSS('hbx-fluid-ui', CSS);
    } else {
        var style = document.createElement('style');
        style.id = 'hbx-fluid-ui';
        style.textContent = CSS;
        (document.head || document.documentElement).appendChild(style);
    }
})();
