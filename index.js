```javascript
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

app.use(cors());
app.use(express.json());

// ==========================================
// CONEXAO COM O POSTGRESQL
// ==========================================

const databaseUrl = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl
    ? { rejectUnauthorized: false }
    : false,
  connectionTimeoutMillis: 10000
});

pool.on('error', (err) => {
  console.error(
    'Erro inesperado no PostgreSQL:',
    err.message || err.code || String(err)
  );
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
// TESTE DE CONEXAO COM O BANCO
// ==========================================

app.get('/db-check', async (req, res) => {
  if (!databaseUrl) {
    console.error('DATABASE_URL nao esta configurada.');

    return res.status(500).json({
      status: 'error',
      database: 'unavailable',
      message: 'DATABASE_URL nao configurada no Render.'
    });
  }

  let client;

  try {
    client = await pool.connect();

    const result = await client.query(
      'SELECT NOW() AS time'
    );

    console.log('PostgreSQL conectado com sucesso.');

    return res.json({
      status: 'ok',
      database: 'connected',
      time: result.rows[0].time
    });
  } catch (err) {
    console.error('Falha na conexao PostgreSQL:', {
      name: err.name,
      message: err.message,
      code: err.code,
      severity: err.severity,
      detail: err.detail,
      hint: err.hint
    });

    return res.status(500).json({
      status: 'error',
      database: 'unavailable',
      message: 'Falha na conexao. Consulte os logs do Render.'
    });
  } finally {
    if (client) {
      client.release();
    }
  }
});

// ==========================================
// STATUS DO NOKID ROLEPLAY
// ==========================================

app.get('/status', (req, res) => {
  res.json({
    online: true,
    players: 128,
    maxPlayers: 500,
    ping: 28,
    region: 'SA - Sao Paulo',
    statusText: 'NOKID ROLEPLAY'
  });
});

// ==========================================
// ROTAS DO LAUNCHER
// SIMULADAS POR ENQUANTO
// ==========================================

app.post('/serverValidatePlayer', (req, res) => {
  res.json({
    permitido: true,
    mensagem: 'Jogador validado com sucesso!'
  });
});

app.post('/serverRegisterPlayer', (req, res) => {
  res.json({
    permitido: true,
    mensagem: 'Jogador registrado com sucesso!'
  });
});

app.post('/serverGetConfig', (req, res) => {
  res.json({
    ip: '127.0.0.1',
    porta: 7777,
    mensagem: 'Configuracao carregada'
  });
});

app.post('/serverGetModsManifest', (req, res) => {
  res.json({
    version: '1.0',
    files: []
  });
});

// ==========================================
// INICIALIZACAO DA API
// ==========================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('Servidor NOKID API rodando na porta ' + PORT);
  console.log(
    'DATABASE_URL configurada: ' +
    Boolean(process.env.DATABASE_URL)
  );
});
```
