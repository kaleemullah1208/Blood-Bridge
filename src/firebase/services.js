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
const USERS_COLLECTION = 'users';
const REQUESTS_COLLECTION = 'blood_requests';

// Initial Seed Data for immediate initial demo state
export const INITIAL_MOCK_REQUESTS = [
  {
    id: 'req-101',
    patientName: 'Sarah Jenkins',
    requiredBloodGroup: 'O-',
    hospitalName: 'City Central Trauma Center, ICU Wing',
    city: 'New York',
    unitsRequired: 3,
    urgencyLevel: 'Critical',
    contactPhone: '+1 (555) 234-5678',
    status: 'Active',
    notes: 'Emergency surgery scheduled in 2 hours. Platelets/Whole blood urgent.',
    createdBy: 'mock-user-1',
    createdByName: 'Dr. Marcus Vance',
    createdAt: new Date(Date.now() - 25 * 60 * 1000)
  },
  {
    id: 'req-102',
    patientName: 'David Chen',
    requiredBloodGroup: 'A+',
    hospitalName: 'Memorial General Hospital',
    city: 'Los Angeles',
    unitsRequired: 2,
    urgencyLevel: 'Urgent',
    contactPhone: '+1 (555) 876-5432',
    status: 'Active',
    notes: 'Thalassemia patient regular transfusion required by evening.',
    createdBy: 'mock-user-2',
    createdByName: 'Linda Chen',
    createdAt: new Date(Date.now() - 95 * 60 * 1000)
  },
  {
    id: 'req-103',
    patientName: 'Amina Al-Mansoor',
    requiredBloodGroup: 'B-',
    hospitalName: 'Northwestern Memorial Clinic',
    city: 'Chicago',
    unitsRequired: 1,
    urgencyLevel: 'Normal',
    contactPhone: '+1 (555) 345-9876',
    status: 'Active',
    notes: 'Elective orthopedic surgery preparation.',
    createdBy: 'mock-user-3',
    createdByName: 'Tariq Mansoor',
    createdAt: new Date(Date.now() - 240 * 60 * 1000)
  }
];

export const INITIAL_MOCK_DONORS = [
  {
    id: 'donor-demo-1',
    uid: 'donor-demo-1',
    name: 'Michael Reynolds',
    email: 'michael.r@example.com',
    phone: '+1 (555) 432-1098',
    bloodGroup: 'O+',
    city: 'New York',
    isAvailable: true,
    isDonor: true,
    role: 'donor',
    isVerified: true,
    donationsCount: 8,
    createdAt: new Date(Date.now() - 86400000 * 30)
  },
  {
    id: 'donor-demo-2',
    uid: 'donor-demo-2',
    name: 'Sophia Patel',
    email: 'sophia.p@example.com',
    phone: '+1 (555) 901-2345',
    bloodGroup: 'O-',
    city: 'New York',
    isAvailable: true,
    isDonor: true,
    role: 'donor',
    isVerified: true,
    donationsCount: 14,
    createdAt: new Date(Date.now() - 86400000 * 60)
  }
];

const LOCAL_STORAGE_REQ_KEY = 'bloodbridge_demo_requests';
const LOCAL_STORAGE_DONORS_KEY = 'bloodbridge_demo_donors';

const getStoredDemoRequests = () => {
  const saved = localStorage.getItem(LOCAL_STORAGE_REQ_KEY);
  if (saved) {
    try { return JSON.parse(saved); } catch { /* ignore */ }
  }
  localStorage.setItem(LOCAL_STORAGE_REQ_KEY, JSON.stringify(INITIAL_MOCK_REQUESTS));
  return INITIAL_MOCK_REQUESTS;
};

const getStoredDemoDonors = () => {
  const saved = localStorage.getItem(LOCAL_STORAGE_DONORS_KEY);
  if (saved) {
    try { return JSON.parse(saved); } catch { /* ignore */ }
  }
  localStorage.setItem(LOCAL_STORAGE_DONORS_KEY, JSON.stringify(INITIAL_MOCK_DONORS));
  return INITIAL_MOCK_DONORS;
};

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
    const list = getStoredDemoRequests().filter(r => r.status === 'Active');
    callback(list);
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
      console.warn("Firestore active requests fallback:", error.message);
      if (onError) onError(error);
      callback(getStoredDemoRequests().filter(r => r.status === 'Active'));
    });
  } catch (err) {
    console.error("Error setting up active requests listener:", err);
    callback(getStoredDemoRequests().filter(r => r.status === 'Active'));
    return () => {};
  }
};

/**
 * Real-time listener for ALL requests (Admin dashboard)
 */
export const subscribeToAllBloodRequests = (callback) => {
  if (!isFirebaseConfigured) {
    callback(getStoredDemoRequests());
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
      console.warn("Firestore all requests fallback:", error.message);
      callback(getStoredDemoRequests());
    });
  } catch (err) {
    console.error("Error listening to all requests:", err);
    callback(getStoredDemoRequests());
    return () => {};
  }
};

/**
 * Real-time listener for requests created by a specific user
 */
export const subscribeToUserRequests = (userId, callback) => {
  if (!userId) {
    callback([]);
    return () => {};
  }

  if (!isFirebaseConfigured) {
    const list = getStoredDemoRequests().filter(r => r.createdBy === userId);
    callback(list);
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
      console.warn("User requests subscription fallback:", err.message);
      callback(getStoredDemoRequests().filter(r => r.createdBy === userId));
    });
  } catch (err) {
    console.error("User requests subscription failed:", err);
    callback(getStoredDemoRequests().filter(r => r.createdBy === userId));
    return () => {};
  }
};

