// ==========================================
// MÓDULO DE VALIDAÇÃO DE PRODUTOS
// ==========================================

function alertarProdutoNaoCadastrado(codigo) {
    const statusMsg = document.getElementById('status-message');
    if (statusMsg) {
        // Exibe a frase em vermelho na barra de status
        statusMsg.innerHTML = `<span class="text-red-500 font-bold uppercase tracking-wide">PRODUTO NÃO CADASTRADO (${codigo})</span>`;
    }
}