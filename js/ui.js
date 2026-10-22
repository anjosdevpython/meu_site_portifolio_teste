import { showToast } from './utils.js';
import { serviceDetails, techDetails } from './data.js';

export function startTypewriter() {
    const el = document.querySelector('.typing-text');
    if (!el) return;
    
    const titles = [
        'Estrategista em Automação',
        'Desenvolvedor de Agentes IA & Bots',
        'Expert em Modernização de TI',
        'Especialista em Integrações'
    ];
    
    let titleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100;

    function type() {
        const currentTitle = titles[titleIndex];
        
        if (isDeleting) {
            el.textContent = currentTitle.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 50;
        } else {
            el.textContent = currentTitle.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 150;
        }

        if (!isDeleting && charIndex === currentTitle.length) {
            isDeleting = true;
            typeSpeed = 2000;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            titleIndex = (titleIndex + 1) % titles.length;
            typeSpeed = 500;
        }

        setTimeout(type, typeSpeed);
    }

    type();
}

export function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        updateThemeIcon(true);
    }
}

export function toggleTheme() {
    if (navigator.vibrate) navigator.vibrate(12);
    const html = document.documentElement;
    const isLight = html.getAttribute('data-theme') === 'light';
    
    if (isLight) {
        html.removeAttribute('data-theme');
        localStorage.setItem('theme', 'dark');
        updateThemeIcon(false);
    } else {
        html.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        updateThemeIcon(true);
    }
    
    // Re-init particles if function is available globally
    if(window.initParticles) window.initParticles();
}

function updateThemeIcon(isLight) {
    const icons = ['themeIcon', 'themeIconMobile'];
    icons.forEach(id => {
        const icon = document.getElementById(id);
        if (icon) icon.className = isLight ? 'fas fa-sun' : 'fas fa-moon';
    });
}

export function initCarousel() {
    const track = document.getElementById('bento-carousel');
    const dots = document.querySelectorAll('#carousel-dots-bento span');
    
    if (!track || !dots.length) return;

    let currentSlide = 0;
    const slideCount = dots.length;
    let autoInterval;

    function goToSlide(index) {
        currentSlide = index;
        track.style.transform = `translateX(-${index * 100}%)`;
        
        dots.forEach((dot, i) => {
            if (i === index) {
                dot.className = 'w-4 h-1.5 rounded-full bg-tech-500 transition-all cursor-pointer';
            } else {
                dot.className = 'w-1.5 h-1.5 rounded-full bg-white/20 transition-all cursor-pointer';
            }
        });
    }

    dots.forEach((dot, i) => {
        dot.onclick = () => {
            clearInterval(autoInterval);
            goToSlide(i);
            startAuto();
        };
    });

    function startAuto() {
        autoInterval = setInterval(() => {
            currentSlide = (currentSlide + 1) % slideCount;
            goToSlide(currentSlide);
        }, 5000);
    }

    startAuto();
}

export function openConsultationModal() {
    document.getElementById('consultationModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

export function closeConsultationModal() {
    document.getElementById('consultationModal').classList.add('hidden');
    document.body.style.overflow = '';
}

export async function handleConsultationSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    try {
        const response = await fetch('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(formData).toString()
        });

        if (response.ok) {
            showToast('Enviado com sucesso!', 'fa-check-circle');
            closeConsultationModal();
            form.reset();
        } else {
            showToast('Erro ao enviar.', 'fa-times');
        }
    } catch (e) {
        showToast('Erro de conexão.', 'fa-wifi');
    }
}

function renderWorkflowMockup(cfg) {
    const icons = (cfg && cfg.icons) || ['fa-bolt', 'fa-code-branch', 'fa-filter', 'fa-check'];
    const gradFrom = (cfg && cfg.gradFrom) || '#06b6d4';
    const gradTo = (cfg && cfg.gradTo) || '#a855f7';
    return `
        <div class="mock-workflow">
            <svg viewBox="0 0 300 140" preserveAspectRatio="xMidYMid meet">
                <defs>
                    <linearGradient id="wfGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stop-color="${gradFrom}" />
                        <stop offset="100%" stop-color="${gradTo}" />
                    </linearGradient>
                </defs>
                <path class="wf-path" d="M40,70 C90,70 90,30 140,30" />
                <path class="wf-path" d="M40,70 C90,70 90,110 140,110" />
                <path class="wf-path delay-1" d="M140,30 C190,30 190,70 240,70" />
                <path class="wf-path delay-1" d="M140,110 C190,110 190,70 240,70" />
            </svg>
            <div class="wf-node n1" style="left:40px; top:70px;"><i class="fas ${icons[0]}"></i></div>
            <div class="wf-node n2" style="left:140px; top:30px;"><i class="fas ${icons[1]}"></i></div>
            <div class="wf-node n3" style="left:140px; top:110px;"><i class="fas ${icons[2]}"></i></div>
            <div class="wf-node n4" style="left:240px; top:70px;"><i class="fas ${icons[3]}"></i></div>
        </div>`;
}

