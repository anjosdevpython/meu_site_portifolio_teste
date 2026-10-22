export const serviceDetails = {
    'automacao': {
        title: 'Automação Inteligente (WhatsApp e Atendimento)',
        icon: 'fa-robot',
        color: 'text-purple-400',
        bg: 'bg-purple-500/10',
        content: '<p>Imagine ter um funcionário que não dorme, não tira férias e não erra processos repetitivos. Através de ferramentas como n8n, Make e Playwright, mapeio os gargalos operacionais da sua empresa e crio robôs e agentes de IA que conversam no WhatsApp, qualificam leads e alimentam seu CRM automaticamente.</p><p class="mt-4 font-bold">O resultado? Sua equipe foca em estratégia e vendas, enquanto a automação faz o trabalho pesado.</p>',
        mockup: {
            type: 'chat',
            caption: 'Simulação de atendimento',
            headerIcon: 'fa-whatsapp', headerIconPrefix: 'fab', headerLabel: 'WhatsApp Business',
            messages: [
                { type: 'in', text: 'Oi! Vocês têm horário disponível amanhã?' },
                { type: 'out', text: 'Consultando a agenda automaticamente...' },
                { type: 'out ai', text: '✅ Encontrei! 14h ou 16h, qual prefere?' }
            ]
        }
    },
    'otimizacao': {
        title: 'Otimização de Processos com IA',
        icon: 'fa-bolt',
        color: 'text-yellow-400',
        bg: 'bg-yellow-500/10',
        content: '<p>Seu time perde muito tempo com planilhas e copiar/colar de dados? Mapeio sua esteira de trabalho (RH, Financeiro, Vendas) e substituo essas rotinas lentas por fluxos inteligentes turbinados com Inteligência Artificial.</p><p class="mt-4 font-bold">A IA lê documentos, extrai informações, toma decisões simples e executa em segundos tarefas operacionais que normalmente levariam horas do seu dia.</p>',
        mockup: {
            type: 'workflow',
            caption: 'Prévia de um fluxo de automação'
        }
    },
    'assistentes': {
        title: 'Implantação de Assistentes Virtuais Corporativos',
        icon: 'fa-headset',
        color: 'text-pink-400',
        bg: 'bg-pink-500/10',
        content: '<p>Esqueça o ChatGPT genérico. Eu crio e implanto uma IA treinada exclusivamente com os dados, manuais e histórico da sua própria empresa.</p><p class="mt-4 font-bold">O resultado é um Assistente Virtual Interno que ajuda seus funcionários a encontrarem respostas, criarem propostas e tirarem dúvidas de forma imediata, reduzindo drasticamente as interrupções diárias aos gestores.</p>',
        mockup: {
            type: 'chat',
            caption: 'Assistente treinado com seus dados',
            headerIcon: 'fa-headset', headerIconPrefix: 'fas', headerLabel: 'Assistente Interno',
            messages: [
                { type: 'in', text: 'Qual o prazo de entrega do contrato X?' },
                { type: 'out', text: 'Consultando a base de documentos...' },
                { type: 'out ai', text: '📄 Prazo: 15 dias úteis, conforme cláusula 4.2' }
            ]
        }
    },
    'agentes': {
        title: 'Agentes Autônomos Específicos',
        icon: 'fa-brain',
        color: 'text-indigo-400',
        bg: 'bg-indigo-500/10',
        content: '<p>Desenvolvo agentes de Inteligência Artificial especializados para áreas específicas do seu negócio.</p><p class="mt-4 font-bold">Desde um agente que monitora concorrentes e analisa preços, até um agente de suporte técnico nível 1 que resolve sozinho problemas comuns dos seus clientes através de fluxos avançados de automação.</p>',
        mockup: {
            type: 'terminal',
            caption: 'Log do agente em ação',
            lines: [
                { cls: 't-cmd', text: '$ agente.monitorar_concorrentes()' },
                { cls: 't-out', text: '→ 3 preços atualizados detectados' },
                { cls: 't-alert', text: '⚠ Variação de -12% identificada' },
                { cls: 't-ok', text: '✅ Ação disparada automaticamente' }
            ]
        }
    },
    'infra': {
        title: 'Infraestrutura & Nuvem',
        icon: 'fa-server',
        color: 'text-orange-400',
        bg: 'bg-orange-500/10',
        content: '<p>Seu sistema caiu de novo ou está lento? Eu ajudo você a migrar toda a sua infraestrutura on-premise (servidores locais físicos) para soluções em Nuvem escaláveis e modernas.</p><p class="mt-4 font-bold">Aplico práticas avançadas de DevOps e arquitetura Linux/Windows para garantir alta disponibilidade (SLA). Cresça sem medo de quebrar a sua base tecnológica.</p>',
        mockup: {
            type: 'cloud',
            caption: 'Simulação de migração',
            fromIcon: 'fa-server', fromLabel: 'On-Premise',
            toIcon: 'fa-cloud', toLabel: 'Cloud',
            uptimeLabel: '99.9% uptime'
        }
    },
    'seguranca': {
        title: 'Segurança & Gestão de Dados',
        icon: 'fa-shield-halved',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        content: '<p>Dados soltos são um risco financeiro para o seu negócio. Ajudo a proteger sua empresa contra vazamentos e perdas críticas através de auditorias estruturadas, implementação de Políticas e centralização de dados via APIs seguras (Supabase).</p><p class="mt-4 font-bold">Um ambiente tecnológico robusto transmite a máxima confiança para seus maiores clientes.</p>',
        mockup: {
            type: 'security',
            caption: 'Varredura de segurança',
            lines: ['🔒 Firewall ativo', '🔍 Auditoria em andamento...', '✅ Nenhuma ameaça encontrada']
        }
    }
};

