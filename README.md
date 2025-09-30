# ResumeLetterAI

An intelligent, AI-powered resume and cover letter builder that helps you create professional, ATS-friendly documents in minutes. Completely free to use with unlimited generations.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![Yarn](https://img.shields.io/badge/yarn-%3E%3D1.22.0-blue)

## ✨ Features

- 🤖 **AI-Powered Generation** - Leverage Google Gemini AI for intelligent content creation
- 📄 **Resume Builder** - Create professional, ATS-optimized resumes
- ✉️ **Cover Letter Generator** - Generate tailored cover letters for specific job applications
- 🎨 **Multiple Templates** - Choose from various professional templates
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- 💾 **Auto-Save** - Never lose your work with automatic saving
- 📥 **Export to PDF** - Download your documents in high-quality PDF format
- 📤 **File Upload** - Import existing resumes for quick editing
- 🔒 **Secure & Private** - Your data is encrypted and never shared
- 🚀 **Fast & Reliable** - Built with performance and scalability in mind

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js (React)
- **State Management:** Redux Toolkit
- **UI Components:** shadcn/ui
- **Form Handling:** React Hook Form + Zod validation
- **Testing:** Jest + React Testing Library
- **Architecture:** Feature-Sliced Design (FSD) with Atomic Design

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (with Mongoose ODM)
- **Caching:** Redis (ioredis)
- **AI Integration:** Google Gemini API
- **PDF Generation:** Puppeteer
- **Architecture:** Modular Monolithic

### Security & Performance
- **Authentication:** JWT with bcrypt password hashing
- **Rate Limiting:** Redis-based rate limiting
- **Security Headers:** Helmet.js
- **Input Sanitization:** express-mongo-sanitize, xss-clean, DOMPurify
- **Validation:** express-validator, Zod
- **Compression:** gzip compression
- **Monitoring:** Prometheus metrics with winston logging

## 📋 Prerequisites

- Node.js >= 18.0.0
- Yarn >= 1.22.0
- MongoDB instance
- Redis instance
- Google Gemini API key

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Nozibul/ResumeLetterAI.git
cd ResumeLetterAI
```

### 2. Install Dependencies

#### Frontend
```bash
cd frontend
yarn install
```

#### Backend
```bash
cd backend
yarn install
```

### 3. Environment Variables

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=ResumeLetterAI
```

#### Backend (.env.local)
```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/resumeletterai

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Run the Application

#### Development Mode

**Frontend:**
```bash
cd frontend
yarn dev
```
The frontend will run on `http://localhost:3000`

**Backend:**
```bash
cd backend
yarn dev
```
The backend will run on `http://localhost:5000`

#### Production Mode

**Frontend:**
```bash
cd frontend
yarn build
yarn start
```

**Backend:**
```bash
cd backend
yarn start
```

### 5. Run Tests

**Frontend:**
```bash
cd frontend
yarn test
```

**Backend:**
```bash
cd backend
yarn test
```

## 📁 Project Structure

### Frontend (Feature-Sliced Design + Atomic Design)
```
frontend/
├── src/
│   ├── app/                 # Next.js app directory
│   ├── components/          # Atomic design components
│   │   ├── atoms/
│   │   ├── molecules/
│   │   ├── organisms/
│   │   └── templates/
│   ├── features/            # Feature modules
│   ├── entities/            # Business entities
│   ├── shared/              # Shared utilities
│   ├── store/               # Redux store
│   └── styles/              # Global styles
├── public/                  # Static assets
└── package.json
```

### Backend (Modular Monolithic)
```
backend/
├── src/
│   ├── modules/                          # Domain-based modules
│   │   ├── auth/                         # Authentication module
│   │   │   ├── controllers/
│   │   │   │   └── authController.js
│   │   │   ├── services/
│   │   │   │   ├── authService.js
│   │   │   │   ├── jwtService.js
│   │   │   │   └── jailService.js
│   │   │   ├── models/
│   │   │   │   ├── User.js
│   │   │   │   └── RefreshToken.js
│   │   │   ├── middleware/
│   │   │   │   ├── authMiddleware.js
│   │   │   │   ├── roleMiddleware.js
│   │   │   │   └── jailMiddleware.js
│   │   │   ├── routes/
│   │   │   │   └── authRoutes.js
│   │   │   ├── validators/
│   │   │   │   └── authValidators.js
│   │   │   └── index.js                  # Module exports
│   │   │
│   │   ├── resume-templates/             # Resume Templates module
│   │   │   ├── controllers/
│   │   │   │   └── resumeTemplateController.js
│   │   │   ├── services/
│   │   │   │   ├── templateService.js
│   │   │   │   └── templateCacheService.js
│   │   │   ├── models/
│   │   │   │   └── ResumeTemplate.js
│   │   │   ├── middleware/
│   │   │   │   └── templatePermissionMiddleware.js
│   │   │   ├── routes/
│   │   │   │   └── resumeTemplateRoutes.js
│   │   │   ├── validators/
│   │   │   │   └── templateValidators.js
│   │   │   └── index.js
│   │   │
│   │   ├── user-info/                    # User Info module
│   │   │   ├── controllers/
│   │   │   │   └── userInfoController.js
│   │   │   ├── services/
│   │   │   │   └── userService.js
│   │   │   ├── models/
│   │   │   │   └── UserInfo.js
│   │   │   ├── routes/
│   │   │   │   └── userInfoRoutes.js
│   │   │   ├── validators/
│   │   │   │   └── userValidators.js
│   │   │   └── index.js
│   │   │
│   │   ├── reviews/                      # Reviews module
│   │   │   ├── controllers/
│   │   │   │   └── reviewController.js
│   │   │   ├── services/
│   │   │   │   ├── reviewService.js
│   │   │   │   └── reviewAggregationService.js
│   │   │   ├── models/
│   │   │   │   └── Review.js
│   │   │   ├── routes/
│   │   │   │   └── reviewRoutes.js
│   │   │   ├── validators/
│   │   │   │   └── reviewValidators.js
│   │   │   └── index.js
│   │   │
│   │   └── health/                       # Health & Monitoring module
│   │       ├── controllers/
│   │       │   └── healthController.js
│   │       ├── services/
│   │       │   ├── healthService.js
│   │       │   └── metricsService.js
│   │       ├── routes/
│   │       │   └── healthRoutes.js
│   │       └── index.js
│   │
│   ├── shared/                           # Shared utilities & services
│   │   ├── config/                       # Configuration files
│   │   │   ├── database.js
│   │   │   ├── redis.js
│   │   │   ├── constants.js
│   │   │   └── environment.js
│   │   │
│   │   ├── middleware/                   # Global middleware
│   │   │   ├── errorHandler.js
│   │   │   ├── requestLogger.js
│   │   │   ├── rateLimiter.js
│   │   │   ├── security.js
│   │   │   ├── validation.js
│   │   │   ├── cors.js
│   │   │   └── compression.js
│   │   │
│   │   ├── services/                     # Cross-cutting services
│   │   │   ├── cacheService.js
│   │   │   ├── paginationService.js
│   │   │   ├── emailService.js
│   │   │   ├── fileUploadService.js
│   │   │   ├── auditLogService.js
│   │   │   └── notificationService.js
│   │   │
│   │   ├── utils/                        # Utility functions
│   │   │   ├── logger.js
│   │   │   ├── helpers.js
│   │   │   ├── sanitizer.js
│   │   │   ├── encryption.js
│   │   │   ├── dateUtils.js
│   │   │   └── responseHelper.js
│   │   │
│   │   ├── types/                        # Custom error types & classes
│   │   │   ├── errors/
│   │   │   │   ├── APIError.js
│   │   │   │   ├── ValidationError.js
│   │   │   │   ├── NotFoundError.js
│   │   │   │   ├── UnauthorizedError.js
│   │   │   │   └── index.js
│   │   │   └── responses/
│   │   │       ├── SuccessResponse.js
│   │   │       ├── ErrorResponse.js
│   │   │       └── PaginatedResponse.js
│   │   │
│   │   └── constants/                    # Application constants
│   │       ├── httpCodes.js
│   │       ├── errorMessages.js
│   │       ├── cacheKeys.js
│   │       └── permissions.js
│   │
│   ├── database/                         # Database related files
│   │   ├── migrations/
│   │   │   ├── 001_create_users.js
│   │   │   ├── 002_create_templates.js
│   │   │   └── 003_create_reviews.js
│   │   ├── seeders/
│   │   │   ├── userSeeder.js
│   │   │   ├── templateSeeder.js
│   │   │   └── reviewSeeder.js
│   │   └── connection.js
│   │
│   ├── routes/                           # Main route aggregator
│   │   └── index.js
│   │
│   ├── app.js                           # Express app setup
│   └── server.js                        # Server entry point
│
├── tests/                               # Test files
│   ├── unit/                           # Unit tests
│   │   ├── auth/
│   │   │   ├── authService.test.js
│   │   │   └── jwtService.test.js
│   │   ├── resume-templates/
│   │   │   └── templateService.test.js
│   │   └── shared/
│   │       ├── cacheService.test.js
│   │       └── paginationService.test.js
│   │
│   ├── integration/                    # Integration tests
│   │   ├── auth/
│   │   │   └── auth.integration.test.js
│   │   ├── resume-templates/
│   │   │   └── templates.integration.test.js
│   │   └── reviews/
│   │       └── reviews.integration.test.js
│   │
│   ├── fixtures/                       # Test data
│   │   ├── users.json
│   │   ├── templates.json
│   │   └── reviews.json
│   │
│   ├── helpers/                        # Test utilities
│   │   ├── testDatabase.js
│   │   ├── testRedis.js
│   │   └── testHelpers.js
│   │
│   └── setup.js                        # Jest setup
│
├── scripts/                            # Utility scripts
│   ├── seed.js                         # Database seeding
│   ├── migrate.js                      # Run migrations
│   ├── resetDatabase.js                # Reset DB for development
│   ├── generateSecrets.js              # Generate JWT secrets
│   └── healthCheck.js                  # Health check script
│
├── logs/                               # Log files (gitignored)
│   ├── combined.log
│   ├── error.log
│   └── audit.log
│
├── docs/                               # Documentation
│   ├── api/
│   │   ├── openapi.yaml
│   │   └── postman-collection.json
│   ├── architecture/
│   │   ├── system-design.md
│   │   └── database-schema.md
│   └── deployment/
│       ├── docker.md
│       └── environment-setup.md
│
├── config/                             # Configuration files
│   ├── docker/
│   │   ├── Dockerfile
│   │   ├── docker-compose.yml
│   │   └── docker-compose.prod.yml
│   ├── nginx/
│   │   └── nginx.conf
│   └── pm2/
│       └── ecosystem.config.js
│
├── .env.example                        # Environment template
├── .env.local                          # Local development env
├── .gitignore
├── .prettierrc
├── .prettierignore
├── .eslintrc.js
├── jest.config.js
├── package.json
├── yarn.lock
└── README.md
```

## 🔐 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Resume Endpoints
- `POST /api/resume/generate` - Generate resume with AI
- `GET /api/resume` - Get all user resumes
- `GET /api/resume/:id` - Get specific resume
- `PUT /api/resume/:id` - Update resume
- `DELETE /api/resume/:id` - Delete resume
- `POST /api/resume/:id/export` - Export resume as PDF

### Cover Letter Endpoints
- `POST /api/cover-letter/generate` - Generate cover letter with AI
- `GET /api/cover-letter` - Get all user cover letters
- `GET /api/cover-letter/:id` - Get specific cover letter
- `PUT /api/cover-letter/:id` - Update cover letter
- `DELETE /api/cover-letter/:id` - Delete cover letter
- `POST /api/cover-letter/:id/export` - Export as PDF

## 🧪 Testing

We use Jest and React Testing Library for comprehensive testing coverage.

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Generate coverage report
yarn test:coverage
```

## 🚀 Deployment

### Frontend (Vercel)
```bash
yarn build
# Deploy to Vercel
```

### Backend (Railway/Render/AWS)
```bash
yarn start
# Deploy using your preferred platform
```


## 🔒 Security

If you discover a security vulnerability, please email us at [nozibulislamspi@gmail.com](mailto:nozibulislamspi@gmail.com). Do not open public issues for security concerns.

See [SECURITY.md](SECURITY.md) for more details.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Contact

For questions, feedback, or support:
- **Email:** [nozibulislamspi@gmail.com](mailto:nozibulislamspi@gmail.com)

## Acknowledgments

- Google Gemini AI for powerful content generation
- shadcn/ui for beautiful UI components
- The open-source community for amazing tools and libraries

---

**Made with ❤️ by the ResumeLetterAI Team**

⭐ Star this repo if you find it helpful!