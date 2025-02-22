/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// Initialize Firebase Admin
admin.initializeApp();

// Function to clean up expired guest data
export const cleanupExpiredGuestData = functions.pubsub
  .schedule("every 1 hours")
  .onRun(async (_context: functions.EventContext) => {
    const db = admin.firestore();
    const now = admin.firestore.Timestamp.now();

    try {
      // Query for expired flights
      const expiredFlights = await db
        .collection("flights")
        .where("expiresAt", "<=", now)
        .get();

      if (expiredFlights.empty) {
        console.log("No expired flights found");
        return null;
      }

      // Delete expired flights in batches
      const batch = db.batch();
      expiredFlights.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      console.log(
        `Successfully deleted ${expiredFlights.size} expired flight records`
      );
      return null;
    } catch (error) {
      console.error("Error cleaning up expired guest data:", error);
      return null;
    }
  });
