import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';

// Collection references
export const USERS_COLLECTION = 'users';
export const REQUESTS_COLLECTION = 'blood_requests';

/**
 * Safe helper to parse Firestore Timestamps, ISO strings, or Date objects
 */
export const getTimestampMillis = (val) => {
  if (!val) return 0;
  if (typeof val.toDate === 'function') {
    try { return val.toDate().getTime(); } catch { /* ignore */ }
  }
  if (typeof val.toMillis === 'function') {
    try { return val.toMillis(); } catch { /* ignore */ }
  }
  if (val.seconds !== undefined) {
    return val.seconds * 1000;
  }
  const parsed = new Date(val).getTime();
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Real-time listener for active blood requests (for public feed)
 */
export const subscribeToActiveBloodRequests = (callback, onError) => {
  if (!isFirebaseConfigured) {
    callback([]);
    return () => {};
  }

  try {
    const q = query(
      collection(db, REQUESTS_COLLECTION),
      where('status', '==', 'Active')
    );

    return onSnapshot(q, (snapshot) => {
      const requests = [];
      snapshot.forEach((docSnap) => {
        requests.push({ id: docSnap.id, ...docSnap.data() });
      });
      // Sort newest first
      requests.sort((a, b) => getTimestampMillis(b.createdAt) - getTimestampMillis(a.createdAt));
      callback(requests);
    }, (error) => {
      console.error("[BloodBridge] Firestore active requests subscription error:", error.code, error.message);
      if (onError) onError(error);
      callback([]);
    });
  } catch (err) {
    console.error("[BloodBridge] Error setting up active requests listener:", err);
    callback([]);
    return () => {};
  }
};

/**
 * Real-time listener for ALL requests (Admin dashboard)
 */
export const subscribeToAllBloodRequests = (callback, onError) => {
  if (!isFirebaseConfigured) {
    callback([]);
    return () => {};
  }

  try {
    const q = query(collection(db, REQUESTS_COLLECTION));
    return onSnapshot(q, (snapshot) => {
      const requests = [];
      snapshot.forEach((docSnap) => {
        requests.push({ id: docSnap.id, ...docSnap.data() });
      });
      requests.sort((a, b) => getTimestampMillis(b.createdAt) - getTimestampMillis(a.createdAt));
      callback(requests);
    }, (error) => {
      console.error("[BloodBridge] Firestore all requests subscription error:", error.code, error.message);
      if (onError) onError(error);
      callback([]);
    });
  } catch (err) {
    console.error("[BloodBridge] Error listening to all requests:", err);
    callback([]);
    return () => {};
  }
};

/**
 * Real-time listener for requests created by a specific user
 */
export const subscribeToUserRequests = (userId, callback, onError) => {
  if (!userId) {
    callback([]);
    return () => {};
  }

  if (!isFirebaseConfigured) {
    callback([]);
    return () => {};
  }

  try {
    const q = query(
      collection(db, REQUESTS_COLLECTION),
      where('createdBy', '==', userId)
    );

    return onSnapshot(q, (snapshot) => {
      const userRequests = [];
      snapshot.forEach((docSnap) => {
        userRequests.push({ id: docSnap.id, ...docSnap.data() });
      });
      userRequests.sort((a, b) => getTimestampMillis(b.createdAt) - getTimestampMillis(a.createdAt));
      callback(userRequests);
    }, (err) => {
      console.error("[BloodBridge] User requests subscription error:", err.code, err.message);
      if (onError) onError(err);
      callback([]);
    });
  } catch (err) {
    console.error("[BloodBridge] User requests subscription failed:", err);
    callback([]);
    return () => {};
  }
};

/**
 * Post a new Blood Request to Firestore
 */
export const createBloodRequest = async (requestData) => {
  if (!isFirebaseConfigured) throw new Error("Firebase is not configured.");

  const payload = {
    patientName: (requestData.patientName || '').trim(),
    requiredBloodGroup: requestData.requiredBloodGroup || 'O+',
    hospitalName: (requestData.hospitalName || '').trim(),
    city: (requestData.city || '').trim(),
    unitsRequired: Number(requestData.unitsRequired) || 1,
    urgencyLevel: requestData.urgencyLevel || 'Normal',
    contactPhone: (requestData.contactPhone || '').trim(),
    notes: (requestData.notes || '').trim(),
    status: 'Active',
    createdBy: requestData.createdBy,
    createdByName: requestData.createdByName || 'Emergency Seeker',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  const docRef = await addDoc(collection(db, REQUESTS_COLLECTION), payload);
  return docRef.id;
};

/**
 * Update request status (e.g., 'Fulfilled', 'Cancelled', 'Active')
 */
export const updateBloodRequestStatus = async (requestId, status) => {
  if (!isFirebaseConfigured || !requestId) return;
  const docRef = doc(db, REQUESTS_COLLECTION, requestId);
  await updateDoc(docRef, { 
    status, 
    updatedAt: serverTimestamp() 
  });
};

/**
 * Delete a blood request
 */
export const deleteBloodRequest = async (requestId) => {
  if (!isFirebaseConfigured || !requestId) return;
  const docRef = doc(db, REQUESTS_COLLECTION, requestId);
  await deleteDoc(docRef);
};

/**
 * Subscribe to Donors (Users with isDonor = true or role = 'donor') in Real-Time
 */
export const subscribeToDonors = (callback, onError) => {
  if (!isFirebaseConfigured) {
    callback([]);
    return () => {};
  }

  try {
    const q = query(collection(db, USERS_COLLECTION));

    return onSnapshot(q, (snapshot) => {
      const donors = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() || {};
        const isDonorUser = data.isDonor === true || data.role === 'donor';
        if (isDonorUser) {
          donors.push({ 
            id: docSnap.id, 
            uid: docSnap.id, 
            ...data,
            isDonor: true,
            isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
            isVerified: data.isVerified !== undefined ? Boolean(data.isVerified) : true
          });
        }
      });

      // Sort newest registered first
      donors.sort((a, b) => getTimestampMillis(b.createdAt) - getTimestampMillis(a.createdAt));
      callback(donors);
    }, (err) => {
      console.error("[BloodBridge] Firestore donor listener error:", err.code, err.message);
      if (onError) onError(err);
      callback([]);
    });
  } catch (err) {
    console.error("[BloodBridge] Error subscribing to donors:", err);
    callback([]);
    return () => {};
  }
};

