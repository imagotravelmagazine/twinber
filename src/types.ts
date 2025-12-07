import { Timestamp } from 'firebase/firestore';

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
  senderCode: string;
  senderUid: string;
  text: string;
  timestamp: Timestamp | any; 
}

export interface Conversation {
  id: string;
  participant1: UserInfo & { code: string; uid: string; };
  participant2: UserInfo & { code: string; uid: string; };
  participantUids: string[];
  compatibilityScore: number;
  lastMessage: Message | null;
  lastUpdate: Timestamp | any;
}

export type Conversations = Record<string, Conversation>;
