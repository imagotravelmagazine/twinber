
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = "px-6 py-3 font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles = {
    primary: "bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-400 focus:ring-cyan-300 text-slate-900 font-bold shadow-lg shadow-cyan-400/50",
    secondary: "bg-slate-700 hover:bg-slate-600 focus:ring-cyan-500 text-slate-200",
    ghost: "bg-transparent hover:bg-cyan-500/10 focus:ring-cyan-500 text-cyan-400 border border-slate-600 hover:border-cyan-500",
  };

  return (
    <button className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;