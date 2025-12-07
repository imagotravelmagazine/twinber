import React, { useState, useCallback, useEffect } from 'react';
import HomePage from './components/HomePage';
import UserInfoPage from './components/UserInfoPage';
import Questionnaire from './components/Questionnaire';
import UserResult from './components/UserResult';
import ComparisonPage from './components/ComparisonPage';
import CompatibilityResult from './components/CompatibilityResult';
import AdminPage from './components/AdminPage';
import UserDetailPage from './components/UserDetailPage';
import MessageBox from './components/MessageBox';
import ChatView from './components/ChatView';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import UserLoginPage from './components/UserLoginPage';
import { type AnswerData, type CompatibilityReport, type UserData, type UserInfo, type Conversation } from './types';
import { generateUserCode, calculateCompatibility } from './utils/helpers';
import Header from './components/common/Header';
import { useAppContext } from './contexts/AppContext';
import ChoicePage from './components/ChoicePage';
import { getQuestionsForLanguage } from './i18n';
import { auth, onAuthStateChanged, signInAnonymously, signOut, type User } from './firebase';
import { fetchUsers, saveUser, sendMessage, getConversationsListener, fetchUserDataByUid, fetchUserDataByCode } from './utils/api';


type View = 'home' | 'userInfo' | 'choice' | 'questionnaire' | 'userResult' | 'comparison' | 'compatibilityResult' | 'admin' | 'userDetail' | 'messageBox' | 'chatView' | 'register' | 'userLogin';

type SavedQuizProgress = {
  answers: (number | null)[];
  currentQuestionIndex: number;
  userInfo: UserInfo;
};

// ⚠️ IMPORTANTE: Sostituisci o aggiungi qui le email che devono avere accesso Admin.
const ADMIN_EMAILS = ['alessandrovilla4@gmail.com', 'fafromitaly@gmail.com'];

const App: React.FC = () => {
  const { language, setLanguage, t } = useAppContext();
  const [view, setView] = useState<View>('home');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [currentUserData, setCurrentUserData] = useState<UserData | null>(null);
  const [comparisonReport, setComparisonReport] = useState<CompatibilityReport | null>(null);
  const [reportsHistory, setReportsHistory] = useState<CompatibilityReport[]>([]);
  const [archive, setArchive] = useState<UserData[]>([]);
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<UserData | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [savedQuizProgress, setSavedQuizProgress] = useState<SavedQuizProgress | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  
  const questions = getQuestionsForLanguage(language || 'en');

  const isUserAuthenticated = authUser && !authUser.isAnonymous;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAuthUser(user);
        // Check if the currently logged-in user is an admin
        if (user.email && ADMIN_EMAILS.includes(user.email)) {
            setIsAdminAuthenticated(true);
        } else {
            setIsAdminAuthenticated(false);
        }
      } else {
        // This should not happen if anonymous auth is enabled, but as a fallback:
        try {
          const userCredential = await signInAnonymously(auth);
          setAuthUser(userCredential.user);
        } catch (error) {
          console.error("Anonymous sign-in failed", error);
        }
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadUserData = async () => {
        if (!authUser) return;

        const userData = await fetchUserDataByUid(authUser.uid);
        setCurrentUserData(userData);
        
        // Load data specific to the logged-in user
        const savedReportsData = localStorage.getItem(`twinber-reports-${authUser.uid}`);
        if (savedReportsData) {
          setReportsHistory(JSON.parse(savedReportsData));
        } else {
          setReportsHistory([]);
        }

        const savedProgressRaw = localStorage.getItem('twinber-quiz-progress');
        if (savedProgressRaw) {
          setSavedQuizProgress(JSON.parse(savedProgressRaw));
        } else {
          setSavedQuizProgress(null);
        }

        if (userData && view === 'home') {
          setView('choice');
        }
    };
    loadUserData();
  }, [authUser, view]);


  useEffect(() => {
    if (!authUser?.uid) {
      setConversations([]);
      return;
    }
    const unsubscribe = getConversationsListener(authUser.uid, (loadedConversations) => {
      setConversations(loadedConversations);
    });
    return () => unsubscribe();
  }, [authUser]);
  

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  const handleReset = useCallback(() => {
    setView('home');
    setUserInfo(null);
    setComparisonReport(null);
    // FIX: Non resettiamo la lingua qui per mantenerla al refresh
    localStorage.removeItem('twinber-quiz-progress');
    setSavedQuizProgress(null);
    // User data is tied to auth, so we don't clear it here.
  }, []);

  const handleStart = useCallback(() => {
    if (language) {
      // FIX: Se c'è un progresso salvato, saltiamo la pagina di inserimento dati
      // e andiamo direttamente alla scelta, caricando i dati salvati temporaneamente.
      if (savedQuizProgress) {
        setUserInfo(savedQuizProgress.userInfo);
        setView('choice');
      } else {
        // Se non c'è progresso, chiediamo i dati normalmente
        setView('userInfo');
      }
    }
  }, [language, savedQuizProgress]);

  const handleUserInfoSubmit = useCallback((info: UserInfo) => {
    setUserInfo(info);
    setView('choice');
  }, []);

  const handleStartQuiz = useCallback(() => {
    if (savedQuizProgress) {
        if (window.confirm(t('confirm_discard_progress'))) {
            localStorage.removeItem('twinber-quiz-progress');
            setSavedQuizProgress(null);
            // FIX: Se scartiamo i progressi, dobbiamo tornare a chiedere i dati dell'utente (UserInfo)
            // perché quelli attuali potrebbero essere quelli vecchi recuperati dal salvataggio.
            setUserInfo(null); 
            setView('userInfo');
        }
    } else {
        // Se arriviamo qui da UserInfoPage senza progressi precedenti, userInfo è già settato
        if (userInfo) {
           setView('questionnaire');
        } else {
           // Fallback di sicurezza
           setView('userInfo');
        }
    }
  }, [savedQuizProgress, t, userInfo]);
  
  const handleResumeQuiz = useCallback(() => {
    if (savedQuizProgress) {
        // Assicuriamoci di usare le info salvate nel progresso
        setUserInfo(savedQuizProgress.userInfo);
        setView('questionnaire');
    }
  }, [savedQuizProgress]);

  const handleSaveAndExitQuiz = useCallback(() => {
    setView('choice');
  }, []);


  const handleQuizComplete = useCallback(async (answers: number[]): Promise<void> => {
    if (!userInfo || !authUser) {
      console.error("Missing user info or auth user at quiz completion");
      handleReset();
      return Promise.reject(new Error("User info or auth user is missing"));
    }

    try {
        setIsLoading(true);
        const code = generateUserCode();
        const data: UserData = { uid: authUser.uid, userInfo, code, answers };
        
        await saveUser(data);
        setCurrentUserData(data);
        
        try {
          localStorage.removeItem('twinber-quiz-progress');
          setSavedQuizProgress(null);
        } catch (error) {
          console.error('Failed to remove quiz progress from localStorage', error);
        }
        
        // FIX: Assicuriamoci che lo stato sia pulito prima di cambiare vista
        setUserInfo(null);
        setView('userResult');
    } catch (error) {
        console.error("Error saving quiz results:", error);
        alert("Errore nel salvataggio dei risultati. Per favore riprova.");
    } finally {
        setIsLoading(false);
    }
    return Promise.resolve();
  }, [userInfo, authUser, handleReset]);
  
  const handleStartComparison = useCallback(() => {
    setView('comparison');
  }, []);

  const handleCalculate = useCallback(async (data1: AnswerData, data2: AnswerData) => {
    const user1Data = await fetchUserDataByCode(data1.code);
    const user2Data = await fetchUserDataByCode(data2.code);

    if (!user1Data || !user2Data) {
        console.error("One or both users not found for calculation");
        return;
    }

    const reportBase = calculateCompatibility(data1, data2, questions);
    
    const report: CompatibilityReport = { 
        ...reportBase, 
        user1Info: user1Data.userInfo, 
        user2Info: user2Data.userInfo 
    };
    
    setComparisonReport(report);
    
    if (authUser) {
        try {
            const savedReportsRaw = localStorage.getItem(`twinber-reports-${authUser.uid}`);
            const savedReports = savedReportsRaw ? JSON.parse(savedReportsRaw) : [];
            const newReports = [report, ...savedReports];
            localStorage.setItem(`twinber-reports-${authUser.uid}`, JSON.stringify(newReports));
            setReportsHistory(newReports);
        } catch (error) {
            console.error('Failed to save compatibility report to localStorage', error);
        }
    }
    
    setView('compatibilityResult');
  }, [questions, authUser]);

  const handleCompareAgain = useCallback(() => {
    setComparisonReport(null);
    setView('comparison');
  }, []);

  const handleClearHistory = useCallback(() => {
    if (window.confirm(t('admin_confirm_clear_history')) && authUser) {
      setReportsHistory([]);
       try {
        localStorage.removeItem(`twinber-reports-${authUser.uid}`);
      } catch (error) {
        console.error('Failed to clear reports from localStorage', error);
      }
    }
  }, [t, authUser]);

  const handleViewAdmin = useCallback(async () => {
      // Check authUser directly for immediate feedback or rely on state
      if (isAdminAuthenticated) {
          setIsLoading(true);
          const users = await fetchUsers();
          setArchive(users);
          setIsLoading(false);
          setView('admin');
      } else {
          // If not admin, show login. If they log in and match ADMIN_EMAILS, 
          // onAuthStateChanged will set isAdminAuthenticated to true.
          setShowAdminLogin(true);
      }
  }, [isAdminAuthenticated]);

  const handleAdminLoginSuccess = useCallback(() => {
      // Check current user immediately after login
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.email && ADMIN_EMAILS.includes(currentUser.email)) {
          setIsAdminAuthenticated(true);
          setShowAdminLogin(false);
          handleViewAdmin();
      } else {
          alert("Access Denied: You are not an administrator.");
          signOut(auth);
          setIsAdminAuthenticated(false);
      }
  }, [handleViewAdmin]);

  const handleAdminLogout = useCallback(async () => {
    await signOut(auth); // This signs out the admin
    setIsAdminAuthenticated(false);
    // A new anonymous user will be signed in automatically by the onAuthStateChanged listener
    setView('home');
    setLanguage(null);
  }, [setLanguage]);

  const handleUserLogout = useCallback(async () => {
    await signOut(auth);
    // Clean up local state for the logged-out user
    setCurrentUserData(null);
    setConversations([]);
    setReportsHistory([]);
    setView('home');
    // FIX: Non resettiamo la lingua al logout
    // setLanguage(null);
    // A new anonymous user will be signed in automatically by the onAuthStateChanged listener
  }, []);

  const handleNavigateToRegister = useCallback(() => setView('register'), []);
  const handleNavigateToUserLogin = useCallback(() => setView('userLogin'), []);
  const handleAuthSuccess = useCallback(() => setView('choice'), []);

  const handleViewReportFromHistory = useCallback((report: CompatibilityReport) => {
      setComparisonReport(report);
      setView('compatibilityResult');
  }, []);
  
  const handleViewUserDetail = useCallback((user: UserData) => {
    setSelectedUserForDetail(user);
    setView('userDetail');
  }, []);

  const handleViewMessageBox = useCallback(() => {
    setView('messageBox');
  }, []);

  const handleViewChat = useCallback((conversationId: string) => {
    setActiveConversationId(conversationId);
    setView('chatView');
  }, []);
  
  const handleStartChatWithInitialMessage = useCallback(async (report: CompatibilityReport, firstMessageText: string) => {
    if (!currentUserData) return;

    const partnerCode = currentUserData.code === report.user1Code ? report.user2Code : report.user1Code;
    const partnerData = await fetchUserDataByCode(partnerCode);

    if (!partnerData) {
        console.error("Partner data not found to start chat");
        return;
    }
    
    await sendMessage(currentUserData, partnerData, firstMessageText, report.overallScore);
  }, [currentUserData]);

  const handleSendMessage = useCallback(async (conversationId: string, text: string) => {
    if (!currentUserData) return;
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) return;

    const partnerInfo = conversation.participant1.uid === currentUserData.uid ? conversation.participant2 : conversation.participant1;
    const partnerData = await fetchUserDataByUid(partnerInfo.uid);

    if (!partnerData) {
        console.error("Partner data not found to send message");
        return;
    }
    
    await sendMessage(currentUserData, partnerData, text, conversation.compatibilityScore);
  }, [currentUserData, conversations]);
  
  const getBackHandler = useCallback(() => {
    const homeOrChoice = currentUserData ? 'choice' : 'home';

    switch (view) {
        case 'userInfo': return () => setView('home');
        case 'choice':
            // Se siamo in choice ma NON abbiamo ancora un profilo completo (stiamo facendo il quiz)
            // e abbiamo info utente, tornare indietro significa andare a userInfo.
            // MA se siamo arrivati qui saltando userInfo (perché c'è progresso), tornare indietro deve andare alla Home.
            if (userInfo && !currentUserData && !savedQuizProgress) return () => setView('userInfo');
            return () => setView('home'); 
        case 'questionnaire': return () => setView('choice');
        case 'userResult': return () => setView('choice');
        case 'comparison': return () => setView('choice');
        case 'compatibilityResult': return () => setView('comparison');
        case 'admin': return () => setView(homeOrChoice);
        case 'userDetail': return handleViewAdmin;
        case 'messageBox': return () => setView('choice');
        case 'chatView': return handleViewMessageBox;
        case 'register': return () => setView('userResult');
        case 'userLogin': return () => setView('choice');
        default: return null;
    }
  }, [view, currentUserData, userInfo, handleViewMessageBox, handleViewAdmin, handleReset, savedQuizProgress]);

  const backHandler = getBackHandler();

  const renderView = () => {
    const homeOrChoice = currentUserData ? 'choice' : 'home';

    if (showAdminLogin) {
        return <LoginPage onLoginSuccess={handleAdminLoginSuccess} />;
    }
    
    if (view === 'register') {
        return <RegisterPage onRegisterSuccess={handleAuthSuccess} />;
    }

    if (view === 'userLogin') {
        return <UserLoginPage onLoginSuccess={handleAuthSuccess} />;
    }

    if (view === 'comparison' || view === 'compatibilityResult') {
      return (
        <>
          <div style={{ display: view === 'comparison' ? 'block' : 'none' }}>
            <ComparisonPage
              onCalculate={handleCalculate}
              currentUserData={currentUserData}
              archive={archive}
              questions={questions}
            />
          </div>
          {view === 'compatibilityResult' && comparisonReport && (
            <CompatibilityResult
              report={comparisonReport}
              onCompareAgain={handleCompareAgain}
              currentUserData={currentUserData}
              onStartChat={handleStartChatWithInitialMessage}
            />
          )}
        </>
      );
    }
    
    switch (view) {
      case 'userInfo':
        return <UserInfoPage onContinue={handleUserInfoSubmit} />;
      case 'choice':
        return <ChoicePage 
                  onStartQuiz={handleStartQuiz} 
                  onStartComparison={handleStartComparison} 
                  onViewHistory={handleViewAdmin} 
                  hasHistory={reportsHistory.length > 0} 
                  hasSavedProgress={!!savedQuizProgress}
                  onResumeQuiz={handleResumeQuiz}
                  onLogin={handleNavigateToUserLogin}
                  isUserAuthenticated={isUserAuthenticated}
                  savedUserName={savedQuizProgress?.userInfo?.name}
                />;
      case 'questionnaire':
        if (!userInfo) {
            setView('userInfo');
            return null;
        }
        return <Questionnaire 
                    userInfo={userInfo}
                    onComplete={handleQuizComplete} 
                    onSaveAndExit={handleSaveAndExitQuiz}
                    initialProgress={savedQuizProgress && userInfo.name === savedQuizProgress.userInfo.name ? savedQuizProgress : null}
                />;
      case 'userResult':
        if (!currentUserData) {
            setView('choice'); 
            return null;
        }
        return <UserResult 
                  userData={currentUserData} 
                  onContinue={handleStartComparison} 
                  onReset={handleReset} 
                  onRegister={handleNavigateToRegister}
                  isUserAuthenticated={isUserAuthenticated}
                />;
      case 'admin':
        if (!isAdminAuthenticated) {
            setView(homeOrChoice);
            return null;
        }
        return <AdminPage 
            reports={reportsHistory} 
            archive={archive}
            questions={questions}
            onViewReport={handleViewReportFromHistory} 
            onViewUserDetail={handleViewUserDetail}
            onClearHistory={handleClearHistory} 
            onLogout={handleAdminLogout}
             />;
      case 'userDetail':
        if (!selectedUserForDetail || !isAdminAuthenticated) {
          setView('admin');
          return null;
        }
        return <UserDetailPage 
          user={selectedUserForDetail}
          questions={questions}
          />;
      case 'messageBox':
        return <MessageBox 
          conversations={conversations}
          currentUserCode={currentUserData?.code}
          onViewConversation={handleViewChat}
        />;
      case 'chatView':
        const activeConversation = conversations.find(c => c.id === activeConversationId);
        if (!activeConversation || !currentUserData) {
          setView('messageBox');
          return null;
        }
        return <ChatView 
          conversation={activeConversation}
          currentUserCode={currentUserData.code}
          onSendMessage={handleSendMessage}
        />;
      case 'home':
      default:
        return <HomePage onStart={handleStart} onViewAdmin={handleViewAdmin} />;
    }
  };
  
  if (isLoading || !authUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-black text-slate-200 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-cyan-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-xl font-semibold text-slate-300">{t('questionnaire_loading')}</p>
        </div>
      </div>
    );
  }

  const isIntroPage = view === 'home' || showAdminLogin || view === 'userLogin' || view === 'register';
  const mainContainerClass = `min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-black text-slate-200 flex flex-col items-center relative ${isIntroPage ? 'justify-center p-4' : 'pt-20 p-4'}`;

  return (
    <div className={mainContainerClass}>
        {!isIntroPage && (
            <Header
                onBack={backHandler}
                onHome={() => setView(currentUserData ? 'choice' : 'home')}
                onMessages={handleViewMessageBox}
                showMessagesIcon={!!currentUserData}
                t={t}
                onLogout={handleUserLogout}
                isUserAuthenticated={isUserAuthenticated}
            />
        )}
       <div className="w-full max-w-4xl mx-auto">
        {renderView()}
       </div>
    </div>
  );
};

export default App;
