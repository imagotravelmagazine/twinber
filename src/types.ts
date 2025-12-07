import { Timestamp } from './firebase';

export interface Question {
  category: string;
  text: string;
}

export interface AnswerData {
  code: string;
  answers: number[];
}

export interface UserInfo {
  name: string;
  age: number | '';
  gender: string;
  country: string;
}

export interface UserData {
  uid: string;
  userInfo: UserInfo;
  code: string;
  answers: number[];
}

export interface CompatibilityCategoryScore {
    category: string;
    score: number;
}

export interface CompatibilityReport {
    overallScore: number;
    categoryScores: CompatibilityCategoryScore[];
    user1Code: string;
    user2Code: string;
    user1Info?: UserInfo;
    user2Info?: UserInfo;
}

export interface Message {
  senderCode: string; // Keep senderCode for display
  senderUid: string;
  text: string;
  timestamp: Timestamp | any; // Can be a number or a Firestore Timestamp
}

export interface Conversation {
  id: string; // "UID1-UID2" sorted
  participant1: UserInfo & { code: string; uid: string; };
  participant2: UserInfo & { code: string; uid: string; };
  participantUids: string[];
  compatibilityScore: number;
  lastMessage: Message | null;
  lastUpdate: Timestamp | any; // Can be a number or a Firestore Timestamp
}

export type Conversations = Record<string, Conversation>;