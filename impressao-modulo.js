// impressao-modulo.js - Módulo de Impressão de Cupom Térmico

const ModuloImpressao = (() => {
    const LARGURA_COLUNAS = 48; // Padrão comum para bobinas de 80mm

    function alinharEsquerdaDireita(esquerda, direita) {
        const espacos = LARGURA_COLUNAS - (esquerda.length + direita.length);
        return esquerda + ' '.repeat(Math.max(1, espacos)) + direita;
    }

    function centralizar(texto) {
        if (texto.length >= LARGURA_COLUNAS) return texto.substring(0, LARGURA_COLUNAS);
        const espacosTotal = LARGURA_COLUNAS - texto.length;
        const espacosEsquerda = Math.floor(espacosTotal / 2);
        return ' '.repeat(espacosEsquerda) + texto;
    }

    function linhaSeparadora(caractere = '-') {
        return caractere.repeat(LARGURA_COLUNAS);
    }

    function gerarCupomTexto(dadosVenda) {
        /* 
          dadosVenda esperado: {
              coo: "084920",
              operador: "001 - Gleison",
              itens: [{ id, code, name, qty, unitLabel, unitPrice, total }],
              subtotal: 26.90,
              formaPagamento: "PIX",
              valorPago: 30.00,
              troco: 3.10
          }
        */
        const agora = new Date();
        const dataStr = agora.toLocaleDateString('pt-BR');
        const horaStr = agora.toLocaleTimeString('pt-BR');

        let linhas = [];

        // Cabeçalho da Empresa
        linhas.push(centralizar("SUPRIBEM SUPERMERCADOS LTDA"));
        linhas.push(centralizar("CNPJ: 00.000.000/0001-00"));
        linhas.push(centralizar("AV. AGUANAMBI, 000 - FATIMA"));
        linhas.push(centralizar("FORTALEZA - CEARÁ"));
        linhas.push(linhaSeparadora("="));
        
        linhas.push(centralizar("EXTRATO COMPROVANTE NÃO FISCAL"));
        linhas.push(alinharEsquerdaDireita(`DATA: ${dataStr}`, `HORA: ${horaStr}`));
        linhas.push(alinharEsquerdaDireita(`COO: ${dadosVenda.coo}`, `CAIXA: 01 / OP: ${dadosVenda.operador}`));
        linhas.push(linhaSeparadora("-"));

        // Cabeçalho dos Itens
        linhas.push("ITEM CÓDIGO      DESCRIÇÃO                  QTDxUN   TOTAL");
        linhas.push(linhaSeparadora("-"));

        // Itens do Carrinho
        dadosVenda.itens.forEach((item, index) => {
            let numItem = String(index + 1).padStart(3, '0');
            let codStr = item.code.padEnd(10, ' ').substring(0, 10);
            let descStr = item.name.padEnd(26, ' ').substring(0, 26);
            let qtdPrecStr = `${item.qty} ${item.unitLabel}`.padEnd(8, ' ');
            let totalStr = `R$ ${item.total.toFixed(2)}`.padStart(10, ' ');

            linhas.push(`${numItem} ${codStr} ${descStr}`);
            linhas.push(`         -> ${qtdPrecStr} x R$ ${item.unitPrice.toFixed(2).padStart(6, ' ')}`.padEnd(38) + totalStr);
        });

        linhas.push(linhaSeparadora("-"));

        // Totais e Pagamento
        linhas.push(alinharEsquerdaDireita("TOTAL DE ITENS:", String(dadosVenda.itens.length)));
        linhas.push(alinharEsquerdaDireita("VALOR TOTAL:", `R$ ${dadosVenda.subtotal.toFixed(2)}`));
        linhas.push(alinharEsquerdaDireita(`PAGTO [${dadosVenda.formaPagamento.toUpperCase()}]:`, `R$ ${dadosVenda.valorPago.toFixed(2)}`));
        linhas.push(alinharEsquerdaDireita("TROCO:", `R$ ${dadosVenda.troco.toFixed(2)}`));

        linhas.push(linhaSeparadora("="));
        linhas.push(centralizar("OBRIGADO PELA PREFERÊNCIA!"));
        linhas.push(centralizar("VOLTE SEMPRE!"));
        linhas.push("\n\n\n"); // Espaço para o corte físico do papel

        return linhas.join("\n");
    }

    return {
        gerarCupomTexto
    };
})();

function finalizarVendaEImprimir(formaPagamento, valorPagoCliente) {
    let trocoCalculado = Math.max(0, valorPagoCliente - totalAmount);

    // 1. Monta o objeto com os dados da venda atual
    const dadosCupom = {
        coo: document.getElementById('coo-val').textContent,
        operador: operadorLogado,
        itens: currentCart,
        subtotal: totalAmount,
        formaPagamento: formaPagamento,
        valorPago: valorPagoCliente,
        troco: trocoCalculado
    };

    // 2. Gera o texto estruturado usando o módulo
    const textoFormatado = ModuloImpressao.gerarCupomTexto(dadosCupom);

    // 3. Exibe em um elemento <pre> pré-formatado (num Modal na tela)
    mostrarModalImpressao(textoFormatado);
}

function mostrarModalImpressao(textoCupom) {
    // Cria ou atualiza um modal na tela com fonte monoespaçada estilo recibo térmico
    let modal = document.getElementById('modal-impressao-termica');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-impressao-termica';
        modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-pdv-purple border-2 border-yellow-400 rounded-xl p-4 max-w-md w-full text-white shadow-2xl flex flex-col max-h-[90vh]">
                <h3 class="text-yellow-400 font-bold text-sm mb-2 flex items-center"><i class="fa-solid fa-print mr-2"></i> Prévia da Impressão Térmica</h3>
                <div class="bg-white text-gray-900 font-receipt p-3 rounded text-xs overflow-y-auto flex-1 whitespace-pre border-2 border-dashed border-gray-400" id='conteudo-cupom-termo'></div>
                <div class="flex justify-between mt-3">
                    <button onclick="window.print()" class="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-purple-950 font-bold rounded text-xs transition">Imprimir Real</button>
                    <button onclick="fecharModalImpressao()" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded text-xs transition">Fechar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    document.getElementById('conteudo-cupom-termo').textContent = textoCupom;
    modal.classList.remove('hidden');
}

function fecharModalImpressao() {
    document.getElementById('modal-impressao-termica').classList.add('hidden');
    limparAposVenda(); // Reseta o PDV para o próximo cliente
}
