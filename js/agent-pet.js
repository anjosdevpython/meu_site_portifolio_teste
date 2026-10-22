// js/agent-pet.js
// ==========================================================================
// Mini Hacker Allan — Interactive Companion & Portfolio Agent (OpenPets V2)
// ==========================================================================

import { playHoverTick, playModalSwoosh } from './audio.js';

const SPRITE_CONFIG = {
    url: './assets/pet/spritesheet.webp',
    frameWidth: 192,
    frameHeight: 208,
    columns: 8,
    rows: 11,
    states: {
        idle:           { row: 0, frames: 6, durationMs: 5500, iterations: 'infinite', label: 'Online' },
        'running-right':{ row: 1, frames: 8, durationMs: 920,  iterations: 'infinite', label: 'Explorando' },
        'running-left': { row: 2, frames: 8, durationMs: 920,  iterations: 'infinite', label: 'Explorando' },
        waving:         { row: 3, frames: 4, durationMs: 700,  iterations: 3,          label: 'Olá!' },
        jumping:        { row: 4, frames: 5, durationMs: 840,  iterations: 2,          label: 'Boa!' },
        failed:         { row: 5, frames: 8, durationMs: 1220, iterations: 2,          label: 'Ops!' },
        waiting:        { row: 6, frames: 6, durationMs: 1800, iterations: 'infinite', label: 'Aguardando' },
        running:        { row: 7, frames: 6, durationMs: 820,  iterations: 'infinite', label: 'Codando...' },
        review:         { row: 8, frames: 6, durationMs: 1030, iterations: 'infinite', label: 'Analisando...' }
    },
    gazeSectorCount: 16,
    gazeDeadZonePx: 24,
    gazeIdleResetMs: 1400
};

const QUICK_SUGGESTIONS = [
    { label: '🤖 Automação WhatsApp', query: 'Como funciona a automação no WhatsApp?' },
    { label: '💰 Quanto custa?', query: 'Qual o valor de um projeto ou consultoria?' },
    { label: '🧠 Agentes de IA', query: 'O que são os Agentes de IA e Assistentes RAG?' },
    { label: '🛡️ Infra & Segurança', query: 'Como funciona a parte de Infraestrutura e Segurança?' },
    { label: '🧮 Ir ao Simulador', query: 'Quero simular um orçamento agora' }
];

