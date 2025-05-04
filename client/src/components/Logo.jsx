import React from 'react';

const Logo = ({ className = '', size = 'default' }) => {
  const sizeClasses = {
    small: 'h-8 w-auto',
    default: 'h-12 w-auto',
    large: 'h-16 w-auto',
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