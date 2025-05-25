import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const FAQ = () => {
  return (
    <div className="faq-page bg-white">
      <Navbar />
      <div className="page-container">
        {/* FAQ Section */}
        <div className="pt-20 pb-16 sm:pt-24 sm:pb-20 md:pt-28 md:pb-24 mx-4 sm:mx-8 md:mx-16 lg:mx-32">
          <div className="mb-6 sm:mb-8 flex items-center justify-center gap-3 sm:gap-4 md:gap-8 px-2 sm:px-0">
            <div className="w-12 sm:w-24 md:w-40 lg:w-60 h-0.5 md:h-1 bg-primary"></div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-cinzel text-primary text-center whitespace-normal sm:whitespace-nowrap">FAQs</h2>
            <div className="w-12 sm:w-24 md:w-40 lg:w-60 h-0.5 md:h-1 bg-primary"></div>
          </div>

          <div className="max-w-4xl mx-auto bg-white p-4 sm:p-8 md:p-10 rounded-lg shadow-md space-y-4 sm:space-y-6 font-cormorant">
            <p className="text-xl sm:text-2xl md:text-3xl text-center text-primary/80 italic font-medium mb-8">
              Frequently Asked Sparkly Questions<br/>
              <span className="text-lg sm:text-xl md:text-2xl">(A.K.A. Sparkle Support Central)</span>
            </p>

            <div className="space-y-8">
              {/* Question 1 */}
              <div>
                <h3 className="text-2xl font-cinzel text-primary mb-4">1. Is your jewelry real gold/silver?</h3>
                <p className="text-lg">Our pieces are made with <span className="font-bold">high-quality materials, including Anti-tarnish and hypoallergenic metals</span> but not gold/silver. Each piece has its own vibe — check the product description for details!</p>
              </div>

              {/* Question 2 */}
              <div>
                <h3 className="text-2xl font-cinzel text-primary mb-4">2. Can I wear my jewelry every day?</h3>
                <p className="text-lg">You totally <span className="font-bold">can</span> — but treat it like your favorite lipstick. Keep it dry, avoid perfume sprays, and give it a soft cloth wipe after use.</p>
              </div>

              {/* Question 3 */}
              <div>
                <h3 className="text-2xl font-cinzel text-primary mb-4">3. How long will it take to get my order?</h3>
                <p className="text-lg">Our jewels ship out in <span className="font-bold">2-3 working days</span>. Delivery usually takes <span className="font-bold">5–7 days</span>, depending on your pincode and the mood of the weather gods.</p>
              </div>

              {/* Question 4 */}
              <div>
                <h3 className="text-2xl font-cinzel text-primary mb-4">4. Do you offer Cash on Delivery (COD)?</h3>
                <p className="text-lg">Not yet, darling! We're still building our little dream — and COD is like handing over your heart on the first date (too risky!). But trust us, we're here to serve you with all the love, sparkle, and drama you deserve. <span className="font-bold">Swipe that card, and let the magic begin!</span></p>
              </div>

              {/* Question 5 */}
              <div>
                <h3 className="text-2xl font-cinzel text-primary mb-4">5. Can I return/exchange my order?</h3>
                <p className="text-lg">Check out our <a href="/refund-and-return-policies" className="text-primary hover:text-primary/80 underline font-bold">Returns & Refunds</a> section — it's full of playful instructions and heartfelt fairness. Spoiler: We got you!</p>
              </div>

              {/* Question 6 */}
              <div>
                <h3 className="text-2xl font-cinzel text-primary mb-4">6. Do you ship internationally?</h3>
                <p className="text-lg">Currently, we're shipping <span className="font-bold">only within India</span>. But international sparkle lovers — stay tuned, we're coming for you soon!</p>
              </div>

              {/* Question 7 */}
              <div>
                <h3 className="text-2xl font-cinzel text-primary mb-4">7. Help! I made a mistake in my order.</h3>
                <p className="text-lg">Don't panic! Email us ASAP at <span className="font-bold">jewelrybyluna.official@gmail.com</span> and we'll try to fix it before the packing fairies ship it out.</p>
              </div>

              {/* Question 8 */}
              <div>
                <h3 className="text-2xl font-cinzel text-primary mb-4">8. Do you take custom orders?</h3>
                <p className="text-lg">Not right now — but we're dreaming up something exciting. Keep following us on Instagram for updates!</p>
              </div>

              {/* More Questions Section */}
              <div className="text-center space-y-4 mt-12 pt-8 border-t border-gray-200">
                <h3 className="text-2xl font-cinzel text-primary">More questions?</h3>
                <p className="text-lg">
                  Email us at <span className="font-bold">jewelrybyluna.official@gmail.com</span><br/>
                  or DM us on Insta <a href="https://www.instagram.com/jewellery.by.luna" className="text-primary hover:text-primary/80 underline">@jewellery.by.luna</a>
                </p>
                <p className="text-lg italic text-primary">We're always here to make your sparkle experience smooth & magical! ✨</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FAQ;
