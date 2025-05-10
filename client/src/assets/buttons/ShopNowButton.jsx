import { Link } from 'react-router-dom'

const ShopNowButton = () => {
  return (
    <Link to="/shop">
      <button className="px-8 py-3 bg-primary text-neutral hover:bg-white hover:border hover:border-primary hover:text-primary transition-all duration-500 font-cinzel text-lg tracking-wider rounded-full">
        SHOP NOW
      </button>
    </Link>
  )
}

export default ShopNowButton