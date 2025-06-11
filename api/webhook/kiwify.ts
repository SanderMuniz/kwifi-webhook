// api/webhook/kiwify.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import firebaseService from '../../services/firebaseService';
import { processKiwifyPayload, sanitizeEmailForFirebase, addDays, addYears, KiwifyOrder } from '../../utils/payloadProcessor';

// Inicialize o Firebase UMA ÚNICA VEZ fora do handler
firebaseService.initializeFirebase();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    console.log(`Requisição recebida em /api/webhook/kiwify. Método: ${req.method}`);

    if (req.method === 'POST') {
        const payload: KiwifyOrder = req.body;
        const eventType = payload.webhook_event_type;
        const customerEmail = payload.Customer?.email;
        const orderId = payload.order_id;

        if (!payload || Object.keys(payload).length === 0 || !customerEmail || !orderId) {
            console.log('Payload vazio, sem email do cliente ou sem ID do pedido.');
            return res.status(400).send('Payload vazio, sem email do cliente ou sem ID do pedido.');
        }

        const sanitizedEmail = sanitizeEmailForFirebase(customerEmail);
        const userRefPath = `kiwify/users/${sanitizedEmail}`; // Caminho para os dados do usuário no Firebase
        const ordersRefPath = `kiwify/orders/${orderId}`; // Caminho para o pedido bruto (opcional)

        const processedPayload = processKiwifyPayload(payload);

        try {
            // Salvar o payload bruto ou processado em uma coleção de histórico de pedidos
            await firebaseService.savePayload(ordersRefPath, processedPayload);
            console.log(`Payload do pedido ${orderId} (${eventType}) salvo em orders.`);

            // Lógica principal de gestão de licenças baseada no tipo de evento
            let updateData: any = {};
            let shouldUpdateUserLicense = false;

            switch (eventType) {
                case 'pix_created':
                case 'boleto_created':
                    // Intenção de compra: Cliente gerou boleto/PIX
                    updateData = {
                        licenseStatus: 'pending_payment',
                        lastEvent: eventType,
                        updatedAt: new Date().toISOString(),
                        orderId: orderId,
                        email: customerEmail
                    };
                    shouldUpdateUserLicense = true; // Atualiza o status do usuário
                    break;

                case 'order_approved':
                    // Compra aprovada: Liberar licença provisória de 7 dias
                    const provisionalStartDate = new Date().toISOString();
                    const provisionalEndDate = addDays(provisionalStartDate, 7);

                    updateData = {
                        licenseStatus: 'provisional',
                        provisionalStartDate: provisionalStartDate,
                        provisionalEndDate: provisionalEndDate,
                        accessGranted: true,
                        lastEvent: eventType,
                        updatedAt: new Date().toISOString(),
                        orderId: orderId,
                        email: customerEmail,
                        productId: payload.Product?.product_id,
                        productName: payload.Product?.product_name
                    };
                    shouldUpdateUserLicense = true; // Atualiza o status do usuário
                    break;

                case 'order_completed':
                    // Pedido concluído: Após a garantia, liberar licença de 1 ano
                    // Podemos usar a data final da licença provisória como início da licença anual,
                    // ou a data de updated_at do payload se for mais apropriado.
                    // Para simplicidade, vamos usar a data atual do evento como início se não houver provisória
                    let licenseStartDate = new Date().toISOString(); // Default para hoje
                    let licenseEndDate = addYears(licenseStartDate, 1);

                    // Tentar buscar a data final provisória do Firebase se existir
                    const currentUserData = await firebaseService.getDatabase().ref(userRefPath).once('value');
                    const userLicense = currentUserData.val();

                    if (userLicense && userLicense.provisionalEndDate) {
                        licenseStartDate = userLicense.provisionalEndDate; // Inicia 1 ano a partir do fim da provisória
                        licenseEndDate = addYears(licenseStartDate, 1);
                    }

                    updateData = {
                        licenseStatus: 'active',
                        licenseStartDate: licenseStartDate,
                        licenseEndDate: licenseEndDate,
                        accessGranted: true,
                        provisionalStartDate: null, // Limpa dados provisórios
                        provisionalEndDate: null,   // Limpa dados provisórios
                        lastEvent: eventType,
                        updatedAt: new Date().toISOString(),
                        orderId: orderId,
                        email: customerEmail,
                        productId: payload.Product?.product_id,
                        productName: payload.Product?.product_name
                    };
                    shouldUpdateUserLicense = true; // Atualiza o status do usuário
                    break;

                case 'order_canceled':
                case 'order_refunded':
                    // Compra cancelada ou reembolsada: Revogar acesso
                    updateData = {
                        licenseStatus: 'canceled',
                        accessGranted: false,
                        lastEvent: eventType,
                        updatedAt: new Date().toISOString(),
                        orderId: orderId,
                        email: customerEmail
                    };
                    shouldUpdateUserLicense = true; // Atualiza o status do usuário
                    break;

                default:
                    // Outros eventos que você não quer processar ativamente para licença, mas quer registrar
                    console.log(`Evento ${eventType} recebido, mas sem lógica de licença específica.`);
                    break;
            }

            if (shouldUpdateUserLicense) {
                // Atualiza ou cria o documento do usuário com o status da licença mais recente
                await firebaseService.savePayload(userRefPath, updateData);
                console.log(`Status da licença do usuário ${customerEmail} atualizado para ${updateData.licenseStatus}.`);
            }

            res.status(200).send(`Webhook Kiwify processado para o evento: ${eventType}.`);

        } catch (error) {
            console.error('Erro geral ao processar webhook da Kiwify:', error);
            res.status(500).send('Erro interno ao processar o webhook.');
        }

    } else if (req.method === 'GET') {
        res.status(200).send('Webhook Kiwify está online e aguardando requisições POST.');
    } else {
        res.status(405).send(`Método ${req.method} não permitido.`);
    }
}