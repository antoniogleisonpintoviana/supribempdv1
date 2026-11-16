/**
 * MÓDULO ISOLADO DE CANCELAMENTO DE ITEM E CUPOM - PDV SUPRIBEM
 * Arquivo: cancelamento-modulo.js
 * 
 * Controles:
 * - Tecla Q: Abre modal visual de Cancelamento de Item
 *   - Seta Cima / Seta Baixo: Navega pela lista de itens
 *   - Tecla 9: Confirma o item selecionado e abre o campo de senha
 *   - ESC: Fecha a janela sem cancelar
 * - F8: Cancela o cupom inteiro
 */

(function () {
    const SENHA_SUPERVISOR = "031498";
    let modalAberto = false;
    let indiceSelecionado = 0;
    let etapaSenha = false;

    function criarModalCancelamento() {
        if (document.getElementById('modal-cancelar-item')) return;

        const modalHTML = `
        <div id="modal-cancelar-item" class="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center hidden z-[9998]">
            <div class="bg-[#2e0835] border-2 border-yellow-400 rounded-2xl max-w-xl w-full p-5 text-white shadow-2xl font-sans">
                <div class="flex justify-between items-center border-b border-purple-800 pb-3 mb-3">
                    <h3 class="text-lg font-bold text-yellow-400 flex items-center">
                        <i class="fa-solid fa-ban text-red-500 mr-2"></i> CANCELAMENTO DE ITEM
                    </h3>
                    <span class="text-xs font-mono bg-purple-950 px-2 py-1 rounded border border-purple-700 text-gray-300">ESC: Sair</span>
                </div>

                <!-- ETAPA 1: LISTA DE SELEÇÃO -->
                <div id="cancel-etapa-lista">
                    <p class="text-xs text-gray-300 mb-2">
                        Use <b class="text-yellow-300">↑ CIMA</b> e <b class="text-yellow-300">↓ BAIXO</b> para escolher o item e pressione <b class="text-green-400">9</b> para confirmar:
                    </p>
                    <div id="cancel-lista-itens" class="max-h-64 overflow-y-auto space-y-1.5 pr-1 bg-[#1e0423] p-2 rounded-xl border border-purple-900 font-mono text-xs">
                        <!-- Itens injetados via JS -->
                    </div>
                    <div class="mt-4 flex justify-between items-center bg-purple-950/80 px-4 py-2.5 rounded-lg border border-purple-800 text-xs">
                        <span><b class="text-yellow-400">[↑ / ↓]</b> Navegar</span>
                        <span><b class="text-green-400">[Tecla 9]</b> Confirmar Item</span>
                        <span><b class="text-red-400">[ESC]</b> Voltar</span>
                    </div>
                </div>

                <!-- ETAPA 2: SENHA DO SUPERVISOR -->
                <div id="cancel-etapa-senha" class="hidden space-y-3 py-2">
                    <div class="bg-red-950/60 border border-red-700 rounded-xl p-3 text-xs">
                        <span class="text-red-300 block uppercase font-bold mb-1">Item selecionado para estorno:</span>
                        <span id="cancel-item-resumo" class="text-white font-bold text-sm"></span>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-yellow-400 uppercase mb-1">
                            Senha do Supervisor (Pressione ENTER para confirmar):
                        </label>
                        <input id="input-senha-cancelamento" type="password" maxlength="10"
                            class="w-full px-4 py-2.5 rounded-full bg-[#f3f0e8] text-gray-900 font-mono font-bold text-center text-lg tracking-widest outline-none focus:ring-4 focus:ring-yellow-400"
                            placeholder="••••••" autocomplete="off">
                    </div>

                    <p id="cancel-erro-senha" class="text-red-400 text-xs font-bold text-center hidden">
                        ❌ Senha incorreta! Tente novamente ou pressione ESC.
                    </p>
                </div>
            </div>
        </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    function renderizarListaModal() {
        const container = document.getElementById('cancel-lista-itens');
        if (!container) return;

        container.innerHTML = '';

        currentCart.forEach((item, idx) => {
            const selecionado = idx === indiceSelecionado;
            const row = document.createElement('div');
            row.id = `cancel-row-${idx}`;
            row.className = selecionado
                ? 'flex justify-between items-center p-2.5 rounded-lg bg-yellow-400 text-purple-950 font-bold shadow-md transition-all'
                : 'flex justify-between items-center p-2.5 rounded-lg bg-purple-950/60 text-gray-200 border border-purple-800/60 transition-all';

            row.innerHTML = `
                <div class="flex items-center space-x-2 truncate pr-2">
                    <span class="${selecionado ? 'bg-purple-950 text-yellow-400' : 'bg-purple-900 text-yellow-300'} px-1.5 py-0.5 rounded text-[11px] font-bold">
                        ${String(idx + 1).padStart(3, '0')}
                    </span>
                    <span class="truncate">${item.name}</span>
                </div>
                <div class="text-right whitespace-nowrap">
                    <span class="opacity-80 mr-2">${formatQtd(item.qty)} ${item.unitLabel}</span>
                    <span class="font-extrabold">R$ ${formatBRL(item.total)}</span>
                </div>
            `;

            row.addEventListener('click', () => {
                indiceSelecionado = idx;
                renderizarListaModal();
            });

            container.appendChild(row);
        });

        const activeRow = document.getElementById(`cancel-row-${indiceSelecionado}`);
        if (activeRow) {
            activeRow.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }

    function abrirModalCancelarItem() {
        if (typeof caixaAberto === 'undefined' || !caixaAberto) {
            alert("Caixa fechado! Abra o caixa antes de realizar cancelamentos.");
            return;
        }

        if (!Array.isArray(currentCart) || currentCart.length === 0) {
            alert("Não há itens registrados no cupom atual para cancelar.");
            return;
        }

        criarModalCancelamento();

        indiceSelecionado = currentCart.length - 1;
        etapaSenha = false;
        modalAberto = true;

        document.getElementById('cancel-etapa-lista').classList.remove('hidden');
        document.getElementById('cancel-etapa-senha').classList.add('hidden');
        document.getElementById('cancel-erro-senha').classList.add('hidden');

        renderizarListaModal();

        const modal = document.getElementById('modal-cancelar-item');
        modal.classList.remove('hidden');

        if (document.activeElement) {
            document.activeElement.blur();
        }
    }

    function fecharModalCancelarItem() {
        const modal = document.getElementById('modal-cancelar-item');
        if (modal) modal.classList.add('hidden');

        modalAberto = false;
        etapaSenha = false;

        const inputCodigoEl = document.getElementById('input-codigo');
        if (inputCodigoEl && typeof caixaAberto !== 'undefined' && caixaAberto) {
            inputCodigoEl.focus();
        }
    }

    function avancarParaSenha() {
        const itemAlvo = currentCart[indiceSelecionado];
        if (!itemAlvo) return;

        etapaSenha = true;
        document.getElementById('cancel-etapa-lista').classList.add('hidden');
        document.getElementById('cancel-etapa-senha').classList.remove('hidden');
        document.getElementById('cancel-erro-senha').classList.add('hidden');

        document.getElementById('cancel-item-resumo').textContent =
            `${String(indiceSelecionado + 1).padStart(3, '0')} - ${itemAlvo.name} (R$ ${formatBRL(itemAlvo.total)})`;

        const inputSenha = document.getElementById('input-senha-cancelamento');
        inputSenha.value = '';
        setTimeout(() => inputSenha.focus(), 30);
    }

    function executarExclusaoItem() {
        const inputSenha = document.getElementById('input-senha-cancelamento');
        const erroEl = document.getElementById('cancel-erro-senha');

        if (inputSenha.value !== SENHA_SUPERVISOR) {
            erroEl.classList.remove('hidden');
            inputSenha.value = '';
            inputSenha.focus();
            return;
        }

        const itemRemovido = currentCart[indiceSelecionado];

        currentCart.splice(indiceSelecionado, 1);
        currentCart.forEach((item, idx) => {
            item.id = idx + 1;
        });

        const inputPagamentoEl = document.getElementById('input-pagamento');
        if (inputPagamentoEl) inputPagamentoEl.value = '';

        if (typeof renderReceipt === 'function') {
            renderReceipt();
        }

        const statusMsgEl = document.getElementById('status-message');
        if (statusMsgEl) {
            statusMsgEl.textContent = `ITEM CANCELADO: ${itemRemovido.name}`;
        }

        fecharModalCancelarItem();
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

        const senha = prompt(
            `--- AUTORIZAÇÃO DE SUPERVISOR ---\nAção: Cancelamento Total de Cupom (R$ ${formatBRL(totalAmount)})\n\nDigite a senha de autorização:`
        );
        if (senha === null) return;
        if (senha !== SENHA_SUPERVISOR) {
            alert("❌ Senha de supervisor incorreta! Operação não autorizada.");
            return;
        }

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

    window.cancelarItemPDV = abrirModalCancelarItem;
    window.cancelarCupomPDV = cancelarCupom;

    window.addEventListener('keydown', function (event) {
        if (modalAberto) {
            if (event.key === 'Escape') {
                event.preventDefault();
                event.stopImmediatePropagation();
                fecharModalCancelarItem();
                return;
            }

            if (!etapaSenha) {
                if (event.key === 'ArrowUp') {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    indiceSelecionado = (indiceSelecionado - 1 + currentCart.length) % currentCart.length;
                    renderizarListaModal();
                    return;
                }

                if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    indiceSelecionado = (indiceSelecionado + 1) % currentCart.length;
                    renderizarListaModal();
                    return;
                }

                if (event.key === '9') {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    avancarParaSenha();
                    return;
                }
            } else {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    executarExclusaoItem();
                    return;
                }
            }

            if (event.key.toLowerCase() !== 'backspace' && !etapaSenha) {
                event.preventDefault();
                event.stopImmediatePropagation();
            }
            return;
        }

        if (event.repeat) return;

        // Tecla Q (maiúscula ou minúscula) abre o cancelamento de item
        if (event.key.toLowerCase() === 'q') {
            event.preventDefault();
            event.stopImmediatePropagation();
            abrirModalCancelarItem();
        } else if (event.key === 'F8') {
            event.preventDefault();
            cancelarCupom();
        }
    }, true);
})();
