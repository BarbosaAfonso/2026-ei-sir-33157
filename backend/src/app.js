const express = require('express');
const cors = require('cors');

const cursoRoutes = require('./routes/cursoRoutes');
const alunoRoutes = require('./routes/alunoRoutes');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*' }));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ mensagem: 'API Escola a funcionar', endpoints: ['/cursos', '/alunos'] });
});

app.use('/cursos', cursoRoutes);
app.use('/alunos', alunoRoutes);

// Rota não encontrada
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

// Tratamento global de erros
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({ erro: err.message });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ erro: 'ID inválido' });
  }
  console.error(err);
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

module.exports = app;
