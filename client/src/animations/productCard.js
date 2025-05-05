export const cardAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
  whileHover: { y: -5 }
};

export const imageAnimation = {
  whileHover: { scale: 1.02 },
  transition: { duration: 0.5 }
};

export const titleAnimation = {
  whileHover: { color: "#666" }
};

export const discountBadgeAnimation = {
  initial: { scale: 0.9 },
  animate: { scale: 1 }
};

export const addToCartButtonAnimation = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 }
};

export const wishlistButtonAnimation = {
  whileHover: { scale: 1.1 },
  whileTap: { scale: 0.9 }
};

export const heartIconAnimation = {
  initial: false,
  animate: (isInWishlist) => ({ scale: isInWishlist ? 1.2 : 1 }),
  transition: { type: "spring", stiffness: 300, damping: 15 }
}; 