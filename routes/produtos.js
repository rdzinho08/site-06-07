const express = require('express');
const {
  listarProdutos,
  getProdutoById,
  adicionarProduto,
  atualizarProduto,
  removerProduto,
  adicionarAvaliacao
} = require('../data/mockDb');

const router = express.Router();

router.get('/', (req, res) => {
  const busca = req.query.busca || '';
  const categoria = req.query.categoria || '';
  const ordem = req.query.ordem || 'asc';

  const produtos = listarProdutos({ busca, categoria, ordem });
  res.json(produtos);
});

router.get('/:id', (req, res) => {
  const produto = getProdutoById(req.params.id);

  if (!produto) {
    return res.status(404).json({ erro: 'Produto não encontrado.' });
  }

  res.json(produto);
});

router.post('/', (req, res) => {
  const { nome, preco, estoque, categoria } = req.body;

  if (!nome || preco === undefined || estoque === undefined || !categoria) {
    return res.status(400).json({ erro: 'Preencha nome, preço, estoque e categoria.' });
  }

  const produto = adicionarProduto(req.body);
  res.status(201).json(produto);
});

router.put('/:id', (req, res) => {
  const produto = atualizarProduto(req.params.id, req.body);

  if (!produto) {
    return res.status(404).json({ erro: 'Produto não encontrado.' });
  }

  res.json(produto);
});

router.delete('/:id', (req, res) => {
  const produto = removerProduto(req.params.id);

  if (!produto) {
    return res.status(404).json({ erro: 'Produto não encontrado.' });
  }

  res.json({ mensagem: 'Produto removido com sucesso.', produto });
});

router.post('/:id/avaliacoes', (req, res) => {
  const produto = adicionarAvaliacao(req.params.id, req.body.nota);

  if (!produto) {
    return res.status(400).json({ erro: 'Nota inválida.' });
  }

  res.status(201).json(produto);
});

module.exports = router;
