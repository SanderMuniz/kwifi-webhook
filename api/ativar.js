import { v4 as uuidv4 } from 'uuid';
import admin from 'firebase-admin';

let appInitialized = false;

if (!appInitialized) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  appInitialized = true;
}

const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const body = req.body;

  try {
    const email = body.email || body.user_email || body.client_email || null;
    const docId = email || uuidv4();

    await db.collection('ativacoes').doc(docId).set({
      ...body,
      recebidoEm: new Date().toISOString()
    });

    return res.status(200).json({ message: 'Dados recebidos e salvos com sucesso' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao salvar dados', details: error.message });
  }
}