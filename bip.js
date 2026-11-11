// ==========================================
// SCRIPT EXCLUSIVO PARA O SOM DO BIP DO PDV
// ==========================================

// Função simples para disparar o som do bip
function tocarBip() {
    const audio = document.getElementById('audio-bip');
    if (audio) {
        audio.currentTime = 0; // Reinicia o áudio caso passe produtos muito rápido
        audio.play().catch(e => console.log("Áudio aguardando interação inicial...", e));
    }
}

// Escuta a tecla ENTER no campo de código de barras
document.addEventListener('DOMContentLoaded', () => {
    const inputCodigo = document.getElementById('input-codigo');
    
    if (inputCodigo) {
        inputCodigo.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                tocarBip(); // Toca o bip assim que der Enter
            }
        });
    }
});