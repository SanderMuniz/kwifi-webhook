// services/firebaseService.ts
import * as admin from 'firebase-admin';
import firebaseConfig from '../config/firebase';

let firebaseInitialized = false;

const firebaseService = {
  initializeFirebase: (): void => {
    if (!firebaseInitialized) {
      try {
        admin.initializeApp({
          credential: admin.credential.cert(firebaseConfig as admin.ServiceAccount),
          databaseURL: `https://${firebaseConfig.project_id}.firebaseio.com`
        });
        firebaseInitialized = true;
        console.log('Firebase Admin SDK inicializado com sucesso.');
      } catch (error: any) {
        if (error.code === 'app/duplicate-app') {
          console.warn('Firebase Admin SDK já inicializado.');
          firebaseInitialized = true;
        } else {
          console.error('Erro ao inicializar o Firebase Admin SDK:', error.message);
        }
      }
    }
  },

  savePayload: async (path: string, data: any): Promise<boolean> => {
    if (!firebaseInitialized) {
      console.error('Firebase não está inicializado. Não foi possível salvar o payload.');
      return false;
    }
    try {
      const db = admin.database();
      const ref = db.ref(path);
      await ref.push(data);
      console.log(`Payload salvo com sucesso em: ${path}`);
      return true;
    } catch (error) {
      console.error('Erro ao salvar o payload no Firebase:', error);
      return false;
    }
  }
};

export default firebaseService;