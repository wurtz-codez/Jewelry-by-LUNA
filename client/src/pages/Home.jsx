import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import AboutUs from '../components/AboutUs';
import Collections from '../components/Collections';
import Footer from '../components/Footer';
import NewArrivals from '../components/NewArrivals';

const Home = () => {
  return (
    <div>
      <Navbar />
      <Hero />
      <NewArrivals />
      <AboutUs />
      <Collections />
      <Footer />
    </div>
  );
};

export default Home; 