import { motion } from 'framer-motion';

// Page container animation
export const pageAnimation = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1
    }
  }
};

// Cart item animation
export const cartItemAnimation = {
  initial: { 
    opacity: 0,
    y: 10
  },
  animate: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

// Order summary animation
export const orderSummaryAnimation = {
  initial: { 
    opacity: 0,
    x: 20
  },
  animate: { 
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

// Button hover animations
export const buttonHoverAnimation = {
  scale: 1.01,
  transition: {
    duration: 0.1,
    ease: "easeOut"
  }
};

export const buttonTapAnimation = {
  scale: 0.98,
  transition: {
    duration: 0.1
  }
};

// Quantity control animations
export const quantityControlAnimation = {
  hover: {
    scale: 1.1,
    transition: {
      duration: 0.2
    }
  },
  tap: {
    scale: 0.9,
    transition: {
      duration: 0.1
    }
  }
};

// Empty cart animation
export const emptyCartAnimation = {
  initial: { 
    opacity: 0,
    scale: 0.9
  },
  animate: { 
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

// Price update animation
export const priceUpdateAnimation = {
  initial: { 
    scale: 1,
    color: "#000000"
  },
  animate: { 
    scale: [1, 1.1, 1],
    color: ["#000000", "#22c55e", "#000000"],
    transition: {
      duration: 0.5,
      ease: "easeInOut"
    }
  }
};

// Category tag animation
export const categoryTagAnimation = {
  initial: { 
    opacity: 0,
    scale: 0.8
  },
  animate: { 
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2
    }
  }
};

// Remove item button animation
export const removeButtonAnimation = {
  initial: { 
    opacity: 0,
    rotate: -90
  },
  animate: { 
    opacity: 1,
    rotate: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  hover: {
    scale: 1.1,
    transition: {
      duration: 0.2
    }
  }
}; 