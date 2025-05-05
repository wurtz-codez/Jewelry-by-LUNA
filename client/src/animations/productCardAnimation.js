// Animation variants for the product cards
export const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.97,
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      duration: 0.5,
      ease: "easeOut"
    }
  },
  hover: {
    y: -5,
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
    transition: { 
      duration: 0.3, 
      ease: "easeInOut"
    }
  }
};

// Animation for image hover effect
export const imageVariants = {
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.4,
      ease: "easeInOut"
    }
  }
};

// Animation for the add to cart button
export const buttonVariants = {
  initial: {
    scale: 1
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  },
  tap: {
    scale: 0.95
  }
};

// Animation for the wishlist heart icon
export const heartVariants = {
  initial: {
    scale: 1
  },
  hover: { 
    scale: 1.2,
    rotate: [0, 15, -15, 0],
    transition: {
      duration: 0.6,
      ease: "easeInOut"
    }
  },
  tap: {
    scale: 0.8
  },
  favorited: {
    scale: [1, 1.5, 1],
    transition: {
      duration: 0.4
    }
  }
};

// Animation for price display
export const priceVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { 
      delay: 0.2,
      duration: 0.3 
    } 
  }
};

// Staggered animations for card content
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};