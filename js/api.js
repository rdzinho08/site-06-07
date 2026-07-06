async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    throw new Error(data.erro || data.mensagem || 'Erro inesperado na requisição.');
  }

  return data;
}

const api = {
  async listarProdutos(filtros = {}) {
    const params = new URLSearchParams();
    if (filtros.busca) params.set('busca', filtros.busca);
    if (filtros.categoria) params.set('categoria', filtros.categoria);
    if (filtros.ordem) params.set('ordem', filtros.ordem);

    const query = params.toString();
    return request(`/api/produtos${query ? `?${query}` : ''}`);
  },

  async getProduto(id) {
    return request(`/api/produtos/${id}`);
  },

  async criarProduto(produto) {
    return request('/api/produtos', {
      method: 'POST',
      body: JSON.stringify(produto)
    });
  },

  async atualizarProduto(id, produto) {
    return request(`/api/produtos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(produto)
    });
  },

  async excluirProduto(id) {
    return request(`/api/produtos/${id}`, {
      method: 'DELETE'
    });
  },

  async avaliarProduto(id, nota) {
    return request(`/api/produtos/${id}/avaliacoes`, {
      method: 'POST',
      body: JSON.stringify({ nota })
    });
  },

  async login(usuario, senha) {
    return request('/api/login', {
      method: 'POST',
      body: JSON.stringify({ user: usuario, pass: senha })
    });
  },

  async logout() {
    return request('/api/logout', {
      method: 'POST'
    });
  },

  async getMe() {
    return request('/api/me');
  },

  async getCarrinho() {
    return request('/api/carrinho');
  },

  async addCarrinho(id) {
    return request('/api/carrinho', {
      method: 'POST',
      body: JSON.stringify({ id })
    });
  },

  async finalizarCompra() {
    return request('/api/carrinho/finalizar', {
      method: 'POST'
    });
  }
};
