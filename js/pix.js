import { showToast, getCurrencyValue } from './utils.js';

let currentPixPayload = '';

export function openPixModal() {
    if (navigator.vibrate) navigator.vibrate(12);
    const modal = document.getElementById('pixModal');
    modal.classList.remove('opacity-0', 'pointer-events-none');
    modal.querySelector('.glass-card').style.transform = 'scale(1)';
}

export function closePixModal() {
    const modal = document.getElementById('pixModal');
    modal.classList.add('opacity-0', 'pointer-events-none');
    modal.querySelector('.glass-card').style.transform = 'scale(0.95)';
}

export function generatePix() {
    const valueInput = document.getElementById('pixValue');
    const value = getCurrencyValue(valueInput.value);

    if (!value || value <= 0) {
        showToast('Valor inválido', 'fa-exclamation-circle');
        return;
    }

    const pixKey = '10b6475e-e901-492d-943d-1b0bee70a317';
    const merchantName = 'Allan Anjos';
    const merchantCity = 'Curitiba';
    const formattedValue = value.toFixed(2);

    const payload = buildPixPayload(pixKey, merchantName, merchantCity, formattedValue);
    currentPixPayload = payload;

    document.getElementById('pixPayload').textContent = payload;
    document.getElementById('pixPayloadSection').classList.remove('hidden');
    document.getElementById('copyPixButton').classList.remove('hidden');

    const qrContainer = document.getElementById('qrcode');
    qrContainer.innerHTML = '';
    new QRCode(qrContainer, {
        text: payload,
        width: 200,
        height: 200,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
    document.getElementById('qrCodeSection').classList.remove('hidden');
}

function buildPixPayload(pixKey, merchantName, merchantCity, value) {
    function emvTag(id, value) {
        return id + value.length.toString().padStart(2, '0') + value;
    }

    let payload = emvTag('00', '01');
    payload += emvTag('26', emvTag('00', 'br.gov.bcb.pix') + emvTag('01', pixKey));
    payload += emvTag('52', '0000');
    payload += emvTag('53', '986');
    payload += emvTag('54', value);
    payload += emvTag('58', 'BR');
    payload += emvTag('59', merchantName);
    payload += emvTag('60', merchantCity);
    payload += emvTag('62', emvTag('05', '***'));
    
    payload += '6304';
    payload += calculateCRC16(payload);
    return payload;
}

function calculateCRC16(payload) {
    let crc = 0xFFFF;
    const polynomial = 0x1021;
    for (let i = 0; i < payload.length; i++) {
        crc ^= (payload.charCodeAt(i) << 8);
        for (let j = 0; j < 8; j++) {
            if ((crc & 0x8000) !== 0) crc = (crc << 1) ^ polynomial;
            else crc = crc << 1;
        }
    }
    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

export function copyPixPayload() {
    navigator.clipboard.writeText(currentPixPayload).then(() => {
        showToast('Código PIX copiado!', 'fa-check');
    });
}
