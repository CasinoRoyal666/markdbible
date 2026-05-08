import React from 'react';

const Logo = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: '1.5rem',
    md: '2.5rem',
    lg: '4rem',
    xl: '6rem'
  };

  const fontSize = sizes[size] || sizes.md;

  return (
    <div 
      className={`logo-container ${className}`} 
      style={{ 
        position: 'relative', 
        display: 'inline-block', 
        fontFamily: 'monospace', 
        fontWeight: '900', 
        letterSpacing: '-0.05em',
        fontSize: fontSize
      }}
    >
      <svg 
        viewBox="0 0 200 40" 
        style={{ width: 'auto', height: '1.2em', display: 'block' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="50%" stopColor="var(--accent-color)" />
            <stop offset="50%" stopColor="#8c78ff" />
          </linearGradient>
        </defs>

        <text 
          x="0" 
          y="32" 
          fontFamily="system-ui, sans-serif" 
          fontWeight="900" 
          fontSize="36" 
          style={{ 
            fill: 'url(#logoGradient)',
            letterSpacing: '-2px',
            textTransform: 'none'
          }}
        >
          MarkDBible
        </text>
      </svg>
    </div>
  );
};

export default Logo;
