// ==========================================
// MÓDULO DE FINALIZAÇÃO E LIMPEZA DO CAIXA
// ==========================================

function limparAposVenda() {
    // 1. Limpa o carrinho e os totais
    currentCart = [];
    totalAmount = 0.00;
    
    // 2. Reseta os campos de input e visuais da tela
    if (document.getElementById('input-codigo')) document.getElementById('input-codigo').value = '';
    if (document.getElementById('input-qtd')) document.getElementById('input-qtd').value = '1';
    if (document.getElementById('input-preco')) document.getElementById('input-preco').value = '0,00';
    if (document.getElementById('disp-item-total')) document.getElementById('disp-item-total').textContent = '0,00';
    
    // 3. Reseta os campos financeiros (Total, Pagamento, Restante e Troco)
    if (document.getElementById('disp-total-compra')) document.getElementById('disp-total-compra').textContent = '0,00';
    if (document.getElementById('input-pagamento')) document.getElementById('input-pagamento').value = '';
    if (document.getElementById('disp-restante')) document.getElementById('disp-restante').textContent = '0,00';
    if (document.getElementById('disp-troco')) document.getElementById('disp-troco').textContent = '0,00';
    
    // 4. Atualiza o rodapé do recibo/cupom na tela
    if (document.getElementById('receipt-subtotal-val')) document.getElementById('receipt-subtotal-val').textContent = 'R$ 0,00';
    if (document.getElementById('items-count-label')) document.getElementById('items-count-label').textContent = 'TOTAL DE ITENS: 0';
    
    // 5. Mensagem de status e foco de volta no código de barras
    const statusMsg = document.getElementById('status-message');
    if (statusMsg) statusMsg.textContent = "VENDA FINALIZADA - PRONTO PARA NOVO ATENDIMENTO";
    
    // Atualiza a exibição visual da lista de itens vazia
    renderReceipt();
    
    // Retorna o foco para o input de código para o próximo cliente
    const inputCod = document.getElementById('input-codigo');
    if (inputCod) {
        inputCod.disabled = false;
        inputCod.focus();
    }
}
