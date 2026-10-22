/* ==========================================================================
   Exploded View — vídeo do usuário como sequência de frames sob rolagem

   100 frames por formato: video_final.mp4 (desktop, 16:9) e
   video_vertical.mp4 (celular, 9:16). Ver FRAME_PATH abaixo.
   O progresso vem DIRETO de scrollY, sem GSAP nesta seção:
   - pin do ScrollTrigger aqui congelou o renderizador (bissectado);
   - refresh do ScrollTrigger sob Lenis mediu o trigger errado.
   Um getBoundingClientRect por frame é barato e imune a esses dois bugs.
   ========================================================================== */

(function () {
    'use strict';

    var TOTAL_FRAMES = 100;

    // Dois conjuntos de frames, um por formato de tela:
    //  - desktop: video_final.mp4  (16:9, 1024x576, ~5,2 MB)
    //  - celular: video_vertical.mp4 (9:16, 640x1138, ~4,1 MB)
    //
    // A escolha e feita UMA vez, no carregamento. Trocar de conjunto ao girar
    // o aparelho obrigaria a rebaixar 100 imagens no meio da navegacao — o
    // desenho ja lida com incompatibilidade de proporcao (ver draw()), entao
    // girar a tela degrada suavemente em vez de custar rede.
    var isMobile = window.matchMedia('(max-width: 767px)').matches;

    var FRAME_PATH = isMobile
        ? './assets/frames-exploded-mobile/'
        : './assets/frames-exploded/';

    var root = document.getElementById('exploded');
    if (!root) return;

    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ----------------------------------------------------------------------
    // DOM
    // ----------------------------------------------------------------------

    var stage = document.createElement('div');
    stage.className = 'exp-stage';

    var canvas = document.createElement('canvas');
    canvas.className = 'exp-canvas';
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label',
        'Programador digitando enquanto o notebook se desmonta em componentes — ' +
        'placa-mãe, chips e circuitos — e se remonta revelando inteligência artificial.');

    var ctx = canvas.getContext('2d', { alpha: false });

    // Canvas minúsculo para o fundo ambiente do modo retrato: desenhar o
    // frame em 24×14 e esticar produz o desfoque pelo rescalonamento.
    var backdrop = document.createElement('canvas');
    backdrop.width = 24;
    backdrop.height = 14;
    var bctx = backdrop.getContext('2d', { alpha: false });

    var vignette = document.createElement('div');
    vignette.className = 'exp-vignette';

    var copy = root.querySelector('.exp-copy');

    stage.appendChild(canvas);
    stage.appendChild(vignette);
    if (copy) stage.appendChild(copy);
    root.appendChild(stage);

    // ----------------------------------------------------------------------
    // Frames
    // ----------------------------------------------------------------------

    var images = new Array(TOTAL_FRAMES);
    var currentFrame = -1;

    function framePath(i) {
        return FRAME_PATH + 'frame-' + String(i + 1).padStart(4, '0') + (isMobile ? '.webp' : '.jpg');
    }

    // Duas ondas, como no cinematic: 1 a cada 5 primeiro (sequência já
    // navegável), depois o preenchimento.
    function loadSequence() {
        var STEP = 5;
        var firstWave = [];

        function load(idx) {
            return new Promise(function (resolve) {
                var img = new Image();
                img.decoding = 'async';
                img.onload = function () {
                    images[idx] = img;
                    if (idx === currentFrame) draw(currentFrame);
                    resolve();
                };
                img.onerror = resolve;
                img.src = framePath(idx);
            });
        }

        for (var i = 0; i < TOTAL_FRAMES; i += STEP) firstWave.push(i);

        Promise.all(firstWave.map(load)).then(function () {
            for (var j = 0; j < TOTAL_FRAMES; j++) {
                if (j % STEP !== 0) load(j);
            }
        });
    }

    function nearestLoaded(idx) {
        if (images[idx] && images[idx].complete) return images[idx];
        for (var d = 1; d < TOTAL_FRAMES; d++) {
            if (images[idx - d] && images[idx - d].complete) return images[idx - d];
            if (images[idx + d] && images[idx + d].complete) return images[idx + d];
        }
        return null;
    }

    function resize() {
        var isMobile = window.innerWidth < 768;
        var baseDpr = Math.min(window.devicePixelRatio || 1, 2);
        var dpr = isMobile ? Math.min(baseDpr, 1) : baseDpr;
        
        canvas.width = Math.floor(window.innerWidth * dpr);
        canvas.height = Math.floor(window.innerHeight * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (currentFrame >= 0) draw(currentFrame);
    }

    function draw(frame) {
        var idx = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(frame)));
        currentFrame = idx;

        var img = nearestLoaded(idx);
        if (!img) return;

        var w = window.innerWidth;
        var h = window.innerHeight;

        // A escolha entre cover e contain depende de o frame COMBINAR com o
        // formato da tela — nao do tamanho do aparelho.
        //
        //  - combinam (vertical no retrato, 16:9 no paisagem): cover, tela
        //    cheia, sem corte relevante;
        //  - nao combinam (16:9 no retrato, apos girar o aparelho, etc.):
        //    contain para nao cortar as laterais onde os componentes
        //    explodem, com a propria cena borrada preenchendo o entorno em
        //    vez de faixas pretas.
        var viewPortrait = h > w;
        var imgPortrait = img.height > img.width;
        var mismatch = viewPortrait !== imgPortrait;

        if (mismatch) {
            // Blur barato: desenha o frame num canvas minúsculo e estica —
            // o rescalonamento desfoca sozinho, sem ctx.filter (caro em
            // GPU de celular).
            bctx.drawImage(img, 0, 0, backdrop.width, backdrop.height);
            ctx.imageSmoothingEnabled = true;
            ctx.drawImage(backdrop, 0, 0, w, h);
            // Escurece o ambiente para o vídeo nítido saltar à frente
            ctx.fillStyle = 'rgba(6, 10, 16, 0.45)';
            ctx.fillRect(0, 0, w, h);
        }

        var scale = mismatch
            ? Math.min(w / img.width, h / img.height)  // contain
            : Math.max(w / img.width, h / img.height); // cover

        var dw = img.width * scale;
        var dh = img.height * scale;

        // Quando ha incompatibilidade, sobe um pouco a cena para nao brigar
        // com o texto na parte de baixo do palco. Com cover, centraliza.
        var dy = mismatch ? (h - dh) * 0.4 : (h - dh) / 2;
        ctx.drawImage(img, (w - dw) / 2, dy, dw, dh);
    }

    // ----------------------------------------------------------------------
    // Reduced motion: um frame estático do meio (cena explodida) e pronto.
    // ----------------------------------------------------------------------

    if (prefersReduced) {
        var mid = Math.floor(TOTAL_FRAMES / 2);
        var img = new Image();
        img.onload = function () {
            images[mid] = img;
            resize();
            draw(mid);
        };
        img.src = framePath(mid);
        window.addEventListener('resize', resize);
        return;
    }

    // ----------------------------------------------------------------------
    // Rolagem → frame
    // ----------------------------------------------------------------------

    function init() {
        var ticking = false;

        function setStage(progress, active) {
            if (active) {
                stage.style.visibility = 'visible';
                // Fade nas bordas do trilho evita corte seco ao entrar/sair.
                var edge = Math.min(progress, 1 - progress);
                stage.style.opacity = Math.min(Math.max(edge, 0) * 16, 1).toFixed(3);
                
                // Parallax no texto
                if (copy) {
                    var textP = Math.min(progress / 0.1, 1);
                    var textFadeOut = Math.max((0.95 - progress) / 0.05, 0); // Fades out at the end (last 5%)
                    textP = Math.min(textP, textFadeOut);
                    var translateY = 30 * (1 - Math.min(progress / 0.1, 1));
                    copy.style.opacity = textP.toFixed(2);
                    copy.style.transform = 'translateY(' + translateY + 'px)';
                }
            } else {
                stage.style.visibility = 'hidden';
                stage.style.opacity = '0';
                if (copy) copy.style.opacity = '0';
            }
        }

        function apply() {
            ticking = false;
            var rect = root.getBoundingClientRect();
            var travel = rect.height - window.innerHeight;
            if (travel <= 0) return;

            // rect.top: 0 no início do trilho → -travel no fim.
            var p = -rect.top / travel;
            var active = p > 0 && p < 1;

            setStage(p, active);
            if (active) {
                // Easing (pow 1.5): Faz com que a primeira metade do scroll passe mais devagar
                // focando mais nos frames iniciais de digitação antes de explodir o notebook.
                var easedP = Math.pow(Math.max(0, Math.min(1, p)), 1.5);
                draw(easedP * (TOTAL_FRAMES - 1));
            }
        }

        function request() {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(apply);
        }

        // O Lenis anima o scrollTop nativo, então o evento 'scroll' da janela
        // cobre tudo — sem listener extra no Lenis (o duplo caminho mostrou-se
        // instável durante os testes).
        window.addEventListener('scroll', request, { passive: true });
        window.addEventListener('resize', function () { resize(); request(); });

        // Gancho de depuração: rAF é suprimido em abas ocluídas, o que trava
        // qualquer verificação assíncrona. Chamar __expApply() executa o
        // mesmo caminho de forma síncrona.
        window.__expApply = apply;

        resize();
        apply();
    }

    loadSequence();

    // Init imediato, sem esperar 'load': na rede real os ~250 frames em
    // pré-carregamento seguram o evento load por dezenas de segundos, e
    // enquanto o init não roda a seção fica um vão vazio de 320vh na
    // rolagem. O script é defer, então o DOM já existe aqui; e o desenho
    // tolera frames ainda não carregados via nearestLoaded().
    init();
})();