export const techDetails = {
    'n8n': {
        title: 'n8n — Automação de Workflows',
        icon: 'fa-project-diagram',
        colorHex: '#EA4B71',
        content: '<p>Uso o n8n como motor principal das automações: conecto WhatsApp, planilhas, CRMs e IA em fluxos visuais que rodam 24/7, sem depender de código para cada integração nova.</p>',
        mockup: { type: 'workflow', caption: 'Fluxo real de automação (n8n)' }
    },
    'make': {
        title: 'Make — Integrações Visuais',
        icon: 'fa-bolt',
        colorHex: '#A644FF',
        content: '<p>Quando o cenário pede uma integração rápida entre apps SaaS, uso o Make para montar cenários visuais que conectam sistemas sem escrever uma linha de código.</p>',
        mockup: {
            type: 'workflow',
            caption: 'Cenário de integração (Make)',
            icons: ['fa-plug', 'fa-shuffle', 'fa-filter', 'fa-check'],
            gradFrom: '#A644FF', gradTo: '#EC4899'
        }
    },
    'supabase': {
        title: 'Supabase — Banco de Dados & APIs',
        icon: 'fa-database',
        colorHex: '#3ECF8E',
        content: '<p>Centralizo dados de automações e aplicações em Supabase: banco Postgres, autenticação e APIs seguras prontas para consumir de qualquer fluxo.</p>',
        mockup: {
            type: 'terminal',
            caption: 'Consulta em tempo real',
            lines: [
                { cls: 't-cmd', text: '$ supabase.from("leads").select()' },
                { cls: 't-out', text: '→ 128 registros retornados' },
                { cls: 't-ok', text: '✅ API respondida em 84ms' }
            ]
        }
    },
    'linux': {
        title: 'Servidores Linux',
        icon: 'fa-linux',
        iconPrefix: 'fab',
        colorHex: '#FCC624',
        content: '<p>Administro servidores Linux (Ubuntu/Debian) para hospedar automações, bancos de dados e serviços internos, com monitoramento e hardening de segurança.</p>',
        mockup: {
            type: 'terminal',
            caption: 'Administração de servidor',
            lines: [
                { cls: 't-cmd', text: '$ systemctl status n8n' },
                { cls: 't-out', text: '→ active (running) há 12 dias' },
                { cls: 't-ok', text: '✅ Uptime estável' }
            ]
        }
    },
    'windows': {
        title: 'Infraestrutura Windows',
        icon: 'fa-windows',
        iconPrefix: 'fab',
        colorHex: '#00A4EF',
        content: '<p>Gerencio ambientes Windows Server, Active Directory e backups corporativos, garantindo alta disponibilidade para operações críticas.</p>',
        mockup: {
            type: 'cloud',
            caption: 'Backup automatizado',
            fromIcon: 'fa-desktop', fromLabel: 'Servidor',
            toIcon: 'fa-hard-drive', toLabel: 'Backup',
            uptimeLabel: '99.9% uptime'
        }
    },
    'microsoft365': {
        title: 'Microsoft 365',
        icon: 'fa-microsoft',
        iconPrefix: 'fab',
        colorHex: '#D83B01',
        content: '<p>Integro automações com Teams, SharePoint e Outlook, levando relatórios e notificações direto para onde a sua equipe já trabalha.</p>',
        mockup: {
            type: 'chat',
            caption: 'Automação no Teams',
            headerIcon: 'fa-microsoft', headerIconPrefix: 'fab', headerLabel: 'Microsoft Teams',
            messages: [
                { type: 'in', text: 'Preciso do relatório mensal de vendas' },
                { type: 'out', text: 'Gerando automaticamente...' },
                { type: 'out ai', text: '📊 Relatório pronto no SharePoint' }
            ]
        }
    }
};
