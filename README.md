# ResumeLetterAI

**🚧 Status: Actively In Development** 
- ✅ Authentication — Done
- ✅ Resume Generation — Done
- ✅ Core UI — Done
- 🔄 Cover Letter Generation — In Progress
- 🔄 AI Optimization — In Progress

An intelligent, AI-powered resume and cover letter builder that helps IT professionals create professional, ATS-friendly documents in minutes." Completely free to use with unlimited generations.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![Yarn](https://img.shields.io/badge/yarn-%3E%3D1.22.0-blue)

## 💡 Why I Built This
### The Problem

IT professionals — developers, engineers, DevOps, QA — spend hours manually formatting resumes when applying for jobs. Their skill set is complex and project experience is diverse, but generic resume builders are optimized for marketing or business roles — they simply don't understand technical depth.

### The Solution

ResumeLetterAI is built specifically for IT professionals — where the AI understands technical stacks, project descriptions, and role-specific keywords. The result: a recruiter-ready resume in under 5 minutes, without the hassle of manual formatting.

### Who It's For
Developers, Engineers, DevOps, QA, and anyone in the IT field who wants to spend less time on formatting and more time on landing the job.

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


## 🧠 Architecture Decisions

> Every decision here was made deliberately. Click any section to see the reasoning, alternatives considered, and trade-offs.

<details>
<summary>⚡ Why Next.js over plain React.js?</summary>

**Chosen:** Next.js
**Alternatives Considered:** Plain React.js with Vite, Remix

Next.js gives file-based routing, automatic code splitting, and built-in image optimization out of the box — things that plain React requires manual setup for. With Vite + React, we would have needed to configure React Router, manually handle code splitting, and set up image optimization separately.

Remix is powerful but its ecosystem is significantly smaller than Next.js and the community support is not as mature.

We are not using SSR for authenticated pages since resume data is private — but the architecture is ready. When we introduce public resume sharing, SSR will work immediately with zero migration cost.

**API Routes:** We deliberately chose not to use Next.js API Routes. The backend has Redis caching, Prometheus monitoring, rate limiting, and a modular architecture that Express handles cleanly. Next.js API Routes are not designed for this level of backend complexity.

</details>

<details>
<summary>🎨 Why Tailwind CSS over CSS Modules and Styled Components?</summary>

**Chosen:** Tailwind CSS
**Alternatives Considered:** CSS Modules, Styled Components

**CSS Modules** gave component-level scoping but required switching between files constantly. Maintaining naming consistency across a large codebase becomes painful and enforcing a consistent design system is difficult.

**Styled Components** introduced runtime overhead — styles are injected at runtime which impacts performance. Configuring it correctly with Next.js SSR adds unnecessary complexity and bundle size increases.

**Tailwind** keeps styling inside the component with utility classes — no file switching. The design system is built-in with consistent spacing, colors, and typography. In production, unused CSS is purged automatically resulting in a minimal bundle size.

We use `clsx` and `tailwind-merge` to handle conditional class logic cleanly when class names get complex.

</details>

<details>
<summary>🗃️ Why Redux Toolkit over Zustand and Context API?</summary>

**Chosen:** Redux Toolkit
**Alternatives Considered:** Zustand, Context API

**Context API** is fine for simple state but causes performance issues at scale. Every Context value change re-renders all consuming components. For a resume builder with auth state, form data, AI generation status, template selection, and auto-save state — all interconnected — this would be a performance nightmare.

**Zustand** is lightweight and would work for an MVP but as state complexity grows, enforcing consistent patterns across the codebase becomes difficult. When teams grow, Zustand lacks the structure to keep state management predictable.

**Redux Toolkit** gives predictable state updates through a single flow, excellent DevTools for debugging complex async operations like AI generation, and a scalable slice-based structure where each feature owns its state cleanly.

Context API is still used for simple local concerns like theme and modal state — Redux Toolkit handles all global complex state.

</details>

