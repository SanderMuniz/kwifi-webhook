// api/index.js
const express = require('express');
const bodyParser = require('body-parser');
const firebaseService = require('../services/firebaseService');
const { processKiwifyPayload } = require('../utils/payloadProcessor');

const app = express();
app.use(bodyParser.json());

// Inicializa o Firebase (garante que seja feito uma única vez)
firebaseService.initializeFirebase();

app.post('/webhook/kiwify', async (req, res) => {
  const payload = req.body;
  console.log('Webhook Kiwify recebido:', payload);

  if (!payload || Object.keys(payload).length === 0) {
    return res.status(400).send('Payload vazio ou inválido.');
  }

  // Processa o payload para incluir apenas os campos desejados
  const dataToSave = processKiwifyPayload(payload);

  // Use um caminho no Firebase que faça sentido para você.
  // Por exemplo, você pode usar o order_id como parte do caminho ou apenas 'kiwify_orders'.
  const firebasePath = `kiwify_webhooks/${payload.webhook_event_type || 'unclassified'}`;

  const success = await firebaseService.savePayload(firebasePath, dataToSave);

  if (success) {
    res.status(200).send('Payload recebido e salvo com sucesso no Firebase!');
  } else {
    res.status(500).send('Erro ao processar e salvar o payload.');
  }
});

// Endpoint para verificar se o webhook está funcionando (opcional)
app.get('/webhook/kiwify', (req, res) => {
  res.status(200).send('Webhook Kiwify está online e aguardando requisições POST.');
});

// Exporta o aplicativo Express para ser usado pelo Vercel
module.exports = app;