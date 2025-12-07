
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-slate-700/40 backdrop-blur-sm border border-slate-600 rounded-2xl shadow-lg p-8 ${className}`}>
      {children}
    </div>
  );
};

export default Card;