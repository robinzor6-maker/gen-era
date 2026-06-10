# GEN ERA Backend

This is the backend server for the GEN ERA 3D e-commerce platform.

## Quick Start

```bash
npm install
npm run dev
```

## API Endpoints

### Products
- GET `/api/products` - Get all products
- GET `/api/products/:id` - Get single product
- POST `/api/products` - Create product (admin)
- PUT `/api/products/:id` - Update product (admin)
- DELETE `/api/products/:id` - Delete product (admin)

### Auth
- POST `/api/auth/register` - Register user
- POST `/api/auth/login` - Login user
- GET `/api/auth/profile` - Get user profile (protected)

### Orders
- POST `/api/orders` - Create order (protected)
- GET `/api/orders/user/:userId` - Get user orders (protected)
- GET `/api/orders/:id` - Get order details (protected)
- PUT `/api/orders/:id/status` - Update order status (protected)

## Environment Variables

Create a `.env` file:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/gen-era
JWT_SECRET=your-secret-key
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## MongoDB Setup

Make sure MongoDB is running locally or update MONGO_URI to your cloud instance.

## Seed Data

Run seed script:
```bash
npm run seed
```
