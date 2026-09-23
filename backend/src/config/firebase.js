import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
} else {
    const serviceAccountPath = path.join(
        __dirname,
        "../../firebase-service-account.json"
    );

    serviceAccount = JSON.parse(
        fs.readFileSync(serviceAccountPath, "utf8")
    );
}

const firebaseApp = initializeApp({
    credential: cert(serviceAccount),
    storageBucket: "centru-adoptie-animale.firebasestorage.app"
});

export const db = getFirestore(firebaseApp);

export const storage = getStorage(firebaseApp).bucket();

export default firebaseApp;