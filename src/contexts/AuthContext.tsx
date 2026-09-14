import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateEmail,
  updatePassword,
  type User,
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import {
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { getMe } from '../services/adminService';
import type { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nama: string, wilayahKerja: number) => Promise<void>;
  logout: () => Promise<void>;
  updateUserEmail: (newEmail: string) => Promise<void>;
  updateUserPassword: (newPassword: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string, isRetry = false): Promise<UserProfile | null> => {
    console.log('[Auth] fetchProfile called with uid:', uid, isRetry ? '(retry)' : '');
    // Retry up to 2 times on failure
    const maxRetries = 2;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const profile = await getMe();
        console.log('[Auth] Profile loaded:', profile);
        return { id: uid, ...profile };
      } catch (error) {
        console.error(`[Auth] Error fetching user profile (attempt ${attempt + 1}/${maxRetries + 1}):`, error);
        if (attempt < maxRetries) {
          // Wait before retry (exponential backoff: 500ms, 1000ms)
          await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
        }
      }
    }
    // All retries failed - preserve previous profile if exists, otherwise use minimal fallback
    if (userProfile) {
      console.warn('[Auth] All retries failed, preserving previous profile');
      return userProfile;
    }
    console.warn('[Auth] All retries failed, no previous profile, using minimal fallback');
    return {
      id: uid,
      uid,
      nama: user?.displayName || user?.email?.split('@')[0] || 'User',
      email: user?.email || '',
      role: 'staf',
      wilayah_kerja: 0,
      status: 'approved',
    };
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('[Auth] Firebase user changed:', {
        uid: firebaseUser?.uid,
        email: firebaseUser?.email,
      });
      setUser(firebaseUser);
      if (firebaseUser) {
        const profile = await fetchProfile(firebaseUser.uid);
        console.log('[Auth] Setting userProfile:', profile);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const profile = await fetchProfile(cred.user.uid);
    setUserProfile(profile);
  };

  const register = async (
    email: string,
    password: string,
    nama: string,
    wilayahKerja: number,
  ) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const newProfile: Omit<UserProfile, 'id'> = {
      uid: cred.user.uid,
      nama,
      email,
      role: 'staf',
      wilayah_kerja: wilayahKerja,
      status: 'pending',
    };
    await setDoc(doc(db, 'users', cred.user.uid), {
      ...newProfile,
      createdAt: serverTimestamp(),
    });
    setUserProfile({ id: cred.user.uid, ...newProfile });
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
  };

  const updateUserEmail = async (newEmail: string) => {
    if (!user) throw new Error('No user logged in');
    await updateEmail(user, newEmail);
  };

  const updateUserPassword = async (newPassword: string) => {
    if (!user) throw new Error('No user logged in');
    await updatePassword(user, newPassword);
  };

  const refreshProfile = async () => {
    if (user) {
      const profile = await fetchProfile(user.uid);
      setUserProfile(profile);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        login,
        register,
        logout,
        updateUserEmail,
        updateUserPassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
