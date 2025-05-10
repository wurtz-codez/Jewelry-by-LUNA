import React from 'react';

const Logo = ({ className = '', size = 'default' }) => {
  const sizeClasses = {
    small: 'h-6 sm:h-7 md:h-8 w-auto',
    default: 'h-8 sm:h-10 md:h-12 w-auto',
    large: 'h-12 sm:h-14 md:h-16 w-auto',
  };

  return (
    <img
      src="/logo/logo-light.svg"
      alt="Jewelry by LUNA"
      className={`${sizeClasses[size]} ${className}`}
    />
  );
};

export default Logo;