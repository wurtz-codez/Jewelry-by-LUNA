import aboutImage from '../assets/about-image.png'
import earringsImage from '../assets/earrings-image.png'

const AboutUs = () => {
  return (
    <section className="about-section">
      <div className="about-header">
        <h2>ABOUT US</h2>
        <div className="divider"></div>
      </div>
      
      <div className="about-content">
        <div className="about-text">
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
          </p>
          <button className="shop-now-btn secondary">SHOP NOW</button>
        </div>
        <div className="about-image">
          <img src={aboutImage || "/placeholder.svg"} alt="Model wearing blue jewelry" />
        </div>
      </div>

      <div className="quote-section">
        <div className="quote-image">
          <img src={earringsImage || "/placeholder.svg"} alt="Elegant earrings" />
        </div>
        <div className="quote-text">
          <p>"A piece of jewelry is often a piece of art. But it only becomes valuable when emotions are added to it."</p>
          <span>-Von Furstenberg</span>
        </div>
      </div>
    </section>
  )
}

export default AboutUs