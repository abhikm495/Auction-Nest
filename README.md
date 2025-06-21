# 🏆 Auction Nest - Real-Time Online Auction Platform

A modern, feature-rich online auction platform built with the **MERN stack**, offering real-time bidding experiences with comprehensive security and user tracking. Perfect for learning full-stack development with production-ready features.

## 🚀 Live Demo
**[🌐 Visit Auction Nest](https://bidding-platform-hs9e.vercel.app/)**

---

## ✨ Core Features

### 🔥 Real-Time Auction Experience
- **⚡ Live Bidding Updates** - Instant notifications when new bids are placed via WebSocket connections
- **👀 Live Viewer Count** - See how many users are currently viewing each auction item
- **📊 Complete Bid History** - Track all bids with timestamps and user details
- **🔄 Auto-Refresh Data** - Auction details update automatically without page reload

### 🔐 Security & Authentication
- **🍪 Secure Cookie Authentication** - JWT tokens stored in httpOnly cookies for maximum security
- **🌍 Login Activity Tracking** - Monitor login sessions with IP, location, device, and browser details
- **🛡️ Session Management** - Auto-login from stored cookies with secure validation

### 💼 User Experience
- **📱 Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **🖼️ Image Upload & Management** - Cloudinary integration for high-quality auction images
- **⚡ Fast Performance** - Built with React 19 and optimized loading states
- **🔍 Advanced State Management** - Redux Toolkit + TanStack Query for seamless data flow

---

## 📸 Screenshots

### Auction Dashboard
![Auction Dashboard](https://res.cloudinary.com/dzprnwikf/image/upload/v1750533409/Screenshot_2025-06-22_at_12.42.29_AM_wqcyfh.png)

### Live Bidding Interface
![Live Bidding](https://res.cloudinary.com/dzprnwikf/image/upload/v1750533635/Screenshot_2025-06-22_at_12.49.12_AM_r1wcau.png)

### Auction Details & History
![Auction Details](https://res.cloudinary.com/dzprnwikf/image/upload/v1750533683/Screenshot_2025-06-22_at_12.49.31_AM_xcvwgy.png)

---

## 🛠️ Tech Stack

### Frontend
- **React 19** with Vite for lightning-fast development
- **Tailwind CSS** for modern, responsive styling
- **React Router v7+** for seamless navigation
- **Redux Toolkit** for global state management
- **TanStack Query** for efficient data fetching and caching
- **Socket.io Client** for real-time communication

### Backend
- **Node.js & Express.js** for robust server architecture
- **MongoDB & Mongoose** for flexible data storage
- **Socket.io** for real-time bidding updates
- **JWT Authentication** with secure httpOnly cookies
- **Multer & Cloudinary** for image upload and management
- **GeoIP Integration** for location-based security logging

---

## 📁 Project Structure

```
auction-nest/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Route components
│   │   ├── store/         # Redux store configuration
│   │   ├── hooks/         # Custom React hooks
│   │   └── utils/         # Utility functions
│   └── package.json
├── server/                 # Express backend API
│   ├── controllers/       # Route handlers
│   ├── models/           # MongoDB schemas
│   ├── middleware/       # Authentication & validation
│   ├── routes/           # API endpoints
│   ├── socket/           # WebSocket handlers
│   └── package.json
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB database
- Cloudinary account (for image hosting)
- Resend account (for email notifications)

### 1. Clone & Setup
```bash
git clone https://github.com/abhikm495/auction-nest.git
cd auction-nest
```

### 2. Backend Configuration
```bash
cd server
npm install
cp .env.example .env  # Configure your environment variables
npm run dev
```

### 3. Frontend Setup
```bash
cd ../client
npm install
cp .env.example .env  # Configure your API endpoints
npm run dev
```

### 4. Environment Variables

#### Backend (.env)
```env
PORT=3000
ORIGIN=http://localhost:5173
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_super_secure_jwt_secret
JWT_EXPIRES_IN=1d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RESEND_API_KEY=your_resend_api_key
```

#### Frontend (.env)
```env
VITE_API=http://localhost:3000
VITE_AUCTION_API=http://localhost:3000/auction
```

---

## 🔐 Security Features

### Advanced Authentication
- **Secure Cookie Storage** - JWT tokens stored in httpOnly cookies, inaccessible to JavaScript
- **Automatic Session Validation** - Server validates auth on each request
- **CORS Protection** - Configured for secure cross-origin requests

### Comprehensive Login Tracking
Every login is logged with:
- 🌍 **Geographic Location** (Country, State, City)
- 📱 **Device Information** (Mobile, Desktop, Tablet)
- 🌐 **Browser Details** (Type, Version, OS)
- 🔒 **IP Address** and timestamp
- 🚨 **Anomaly Detection** for suspicious login patterns

---

## 🎯 Key Functionalities

### For Sellers
- ✅ Create detailed auction listings with multiple images
- ✅ Set starting bids, reserve prices, and auction duration
- ✅ Monitor real-time bidding activity
- ✅ Track viewer engagement and bid history

### For Bidders
- ✅ Browse active auctions with advanced filtering
- ✅ Place bids with instant confirmation
- ✅ Receive real-time notifications for outbid alerts
- ✅ View comprehensive auction and bidding history

### For Everyone
- ✅ Responsive design across all devices
- ✅ Real-time updates without page refreshes
- ✅ Secure user profiles with login history
- ✅ Professional-grade image handling

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Guidelines
- Follow the existing code style and conventions
- Write clear, concise commit messages
- Add tests for new features when applicable
- Update documentation for any new functionality

---

## 📋 Roadmap

- [ ] **Advanced Filters** - Category, price range
- [ ] **Auction Scheduling** - Schedule auctions for future dates
- [ ] **Payment Integration** - Stripe/PayPal integration for seamless transactions
- [ ] **Email Notifications** - Automated bidding and auction status emails
- [ ] **Admin Dashboard** - Comprehensive admin panel for platform management

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Abhishek Kumar**
- GitHub: [@abhikm495](https://github.com/abhikm495)
- LinkedIn: [Connect with me](https://linkedin.com/in/abhikm495)

Built with ❤️ for the developer community. Perfect for learning full-stack development, real-time applications, and modern web security practices.

---

## 🙏 Acknowledgments

- **MongoDB** for the flexible database solution
- **Socket.io** for seamless real-time communication
- **Cloudinary** for robust image management
- **Vercel** for reliable deployment and hosting
- **The Open Source Community** for the amazing tools and libraries

---

**⭐ If you found this project helpful, please give it a star on GitHub!**