const express = require('express');
const session = require('express-session');
const path = require('path');
const produtosRoutes = require('./routes/produtos');
const authRoutes = require('./routes/auth');
const carrinhoRoutes = require('./routes/carrinho');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'eshop-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax'
  }
}));

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ erro: 'JSON inválido.' });
  }
  next(err);
});

app.use(express.static(path.join(__dirname)));

app.use('/api/produtos', produtosRoutes);
app.use('/api', authRoutes);
app.use('/api/carrinho', carrinhoRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mensagem: 'API funcionando com sucesso!' });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
