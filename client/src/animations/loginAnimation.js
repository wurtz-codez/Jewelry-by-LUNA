export const backgroundAnimation = {
  initial: { scale: 1.1, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { duration: 1.2, ease: "easeOut" }
};

export const overlayAnimation = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.8, delay: 0.4 }
};

export const errorAnimation = {
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0 }
};

export const banModalAnimation = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 }
}; 