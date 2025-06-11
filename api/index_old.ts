// api/index.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as bodyParser from 'body-parser';
import express, { Request, Response } from 'express';

// Cria uma instância do Express APENAS PARA SERVIR COMO ROTEADOR INTERNO
const app = express();
app.use(bodyParser.json());

// Seus manipuladores de rota Express
app.post('/webhook/kiwify', async (req: Request, res: Response) => {
  const payload = req.body;
  console.log('Webhook Kiwify recebido (teste - via Express dentro da função):', payload);

  if (!payload || Object.keys(payload).length === 0) {
    return res.status(400).send('Payload vazio ou inválido (teste).');
  }

  res.status(200).send('Payload recebido e processado pelo Express (teste)!');
});

app.get('/webhook/kiwify', (req: Request, res: Response) => {
  res.status(200).send('Webhook Kiwify está online e aguardando requisições POST (teste - via Express dentro da função).');
});

// ESTE É O MANIPULADOR PRINCIPAL QUE O VERCEL PROCURA EM api/index.ts
// Ele recebe todas as requisições para /api
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Aqui, encaminhamos a requisição para o nosso aplicativo Express
    // Isso é essencialmente como o Vercel "envolve" sua aplicação Express
    // A rota '/webhook/kiwify' será tratada pelo app Express
    app(req, res);
}