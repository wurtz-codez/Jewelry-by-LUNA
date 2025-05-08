import heroImage from '../assets/hero-image.png'
import ShopNowButton from '../assets/buttons/ShopNowButton'
import { motion } from 'framer-motion'
import { heroAnimation, heroTextAnimation, heroButtonAnimation } from '../animations/heroAnimation'

const Hero = () => {
  return (
    <motion.section 
      className="min-h-[80vh] sm:min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat relative mt-16"
      style={{ backgroundImage: `url(${heroImage})` }}
      initial="initial"
      animate="animate"
      variants={heroAnimation}
    >
      <div className="absolute inset-0 bg-gray-100/10"></div>
      <motion.div 
        className="hero-content relative z-10 flex flex-col items-center gap-2 sm:gap-4 md:gap-8 px-4 sm:px-6 md:px-8"
        variants={heroAnimation}
      >
        <motion.h1 
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-cinzel text-neutral w-[95vw] sm:w-[80vw] md:w-[70vw] lg:w-[60vw] text-center leading-[1.4] sm:leading-[1.6] md:leading-[1.8] lg:leading-[2] mb-4 sm:mb-6 md:mb-12 flex flex-col gap-1 sm:gap-2 md:gap-4 lg:gap-6"
          variants={heroTextAnimation}
        >
          <span className="tracking-[0.15em] sm:tracking-[0.25em]">SPARKLE</span>
          <span className="tracking-[0.20em] sm:tracking-[0.30em]">BEYOND</span>
          <span className="tracking-[0.10em] sm:tracking-[0.15em]">COMPARE</span>
        </motion.h1>
        <motion.div variants={heroButtonAnimation} className="scale-90 sm:scale-100">
          <ShopNowButton />
        </motion.div>
      </motion.div>
    </motion.section>
  )
}

export default Hero