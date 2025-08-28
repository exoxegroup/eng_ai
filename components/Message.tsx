
import React from 'react';
import { ChatMessage } from '../types';
import RobotIcon from './icons/RobotIcon';
import UserIcon from './icons/UserIcon';

interface MessageProps {
  message: ChatMessage;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const isLoading = message.text === '...';

  const containerClasses = `flex items-start gap-3 ${isUser ? 'justify-end' : ''}`;
  const bubbleClasses = `max-w-xl rounded-2xl px-4 py-3 shadow-sm ${
    isUser
      ? 'bg-blue-600 text-white rounded-br-lg'
      : 'bg-white text-slate-700 rounded-bl-lg'
  }`;

  const textWithLineBreaks = message.text.split('\n').map((line, index) => (
    <React.Fragment key={index}>
      {line}
      <br />
    </React.Fragment>
  ));

  return (
    <div className={containerClasses}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
          <RobotIcon />
        </div>
      )}
      <div className={bubbleClasses}>
        {isLoading ? (
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
            <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
            <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></span>
          </div>
        ) : (
          <p className="text-sm leading-relaxed">{textWithLineBreaks}</p>
        )}
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center">
          <UserIcon />
        </div>
      )}
    </div>
  );
};

export default Message;
