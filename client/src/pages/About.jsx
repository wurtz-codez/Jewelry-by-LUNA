import Navbar from '../components/Navbar';
import AboutUs from '../components/AboutUs';
import Footer from '../components/Footer';

const About = () => {
  return (
    <div className="about-page">
      <Navbar />
      <div className="page-container">
        <AboutUs />
      </div>
      <Footer />
    </div>
  );
};

export default About;