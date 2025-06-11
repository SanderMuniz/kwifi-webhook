// api/webhook/kiwify.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import firebaseService from '../../services/firebaseService';
import { processKiwifyPayload } from '../../utils/payloadProcessor'; // Importe o processador

// Inicialize o Firebase UMA ÚNICA VEZ fora do handler
firebaseService.initializeFirebase();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    console.log(`Requisição recebida em /api/webhook/kiwify. Método: ${req.method}`);

    if (req.method === 'POST') {
        const payload = req.body;
        console.log('Webhook Kiwify recebido (direto - POST):', payload);

        if (!payload || Object.keys(payload).length === 0) {
            return res.status(400).send('Payload vazio ou inválido (direto - POST).');
        }

        // --- Lógica do Firebase reativada ---
        const dataToSave = processKiwifyPayload(payload);
       //const firebasePath = `kiwify_webhooks/<span class="math-inline">\{payload\.webhook\_event\_type \|\| 'unclassified'\}/</span>{payload.order_id}`; // Exemplo de caminho mais específico
		const firebasePath = `kiwify_webhooks/${payload.webhook_event_type || 'unclassified'}/${payload.order_id}`;

        const success = await firebaseService.savePayload(firebasePath, dataToSave);

        if (success) {
          res.status(200).send('Payload recebido e salvo com sucesso no Firebase!');
        } else {
          res.status(500).send('Erro ao processar e salvar o payload.');
        }
        // --- Fim da lógica do Firebase ---

    } else if (req.method === 'GET') {
        console.log('GET request recebido para /api/webhook/kiwify (direto - GET)');
        res.status(200).send('Webhook Kiwify está online e aguardando requisições POST (direto - GET).');
    } else {
        console.log(`Método ${req.method} não permitido.`);
        res.status(405).send(`Método ${req.method} não permitido.`);
    }
}