const KNOWLEDGE_BASE = [
    {
        keywords: ['whatsapp', 'bot', 'atendimento', 'lead', 'crm', 'automacao', 'automação', 'n8n', 'make', 'rpa'],
        reaction: 'running',
        reply: 'Com **n8n, Make e IA**, eu crio robôs que atendem no WhatsApp 24/7, qualificam leads, agendam horários e salvam tudo direto no seu CRM sem intervenção humana.',
        actions: [
            { label: 'Ver fluxo na prática', action: 'service:automacao' },
            { label: 'Simular investimento', action: 'scroll:#simulador' }
        ]
    },
    {
        keywords: ['preco', 'preço', 'valor', 'custo', 'quanto', 'orcamento', 'orçamento', 'investimento', 'hora', 'mensal', 'stack'],
        reaction: 'review',
        reply: 'Trabalhamos em 3 formatos transparentes:\n• **Projeto Fechado:** Automação Simples (a partir de R$ 1.500), Migração/Nuvem (R$ 2.800+) ou Assistente IA (R$ 4.500+)\n• **Por Hora:** R$ 220/h\n• **Stack Mensal:** a partir de R$ 1.600/mês.',
        actions: [
            { label: 'Abrir Simulador', action: 'scroll:#simulador' },
            { label: 'Pedir Diagnóstico Gratuito', action: 'modal:consultation' }
        ]
    },
    {
        keywords: ['ia', 'inteligencia', 'inteligência', 'agente', 'rag', 'chatgpt', 'gpt', 'assistente', 'autonomo', 'autônomo'],
        reaction: 'running',
        reply: 'Desenvolvo **Assistentes Corporativos com RAG** (treinados nos PDFs, manuais e dados da sua empresa) e **Agentes Autônomos** que analisam dados, monitoram sistemas e executam tarefas sozinhos.',
        actions: [
            { label: 'Ver Agentes Autônomos', action: 'service:agentes' },
            { label: 'Ver Assistentes IA', action: 'service:assistentes' }
        ]
    },
    {
        keywords: ['infra', 'infraestrutura', 'servidor', 'linux', 'windows', 'cloud', 'nuvem', 'docker', 'seguranca', 'segurança', 'soc', 'ibsec', 'supabase'],
        reaction: 'review',
        reply: 'Atuo em TI desde 2015 com base forte em **Linux, Windows Server, Docker e Cloud**, além de certificações **Analista SOC e Segurança em Linux (IBSEC)**. Faço desde migração para nuvem até auditoria e hardening.',
        actions: [
            { label: 'Infraestrutura & Nuvem', action: 'service:infra' },
            { label: 'Segurança & Gestão', action: 'service:seguranca' }
        ]
    },
    {
        keywords: ['quem', 'allan', 'experiencia', 'experiência', 'curitiba', 'presencial', 'remoto', 'onde', 'curriculo', 'currículo'],
        reaction: 'waving',
        reply: 'O **Allan Anjos** está em TI desde 2015 (com passagem pelo Exército Brasileiro e suporte crítico) e hoje é especialista em Automação (RPA) e IA Generativa. Atende presencial/híbrido em **Curitiba e São José dos Pinhais** e 100% remoto em todo o Brasil!',
        actions: [
            { label: 'Ver Currículo', action: 'link:./curriculo.html' },
            { label: 'Chamar no WhatsApp', action: 'whatsapp:Olá Allan! Conversei com seu Mini Agente no site e gostaria de bater um papo.' }
        ]
    },
    {
        keywords: ['simulador', 'simular', 'calcular'],
        reaction: 'jumping',
        reply: 'Bora lá! Vou te levar direto para o **Simulador de Investimento** para você montar seu escopo em tempo real.',
        actions: [
            { label: 'Ir para o Simulador', action: 'scroll:#simulador' }
        ],
        autoAction: 'scroll:#simulador'
    },
    {
        keywords: ['contato', 'falar', 'reuniao', 'reunião', 'agendar', 'diagnostico', 'diagnóstico', 'humano'],
        reaction: 'jumping',
        reply: 'Você pode agendar uma **Discovery Call gratuita de 15 minutos** agora mesmo ou chamar o Allan direto no WhatsApp!',
        actions: [
            { label: 'Agendar Diagnóstico VIP', action: 'modal:consultation' },
            { label: 'Abrir WhatsApp', action: 'whatsapp:Olá Allan! Vim pelo Mini Hacker do seu site e quero conversar sobre um projeto.' }
        ]
    }
];