/**
 * Post a new Blood Request to Firestore
 */
export const createBloodRequest = async (requestData) => {
  if (!isFirebaseConfigured) {
    const newReq = {
      id: 'req-' + Date.now(),
      ...requestData,
      status: 'Active',
      createdAt: new Date().toISOString()
    };
    const current = getStoredDemoRequests();
    const updated = [newReq, ...current];
    localStorage.setItem(LOCAL_STORAGE_REQ_KEY, JSON.stringify(updated));
    return newReq.id;
  }

  const payload = {
    patientName: requestData.patientName.trim(),
    requiredBloodGroup: requestData.requiredBloodGroup,
    hospitalName: requestData.hospitalName.trim(),
    city: requestData.city.trim(),
    unitsRequired: Number(requestData.unitsRequired) || 1,
    urgencyLevel: requestData.urgencyLevel || 'Normal',
    contactPhone: requestData.contactPhone.trim(),
    notes: requestData.notes ? requestData.notes.trim() : '',
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
  if (!isFirebaseConfigured) {
    const current = getStoredDemoRequests();
    const updated = current.map(req => req.id === requestId ? { ...req, status } : req);
    localStorage.setItem(LOCAL_STORAGE_REQ_KEY, JSON.stringify(updated));
    return;
  }

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
  if (!isFirebaseConfigured) {
    const current = getStoredDemoRequests();
    const updated = current.filter(req => req.id !== requestId);
    localStorage.setItem(LOCAL_STORAGE_REQ_KEY, JSON.stringify(updated));
    return;
  }

  const docRef = doc(db, REQUESTS_COLLECTION, requestId);
  await deleteDoc(docRef);
};

/**
 * Subscribe to Donors (Users with isDonor = true or role = 'donor') in Real-Time
 */
export const subscribeToDonors = (callback) => {
  if (!isFirebaseConfigured) {
    callback(getStoredDemoDonors());
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
      console.warn("Firestore donor listener fallback:", err.message);
      callback(getStoredDemoDonors());
    });
  } catch (err) {
    console.error("Error subscribing to donors:", err);
    callback(getStoredDemoDonors());
    return () => {};
  }
};

/**
 * Subscribe to ALL Registered Users in Real-Time (For Admin Dashboard)
 * Live Firestore snapshot listener that triggers instantly when a user signs up with Gmail or Email
 */
export const subscribeToAllUsers = (callback) => {
  if (!isFirebaseConfigured) {
    callback(getStoredDemoDonors());
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
      console.warn("Firestore all users snapshot error:", err.message);
      callback(getStoredDemoDonors());
    });
  } catch (err) {
    console.error("Error subscribing to all users:", err);
    callback(getStoredDemoDonors());
    return () => {};
  }
};

/**
 * Update User profile in Firestore (creates or merges document)
 */
export const setUserProfileDoc = async (uid, userData) => {
  if (!uid) return;

  // Update local storage backup
  const donors = getStoredDemoDonors();
  const existingIdx = donors.findIndex(d => d.id === uid || d.uid === uid);
  const updatedRecord = { uid, id: uid, ...userData };
  if (existingIdx >= 0) {
    donors[existingIdx] = { ...donors[existingIdx], ...updatedRecord };
  } else {
    donors.unshift(updatedRecord);
  }
  localStorage.setItem(LOCAL_STORAGE_DONORS_KEY, JSON.stringify(donors));

  if (!isFirebaseConfigured) {
    return;
  }

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
    isVerified: userData.isVerified !== undefined ? userData.isVerified : true,
    role: userData.role || 'donor',
    provider: userData.provider || 'email',
    updatedAt: serverTimestamp()
  }, { merge: true });
};

/**
 * Toggle Donor Availability status
 */
export const toggleUserAvailability = async (uid, currentAvailability) => {
  const newStatus = !currentAvailability;
  const donors = getStoredDemoDonors();
  const updated = donors.map(d => (d.id === uid || d.uid === uid) ? { ...d, isAvailable: newStatus } : d);
  localStorage.setItem(LOCAL_STORAGE_DONORS_KEY, JSON.stringify(updated));

  if (isFirebaseConfigured) {
    const docRef = doc(db, USERS_COLLECTION, uid);
    await setDoc(docRef, { 
      isAvailable: newStatus,
      updatedAt: serverTimestamp() 
    }, { merge: true });
  }
  return newStatus;
};

/**
 * Admin: Update User details or Role
 */
export const adminUpdateUser = async (uid, updatedFields) => {
  const donors = getStoredDemoDonors();
  const updated = donors.map(d => (d.id === uid || d.uid === uid) ? { ...d, ...updatedFields } : d);
  localStorage.setItem(LOCAL_STORAGE_DONORS_KEY, JSON.stringify(updated));

  if (isFirebaseConfigured) {
    const docRef = doc(db, USERS_COLLECTION, uid);
    await setDoc(docRef, {
      ...updatedFields,
      updatedAt: serverTimestamp()
    }, { merge: true });
  }
};

/**
 * Admin: Delete User document
 */
export const adminDeleteUser = async (uid) => {
  const donors = getStoredDemoDonors();
  const updated = donors.filter(d => d.id !== uid && d.uid !== uid);
  localStorage.setItem(LOCAL_STORAGE_DONORS_KEY, JSON.stringify(updated));

  if (isFirebaseConfigured) {
    const docRef = doc(db, USERS_COLLECTION, uid);
    await deleteDoc(docRef);
  }
};

