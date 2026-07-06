const produtosIniciais = [
  {
    id: 1,
    nome: 'Fone Bluetooth',
    descricao: 'Som nítido e bateria de longa duração.',
    preco: 199.9,
    estoque: 12,
    categoria: 'Eletrônicos',
    avaliacoes: [5, 4, 5],
    desc: 'Som nítido e bateria de longa duração.'
  },
  {
    id: 2,
    nome: 'Teclado Gamer',
    descricao: 'Teclas rápidas com iluminação RGB.',
    preco: 249.9,
    estoque: 9,
    categoria: 'Acessórios',
    avaliacoes: [4, 5],
    desc: 'Teclas rápidas com iluminação RGB.'
  },
  {
    id: 3,
    nome: 'Smart Lamp',
    descricao: 'Lâmpada inteligente para decorar e iluminar.',
    preco: 129.9,
    estoque: 7,
    categoria: 'Casa',
    avaliacoes: [5],
    desc: 'Lâmpada inteligente para decorar e iluminar.'
  }
];

const usuariosIniciais = [{ user: 'admin', pass: '123' }];

const produtos = produtosIniciais.map((produto) => ({ ...produto }));
const usuarios = usuariosIniciais.map((usuario) => ({ ...usuario }));

function nextId() {
  return produtos.reduce((maxId, produto) => Math.max(maxId, produto.id), 0) + 1;
}

function normalizeProduto(payload, existingProduto = {}) {
  const nome = String(payload.nome || existingProduto.nome || '').trim();
  const preco = Number(payload.preco ?? existingProduto.preco ?? 0);
  const estoque = Number(payload.estoque ?? existingProduto.estoque ?? 0);
  const categoria = String(payload.categoria || existingProduto.categoria || '').trim();
  const descricao = String(payload.descricao || payload.desc || existingProduto.descricao || existingProduto.desc || '').trim();
  const desc = String(payload.desc || payload.descricao || existingProduto.desc || existingProduto.descricao || '').trim();
  const avaliacoes = Array.isArray(payload.avaliacoes)
    ? payload.avaliacoes
    : Array.isArray(existingProduto.avaliacoes)
      ? existingProduto.avaliacoes
      : [5];

  return {
    id: existingProduto.id,
    nome,
    descricao,
    preco,
    estoque,
    categoria,
    desc,
    avaliacoes
  };
}

function listarProdutos({ busca = '', categoria = '', ordem = 'asc' } = {}) {
  const query = busca.toLowerCase();
  const categoriaFiltro = categoria || '';

  const resultado = produtos.filter((produto) => {
    const atendeBusca = produto.nome.toLowerCase().includes(query);
    const atendeCategoria = !categoriaFiltro || produto.categoria === categoriaFiltro;
    return atendeBusca && atendeCategoria;
  });

  resultado.sort((a, b) => {
    if (ordem === 'desc') {
      return b.preco - a.preco;
    }
    return a.preco - b.preco;
  });

  return resultado;
}

function getProdutoById(id) {
  return produtos.find((produto) => produto.id === Number(id));
}

function adicionarProduto(payload) {
  const id = nextId();
  const novoProduto = normalizeProduto({
    ...payload,
    id,
    avaliacoes: payload.avaliacoes || [5]
  });

  const produtoParaSalvar = {
    ...novoProduto,
    id,
    avaliacoes: Array.isArray(payload.avaliacoes) ? payload.avaliacoes : [5]
  };

  produtos.push(produtoParaSalvar);
  return produtoParaSalvar;
}

function atualizarProduto(id, payload) {
  const index = produtos.findIndex((produto) => produto.id === Number(id));

  if (index === -1) {
    return null;
  }

  const produtoAtualizado = normalizeProduto(payload, produtos[index]);
  produtos[index] = {
    ...produtos[index],
    ...produtoAtualizado,
    id: produtos[index].id,
    avaliacoes: produtoAtualizado.avaliacoes
  };

  return produtos[index];
}

function removerProduto(id) {
  const index = produtos.findIndex((produto) => produto.id === Number(id));

  if (index === -1) {
    return null;
  }

  return produtos.splice(index, 1)[0];
}

function adicionarAvaliacao(id, nota) {
  const produto = getProdutoById(id);

  if (!produto) {
    return null;
  }

  const valor = Number(nota);
  if (!Number.isInteger(valor) || valor < 1 || valor > 5) {
    return null;
  }

  produto.avaliacoes.push(valor);
  return produto;
}

function autenticarUsuario(username, password) {
  return usuarios.find((usuario) => usuario.user === username && usuario.pass === password);
}

module.exports = {
  produtos,
  usuarios,
  listarProdutos,
  getProdutoById,
  adicionarProduto,
  atualizarProduto,
  removerProduto,
  adicionarAvaliacao,
  autenticarUsuario
};
