
import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  colorClass?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, colorClass = 'bg-cyan-500' }) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="w-full bg-slate-600 rounded-full h-2.5">
      <div
        className={`${colorClass} h-2.5 rounded-full transition-all duration-300 ease-in-out`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;