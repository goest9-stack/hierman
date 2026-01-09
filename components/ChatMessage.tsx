import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, User } from './Icons';
import { Message, Role } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  return (
    <div className={`group flex gap-4 p-6 ${isUser ? 'bg-transparent' : 'bg-coporties-surface/30'} border-b border-transparent hover:border-coporties-border/50 transition-colors`}>
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
        isUser ? 'bg-coporties-surface text-coporties-text' : 'bg-coporties-red/20 text-coporties-red shadow-[0_0_10px_rgba(239,68,68,0.15)]'
      }`}>
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-6 h-6" />}
      </div>
      
      <div className="flex-1 min-w-0 space-y-3">
        {/* Name and Time */}
        <div className="flex items-center gap-3">
          <span className={`text-sm font-bold ${isUser ? 'text-coporties-text' : 'text-coporties-red'}`}>
            {isUser ? 'You' : 'AI Coporties'}
          </span>
          <span className="text-xs text-coporties-muted">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {message.attachments.map((att, idx) => (
              att.mimeType.startsWith('image/') ? (
                <img 
                  key={idx} 
                  src={`data:${att.mimeType};base64,${att.data}`} 
                  alt={att.name}
                  className="h-32 w-auto rounded-md border border-coporties-border object-cover"
                />
              ) : (
                <div key={idx} className="bg-coporties-surface border border-coporties-border rounded px-3 py-2 text-xs text-coporties-muted flex items-center gap-2">
                  <span className="truncate max-w-[150px]">{att.name}</span>
                </div>
              )
            ))}
          </div>
        )}

        {/* Content */}
        <div className={`prose prose-invert prose-sm max-w-none ${
          message.isError ? 'text-red-400 italic' : 'text-gray-300'
        }`}>
            {message.text ? (
                 <ReactMarkdown
                 components={{
                   code({node, inline, className, children, ...props}: any) {
                     const match = /language-(\w+)/.exec(className || '')
                     return !inline ? (
                       <div className="relative group/code my-4">
                         <div className="absolute -top-3 left-2 bg-coporties-border px-2 py-0.5 rounded text-[10px] text-coporties-muted uppercase">
                           {match ? match[1] : 'code'}
                         </div>
                         <pre className="bg-black/50 border border-coporties-border rounded-lg p-4 overflow-x-auto">
                           <code className={className} {...props}>
                             {children}
                           </code>
                         </pre>
                       </div>
                     ) : (
                       <code className="bg-coporties-surface px-1.5 py-0.5 rounded text-coporties-red font-mono text-xs" {...props}>
                         {children}
                       </code>
                     )
                   }
                 }}
               >
                 {message.text}
               </ReactMarkdown>
            ) : (
                <span className="animate-pulse inline-block h-2 w-2 bg-coporties-red rounded-full"></span>
            )}
         
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;