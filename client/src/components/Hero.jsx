import heroImage from '../assets/hero-image.png'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'

const Hero = () => {
  const { currentUser } = useAuth()
  
  return (
    <section className="hero-section" style={{ 
      backgroundImage: `url(${heroImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <div className="hero-content">
        <h1>SPARKLE BEYOND COMPARE</h1>
        {currentUser ? (
          <Link to="/shop">
            <button className="shop-now-btn">SHOP NOW</button>
          </Link>
        ) : (
          <Link to="/login">
            <button className="shop-now-btn">LOGIN</button>
          </Link>
        )}
      </div>
    </section>
  )
}

export default Hero