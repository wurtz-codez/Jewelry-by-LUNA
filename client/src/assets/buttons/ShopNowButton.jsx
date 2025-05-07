import { Link } from 'react-router-dom'

const ShopNowButton = () => {
  return (
    <Link to="/shop">
      <button className="px-8 py-3 bg-primary text-neutral hover:bg-secondary hover:text-white transition-all duration-300 font-cinzel text-lg tracking-wider rounded-[8px]">
        SHOP NOW
      </button>
    </Link>
  )
}

export default ShopNowButton