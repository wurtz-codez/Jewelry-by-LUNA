import { useEffect } from 'react';

export const useScrollOptimization = () => {
  useEffect(() => {
    // Add passive scroll listeners to improve scroll performance
    const addPassiveListener = (element) => {
      element.addEventListener('scroll', null, { passive: true });
      element.addEventListener('touchstart', null, { passive: true });
      element.addEventListener('touchmove', null, { passive: true });
      element.addEventListener('wheel', null, { passive: true });
    };

    // Apply to main scroll containers
    addPassiveListener(window);
    document.querySelectorAll('.scroll-container').forEach(addPassiveListener);

    // Add contain property to prevent paint storms
    document.querySelectorAll('.product-card').forEach(card => {
      card.style.contain = 'layout style paint';
    });

    // Clean up
    return () => {
      const removePassiveListener = (element) => {
        element.removeEventListener('scroll', null, { passive: true });
        element.removeEventListener('touchstart', null, { passive: true });
        element.removeEventListener('touchmove', null, { passive: true });
        element.removeEventListener('wheel', null, { passive: true });
      };

      removePassiveListener(window);
      document.querySelectorAll('.scroll-container').forEach(removePassiveListener);
    };
  }, []);
};
