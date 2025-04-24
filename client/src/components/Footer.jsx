import { FiInstagram, FiFacebook, FiTwitter, FiMail } from 'react-icons/fi'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>JEWELRY BY LUNA</h3>
          <p>Elegant jewelry for every occasion.</p>
          <div className="social-icons">
            <a href="#" aria-label="Instagram"><FiInstagram /></a>
            <a href="#" aria-label="Facebook"><FiFacebook /></a>
            <a href="#" aria-label="Twitter"><FiTwitter /></a>
            <a href="#" aria-label="Email"><FiMail /></a>
          </div>
        </div>
        
        <div className="footer-section">
          <h3>QUICK LINKS</h3>
          <ul>
            <li><a href="#">Home</a></li>
            <li><a href="#">Shop</a></li>
            <li><a href="#">About</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h3>CONTACT US</h3>
          <p>123 Jewelry Lane</p>
          <p>New York, NY 10001</p>
          <p>info@jewelrybyluna.com</p>
          <p>(123) 456-7890</p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Jewelry by Luna. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer