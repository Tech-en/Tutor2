# 🎓 Tutoring Platform - Production Backend

A comprehensive, production-ready backend system for a modern tutoring platform with booking management, payment processing, session scheduling, and real-time features.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Security Features](#security-features)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Core Features
- **User Authentication & Authorization** - JWT-based authentication with role management (Student, Tutor, Admin)
- **Tutor Management** - Complete profile management with subjects, availability, and pricing
- **Session Booking** - Real-time booking system with conflict prevention
- **Payment Integration** - Stripe integration for secure payment processing
- **Review System** - Student reviews and ratings for tutors
- **Notification System** - Email and in-app notifications
- **File Upload** - Profile pictures, documents, and session materials
- **Real-time Updates** - Socket.IO for live session updates

### Advanced Features
- Rate limiting and DDoS protection
- Request sanitization and XSS prevention
- MongoDB query injection protection
- Comprehensive error handling
- Advanced logging with Winston
- Email service with Nodemailer
- Automated session reminders
- Booking conflict detection
- Platform commission calculations

## 🛠 Tech Stack

- **Runtime**: Node.js (v16+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **Payment**: Stripe API
- **Email**: Nodemailer
- **File Upload**: Multer
- **Security**: Helmet, express-mongo-sanitize, xss-clean, hpp
- **Logging**: Winston
- **Real-time**: Socket.IO
- **Validation**: express-validator
- **Job Scheduling**: Agenda

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **MongoDB** (v5 or higher) or MongoDB Atlas account
- **npm** or **yarn**
- **Stripe Account** (for payment processing)
- **SMTP Email Account** (Gmail, SendGrid, etc.)

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/tutoring-platform-backend.git
cd tutoring-platform-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create environment file

```bash
cp .env.example .env
```

### 4. Configure environment variables

Edit `.env` file with your actual credentials:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/tutoring_platform
JWT_SECRET=your_secure_jwt_secret
STRIPE_SECRET_KEY=sk_test_your_stripe_key
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password
CLIENT_URL=http://localhost:3000
```

### 5. Start MongoDB

```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas connection string in .env
```

## ⚙️ Configuration

### MongoDB Setup

**Local MongoDB:**
```bash
mongod --dbpath /path/to/data/directory
```

**MongoDB Atlas:**
1. Create a cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get your connection string
3. Add to `.env` as `MONGO_URI`

### Stripe Setup

1. Create account at [Stripe](https://stripe.com)
2. Get API keys from Dashboard
3. Add to `.env`:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PUBLISHABLE_KEY`

### Email Setup (Gmail Example)

1. Enable 2-factor authentication
2. Generate App Password
3. Add to `.env`:
   - `SMTP_EMAIL`
   - `SMTP_PASSWORD`

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

Server will start at `http://localhost:5000` with auto-reload.

### Production Mode

```bash
npm start
```

### With PM2 (Production)

```bash
npm install -g pm2
pm2 start server.js --name tutoring-api
pm2 logs tutoring-api
pm2 restart tutoring-api
pm2 stop tutoring-api
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| GET | `/auth/profile` | Get current user | Yes |
| PUT | `/auth/profile` | Update profile | Yes |
| PUT | `/auth/change-password` | Change password | Yes |

### Tutor Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/tutors` | Get all tutors | No |
| GET | `/tutors/:id` | Get tutor by ID | No |
| POST | `/tutors/become-tutor` | Become a tutor | Yes |
| PUT | `/tutors/profile` | Update tutor profile | Yes (Tutor) |
| PUT | `/tutors/availability` | Update availability | Yes (Tutor) |

### Booking Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/bookings` | Create booking | Yes (Student) |
| GET | `/bookings/my-bookings` | Get user bookings | Yes |
| GET | `/bookings/:id` | Get booking details | Yes |
| PUT | `/bookings/:id/cancel` | Cancel booking | Yes |
| PUT | `/bookings/:id/confirm` | Confirm booking | Yes (Tutor) |

### Session Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/sessions/my-sessions` | Get user sessions | Yes |
| GET | `/sessions/:id` | Get session details | Yes |
| PUT | `/sessions/:id/start` | Start session | Yes (Tutor) |
| PUT | `/sessions/:id/end` | End session | Yes (Tutor) |
| POST | `/sessions/:id/notes` | Add session notes | Yes (Tutor) |

### Payment Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/payments/create-payment-intent` | Create payment | Yes |
| POST | `/payments/process` | Process payment | Yes |
| GET | `/payments/my-payments` | Get user payments | Yes |
| POST | `/payments/refund` | Refund payment | Yes (Admin) |

### Review Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/reviews` | Create review | Yes (Student) |
| GET | `/reviews/tutor/:tutorId` | Get tutor reviews | No |
| PUT | `/reviews/:id` | Update review | Yes (Owner) |
| DELETE | `/reviews/:id` | Delete review | Yes (Owner/Admin) |

## 📁 Project Structure

```
tutoring-platform/
├── config/
│   └── db.js                 # Database connection
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── tutorController.js    # Tutor management
│   ├── bookingController.js  # Booking operations
│   ├── sessionController.js  # Session management
│   ├── paymentController.js  # Payment processing
│   └── reviewController.js   # Review system
├── models/
│   ├── User.js              # User schema
│   ├── Tutor.js             # Tutor schema
│   ├── Booking.js           # Booking schema
│   ├── Session.js           # Session schema
│   ├── Payment.js           # Payment schema
│   ├── Review.js            # Review schema
│   └── Notification.js      # Notification schema
├── routes/
│   ├── authRoutes.js        # Auth endpoints
│   ├── tutorRoutes.js       # Tutor endpoints
│   ├── bookingRoutes.js     # Booking endpoints
│   ├── sessionRoutes.js     # Session endpoints
│   ├── paymentRoutes.js     # Payment endpoints
│   └── reviewRoutes.js      # Review endpoints
├── middleware/
│   ├── authMiddleware.js    # JWT verification
│   ├── errorMiddleware.js   # Error handling
│   ├── uploadMiddleware.js  # File uploads
│   ├── rateLimiter.js       # Rate limiting
│   └── securityMiddleware.js # Security headers
├── utils/
│   ├── generateToken.js     # JWT utilities
│   ├── emailService.js      # Email sending
│   ├── paymentService.js    # Payment utilities
│   └── logger.js            # Winston logger
├── uploads/                 # File storage
├── .env.example            # Environment template
├── .gitignore              # Git ignore rules
├── package.json            # Dependencies
├── README.md               # Documentation
└── server.js               # Application entry point
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt with salt rounds
- **Rate Limiting** - Prevent brute force attacks
- **Helmet** - Security HTTP headers
- **CORS** - Cross-origin resource sharing protection
- **XSS Protection** - Cross-site scripting prevention
- **NoSQL Injection Prevention** - MongoDB sanitization
- **HPP** - HTTP parameter pollution prevention
- **File Upload Validation** - Type and size restrictions
- **Input Validation** - express-validator for all inputs

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🚀 Deployment

### Deploy to Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create tutoring-platform-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGO_URI=your_mongodb_atlas_uri
heroku config:set JWT_SECRET=your_secret

# Deploy
git push heroku main

# Open app
heroku open
```

### Deploy to AWS EC2

1. Launch EC2 instance (Ubuntu 20.04)
2. Install Node.js and MongoDB
3. Clone repository
4. Install dependencies
5. Configure environment variables
6. Use PM2 for process management
7. Setup Nginx as reverse proxy
8. Configure SSL with Let's Encrypt

### Deploy to DigitalOcean

1. Create Droplet (Node.js)
2. SSH into droplet
3. Clone repository
4. Install dependencies
5. Configure environment
6. Setup PM2
7. Configure Nginx
8. Setup SSL certificate

## 📝 Environment Variables

See `.env.example` for all required environment variables.

Critical variables:
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret (min 32 characters)
- `STRIPE_SECRET_KEY` - Stripe API key
- `SMTP_EMAIL` - Email service credentials
- `CLIENT_URL` - Frontend URL for CORS

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Support

For support, email support@tutorplatform.com or open an issue in the repository.

## 🙏 Acknowledgments

- Express.js team
- MongoDB team
- Stripe for payment processing
- All open-source contributors

---

**Built with ❤️ by TutorPlatform Team**
