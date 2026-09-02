const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

/**
 * 1. AUTOMATIC SYNC: When a user document is deleted from Firestore (via Admin Dashboard),
 * automatically delete their account from Firebase Authentication.
 */
exports.onUserDocDeleted = functions.firestore
  .document('users/{userId}')
  .onDelete(async (snap, context) => {
    const { userId } = context.params;

    // Safety check: Never delete the primary super administrator
    const data = snap.data() || {};
    if (data.email === 'admin@gmail.com' || data.role === 'admin') {
      console.log(`Protected account ${userId} will not be removed from Auth.`);
      return;
    }

    try {
      await admin.auth().deleteUser(userId);
      console.log(`[BloodBridge Sync] Successfully deleted Firebase Auth user with UID: ${userId}`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log(`[BloodBridge Sync] User with UID ${userId} does not exist in Firebase Auth.`);
      } else {
        console.error(`[BloodBridge Sync] Error deleting user ${userId} from Firebase Auth:`, error);
      }
    }
  });

/**
 * 2. AUTOMATIC SYNC: When a user is deleted directly from the Firebase Authentication console,
 * automatically remove their profile document from Cloud Firestore (which immediately updates the Admin Dashboard).
 */
exports.onAuthUserDeleted = functions.auth.user().onDelete(async (user) => {
  const { uid, email } = user;

  // Safety check: Never wipe administrator profile
  if (email === 'admin@gmail.com') return;

  try {
    const userDocRef = admin.firestore().collection('users').doc(uid);
    await userDocRef.delete();
    console.log(`[BloodBridge Sync] Successfully deleted Firestore document for UID: ${uid}`);

    // Also clean up any blood requests created by this user
    const requestsQuery = await admin.firestore()
      .collection('blood_requests')
      .where('createdBy', '==', uid)
      .get();

    const batch = admin.firestore().batch();
    requestsQuery.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log(`[BloodBridge Sync] Cleaned up ${requestsQuery.size} associated blood requests.`);
  } catch (error) {
    console.error(`[BloodBridge Sync] Error cleaning up Firestore doc for user ${uid}:`, error);
  }
});
