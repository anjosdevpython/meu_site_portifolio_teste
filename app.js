import { 
    registerServiceWorker, 
    initInstallPrompt, 
    installPWA, 
    showToast, 
    downloadVCard, 
    shareProfile 
} from './js/utils.js';

import { 
    openPixModal, 
    closePixModal, 
    generatePix, 
    copyPixPayload 
} from './js/pix.js';

import { 
    startTypewriter, 
    initTheme, 
    toggleTheme, 
    initCarousel, 
    openConsultationModal, 
    closeConsultationModal, 
    handleConsultationSubmit, 
    openServiceModal, 
    openTechModal, 
    closeServiceModal, 
    openConsultationFromService,
    initScrollReveal,
    initQRCodes
} from './js/ui.js';

import { initTilt } from './js/tilt.js';
import { toggleAudio, playHoverTick, playModalSwoosh } from './js/audio.js';
import { initCalculator } from './js/calculator.js';
import { initAgentPet } from './js/agent-pet.js?v=21';

// Bind to window for inline HTML onclick handlers
window.installPWA = installPWA;
window.showToast = showToast;
window.downloadVCard = downloadVCard;
window.shareProfile = shareProfile;

window.toggleAudioState = () => {
    const isMuted = toggleAudio();
    const icon = document.getElementById('audioIcon');
    const iconMobile = document.getElementById('audioIconMobile');
    
    if (isMuted) {
        if (icon) { icon.classList.replace('fa-volume-up', 'fa-volume-mute'); icon.classList.remove('text-tech-400'); }
        if (iconMobile) { iconMobile.classList.replace('fa-volume-up', 'fa-volume-mute'); iconMobile.classList.remove('text-tech-400'); }
        showToast('Áudio desativado', 'info');
    } else {
        if (icon) { icon.classList.replace('fa-volume-mute', 'fa-volume-up'); icon.classList.add('text-tech-400'); }
        if (iconMobile) { iconMobile.classList.replace('fa-volume-mute', 'fa-volume-up'); iconMobile.classList.add('text-tech-400'); }
        showToast('Áudio ativado', 'success');
    }
};

window.openPixModal = openPixModal;
window.closePixModal = closePixModal;
window.generatePix = generatePix;
window.copyPixPayload = copyPixPayload;

window.toggleTheme = toggleTheme;
window.openConsultationModal = openConsultationModal;
window.closeConsultationModal = closeConsultationModal;
window.handleConsultationSubmit = handleConsultationSubmit;
window.openServiceModal = openServiceModal;
window.openTechModal = openTechModal;
window.closeServiceModal = closeServiceModal;
window.openConsultationFromService = openConsultationFromService;

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    startTypewriter();
    initCarousel();
    initScrollReveal();
    initQRCodes();
    initInstallPrompt();
    registerServiceWorker();
    initTilt();
    initCalculator();
    initAgentPet();

    // Setup global audio listeners for interactions
    document.querySelectorAll('button, a').forEach(el => {
        el.addEventListener('mouseenter', playHoverTick);
    });
    
    document.querySelectorAll('.glass-button, .bg-tech-500').forEach(el => {
        el.addEventListener('click', playModalSwoosh);
    });

    // Setup Consultation Form
    const consultationForm = document.getElementById('consultationForm');
    if (consultationForm) {
        consultationForm.addEventListener('submit', handleConsultationSubmit);
    }
});
