import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

initializeApp();

export const deleteAccountAndData = onCall({ region: 'europe-west1' }, async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Authentication is required.');

  const database = getFirestore();
  await database.recursiveDelete(database.doc(`users/${uid}`));
  await getAuth().deleteUser(uid);

  return { deleted: true };
});
