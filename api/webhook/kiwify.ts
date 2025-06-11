// api/webhook/kiwify.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as bodyParser from 'body-parser';
// Não precisa de Express aqui se for um handler direto

// Middleware para parsear JSON (você precisaria fazer isso aqui manualmente ou importar de algum lugar)
// Para simplificar, vou assumir que o payload já é JSON ou que você o parseia aqui
// const jsonBodyParser = bodyParser.json();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Isso aqui é um handler direto para /api/webhook/kiwify

    if (req.method === 'POST') {
        const payload = req.body; // Vercel já faz o parse do body se o Content-Type for application/json
        console.log('Webhook Kiwify recebido (direto - POST):', payload);

        if (!payload || Object.keys(payload).length === 0) {
            return res.status(400).send('Payload vazio ou inválido (direto - POST).');
        }
        res.status(200).send('Payload recebido e processado (direto - POST)!');

    } else if (req.method === 'GET') {
        console.log('GET request recebido para /api/webhook/kiwify (direto - GET)');
        res.status(200).send('Webhook Kiwify está online e aguardando requisições POST (direto - GET).');
    } else {
        res.status(405).send('Método não permitido (direto).');
    }
}