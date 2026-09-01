(function() {
    'use strict';
    if (Injector.isMainFrame()) return;

    var VERSION = '3.0';
    // Link de invitacion al Discord de la comunidad: es publico, no es una
    // credencial (no da acceso a nada por si solo, cualquiera lo puede
    // compartir libremente) — a diferencia de un webhook o un token, que si
    // hay que mantener fuera del cliente.
    var DISCORD_URL = 'https://discord.gg/w7BpFuFKr4';
    var SEEN_KEY = 'haxball_welcome_seen';
    var currentPage = 0;

    function showLinkFallback(url) {
        var old = document.getElementById('hbx-link-fallback');
        if (old) old.remove();

        var box = document.createElement('div');
        box.id = 'hbx-link-fallback';
        box.style.cssText = 'position:fixed; inset:0; z-index:2147483646; background:rgba(0,0,0,0.82); display:flex; align-items:center; justify-content:center; font-family:\'Outfit\',\'Inter\',sans-serif;';
        box.innerHTML =
            '<div style="position:relative; width:460px; max-width:90vw; background:#0b0b0d; border:1px solid rgba(255,255,255,0.14); border-radius:6px; padding:32px 30px; color:#f2f2f5;">' +
                '<button id="hbx-lf-x" title="Cerrar" style="position:absolute; top:10px; left:12px; width:26px; height:26px; border:none; background:transparent; color:#8b8b96; font-size:18px; line-height:1; cursor:pointer; border-radius:4px;">&#10005;</button>' +
                '<h3 style="margin:6px 0 10px 0; font-size:18px; font-weight:800; text-align:center;">Abrí este link en tu navegador</h3>' +
                '<p style="margin:0 0 18px 0; font-size:12.5px; color:#8b8b96; line-height:1.6; text-align:center;">No se pudo abrir el navegador automáticamente. Copiá este link y pegalo en Chrome, Edge o Firefox.</p>' +
                '<input id="hbx-lf-url" readonly style="width:100%; box-sizing:border-box; background:#141418; border:1px solid rgba(255,255,255,0.16); border-radius:5px; color:#f2f2f5; padding:11px 12px; font-size:11.5px; margin-bottom:14px;" />' +
                '<button id="hbx-lf-copy" style="width:100%; background:#f2f2f5; color:#08080a; border:none; padding:13px; border-radius:5px; font-weight:800; font-size:12px; letter-spacing:1.2px; text-transform:uppercase; cursor:pointer;">Copiar link</button>' +
            '</div>';
        document.body.appendChild(box);

        // El valor se setea via propiedad (no interpolado en el HTML de
        // arriba), para que la URL no pueda escaparse del atributo e
        // inyectar HTML/JS sin importar que caracteres tenga.
        var input = box.querySelector('#hbx-lf-url');
        input.value = url;
        var copyBtn = box.querySelector('#hbx-lf-copy');
        copyBtn.addEventListener('click', function () {
            try {
                input.select();
                input.setSelectionRange(0, 99999);
                document.execCommand('copy');
                copyBtn.textContent = '¡Copiado!';
                setTimeout(function () { copyBtn.textContent = 'Copiar link'; }, 1800);
            } catch (e) {}
        });
        box.querySelector('#hbx-lf-x').addEventListener('click', function () { box.remove(); });
        box.addEventListener('click', function (e) { if (e.target === box) box.remove(); });
    }

    function openExternal(url) {
        var settled = false;
        function fallback() {
            if (settled) return;
            settled = true;
            showLinkFallback(url);
        }
        try {
            var ws = new WebSocket('ws://127.0.0.1:3000');
            var timer = setTimeout(fallback, 3000);
            ws.onopen = function () {
                try { ws.send(JSON.stringify({ type: 'open_external', url: url })); } catch (e) {}
            };
            ws.onmessage = function (ev) {
                var msg = null;
                try { msg = JSON.parse(ev.data); } catch (e) { return; }
                if (!msg || msg.type !== 'open_external_result') return;
                clearTimeout(timer);
                if (msg.ok) {
                    settled = true;
                } else {
                    fallback();
                }
                setTimeout(function () { try { ws.close(); } catch (e) {} }, 200);
            };
            ws.onerror = function () {
                clearTimeout(timer);
                fallback();
            };
        } catch (e) {
            fallback();
        }
    }

    var icCheck   = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
    var icStar    = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--theme-text-secondary,#888)" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>';
    var icPin     = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>';
    var icGlobe   = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--theme-text-secondary,#888)" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
    var icSearch  = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--theme-text-secondary,#888)" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>';
    var icLock    = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--theme-text-secondary,#888)" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
    var icPerf    = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--theme-text-secondary,#888)" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>';
    var icShield  = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0080ff" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>';
    var icMessage = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0080ff" stroke-width="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
    var icZap     = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0080ff" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>';

    function list(items) {
        var h = '<div style="display:flex;flex-direction:column;gap:11px;margin-top:4px;">';
        for (var i = 0; i < items.length; i++) {
            h += '<div style="display:flex;align-items:flex-start;gap:10px;">' +
                '<div style="flex-shrink:0;margin-top:1px;">' + items[i].icon + '</div>' +
                '<span style="color:var(--theme-text-primary,#ddd);font-size:13px;line-height:1.55;">' + items[i].text + '</span>' +
                '</div>';
        }
        return h + '</div>';
    }

    function shortcuts(items) {
        var h = '<div style="display:flex;flex-direction:column;gap:8px;margin-top:4px;">';
        for (var i = 0; i < items.length; i++) {
            h += '<div style="display:flex;align-items:center;gap:12px;">' +
                '<kbd style="background:var(--theme-bg-tertiary,#272727);border:1px solid var(--theme-border,#333);border-radius:5px;padding:3px 8px;font-size:11px;color:var(--theme-text-primary,#fff);white-space:nowrap;font-family:monospace;min-width:90px;text-align:center;flex-shrink:0;">' + items[i].key + '</kbd>' +
                '<span style="color:var(--theme-text-primary,#ccc);font-size:13px;">' + items[i].desc + '</span>' +
                '</div>';
        }
        return h + '</div>';
    }

    function commands(items) {
        var h = '<div style="display:flex;flex-direction:column;gap:8px;margin-top:4px;">';
        for (var i = 0; i < items.length; i++) {
            h += '<div style="display:flex;align-items:center;gap:12px;">' +
                '<code style="background:var(--theme-bg-tertiary,#272727);border:1px solid var(--theme-border,#333);border-radius:5px;padding:3px 9px;font-size:11px;color:#4ade80;white-space:nowrap;font-family:monospace;min-width:140px;flex-shrink:0;">' + items[i].cmd + '</code>' +
                '<span style="color:var(--theme-text-primary,#ccc);font-size:13px;">' + items[i].desc + '</span>' +
                '</div>';
        }
        return h + '</div>';
    }

    var PAGES = [
        {
            title: 'Novedades de la versión ' + VERSION,
            icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
            render: function() {
                return list([
                    { icon: icZap, text: '<b>Extensión para Chrome</b> — ahora podés usar HaxBion directamente en tu navegador, sin instalar la app de escritorio.' },
                    { icon: icCheck, text: '<b>Tu avatar ya se ve en la cancha</b> — la foto no se dibujaba sobre tu jugador porque el cliente no lograba reconocer cuál disco era el tuyo. Arreglado.' },
                    { icon: icStar, text: '<b>Estela del jugador</b> — nunca había llegado a funcionar por ese mismo problema. Ya se puede activar desde Configuración → Avatares.' },
                    { icon: icPerf, text: '<b>Foto de fondo sin tirones</b> — la imagen se reescalaba entera en cada cuadro y hundía los FPS. Ahora se prepara una sola vez al cargarla.' },
                    { icon: icShield, text: '<b>Avatar con video/GIF retirado</b> — la función se quitó porque el cliente no puede animarla sobre tu disco. La foto fija sigue igual que siempre.' }
                ]);
            }
        },
        {
            title: 'Novedades de la versión 2.0',
            icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
            render: function() {
                return list([
                    { icon: icZap, text: '<b>Foto en la pelota</b> — subí una imagen y personalizala con zoom y ajuste desde Configuración → Avatares.' },
                    { icon: icCheck, text: '<b>Avatar automático</b> — ya no hace falta escribir /avatar, tu foto se activa sola al entrar a una sala.' },
                    { icon: icStar, text: '<b>Sistema de Misiones</b> — nuevo botón con trofeo en el menú: racha de conexión diaria, racha de partidos jugados y contador total.' },
                    { icon: icPerf, text: '<b>Botón de actualización</b> — el ícono azul del menú te avisa apenas hay una versión nueva disponible.' },
                    { icon: icPerf, text: '<b>Rendimiento</b> — se optimizó el dibujado del juego (menos uso de CPU durante los partidos).' }
                ]);
            }
        },
        {
            title: 'Nuevas Funciones',
            icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
            render: function() {
                return list([
                    { icon: icShield, text: '<b>Fake Ping</b> — Puedes colocarte el ping que tu quieras.' },
                    { icon: icMessage, text: '<b>Chat Bubbles</b> — Visualiza como si estuvieras escribiendo siempre.' }
                ]);
            }
        },
        {
            title: 'Atajos de Teclado',
            icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10"/></svg>',
            render: function() {
                return shortcuts([
                    { key: 'Alt + R', desc: 'Recargar el juego instantáneamente' },
                    { key: 'Alt + F', desc: 'Activar / Desactivar Pantalla Completa' },
                    { key: 'F2', desc: 'Mostrar / ocultar el header superior' },
                    { key: 'F8', desc: 'Abrir Menu Con Funciones en Modo Beta' },
                    { key: 'Ctrl + F', desc: 'Enfocar la búsqueda de salas' },
                    { key: 'Esc', desc: 'Limpiar búsqueda / cerrar menús / diálogos' },
                    { key: 'Click derecho', desc: 'Menú contextual sobre una sala' }
                ]);
            }
        },
        {
            title: 'Únete a la Comunidad',
            icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
            render: function() {
                return '<div style="text-align:center; padding: 10px 0;">' +
                    '<div style="color:var(--theme-text-secondary,#888);font-size:14px;line-height:1.7;margin-bottom:20px;">Forma parte de nuestro Discord oficial para obtener las últimas actualizaciones, reportar bugs y participar en la comunidad.</div>' +
                    '<a href="' + DISCORD_URL + '" id="wp-discord-link" onmouseenter="this.style.transform=\'translateY(-2px)\';this.style.boxShadow=\'0 8px 22px rgba(88,101,242,0.45)\';" onmouseleave="this.style.transform=\'translateY(0)\';this.style.boxShadow=\'0 4px 14px rgba(88,101,242,0.3)\';" style="background:linear-gradient(135deg,#5865F2,#4752C4); color:#fff; padding:13px 28px; border-radius:9px; text-decoration:none; font-weight:800; font-size:13.5px; letter-spacing:0.3px; display:inline-flex; align-items:center; gap:9px; box-shadow:0 4px 14px rgba(88,101,242,0.3); transition:transform 0.2s ease, box-shadow 0.2s ease;">' +
                        '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>' +
                        'ENTRAR AL DISCORD' +
                    '</a>' +
                '</div>';
            }
        },
        {
            title: 'Lista de Salas',
            icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
            render: function() {
                return list([
                    { icon: icStar, text: '<b>Favoritos</b> — click derecho sobre una sala → Añadir Favorito. El ícono del sidebar los filtra.' },
                    { icon: icPin,  text: '<b>Fijar arriba</b> — click derecho → Fijar en el Topo. La sala queda siempre primera.' },
                    { icon: icGlobe, text: '<b>Filtro de país</b> — el botón del globo filtra salas por bandera.' },
                    { icon: icSearch, text: '<b>Búsqueda</b> — escribe para filtrar en tiempo real. Ctrl+F la enfoca desde cualquier lugar.' },
                    { icon: icLock, text: '<b>Salas con contraseña</b> — aparecen con menor opacidad para distinguirlas.' }
                ]);
            }
        },
        {
            title: 'Rendimiento',
            icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
            render: function() {
                return list([
                    { icon: icPerf, text: '<b>Líneas simplificadas</b> — reduce grosor de líneas del campo de 3px a 1px' },
                    { icon: icPerf, text: '<b>Curvas en rectas</b> — elimina suavizado de curvas para mayor FPS' },
                    { icon: icPerf, text: '<b>Culling de viewport</b> — no dibuja objetos fuera de pantalla' },
                    { icon: icPerf, text: '<b>Campo simplificado</b> — colores sólidos en lugar de texturas' },
                    { icon: icPerf, text: '<b>Desactivar avatares</b> — elimina avatares y colores personalizados' },
                    { icon: icPerf, text: '<b>Alta prioridad</b> — otorga más recursos del sistema al juego' },
                    { icon: icPerf, text: '<b>Límite FPS</b> — fijá el framerate según tu monitor (30/60/75/144...)' }
                ]) +
                '<div style="margin-top:14px;padding:10px 12px;background:rgba(255,255,255,0.03);border:1px solid var(--theme-border,#232323);border-radius:6px;color:var(--theme-text-secondary,#666);font-size:11px;">Exportá e importá tu configuración desde la pestaña Rendimiento para compartir con amigos.</div>';
            }
        },
        {
            title: 'Comandos del Chat',
            icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
            render: function() {
                return commands([
                    { cmd: '/avatar [texto]',  desc: 'Cambiar tu avatar de texto' },
                    { cmd: '/input [ms]',      desc: 'Simular input lag (ej: /input 50)' },
                    { cmd: '/nick [nombre]',   desc: 'Cambiar tu nombre en sala' },
                    { cmd: '/help',            desc: 'Ver todos los comandos disponibles' },
                    { cmd: '/fakeping',        desc: 'Poner Ping Falso (Unicamente Visual)' },
                    { cmd: '/chatbubble',      desc: 'Activar el Escribir Siempre' }
                ]);
            }
        }
    ];

    function renderPage(popup, index) {
        var page = PAGES[index];
        var isFirst = index === 0;
        var isLast  = index === PAGES.length - 1;

        popup.innerHTML =
            '<div style="padding:18px 22px 16px;border-bottom:1px solid var(--theme-border,#222);display:flex;align-items:center;gap:12px;">' +
                '<div style="color:var(--theme-text-secondary,#666);">' + page.icon + '</div>' +
                '<span style="color:var(--theme-text-primary,#fff);font-size:16px;font-weight:600;flex:1;">' + page.title + '</span>' +
                '<span style="color:var(--theme-text-secondary,#444);font-size:11px;">' + (index + 1) + ' / ' + PAGES.length + '</span>' +
            '</div>' +
            '<div style="padding:20px 22px;overflow-y:auto;max-height:360px;">' +
                page.render() +
            '</div>' +
            '<div style="padding:14px 22px;border-top:1px solid var(--theme-border,#222);display:flex;justify-content:space-between;align-items:center;">' +
                '<div style="display:flex;gap:6px;">' +
                    (function() {
                        var dots = '';
                        for (var i = 0; i < PAGES.length; i++) {
                            dots += '<div style="width:' + (i === index ? '16' : '6') + 'px;height:6px;border-radius:3px;background:' + (i === index ? 'var(--theme-text-primary,#fff)' : 'var(--theme-border,#333)') + ';transition:all .2s;"></div>';
                        }
                        return dots;
                    })() +
                '</div>' +
                '<div style="display:flex;gap:8px;">' +
                    '<button id="wp-prev" style="padding:8px 16px;background:var(--theme-bg-secondary,#1a1a1a);border:1px solid var(--theme-border,#333);border-radius:6px;color:' + (isFirst ? 'var(--theme-text-secondary,#444)' : 'var(--theme-text-primary,#ccc)') + ';font-size:12px;cursor:' + (isFirst ? 'default' : 'pointer') + ';" ' + (isFirst ? 'disabled' : '') + '>Anterior</button>' +
                    '<button id="wp-next" style="padding:8px 20px;background:var(--theme-text-primary,#fff);border:none;border-radius:6px;color:#000;font-size:12px;font-weight:600;cursor:pointer;">' + (isLast ? 'Comenzar ✓' : 'Siguiente') + '</button>' +
                '</div>' +
            '</div>';

        popup.querySelector('#wp-prev').onclick = function() {
            if (index > 0) { currentPage--; renderPage(popup, currentPage); }
        };
        popup.querySelector('#wp-next').onclick = function() {
            if (isLast) { close(); } else { currentPage++; renderPage(popup, currentPage); }
        };

        var discordLink = popup.querySelector('#wp-discord-link');
        if (discordLink) {
            discordLink.addEventListener('click', function(e) {
                e.preventDefault();
                openExternal(DISCORD_URL);
            });
        }
    }

    function close() {
        var el = document.getElementById('wp-overlay');
        if (el) el.remove();
        localStorage.setItem(SEEN_KEY, VERSION);
    }

    function show() {
        if (document.getElementById('wp-overlay')) return;
        currentPage = 0;

        var overlay = document.createElement('div');
        overlay.id = 'wp-overlay';
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:99999;display:flex;align-items:center;justify-content:center;font-family:\'Outfit\',\'Inter\',sans-serif;';
        overlay.onclick = function(e) { if (e.target === overlay) close(); };

        var popup = document.createElement('div');
        popup.style.cssText = 'background:var(--theme-bg-primary,#111);border:1px solid var(--theme-border,#252525);border-radius:12px;width:540px;max-width:94vw;box-shadow:0 24px 80px rgba(0,0,0,0.7);';

        renderPage(popup, 0);
        overlay.appendChild(popup);
        document.body.appendChild(overlay);

        document.addEventListener('keydown', function onKey(e) {
            if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onKey); }
            if (e.key === 'ArrowRight' && currentPage < PAGES.length - 1) { currentPage++; renderPage(popup, currentPage); }
            if (e.key === 'ArrowLeft'  && currentPage > 0)                 { currentPage--; renderPage(popup, currentPage); }
        });
    }

    window.__showWelcomePopup  = show;
    window.__closeWelcomePopup = close;

    window.addEventListener('message', function(e) {
        if (e.data && (e.data.type === 'HBX_SHOW_WELCOME' || e.data.action === 'SHOW_WELCOME')) {
            show();
        }
    });

    Injector.waitForElement('body').then(function() {
        // BUG REAL: esto llamaba a show() SIEMPRE, sin importar SEEN_KEY.
        // close() guardaba "ya lo vi" en localStorage, pero nada lo leia
        // antes de decidir mostrar el popup de nuevo — por eso aparecia en
        // cada entrada aunque ya lo hubieras cerrado. Ahora se respeta el
        // dato que ya se estaba guardando: si la version guardada coincide
        // con la actual, no se muestra.
        if (localStorage.getItem(SEEN_KEY) === VERSION) return;
        setTimeout(show, 600);
    });
})();