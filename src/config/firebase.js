import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta absoluta al JSON de credenciales
const keyPath = path.resolve(__dirname, "serviceAccountKey.json");

// ===============================
// 🔐 Inicialización segura del SDK
// ===============================
if (!admin.apps.length) {
  try {
    if (!fs.existsSync(keyPath)) {
      throw new Error(`❌ No se encontró el archivo de credenciales en: ${keyPath}`);
    }

    const serviceAccountRaw = fs.readFileSync(keyPath, "utf8");
    const serviceAccount = JSON.parse(serviceAccountRaw);

    // ✅ Inicializa Firebase Admin correctamente
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      // projectId y databaseURL deben corresponder al mismo proyecto
      projectId: serviceAccount.project_id,
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
    });

    // Configuración Firestore
    admin.firestore().settings({ ignoreUndefinedProperties: true });

    console.log("====================================");
    console.log("✅ Firebase Admin inicializado");
    console.log("🔹 projectId:", serviceAccount.project_id);
    console.log("🔹 client_email:", serviceAccount.client_email);
    console.log("🔹 databaseURL:", `https://${serviceAccount.project_id}.firebaseio.com`);
    console.log("====================================");
  } catch (error) {
    console.error("❌ Error inicializando Firebase Admin:", error);
  }
}

// ===============================
// 📦 Exportaciones
// ===============================
const db = admin.firestore();
const auth = admin.auth();

export default db;
export { admin, auth };