<details>
<summary>💾 Why Redux Persist?</summary>

**Chosen:** Redux Persist
**Alternatives Considered:** Manual localStorage handling, Server-side session storage

Users spend significant time filling out resume data across multiple sections. A page refresh should never lose their work — that would be an unacceptable user experience.

Redux Persist selectively persists specific slices to localStorage. Auth state and resume form data are persisted. AI generation loading state is deliberately not persisted — showing a stale loading state after a refresh would be confusing.

Sensitive data in localStorage is mitigated by DOMPurify sanitization on the frontend to prevent XSS attacks.

</details>

<details>
<summary>🌐 Why Axios over the native Fetch API?</summary>

**Chosen:** Axios
**Alternatives Considered:** Native Fetch API

The native Fetch API requires manually calling `response.json()` on every request. More critically, Fetch does not throw errors on HTTP error responses like 404 or 500 — you have to manually check `response.ok` every time. There are no interceptors and request cancellation requires AbortController setup.

**Axios** handles all of this automatically. JSON is parsed automatically. HTTP errors throw automatically. Request interceptors inject the JWT auth token into every single API call without repeating code. Response interceptors handle 401 errors globally — triggering logout or token refresh in one place instead of in every API call.

The result is significantly cleaner and more maintainable API interaction code across the entire frontend.

</details>

<details>
<summary>✨ Why Framer Motion over CSS Animations?</summary>

**Chosen:** Framer Motion
**Alternatives Considered:** Pure CSS Animations, CSS Transitions

Pure CSS animations are perfectly fine for simple fades and slides. But ResumeLetterAI has drag-and-drop resume section reordering — users can rearrange experience, skills, and education sections. Animating this smoothly with pure CSS becomes verbose and difficult to maintain.

Framer Motion's declarative API keeps animation logic clean and directly inside the component JSX. Complex animation orchestration — where one animation triggers another — is handled naturally. It integrates seamlessly with `@dnd-kit` which handles the drag logic while Framer Motion handles the visual animation.

GPU acceleration is automatic, keeping performance smooth even with multiple animated elements on screen.

</details>

<details>
<summary>🏗️ Why Modular Monolithic over Microservices and Traditional Monolithic?</summary>

**Chosen:** Modular Monolithic
**Alternatives Considered:** Traditional Monolithic, Microservices

**Traditional Monolithic** has no internal boundaries — auth logic, resume logic, AI logic all mixed together. It works for small projects but becomes unmaintainable as the codebase grows.

**Microservices** would mean separate deployments, service discovery, network latency between services, and distributed tracing — all operational overhead that adds zero business value at MVP stage.

**Modular Monolithic** is the best of both. Each module — `auth`, `resume-templates`, `user-info`, `reviews`, `health` — has its own controllers, services, models, routes, and validators. Modules only communicate through their exported public interfaces, never through internal files directly.

When the product scales and specific modules need independent scaling — for example the AI generation service handling significantly more traffic — each module can be extracted into its own microservice. The boundaries are already defined. No big refactor needed.

</details>

<details>
<summary>🗄️ Why MongoDB over PostgreSQL and MySQL?</summary>

**Chosen:** MongoDB
**Alternatives Considered:** PostgreSQL, MySQL

**MySQL** uses a strictly fixed schema. Resume data has flexible nested structures — experience entries, skill lists, project descriptions — that vary per user. Storing this in MySQL would require 10+ tables and complex JOIN queries just to fetch a single resume.

**PostgreSQL** is more flexible with JSONB support but JSONB indexing is limited and querying nested document structures is verbose. It is a workaround, not a natural fit for document-shaped data.

**MongoDB** stores each resume as a single document. Fetch one resume — one query, no JOINs. Schema flexibility means AI-generated content with varying structures is handled naturally.

Data consistency is handled through Mongoose schema validation at the application layer and MongoDB session-based transactions for critical operations.

When the product needs complex analytics, reporting, or financial data in the future, a hybrid approach will be used — resume data stays in MongoDB, financial and analytics data moves to PostgreSQL.

