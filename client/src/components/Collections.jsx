import necklaceImage from '../assets/necklace-collection-image.jpg'
import earringsCollectionImage from '../assets/earrings-collection-image.jpg'
import braceletImage from '../assets/bracelet-collection-image.jpg'

const Collections = () => {
  return (
    <section className="collections-section my-6 sm:my-8 md:my-12 lg:my-16">
      <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-cinzel-decorative text-center mb-6 sm:mb-8 md:mb-12 lg:mb-16 px-4">Explore our Collections</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12 md:gap-16 max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="collection-item flex flex-col items-center">
          <div className="collection-image">
            <img 
              src={necklaceImage || "/placeholder.svg"} 
              alt="Necklace collection" 
              className="w-48 sm:w-56 md:w-72 lg:w-96 xl:w-[28rem] h-auto rounded-full transition-transform duration-300 hover:scale-105" 
            />
          </div>
          <h3 className="text-center mt-4 sm:mt-6 md:mt-8 text-xl sm:text-2xl font-cinzel">Necklaces</h3>
        </div>
        
        <div className="collection-item flex flex-col items-center">
          <div className="collection-image">
            <img 
              src={earringsCollectionImage || "/placeholder.svg"} 
              alt="Earrings collection" 
              className="w-48 sm:w-56 md:w-72 lg:w-96 xl:w-[28rem] h-auto rounded-full transition-transform duration-300 hover:scale-105" 
            />
          </div>
          <h3 className="text-center mt-4 sm:mt-6 md:mt-8 text-xl sm:text-2xl font-cinzel">Earrings</h3>
        </div>
        
        <div className="collection-item flex flex-col items-center sm:col-span-2 md:col-span-1">
          <div className="collection-image">
            <img 
              src={braceletImage || "/placeholder.svg"} 
              alt="Bracelet collection" 
              className="w-48 sm:w-56 md:w-72 lg:w-96 xl:w-[28rem] h-auto rounded-full transition-transform duration-300 hover:scale-105" 
            />
          </div>
          <h3 className="text-center mt-4 sm:mt-6 md:mt-8 text-xl sm:text-2xl font-cinzel">Bracelets</h3>
        </div>
      </div>
    </section>
  )
}

export default Collections