// services/firebaseService.ts
import * as admin from 'firebase-admin';

// Definir uma interface para as configurações do Firebase para tipagem segura
interface FirebaseConfig {
  projectId: string;
  clientEmail: string;
  privateKey: string;
  databaseURL: string; // Adicionado para o Realtime Database
}

class FirebaseService {
  private app: admin.app.App | null = null;

  public initializeFirebase(): void {
    if (!admin.apps.length) {
      try {
        const config: FirebaseConfig = {
          projectId: process.env.FIREBASE_PROJECT_ID as string,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL as string,
          privateKey: (process.env.FIREBASE_PRIVATE_KEY as string).replace(/\\n/g, '\n'), // Substitui \\n por \n
          databaseURL: process.env.FIREBASE_DATABASE_URL as string, // Nova variável de ambiente
        };

        if (!config.projectId || !config.clientEmail || !config.privateKey || !config.databaseURL) {
          throw new Error('Missing Firebase environment variables.');
        }

        this.app = admin.initializeApp({
          credential: admin.credential.cert({
            projectId: config.projectId,
            clientEmail: config.clientEmail,
            privateKey: config.privateKey,
          }),
          databaseURL: config.databaseURL,
        });

        console.log('Firebase Admin SDK initialized successfully.');
      } catch (error) {
        console.error('Failed to initialize Firebase Admin SDK:', error);
        this.app = null; // Garante que o app seja nulo em caso de falha
      }
    } else {
      this.app = admin.app(); // Se já inicializado, obtém a instância existente
    }
  }

  // Novo método para obter o banco de dados (Realtime Database)
  public getDatabase(): admin.database.Database {
    if (!this.app) {
      throw new Error('Firebase app not initialized. Call initializeFirebase() first.');
    }
    return this.app.database();
  }

  public async savePayload(path: string, data: any): Promise<boolean> {
    if (!this.app) {
      console.error('Firebase app not initialized. Cannot save payload.');
      return false;
    }
    try {
      // Usando o Realtime Database
      await this.getDatabase().ref(path).set(data);
      console.log(`Payload saved to Firebase at path: ${path}`);
      return true;
    } catch (error) {
      console.error('Error saving payload to Firebase:', error);
      return false;
    }
  }
}

const firebaseService = new FirebaseService();
export default firebaseService;