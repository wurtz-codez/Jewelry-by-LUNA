import React from 'react';

const Logo = ({ className = '', size = 'default' }) => {
  const sizeClasses = {
    small: 'h-6 sm:h-7 md:h-8 w-auto',
    default: 'h-10 sm:h-12 md:h-14 w-auto',
    large: 'h-12 sm:h-14 md:h-16 w-auto',
    navbar: 'h-14 sm:h-16 md:h-18 w-auto',
  };

  // Apply object-fit cover to crop the image from top and bottom while maintaining width
  return (
    <div className={`overflow-hidden flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      <img
        src="/logo/logo-light.png"
        alt="Jewelry by LUNA"
        className="object-cover w-auto h-[165%]" // Increased height to 165% to crop more from top and bottom
      />
    </div>
  );
};

export default Logo;