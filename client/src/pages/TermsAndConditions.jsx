import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const TermsAndConditions = () => {
  return (
    <div className="terms-page bg-white">
      <Navbar />
      <div className="page-container">
        {/* Terms and Conditions Section */}
        <div className="pt-20 pb-16 sm:pt-24 sm:pb-20 md:pt-28 md:pb-24 mx-4 sm:mx-8 md:mx-16 lg:mx-32">
          <div className="mb-6 sm:mb-8 flex items-center justify-center gap-3 sm:gap-4 md:gap-8 px-2 sm:px-0">
            <div className="w-12 sm:w-24 md:w-40 lg:w-60 h-0.5 md:h-1 bg-primary"></div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-cinzel text-primary text-center whitespace-normal sm:whitespace-nowrap">Terms & Sparkle-ditions</h2>
            <div className="w-12 sm:w-24 md:w-40 lg:w-60 h-0.5 md:h-1 bg-primary"></div>
          </div>

          <div className="max-w-4xl mx-auto bg-white p-4 sm:p-8 md:p-10 rounded-lg shadow-md space-y-4 sm:space-y-6 font-cormorant">
            <p className="text-gray-500 text-center italic">Last updated: 25 May 2025</p>

            <div className="space-y-6">
              <p className="text-lg">Hey there, fabulous human!</p>

              <p className="text-lg">Welcome to <span className="font-bold text-primary">Jewelry by Luna</span> — where sparkle meets sass! By continuing to scroll, click, or shop on <a href="https://www.jewelrybyluna.in" className="text-primary hover:text-primary/80 underline">www.jewelrybyluna.in</a>, you're agreeing to our ✨Terms & Sparkle-ditions✨ (aka Terms & Conditions). Don't worry, we won't bore you (too much)!</p>

              <p className="text-lg">So grab your chai (or coffee), and let's dive in!</p>

              <div className="space-y-8">
                {/* Section 1 */}
                <div>
                  <h3 className="text-2xl font-cinzel text-primary mb-4">1. Who's Who?</h3>
                  <ul className="list-disc pl-6 space-y-2 text-lg">
                    <li><span className="font-bold">"You", "Your", "Lovely You"</span> = Our fabulous visitor/customer who stumbled upon the magic of Luna.</li>
                    <li><span className="font-bold">"We", "Us", "Our", "Team Luna"</span> = The sparkle creators behind Jewelry by Luna.</li>
                    <li><span className="font-bold">"Website"</span> = Our digital sparkle palace: <a href="http://www.jewelrybyluna.in" className="text-primary hover:text-primary/80 underline">www.jewelrybyluna.in</a></li>
                  </ul>
                  <p className="text-lg mt-4">By using our site, you promise you won't do anything fishy. Pinky promise?</p>
                </div>

                {/* Section 2 */}
                <div>
                  <h3 className="text-2xl font-cinzel text-primary mb-4">2. Cookies (Not the chocolate chip kind)</h3>
                  <p className="text-lg">Yes, we use cookies. Not the edible kind, but the techy ones that help us give you a smoother shopping experience. By staying here, you're cool with that.</p>
                </div>

                {/* Section 3 */}
                <div>
                  <h3 className="text-2xl font-cinzel text-primary mb-4">3. Shiny Rights (aka Intellectual Property)</h3>
                  <p className="text-lg">All the pretty pictures, designs, words, and sparkly vibes? Yep, they're ours (unless stated otherwise). So please:</p>
                  <ul className="list-disc pl-6 space-y-2 text-lg mt-4">
                    <li>No copy-pasting.</li>
                    <li>No re-selling our stuff as your own.</li>
                    <li>No borrowing our content for your project unless we say, "Sure!"</li>
                  </ul>
                  <p className="text-lg mt-4 font-bold">Share the love, not the code!</p>
                </div>

                {/* Section 4 */}
                <div>
                  <h3 className="text-2xl font-cinzel text-primary mb-4">4. Talk to Us (Comments & Reviews)</h3>
                  <p className="text-lg">Love our stuff? Tell us!<br/>Hate it? (Ouch.) Tell us politely.</p>
                  <p className="text-lg mt-4">By leaving a review or comment, you promise:</p>
                  <ul className="list-disc pl-6 space-y-2 text-lg mt-4">
                    <li><span className="font-bold">You actually have the rights to post it.</span></li>
                    <li><span className="font-bold">You won't say mean, spammy, or shady things.</span></li>
                    <li><span className="font-bold">You let us feature your feedback</span> on our site or socials (with sparkly credit, of course).</li>
                  </ul>
                </div>

                {/* Section 5 */}
                <div>
                  <h3 className="text-2xl font-cinzel text-primary mb-4">5. Let's Link-Up (Hyperlinks)</h3>
                  <p className="text-lg">If you want to link to our site (aww, thanks!), make sure:</p>
                  <ul className="list-disc pl-6 space-y-2 text-lg mt-4">
                    <li>It's not misleading.</li>
                    <li>It's not pretending we endorse your stuff unless we actually do.</li>
                    <li>It fits nicely with your website's vibe.</li>
                  </ul>
                  <p className="text-lg mt-4">If in doubt, drop us a mail. We're nice!</p>
                </div>

                {/* Section 6-7 */}
                <div>
                  <h3 className="text-2xl font-cinzel text-primary mb-4">6. No Frame Games (iFrames)</h3>
                  <p className="text-lg">Sorry, but you can't wrap our website inside another one (a.k.a. no iFrames). We like our sparkle to shine solo.</p>
                </div>

                <div>
                  <h3 className="text-2xl font-cinzel text-primary mb-4">7. What's on Your Site Is Yours</h3>
                  <p className="text-lg">If you link us or talk about us on your site, make sure it's all legal, respectful, and sparkle-positive. We're not liable for your content (even though we wish we could sparkle everything).</p>
                </div>

                {/* Section 8-9 */}
                <div>
                  <h3 className="text-2xl font-cinzel text-primary mb-4">8. Privacy Matters</h3>
                  <p className="text-lg">We care about your privacy like we care about tarnish-free jewels. For all the serious stuff, check out our <a href="/privacy-policy" className="text-primary hover:text-primary/80 underline">Privacy Policy</a>.</p>
                </div>

                <div>
                  <h3 className="text-2xl font-cinzel text-primary mb-4">9. We Keep It Flexible</h3>
                  <p className="text-lg">We may update these terms sometimes — because life (and sparkle) evolves. If you keep using our site, that means you're okay with any changes.</p>
                </div>

                {/* Section 10-11 */}
                <div>
                  <h3 className="text-2xl font-cinzel text-primary mb-4">10. See Something Weird?</h3>
                  <p className="text-lg">If you spot a weird link or something that feels off, ping us. We'll take a look — and if needed, wave our magical "remove" wand.</p>
                </div>

                <div>
                  <h3 className="text-2xl font-cinzel text-primary mb-4">11. A Little Disclaimer</h3>
                  <p className="text-lg">We're here to bring joy, not stress. While we do our best to keep everything updated and sparkling, we're only human. So:</p>
                  <ul className="list-disc pl-6 space-y-2 text-lg mt-4">
                    <li>We don't guarantee everything will be 100% accurate 100% of the time.</li>
                    <li>We're not liable for magical mishaps like website downtime, typos, or techy glitches.</li>
                    <li><span className="font-bold">Basically, use the site with good vibes and common sense.</span></li>
                  </ul>
                </div>

                {/* Contact Section */}
                <div>
                  <h3 className="text-2xl font-cinzel text-primary mb-4">Contact Team Luna</h3>
                  <p className="text-lg">Need help? Want to talk sparkle? Reach us at:</p>
                  <ul className="list-none space-y-2 text-lg mt-4">
                    <li><span className="font-bold">Email:</span> jewelrybyluna.official@gmail.com</li>
                    <li><span className="font-bold">Phone:</span> +91 9039348168</li>
                    <li><span className="font-bold">Address:</span> 19B, Pushp Nagar Colony, Khajrana Road<br/>Indore, M.P. (452016)</li>
                  </ul>
                </div>

                {/* Closing */}
                <div className="text-lg italic text-center space-y-2">
                  <p>Stay sparkly, shop happy, and remember — you're the main character.</p>
                  <p>With love & glitter,<br/>Team Jewellery by Luna ✨</p>
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

export default TermsAndConditions;
