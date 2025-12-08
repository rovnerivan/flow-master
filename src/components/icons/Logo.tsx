import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', showText = true }) => {
  const sizes = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
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
            <linearGradient id="sailGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="1" />
              <stop offset="100%" stopColor="white" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(211, 100%, 60%)" stopOpacity="0.6" />
              <stop offset="50%" stopColor="hsl(211, 100%, 70%)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="hsl(211, 100%, 60%)" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          
          {/* Background circle with gradient */}
          <circle
            cx="20"
            cy="20"
            r="18"
            fill="url(#logoGradient)"
          />
          
          {/* Sailboat - representing smooth sailing / viento en popa */}
          {/* Hull of the boat */}
          <path
            d="M8 26 L12 30 L28 30 L32 26 L8 26 Z"
            fill="white"
            fillOpacity="0.9"
          />
          
          {/* Main sail - billowing with wind */}
          <path
            d="M20 8 L20 25 L30 23 Q25 16 20 8 Z"
            fill="url(#sailGradient)"
          />
          
          {/* Secondary sail */}
          <path
            d="M20 10 L20 22 L13 21 Q16 16 20 10 Z"
            fill="white"
            fillOpacity="0.7"
          />
          
          {/* Mast */}
          <line
            x1="20"
            y1="8"
            x2="20"
            y2="26"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          
          {/* Wind lines - showing movement */}
          <path
            d="M6 14 Q8 13 10 14"
            stroke="white"
            strokeWidth="1"
            strokeOpacity="0.5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M5 18 Q8 17 11 18"
            stroke="white"
            strokeWidth="1"
            strokeOpacity="0.6"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M6 22 Q9 21 12 22"
            stroke="white"
            strokeWidth="1"
            strokeOpacity="0.4"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Wave under boat */}
          <path
            d="M4 32 Q10 30 16 32 Q22 34 28 32 Q34 30 36 32"
            stroke="url(#waveGradient)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-bold gradient-text ${textSizes[size]}`}>
            Viento en Popa
          </span>
          <span className={`text-muted-foreground ${size === 'lg' ? 'text-sm' : 'text-xs'} font-medium`}>
            Manager
          </span>
        </div>
      )}
    </div>
  );
};
