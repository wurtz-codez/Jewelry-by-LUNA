export const itemVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3
    }
  }
}

export const iconVariants = {
  hover: { 
    scale: 1.1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  },
  tap: { scale: 0.95 }
}

export const mobileMenuVariants = {
  hidden: { 
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  },
  visible: { 
    opacity: 1,
    height: "auto",
    transition: {
      duration: 0.3,
      ease: "easeInOut",
      staggerChildren: 0.1
    }
  }
}

export const mobileMenuItemVariants = {
  hidden: { 
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.2
    }
  },
  visible: { 
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.2
    }
  }
} 