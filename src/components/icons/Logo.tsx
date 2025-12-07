import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const sizes = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12',
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${sizes[size]} aspect-square relative`}>
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(211, 100%, 50%)" />
              <stop offset="100%" stopColor="hsl(260, 100%, 60%)" />
            </linearGradient>
          </defs>
          <rect
            x="2"
            y="2"
            width="36"
            height="36"
            rx="8"
            fill="url(#logoGradient)"
          />
          <path
            d="M12 14L20 10L28 14V20L20 24L12 20V14Z"
            stroke="white"
            strokeWidth="2"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M12 20L20 24L28 20V26L20 30L12 26V20Z"
            stroke="white"
            strokeWidth="2"
            strokeLinejoin="round"
            fill="white"
            fillOpacity="0.3"
          />
        </svg>
      </div>
      <span className={`font-bold gradient-text ${size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-lg' : 'text-xl'}`}>
        ProcessFlow
      </span>
    </div>
  );
};
