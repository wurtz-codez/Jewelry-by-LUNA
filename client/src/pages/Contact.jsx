import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FiMail, FiPhone, FiMapPin, FiClock, FiSend, FiInstagram, FiFacebook, FiTwitter, FiYoutube } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Contact = () => {
  return (
    <div className="contact-page min-h-screen flex flex-col bg-white">
      <Navbar variant="white" />
      
      {/* Hero Section */}
      <div className="text-center mt-16 sm:mt-20 md:mt-24 lg:mt-32 mb-6 sm:mb-8 md:mb-12 lg:mb-16 px-4 sm:px-6 md:px-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-cinzel-decorative text-secondary">Get in Touch</h1>
        <p className="mt-3 sm:mt-4 md:mt-6 text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          We'd love to hear from you. Whether you have a question about our jewelry, 
          need assistance with an order, or want to collaborate, we're here to help.
        </p>
      </div>

      <div className="page-container py-6 sm:py-8 md:py-10 lg:py-12 px-4 sm:px-6 md:px-8 lg:px-12 max-w-7xl mx-auto flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
          {/* Contact Form */}
          <motion.div 
            className="bg-white p-4 sm:p-6 md:p-8 rounded-[12px] sm:rounded-[12px] shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl font-cinzel-decorative text-secondary mb-4 sm:mb-6">Send us a Message</h2>
            <form className="space-y-4 sm:space-y-6">
              <div>
                <label htmlFor="name" className="block mb-2 font-medium text-gray-700 text-sm sm:text-base">Name</label>
                <input 
                  type="text" 
                  id="name" 
                  className="w-full p-3 sm:p-4 bg-white border border-neutral-200 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 text-sm sm:text-base" 
                  placeholder="Your Name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block mb-2 font-medium text-gray-700 text-sm sm:text-base">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  className="w-full p-3 sm:p-4 bg-white border border-neutral-200 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 text-sm sm:text-base" 
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label htmlFor="subject" className="block mb-2 font-medium text-gray-700 text-sm sm:text-base">Subject</label>
                <input 
                  type="text" 
                  id="subject" 
                  className="w-full p-3 sm:p-4 bg-white border border-neutral-200 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 text-sm sm:text-base" 
                  placeholder="How can we help you?"
                />
              </div>
              <div>
                <label htmlFor="message" className="block mb-2 font-medium text-gray-700 text-sm sm:text-base">Message</label>
                <textarea 
                  id="message" 
                  rows="4" 
                  className="w-full p-3 sm:p-4 bg-white border border-neutral-200 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 text-sm sm:text-base resize-none"
                  placeholder="Your message here..."
                ></textarea>
              </div>
              <motion.button 
                type="submit" 
                className="w-full py-3 sm:py-4 px-6 sm:px-8 bg-primary text-white rounded-[8px] hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 text-base sm:text-lg font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiSend size={18} className="sm:w-5 sm:h-5" />
                Send Message
              </motion.button>
            </form>
          </motion.div>

          {/* Contact Information */}
          <div className="space-y-6 sm:space-y-8">
            {/* Store Information */}
            <motion.div 
              className="bg-white p-4 sm:p-6 md:p-8 rounded-[12px] sm:rounded-[12px] shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="text-xl sm:text-2xl md:text-3xl font-cinzel-decorative text-secondary mb-4 sm:mb-6">Visit Our Store</h2>
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <FiMapPin className="w-5 h-5 sm:w-6 sm:h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-800 text-sm sm:text-base">Address</h3>
                    <p className="text-gray-600 text-sm sm:text-base">19B, Pushp Nagar Colony, Khajrana Road</p>
                    <p className="text-gray-600 text-sm sm:text-base">Indore, M.P. (452016)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 sm:gap-4">
                  <FiPhone className="w-5 h-5 sm:w-6 sm:h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-800 text-sm sm:text-base">Phone</h3>
                    <p className="text-gray-600 text-sm sm:text-base">+91 9039348168</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 sm:gap-4">
                  <FiMail className="w-5 h-5 sm:w-6 sm:h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-800 text-sm sm:text-base">Email</h3>
                    <p className="text-gray-600 text-sm sm:text-base">jewelrybyluna.official@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 sm:gap-4">
                  <FiClock className="w-5 h-5 sm:w-6 sm:h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-800 text-sm sm:text-base">Hours</h3>
                    <div className="text-gray-600 text-sm sm:text-base space-y-1">
                      <p>Monday - Friday: 9am - 7pm</p>
                      <p>Saturday: 10am - 6pm</p>
                      <p>Sunday: Closed</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Social Media */}
            <motion.div 
              className="bg-white p-4 sm:p-6 md:p-8 rounded-[12px] sm:rounded-[12px] shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-xl sm:text-2xl md:text-3xl font-cinzel-decorative text-secondary mb-4 sm:mb-6">Follow Us</h2>
              <div className="flex gap-3 sm:gap-4">
                <motion.a 
                  href="https://www.instagram.com/jewellery.by.luna" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-[6px] bg-neutral flex items-center justify-center text-gray-700 hover:bg-primary hover:text-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FiInstagram size={20} className="sm:w-6 sm:h-6" />
                </motion.a>
                <motion.a 
                  href="https://www.youtube.com/@JewelleryByLUNA"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-[6px] bg-neutral flex items-center justify-center text-gray-700 hover:bg-primary hover:text-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FiYoutube size={20} className="sm:w-6 sm:h-6" />
                </motion.a>
                
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;