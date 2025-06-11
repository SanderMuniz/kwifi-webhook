// api/index.ts (VERSÃO DE TESTE INICIAL - Express)
import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as bodyParser from 'body-parser';
import * as express from 'express';

const app = express();
app.use(bodyParser.json());

// Rota para o Webhook da Kiwify (POST)
app.post('/webhook/kiwify', async (req: VercelRequest, res: VercelResponse) => {
  const payload = req.body;
  console.log('Webhook Kiwify recebido (teste):', payload);

  if (!payload || Object.keys(payload).length === 0) {
    return res.status(400).send('Payload vazio ou inválido (teste).');
  }

  // Por enquanto, apenas um retorno simples para confirmar o funcionamento
  res.status(200).send('Payload recebido e processado pelo Express (teste)!');
});

// Endpoint de teste para verificar se o webhook está online (GET)
app.get('/webhook/kiwify', (req: VercelRequest, res: VercelResponse) => {
  res.status(200).send('Webhook Kiwify está online e aguardando requisições POST (teste).');
});

// Exporta o aplicativo Express para ser usado pelo Vercel
module.exports = app;