function renderChatMockup(cfg) {
    const bubbles = cfg.messages.map(m => `<div class="mock-bubble ${m.type}">${m.text}</div>`).join('');
    return `
        <div class="mock-chat">
            <div class="mock-chat-header"><i class="${cfg.headerIconPrefix || 'fas'} ${cfg.headerIcon}"></i> ${cfg.headerLabel}</div>
            ${bubbles}
        </div>`;
}

function renderTerminalMockup(cfg) {
    const lines = cfg.lines.map(l => `<p class="${l.cls}">${l.text}</p>`).join('');
    return `
        <div class="mock-terminal">
            <div class="mock-terminal-bar"><span></span><span></span><span></span></div>
            <div class="mock-terminal-body">${lines}</div>
        </div>`;
}

function renderCloudMockup(cfg) {
    return `
        <div class="mock-cloud">
            <div class="mock-cloud-row">
                <div class="mock-node-icon"><i class="fas ${cfg.fromIcon}"></i><span>${cfg.fromLabel}</span></div>
                <div class="mock-cloud-arrow"><i class="fas fa-arrow-right"></i></div>
                <div class="mock-node-icon glow"><i class="fas ${cfg.toIcon}"></i><span>${cfg.toLabel}</span></div>
            </div>
            <svg class="mock-uptime" viewBox="0 0 200 40" preserveAspectRatio="none">
                <polyline points="0,30 25,28 45,32 65,14 90,20 115,8 140,16 165,6 200,10" />
            </svg>
            <span class="mock-uptime-label">${cfg.uptimeLabel}</span>
        </div>`;
}

function renderSecurityMockup(cfg) {
    const lines = cfg.lines.map(l => `<p>${l}</p>`).join('');
    return `
        <div class="mock-security">
            <div class="mock-shield"><i class="fas fa-shield-halved"></i></div>
            <div class="mock-security-log">${lines}</div>
        </div>`;
}

const mockupRenderers = {
    workflow: renderWorkflowMockup,
    chat: renderChatMockup,
    terminal: renderTerminalMockup,
    cloud: renderCloudMockup,
    security: renderSecurityMockup
};

function buildMockup(cfg) {
    if (!cfg || !mockupRenderers[cfg.type]) return '';
    return `<div class="mock-panel"><span class="mock-caption">${cfg.caption}</span>${mockupRenderers[cfg.type](cfg)}</div>`;
}

function populateAndOpenServiceModal(data) {
    document.getElementById('serviceModalTitle').textContent = data.title;
    document.getElementById('serviceModalContent').innerHTML = data.content;

    const mockupContainer = document.getElementById('serviceModalMockup');
    if (mockupContainer) {
        mockupContainer.innerHTML = data.mockup ? buildMockup(data.mockup) : '';
        mockupContainer.style.display = data.mockup ? '' : 'none';
    }

    const iconContainer = document.getElementById('serviceModalIcon');
    if (data.colorHex) {
        iconContainer.className = 'p-4 rounded-2xl mb-4 inline-block';
        iconContainer.style.color = data.colorHex;
        iconContainer.style.backgroundColor = data.colorHex + '1A';
    } else {
        iconContainer.removeAttribute('style');
        iconContainer.className = `p-4 rounded-2xl ${data.bg} ${data.color} mb-4 inline-block`;
    }
    iconContainer.innerHTML = `<i class="${data.iconPrefix || 'fas'} ${data.icon} text-3xl"></i>`;

    const modal = document.getElementById('serviceModal');
    modal.classList.remove('hidden');
    
    setTimeout(() => {
        modal.classList.remove('opacity-0', 'pointer-events-none');
        modal.querySelector('.glass-card').classList.remove('scale-95');
    }, 10);
}

export function openServiceModal(id) {
    const data = serviceDetails[id];
    if (!data) return;
    populateAndOpenServiceModal(data);
}

export function openTechModal(id) {
    const data = techDetails[id];
    if (!data) return;
    populateAndOpenServiceModal(data);
}

export function closeServiceModal() {
    const modal = document.getElementById('serviceModal');
    modal.classList.add('opacity-0', 'pointer-events-none');
    modal.querySelector('.glass-card').classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

export function openConsultationFromService() {
    closeServiceModal();
    setTimeout(() => {
        openConsultationModal();
    }, 300);
}

export function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    document.querySelectorAll('.scroll-reveal').forEach(el => {
        observer.observe(el);
    });
}

export function initQRCodes() {
    try {
        const profileQRContainer = document.getElementById('profileQRCode');
        if (profileQRContainer) {
            if (!window.QRCode) {
                console.error("QRCode library not loaded on window!");
            } else {
                profileQRContainer.innerHTML = '';
                new window.QRCode(profileQRContainer, {
                    text: window.location.href,
                    width: 90, 
                    height: 90,
                    colorDark: "#000000",
                    colorLight: "#ffffff",
                    correctLevel: window.QRCode.CorrectLevel.L
                });
            }
        }
    } catch (e) {
        console.error("Error in initQRCodes", e);
    }

    const modalQRContainer = document.getElementById('qrcode');
    if (modalQRContainer && window.QRCode) {
        modalQRContainer.innerHTML = '';
        new window.QRCode(modalQRContainer, {
            text: window.location.href,
            width: 140,
            height: 140,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: window.QRCode.CorrectLevel.M
        });
    }
}
