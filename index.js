const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

app.use(cors());
app.use(express.json());

const databaseUrl = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 10000
});

pool.on('error', (err) => {
  console.error('Erro inesperado no PostgreSQL:', err.message || err.code || String(err));
});

// ==========================================
// ROTA DE TESTE DA API
// ==========================================
app.get('/ping', (req, res) => {
  res.json({ status: 'ok', message: 'API do NOKID está online!' });
});

// ==========================================
// TESTE DE CONEXAO COM O BANCO
// ==========================================
app.get('/db-check', async (req, res) => {
  if (!databaseUrl) {
    return res.status(500).json({
      status: 'error',
      database: 'unavailable',
      message: 'DATABASE_URL nao configurada no Render.'
    });
  }

  let client;
  try {
    client = await pool.connect();
    const result = await client.query('SELECT NOW() AS time');
    res.json({
      status: 'ok',
      database: 'connected',
      time: result.rows[0].time
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      message: error.message || 'Erro ao conectar no banco.'
    });
  } finally {
    if (client) client.release();
  }
});

// ==========================================
// ROTAS DE JOGADOR
// ==========================================
app.post('/serverRegisterPlayer', async (req, res) => {
  const { nickname, device_id } = req.body;
  if (!nickname) {
    return res.status(400).json({ permitido: false, mensagem: 'Nickname obrigatório.' });
  }

  let client;
  try {
    client = await pool.connect();
    const result = await client.query(
      'INSERT INTO players (name, device_uuid) VALUES ($1, $2) RETURNING *',
      [nickname, device_id || null]
    );
    res.json({ permitido: true, jogador: result.rows[0], mensagem: 'Jogador registrado!' });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ permitido: false, mensagem: 'Nickname já existe.' });
    }
    res.status(500).json({ permitido: false, mensagem: 'Erro ao registrar.' });
  } finally {
    if (client) client.release();
  }
});

app.post('/serverValidatePlayer', async (req, res) => {
  const { nickname, device_id } = req.body;
  if (!nickname) {
    return res.status(400).json({ permitido: false, mensagem: 'Nickname obrigatório.' });
  }

  let client;
  try {
    client = await pool.connect();
    const result = await client.query('SELECT * FROM players WHERE name = $1', [nickname]);

    if (result.rows.length === 0) {
      return res.json({ permitido: false, mensagem: 'Jogador não encontrado. Registre-se.' });
    }

    const jogador = result.rows[0];

    if (device_id && jogador.device_uuid && jogador.device_uuid !== device_id) {
      return res.json({ permitido: false, mensagem: 'Este nickname pertence a outro dispositivo.' });
    }

    await client.query('UPDATE players SET last_login = NOW() WHERE id = $1', [jogador.id]);

    res.json({ permitido: true, jogador });
  } catch (error) {
    res.status(500).json({ permitido: false, mensagem: 'Erro ao validar jogador.' });
  } finally {
    if (client) client.release();
  }
});

// ==========================================
// ROTAS SIMULADAS (temporárias)
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

app.post('/serverGetConfig', (req, res) => {
  res.json({ ip: '127.0.0.1', porta: 7777, mensagem: 'Configuração carregada' });
});

app.post('/serverGetModsManifest', (req, res) => {
  res.json({ version: '1.0', files: [] });
});

// ==========================================
// START
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
