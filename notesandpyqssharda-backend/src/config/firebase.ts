import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    let credential;
    try {
        // Try to load serviceAccountKey.json from project root
        const serviceAccount = require(path.resolve(process.cwd(), "serviceAccountKey.json"));
        credential = admin.credential.cert(serviceAccount);
        console.log("🔑 Loaded Firebase credentials from serviceAccountKey.json");
    } catch (e) {
        // Fallback to default (Google Cloud environment or GOOGLE_APPLICATION_CREDENTIALS)
        console.log("⚠️ serviceAccountKey.json not found in root.");
        console.log("⚠️ If you are running locally, you MUST download the 'serviceAccountKey.json' from Firebase Console -> Project Settings -> Service Accounts.");
        console.log("⚠️ Place it in: " + path.resolve(process.cwd(), "serviceAccountKey.json"));
        credential = admin.credential.applicationDefault();
    }

    // "solproj" is taken from your src/firebase.js file
    admin.initializeApp({
      credential: credential,
      projectId: "solproj" 
    });
    console.log("🔥 Firebase Admin Initialized");
  } catch (error) {
    console.error("Firebase admin initialization failed. Make sure you have set GOOGLE_APPLICATION_CREDENTIALS or provided serviceAccountKey.json in root.", error);
    process.exit(1); // Exit process to stop error loops
  }
}

export const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });

export const adminAuth = admin.auth(); 
