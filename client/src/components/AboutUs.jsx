import aboutImage from '../assets/about-image.png'
import earringsImage from '../assets/earrings-image.png'

const AboutUs = () => {
  return (
    <section className="mx-4 sm:mx-8 md:mx-16 lg:mx-32 my-12 md:my-24">
      <div className="flex flex-col md:flex-row gap-8 sm:gap-16 md:gap-24 lg:gap-32 items-center md:items-start">
        {/* Left Section */}
        <div className="w-full md:flex-[60%]">
          <div className="mb-4 md:mb-6 flex items-center gap-2 md:gap-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-cinzel text-primary">ABOUT US</h2>
            <div className="w-16 sm:w-24 md:w-40 lg:w-60 h-0.5 md:h-1 bg-primary"></div>
          </div>
          <div className="mt-8 sm:mt-12 md:mt-16 lg:mt-24 mx-2 sm:mx-6 md:mx-10">
            <p className="text-black text-base sm:text-lg md:text-xl">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
            </p>
            <button className="mt-8 sm:mt-12 md:mt-16 lg:mt-24 px-4 sm:px-6 py-2 bg-accent text-white hover:bg-gray-700 transition-colors">
              SHOP NOW
            </button>
          </div>
        </div>

        {/* Right Section */}
        <div className="w-4/5 sm:w-3/4 md:w-full md:flex-[30%] rounded-[100px] sm:rounded-[160px]  overflow-hidden mt-6 md:mt-0">
          <img 
            src={aboutImage || "/placeholder.svg"} 
            alt="Model wearing blue jewelry" 
            className="w-full h-auto"
          />
        </div>
      </div>

      <div className="mt-10 sm:mt-16 md:mt-16 lg:mt-0 flex flex-col md:flex-row-reverse gap-6 sm:gap-10 md:gap-16 lg:gap-32 items-center">
        <div className="w-full md:flex-[70%] mb-6 md:mb-0">
          <p className="text-xl sm:text-2xl font-cormorant italic mx-4 sm:mx-6 md:mx-10">
            "A piece of jewelry is often a piece of art. But it only becomes valuable when emotions are added to it."
          </p>
          <span className="block mt-2 sm:mt-3 md:mt-4 text-gray-600 mx-6 sm:mx-12 md:mx-20">-Von Furstenberg</span>
        </div>
        <div className="w-4/5 sm:w-3/5 md:w-full md:flex-[30%] mx-auto md:mx-0">
          <img 
            src={earringsImage || "/placeholder.svg"} 
            alt="Elegant earrings" 
            className="w-full h-auto rounded-lg"
          />
        </div>
      </div>
    </section>
  )
}

export default AboutUs