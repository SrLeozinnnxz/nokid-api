const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Rota de teste
app.get('/ping', (req, res) => {
  res.json({ status: 'ok', message: 'API do NOKlD está online!' });
});

// Rota de status do servidor
app.get('/status', (req, res) => {
  res.json({
    online: true,
    players: 128,
    maxPlayers: 500,
    ping: 28,
    region: "SA - São Paulo",
    statusText: "NOKID ROLEPLAY"
  });
});

// ✅ NOVAS ROTAS PARA O LAUNCHER (Simuladas por enquanto)
app.post('/serverValidatePlayer', (req, res) => {
  // Aqui você validará o jogador no banco de dados futuramente
  res.json({ permitido: true, mensagem: "Jogador validado com sucesso!" });
});

app.post('/serverRegisterPlayer', (req, res) => {
  res.json({ permitido: true, mensagem: "Jogador registrado com sucesso!" });
});

app.post('/serverGetConfig', (req, res) => {
  res.json({ 
    ip: "127.0.0.1", 
    porta: 7777,
    mensagem: "Configuração carregada"
  });
});

app.post('/serverGetModsManifest', (req, res) => {
  res.json({ 
    version: "1.0",
    files: [] 
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));