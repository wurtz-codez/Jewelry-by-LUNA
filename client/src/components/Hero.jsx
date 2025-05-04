import heroImage from '../assets/hero-image.png'
import ShopNowButton from '../assets/buttons/ShopNowButton'
import { motion } from 'framer-motion'
import { heroAnimation, heroTextAnimation, heroButtonAnimation } from '../animations/heroAnimation'

const Hero = () => {
  return (
    <motion.section 
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat relative mt-16"
      style={{ backgroundImage: `url(${heroImage})` }}
      initial="initial"
      animate="animate"
      variants={heroAnimation}
    >
      <div className="absolute inset-0 bg-gray-100/10"></div>
      <motion.div 
        className="hero-content relative z-10 flex flex-col items-center gap-4 md:gap-8 px-4"
        variants={heroAnimation}
      >
        <motion.h1 
          className="text-5xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-cinzel text-neutral w-[90vw] sm:w-[80vw] md:w-[70vw] lg:w-[60vw] text-center leading-[1.6] md:leading-[1.8] lg:leading-[2] mb-6 md:mb-12 flex flex-col gap-2 md:gap-4 lg:gap-6"
          variants={heroTextAnimation}
        >
          <span className="tracking-[0.25em]">SPARKLE</span>
          <span className="tracking-[0.30em] ">BEYOND</span>
          <span className="tracking-[0.15em] ">COMPARE</span>
        </motion.h1>
        <motion.div variants={heroButtonAnimation}>
          <ShopNowButton />
        </motion.div>
      </motion.div>
    </motion.section>
  )
}

export default Hero