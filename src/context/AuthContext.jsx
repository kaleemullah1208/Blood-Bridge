import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, googleProvider, db, isFirebaseConfigured } from '../firebase/config';

const AuthContext = createContext(null);

export const ADMIN_EMAIL = 'admin@gmail.com';
export const ADMIN_PASS = 'admin123';
const LOCAL_STORAGE_SESSION_KEY = 'bloodbridge_active_session';

// Helper to sanitize Firebase Auth error messages into friendly messages
export const getFriendlyAuthErrorMessage = (error) => {
  if (!error) return 'An unexpected error occurred. Please try again.';
  const code = error.code || '';
  
  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email address is already registered. Please sign in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please verify your credentials or sign in with Google.';
    case 'auth/user-not-found':
      return 'No account found with this email address. Please sign up first.';
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please verify your login credentials.';
    case 'auth/too-many-requests':
      return 'Too many failed login attempts. Please wait a few moments before trying again.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please check your internet connection and try again.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return null; // Silent cancellation
    default:
      return error.message || 'Authentication failed. Please check your details.';
  }
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);

  // Track if a manual registration or login is in-flight to prevent onAuthStateChanged overwriting
  const isRegisteringRef = useRef(false);

  // Synchronize Auth State & Real-time Firestore user profile
  useEffect(() => {
    if (!isFirebaseConfigured) {
      const stored = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setCurrentUser(parsed);
          setUserProfile(parsed);
        } catch { /* ignore */ }
      }
      setLoading(false);
      return;
    }

    let unsubscribeProfile = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const isAdmin = firebaseUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
        const userRef = doc(db, 'users', firebaseUser.uid);

        // Listen for real-time changes to the user document in Firestore
        unsubscribeProfile = onSnapshot(userRef, async (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const profile = {
              uid: firebaseUser.uid,
              id: firebaseUser.uid,
              ...data,
              role: isAdmin ? 'admin' : (data.role || 'user'),
              isDonor: data.isDonor !== undefined ? data.isDonor : (data.role === 'donor')
            };
            setUserProfile(profile);
            setCurrentUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: profile.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0],
              photoURL: firebaseUser.photoURL || '',
              role: profile.role
            });

            // Save clean session
            try {
              const sessionData = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                name: profile.name,
                role: profile.role,
                isDonor: profile.isDonor,
                bloodGroup: profile.bloodGroup,
                city: profile.city
              };
              localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(sessionData));
            } catch { /* ignore */ }
          } else if (!isRegisteringRef.current) {
            // Only create fallback document if not currently in manual registration flow
            const initialProfile = {
              uid: firebaseUser.uid,
              id: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              email: firebaseUser.email || '',
              phone: firebaseUser.phoneNumber || '',
              bloodGroup: 'O+',
              city: '',
              hospitalName: '',
              role: isAdmin ? 'admin' : 'user',
              isDonor: false,
              isAvailable: false,
              isVerified: false,
              lastDonationDate: '',
              provider: firebaseUser.providerData?.[0]?.providerId || 'google',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };

            try {
              await setDoc(userRef, initialProfile, { merge: true });
            } catch (err) {
              console.warn("Could not write initial user doc:", err);
            }

            setUserProfile(initialProfile);
            setCurrentUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: initialProfile.name,
              photoURL: firebaseUser.photoURL || '',
              role: initialProfile.role
            });
          }
          setLoading(false);
        }, (err) => {
          console.warn("Firestore user profile snapshot error:", err);
          setLoading(false);
        });
      } else {
        if (unsubscribeProfile) unsubscribeProfile();
        // Check for stored admin session
        const stored = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed.email === ADMIN_EMAIL && parsed.role === 'admin') {
              setCurrentUser(parsed);
              setUserProfile(parsed);
              setLoading(false);
              return;
            }
          } catch { /* ignore */ }
        }
        setCurrentUser(null);
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  // 1. Register with Email & Password
  const register = async (email, password, { name, phone, bloodGroup, city, role = 'donor', hospitalName = '' }) => {
    const trimmedEmail = email.trim().toLowerCase();
    const isAdmin = trimmedEmail === ADMIN_EMAIL.toLowerCase();
    const assignedRole = isAdmin ? 'admin' : role;
    const isDonor = assignedRole === 'donor';

    isRegisteringRef.current = true;
    let uid = 'usr-' + Date.now();
    let firebaseUser = null;

    try {
      if (isFirebaseConfigured) {
        const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
        firebaseUser = userCredential.user;
        uid = firebaseUser.uid;

        try {
          await updateProfile(firebaseUser, { displayName: name.trim() });
        } catch (e) {
          console.warn("Could not update display name:", e);
        }
      }

      const isoNow = new Date().toISOString();
      const newProfile = {
        uid,
        id: uid,
        name: name.trim(),
        email: trimmedEmail,
        phone: phone.trim(),
        bloodGroup: bloodGroup || 'O+',
        city: city.trim(),
        hospitalName: hospitalName ? hospitalName.trim() : '',
        role: assignedRole,
        isDonor: isDonor,
        isAvailable: isDonor,
        isVerified: false,
        lastDonationDate: '',
        provider: 'email',
        createdAt: isoNow,
        updatedAt: isoNow
      };

      if (isFirebaseConfigured) {
        const userDocRef = doc(db, 'users', uid);
        await setDoc(userDocRef, {
          ...newProfile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });
      }

      const authUser = {
        uid,
        email: trimmedEmail,
        displayName: name.trim(),
        role: assignedRole
      };

      setCurrentUser(authUser);
      setUserProfile(newProfile);
      localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(newProfile));

      return { user: authUser, profile: newProfile };
    } catch (err) {
      console.error("Auth register error:", err);
      const friendlyMsg = getFriendlyAuthErrorMessage(err);
      const errorObj = new Error(friendlyMsg || 'Registration failed');
      errorObj.code = err.code;
      throw errorObj;
    } finally {
      setTimeout(() => {
        isRegisteringRef.current = false;
      }, 1000);
    }
  };

  // 2. Google 1-Click Sign In / Sign Up
  const loginWithGoogle = async () => {
    if (!isFirebaseConfigured) {
      throw new Error("Firebase is not configured for Google Sign-In.");
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const isAdmin = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

      const userDocRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userDocRef);

      let profile;
      if (docSnap.exists()) {
        const existingData = docSnap.data();
        profile = {
          uid: user.uid,
          id: user.uid,
          ...existingData,
          role: isAdmin ? 'admin' : (existingData.role || 'user'),
          isDonor: existingData.isDonor !== undefined ? existingData.isDonor : (existingData.role === 'donor')
        };
        await setDoc(userDocRef, { updatedAt: serverTimestamp() }, { merge: true }).catch(console.warn);
      } else {
        const isoNow = new Date().toISOString();
        profile = {
          uid: user.uid,
          id: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'Member',
          email: user.email,
          phone: user.phoneNumber || '',
          bloodGroup: 'O+',
          city: '',
          hospitalName: '',
          role: isAdmin ? 'admin' : 'user',
          isDonor: false,
          isAvailable: false,
          isVerified: false,
          lastDonationDate: '',
          provider: 'google',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        await setDoc(userDocRef, profile, { merge: true });
        setShowOnboardingModal(true);
      }

      const activeUser = {
        uid: user.uid,
        email: user.email,
        displayName: profile.name || user.displayName,
        photoURL: user.photoURL || '',
        role: profile.role
      };

      setCurrentUser(activeUser);
      setUserProfile(profile);
      localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(profile));

      return { user: activeUser, profile };
    } catch (err) {
      console.error("Auth google login error:", err);
      const friendlyMsg = getFriendlyAuthErrorMessage(err);
      if (friendlyMsg) {
        const errorObj = new Error(friendlyMsg);
        errorObj.code = err.code;
        throw errorObj;
      }
      throw err;
    }
  };

  // 3. Email & Password Login
  const login = async (email, password, { requireAdmin = false, selectedRole = null } = {}) => {
    const trimmedEmail = email.trim().toLowerCase();
    const isAdminCredentials = trimmedEmail === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASS;

    // Direct Administrator credential handling
    if (isAdminCredentials) {
      const adminProfile = {
        uid: 'admin-master-uid',
        id: 'admin-master-uid',
        name: 'Super Administrator',
        email: ADMIN_EMAIL,
        phone: '+1 (555) 999-0000',
        bloodGroup: 'O+',
        city: 'Headquarters',
        role: 'admin',
        isDonor: false,
        isAvailable: false,
        isVerified: true,
        provider: 'admin'
      };

      const adminUser = {
        uid: 'admin-master-uid',
        email: ADMIN_EMAIL,
        displayName: 'Super Administrator',
        role: 'admin'
      };

      setCurrentUser(adminUser);
      setUserProfile(adminProfile);
      localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(adminProfile));
      return { user: adminUser, profile: adminProfile };
    }

    if (!isFirebaseConfigured) {
      throw new Error("Firebase Authentication is not configured.");
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
      const user = userCredential.user;

      const userDocRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userDocRef);

      let profile;
      if (docSnap.exists()) {
        profile = { uid: user.uid, id: user.uid, ...docSnap.data() };
      } else {
        profile = {
          uid: user.uid,
          id: user.uid,
          name: user.displayName || trimmedEmail.split('@')[0],
          email: trimmedEmail,
          phone: '',
          bloodGroup: 'O+',
          city: '',
          role: trimmedEmail === ADMIN_EMAIL.toLowerCase() ? 'admin' : (selectedRole || 'user'),
          isDonor: selectedRole === 'donor',
          isAvailable: selectedRole === 'donor',
          provider: 'email'
        };
        await setDoc(userDocRef, { ...profile, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }, { merge: true });
      }

      if (requireAdmin && profile.role !== 'admin' && trimmedEmail !== ADMIN_EMAIL.toLowerCase()) {
        await signOut(auth);
        setCurrentUser(null);
        setUserProfile(null);
        localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
        throw new Error("Access Denied: Account does not have administrator privileges.");
      }

      const activeUser = {
        uid: user.uid,
        email: trimmedEmail,
        displayName: profile.name || user.displayName,
        role: profile.role
      };

      setCurrentUser(activeUser);
      setUserProfile(profile);
      localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(profile));

      return { user: activeUser, profile };
    } catch (error) {
      console.error("Firebase Login Error:", error.code, error.message);
      const friendlyMsg = getFriendlyAuthErrorMessage(error);
      const errObj = new Error(friendlyMsg || 'Invalid email or password.');
      errObj.code = error.code;
      throw errObj;
    }
  };

  // 4. Sign Out
  const logout = async () => {
    localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
    if (isFirebaseConfigured) {
      try {
        await signOut(auth);
      } catch (e) {
        console.warn("Sign out error:", e);
      }
    }
    setUserProfile(null);
    setCurrentUser(null);
    setShowOnboardingModal(false);
  };

  // 5. Update Profile details in Firestore & Context
  const updateUserData = async (updatedFields) => {
    if (!currentUser) throw new Error("Must be logged in to update profile");

    const updated = { ...userProfile, ...updatedFields };
    setUserProfile(updated);
    localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(updated));

    if (isFirebaseConfigured && currentUser.uid) {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        ...updatedFields,
        updatedAt: serverTimestamp()
      }).catch(console.warn);
    }
    return updated;
  };

  // 6. Toggle Donor Availability
  const toggleAvailability = async () => {
    if (!currentUser || !userProfile) return false;
    const newStatus = !userProfile.isAvailable;
    const updated = { ...userProfile, isAvailable: newStatus };
    setUserProfile(updated);
    localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(updated));

    if (isFirebaseConfigured && currentUser.uid) {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        isAvailable: newStatus,
        updatedAt: serverTimestamp()
      }).catch(console.warn);
    }
    return newStatus;
  };

  // 7. Switch Role (Donor vs User/Requester)
  const switchUserRole = async (targetRole) => {
    if (!currentUser || !userProfile) return;
    const isDonorMode = targetRole === 'donor';
    const updatedFields = {
      role: targetRole,
      isDonor: isDonorMode,
      isAvailable: isDonorMode ? true : false
    };

    return await updateUserData(updatedFields);
  };

  const isAdmin = currentUser?.role === 'admin' || userProfile?.role === 'admin' || currentUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const value = {
    currentUser,
    userProfile,
    loading,
    register,
    login,
    loginWithGoogle,
    logout,
    updateUserData,
    toggleAvailability,
    switchUserRole,
    showOnboardingModal,
    setShowOnboardingModal,
    isAuthenticated: Boolean(currentUser),
    isAdmin,
    isDonor: Boolean(userProfile?.isDonor || userProfile?.role === 'donor'),
    isConfigured: isFirebaseConfigured
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

