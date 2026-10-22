let deferredPrompt;

export function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('SW Registered'))
            .catch(err => console.log('SW Error', err));
    }
}

export function initInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
        // e.preventDefault(); // Comentado a pedido para remover o warning no console
        deferredPrompt = e;
        const installBtn = document.getElementById('installAppBtn');
        if (installBtn) installBtn.classList.remove('hidden');
    });

    window.addEventListener('appinstalled', () => {
        deferredPrompt = null;
        const installBtn = document.getElementById('installAppBtn');
        if (installBtn) installBtn.classList.add('hidden');
        showToast('App instalado com sucesso!', 'fa-check');
    });
}

export function installPWA() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
            console.log('User accepted install');
        }
        deferredPrompt = null;
    });
}

export function showToast(msg, icon = 'fa-info-circle') {
    const toast = document.createElement('div');
    toast.className = 'toast flex items-center gap-3';
    toast.innerHTML = `<i class="fas ${icon} text-tech-500"></i><span class="text-sm font-bold text-white">${msg}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 600);
    }, 3000);
}

export function getCurrencyValue(val) {
    let numbers = val.replace(/\\D/g, '');
    return numbers ? parseInt(numbers) / 100 : 0;
}

export function formatCurrency(val) {
    let amount = getCurrencyValue(val);
    return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function downloadVCard() {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:Allan Anjos
N:Anjos;Allan;;;
TITLE:Consultor de TI | Especialista Digital
TEL;TYPE=CELL,VOICE:+5541988875184
TEL;TYPE=WORK,VOICE:+5541984196060
EMAIL;TYPE=INTERNET:allanfelipedosanjos6@gmail.com
URL:https://allananjos.dev.br
URL;TYPE=LinkedIn:https://www.linkedin.com/in/allanfelipe-ti
END:VCARD`;
    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Allan_Anjos.vcf';
    a.click();
    showToast('Contato guardado!', 'fa-download');
}

export async function shareProfile() {
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Allan Anjos - Consultor TI',
                url: window.location.href
            });
        } catch (e) {}
    } else {
        navigator.clipboard.writeText(window.location.href);
        showToast('Link copiado!', 'fa-link');
    }
}
