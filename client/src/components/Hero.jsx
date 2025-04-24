import heroImage from '../assets/hero-image.png'

const Hero = () => {
  return (
    <section className="hero-section" style={{ 
      backgroundImage: `url(${heroImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <div className="hero-content">
        <h1>SPARKLE BEYOND COMPARE</h1>
        <button className="shop-now-btn">SHOP NOW</button>
      </div>
    </section>
  )
}

export default Hero