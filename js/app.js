const app = {
    async render() {
        const busca = document.getElementById('buscaProd').value.toLowerCase();
        const cat = document.getElementById('filtroCat').value;
        const ordem = document.getElementById('filtroOrdem').value;

        const container = document.getElementById('listaProdutos');

        try {
            const prods = await api.listarProdutos({ busca, categoria: cat, ordem });
            container.innerHTML = prods.map((p) => {
                const totalNotas = p.avaliacoes.reduce((a, b) => a + b, 0);
                const media = p.avaliacoes.length > 0 ? Math.round(totalNotas / p.avaliacoes.length) : 0;

                return `
                <div class="col-md-4 col-lg-3">
                    <div class="card h-100 card-prod shadow-sm">
                        <div class="card-body d-flex flex-column">
                            <div class="d-flex justify-content-between">
                                <small class="text-muted">${p.categoria}</small>
                                <small class="${p.estoque <= 3 ? 'text-danger fw-bold' : 'text-secondary'}">Estoque: ${p.estoque}</small>
                            </div>
                            <h6 class="fw-bold my-1">${p.nome}</h6>
                            <div class="star mb-2" onclick="app.prepararAvaliacao(${p.id})" data-bs-toggle="modal" data-bs-target="#modalAvaliar" title="Clique para avaliar">
                                ${'★'.repeat(media)}${'☆'.repeat(5 - media)}
                                <small class="text-muted">(${p.avaliacoes.length})</small>
                            </div>
                            <p class="text-success fw-bold flex-grow-1">R$ ${Number(p.preco).toFixed(2)}</p>
                            <div class="d-grid gap-2">
                                <button class="btn btn-sm btn-dark" onclick="app.addCarrinho(${p.id})">Comprar</button>
                                <div class="btn-group">
                                    <button class="btn btn-sm btn-outline-secondary" onclick="app.editarProduto(${p.id})" data-bs-toggle="modal" data-bs-target="#modalGerenciar">✏️</button>
                                    <button class="btn btn-sm btn-outline-danger" onclick="app.excluirProduto(${p.id})">🗑️</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
            }).join('');
        } catch (error) {
            container.innerHTML = `<div class="col-12"><div class="alert alert-danger">${error.message}</div></div>`;
        }
    },

    async addCarrinho(id) {
        try {
            const produto = await api.addCarrinho(id);
            await this.updateCartCount();
            alert(`✅ ${produto.item.nome} adicionado ao carrinho!`);
        } catch (error) {
            alert(error.message || 'Não foi possível adicionar o produto ao carrinho.');
        }
    },

    async updateCartCount() {
        try {
            const data = await api.getCarrinho();
            document.getElementById('cart-count').innerText = data.itens.length;
        } catch (error) {
            document.getElementById('cart-count').innerText = '0';
        }
    },

    async abrirCarrinho() {
        const list = document.getElementById('cart-items-list');

        try {
            const data = await api.getCarrinho();
            if (!data.itens.length) {
                list.innerHTML = "<p class='text-center'>Carrinho vazio</p>";
                return;
            }

            let total = 0;
            list.innerHTML = data.itens.map((p) => {
                total += Number(p.preco);
                return `<div class="d-flex justify-content-between border-bottom py-1"><span>${p.nome}</span><b>R$ ${Number(p.preco).toFixed(2)}</b></div>`;
            }).join('') + `<div class="text-end fw-bold mt-2 fs-5">Total: R$ ${total.toFixed(2)}</div>`;
        } catch (error) {
            list.innerHTML = `<p class='text-center text-danger'>${error.message}</p>`;
        }
    },

    async finalizarPedido() {
        try {
            const me = await api.getMe();
            if (!me.user) {
                alert('⚠️ Bloqueado: Faça login para finalizar sua compra!');
                bootstrap.Modal.getInstance(document.getElementById('modalCarrinho')).hide();
                auth.toggleLoginForm();
                return;
            }

            const response = await api.finalizarCompra();
            alert(`🎉 ${response.mensagem}`);
            await this.render();
            await this.updateCartCount();
            bootstrap.Modal.getInstance(document.getElementById('modalCarrinho')).hide();
        } catch (error) {
            alert(error.message || 'Não foi possível finalizar a compra.');
        }
    },

    prepararAvaliacao(id) {
        document.getElementById('avaliarProdId').value = id;
    },

    async salvarAvaliacao() {
        const id = document.getElementById('avaliarProdId').value;
        const nota = parseInt(document.getElementById('notaEstrela').value, 10);

        try {
            await api.avaliarProduto(id, nota);
            alert('⭐ Obrigado pela avaliação!');
            bootstrap.Modal.getInstance(document.getElementById('modalAvaliar')).hide();
            await this.render();
        } catch (error) {
            alert(error.message || 'Não foi possível enviar a avaliação.');
        }
    },

    async salvarProduto() {
        const id = document.getElementById('prodId').value;
        const produto = {
            nome: document.getElementById('prodNome').value,
            preco: parseFloat(document.getElementById('prodPreco').value),
            estoque: parseInt(document.getElementById('prodEstoque').value, 10),
            categoria: document.getElementById('prodCat').value,
            desc: document.getElementById('prodDesc').value,
            descricao: document.getElementById('prodDesc').value
        };

        try {
            if (id) {
                await api.atualizarProduto(id, produto);
            } else {
                await api.criarProduto(produto);
            }

            bootstrap.Modal.getInstance(document.getElementById('modalGerenciar')).hide();
            await this.render();
        } catch (error) {
            alert(error.message || 'Não foi possível salvar o produto.');
        }
    },

    async editarProduto(id) {
        try {
            const p = await api.getProduto(id);
            document.getElementById('prodId').value = p.id;
            document.getElementById('prodNome').value = p.nome;
            document.getElementById('prodPreco').value = p.preco;
            document.getElementById('prodEstoque').value = p.estoque;
            document.getElementById('prodCat').value = p.categoria;
            document.getElementById('prodDesc').value = p.desc || p.descricao || '';
            document.getElementById('tituloModal').innerText = 'Editar Produto';
        } catch (error) {
            alert(error.message || 'Não foi possível editar o produto.');
        }
    },

    async excluirProduto(id) {
        if (confirm('Excluir este produto?')) {
            try {
                await api.excluirProduto(id);
                await this.render();
            } catch (error) {
                alert(error.message || 'Não foi possível excluir o produto.');
            }
        }
    },

    limparForm() {
        document.getElementById('prodId').value = '';
        document.querySelectorAll('#modalGerenciar input, #modalGerenciar textarea').forEach((i) => {
            i.value = '';
        });
        document.getElementById('tituloModal').innerText = 'Novo Produto';
    }
};

const bot = {
    pergunta() {
        const i = document.getElementById('chat-input');
        const b = document.getElementById('chat-body');
        const m = i.value.toLowerCase();
        let r = "Tente 'entrega', 'pagamento' ou 'admin'.";
        if (m.includes('entrega')) r = 'Entregamos em até 5 dias.';
        if (m.includes('pagamento')) r = 'Aceitamos Pix e Cartão.';
        if (m.includes('admin')) r = 'User: admin | Pass: 123';

        b.innerHTML += `<div class='text-end'><b>Você:</b> ${i.value}</div>`;
        b.innerHTML += `<div class='text-primary'><b>Bot:</b> ${r}</div>`;
        i.value = '';
        b.scrollTop = b.scrollHeight;
    }
};

function toggleChat() {
    const c = document.getElementById('chatbot-window');
    c.style.display = c.style.display === 'none' ? 'block' : 'none';
}

document.addEventListener('DOMContentLoaded', async () => {
    await auth.check();
    await app.render();
    await app.updateCartCount();
});