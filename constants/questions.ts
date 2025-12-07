
interface CouponData {
  company: string;
  code: string;
  url: string;
}

// English category names are used as keys
export const COUPONS: Record<string, CouponData> = {
  "Food and Drink": { company: "GustoBello Inc.", code: "GUSTO30", url: "https://www.gustobello.com" },
  "Hobbies": { company: "Creativus Ltd.", code: "HOBBYFUN", url: "https://www.creativus.com" },
  "Movies and TV": { company: "CineMax Stream", code: "MOVIEPASS", url: "https://www.cinemaxstream.com" },
  "Music": { company: "Sonoro Audio", code: "SOUNDWAVE", url: "https://www.sonoroaudio.com" },
  "Books and Reading": { company: "PageTurners Co.", code: "READMORE", url: "https://www.pageturners.com" },
  "Travel": { company: "Global Getaways", code: "TRAVEL24", url: "https://www.globalgetaways.com" },
  "Social Life": { company: "ConnectSphere", code: "SOCIAL30", url: "https://www.connectsphere.com" },
  "Home Life": { company: "Cozy Nook", code: "HOMEBODY", url: "https://www.cozynook.com" },
  "Health and Wellness": { company: "VitaPure", code: "HEALTHYME", url: "https://www.vitapure.com" },
  "Career and Ambition": { company: "ProGoals", code: "CAREERUP", url: "https://www.progoals.com" },
  "Finances": { company: "SecureWallet", code: "MONEYWISE", url: "https://www.securewallet.com" },
  "Technology and Social Media": { company: "TechVerse", code: "DIGITAL30", url: "https://www.techverse.com" },
  "Humor": { company: "LaughOutLoud", code: "JOKESTER", url: "https://www.laughoutloud.com" },
  "Aesthetics and Style": { company: "VogueVibes", code: "STYLEUP", url: "https://www.voguevibes.com" },
  "Nature and Outdoors": { company: "Evergreen Adventures", code: "OUTDOORSY", url: "https://www.evergreenadventures.com" },
  "Communication Style": { company: "ClearSpeak", code: "TALKWELL", url: "https://www.clearspeak.com" },
  "Emotional Approach": { company: "Heartfelt Moments", code: "FEELGOOD", url: "https://www.heartfeltmoments.com" },
  "Values and Beliefs": { company: "TrueNorth", code: "VALUES30", url: "https://www.truenorth.com" },
  "Relationship Dynamics": { company: "LoveLink", code: "COUPLEGOALS", url: "https://www.lovelink.com" },
  "Future Goals": { company: "DreamBuilders", code: "FUTURENOW", url: "https://www.dreambuilders.com" },
};