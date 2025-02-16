import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBbYKyFfrnw7iR1AJMYZmYiZAp1ldUcDMk",
  authDomain: "syncsphere-bc674.firebaseapp.com",
  projectId: "syncsphere-bc674",
  storageBucket: "syncsphere-bc674.firebasestorage.app",
  messagingSenderId: "232174507381",
  appId: "1:232174507381:web:be032059ccf01ae6c42f3c"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Enhanced Google Provider setup
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
}); 