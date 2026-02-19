import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div
      className={`bg-surface rounded-card border border-surface-2 p-6 ${hover ? 'hover:border-primary/50 transition-colors duration-200' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
