# Jewelry by LUNA

A modern e-commerce platform for handmade jewelry.

## Features

- User authentication and authorization
- Product catalog with categories
- Shopping cart functionality
- Secure payment processing
- Admin dashboard
- Order management
- User reviews and ratings

## Tech Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- Axios for API calls

### Backend
- Node.js
- Express.js
- MongoDB
- JWT for authentication

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/jewelry-by-luna.git
cd jewelry-by-luna
```

2. Install dependencies:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env` in the server directory
   - Update the variables with your configuration

4. Start the development servers:

```bash
# Start the backend server (from server directory)
npm run dev

# Start the frontend development server (from client directory)
npm run dev
```

The frontend will be available at `http://localhost:5173`
The backend API will be available at `http://localhost:5001`

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user

### Products
- GET `/api/jewelry` - Get all products
- GET `/api/jewelry/:id` - Get single product
- POST `/api/jewelry` - Create product (admin only)
- PUT `/api/jewelry/:id` - Update product (admin only)
- DELETE `/api/jewelry/:id` - Delete product (admin only)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 