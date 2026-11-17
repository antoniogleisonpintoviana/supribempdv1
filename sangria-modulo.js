/**
 * MÓDULO DE SANGRIA DE CAIXA - SUPRIBEM PDV
 * Fluxo: Tecla S -> Digita Valor -> Enter -> Senha Supervisor -> Enter -> Registra e Imprime
 */

(function () {
    // Configurações do Módulo
    const SENHAS_SUPERVISOR = ["1234", "031498"]; // Senhas aceitas para autorizar sangria
    window.historicoSangrias = window.historicoSangrias || [];
    window.totalSangrias = window.totalSangrias || 0.00;

    // 1. Injeta o Modal de Sangria no DOM assim que a página carregar
    function criarModalSangria() {
        if (document.getElementById('modal-sangria')) return;

        const modalHTML = `
        <div id="modal-sangria" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center hidden z-[100]">
            <div class="bg-pdv-purple border-2 border-yellow-400 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl font-sans">
                <!-- Cabeçalho -->
                <div class="flex justify-between items-center border-b border-purple-800 pb-3 mb-4">
                    <h3 class="text-lg font-bold text-yellow-400 flex items-center uppercase tracking-wider">
                        <i class="fa-solid fa-money-bill-transfer mr-2"></i> Sangria de Caixa (Retirada)
                    </h3>
                    <button id="btn-fechar-sangria" class="text-gray-400 hover:text-white text-xl font-bold">&times;</button>
                </div>

                <!-- Etapa 1: Valor da Sangria -->
                <div id="sangria-etapa-valor" class="space-y-4">
                    <div class="bg-purple-950 p-3 rounded-lg border border-purple-800 text-xs text-gray-300 flex justify-between">
                        <span>Operador: <b class="text-yellow-300" id="sangria-operador-info">---</b></span>
                        <span>Sangrias hoje: <b class="text-green-400" id="sangria-acumulado-info">R$ 0,00</b></span>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-gray-200 uppercase mb-1">Valor da Sangria (R$):</label>
                        <div class="capsule-input px-4 py-2 flex items-center">
                            <span class="text-gray-500 font-bold mr-2">R$</span>
                            <input id="input-sangria-valor" type="text" inputmode="decimal" placeholder="0,00" 
                                class="w-full text-2xl font-mono font-bold text-gray-900 bg-transparent outline-none" autocomplete="off">
                        </div>
                        <p class="text-[11px] text-yellow-300 mt-1.5"><i class="fa-solid fa-keyboard mr-1"></i> Digite o valor e pressione <b>ENTER</b> para confirmar</p>
                    </div>
                </div>

                <!-- Etapa 2: Senha do Supervisor (Oculta inicialmente) -->
                <div id="sangria-etapa-senha" class="space-y-4 hidden">
                    <div class="bg-yellow-500/20 border border-yellow-400 rounded-lg p-3 text-center">
                        <span class="text-xs uppercase text-yellow-200 block">Confirmar Retirada de:</span>
                        <span id="sangria-valor-confirmacao" class="text-3xl font-black text-yellow-400 font-mono">R$ 0,00</span>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-red-300 uppercase mb-1">
                            <i class="fa-solid fa-shield-halved mr-1"></i> Senha do Supervisor / Fiscal:
                        </label>
                        <div class="capsule-input px-4 py-2 flex items-center border-2 border-red-500">
                            <i class="fa-solid fa-lock text-red-700 mr-2"></i>
                            <input id="input-sangria-senha" type="password" placeholder="••••••" 
                                class="w-full text-xl font-mono font-bold text-gray-900 bg-transparent outline-none tracking-widest" autocomplete="off">
                        </div>
                        <p class="text-[11px] text-gray-300 mt-1.5">Pressione <b>ENTER</b> para autorizar ou <b>ESC</b> para cancelar</p>
                    </div>
                </div>

                <!-- Mensagem de Erro / Feedback -->
                <div id="sangria-feedback" class="mt-3 text-center text-xs font-bold text-red-400 hidden"></div>

                <!-- Rodapé de Atalhos -->
                <div class="mt-5 pt-3 border-t border-purple-800 flex justify-between text-[11px] text-gray-400">
                    <span>[ENTER] Avançar / Confirmar</span>
                    <span>[ESC] Cancelar</span>
                </div>
            </div>
        </div>`;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        configurarEventosModal();
    }

    let valorSangriaAtual = 0;

    // 2. Abre o modal de sangria com validações de segurança
    window.abrirModalSangria = function () {
        if (typeof caixaAberto !== 'undefined' && !caixaAberto) {
            alert("⚠️ Caixa Fechado! Abra o caixa (tecla A ou F1) antes de realizar uma sangria.");
            return;
        }

        if (typeof currentCart !== 'undefined' && currentCart.length > 0) {
            alert("⚠️ Finalize ou cancele o cupom atual antes de realizar uma sangria!");
            return;
        }

        const modal = document.getElementById('modal-sangria');
        const etapaValor = document.getElementById('sangria-etapa-valor');
        const etapaSenha = document.getElementById('sangria-etapa-senha');
        const inputValor = document.getElementById('input-sangria-valor');
        const inputSenha = document.getElementById('input-sangria-senha');
        const feedback = document.getElementById('sangria-feedback');

        // Atualiza informações na tela
        document.getElementById('sangria-operador-info').textContent = typeof operadorLogado !== 'undefined' ? operadorLogado : "Operador";
        document.getElementById('sangria-acumulado-info').textContent = `R$ ${formatarMoeda(window.totalSangrias)}`;

        // Reseta estado do modal
        valorSangriaAtual = 0;
        inputValor.value = '';
        inputSenha.value = '';
        feedback.classList.add('hidden');
        etapaValor.classList.remove('hidden');
        etapaSenha.classList.add('hidden');

        modal.classList.remove('hidden');
        setTimeout(() => inputValor.focus(), 50);
    };

    // 3. Fecha o modal e devolve o foco ao leitor de código de barras
    window.fecharModalSangria = function () {
        const modal = document.getElementById('modal-sangria');
        if (modal) modal.classList.add('hidden');
        const inputCodigo = document.getElementById('input-codigo');
        if (inputCodigo && !inputCodigo.disabled) {
            setTimeout(() => inputCodigo.focus(), 50);
        }
    };

    // 4. Configura teclas Enter e ESC dentro do fluxo de sangria
    function configurarEventosModal() {
        const inputValor = document.getElementById('input-sangria-valor');
        const inputSenha = document.getElementById('input-sangria-senha');
        const btnFechar = document.getElementById('btn-fechar-sangria');
        const feedback = document.getElementById('sangria-feedback');

        btnFechar.addEventListener('click', fecharModalSangria);

        // Formata entrada para aceitar apenas números, vírgula e ponto
        inputValor.addEventListener('input', function () {
            this.value = this.value.replace(/[^0-9.,]/g, '');
        });

        // ENTER no campo de Valor -> Vai para Senha do Supervisor
        inputValor.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();

                const valorNum = parseFloat(this.value.replace(/\./g, '').replace(',', '.'));
                if (isNaN(valorNum) || valorNum <= 0) {
                    mostrarErro("Digite um valor válido maior que R$ 0,00!");
                    return;
                }

                valorSangriaAtual = Math.round(valorNum * 100) / 100;
                feedback.classList.add('hidden');

                // Avança para etapa da senha
                document.getElementById('sangria-valor-confirmacao').textContent = `R$ ${formatarMoeda(valorSangriaAtual)}`;
                document.getElementById('sangria-etapa-valor').classList.add('hidden');
                document.getElementById('sangria-etapa-senha').classList.remove('hidden');
                setTimeout(() => inputSenha.focus(), 50);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                fecharModalSangria();
            }
        });

        // ENTER no campo de Senha -> Valida e Registra Sangria
        inputSenha.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();

                const senha = this.value.trim();
                if (!SENHAS_SUPERVISOR.includes(senha)) {
                    mostrarErro("❌ Senha do supervisor incorreta!");
                    this.value = '';
                    this.focus();
                    return;
                }

                registrarSangria(valorSangriaAtual);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                fecharModalSangria();
            }
        });
    }

    function mostrarErro(msg) {
        const feedback = document.getElementById('sangria-feedback');
        feedback.textContent = msg;
        feedback.classList.remove('hidden');
    }

    // 5. Efetiva o registro da sangria e exibe comprovante na bobina
    function registrarSangria(valor) {
        const agora = new Date();
        const registro = {
            id: window.historicoSangrias.length + 1,
            valor: valor,
            dataHora: `${agora.toLocaleDateString('pt-BR')} ${agora.toLocaleTimeString('pt-BR')}`,
            operador: typeof operadorLogado !== 'undefined' ? operadorLogado : "001 - Gleison"
        };

        window.historicoSangrias.push(registro);
        window.totalSangrias = Math.round((window.totalSangrias + valor) * 100) / 100;

        // Toca o bip se a função existir no sistema
        if (typeof tocarBip === 'function') tocarBip();

        // Atualiza barra de status do PDV
        const statusMsg = document.getElementById('status-message');
        if (statusMsg) {
            statusMsg.textContent = `SANGRIA REGISTRADA: - R$ ${formatarMoeda(valor)} (TOTAL: R$ ${formatarMoeda(window.totalSangrias)})`;
        }

        // Imprime comprovante não-fiscal na bobina do PDV
        imprimirComprovanteSangria(registro);

        fecharModalSangria();
    }

    function imprimirComprovanteSangria(reg) {
        const receiptContainer = document.getElementById('receipt-items-container');
        const emptyMsg = document.getElementById('empty-receipt-msg');
        if (!receiptContainer) return;

        if (emptyMsg) emptyMsg.classList.add('hidden');

        const comprovanteHTML = `
        <div class="bg-amber-100/90 border-2 border-dashed border-pdv-border-red p-3 my-2 rounded text-xs font-mono text-gray-900 item-row-new">
            <div class="text-center font-bold border-b border-pdv-border-red pb-1 mb-1">
                *** COMPROVANTE DE SANGRIA #${String(reg.id).padStart(3, '0')} ***
            </div>
            <div class="flex justify-between"><span>DATA/HORA:</span><span>${reg.dataHora}</span></div>
            <div class="flex justify-between"><span>OPERADOR:</span><span>${reg.operador}</span></div>
            <div class="flex justify-between"><span>AUTORIZAÇÃO:</span><span>SUPERVISOR OK</span></div>
            <div class="flex justify-between font-bold text-sm text-red-700 border-t border-pdv-border-red pt-1 mt-1">
                <span>VALOR RETIRADO:</span>
                <span>- R$ ${formatarMoeda(reg.valor)}</span>
            </div>
            <div class="text-center text-[10px] text-gray-600 mt-2">
                Assinatura Supervisor: _______________________
            </div>
        </div>`;

        receiptContainer.insertAdjacentHTML('beforeend', comprovanteHTML);
        receiptContainer.scrollTop = receiptContainer.scrollHeight;
    }

    function formatarMoeda(val) {
        return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    // 6. Escuta global da tecla 'S' (e comunicação com teclado.html via postMessage)
    window.addEventListener('keydown', function (event) {
        const modalSangria = document.getElementById('modal-sangria');
        const modalAberto = modalSangria && !modalSangria.classList.contains('hidden');

        if (event.key === 'Escape' && modalAberto) {
            event.preventDefault();
            fecharModalSangria();
            return;
        }

        // Aciona sangria com a tecla 'S' (evita conflito se o modal já estiver aberto)
        if (event.key.toLowerCase() === 's' && !modalAberto) {
            // Se o campo de código estiver vazio, abre a sangria mesmo com foco nele
            const active = document.activeElement;
            if (active && active.id === 'input-codigo' && active.value.trim() !== '') return;
            if (active && active.tagName === 'INPUT' && active.id !== 'input-codigo') return;

            event.preventDefault();
            abrirModalSangria();
        }
    });

    // Suporte caso o teclado.html envie evento via postMessage
    window.addEventListener('message', function (event) {
        if (event.data === 'SANGRIA' || (event.data && event.data.acao === 'SANGRIA')) {
            abrirModalSangria();
        }
    });

    // Inicializa quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', criarModalSangria);
    } else {
        criarModalSangria();
    }
})();
