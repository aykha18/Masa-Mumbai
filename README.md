# 🐟 Masa Mumbai - Fresh Fish Delivery Service

**ताजा मासा घरपोर्त | Fresh Fish Home Delivery**

A complete full-stack e-commerce platform for fresh fish delivery in Mumbai, built with modern web technologies and featuring comprehensive delivery partner management.

## 🌟 Features

### 🛒 Customer Features
- **Product Catalog**: Browse fresh fish by categories (Rohu, Catla, Pomfret, etc.)
- **Shopping Cart**: Add/remove items with quantity management
- **User Authentication**: Secure login/registration system
- **Address Management**: Save multiple delivery addresses
- **Order Tracking**: Real-time order status updates
- **Delivery Slots**: Choose convenient delivery time slots
- **Payment Options**: Cash on Delivery and UPI payments

### 🚚 Delivery Partner Features
- **Partner Registration**: Dedicated signup for delivery partners
- **Order Assignment**: Automatic/manual order assignment system
- **Delivery Tracking**: Update order status (picked up, delivered)
- **Earnings Dashboard**: Track delivery earnings and ratings
- **Availability Management**: Set online/offline status
- **Route Optimization**: Efficient delivery route planning

### 👨‍💼 Admin Features
- **Dashboard Analytics**: Sales reports, order statistics, revenue tracking
- **User Management**: Manage customers and delivery partners
- **Product Management**: Add/edit/delete products and categories
- **Order Management**: View and manage all orders
- **Delivery Management**: Assign orders to partners, track deliveries
- **System Configuration**: Configure delivery fees, slots, and settings

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database with Sequelize ORM
- **JWT Authentication** with role-based access control
- **bcrypt** for password hashing
- **Multer** for file uploads
- **Web Push** notifications

### Frontend
- **React.js** with modern hooks
- **Tailwind CSS** for responsive design
- **Axios** for API communication
- **React Router** for navigation
- **React Hot Toast** for notifications
- **Chart.js** for analytics visualization
- **PWA** capabilities with service worker

### DevOps & Deployment
- **Oracle Cloud** deployment ready
- **PM2** process management
- **Nginx** reverse proxy configuration
- **SSL/TLS** encryption
- **Docker** containerization support

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- PostgreSQL (v12+)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/aykha18/Masa-Mumbai.git
   cd masa-mumbai
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env  # Configure your environment variables
   npm run db:create    # Create database
   npm run db:migrate   # Run migrations
   npm run db:seed      # Seed initial data
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
masa-mumbai/
├── backend/                 # Node.js/Express backend
│   ├── models/             # Sequelize models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── services/           # Business logic services
│   ├── tests/              # Backend unit tests
│   └── uploads/            # File uploads directory
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   └── api.js          # API configuration
│   └── public/             # Static assets
├── tests/                   # Integration test scripts
├── docs/                    # Documentation
└── README.md
```

## 🔐 Default Credentials

### Admin User
- **Email**: admin@masamumbai.com
- **Password**: admin123

### Test Delivery Partner
- **Email**: sunil@gmail.com
- **Password**: aykha123

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Backend tests
cd backend
npm test

# Integration tests
cd tests
node test-delivery-partner.js
node test-admin-login.js
```

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/register-delivery-partner` - Partner registration

### Product Endpoints
- `GET /api/products` - Get all products
- `GET /api/categories` - Get product categories
- `POST /api/products` - Create product (Admin only)

### Order Endpoints
- `POST /api/orders` - Place new order
- `GET /api/orders` - Get user orders
- `PUT /api/orders/:id/status` - Update order status

### Delivery Partner Endpoints
- `GET /api/delivery-partners/deliveries` - Get assigned deliveries
- `POST /api/delivery-partners/deliveries/:id/accept` - Accept delivery
- `PUT /api/delivery-partners/deliveries/:id/status` - Update delivery status

## 🚀 Deployment

### Oracle Cloud Deployment
1. Follow the deployment guide in `docs/DEPLOYMENT-ORACLE-CLOUD.md`
2. Use the provided setup script: `oracle-cloud-setup.sh`
3. Configure environment variables for production

### Environment Variables
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=masa_mumbai
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT
JWT_SECRET=your_jwt_secret

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# Push Notifications
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- **Email**: hello@masamumbai.com
- **GitHub Issues**: [Create an issue](https://github.com/aykha18/Masa-Mumbai/issues)

## 🙏 Acknowledgments

- Built with ❤️ for Mumbai's fresh fish lovers
- Special thanks to the local fishing community
- Inspired by the vibrant street food culture of Mumbai

---

**🐟 Masa Mumbai - Bringing the Ocean to Your Doorstep! 🌊**