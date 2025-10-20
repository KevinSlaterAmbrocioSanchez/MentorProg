// ===============================
// Configuración de Firebase Admin SDK
// ===============================
import admin from "firebase-admin";
import fs from "fs";

// Evita inicializar Firebase más de una vez (útil si usas nodemon)
if (!admin.apps.length) {
  // Leemos el archivo JSON de credenciales
  const serviceAccount = JSON.parse(
    fs.readFileSync("./src/config/serviceAccountKey.json", "utf8")
  );

  // Inicializamos Firebase con la credencial del proyecto
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Creamos la referencia a Firestore
const db = admin.firestore();

// Exportamos la instancia de Firestore para usarla en controladores
export default db;
