// services/firebaseService.js
const admin = require('firebase-admin');
const firebaseConfig = require('../config/firebase');

let db;

const initializeFirebase = () => {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(firebaseConfig),
      databaseURL: `https://${firebaseConfig.project_id}-default-rtdb.firebaseio.com/` // Adapte se a URL do seu DB for diferente
    });
  }
  db = admin.database();
};

const savePayload = async (path, data) => {
  if (!db) {
    initializeFirebase();
  }
  try {
    await db.ref(path).push(data);
    console.log(`Payload salvo com sucesso em: ${path}`);
    return true;
  } catch (error) {
    console.error('Erro ao salvar payload no Firebase:', error);
    return false;
  }
};

module.exports = {
  initializeFirebase,
  savePayload
};