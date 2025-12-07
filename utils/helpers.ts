
import { type AnswerData, type CompatibilityReport, type Question, type UserData } from '../types';
import { enQuestions } from '../i18n/en';
import { COUNTRIES } from '../constants/countries';

export const generateUserCode = (): string => {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  const charactersLength = chars.length;
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const encodeAnswers = (data: AnswerData): string => {
  try {
    const jsonString = JSON.stringify(data);
    return btoa(jsonString);
  } catch (error) {
    console.error("Failed to encode answers:", error);
    return '';
  }
};

export const decodeAnswers = (encodedString: string, questions: Question[]): AnswerData | null => {
  try {
    const jsonString = atob(encodedString);
    const data = JSON.parse(jsonString);
    if (data.code && Array.isArray(data.answers) && data.answers.length === questions.length) {
      return data as AnswerData;
    }
    return null;
  } catch (error) {
    // Invalid user input is expected, so no need to log an error.
    // The UI will show a user-friendly error message.
    return null;
  }
};

export const calculateCompatibility = (data1: AnswerData, data2: AnswerData, questions: Question[]): CompatibilityReport => {
  let totalMatches = 0;
  const categoryStats: { [key: string]: { matches: number; count: number } } = {};

  questions.forEach((question, index) => {
    const answer1 = data1.answers[index];
    const answer2 = data2.answers[index];
    const isMatch = answer1 === answer2;

    if (isMatch) {
      totalMatches++;
    }

    if (!categoryStats[question.category]) {
      categoryStats[question.category] = { matches: 0, count: 0 };
    }
    if (isMatch) {
      categoryStats[question.category].matches++;
    }
    categoryStats[question.category].count++;
  });

  const overallScore = Math.round((totalMatches / questions.length) * 100);

  const categoryScores = Object.entries(categoryStats).map(([category, data]) => {
    const score = data.count > 0 ? Math.round((data.matches / data.count) * 100) : 0;
    return { category, score };
  });

  return {
    overallScore,
    categoryScores,
    user1Code: data1.code,
    user2Code: data2.code,
  };
};


export const exportArchiveToCSV = (archive: UserData[], questions: Question[]): void => {
  if (archive.length === 0) {
    alert('No data in archive to export.');
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,";
  const headers = ["Name", "Age", "Gender", "Country", "Code", ...questions.map((_, i) => `Answer ${i + 1}`)];
  csvContent += headers.join(",") + "\r\n";

  archive.forEach(userData => {
    const countryName = COUNTRIES.find(c => c.code === userData.userInfo.country)?.name || userData.userInfo.country;
    const row = [
      `"${userData.userInfo.name.replace(/"/g, '""')}"`,
      userData.userInfo.age,
      userData.userInfo.gender,
      countryName,
      userData.code,
      ...userData.answers
    ];
    csvContent += row.join(",") + "\r\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "twinber_archive.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportUserQAToCSV = (
  user: UserData, 
  questions: Question[],
  header_question: string,
  header_answer: string,
  yes_string: string,
  no_string: string
): void => {
  let csvContent = "data:text/csv;charset=utf-8,";
  const headers = [header_question, header_answer];
  csvContent += headers.join(",") + "\r\n";

  questions.forEach((question, index) => {
    const questionText = `"${question.text.replace(/"/g, '""')}"`;
    const answerText = user.answers[index] === 1 ? yes_string : no_string;
    const row = [questionText, answerText];
    csvContent += row.join(",") + "\r\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `twinber_answers_${user.userInfo.name.replace(/\s/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportFilteredUsersToCSV = (
  users: UserData[],
  questionNumbers: number[], // 1-based
  allQuestions: Question[],
  yes_string: string,
  no_string: string
): void => {
  if (users.length === 0) {
    alert('No filtered users to export.');
    return;
  }

  const questionIndices = questionNumbers.map(n => n - 1);
  const selectedQuestions = questionIndices.map(i => allQuestions[i]);

  let csvContent = "data:text/csv;charset=utf-8,";

  const headers = [
    "Name",
    "Age",
    "Gender",
    "Country",
    "Code",
    ...selectedQuestions.map(q => `"${q.text.replace(/"/g, '""')}"`)
  ];
  csvContent += headers.join(",") + "\r\n";

  users.forEach(user => {
    const answers = questionIndices.map(i => user.answers[i] === 1 ? yes_string : no_string);
    const countryName = COUNTRIES.find(c => c.code === user.userInfo.country)?.name || user.userInfo.country;
    const row = [
      `"${user.userInfo.name.replace(/"/g, '""')}"`,
      user.userInfo.age,
      user.userInfo.gender,
      countryName,
      user.code,
      ...answers
    ];
    csvContent += row.join(",") + "\r\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  const filterString = questionNumbers.join('_');
  link.setAttribute("download", `twinber_filtered_q${filterString}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};