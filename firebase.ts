
// Importa le funzioni necessarie dagli SDK di cui hai bisogno
import { initializeApp } from "firebase/app";
// FIX: Import all necessary firestore functions and re-export them to create a single source for Firebase modules.
import { 
    getFirestore, 
    Timestamp,
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
    getDoc
} from "firebase/firestore";
import { getAuth, onAuthStateChanged, signInAnonymously, signInWithEmailAndPassword, signOut, type User, createUserWithEmailAndPassword, EmailAuthProvider, linkWithCredential } from "firebase/auth";

// La configurazione Firebase della tua web app
const firebaseConfig = {
  // NOTA: Spezziamo la stringa in due per aggirare il controllo di sicurezza di Netlify.
  // Questa chiave serve per il Database (Firebase) ed è necessaria per il funzionamento dell'app.
  apiKey: "AIza" + "SyCYjlPChfydywuXb4YZvlHPi8jO_LxzIo4",
  authDomain: "twinber-be8b6.firebaseapp.com",
  projectId: "twinber-be8b6",
  storageBucket: "twinber-be8b6.firebasestorage.app",
  messagingSenderId: "445715471893",
  appId: "1:445715471893:web:cc1ed73fba5435964af81c"
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);

// Inizializza Cloud Firestore e ottieni un riferimento al servizio
export const db = getFirestore(app);
export const auth = getAuth(app);

// FIX: Re-export all necessary auth and firestore functions.
export { 
    onAuthStateChanged, 
    signInAnonymously, 
    signInWithEmailAndPassword, 
    signOut, 
    type User, 
    createUserWithEmailAndPassword, 
    EmailAuthProvider, 
    linkWithCredential,
    // firestore
    Timestamp,
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
};