</details>

<details>
<summary>🤖 Why Google Gemini over OpenAI GPT and Claude?</summary>

**Chosen:** Google Gemini
**Alternatives Considered:** OpenAI GPT-4o, Anthropic Claude

**OpenAI GPT-4o** is the most popular AI API with the largest ecosystem and best documentation. But it is also the most expensive. The free tier is very limited — meaningful development and testing would incur real costs at MVP stage.

**Anthropic Claude** has excellent reasoning and natural writing quality — arguably better for long-form content. But Claude has no free API tier at all. Every request costs money from day one.

**Google Gemini** offers 1500 free requests per day with Gemini 1.5 Flash — enough to build, test, and validate the entire MVP at zero cost. Output quality for structured resume generation is more than sufficient.

The AI provider is accessed through an abstraction service layer — the application never calls Gemini SDK directly. When the product scales and budget allows, switching to OpenAI or Claude requires changing only the service layer. The rest of the codebase remains untouched.

</details>

<details>
<summary>✅ Why Zod and express-validator together?</summary>

**Chosen:** Zod + express-validator
**Alternatives Considered:** Zod alone, express-validator alone

They operate at two completely different layers and are not redundant.

**express-validator** works at the HTTP layer. It runs as Express middleware and validates `req.body`, `req.params`, and `req.query` the moment a request arrives. It catches basic issues — empty fields, invalid email formats — before the request ever reaches the service layer.

**Zod** works at the business logic layer. It handles complex nested object validation, deep type checking, and schema reuse. The same Zod schemas used on the backend are imported on the frontend with React Hook Form — a single source of truth for validation rules across the entire application.

This is defense in depth. express-validator is the first gate — invalid requests never reach the service layer. Zod is the second gate — business logic is protected from malformed data structures.

</details>

<details>
<summary>📖 Why Swagger UI for API documentation?</summary>

**Chosen:** Swagger UI
**Alternatives Considered:** Postman Collection only, Manual Markdown docs

Manual documentation goes out of date the moment the code changes. Postman Collections require every developer to install Postman and import the collection separately.

Swagger UI generates interactive browser-based documentation directly from `openapi.yaml`. Any developer can open `/api-docs` and immediately see every endpoint, its expected request format, and test it directly in the browser — no tools to install, no setup required.

In production, the `/api-docs` route is disabled when `NODE_ENV=production` so the API structure is never publicly exposed.

The future plan is to use `swagger-jsdoc` to auto-generate the OpenAPI spec from code comments — keeping documentation and code permanently in sync.

</details>

<details>
<summary>🏛️ Why Feature-Sliced Design combined with Atomic Design?</summary>

**Chosen:** FSD + Atomic Design
**Alternatives Considered:** Standard MVC, FSD alone

These two methodologies solve completely different problems and do not overlap.

**Atomic Design** answers: how do we organize UI components?
`atoms` — Button, Input, Label — single responsibility, no business logic
`molecules` — FormField, SearchBar — combinations of atoms
`organisms` — ResumeForm, NavBar — complete UI blocks

These live in `shared/components` and are pure UI with zero business logic.

**Feature-Sliced Design** answers: how do we organize features and business logic?
`features` — auth, resume-builder, cover-letter — user interactions and business logic
`entities` — business domain objects
`widgets` — dashboard, navigation, landing — complex page sections that combine multiple features
`shared` — reusable utilities, hooks, and the Atomic Design component library

Features consume shared UI components. UI components know nothing about business logic. The separation means UI can be redesigned without touching feature logic, and feature logic can change without touching UI components.

</details>

## 📸 Screenshots

<div align="center">

<img width="650" alt="Home Page" src="https://github.com/user-attachments/assets/71da01ea-3b15-40e3-bbce-cdff76f467a1" />
<br/><b>Home Page</b>

<br/>

