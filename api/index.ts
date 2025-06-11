// api/index.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'; // Mantém para qualquer uso específico Vercel
import * as bodyParser from 'body-parser';
import express from 'express';
import { Request, Response } from 'express'; // <--- AQUI ESTÁ A MUDANÇA: Importar Request e Response do 'express'

const app = express();
app.use(bodyParser.json());

// Rota para o Webhook da Kiwify (POST)
// Use Request e Response do 'express' aqui
app.post('/webhook/kiwify', async (req: Request, res: Response) => { // <--- MUDANÇA AQUI
  const payload = req.body;
  console.log('Webhook Kiwify recebido (teste):', payload);

  if (!payload || Object.keys(payload).length === 0) {
    return res.status(400).send('Payload vazio ou inválido (teste).');
  }

  res.status(200).send('Payload recebido e processado pelo Express (teste)!');
});

// Endpoint de teste para verificar se o webhook está online (GET)
// Use Request e Response do 'express' aqui
app.get('/webhook/kiwify', (req: Request, res: Response) => { // <--- MUDANÇA AQUI
  res.status(200).send('Webhook Kiwify está online e aguardando requisições POST (teste).');
});

// Exporta o aplicativo Express para ser usado pelo Vercel
module.exports = app;