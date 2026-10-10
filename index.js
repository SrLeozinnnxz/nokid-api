const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

app.use(cors());
app.use(express.json());

// ==========================================
// CONEXÃO COM O BANCO DE DADOS POSTGRESQL
// ==========================================

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 5000
});

// ==========================================
// ROTA DE TESTE DA API
// ==========================================

app.get('/ping', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API do NOKID está online!'
  });
});

// ==========================================
// TESTE DE CONEXÃO COM O POSTGRESQL
// ==========================================

app.get('/db-check', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() AS time');

    res.json({
      status: 'ok',
      database: 'connected',
      time: result.rows[0].time
    });
  } catch (err) {
    console.error(
      'Erro ao conectar ao PostgreSQL:',
      err.message
    );

    res.status(500).json({
      status: 'error',
      database: 'unavailable'
    });
  }
});

// ==========================================
// STATUS DO SERVIDOR NOKID ROLEPLAY
// ==========================================

app.get('/status', (req, res) => {
  res.json({
    online: true,
    players: 128,
    maxPlayers: 500,
    ping: 28,
    region: 'SA - São Paulo',
    statusText: 'NOKID ROLEPLAY'
  });
});

// ==========================================
// ROTAS DO LAUNCHER
// SIMULADAS POR ENQUANTO
// ==========================================

app.post('/serverValidatePlayer', (req, res) => {
  // A validação real do jogador será implementada
  // posteriormente usando o banco de dados.
  res.json({
    permitido: true,
    mensagem: 'Jogador validado com sucesso!'
  });
});

app.post('/serverRegisterPlayer', (req, res) => {
  // O cadastro real será implementado futuramente.
  res.json({
    permitido: true,
    mensagem: 'Jogador registrado com sucesso!'
  });
});

app.post('/serverGetConfig', (req, res) => {
  res.json({
    ip: '127.0.0.1',
    porta: 7777,
    mensagem: 'Configuração carregada'
  });
});

app.post('/serverGetModsManifest', (req, res) => {
  res.json({
    version: '1.0',
    files: []
  });
});

// ==========================================
// INICIALIZAÇÃO DA API
// ==========================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor NOKID API rodando na porta ${PORT}`);
});
