/* ==========================================================================
   Pano de fundo cinematográfico dirigido por rolagem

   O canvas é fixo e cobre a viewport atrás do site. A sequência de frames
   avança conforme o visitante percorre a página inteira — não apenas uma
   abertura. Rolar para cima retorna os frames.

   GSAP + ScrollTrigger fazem o scrub; Lenis faz o smooth scroll.
   Não há texto neste módulo: todo conteúdo visível é o HTML real do site.

   Enquanto assets/frames/ estiver vazio, desenha placeholders procedurais
   para que a mecânica possa ser testada sem os vídeos.
   ========================================================================== */

(function () {
    'use strict';

    var TOTAL_FRAMES = 150;
    var FRAME_PATH = './assets/frames/';

    // Paleta por trecho da jornada, alinhada às seções reais do site:
    // hero → soluções/automação → IA → infraestrutura → segurança/contato.
    var TINTS = [
        [6, 182, 212],
        [14, 165, 233],
        [99, 102, 241],
        [16, 185, 129],
        [6, 182, 212]
    ];

    var root = document.getElementById('cinematic');
    if (!root) return;

    // ----------------------------------------------------------------------
    // Capacidade do aparelho
    // ----------------------------------------------------------------------

    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // deviceMemory não existe em Safari/Firefox; ausência não indica aparelho fraco.
    var lowMemory = typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 4;
    // Mobile SEMPRE estático: o canvas com blur(7px) redesenhado por frame é
    // caro demais para GPU de celular, os 6,6 MB de frames pesam no 4G, e o
    // fundo desfocado quase não aparece atrás dos cards em viewport estreito.
    // O exploded view (a estrela) continua ativo no mobile.
    var useStatic = prefersReduced || window.innerWidth < 768 || lowMemory;

    // ----------------------------------------------------------------------
    // DOM
    // ----------------------------------------------------------------------

    var canvas = document.createElement('canvas');
    canvas.className = 'cine-canvas';
    canvas.setAttribute('aria-hidden', 'true'); // decorativo: leitores de tela ignoram

    var ctx = canvas.getContext('2d', { alpha: false });

    var veil = document.createElement('div');
    veil.className = 'cine-veil';

    root.appendChild(canvas);
    root.appendChild(veil);

    var progress = document.createElement('div');
    progress.className = 'cine-progress';
    document.body.appendChild(progress);

    // ----------------------------------------------------------------------
    // Canvas
    // ----------------------------------------------------------------------

    var currentFrame = 0;

    function resize() {
        var isMobile = window.innerWidth < 768;
        // Reduz a resolução interna no mobile para evitar sobrecarga de GPU e o bug
        // de textura pixelada no Android Chrome quando combinada com desfoque.
        var baseDpr = window.devicePixelRatio || 1;
        var dpr = isMobile ? Math.min(baseDpr, 0.5) : Math.min(baseDpr, 1); 
        
        canvas.width = Math.floor(window.innerWidth * dpr);
        canvas.height = Math.floor(window.innerHeight * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = isMobile ? 'low' : 'high';
        draw(currentFrame);
    }

    var images = new Array(TOTAL_FRAMES);
    var haveRealFrames = false;

    function framePath(i) {
        return FRAME_PATH + 'frame-' + String(i + 1).padStart(4, '0') + '.jpg';
    }

    function probeFrames() {
        return new Promise(function (resolve) {
            var probe = new Image();
            probe.onload = function () { resolve(true); };
            probe.onerror = function () { resolve(false); };
            probe.src = framePath(0);
        });
    }

    // Carregamento em duas ondas.
    // Disparar as 150 requisições de uma vez satura a conexão e atrasa o
    // primeiro frame. A primeira onda pega 1 a cada 5 (a sequência já fica
    // navegável, ainda que "saltada"); a segunda preenche o resto.
    function loadSequence() {
        var STEP = 5;
        var pending = [];

        function load(idx) {
            return new Promise(function (resolve) {
                var img = new Image();
                img.decoding = 'async';
                img.onload = function () {
                    images[idx] = img;
                    // Redesenha se este for justamente o frame em tela.
                    if (idx === currentFrame) draw(currentFrame);
                    resolve();
                };
                img.onerror = resolve; // um frame faltando não pode travar a onda
                img.src = framePath(idx);
            });
        }

        for (var i = 0; i < TOTAL_FRAMES; i += STEP) pending.push(i);

        Promise.all(pending.map(load)).then(function () {
            for (var j = 0; j < TOTAL_FRAMES; j++) {
                if (j % STEP !== 0) load(j);
            }
        });
    }

    // Quando o frame exato ainda não chegou, usa o mais próximo já carregado.
    // Sem isso a tela pisca em preto durante a primeira onda.
    function nearestLoaded(idx) {
        if (images[idx] && images[idx].complete) return images[idx];
        for (var d = 1; d < TOTAL_FRAMES; d++) {
            if (images[idx - d] && images[idx - d].complete) return images[idx - d];
            if (images[idx + d] && images[idx + d].complete) return images[idx + d];
        }
        return null;
    }

    function tintAt(t) {
        var n = TINTS.length - 1;
        var pos = Math.max(0, Math.min(t, 1)) * n;
        var i = Math.min(Math.floor(pos), n - 1);
        var local = pos - i;
        return TINTS[i].map(function (v, k) {
            return Math.round(v + (TINTS[i + 1][k] - v) * local);
        });
    }

    // Placeholder procedural — valida a mecânica antes dos vídeos existirem.
    function drawPlaceholder(frame) {
        var w = window.innerWidth;
        var h = window.innerHeight;
        var t = frame / Math.max(TOTAL_FRAMES - 1, 1);
        var c = tintAt(t);

        var g = ctx.createLinearGradient(0, 0, w, h);
        g.addColorStop(0, 'rgb(4,6,10)');
        g.addColorStop(0.5, 'rgba(' + c.join(',') + ',0.42)');
        g.addColorStop(1, 'rgb(4,6,10)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);

        ctx.save();
        ctx.globalAlpha = 0.16;
        ctx.strokeStyle = 'rgb(' + c.join(',') + ')';
        ctx.lineWidth = 1;
        for (var i = 0; i < 16; i++) {
            var y = ((i / 16 + t) % 1) * h;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }
        ctx.restore();
    }

    // Canvas auxiliar para o desfoque. Criado uma vez, reaproveitado.
    var blurCanvas = document.createElement('canvas');
    var blurCtx = blurCanvas.getContext('2d');

    // Fator de reducao. 1/8 do tamanho ja destroi a legibilidade do texto
    // de terminal do video sem apagar a composicao da cena.
    var BLUR_DOWNSCALE = 8;

    function drawCover(img) {
        var w = window.innerWidth;
        var h = window.innerHeight;
        var scale = Math.max(w / img.width, h / img.height);
        var dw = img.width * scale;
        var dh = img.height * scale;

        // Desfoque por reducao-e-reampliacao, feito NO CANVAS.
        //
        // Nao usar `filter: blur()` do CSS aqui: ele causa blocos pixelados
        // no Android Chrome (motivo pelo qual foi removido do CSS). Reduzir
        // e reampliar com imageSmoothing produz um borrao equivalente, sem
        // acionar aquele caminho bugado da GPU — e sai mais barato, porque
        // o custo e proporcional ao canvas pequeno, nao a viewport inteira.
        var bw = Math.max(1, Math.round(dw / BLUR_DOWNSCALE));
        var bh = Math.max(1, Math.round(dh / BLUR_DOWNSCALE));

        if (blurCanvas.width !== bw || blurCanvas.height !== bh) {
            blurCanvas.width = bw;
            blurCanvas.height = bh;
        }

        blurCtx.imageSmoothingEnabled = true;
        blurCtx.imageSmoothingQuality = 'low';
        blurCtx.drawImage(img, 0, 0, bw, bh);

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(blurCanvas, (w - dw) / 2, (h - dh) / 2, dw, dh);
    }

    function draw(frame) {
        var idx = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(frame)));
        currentFrame = idx;

        if (haveRealFrames) {
            var img = nearestLoaded(idx);
            if (img) { drawCover(img); return; }
        }
        drawPlaceholder(idx);
    }

    // ----------------------------------------------------------------------
    // Modo estático
    // ----------------------------------------------------------------------

    if (useStatic) {
        root.classList.add('cine-static');
        progress.style.display = 'none';
        return;
    }

    // ----------------------------------------------------------------------
    // Scroll
    // ----------------------------------------------------------------------

    function init() {
        if (!window.gsap || !window.ScrollTrigger) {
            console.warn('[cinematic] GSAP/ScrollTrigger ausentes — fundo estático.');
            root.classList.add('cine-static');
            progress.style.display = 'none';
            return;
        }

        gsap.registerPlugin(ScrollTrigger);

        var lenis = null;
        if (typeof window.Lenis === 'function') {
            lenis = new window.Lenis({
                duration: 0.6, // Reduzido de 1.1 para um scroll mais ágil
                easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
                smoothWheel: true,
                wheelMultiplier: 1.2, // Aumenta levemente a sensibilidade da rodinha do mouse
                // Em touch o scroll nativo é mais previsível e não briga com os modais.
                smoothTouch: false
            });

            lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
            gsap.ticker.lagSmoothing(0);

            // Exposto para exploded.js (ouve o scroll suavizado) e depuração.
            window.__lenis = lenis;
        }

        resize();

        // Debounce: refresh() recalcula tudo e é caro. Sem isso, arrastar a
        // borda da janela dispara dezenas de refreshes e a rolagem salta.
        //
        // Só LARGURA dispara o refresh pesado. No celular, recolher/mostrar a
        // barra de URL muda a ALTURA a cada rolagem — refresh + restauração de
        // scroll no meio do gesto era a causa de engasgos e pulos no mobile.
        var resizeTimer = null;
        var lastWidth = window.innerWidth;
        window.addEventListener('resize', function () {
            resize(); // redesenho do canvas é barato, sempre roda

            if (window.innerWidth === lastWidth) return;
            lastWidth = window.innerWidth;

            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                var keep = window.scrollY;
                if (lenis) lenis.resize();
                ScrollTrigger.refresh();
                if (Math.abs(window.scrollY - keep) > 2) {
                    if (lenis) lenis.scrollTo(keep, { immediate: true });
                    else window.scrollTo(0, keep);
                }
            }, 180);
        });

        // A sequência é dirigida pela rolagem da PÁGINA INTEIRA — é isso que
        // torna o site todo cinematográfico, e não só uma abertura.
        var seq = { frame: 0 };

        gsap.to(seq, {
            frame: TOTAL_FRAMES - 1,
            snap: 'frame',
            ease: 'none',
            scrollTrigger: {
                trigger: document.body,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 0.2, // Reduzido de 0.6 para os frames acompanharem mais de perto
                invalidateOnRefresh: true,
                onUpdate: function (self) {
                    progress.style.width = (self.progress * 100).toFixed(2) + '%';
                }
            },
            onUpdate: function () { draw(seq.frame); }
        });

        initDepth(lenis);
        ScrollTrigger.refresh();
    }

    // ----------------------------------------------------------------------
    // Profundidade 3D
    //
    // Cada card inclina e recua no eixo Z conforme sua distância do centro da
    // viewport. Quem está no centro fica reto e à frente; quem está entrando
    // ou saindo inclina e recua. É isso que produz a sensação de percorrer um
    // espaço, e não de rolar uma lista plana.
    // ----------------------------------------------------------------------

    var MAX_TILT = 9;     // graus na borda da viewport
    var MAX_DEPTH = -180; // px recuados no eixo Z na borda

    function initDepth(lenis) {
        // Sem tilt no mobile: rect-read por card por frame + transform 3D
        // sobre backdrop-filter custa caro em GPU de celular, e em tela
        // estreita (card ocupando a largura toda) o efeito mal se percebe.
        if (prefersReduced || window.innerWidth < 768) return;

        var cards = Array.prototype.slice.call(
            document.querySelectorAll('main .glass-card')
        );
        if (!cards.length) return;

        document.body.classList.add('cine-3d');

        var ticking = false;

        function apply() {
            ticking = false;
            var vh = window.innerHeight;
            var mid = vh / 2;

            for (var i = 0; i < cards.length; i++) {
                var el = cards[i];
                var r = el.getBoundingClientRect();

                // Ignora o que está fora da tela: getBoundingClientRect é barato,
                // mas escrever estilo em elemento invisível não é.
                if (r.bottom < -200 || r.top > vh + 200) continue;

                // -1 (topo da viewport) .. 0 (centro) .. +1 (base)
                var d = (r.top + r.height / 2 - mid) / mid;
                d = Math.max(-1, Math.min(1, d));

                // Curva quadrática: o centro fica plano por mais tempo, e a
                // inclinação cresce rápido só nas bordas. Linear parecia
                // "torto o tempo todo".
                var curve = d * Math.abs(d);

                el.style.setProperty('--tilt', (curve * MAX_TILT).toFixed(2) + 'deg');
                el.style.setProperty('--depth', (Math.abs(curve) * MAX_DEPTH).toFixed(1) + 'px');
            }
        }

        function request() {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(apply);
        }

        if (lenis) lenis.on('scroll', request);
        window.addEventListener('scroll', request, { passive: true });
        window.addEventListener('resize', request);

        apply();
    }

    probeFrames().then(function (found) {
        haveRealFrames = found;
        if (!found) {
            console.info('[cinematic] assets/frames/ vazio — placeholders procedurais ativos.');
        } else {
            loadSequence();
        }
        init();
    });
})();
