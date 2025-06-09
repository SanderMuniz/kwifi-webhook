import express from 'express';
import jwt from 'jsonwebtoken';
import admin from 'firebase-admin';

// Inicialização do Firebase
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const app = express();
app.use(express.json());

app.post('/ativar', async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).send({ error: 'Email obrigatório' });

  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '365d' });

  await db.collection('ativacoes').doc(email).set({
    token,
    ativo: true,
    criadoEm: new Date().toISOString()
  });

  res.json({ token });
});

app.listen(3000, () => {
  console.log('Webhook rodando na porta 3000');
});