/**
 * Subscribe to ALL Registered Users in Real-Time (For Admin Dashboard)
 * Directly reads the Firestore 'users' collection as the single source of truth.
 */
export const subscribeToAllUsers = (callback, onError) => {
  if (!isFirebaseConfigured) {
    callback([]);
    return () => {};
  }

  try {
    const q = query(collection(db, USERS_COLLECTION));
    return onSnapshot(q, (snapshot) => {
      const users = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() || {};
        users.push({
          id: docSnap.id,
          uid: docSnap.id,
          name: data.name || data.displayName || data.email?.split('@')[0] || 'User',
          email: data.email || '',
          phone: data.phone || '',
          bloodGroup: data.bloodGroup || 'O+',
          city: data.city || '',
          hospitalName: data.hospitalName || '',
          role: data.role || (data.isDonor ? 'donor' : 'user'),
          isDonor: data.isDonor !== undefined ? data.isDonor : (data.role === 'donor'),
          isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
          isVerified: data.isVerified !== undefined ? Boolean(data.isVerified) : true,
          donationsCount: data.donationsCount || 0,
          lastDonationDate: data.lastDonationDate || '',
          provider: data.provider || 'email',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        });
      });
      
      // Sort users by most recently registered first
      users.sort((a, b) => getTimestampMillis(b.createdAt) - getTimestampMillis(a.createdAt));

      callback(users);
    }, (err) => {
      console.error("[BloodBridge] Firestore all users snapshot error:", err.code, err.message);
      if (onError) onError(err);
      callback([]);
    });
  } catch (err) {
    console.error("[BloodBridge] Error subscribing to all users:", err);
    callback([]);
    return () => {};
  }
};

/**
 * Update User profile in Firestore (creates or merges document)
 */
export const setUserProfileDoc = async (uid, userData) => {
  if (!isFirebaseConfigured || !uid) return;

  const docRef = doc(db, USERS_COLLECTION, uid);
  await setDoc(docRef, {
    uid,
    id: uid,
    name: userData.name || '',
    email: userData.email || '',
    phone: userData.phone || '',
    bloodGroup: userData.bloodGroup || 'O+',
    city: userData.city || '',
    hospitalName: userData.hospitalName || '',
    isDonor: userData.isDonor !== undefined ? userData.isDonor : (userData.role === 'donor'),
    isAvailable: userData.isAvailable !== undefined ? userData.isAvailable : true,
    isVerified: userData.isVerified !== undefined ? Boolean(userData.isVerified) : true,
    role: userData.role || 'donor',
    provider: userData.provider || 'email',
    updatedAt: serverTimestamp()
  }, { merge: true });
};

/**
 * Toggle Donor Availability status in Firestore
 */
export const toggleUserAvailability = async (uid, currentAvailability) => {
  if (!isFirebaseConfigured || !uid) return !currentAvailability;
  const newStatus = !currentAvailability;
  const docRef = doc(db, USERS_COLLECTION, uid);
  await setDoc(docRef, { 
    isAvailable: newStatus,
    updatedAt: serverTimestamp() 
  }, { merge: true });
  return newStatus;
};

/**
 * Admin: Update User details or Role in Firestore
 */
export const adminUpdateUser = async (uid, updatedFields) => {
  if (!isFirebaseConfigured || !uid) return;
  const docRef = doc(db, USERS_COLLECTION, uid);
  await setDoc(docRef, {
    ...updatedFields,
    updatedAt: serverTimestamp()
  }, { merge: true });
};

/**
 * Admin: Delete User document from Firestore
 */
export const adminDeleteUser = async (uid) => {
  if (!isFirebaseConfigured || !uid) return;
  const docRef = doc(db, USERS_COLLECTION, uid);
  await deleteDoc(docRef);
};
