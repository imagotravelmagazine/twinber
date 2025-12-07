import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

const firebaseConfig = {
  apiKey: "AIza" + "SyCYjlPChfydywuXb4YZvlHPi8jO_LxzIo4",
  authDomain: "twinber-be8b6.firebaseapp.com",
  projectId: "twinber-be8b6",
  storageBucket: "twinber-be8b6.firebasestorage.app",
  messagingSenderId: "445715471893",
  appId: "1:445715471893:web:cc1ed73fba5435964af81c"
};

const app = !firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app();
export const db = app.firestore();
export const auth = app.auth();

export const collection = (parent: any, path: string) => parent.collection(path);
export const getDocs = (query: any) => query.get();
export const doc = (parent: any, path?: string, ...args: any[]) => {
  if (parent.collection && path) return parent.collection(path).doc(args[0]);
  return parent.doc(path);
};
export const runTransaction = (db: any, fn: any) => db.runTransaction(fn);
export const query = (ref: any, ...constraints: any[]) => {
  let q = ref;
  for (const c of constraints) q = c(q);
  return q;
};
export const where = (field: string, op: any, val: any) => (q: any) => q.where(field, op, val);
export const orderBy = (field: string, dir?: any) => (q: any) => q.orderBy(field, dir);
export const onSnapshot = (ref: any, ...args: any[]) => ref.onSnapshot(...args);
export const serverTimestamp = () => firebase.firestore.FieldValue.serverTimestamp();
export const setDoc = (ref: any, data: any) => ref.set(data);
export const getDoc = async (ref: any) => {
  const snap = await ref.get();
  return {
    exists: () => snap.exists,
    data: () => snap.data(),
    id: snap.id,
    ref: snap.ref
  };
};

export const Timestamp = firebase.firestore.Timestamp;
export type Timestamp = firebase.firestore.Timestamp;

export const onAuthStateChanged = (auth: any, next: any) => auth.onAuthStateChanged(next);
export const signInAnonymously = (auth: any) => auth.signInAnonymously();
export const signInWithEmailAndPassword = (auth: any, e: string, p: string) => auth.signInWithEmailAndPassword(e, p);
export const signOut = (auth: any) => auth.signOut();
export const createUserWithEmailAndPassword = (auth: any, e: string, p: string) => auth.createUserWithEmailAndPassword(e, p);
export const EmailAuthProvider = firebase.auth.EmailAuthProvider;
export const linkWithCredential = (user: any, cred: any) => user.linkWithCredential(cred);

export type User = firebase.User;
