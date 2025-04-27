import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Contact = () => {
  return (
    <div className="contact-page min-h-screen flex flex-col">
      <Navbar />
      <div className="page-container py-10 px-4 max-w-4xl mx-auto flex-grow">
        <h1 className="text-3xl font-semibold mb-6 text-center">Contact Us</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <form className="space-y-4">
            <div>
              <label htmlFor="name" className="block mb-2 font-medium">Name</label>
              <input 
                type="text" 
                id="name" 
                className="w-full p-2 border rounded-md" 
                placeholder="Your Name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block mb-2 font-medium">Email</label>
              <input 
                type="email" 
                id="email" 
                className="w-full p-2 border rounded-md" 
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label htmlFor="subject" className="block mb-2 font-medium">Subject</label>
              <input 
                type="text" 
                id="subject" 
                className="w-full p-2 border rounded-md" 
                placeholder="How can we help you?"
              />
            </div>
            <div>
              <label htmlFor="message" className="block mb-2 font-medium">Message</label>
              <textarea 
                id="message" 
                rows="5" 
                className="w-full p-2 border rounded-md"
                placeholder="Your message here..."
              ></textarea>
            </div>
            <button 
              type="submit" 
              className="w-full py-2 px-4 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition"
            >
              Send Message
            </button>
          </form>
        </div>
        
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Visit Our Store</h2>
          <div className="mb-4">
            <p className="mb-1"><strong>Address:</strong> 123 Jewelry Lane, New York, NY 10001</p>
            <p className="mb-1"><strong>Phone:</strong> (123) 456-7890</p>
            <p><strong>Email:</strong> info@jewelrybyluna.com</p>
          </div>
          <div className="mb-4">
            <h3 className="font-medium mb-2">Hours</h3>
            <p>Monday - Friday: 9am - 7pm</p>
            <p>Saturday: 10am - 6pm</p>
            <p>Sunday: Closed</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;