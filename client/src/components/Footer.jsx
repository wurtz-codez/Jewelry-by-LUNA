import { FiInstagram, FiFacebook, FiTwitter, FiMail, FiYoutube } from 'react-icons/fi'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-neutral py-8 sm:py-10 md:py-12 lg:py-16 xl:py-20 border-t border-secondary-washed">
      <div className="mx-4 sm:mx-6 md:mx-8 lg:mx-16 xl:mx-24 2xl:mx-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10 lg:gap-12 xl:gap-16">
          {/* Brand Section */}
          <div className="space-y-3 sm:space-y-4 md:space-y-5">
            <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-cinzel text-primary">JEWELRY BY LUNA</h3>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 font-cormorant italic">
              Elegant jewelry for every occasion.
            </p>
            <div className="flex space-x-3 sm:space-x-4">
              <a href="https://www.instagram.com/jewellery.by.luna" className="text-gray-600 hover:text-primary transition-colors" aria-label="Instagram">
                <FiInstagram className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
              </a>
              <a href="https://www.youtube.com/@JewelleryByLUNA" className="text-gray-600 hover:text-primary transition-colors" aria-label="Email">
                <FiYoutube className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
              </a>
              {/* <a href="#" className="text-gray-600 hover:text-primary transition-colors" aria-label="Facebook">
                <FiFacebook className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
              </a> */}
              {/* <a href="#" className="text-gray-600 hover:text-primary transition-colors" aria-label="Twitter">
                <FiTwitter className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
              </a> */}
              {/* <a href="#" className="text-gray-600 hover:text-primary transition-colors" aria-label="Email">
                <FiMail className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
              </a> */}
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="space-y-3 sm:space-y-4 md:space-y-5">
            <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-cinzel text-primary">QUICK LINKS</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link to="/" className="text-sm sm:text-base md:text-lg text-gray-600 hover:text-primary transition-colors font-cormorant">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-sm sm:text-base md:text-lg text-gray-600 hover:text-primary transition-colors font-cormorant">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm sm:text-base md:text-lg text-gray-600 hover:text-primary transition-colors font-cormorant">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm sm:text-base md:text-lg text-gray-600 hover:text-primary transition-colors font-cormorant">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/refund-and-return-policies" className="text-sm sm:text-base md:text-lg text-gray-600 hover:text-primary transition-colors font-cormorant">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link to="/terms-and-conditions" className="text-sm sm:text-base md:text-lg text-gray-600 hover:text-primary transition-colors font-cormorant">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-sm sm:text-base md:text-lg text-gray-600 hover:text-primary transition-colors font-cormorant">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm sm:text-base md:text-lg text-gray-600 hover:text-primary transition-colors font-cormorant">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div className="space-y-3 sm:space-y-4 md:space-y-5">
            <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-cinzel text-primary">CONTACT US</h3>
            <div className="space-y-2 sm:space-y-3">
              <p className="text-sm sm:text-base md:text-lg text-gray-600 font-cormorant">19B, Pushp Nagar Colony, Khajrana Road</p>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 font-cormorant">Indore, M.P. (452016)</p>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 font-cormorant">jewelrybyluna.official@gmail.com</p>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 font-cormorant">+91 9039348168</p>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="mt-8 sm:mt-10 md:mt-12 lg:mt-16 pt-6 sm:pt-8 border-t border-gray-200">
          <p className="text-center text-xs sm:text-sm md:text-base text-gray-600 font-cormorant">
            &copy; {new Date().getFullYear()} Jewelry by Luna. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer