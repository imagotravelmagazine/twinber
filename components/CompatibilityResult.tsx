import React, { useMemo, useState } from 'react';
import { type CompatibilityReport, UserData } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import { useAppContext } from '../contexts/AppContext';

interface CompatibilityResultProps {
  report: CompatibilityReport;
  onCompareAgain: () => void;
  currentUserData: UserData | null;
  onStartChat: (report: CompatibilityReport, firstMessage: string) => Promise<void>;
}

const CompatibilityResult: React.FC<CompatibilityResultProps> = ({ report, onCompareAgain, currentUserData, onStartChat }) => {
  const { t } = useAppContext();

  const [contactState, setContactState] = useState({
    modalOpen: false,
    loading: false,
    message: '',
  });
  const [showSentConfirmation, setShowSentConfirmation] = useState(false);
  
  const generateSummary = useMemo(() => {
    const strengths = report.categoryScores
        .filter(cs => cs.score >= 70)
        .sort((a, b) => b.score - a.score);

    const growthAreas = report.categoryScores
        .filter(cs => cs.score < 40)
        .sort((a, b) => a.score - b.score);
    
    const summaryParagraphs: string[] = [];
    
    const formatCategories = (categories: {category: string}[]) => 
        categories.map(c => `<strong>${c.category}</strong>`).join(', ');

    if (strengths.length > 0) {
        summaryParagraphs.push(t('result_summary_strengths', { categories: formatCategories(strengths) }));
    }

    if (growthAreas.length > 0) {
        summaryParagraphs.push(t('result_summary_growth_areas', { categories: formatCategories(growthAreas) }));
    }

    if (strengths.length === 0 && growthAreas.length === 0) {
        summaryParagraphs.push(t('result_summary_balanced'));
    } else if (summaryParagraphs.length === 1 && strengths.length > 0) {
         summaryParagraphs.push(t('result_summary_strengths_only_ending'));
    } else if (summaryParagraphs.length === 1 && growthAreas.length > 0) {
         summaryParagraphs.push(t('result_summary_growth_only_ending'));
    }

    return summaryParagraphs.map((paragraph, index) => 
        <p key={index} className="text-slate-400 mb-3" dangerouslySetInnerHTML={{ __html: paragraph }} />
    );
  }, [report, t]);
  
  const scoreColor = report.overallScore >= 70 ? 'text-emerald-400' : report.overallScore >= 40 ? 'text-amber-400' : 'text-rose-400';
  
  const user1Display = report.user1Info?.name || report.user1Code;
  const user2Display = report.user2Info?.name || report.user2Code;

  const sortedScores = useMemo(
    () => [...report.categoryScores].sort((a, b) => b.score - a.score),
    [report.categoryScores]
  );
  
  const partnerInfo = currentUserData?.code === report.user1Code ? report.user2Info : report.user1Info;
  const partnerName = partnerInfo?.name || (currentUserData?.code === report.user1Code ? report.user2Code : report.user1Code);


  const handleOpenContactModal = async () => {
    setContactState({ modalOpen: true, loading: true, message: '' });
    if (!currentUserData || !partnerInfo) {
        setContactState(prev => ({ ...prev, loading: false }));
        return;
    }
    
    // Messaggio standard precompilato senza usare l'AI
    const generatedMessage = `Hi ${partnerName},\n\nI just saw our Twinber report and our compatibility is ${report.overallScore}%! That's pretty amazing. It seems we have a lot in common.\n\nSince we're such a good match, I thought it would be cool to connect. What do you think?\n\nBest,\n${currentUserData.userInfo.name}`;

    setContactState(prev => ({ 
        ...prev, 
        loading: false, 
        message: generatedMessage 
    }));
  };

  const handleSendMessage = async () => {
    setContactState(prev => ({ ...prev, loading: true }));
    await onStartChat(report, contactState.message);
    setContactState({ modalOpen: false, loading: false, message: '' });
    setShowSentConfirmation(true);
    setTimeout(() => {
      setShowSentConfirmation(false);
    }, 5000);
  };

  const closeModal = () => {
    if (contactState.loading) return;
    setContactState({ modalOpen: false, message: '', loading: false });
  };

  const canStartChat = currentUserData && partnerInfo;

  return (
    <>
      <Card className="w-full max-w-4xl animate-fade-in-up">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-cyan-400 mb-2">{t('result_title')}</h2>
          <p className="text-slate-400 mb-4">
            {t('result_between')} <span className="font-mono text-cyan-400">{user1Display}</span> {t('result_and')} <span className="font-mono text-cyan-400">{user2Display}</span>
          </p>
        </div>

        <div className="flex flex-col items-center gap-12 my-8">
          <div className="flex flex-col items-center justify-center">
              <p className="text-lg text-slate-400 mb-2">{t('result_overall_score_label')}</p>
              <div className={`w-48 h-48 rounded-full flex items-center justify-center bg-slate-700/50 border-4 ${scoreColor.replace('text-', 'border-')}`}>
                  <span className={`text-6xl font-bold ${scoreColor}`}>
                      {report.overallScore}%
                  </span>
              </div>
          </div>
          <div className="w-full md:w-4/5 lg:w-3/4 space-y-4">
            {sortedScores.map((item) => {
              const barColor = item.score >= 70 ? 'bg-emerald-500' : item.score >= 40 ? 'bg-amber-500' : 'bg-rose-500';
              const scoreColorText = item.score >= 70 ? 'text-emerald-300' : item.score >= 40 ? 'text-amber-300' : 'text-rose-300';
              return (
                <div key={item.category}>
                  <div className="flex justify-between items-center mb-1 text-slate-300">
                    <span className="font-semibold">{item.category}</span>
                    <span className={`font-mono font-bold text-lg ${scoreColorText}`}>{item.score}%</span>
                  </div>
                  <div className="w-full bg-slate-800/50 rounded-full h-5 border border-slate-700 p-0.5">
                    <div
                      className={`${barColor} h-full rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${item.score}%` }}
                      role="progressbar"
                      aria-valuenow={item.score}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${item.category} score`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 border-t border-slate-600 pt-6">
              <h3 className="text-2xl font-bold text-center text-cyan-400 mb-4">{t('result_summary_title')}</h3>
              <div className="text-center max-w-3xl mx-auto prose prose-p:text-slate-400 prose-strong:text-cyan-400">
                  {generateSummary}
              </div>
        </div>
        
        {canStartChat && (
          <div className="mt-10 border-t border-slate-600 pt-8 text-center">
              <h3 className="text-2xl font-bold text-cyan-400 mb-4">{t('result_contact_title')}</h3>
              <p className="text-slate-400 max-w-2xl mx-auto mb-6">{t('result_contact_description', { partnerName: partnerName })}</p>
              <Button 
                  onClick={handleOpenContactModal} 
                  disabled={contactState.loading}
                  className="w-full sm:w-auto"
              >
                  {t('result_contact_button', { partnerName: partnerName })}
              </Button>
          </div>
        )}
        
        <div className="text-center mt-8 border-t border-slate-700 pt-8 flex flex-wrap gap-4 justify-center">
            <Button onClick={onCompareAgain}>{t('result_reset_button')}</Button>
        </div>
      </Card>
      
      {contactState.modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fade-in p-4">
              <Card className="w-full max-w-lg relative">
                    <>
                        <button onClick={closeModal} className="absolute top-4 right-4 text-slate-500 hover:text-white text-3xl leading-none" aria-label="Close" disabled={contactState.loading}>&times;</button>
                        <h3 className="text-2xl font-bold text-cyan-400 mb-4 text-center">{t('result_contact_modal_title')}</h3>
                        <textarea
                            value={contactState.message}
                            onChange={(e) => setContactState(prev => ({ ...prev, message: e.target.value }))}
                            className="w-full h-64 bg-slate-800/50 p-4 rounded-md text-slate-300 border border-slate-600 resize-none whitespace-pre-wrap focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            disabled={contactState.loading}
                        />
                        <div className="flex justify-end gap-4 mt-6">
                            <Button variant="secondary" onClick={closeModal} disabled={contactState.loading}>{t('result_contact_modal_cancel_button')}</Button>
                            <Button onClick={handleSendMessage} disabled={contactState.loading || !contactState.message.trim()}>
                                {contactState.loading ? t('result_contact_modal_sending_button') : t('result_contact_modal_send_button')}
                            </Button>
                        </div>
                    </>
              </Card>
          </div>
      )}
      {showSentConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fade-in p-4">
            <Card className="w-full max-w-md text-center">
                <h3 className="text-2xl font-bold text-emerald-400 mb-4">{t('result_message_sent_title')}</h3>
                <p className="text-slate-300">{t('result_message_sent_description')}</p>
            </Card>
        </div>
      )}
    </>
  );
};

export default CompatibilityResult;