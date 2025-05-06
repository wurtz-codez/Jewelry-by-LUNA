import necklaceImage from '../assets/necklace-collection-image.png'
import earringsCollectionImage from '../assets/earrings-collection-image.png'
import braceletImage from '../assets/bracelet-collection-image.png'

const Collections = () => {
  return (
    <section className="collections-section my-8 sm:my-12 md:my-16">
      <h2 className="text-4xl sm:text-5xl md:text-7xl font-cinzel text-center mb-8 sm:mb-12 md:mb-16">EXPLORE OUR COLLECTIONS</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-7xl mx-auto px-4">
        <div className="collection-item flex flex-col items-center">
          <div className="collection-image">
            <img src={necklaceImage || "/placeholder.svg"} alt="Necklace collection" className="w-56 sm:w-72 md:w-96 lg:w-[28rem] h-auto rounded-full" />
          </div>
          <h3 className="text-center mt-8 text-2xl font-cinzel">Necklaces</h3>
        </div>
        
        <div className="collection-item flex flex-col items-center">
          <div className="collection-image">
            <img src={earringsCollectionImage || "/placeholder.svg"} alt="Earrings collection" className="w-56 sm:w-72 md:w-96 lg:w-[28rem] h-auto rounded-full" />
          </div>
          <h3 className="text-center mt-8 text-2xl font-cinzel">Earrings</h3>
        </div>
        
        <div className="collection-item flex flex-col items-center">
          <div className="collection-image">
            <img src={braceletImage || "/placeholder.svg"} alt="Bracelet collection" className="w-56 sm:w-72 md:w-96 lg:w-[28rem] h-auto rounded-full" />
          </div>
          <h3 className="text-center mt-8 text-2xl font-cinzel">Bracelets</h3>
        </div>
      </div>
    </section>
  )
}

export default Collections