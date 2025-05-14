import Navbar from '../components/Navbar';
import AboutUs from '../components/AboutUs';
import Footer from '../components/Footer';

const About = () => {
  return (
    <div className="about-page">
      <Navbar />
      <div className="page-container">
        <AboutUs />

        {/* Terms and Conditions Section */}
        <div className="mt-16 sm:mt-24 md:mt-32 mx-4 sm:mx-8 md:mx-16 lg:mx-32">
          <div className="mb-8 flex items-center justify-center gap-4 md:gap-8">
            <div className="w-16 sm:w-24 md:w-40 lg:w-60 h-0.5 md:h-1 bg-primary"></div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-cinzel text-primary text-center whitespace-nowrap">Returns & Giggles – Luna Style!</h2>
            <div className="w-16 sm:w-24 md:w-40 lg:w-60 h-0.5 md:h-1 bg-primary"></div>
          </div>
          
          <div className="prose prose-lg max-w-none space-y-8 font-cormorant">
            <p className="text-lg sm:text-xl">
              At Jewellery by Luna, we hope every sparkle finds its happy place. But hey, if your bling isn't vibing with your energy, we totally get it! Here's how our return and exchange dance works:
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-cinzel text-primary mb-2">1. Changed your mind? No biggie!</h3>
                <p>You have <strong className="text-accent">7 magical days</strong> (from the date of delivery) to decide if your Luna piece is <em>the one</em>.</p>
                </div>

              <div>
                <h3 className="text-2xl font-cinzel text-primary mb-2">2. Wanna swap? Let's do it!</h3>
                <p>If your order arrived damaged, defective, or just not your style, you can exchange it for another treasure from our shop. (Yes, you can go wild and pick something else too!)</p>
              </div>

              <div>
                <h3 className="text-2xl font-cinzel text-primary mb-2">3. Return Shipping – We've got your back (literally!)</h3>
                <p>We'll send our magical delivery elves to the original delivery address to pick up your return.</p>
                <p>Just make sure the jewellery is:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Unworn (we know it's tempting!)</li>
                  <li>In its original packaging</li>
                  <li>Along with any free goodies we sent (don't break our heart)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-cinzel text-primary mb-2">4. Refunds – Because fairy tales deserve happy endings</h3>
                <p>Once your return reaches our warehouse kingdom and gets the royal inspection, we'll process your refund in <strong className="text-accent">7 working days</strong>.</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Prepaid orders? Amount goes right back to your original payment mode.</li>
                  <li>COD orders? We'll ask for your bank details and transfer the amount straight to your account.</li>
                </ul>
                <p className="text-sm italic">(Shipping & COD charges are like old exes – non-refundable.)</p>
              </div>

              <div>
                <h3 className="text-2xl font-cinzel text-primary mb-2">5. Important Note – Because no one likes drama</h3>
                <p>Received a damaged, wrong, or incomplete order?</p>
                <p>We're here for you – just tell us within <strong className="text-accent">48 hours</strong> and send us an unboxing video (yes, we love videos!) showing:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Original sealed packaging</li>
                  <li>Tags & labels intact</li>
                  <li>The issue clearly visible</li>
                </ul>
                <p className="text-sm italic">No video = No magic. So please help us help you better.</p>
              </div>

              <div>
                <h3 className="text-2xl font-cinzel text-primary mb-2">6. A Few Little But Mighty Rules</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Returns & exchanges are at order-level only (not item-by-item)</li>
                  <li>Missing items during pickup = refund deduction (so triple-check before sending back)</li>
                  <li>If we can't reach you or pick up fails, you'll need to reinitiate the process</li>
                  <li>Some pin codes may not support reverse pickup – in that case, you can use India Post and we'll reimburse up to ₹70</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl">
                <h4 className="text-xl font-cinzel text-primary mb-2">Special Cases (aka No Returns Zone):</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Gift boxes/combos – single items can't be swapped</li>
                  <li>Clearance, contests, or promo buys – final sale, folks!</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl mt-8">
                <h4 className="text-xl font-cinzel text-primary mb-2">Still confused or stuck in return-land?</h4>
                <p>We're just a message away!</p>
                <p>Email us at: <a href="mailto:jewelrybyluna.officials" className="text-accent hover:text-primary transition-colors">jewelrybyluna.officials</a></p>
                <p>WhatsApp: <a href="tel:9039348168" className="text-accent hover:text-primary transition-colors">90393 48168</a></p>
              </div>

              <p className="text-xl text-center font-cormorant italic text-primary">Let's make your Luna experience full of sparkle – from cart to heart!</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default About;