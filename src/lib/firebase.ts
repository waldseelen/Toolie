import * as admin from "firebase-admin";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

let dbInstance: admin.firestore.Firestore | null = null;

export function getDb(): admin.firestore.Firestore {
  if (dbInstance) {
    return dbInstance;
  }

  if (admin.apps.length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID || "origin-5ff2f";
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, "\n"),
        }),
      });
    } else {
      // Check if service account file exists locally
      const localKeyPath = join(process.cwd(), "firebase-service-account.json");
      if (existsSync(localKeyPath)) {
        try {
          const localKey = JSON.parse(readFileSync(localKeyPath, "utf8"));
          admin.initializeApp({
            credential: admin.credential.cert(localKey),
          });
        } catch (e) {
          console.error("Failed to parse firebase-service-account.json:", e);
          admin.initializeApp({ projectId });
        }
      } else {
        // Default credential initialization (emulator, GCP environment, etc.)
        admin.initializeApp({ projectId });
      }
    }
  }

  dbInstance = admin.firestore();
  
  try {
    dbInstance.settings({
      ignoreUndefinedProperties: true,
    });
  } catch {
    // Ignore if settings were already initialized
  }

  return dbInstance;
}
