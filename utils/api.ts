import { type UserData, type Conversation, type Message, type UserInfo } from '../types';
import { 
  db, 
  auth, 
  EmailAuthProvider, 
  linkWithCredential, 
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
} from '../firebase';

export const fetchUsers = async (): Promise<UserData[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    const users: UserData[] = [];
    querySnapshot.forEach((doc) => {
      users.push(doc.data() as UserData);
    });
    return users;
  } catch (error) {
    console.error("Error fetching users from Firestore:", error);
    return [];
  }
};

export const saveUser = async (userData: UserData): Promise<void> => {
  try {
    const userRef = doc(db, "users", userData.uid);
    await setDoc(userRef, userData);
  } catch (error) {
    console.error("Error saving user to Firestore:", error);
    throw error;
  }
};

export const fetchUserDataByUid = async (uid: string): Promise<UserData | null> => {
    try {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            return userSnap.data() as UserData;
        }
        return null;
    } catch (error) {
        console.error("Error fetching user data by UID:", error);
        return null;
    }
};

export const fetchUserDataByCode = async (code: string): Promise<UserData | null> => {
    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("code", "==", code));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            return querySnapshot.docs[0].data() as UserData;
        }
        return null;
    } catch (error) {
        console.error("Error fetching user by code:", error);
        return null;
    }
};

export const sendMessage = async (
  currentUserData: UserData,
  partnerData: UserData,
  text: string,
  compatibilityScore: number
): Promise<void> => {
  const [uid1, uid2] = [currentUserData.uid, partnerData.uid].sort();
  const conversationId = `${uid1}-${uid2}`;
  
  const conversationRef = doc(db, "conversations", conversationId);
  // FIX: Costruiamo il percorso come stringa unica per evitare errori di argomenti nella sintassi modulare
  const messagesColRef = collection(db, `conversations/${conversationId}/messages`);

  const newMessage: Message = {
    senderCode: currentUserData.code,
    senderUid: currentUserData.uid,
    text,
    timestamp: serverTimestamp(),
  };

  try {
    await runTransaction(db, async (transaction) => {
      const convoDoc = await transaction.get(conversationRef);
      
      if (!convoDoc.exists()) {
        const participant1Data = { ...currentUserData.userInfo, code: currentUserData.code, uid: currentUserData.uid };
        const participant2Data = { ...partnerData.userInfo, code: partnerData.code, uid: partnerData.uid };
        
        const newConversationData: Conversation = {
          id: conversationId,
          participantUids: [uid1, uid2],
          participant1: uid1 === currentUserData.uid ? participant1Data : participant2Data,
          participant2: uid1 === currentUserData.uid ? participant2Data : participant1Data,
          compatibilityScore,
          lastMessage: newMessage,
          lastUpdate: serverTimestamp(),
        };

        transaction.set(conversationRef, newConversationData);
      } else {
        transaction.update(conversationRef, {
          lastMessage: newMessage,
          lastUpdate: serverTimestamp(),
        });
      }
      
      const newMessageRef = doc(messagesColRef);
      transaction.set(newMessageRef, newMessage);
    });
  } catch (error) {
    console.error("Transaction failed: ", error);
    throw error;
  }
};

export const getConversationsListener = (
  currentUserUid: string, 
  callback: (conversations: Conversation[]) => void
) => {
  const q = query(
    collection(db, "conversations"), 
    where("participantUids", "array-contains", currentUserUid),
    orderBy("lastUpdate", "desc")
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const conversations: Conversation[] = [];
    querySnapshot.forEach((doc) => {
      conversations.push(doc.data() as Conversation);
    });
    callback(conversations);
  }, (error) => {
    console.error("Error listening to conversations:", error);
  });

  return unsubscribe;
};

export const getMessagesListener = (
  conversationId: string,
  callback: (messages: Message[]) => void
) => {
  // FIX: Percorso come stringa unica
  const messagesColRef = collection(db, `conversations/${conversationId}/messages`);
  const q = query(messagesColRef, orderBy("timestamp", "asc"));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const messages: Message[] = [];
    querySnapshot.forEach((doc) => {
      messages.push(doc.data() as Message);
    });
    callback(messages);
  }, (error) => {
    console.error("Error listening to messages:", error);
  });

  return unsubscribe;
};

export const linkAnonymousAccountToEmail = async (email: string, password: string): Promise<void> => {
    if (!auth.currentUser) {
        throw new Error("No user is currently signed in.");
    }
    try {
        const credential = EmailAuthProvider.credential(email, password);
        await linkWithCredential(auth.currentUser, credential);
    } catch (error) {
        console.error("Error linking account:", error);
        throw error;
    }
};
