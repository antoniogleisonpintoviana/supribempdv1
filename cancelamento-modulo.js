/**
 * MÓDULO ISOLADO DE CANCELAMENTO DE ITEM E CUPOM - PDV SUPRIBEM
 * Arquivo: cancelamento-modulo.js
 * 
 * Atalhos configurados:
 * - F4: Cancelar um item específico (pelo número no cupom, ex: 001, trazendo o último como padrão)
 * - F8: Cancelar o cupom inteiro (limpa toda a venda em andamento)
 */

(function () {
    const SENHA_SUPERVISOR = "031498";

    function verificarPermissaoSupervisor(acaoTexto) {
        const senha = prompt(
            `--- AUTORIZAÇÃO DE SUPERVISOR ---\nAção: ${acaoTexto}\n\nDigite a senha de autorização:`
        );
        if (senha === null) return false;
        if (senha !== SENHA_SUPERVISOR) {
            alert("❌ Senha de supervisor incorreta! Operação não autorizada.");
            return false;
        }
        return true;
    }

    function cancelarItem() {
        if (typeof caixaAberto === 'undefined' || !caixaAberto) {
            alert("Caixa fechado! Abra o caixa antes de realizar cancelamentos.");
            return;
        }

        if (!Array.isArray(currentCart) || currentCart.length === 0) {
            alert("Não há itens registrados no cupom atual para cancelar.");
            return;
        }

        const ultimoNumero = currentCart.length;
        const listaResumo = currentCart
            .map((item, idx) => `${String(idx + 1).padStart(3, '0')} - ${item.name} (R$ ${formatBRL(item.total)})`)
            .join('\n');

        const entrada = prompt(
            `--- CANCELAMENTO DE ITEM ---\nDigite o NÚMERO do item que deseja cancelar (1 a ${ultimoNumero}):\n\n${listaResumo}`,
            String(ultimoNumero)
        );

        if (entrada === null) return;

        const numeroItem = parseInt(entrada.trim(), 10);
        if (isNaN(numeroItem) || numeroItem < 1 || numeroItem > currentCart.length) {
            alert("❌ Número de item inválido!");
            return;
        }

        const itemAlvo = currentCart[numeroItem - 1];

        if (!verificarPermissaoSupervisor(`Cancelar Item ${String(numeroItem).padStart(3, '0')} - ${itemAlvo.name}`)) {
            return;
        }

        // Remove o item e reordena a numeração
        currentCart.splice(numeroItem - 1, 1);
        currentCart.forEach((item, idx) => {
            item.id = idx + 1;
        });

        // Zera pagamento caso já tivesse sido digitado
        const inputPagamentoEl = document.getElementById('input-pagamento');
        if (inputPagamentoEl) inputPagamentoEl.value = '';

        // Atualiza o cupom e os totais usando as funções do seu PDV
        if (typeof renderReceipt === 'function') {
            renderReceipt();
        }

        const statusMsgEl = document.getElementById('status-message');
        if (statusMsgEl) {
            statusMsgEl.textContent = `ITEM CANCELADO: ${itemAlvo.name}`;
        }

        const inputCodigoEl = document.getElementById('input-codigo');
        if (inputCodigoEl) inputCodigoEl.focus();
    }

    function cancelarCupom() {
        if (typeof caixaAberto === 'undefined' || !caixaAberto) {
            alert("Caixa fechado! Abra o caixa antes de realizar cancelamentos.");
            return;
        }

        if (!Array.isArray(currentCart) || currentCart.length === 0) {
            alert("O cupom já está vazio. Não há venda em andamento para cancelar.");
            return;
        }

        const confirmar = confirm(
            `--- CANCELAMENTO DE CUPOM ---\nDeseja realmente cancelar TODA a venda atual?\n\nItens no cupom: ${currentCart.length}\nTotal: R$ ${formatBRL(totalAmount)}`
        );
        if (!confirmar) return;

        if (!verificarPermissaoSupervisor(`Cancelamento Total de Cupom (R$ ${formatBRL(totalAmount)})`)) {
            return;
        }

        // Esvazia o carrinho mantendo a referência do array original
        currentCart.length = 0;

        const inputPagamentoEl = document.getElementById('input-pagamento');
        const inputPrecoEl = document.getElementById('input-preco');
        const dispItemTotalEl = document.getElementById('disp-item-total');
        const inputCodigoEl = document.getElementById('input-codigo');
        const inputQtdEl = document.getElementById('input-qtd');
        const statusMsgEl = document.getElementById('status-message');

        if (inputPagamentoEl) inputPagamentoEl.value = '';
        if (inputPrecoEl) inputPrecoEl.value = '';
        if (dispItemTotalEl) dispItemTotalEl.textContent = '0,00';
        if (inputCodigoEl) inputCodigoEl.value = '';
        if (inputQtdEl) inputQtdEl.value = '1';

        if (typeof renderReceipt === 'function') {
            renderReceipt();
        }

        if (statusMsgEl) {
            statusMsgEl.textContent = "CUPOM CANCELADO PELO OPERADOR - CAIXA LIVRE";
        }

        if (inputCodigoEl) inputCodigoEl.focus();
    }

    // Expõe globalmente caso queira vincular a botões ou teclado virtual no futuro
    window.cancelarItemPDV = cancelarItem;
    window.cancelarCupomPDV = cancelarCupom;

    // Escuta F4 e F8 em modo captura para não interferir nos outros atalhos
    window.addEventListener('keydown', function (event) {
        if (event.repeat) return;

        if (event.key === 'F4') {
            event.preventDefault();
            cancelarItem();
        } else if (event.key === 'F8') {
            event.preventDefault();
            cancelarCupom();
        }
    }, true);
})();