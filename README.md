
# eCommerce Store Frontend
This is the frontend application for an eCommerce platform built with **React**, **React Router**, and **Tailwind CSS**. It provides a user-friendly interface for browsing products, managing a cart, and placing orders. The application communicates with a backend API to fetch product data and process orders.

## Features
- **Home Page**: Displays a hero section and a curated list of 6 featured products with a "View More Products" link.
- **Products Page**: Lists products with pagination, search, and price filtering capabilities.
- **Product Details Page**: Shows detailed product information, including variant selection (color, size), quantity, and inventory validation.
- **Cart Functionality**: Add products to the cart with inventory checks, stored in `localStorage`.
- **Checkout Page**: Collects shipping and payment details (currently simulated) to place orders.
- **Responsive Design**: Fully responsive UI using Tailwind CSS, optimized for mobile, tablet, and desktop.
- **Toast Notifications**: Provides feedback using `react-hot-toast` for actions like adding to cart.

## Tech Stack
- **React**: JavaScript library for building the UI.
- **React Router**: For client-side routing.
- **Tailwind CSS**: For styling and responsive design.
- **Axios**: For making API requests to the backend.
- **React Hot Toast**: For user notifications.
- **Heroicons**: For icons (e.g., cart, menu).

## Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**

## Getting Started

### 1. Clone the Repository
```bash
git clone <repository-url>
cd client
```

### 2. Install Dependencies
Using npm:
```bash
npm install
```
Or using yarn:
```bash
yarn install
```

### 3. Configure Environment
The frontend communicates with the backend API. Ensure the backend is running (see Backend README for setup). The default API URL is:
- `http://localhost:5000`

If your backend runs on a different port or host, update the API calls in the frontend code (e.g., in `axios` requests).

### 4. Run the Application
Start the development server:
```bash
npm start
```
Or with yarn:
```bash
yarn start
```

The app will be available at `http://localhost:5173`.

## Project Structure
```
client/
├── public/                    # Static assets (e.g., index.html, favicon)
├── src/
│   ├── components/            # Reusable components (e.g., Header)
│   │   └── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── ProtectedRoute.jsx
│   ├── pages/                 # Page components
│   │   ├── CartPage.jsx
│   │   ├── CheckoutPage.jsx
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── NotFoundPage.jsx
│   │   ├── ProductDetailedPage.jsx
│   │   ├── ProductsPage.jsx
│   │   ├── RegisterPage.jsx
│   │   └── ThankYouPage.jsx
│   ├── context/              # React context (e.g., authHook)
│   │   └── AuthContext.js
│   │   └── AuthHook.js
│   │   └── AuthProvider.js
│   ├── App.jsx               # Main app component with routing
│   ├── index.css             # Main CSS file
│   ├── main.jsx              # Entry point
│   └── styles/               # Custom styles (if any)
├── package.json              # Dependencies and scripts
└── tailwind.config.js        # Tailwind CSS configuration
```

## Available Scripts
- `npm start`: Starts the development server.
- `npm build`: Builds the app for production.
- `npm test`: Runs tests (if configured).

## Usage
1. **Home Page**: Browse featured products and click "View More Products" to see the full catalog.
2. **Products Page**: Use the search bar and price filters to find products. Click "View Details" to see more or add directly to the cart.
3. **Product Details**: Select variants (color, size), adjust quantity, and add to cart or buy now.
4. **Checkout**: Enter shipping and payment details to place an order (payment is currently simulated).

## Notes
- The cart is stored in `localStorage` and persists across page reloads.
- Payment processing is simulated (`simulateTransaction` in the backend). To enable real payments, integrate a payment gateway like Stripe.
- Ensure the backend API is running at `http://localhost:5000` for the app to function properly.

## Future Improvements
- Add user authentication for personalized experiences.
- Integrate a real payment gateway (e.g., Stripe, PayPal).
- Add a cart page to view and edit cart items before checkout.
- Implement product categories and advanced filtering.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request with your changes.

## License
This project is licensed under the MIT License.
```