<img width="650" alt="Dashboard" src="https://github.com/user-attachments/assets/e456d074-2597-48cc-a907-8d6d21c1f4c6" />
<br/><b>Dashboard</b>

<br/>

<img width="650" alt="Resume Creation" src="https://github.com/user-attachments/assets/5572f297-8c13-4199-8a92-7420553a2c42" />
<br/><b>Resume Creation</b>

<br/>

<img width="320" alt="Sign Up" src="https://github.com/user-attachments/assets/dba2a0fe-1eef-4e77-be77-9bee6ccf1c3b" />
<br/><b>Sign Up</b>

</div>

## 🔗 Live Demo

🚧 Coming soon — deployment in progress.

## 📋 Prerequisites

- Node.js >= 18.0.0
- Yarn >= 1.22.0
- MongoDB instance (local or MongoDB Atlas)
- Redis instance (local or Upstash)
- Google Gemini API key (Get free key here)
- Cloudinary account (Sign up free)

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
│   ├── widgets/             # Complex page sections
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
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/me` - Get current user

### Resume Endpoints
- `GET /api/v1/resumes/stats` - Get resume statistics
- `GET /api/v1/resumes` - Get all user resumes (pagination supported)
- `POST /api/v1/resumes` - Create new resume *(rate limited: 20/hour)*
- `GET /api/v1/resumes/:id` - Get specific resume
- `PATCH /api/v1/resumes/:id` - Update resume
- `DELETE /api/v1/resumes/:id` - Soft delete resume
- `POST /api/v1/resumes/:id/duplicate` - Duplicate resume *(rate limited)*
- `PATCH /api/v1/resumes/:id/section-order` - Update section order (drag & drop)
- `PATCH /api/v1/resumes/:id/section-visibility` - Toggle section visibility
- `PATCH /api/v1/resumes/:id/template` - Switch resume template

### Template Endpoints
- `GET /api/v1/templates` - Get all active templates
- `GET /api/v1/templates/categories/stats` - Get template count by category
- `GET /api/v1/templates/:id` - Get specific template
- `GET /api/v1/templates/:id/preview` - Get template preview
- `POST /api/v1/templates` - Create new template *(Admin)*
- `POST /api/v1/templates/:id/duplicate` - Duplicate template *(Admin)*
- `PATCH /api/v1/templates/:id` - Update template *(Admin)*
- `PATCH /api/v1/templates/:id/restore` - Restore deleted template *(Admin)*
- `GET /api/v1/templates/deleted` - Get soft-deleted templates *(Admin)*
- `DELETE /api/v1/templates/:id` - Soft delete template *(Admin)*
- `DELETE /api/v1/templates/:id/permanent` - Permanently delete template *(Admin)*

### Cover Letter Endpoints
- `POST /api/v1/cover-letter/generate` - Generate cover letter with AI
- `GET /api/v1/cover-letter` - Get all user cover letters
- `GET /api/v1/cover-letter/:id` - Get specific cover letter
- `PUT /api/v1/cover-letter/:id` - Update cover letter
- `DELETE /api/v1/cover-letter/:id` - Delete cover letter
- `POST /api/v1/cover-letter/:id/export` - Export as PDF


## 🧪 Testing

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
```
Push to GitHub and import the repository on [Vercel](https://vercel.com). Set the following environment variables in Vercel dashboard:
```
NEXT_PUBLIC_API_URL=your_backend_url
NEXT_PUBLIC_APP_NAME=ResumeLetterAI
```
### Backend (Railway / Render / VPS)
```bash
yarn start
```
Currently deployable on [Railway](https://railway.app) or [Render](https://render.com) for quick setup. For production scale, a VPS deployment with PM2 and Nginx is recommended — configuration files are included in `config/pm2/` and `config/nginx/`.

## 📄 Technical Decisions

A detailed breakdown of every architectural decision, trade-offs considered, and the reasoning behind each technology choice.

👉 [Read TECHNICAL_DECISIONS.md](TECHNICAL_DECISIONS.md)

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
