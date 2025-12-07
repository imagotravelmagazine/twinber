import React, { useState, useRef, useEffect } from 'react';
import { type Conversation, type Message } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import { useAppContext } from '../contexts/AppContext';
import { getMessagesListener } from '../utils/api';

interface ChatViewProps {
  conversation: Conversation;
  currentUserCode: string;
  onSendMessage: (conversationId: string, text: string) => void;
}

const ChatView: React.FC<ChatViewProps> = ({ conversation, currentUserCode, onSendMessage }) => {
  const { t } = useAppContext();
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const partner = conversation.participant1.code === currentUserCode ? conversation.participant2 : conversation.participant1;

  useEffect(() => {
    const unsubscribe = getMessagesListener(conversation.id, (loadedMessages) => {
      setMessages(loadedMessages);
    });
    return () => unsubscribe();
  }, [conversation.id]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(conversation.id, newMessage.trim());
      setNewMessage('');
    }
  };
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Card className="w-full max-w-2xl animate-fade-in-up flex flex-col h-[80vh]">
      <div className="flex items-center justify-center relative mb-4 border-b border-slate-700 pb-4">
        <div className="text-center">
            <h2 className="text-xl font-bold text-cyan-400">{t('chat_view_title', { name: partner.name })}</h2>
            <p className="text-sm text-slate-400 font-mono">{t('chat_view_compatibility', { score: conversation.compatibilityScore })}</p>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto pr-2 space-y-4 mb-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-end gap-2 ${msg.senderCode === currentUserCode ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${
                msg.senderCode === currentUserCode 
                ? 'bg-cyan-600 text-white rounded-br-none'
                : 'bg-slate-700 text-slate-200 rounded-bl-none'
            }`}>
              <p className="whitespace-pre-wrap break-words">{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="mt-auto flex gap-2 border-t border-slate-700 pt-4">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={t('chat_view_input_placeholder')}
          className="flex-grow p-3 bg-slate-800/50 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          aria-label={t('chat_view_input_placeholder')}
        />
        <Button type="submit" disabled={!newMessage.trim()}>{t('chat_view_send_button')}</Button>
      </form>
    </Card>
  );
};

export default ChatView;
