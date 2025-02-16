import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  AuthError
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth, googleProvider } from '../config/firebase';

const formatAuthError = (error: AuthError) => {
  switch (error.code) {
    case 'auth/popup-closed-by-user':
      return 'Sign in was cancelled';
    case 'auth/popup-blocked':
      return 'Pop-up was blocked by the browser. Please allow pop-ups for this site';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with the same email address but different sign-in credentials';
    case 'auth/google-auth-error':
      return 'Google authentication failed. Please try again';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Invalid email or password';
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/email-already-in-use':
      return 'Email already in use';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later';
    default:
      return error.message;
  }
};

export const signUpWithEmail = async (email: string, password: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error: formatAuthError(error as AuthError) };
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error: formatAuthError(error as AuthError) };
  }
};

export const signInWithGoogle = async () => {
  try {
    await auth.signOut();
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential) {
      throw new Error('Failed to get Google credentials');
    }
    
    // Check if user profile exists in localStorage
    const existingProfile = localStorage.getItem('userProfile');
    if (!existingProfile) {
      // If no profile exists, create a new one with isProfileSetup = false
      const newProfile = {
        displayName: result.user.displayName || '',
        username: '',
        avatar: result.user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${result.user.uid}`,
        isProfileSetup: false,
        status: 'online'
      };
      localStorage.setItem('userProfile', JSON.stringify(newProfile));
    }
    
    return { user: result.user, error: null };
  } catch (error) {
    if (error instanceof FirebaseError) {
      return { user: null, error: formatAuthError(error as AuthError) };
    }
    return { user: null, error: 'Failed to sign in with Google. Please try again.' };
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error: formatAuthError(error as AuthError) };
  }
}; 