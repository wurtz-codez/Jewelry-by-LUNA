import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-page bg-white">
      <Navbar />
      <div className="page-container">
        {/* Privacy Policy Section */}
        <div className="pt-20 pb-16 sm:pt-24 sm:pb-20 md:pt-28 md:pb-24 mx-4 sm:mx-8 md:mx-16 lg:mx-32">
          <div className="mb-6 sm:mb-8 flex items-center justify-center gap-3 sm:gap-4 md:gap-8 px-2 sm:px-0">
            <div className="w-12 sm:w-24 md:w-40 lg:w-60 h-0.5 md:h-1 bg-primary"></div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-cinzel text-primary text-center whitespace-normal sm:whitespace-nowrap">Privacy Policy</h2>
            <div className="w-12 sm:w-24 md:w-40 lg:w-60 h-0.5 md:h-1 bg-primary"></div>
          </div>

          <div className="max-w-4xl mx-auto bg-white p-4 sm:p-8 md:p-10 rounded-lg shadow-md space-y-4 sm:space-y-6 font-cormorant">
            <p className="text-xl sm:text-2xl md:text-3xl text-center text-primary/80 italic font-medium mb-8">
              ( Because Your Secrets Are Safe With Us )
            </p>

            <div className="space-y-6">
              <p className="text-lg">Hey you! Yes, you, beautiful soul browsing our sparkly creations — we respect your privacy like we respect the shine on our jewels: <span className="font-bold text-primary">completely, carefully, and with full heart</span>.</p>

              <p className="text-lg">This Privacy Policy spills the (non-messy) chai on how we collect, use, and protect your info when you visit <a href="https://www.jewelrybyluna.in" className="text-primary hover:text-primary/80 underline">www.jewelrybyluna.in</a>.</p>

              <div className="space-y-8">
                {/* Section 1 */}
                <div>
                  <h3 className="text-2xl font-cinzel text-primary mb-4">1. What We Collect (and Why)</h3>
                  <p className="text-lg mb-4">We collect the good stuff like:</p>
                  <ul className="list-disc pl-6 space-y-2 text-lg">
                    <li><span className="font-bold">Name</span> – to call you by your actual name (not "Hey you!")</li>
                    <li><span className="font-bold">Email & Phone Number</span> – so we can say hello (and send order updates)</li>
                    <li><span className="font-bold">Address</span> – so your jewels can find their way home</li>
                    <li><span className="font-bold">Payment Info</span> – safely handled through secure payment gateways</li>
                  </ul>
                  <p className="text-lg mt-4 font-bold text-primary">We 'don't sell' your info. Ever. Pinky promise.</p>
                </div>

                {/* Section 2 */}
                <div>
                  <h3 className="text-2xl font-cinzel text-primary mb-4">2. How We Use Your Info</h3>
                  <ul className="list-disc pl-6 space-y-2 text-lg">
                    <li>To process your orders and send you sparkly confirmations</li>
                    <li>To keep you updated about new launches, offers & sales (only if you say yes!)</li>
                    <li>To make sure your experience on our site feels like a walk in a rose garden</li>
                  </ul>
                </div>

                {/* Section 3 */}
                <div>
                  <h3 className="text-2xl font-cinzel text-primary mb-4">3. Cookies (Again, Not the Edible Kind)</h3>
                  <p className="text-lg">Cookies help our website remember your cart, your preferences, and make things smoother for you. <span className="font-bold">You can disable them, but things might look a little wonky</span></p>
                </div>

                {/* Section 4 */}
                <div>
                  <h3 className="text-2xl font-cinzel text-primary mb-4">4. Your Info = Your Rights</h3>
                  <p className="text-lg mb-4">You can:</p>
                  <ul className="list-disc pl-6 space-y-2 text-lg">
                    <li><span className="font-bold">Ask us what info we have on you</span></li>
                    <li><span className="font-bold">Ask us to delete it</span> (but we'll miss you!)</li>
                    <li><span className="font-bold">Say "no thanks" to promotional emails</span></li>
                  </ul>
                  <p className="text-lg mt-4">Just email us at <span className="font-bold">jewelrybyluna.official@gmail.com</span> and we'll make it happen.</p>
                </div>

                {/* Section 5 */}
                <div>
                  <h3 className="text-2xl font-cinzel text-primary mb-4">5. We Keep It Safe & Sound</h3>
                  <p className="text-lg"><span className="font-bold">We use secure tech and good vibes to keep your data safe.</span> No peeping toms allowed.</p>
                </div>

                {/* Section 6 */}
                <div>
                  <h3 className="text-2xl font-cinzel text-primary mb-4">6. Changes to This Policy</h3>
                  <p className="text-lg">We may tweak this policy sometimes (like updating our playlist). But don't worry — if it's major, we'll let you know.</p>
                </div>

                {/* Questions Section */}
                <div className="text-center space-y-4 mt-8">
                  <h3 className="text-2xl font-cinzel text-primary">Still have questions?</h3>
                  <p className="text-lg">Reach out to us anytime at <span className="font-bold">jewelrybyluna.official@gmail.com</span></p>
                  <p className="text-lg italic text-primary">Because your trust is the real jewel here. ✨</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
