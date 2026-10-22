/* ==========================================================================
   Simulador de Investimento

   TODOS os preços vivem no objeto PRICING abaixo. Nada de valor em HTML:
   antes os preços ficavam em atributos `value` dos inputs e os rótulos eram
   lidos do DOM (parentElement.querySelector...), então qualquer ajuste de
   marcação quebrava a mensagem do WhatsApp em silêncio.

   Para mudar um preço, edite UMA linha aqui. O HTML se atualiza sozinho.
   ========================================================================== */

// ---------------------------------------------------------------------------
// TABELA DE PREÇOS — ponto único de edição
//
// Valores revisados com base em pesquisa de mercado (jul/2026):
//  - consultoria de TI no Brasil: R$ 100–1.000/h, sêniores acima de R$ 500;
//  - freelancer de automação n8n: R$ 50–150/h;
//  - projetos com agentes de IA: R$ 5.000–10.000;
//  - integrações multi-sistema: R$ 1.000–3.000.
//
// O posicionamento adotado é o de CONSULTOR SÊNIOR (atuação desde 2015,
// certificações IBSEC/SOC), não o de freelancer avulso — daí a hora acima
// da faixa de freelancer e abaixo da faixa de consultoria estratégica.
// ---------------------------------------------------------------------------

const PRICING = {
    hourlyRate: 220,

    // Fator do teto da faixa exibida. 1.4 = "de X até X+40%".
    rangeFactor: 1.4,

    projects: {
        simples:  { label: 'Automação Simples', hint: '1 a 2 integrações',        price: 1500, icon: 'fa-bolt' },
        ia:       { label: 'Assistente IA',     hint: 'RAG / OpenAI / WhatsApp',  price: 4500, icon: 'fa-robot' },
        nuvem:    { label: 'Migração/Nuvem',    hint: 'Setup e Segurança',        price: 2800, icon: 'fa-server' }
    },

    addons: {
        dashboard: { label: 'Painel de Gestão (Dashboard Supabase/PowerBI)', price: 1200 },
        crm:       { label: 'Integração com CRM (RD Station, HubSpot, etc)', price: 900 },
        sla:       { label: 'SLA de Suporte Mensal (Manutenção de APIs)',    price: 700 }
    },

    stacks: {
        essencial: { label: 'Stack Essencial',      hint: 'Manutenção e Monitoramento (Até 10h/mês)',        price: 1600 },
        premium:   { label: 'Stack Premium (CaaS)', hint: 'Monitoramento 24/7 + Evolução Contínua (Até 25h/mês)', price: 3800 }
    },

    // Multiplicador por prazo. Urgência custa mais porque desloca outros
    // projetos da agenda; prazo folgado permite encaixe e sai mais barato.
    urgency: {
        tranquilo: { label: 'Sem pressa (60+ dias)', factor: 0.9,  hint: 'Encaixo na agenda' },
        normal:    { label: 'Padrão (30 dias)',      factor: 1.0,  hint: 'Prazo usual' },
        urgente:   { label: 'Urgente (15 dias)',     factor: 1.35, hint: 'Prioridade na fila' }
    }
};

const WHATSAPP = '5541988875184';
const STORAGE_KEY = 'simulador-config-v1';