export function initAgentPet() {
    if (document.getElementById('allan-pet-root')) return;

    let currentState = 'idle';
    let stateTimeout = null;
    let bubbleTimeout = null;
    let gazeResetTimeout = null;
    let roamInterval = null;
    let walkAnimFrame = null;
    let isChatOpen = false;
    let isDragging = false;
    let isFlipped = false;
    let isWalking = false;
    let petOffsetX = 0;
    let petOffsetY = 0;
    let dragStartX = 0;
    let dragStartY = 0;
    let initialOffsetX = 0;
    let initialOffsetY = 0;
    let lastDragX = 0;
    let hasMovedDuringDrag = false;

    // ----------------------------------------------------------------------
    // Build DOM
    // ----------------------------------------------------------------------
    const root = document.createElement('div');
    root.id = 'allan-pet-root';
    root.className = 'allan-pet-root';
    root.setAttribute('data-reaction-state', 'idle');
    root.setAttribute('data-motion-state', 'idle');
    root.setAttribute('data-gaze-index', 'neutral');
    root.setAttribute('data-flip-x', 'false');

    root.innerHTML = `
        <!-- Attached Chat Panel -->
        <div class="allan-pet-chat" id="allanPetChat" role="dialog" aria-label="Chat com Mini Hacker Allan" aria-hidden="true">
            <div class="allan-pet-chat-header">
                <div class="allan-pet-chat-header-left">
                    <div class="allan-pet-chat-avatar" aria-hidden="true">
                        <span class="allan-pet-mini-icon"></span>
                    </div>
                    <div class="allan-pet-chat-meta">
                        <span class="allan-pet-chat-title">Mini Hacker Allan</span>
                        <span class="allan-pet-chat-pill" id="allanPetStatusPill">
                            <span class="allan-pet-chat-dot"></span>
                            <span id="allanPetStatusText">Online • IA & RPA</span>
                        </span>
                    </div>
                </div>
                <div class="allan-pet-chat-header-actions">
                    <button type="button" class="allan-pet-icon-btn" id="allanPetPoseBtn" title="Testar animação">
                        <i class="fas fa-terminal"></i>
                    </button>
                    <button type="button" class="allan-pet-icon-btn" id="allanPetChatClose" aria-label="Fechar chat">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>

            <div class="allan-pet-chat-messages" id="allanPetMessages">
                <div class="allan-pet-msg bot">
                    <div class="allan-pet-msg-bubble">
                        Fala! Eu sou o <strong>Mini Hacker Allan</strong> 👾<br>
                        Acompanho seu cursor, rodo no código do site e sei tudo sobre as automações, agentes de IA e infraestrutura do Allan. Como posso ajudar?
                    </div>
                </div>
            </div>

            <div class="allan-pet-chat-chips" id="allanPetChips">
                ${QUICK_SUGGESTIONS.map((s, idx) => `
                    <button type="button" class="allan-pet-chip" data-chip-idx="${idx}">${s.label}</button>
                `).join('')}
            </div>

            <form class="allan-pet-chat-form" id="allanPetForm">
                <input type="text" id="allanPetInput" class="allan-pet-chat-input" placeholder="Pergunte sobre n8n, IA, preços..." autocomplete="off" />
                <button type="submit" class="allan-pet-chat-send" aria-label="Enviar mensagem">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </form>
        </div>

        <!-- Transient Speech Bubble -->
        <div class="allan-pet-bubble hidden" id="allanPetBubble" role="status" aria-live="polite">
            <div class="allan-pet-bubble-header">
                <span class="allan-pet-bubble-dot" id="allanPetBubbleDot"></span>
                <span class="allan-pet-bubble-label" id="allanPetBubbleLabel">Mini Allan</span>
                <button type="button" class="allan-pet-bubble-close" id="allanPetBubbleClose" aria-label="Fechar balão">&times;</button>
            </div>
            <div class="allan-pet-bubble-text" id="allanPetBubbleText"></div>
            <div class="allan-pet-bubble-actions hidden" id="allanPetBubbleActions"></div>
        </div>

        <!-- Floating Quick Action Buttons (OpenPets style) -->
        <div class="allan-pet-buttons">
            <button type="button" class="allan-pet-launcher is-chat" id="allanPetChatToggle" title="Conversar com Mini Hacker Allan" aria-label="Conversar com Mini Hacker Allan">
                <i class="fas fa-comment-dots"></i>
                <span class="allan-pet-unread-dot" id="allanPetUnreadDot"></span>
            </button>
            <button type="button" class="allan-pet-launcher is-action" id="allanPetWalkBtn" title="Passear / Reagir" aria-label="Reagir">
                <i class="fas fa-bolt"></i>
            </button>
        </div>

        <!-- Pet Hitbox & Sprite -->
        <div class="allan-pet-hitbox" id="allanPetHitbox" title="Arraste ou clique no Mini Hacker Allan">
            <div class="allan-pet-shadow"></div>
            <div class="allan-pet-shell" id="allanPetShell">
                <div class="allan-pet-sprite" id="allanPetSprite" role="img" aria-label="Mini Hacker Allan animado"></div>
            </div>
            <div class="allan-pet-nametag">
                <span class="allan-pet-nametag-dot"></span>
                <span>MINI ALLAN</span>
            </div>
        </div>
    `;

    document.body.appendChild(root);

    // Elements
    const chatEl = document.getElementById('allanPetChat');
    const chatToggleBtn = document.getElementById('allanPetChatToggle');
    const chatCloseBtn = document.getElementById('allanPetChatClose');
    const poseBtn = document.getElementById('allanPetPoseBtn');
    const walkBtn = document.getElementById('allanPetWalkBtn');
    const unreadDot = document.getElementById('allanPetUnreadDot');
    const messagesEl = document.getElementById('allanPetMessages');
    const chipsEl = document.getElementById('allanPetChips');
    const formEl = document.getElementById('allanPetForm');
    const inputEl = document.getElementById('allanPetInput');
    const statusPill = document.getElementById('allanPetStatusPill');
    const statusText = document.getElementById('allanPetStatusText');

    const bubbleEl = document.getElementById('allanPetBubble');
    const bubbleLabel = document.getElementById('allanPetBubbleLabel');
    const bubbleText = document.getElementById('allanPetBubbleText');
    const bubbleActions = document.getElementById('allanPetBubbleActions');
    const bubbleClose = document.getElementById('allanPetBubbleClose');
    const hitboxEl = document.getElementById('allanPetHitbox');
    const spriteEl = document.getElementById('allanPetSprite');

    // ----------------------------------------------------------------------
    // Sprite Animation State Machine
    // ----------------------------------------------------------------------
    function applySpriteVars(row, startCol, endCol, frames, durationMs, iterations, animated = true) {
        const xStart = -(startCol * SPRITE_CONFIG.frameWidth);
        const xEnd = -(endCol * SPRITE_CONFIG.frameWidth);
        const yRow = -(row * SPRITE_CONFIG.frameHeight);

        spriteEl.style.setProperty('--sprite-row-y', `${yRow}px`);
        spriteEl.style.setProperty('--sprite-offset-x', `${xStart}px`);
        spriteEl.style.setProperty('--sprite-end-offset-x', `${xEnd}px`);
        spriteEl.style.setProperty('--sprite-frames', `${frames}`);
        spriteEl.style.setProperty('--sprite-duration', `${durationMs}ms`);
        spriteEl.style.setProperty('--sprite-iterations', `${iterations}`);

        if (animated) {
            spriteEl.style.animation = 'none';
            // Reflow to restart finite animations cleanly
            void spriteEl.offsetWidth;
            spriteEl.style.animation = `allan-pet-frames ${durationMs}ms steps(${frames}) ${iterations}`;
        } else {
            spriteEl.style.animation = 'none';
            spriteEl.style.backgroundPosition = `${xStart}px ${yRow}px`;
        }
    }

    function setState(newState, durationOverrideMs = null) {
        if (stateTimeout) {
            clearTimeout(stateTimeout);
            stateTimeout = null;
        }

        const def = SPRITE_CONFIG.states[newState] || SPRITE_CONFIG.states.idle;
        currentState = newState;
        root.setAttribute('data-reaction-state', newState);
        root.setAttribute('data-gaze-index', 'neutral');

        if (statusText) {
            statusText.textContent = newState === 'idle' ? 'Online • IA & RPA' : def.label;
        }
        if (statusPill) {
            statusPill.classList.toggle('is-busy', newState === 'running' || newState === 'review');
        }

        // Handle directional flip compensation
        let effectiveState = newState;
        if (isFlipped) {
            if (newState === 'running-left') effectiveState = 'running-right';
            else if (newState === 'running-right') effectiveState = 'running-left';
        }
        const effectiveDef = SPRITE_CONFIG.states[effectiveState] || def;

        applySpriteVars(
            effectiveDef.row,
            0,
            effectiveDef.frames,
            effectiveDef.frames,
            effectiveDef.durationMs,
            effectiveDef.iterations,
            true
        );

        const totalDuration = durationOverrideMs || (
            typeof def.iterations === 'number' ? def.durationMs * def.iterations : null
        );

        if (totalDuration) {
            stateTimeout = setTimeout(() => {
                setState('idle');
            }, totalDuration);
        }
    }

    // ----------------------------------------------------------------------
    // 16-Sector 360° Cursor Gaze Tracking (OpenPets V2 Rows 9 & 10)
    // ----------------------------------------------------------------------
    function updateCursorGaze(clientX, clientY) {
        if (currentState !== 'idle' || isDragging || isWalking) return;

        const rect = hitboxEl.getBoundingClientRect();
        const anchorX = rect.left + rect.width * 0.5;
        const anchorY = rect.top + rect.height * 0.44; // Eye/glasses level

        const dx = clientX - anchorX;
        const dy = clientY - anchorY;
        const dist = Math.hypot(dx, dy);

        if (dist <= SPRITE_CONFIG.gazeDeadZonePx) {
            resetGazeToIdle();
            return;
        }

        const sectorAngle = (Math.PI * 2) / SPRITE_CONFIG.gazeSectorCount;
        const angle = Math.atan2(dx, -dy);
        const rawSector = Math.floor((angle + sectorAngle / 2) / sectorAngle);
        let sector = ((rawSector % SPRITE_CONFIG.gazeSectorCount) + SPRITE_CONFIG.gazeSectorCount) % SPRITE_CONFIG.gazeSectorCount;

        if (isFlipped) {
            sector = (SPRITE_CONFIG.gazeSectorCount - sector) % SPRITE_CONFIG.gazeSectorCount;
        }

        const row = sector < 8 ? 9 : 10;
        const col = sector < 8 ? sector : sector - 8;

        root.setAttribute('data-gaze-index', String(sector));
        applySpriteVars(row, col, col, 1, 0, 1, false);

        if (gazeResetTimeout) clearTimeout(gazeResetTimeout);
        gazeResetTimeout = setTimeout(() => {
            resetGazeToIdle();
        }, SPRITE_CONFIG.gazeIdleResetMs);
    }

    function resetGazeToIdle() {
        if (gazeResetTimeout) {
            clearTimeout(gazeResetTimeout);
            gazeResetTimeout = null;
        }
        if (currentState === 'idle' && root.getAttribute('data-gaze-index') !== 'neutral') {
            root.setAttribute('data-gaze-index', 'neutral');
            const idleDef = SPRITE_CONFIG.states.idle;
            applySpriteVars(idleDef.row, 0, idleDef.frames, idleDef.frames, idleDef.durationMs, idleDef.iterations, true);
        }
    }

    window.addEventListener('pointermove', (e) => {
        if (isDragging) return;
        if (e.pointerType === 'touch') return;
        updateCursorGaze(e.clientX, e.clientY);
    }, { passive: true });

    // ----------------------------------------------------------------------
    // Speech Bubbles
    // ----------------------------------------------------------------------
    function showBubble(text, options = {}) {
        if (isChatOpen && !options.forceWhenChatOpen) return;

        const {
            label = 'Mini Allan',
            reaction = null,
            duration = 6500,
            actions = []
        } = options;

        if (reaction) {
            setState(reaction, typeof SPRITE_CONFIG.states[reaction]?.iterations === 'number' ? null : 3200);
        }

        bubbleLabel.textContent = label;
        bubbleText.innerHTML = text;

        if (actions.length > 0) {
            bubbleActions.innerHTML = actions.map((a, i) => `
                <button type="button" class="allan-pet-bubble-btn ${i === 0 ? 'is-primary' : ''}" data-action="${a.action}">
                    ${a.label}
                </button>
            `).join('');
            bubbleActions.classList.remove('hidden');
        } else {
            bubbleActions.innerHTML = '';
            bubbleActions.classList.add('hidden');
        }

        bubbleEl.classList.remove('hidden');
        if (bubbleTimeout) clearTimeout(bubbleTimeout);
        if (duration > 0) {
            bubbleTimeout = setTimeout(() => {
                hideBubble();
            }, duration);
        }
    }

    function hideBubble() {
        bubbleEl.classList.add('hidden');
        if (bubbleTimeout) {
            clearTimeout(bubbleTimeout);
            bubbleTimeout = null;
        }
    }

    bubbleClose.addEventListener('click', (e) => {
        e.stopPropagation();
        hideBubble();
    });

    bubbleActions.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        e.stopPropagation();
        const act = btn.getAttribute('data-action');
        hideBubble();
        executePetAction(act);
    });

    // ----------------------------------------------------------------------
    // Autonomous Walking & Dragging
    // ----------------------------------------------------------------------
    function applyPetTransform() {
        root.style.setProperty('--pet-offset-x', `${Math.round(petOffsetX)}px`);
        root.style.setProperty('--pet-offset-y', `${Math.round(petOffsetY)}px`);
    }

    function walkToOffset(targetX, onDone) {
        if (isDragging) return;
        if (walkAnimFrame) cancelAnimationFrame(walkAnimFrame);

        const startX = petOffsetX;
        const delta = targetX - startX;
        if (Math.abs(delta) < 12) {
            if (onDone) onDone();
            return;
        }

        isWalking = true;
        const directionState = delta < 0 ? 'running-left' : 'running-right';
        setState(directionState);

        const speedPxPerMs = 0.095;
        const duration = Math.min(3200, Math.max(600, Math.abs(delta) / speedPxPerMs));
        const startTime = performance.now();

        function step(now) {
            if (isDragging) {
                isWalking = false;
                return;
            }
            const t = Math.min(1, (now - startTime) / duration);
            // Smooth ease-in-out
            const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            petOffsetX = startX + delta * eased;
            applyPetTransform();

            if (t < 1) {
                walkAnimFrame = requestAnimationFrame(step);
            } else {
                isWalking = false;
                walkAnimFrame = null;
                setState('idle');
                if (onDone) onDone();
            }
        }

        walkAnimFrame = requestAnimationFrame(step);
    }

    function triggerPatrol() {
        if (isDragging || isWalking || isChatOpen) return;
        const maxLeft = -Math.min(window.innerWidth - 150, 260);
        const candidates = [0, -90, -170, maxLeft];
        const nextX = candidates[Math.floor(Math.random() * candidates.length)];
        if (Math.abs(nextX - petOffsetX) < 35) {
            // Do a coding or review animation in place
            const poses = ['running', 'review', 'waving', 'jumping'];
            const pick = poses[Math.floor(Math.random() * poses.length)];
            setState(pick, 3000);
        } else {
            walkToOffset(nextX);
        }
    }

    // Dragging support on hitbox
    hitboxEl.addEventListener('pointerdown', (e) => {
        if (e.button !== undefined && e.button !== 0) return;
        isDragging = true;
        hasMovedDuringDrag = false;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        lastDragX = e.clientX;
        initialOffsetX = petOffsetX;
        initialOffsetY = petOffsetY;
        hitboxEl.setPointerCapture(e.pointerId);
        root.classList.add('is-dragging');
    });

    hitboxEl.addEventListener('pointermove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - dragStartX;
        const dy = e.clientY - dragStartY;

        if (Math.hypot(dx, dy) > 6) {
            hasMovedDuringDrag = true;
            const stepDx = e.clientX - lastDragX;
            lastDragX = e.clientX;

            if (stepDx < -1.5 && currentState !== 'running-left') {
                setState('running-left');
            } else if (stepDx > 1.5 && currentState !== 'running-right') {
                setState('running-right');
            }
        }

        if (hasMovedDuringDrag) {
            const minX = -(window.innerWidth - 110);
            const maxX = 20;
            const minY = -(window.innerHeight - 140);
            const maxY = 20;

            petOffsetX = Math.max(minX, Math.min(maxX, initialOffsetX + dx));
            petOffsetY = Math.max(minY, Math.min(maxY, initialOffsetY + dy));
            applyPetTransform();
        }
    });

    function finishDrag(e) {
        if (!isDragging) return;
        isDragging = false;
        root.classList.remove('is-dragging');
        try {
            hitboxEl.releasePointerCapture(e.pointerId);
        } catch (_) {}

        if (hasMovedDuringDrag) {
            setState('jumping');
            playHoverTick();
        } else {
            // Simple click on pet: toggle chat or wave!
            playModalSwoosh();
            if (!isChatOpen) {
                toggleChat(true);
                setState('waving');
            } else {
                setState('jumping');
            }
        }
    }

    hitboxEl.addEventListener('pointerup', finishDrag);
    hitboxEl.addEventListener('pointercancel', finishDrag);

    // ----------------------------------------------------------------------
    // Chat Panel Logic & Smart Assistant
    // ----------------------------------------------------------------------
    function toggleChat(forceState) {
        isChatOpen = typeof forceState === 'boolean' ? forceState : !isChatOpen;
        root.setAttribute('data-chat-open', isChatOpen ? 'true' : 'false');
        chatEl.setAttribute('aria-hidden', isChatOpen ? 'false' : 'true');

        if (isChatOpen) {
            hideBubble();
            unreadDot.classList.add('hidden');
            // Bring pet back near bottom-right if it was dragged far away so chat fits on screen
            if (petOffsetY < -160 || petOffsetX < -(window.innerWidth - 340)) {
                petOffsetY = 0;
                petOffsetX = Math.max(petOffsetX, -Math.max(0, window.innerWidth - 380));
                applyPetTransform();
            }
            setTimeout(() => {
                if (window.innerWidth >= 768) inputEl.focus();
            }, 180);
        }
    }

    chatToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        playModalSwoosh();
        toggleChat();
    });

    chatCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleChat(false);
    });

    poseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        playHoverTick();
        const sequence = ['running', 'review', 'jumping', 'waving'];
        const next = sequence[(sequence.indexOf(currentState) + 1) % sequence.length];
        setState(next, 3500);
    });

    walkBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        playHoverTick();
        if (isWalking) return;
        const target = Math.abs(petOffsetX) > 60 ? 0 : -Math.min(180, Math.floor(window.innerWidth * 0.35));
        walkToOffset(target, () => {
            showBubble('Monitorando gargalos operacionais... Tudo 100% por aqui! 🚀', {
                label: 'Status do Agente',
                reaction: 'running',
                duration: 4500,
                actions: [
                    { label: 'Abrir Chat', action: 'chat:open' }
                ]
            });
        });
    });

    function appendMessage(html, sender = 'bot', actions = []) {
        const wrapper = document.createElement('div');
        wrapper.className = `allan-pet-msg ${sender}`;

        const actionsHtml = actions.length > 0
            ? `<div class="allan-pet-msg-actions">${actions.map(a => `
                <button type="button" class="allan-pet-msg-btn" data-action="${a.action}">${a.label}</button>
            `).join('')}</div>`
            : '';

        wrapper.innerHTML = `
            <div class="allan-pet-msg-bubble">
                ${html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')}
                ${actionsHtml}
            </div>
        `;

        messagesEl.appendChild(wrapper);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    messagesEl.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const act = btn.getAttribute('data-action');
        executePetAction(act);
    });

    function findBestResponse(text) {
        const norm = text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');

        let bestMatch = null;
        let bestScore = 0;

        for (const item of KNOWLEDGE_BASE) {
            let score = 0;
            for (const kw of item.keywords) {
                const kwNorm = kw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                if (norm.includes(kwNorm)) score += 2;
            }
            if (score > bestScore) {
                bestScore = score;
                bestMatch = item;
            }
        }

        if (bestMatch) return bestMatch;

        return {
            reaction: 'review',
            reply: 'Posso te ajudar a estruturar **automações no WhatsApp (n8n/Make)**, **Agentes de IA**, **Infraestrutura Cloud/Linux** ou calcular uma estimativa para o seu projeto! O que você prefere ver agora?',
            actions: [
                { label: 'Simular Orçamento', action: 'scroll:#simulador' },
                { label: 'Agendar Diagnóstico VIP', action: 'modal:consultation' },
                { label: 'Falar no WhatsApp', action: 'whatsapp:Olá Allan! Conversei com o Mini Hacker no seu site e gostaria de tirar uma dúvida.' }
            ]
        };
    }

    function handleUserQuery(queryText) {
        const trimmed = queryText.trim();
        if (!trimmed) return;

        appendMessage(trimmed, 'user');
        inputEl.value = '';

        // Pet starts coding/thinking while generating reply
        setState('running', 1500);
        if (statusText) statusText.textContent = 'Processando resposta...';

        setTimeout(() => {
            const response = findBestResponse(trimmed);
            setState(response.reaction || 'jumping', 2800);
            appendMessage(response.reply, 'bot', response.actions || []);
            playHoverTick();

            if (response.autoAction) {
                setTimeout(() => executePetAction(response.autoAction), 600);
            }
        }, 520);
    }

    formEl.addEventListener('submit', (e) => {
        e.preventDefault();
        handleUserQuery(inputEl.value);
    });

    chipsEl.addEventListener('click', (e) => {
        const chip = e.target.closest('[data-chip-idx]');
        if (!chip) return;
        const idx = Number(chip.getAttribute('data-chip-idx'));
        const item = QUICK_SUGGESTIONS[idx];
        if (item) {
            playHoverTick();
            handleUserQuery(item.query);
        }
    });

    // ----------------------------------------------------------------------
    // Execute Site Actions Triggered by the Agent
    // ----------------------------------------------------------------------
    function executePetAction(actionStr) {
        if (!actionStr) return;
        playModalSwoosh();

        if (actionStr === 'chat:open') {
            toggleChat(true);
            return;
        }

        if (actionStr.startsWith('scroll:')) {
            const selector = actionStr.slice('scroll:'.length);
            const targetEl = document.querySelector(selector);
            if (targetEl) {
                if (window.innerWidth < 768) toggleChat(false);
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setState('jumping');
            }
            return;
        }

        if (actionStr.startsWith('service:')) {
            const key = actionStr.slice('service:'.length);
            if (typeof window.openServiceModal === 'function') {
                if (window.innerWidth < 768) toggleChat(false);
                window.openServiceModal(key);
                setState('review', 3000);
            }
            return;
        }

        if (actionStr === 'modal:consultation') {
            if (typeof window.openConsultationModal === 'function') {
                if (window.innerWidth < 768) toggleChat(false);
                window.openConsultationModal();
                setState('jumping');
            }
            return;
        }

        if (actionStr.startsWith('link:')) {
            const url = actionStr.slice('link:'.length);
            window.open(url, '_blank', 'noopener');
            return;
        }

        if (actionStr.startsWith('whatsapp:')) {
            const msg = actionStr.slice('whatsapp:'.length);
            const url = `https://wa.me/5541988875184?text=${encodeURIComponent(msg)}`;
            window.open(url, '_blank', 'noopener');
            setState('jumping');
        }
    }

    // ----------------------------------------------------------------------
    // Contextual Section & Event Triggers
    // ----------------------------------------------------------------------
    const seenSections = new Set();

    function setupScrollContextualReactions() {
        const sectionConfigs = [
            {
                el: document.getElementById('exploded'),
                id: 'exploded',
                reaction: 'running',
                label: 'Arquitetura Viva',
                text: 'Do servidor Linux até o agente de IA no WhatsApp: cada camada otimizada! ⚡',
                actions: [{ label: 'Como funciona?', action: 'chat:open' }]
            },
            {
                el: document.getElementById('simulador'),
                id: 'simulador',
                reaction: 'review',
                label: 'Simulador de ROI',
                text: 'Quer ajuda pra escolher o melhor formato pro seu projeto? Me chama aqui! 🧮',
                actions: [
                    { label: 'Tirar dúvida', action: 'chat:open' },
                    { label: 'Diagnóstico Grátis', action: 'modal:consultation' }
                ]
            }
        ];

        if (!('IntersectionObserver' in window)) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const cfg = sectionConfigs.find(c => c.el === entry.target);
                if (!cfg || seenSections.has(cfg.id)) return;

                seenSections.add(cfg.id);
                showBubble(cfg.text, {
                    label: cfg.label,
                    reaction: cfg.reaction,
                    duration: 6000,
                    actions: cfg.actions
                });
            });
        }, { threshold: 0.35 });

        sectionConfigs.forEach(c => {
            if (c.el) observer.observe(c.el);
        });
    }

    // Hook into Service & Tech clicks so the pet reacts live!
    document.querySelectorAll('[onclick*="openServiceModal"]').forEach(btn => {
        btn.addEventListener('click', () => {
            setState('running', 3200);
        });
    });

    document.querySelectorAll('[onclick*="openTechModal"]').forEach(btn => {
        btn.addEventListener('click', () => {
            setState('review', 2600);
        });
    });

    // Initial Greeting after page load
    setState('idle');
    setTimeout(() => {
        showBubble(
            'Olá! Sou o <strong>Mini Allan</strong> 👾 Posso tirar dúvidas sobre automações, IA ou simular seu projeto!',
            {
                label: 'Mini Hacker Allan',
                reaction: 'waving',
                duration: 8000,
                actions: [
                    { label: 'Conversar agora', action: 'chat:open' },
                    { label: 'Simular Projeto', action: 'scroll:#simulador' }
                ]
            }
        );
    }, 1800);

    // Periodic subtle idle activity
    roamInterval = setInterval(() => {
        if (document.hidden || isChatOpen || isDragging || isWalking) return;
        if (Math.random() < 0.45) {
            const idlePoses = ['running', 'review', 'waiting', 'waving'];
            const pick = idlePoses[Math.floor(Math.random() * idlePoses.length)];
            setState(pick, 2800);
        }
    }, 18000);

    setupScrollContextualReactions();

    // Expose controller on window for external triggers/debugging
    window.allanPet = {
        setState,
        showBubble,
        toggleChat,
        walkToOffset,
        triggerPatrol
    };
}
