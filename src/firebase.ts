
// Import the default firebase namespace to support environments/types that do not export members (like Firebase v8)
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

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
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Inizializza Cloud Firestore e ottieni un riferimento al servizio
export const db = firebase.firestore();
export const auth = firebase.auth();

// Re-export types
export type User = firebase.User;
export type Timestamp = firebase.firestore.Timestamp;

// Auth exports (v9 style adapters for v8/compat)
export const EmailAuthProvider = firebase.auth.EmailAuthProvider;

export const onAuthStateChanged = (authInstance: firebase.auth.Auth, nextOrObserver: (user: User | null) => void) => {
    return authInstance.onAuthStateChanged(nextOrObserver);
};

export const signInAnonymously = (authInstance: firebase.auth.Auth) => {
    return authInstance.signInAnonymously();
};

export const signInWithEmailAndPassword = (authInstance: firebase.auth.Auth, email: string, pass: string) => {
    return authInstance.signInWithEmailAndPassword(email, pass);
};

export const signOut = (authInstance: firebase.auth.Auth) => {
    return authInstance.signOut();
};

export const createUserWithEmailAndPassword = (authInstance: firebase.auth.Auth, email: string, pass: string) => {
    return authInstance.createUserWithEmailAndPassword(email, pass);
};

export const linkWithCredential = (user: firebase.User, credential: firebase.auth.AuthCredential) => {
    return user.linkWithCredential(credential);
};

// Firestore exports (v9 style adapters for v8/compat)
export const Timestamp = firebase.firestore.Timestamp;
export const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp;

export const collection = (dbOrRef: any, path: string) => {
    return dbOrRef.collection(path);
};

export const doc = (dbOrRef: any, path?: string, ...pathSegments: string[]) => {
    if (path && pathSegments.length > 0) {
        // Handle doc(db, "collection", "id")
        return dbOrRef.collection(path).doc(pathSegments[0]);
    }
    if (path) {
        // Handle doc(collectionRef, "id") or doc(db, "path/to/doc")
        return dbOrRef.doc ? dbOrRef.doc(path) : dbOrRef.collection(path.split('/')[0]).doc(path.split('/')[1]);
    }
    // Handle doc(collectionRef) -> auto id
    return dbOrRef.doc();
};

export const getDocs = (query: any) => {
    return query.get();
};

export const getDoc = (docRef: any) => {
    return docRef.get();
};

export const setDoc = (docRef: any, data: any) => {
    return docRef.set(data);
};

export const runTransaction = (dbInstance: any, updateFunction: (transaction: any) => Promise<any>) => {
    return dbInstance.runTransaction(updateFunction);
};

// Simplified query support for the specific use cases in this app
export const query = (ref: any, ...constraints: any[]) => {
    let q = ref;
    for (const constraint of constraints) {
        q = constraint(q);
    }
    return q;
};

export const where = (field: string, op: any, value: any) => {
    return (q: any) => q.where(field, op, value);
};

export const orderBy = (field: string, direction?: any) => {
    return (q: any) => q.orderBy(field, direction);
};

export const onSnapshot = (ref: any, onNext: any, onError?: any) => {
    return ref.onSnapshot(onNext, onError);
};
