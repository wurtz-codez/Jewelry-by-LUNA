import necklaceImage from '../assets/necklace-image.png'
import earringsCollectionImage from '../assets/earrings-collection-image.png'
import braceletImage from '../assets/bracelet-image.png'

const Collections = () => {
  return (
    <section className="collections-section">
      <h2>EXPLORE OUR COLLECTIONS</h2>
      
      <div className="collections-grid">
        <div className="collection-item">
          <div className="collection-image">
            <img src={necklaceImage || "/placeholder.svg"} alt="Necklace collection" />
          </div>
          <h3>Necklaces</h3>
        </div>
        
        <div className="collection-item">
          <div className="collection-image">
            <img src={earringsCollectionImage || "/placeholder.svg"} alt="Earrings collection" />
          </div>
          <h3>Earrings</h3>
        </div>
        
        <div className="collection-item">
          <div className="collection-image">
            <img src={braceletImage || "/placeholder.svg"} alt="Bracelet collection" />
          </div>
          <h3>Bracelets</h3>
        </div>
      </div>
    </section>
  )
}

export default Collections