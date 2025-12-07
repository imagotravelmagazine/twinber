import React from 'react';
import { type Conversation } from '../types';
import Card from './common/Card';
import { useAppContext } from '../contexts/AppContext';

interface MessageBoxProps {
  conversations: Conversation[];
  currentUserCode?: string;
  onViewConversation: (conversationId: string) => void;
}

const MessageBox: React.FC<MessageBoxProps> = ({ conversations, currentUserCode, onViewConversation }) => {
  const { t } = useAppContext();

  const sortedConversations = [...conversations].sort((a, b) => {
    const timeA = a.lastUpdate?.toMillis() || 0;
    const timeB = b.lastUpdate?.toMillis() || 0;
    return timeB - timeA;
  });

  return (
    <Card className="w-full max-w-2xl animate-fade-in-up">
      <h2 className="text-3xl font-bold text-center text-cyan-400 mb-8">{t('message_box_title')}</h2>
      
      <div className="space-y-3">
        {sortedConversations.length > 0 ? (
          sortedConversations.map(convo => {
            const partner = convo.participant1.code === currentUserCode ? convo.participant2 : convo.participant1;
            const lastMessage = convo.lastMessage;
            const lastMessageText = lastMessage 
              ? lastMessage.senderCode === currentUserCode 
                ? t('message_box_last_message_you', { message: lastMessage.text })
                : lastMessage.text
              : '';

            return (
              <div 
                key={convo.id} 
                className="bg-slate-800/60 p-4 rounded-lg flex items-center justify-between gap-4 transition-all hover:bg-slate-700/60 cursor-pointer"
                onClick={() => onViewConversation(convo.id)}
              >
                <div className="flex-grow overflow-hidden">
                  <div className="flex justify-between items-baseline">
                    <p className="font-semibold text-slate-200 text-lg truncate">{partner.name}</p>
                    <p className="font-mono text-xs text-cyan-400">{convo.compatibilityScore}%</p>
                  </div>
                  <p className="text-slate-400 text-sm truncate">{lastMessageText}</p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-slate-400 text-center py-8">{t('message_box_no_conversations')}</p>
        )}
      </div>
    </Card>
  );
};

export default MessageBox;