export function initCalculator() {
    const totalDisplay = document.getElementById('calcTotal');
    if (!totalDisplay) return;

    const totalMax = document.getElementById('calcTotalMax');
    const breakdownEl = document.getElementById('calcBreakdown');
    const suffixEl = document.getElementById('calcSuffix');
    const hourSlider = document.getElementById('hourSlider');
    const hourValueDisplay = document.getElementById('hourValueDisplay');
    const hourRateHint = document.getElementById('hourRateHint');

    const tabs = document.querySelectorAll('.calc-tab');
    const views = document.querySelectorAll('.calc-view');

    let currentMode = 'Project';
    let currentTotal = 0;
    let animFrame = null;
    let shownValue = 0;

    // -----------------------------------------------------------------------
    // Formatação
    //
    // Sem centavos: são estimativas, e "R$ 4.500,00" sugere precisão que o
    // número não tem. Também elimina o bug antigo em que o valor inicial
    // aparecia como "1.500" e virava "1.500,00" no primeiro clique.
    // -----------------------------------------------------------------------
    function formatBRL(value) {
        return Math.round(value).toLocaleString('pt-BR');
    }

    // -----------------------------------------------------------------------
    // Injeção do HTML a partir do PRICING
    // -----------------------------------------------------------------------

    function renderProjectOptions() {
        const wrap = document.getElementById('projOptions');
        if (!wrap) return;

        wrap.innerHTML = Object.entries(PRICING.projects).map(([key, p], i) => `
            <label class="cursor-pointer">
                <input type="radio" name="projType" value="${key}" class="peer hidden" ${i === 0 ? 'checked' : ''}>
                <div class="glass-card border border-white/5 p-4 rounded-xl peer-checked:border-tech-500 peer-checked:bg-tech-500/10 transition-all text-center h-full">
                    <i class="fas ${p.icon} text-xl text-tech-400 mb-2 block"></i>
                    <span class="text-sm font-bold block text-white">${p.label}</span>
                    <span class="text-[10px] text-gray-400 block mt-1">${p.hint}</span>
                    <span class="text-[11px] text-tech-400 font-bold block mt-2">a partir de R$ ${formatBRL(p.price)}</span>
                </div>
            </label>`).join('');
    }

    function renderAddons() {
        const wrap = document.getElementById('projAddons');
        if (!wrap) return;

        wrap.innerHTML = Object.entries(PRICING.addons).map(([key, a]) => `
            <label class="flex items-center gap-3 p-3 glass-card rounded-lg border border-white/5 cursor-pointer hover:border-white/20 transition-colors">
                <input type="checkbox" class="proj-addon w-4 h-4 accent-tech-500 bg-black border-gray-600 rounded" value="${key}">
                <span class="text-sm text-gray-300 flex-1">${a.label}</span>
                <span class="text-xs text-tech-400 font-bold whitespace-nowrap">+ R$ ${formatBRL(a.price)}</span>
            </label>`).join('');
    }

    function renderUrgency() {
        const wrap = document.getElementById('projUrgency');
        if (!wrap) return;

        wrap.innerHTML = Object.entries(PRICING.urgency).map(([key, u]) => `
            <label class="cursor-pointer">
                <input type="radio" name="urgency" value="${key}" class="peer hidden" ${key === 'normal' ? 'checked' : ''}>
                <div class="glass-card border border-white/5 p-3 rounded-xl peer-checked:border-tech-500 peer-checked:bg-tech-500/10 transition-all text-center">
                    <span class="text-xs font-bold block text-white">${u.label}</span>
                    <span class="text-[10px] text-gray-400 block mt-0.5">${u.hint}</span>
                </div>
            </label>`).join('');
    }

    function renderStacks() {
        const wrap = document.getElementById('stackOptions');
        if (!wrap) return;

        wrap.innerHTML = Object.entries(PRICING.stacks).map(([key, s], i) => `
            <label class="cursor-pointer">
                <input type="radio" name="stackType" value="${key}" class="peer hidden" ${i === 0 ? 'checked' : ''}>
                <div class="glass-card border border-white/5 p-4 rounded-xl peer-checked:border-tech-500 peer-checked:bg-tech-500/10 transition-all text-left h-full">
                    <span class="text-sm font-bold block text-white">${s.label}</span>
                    <span class="text-[10px] text-gray-400 block mt-1">${s.hint}</span>
                    <span class="text-[11px] text-tech-400 font-bold block mt-2">R$ ${formatBRL(s.price)}/mês</span>
                </div>
            </label>`).join('');
    }

    renderProjectOptions();
    renderAddons();
    renderUrgency();
    renderStacks();

    if (hourRateHint) {
        hourRateHint.textContent =
            `Valor base: R$ ${formatBRL(PRICING.hourlyRate)}/h. Ideal para consultorias avulsas, ` +
            `code reviews ou ajustes pontuais.`;
    }

    // -----------------------------------------------------------------------
    // Cálculo
    // -----------------------------------------------------------------------

    function getState() {
        const proj = document.querySelector('input[name="projType"]:checked');
        const urg = document.querySelector('input[name="urgency"]:checked');
        const stack = document.querySelector('input[name="stackType"]:checked');

        return {
            mode: currentMode,
            proj: proj ? proj.value : Object.keys(PRICING.projects)[0],
            urgency: urg ? urg.value : 'normal',
            stack: stack ? stack.value : Object.keys(PRICING.stacks)[0],
            addons: Array.from(document.querySelectorAll('.proj-addon:checked')).map(a => a.value),
            hours: hourSlider ? parseInt(hourSlider.value, 10) : 10
        };
    }

    // Retorna { total, items[], suffix, showRange }
    function compute() {
        const s = getState();
        const items = [];
        let total = 0;

        if (s.mode === 'Project') {
            const p = PRICING.projects[s.proj];
            total = p.price;
            items.push({ label: p.label, value: p.price });

            s.addons.forEach(key => {
                const a = PRICING.addons[key];
                if (!a) return;
                total += a.price;
                items.push({ label: a.label.replace(/\s*\(.*\)/, ''), value: a.price });
            });

            const u = PRICING.urgency[s.urgency];
            if (u && u.factor !== 1) {
                const delta = total * (u.factor - 1);
                total += delta;
                items.push({ label: u.label, value: delta, isFactor: true });
            }

            return { total, items, suffix: '', showRange: true };
        }

        if (s.mode === 'Hour') {
            total = s.hours * PRICING.hourlyRate;
            items.push({ label: `${s.hours}h × R$ ${formatBRL(PRICING.hourlyRate)}`, value: total });
            // Pacote de horas tem valor fechado: faixa aqui confundiria.
            return { total, items, suffix: '', showRange: false };
        }

        const st = PRICING.stacks[s.stack];
        total = st.price;
        items.push({ label: st.label, value: st.price });
        return { total, items, suffix: '/mês', showRange: false };
    }

    // -----------------------------------------------------------------------
    // Animação do total — conta até o valor novo em vez de trocar seco
    // -----------------------------------------------------------------------

    function animateTo(target) {
        if (animFrame) cancelAnimationFrame(animFrame);

        const start = shownValue;
        const delta = target - start;
        if (Math.abs(delta) < 1) {
            shownValue = target;
            totalDisplay.textContent = formatBRL(target);
            return;
        }

        const DURATION = 420;
        let t0 = null;

        function step(ts) {
            if (t0 === null) t0 = ts;
            const p = Math.min((ts - t0) / DURATION, 1);
            // easeOutCubic: rápido no início, assenta suave no fim
            const eased = 1 - Math.pow(1 - p, 3);
            shownValue = start + delta * eased;
            totalDisplay.textContent = formatBRL(shownValue);
            if (p < 1) animFrame = requestAnimationFrame(step);
        }

        animFrame = requestAnimationFrame(step);
    }

    function renderBreakdown(items) {
        if (!breakdownEl) return;

        breakdownEl.innerHTML = items.map(it => `
            <li class="flex items-baseline justify-between gap-4 text-xs">
                <span class="text-gray-400">${it.label}</span>
                <span class="${it.isFactor ? 'text-amber-400' : 'text-gray-300'} font-medium whitespace-nowrap">
                    ${it.value >= 0 ? '' : '−'}R$ ${formatBRL(Math.abs(it.value))}
                </span>
            </li>`).join('');
    }

    function update() {
        const { total, items, suffix, showRange } = compute();
        currentTotal = total;

        animateTo(total);
        renderBreakdown(items);

        if (suffixEl) suffixEl.textContent = suffix;

        if (totalMax) {
            if (showRange) {
                totalMax.textContent = 'até R$ ' + formatBRL(total * PRICING.rangeFactor);
                totalMax.classList.remove('hidden');
            } else {
                totalMax.classList.add('hidden');
            }
        }

        save();
    }

    // -----------------------------------------------------------------------
    // Persistência — quem volta ao site reencontra a simulação
    // -----------------------------------------------------------------------

    function save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(getState()));
        } catch (e) {
            // Modo privado / storage cheio: persistir é opcional, seguir em frente.
        }
    }

    function restore() {
        let s;
        try {
            s = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
        } catch (e) {
            return;
        }
        if (!s) return;

        const setRadio = (name, val) => {
            const el = document.querySelector(`input[name="${name}"][value="${val}"]`);
            if (el) el.checked = true;
        };

        setRadio('projType', s.proj);
        setRadio('urgency', s.urgency);
        setRadio('stackType', s.stack);

        (s.addons || []).forEach(key => {
            const el = document.querySelector(`.proj-addon[value="${key}"]`);
            if (el) el.checked = true;
        });

        if (hourSlider && s.hours) {
            hourSlider.value = s.hours;
            if (hourValueDisplay) hourValueDisplay.textContent = s.hours + 'h';
        }

        if (s.mode && s.mode !== 'Project') {
            const btn = document.getElementById('calcType' + s.mode);
            if (btn) switchTab(btn, s.mode, 'view' + s.mode);
        }
    }

    // -----------------------------------------------------------------------
    // Abas
    // -----------------------------------------------------------------------

    const ACTIVE_CLASSES = ['active', 'text-white', 'bg-tech-500/20', 'border', 'border-tech-500/50', 'shadow-[0_0_15px_rgba(6,182,212,0.2)]'];

    function switchTab(btn, mode, viewId) {
        currentMode = mode;

        tabs.forEach(t => {
            t.classList.remove(...ACTIVE_CLASSES);
            t.classList.add('text-gray-400');
            t.setAttribute('aria-selected', 'false');
        });

        btn.classList.remove('text-gray-400');
        btn.classList.add(...ACTIVE_CLASSES);
        btn.setAttribute('aria-selected', 'true');

        views.forEach(v => v.classList.add('hidden'));
        const view = document.getElementById(viewId);
        if (view) view.classList.remove('hidden');

        update();
    }

    [['calcTypeProject', 'Project', 'viewProject'],
     ['calcTypeHour', 'Hour', 'viewHour'],
     ['calcTypeStack', 'Stack', 'viewStack']].forEach(([id, mode, view]) => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.setAttribute('role', 'tab');
            btn.addEventListener('click', () => switchTab(btn, mode, view));
        }
    });

    // -----------------------------------------------------------------------
    // Listeners — delegação: o HTML das opções é gerado dinamicamente,
    // então listeners individuais se perderiam a cada re-render.
    // -----------------------------------------------------------------------

    document.getElementById('simulador').addEventListener('change', (e) => {
        if (e.target.matches('input[name="projType"], input[name="urgency"], input[name="stackType"], .proj-addon')) {
            update();
        }
    });

    if (hourSlider) {
        hourSlider.addEventListener('input', (e) => {
            if (hourValueDisplay) hourValueDisplay.textContent = e.target.value + 'h';
            update();
        });
    }

    restore();
    update();

    // -----------------------------------------------------------------------
    // WhatsApp — mensagem montada a partir do PRICING, não do DOM
    // -----------------------------------------------------------------------

    window.calculatorModule = {
        sendToWhatsApp() {
            const s = getState();
            const { total, showRange } = compute();
            let msg;

            if (s.mode === 'Project') {
                const p = PRICING.projects[s.proj];
                msg = `Olá Allan! Simulei um projeto no seu site e gostaria de um orçamento para:\n\n*Serviço:* ${p.label}`;

                if (s.addons.length) {
                    const labels = s.addons.map(k => PRICING.addons[k] ? PRICING.addons[k].label : k);
                    msg += `\n*Opcionais:* ${labels.join(', ')}`;
                }

                msg += `\n*Prazo:* ${PRICING.urgency[s.urgency].label}`;
                msg += `\n*Estimativa:* R$ ${formatBRL(total)}`;
                if (showRange) msg += ` a R$ ${formatBRL(total * PRICING.rangeFactor)}`;
            } else if (s.mode === 'Hour') {
                msg = `Olá Allan! Me interessei pelo modelo de contratação por hora.\n\n` +
                      `*Volume estimado:* ${s.hours} horas\n` +
                      `*Valor estimado:* R$ ${formatBRL(total)}`;
            } else {
                const st = PRICING.stacks[s.stack];
                msg = `Olá Allan! Me interessei pela assinatura mensal:\n\n` +
                      `*Plano:* ${st.label}\n` +
                      `*Valor:* R$ ${formatBRL(total)}/mês`;
            }

            window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
        }
    };
}
