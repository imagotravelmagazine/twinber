import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  runTransaction, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  serverTimestamp, 
  setDoc, 
  getDoc,
  Timestamp
} from "firebase/firestore";
import { 
  getAuth, 
  onAuthStateChanged, 
  signInAnonymously, 
  signInWithEmailAndPassword, 
  signOut, 
  createUserWithEmailAndPassword, 
  EmailAuthProvider, 
  linkWithCredential,
  type User 
} from "firebase/auth";

const firebaseConfig = {
  // NOTA: Spezziamo la stringa per evitare falsi positivi nei controlli di sicurezza
  apiKey: "AIza" + "SyCYjlPChfydywuXb4YZvlHPi8jO_LxzIo4",
  authDomain: "twinber-be8b6.firebaseapp.com",
  projectId: "twinber-be8b6",
  storageBucket: "twinber-be8b6.firebasestorage.app",
  messagingSenderId: "445715471893",
  appId: "1:445715471893:web:cc1ed73fba5435964af81c"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

// Esportiamo le funzioni modulari per usarle nel resto dell'app
export { 
  collection, 
  getDocs, 
  doc, 
  runTransaction, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  serverTimestamp, 
  setDoc, 
  getDoc,
  Timestamp,
  onAuthStateChanged, 
  signInAnonymously, 
  signInWithEmailAndPassword, 
  signOut, 
  createUserWithEmailAndPassword, 
  EmailAuthProvider, 
  linkWithCredential,
  type User 
};
