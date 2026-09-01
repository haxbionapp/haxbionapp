(function() {
    if (window.__TLS_ULTRA_MEDIA_V9) return;
    window.__TLS_ULTRA_MEDIA_V9 = true;

    const CONFIG = {
        urlRx: /(https?:\/\/[^\s<>"']+|www\.[^\s<>"']+\.[^\s<>"']+)/gi,
        ytRx: /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i,
        twRx: /clips\.twitch\.tv\/([a-zA-Z0-9_-]+)/i,
        imgRx: /\.(jpeg|jpg|gif|png|webp|svg|bmp)$/i,
        hosts: ['discordapp', 'imgur', 'postimg', 'giphy', 'tenor', 'ibb.co']
    };

    const THEME = {
        youtube: '#ff4e4e',
        twitch: '#a855f7',
        image: '#60a5fa',
        room: '#4ade80',
        default: '#94a3b8'
    };

    const processed = new WeakSet();
    let hoverTimer = null;

    const STYLE = document.createElement('style');
    STYLE.textContent = `
        .chat-link { cursor: pointer !important; font-weight: 500; text-decoration: none; transition: filter 0.2s; }
        .chat-link:hover { text-decoration: underline !important; filter: brightness(1.3); }
        #tl-portal-v9 { 
            position: fixed; z-index: 999999; pointer-events: none; display: none; opacity: 0;
            background: rgba(0,0,0,0.95); border: 1px solid #333; border-radius: 10px;
            box-shadow: 0 15px 50px rgba(0,0,0,0.9); transition: opacity 0.15s;
        }
        #tl-portal-v9 img { max-width: 320px; max-height: 240px; display: block; border-radius: 9px; object-fit: contain; }
    `;
    document.head.appendChild(STYLE);

    const portal = document.createElement('div');
    portal.id = 'tl-portal-v9';
    const pImg = document.createElement('img');
    portal.appendChild(pImg);
    document.body.appendChild(portal);

    const getLinkMeta = (href) => {
        const yt = href.match(CONFIG.ytRx);
        if (yt) return { color: THEME.youtube, prev: `https://img.youtube.com/vi/${yt[1]}/mqdefault.jpg` };
        
        const tw = href.match(CONFIG.twRx);
        if (tw) return { color: THEME.twitch, prev: `https://clips-media-assets2.twitch.tv/AT-cm%7C${tw[1]}-preview-480x272.jpg` };
        
        if (CONFIG.imgRx.test(href) || CONFIG.hosts.some(h => href.includes(h))) return { color: THEME.image, prev: href };
        if (href.includes('haxball.com/play?c=')) return { color: THEME.room, prev: null };
        
        return { color: THEME.default, prev: null };
    };

    const process = (node) => {
        if (!node || processed.has(node)) return;
        processed.add(node);
        const text = node.textContent;
        if (!text.match(CONFIG.urlRx)) return;

        node.innerHTML = text.replace(CONFIG.urlRx, (url) => {
            const href = url.startsWith('http') ? url : 'https://' + url;
            const meta = getLinkMeta(href);
            const previewAttr = meta.prev ? `data-preview="${meta.prev}"` : '';
            return `<span class="chat-link" data-href="${href}" ${previewAttr} style="color: ${meta.color} !important;">${url}</span>`;
        });
    };

    const obs = new MutationObserver(ms => {
        for (let m of ms) for (let n of m.addedNodes) {
            if (n.nodeType === 1) {
                if (n.tagName === 'P') process(n);
                else n.querySelectorAll?.('p').forEach(process);
            }
        }
    });
    obs.observe(document.body, { childList: true, subtree: false });

    document.addEventListener('mouseover', e => {
        const t = e.target;
        if (t.dataset?.preview) {
            clearTimeout(hoverTimer);
            hoverTimer = setTimeout(() => {
                pImg.src = t.dataset.preview;
                portal.style.display = 'block';
                const r = t.getBoundingClientRect();
                let x = r.right + 15;
                if (x + 330 > window.innerWidth) x = r.left - 335;
                let y = Math.max(10, Math.min(r.top - 50, window.innerHeight - 250));
                portal.style.left = `${x}px`;
                portal.style.top = `${y}px`;
                portal.style.opacity = '1';
            }, 100);
        }
    }, true);

    document.addEventListener('mouseout', e => {
        if (e.target.dataset?.preview) {
            clearTimeout(hoverTimer);
            portal.style.opacity = '0';
            setTimeout(() => { if(portal.style.opacity === '0') portal.style.display = 'none'; }, 150);
        }
    }, true);

    document.addEventListener('click', e => {
        const t = e.target;
        if (t.classList.contains('chat-link')) {
            const href = t.dataset.href;
            if (href.includes('haxball.com/play?c=')) {
                window.top.location.href = href;
            } else {
                navigator.clipboard.writeText(href).then(() => {
                    const old = t.textContent;
                    t.textContent = '¡Copiado!';
                    setTimeout(() => t.textContent = old, 800);
                });
            }
        }
    }, true);
})();