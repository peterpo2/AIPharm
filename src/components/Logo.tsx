import React from 'react';

const AIPharmLogo: React.FC<{ className?: string }> = ({ className = "h-8" }) => {
  return (
    <img 
      src="/aipharm-logo.png" 
      alt="AIPHARM+" 
      className={`${className} object-contain`}
      style={{ maxHeight: '60px', height: 'auto' }}
    />
  );
};

export default AIPharmLogo;