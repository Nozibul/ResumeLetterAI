# 📚 ResumeLetterAI API Documentation

> **Complete guide to understanding and using the ResumeLetterAI API**

---

## 📖 Table of Contents

1. [What is OpenAPI?](#what-is-openapi)
2. [Quick Start](#quick-start)
3. [API Overview](#api-overview)
4. [Authentication](#authentication)
5. [Available Endpoints](#available-endpoints)
6. [Request & Response Examples](#request--response-examples)
7. [Error Handling](#error-handling)
8. [Testing the API](#testing-the-api)
9. [FAQs](#faqs)

---

## 🤔 What is OpenAPI?

**OpenAPI Specification** is a **blueprint** or **instruction manual** for your API.

### What does it contain?
- ✅ Which endpoints are available
- ✅ Which HTTP methods are used (GET, POST, PUT, DELETE)
- ✅ What input it accepts (request body, parameters)
- ✅ What output it returns (response format)
- ✅ How authentication works
- ✅ What errors can occur

### Why is it needed?

```
Frontend Developer: "What data should I send to the login API?"
Backend Developer:  "Check openapi.yaml, everything is documented there!"
```

---

## 🚀 Quick Start

### 1. **View Documentation Online (Swagger UI)**

Start your development server:
```bash
npm run dev
```

Then open in browser:
```
http://localhost:3000/api-docs
```

You'll see an **interactive documentation** where you can:
- 📖 Read all endpoints
- 🧪 Test APIs directly
- 📝 See examples
- 🔐 Try authentication

### 2. **View Raw Specification**

Open the YAML file:
```bash
cat docs/api/openapi.yaml
```

### 3. **Import in Postman**

1. Open Postman
2. Click **Import**
3. Choose `docs/api/openapi.yaml`
4. All endpoints automatically loaded! 🎉

---

## 📊 API Overview

### Base URL
```
Development:  http://localhost:3000/api/v1
Production:   https://api.resumeletterai.com/api/v1
```

### API Modules

| Module | Description | Endpoints |
|--------|-------------|-----------|
| **Health** | System health checks | `GET /health` |
| **Authentication** | User login/signup | `POST /auth/register`, `/auth/login` |
| **Users** | User profile management | `GET /users/me`, `PATCH /users/me` |
| **Templates** | Resume templates CRUD | `GET /templates`, `POST /templates` |
| **Reviews** | Template reviews | `GET /templates/{id}/reviews` |

### Response Format

**All responses follow this format:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

---

## 🔐 Authentication

### How It Works

1. **Register/Login** → Get JWT token
2. **Include token** in all protected requests
3. **Token expires** → Use refresh token

### Getting a Token

**Register:**
```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": { ... },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 900
    }
  }
}
```

### Using the Token

Include in **Authorization header**:
```bash
GET /api/v1/users/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Expiry

- **Access Token:** 15 minutes
- **Refresh Token:** 7 days

**When access token expires:**
```bash
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token-here"
}
```

---

## 📍 Available Endpoints

### Health Check
```
GET /health                    # Check API health
```

### Authentication
```
POST   /auth/register          # Create new account
POST   /auth/login             # Login to account
POST   /auth/refresh           # Refresh access token
POST   /auth/logout            # Logout (requires auth)
```

### Users
```
GET    /users/me               # Get current user profile
PATCH  /users/me               # Update user profile
PUT    /users/me/password      # Change password
```

### Templates
```
GET    /templates              # List all templates (with filters)
POST   /templates              # Create new template (admin/creator)
GET    /templates/{id}         # Get single template
PATCH  /templates/{id}         # Update template (admin/creator)
DELETE /templates/{id}         # Delete template (admin)
GET    /templates/{id}/preview # Get template preview
```

### Reviews
```
GET    /templates/{id}/reviews # Get template reviews
POST   /templates/{id}/reviews # Create review (requires auth)
PATCH  /reviews/{id}           # Update own review
DELETE /reviews/{id}           # Delete own review
```

---

## 📝 Request & Response Examples

### Example 1: Register User

**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "2025-10-07T10:30:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGci...",
      "refreshToken": "eyJhbGci...",
      "expiresIn": 900
    }
  }
}
```

### Example 2: Get Templates (with filters)

**Request:**
```bash
curl -X GET "http://localhost:3000/api/v1/templates?category=professional&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Templates retrieved successfully",
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Modern Professional",
      "description": "Clean and modern design",
      "category": "professional",
      "tags": ["modern", "clean", "ats-friendly"],
      "averageRating": 4.5,
      "reviewCount": 125,
      "downloadCount": 1250,
      "isPremium": false,
      "createdAt": "2025-10-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "totalItems": 48,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Example 3: Create Review

**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/templates/507f1f77bcf86cd799439011/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "rating": 5,
    "comment": "Excellent template! Very professional and easy to customize."
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Review created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "templateId": "507f1f77bcf86cd799439011",
    "userId": {
      "id": "507f1f77bcf86cd799439010",
      "name": "John Doe"
    },
    "rating": 5,
    "comment": "Excellent template! Very professional and easy to customize.",
    "helpfulCount": 0,
    "createdAt": "2025-10-07T10:35:00Z"
  }
}
```

---

## ❌ Error Handling

### Error Response Format

All errors follow this structure:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Common HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| **200** | OK | Request successful |
| **201** | Created | Resource created successfully |
| **204** | No Content | Resource deleted successfully |
| **400** | Bad Request | Validation error |
| **401** | Unauthorized | Token missing or invalid |
| **403** | Forbidden | Insufficient permissions |
| **404** | Not Found | Resource not found |
| **409** | Conflict | Resource already exists |
| **500** | Server Error | Internal server error |

### Example Errors

#### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

#### Unauthorized (401)
```json
{
  "success": false,
  "message": "Please login to continue"
}
```

#### Not Found (404)
```json
{
  "success": false,
  "message": "Template not found"
}
```

---

## 🧪 Testing the API

### Option 1: Swagger UI

1. Start server: `npm run dev`
2. Open: `http://localhost:3000/api-docs`
3. Click on any endpoint
4. Click **"Try it out"**
5. Fill in parameters
6. Click **"Execute"**
7. See response! 🎉

### Option 2: cURL

```bash
# Health check
curl http://localhost:3000/api/v1/health

# Register user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"Pass123!"}'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Pass123!"}'

# Get templates (with token)
curl http://localhost:3000/api/v1/templates \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Option 3: Postman

1. Import `docs/api/openapi.yaml`
2. Create environment with `baseUrl` variable
3. Set `Authorization` in collection settings
4. Start testing! 🚀

### Option 4: JavaScript/Fetch

```javascript
// Register user
const response = await fetch('http://localhost:3000/api/v1/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'SecurePass123!'
  })
});

const data = await response.json();
console.log(data);
```

---

## 🔄 Rate Limiting

### Limits

| User Type | Limit |
|-----------|-------|
| **Anonymous** | 10 requests/minute |
| **Authenticated** | 100 requests/minute |
| **Write Operations** | 10 requests/minute |

### Rate Limit Headers

Response includes:
```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1633024800
```

### When Exceeded

**Response (429 Too Many Requests):**
```json
{
  "success": false,
  "message": "Too many requests, please try again later",
  "retryAfter": 60
}
```

---

## 💡 FAQs

### Q: How do I get started?
**A:** Start with `/auth/register` to create an account, then use `/auth/login` to get a token.

### Q: Where do I put the token?
**A:** In the `Authorization` header: `Authorization: Bearer YOUR_TOKEN`

### Q: Token expired, what to do?
**A:** Use `/auth/refresh` endpoint with your refresh token to get a new access token.

### Q: Can I test without authentication?
**A:** Yes! Health check and template listing endpoints don't require auth.

### Q: How do I filter templates?
**A:** Use query parameters: `/templates?category=professional&page=1&limit=10`

### Q: Can I upload images?
**A:** Not yet implemented in this version. Coming soon!

### Q: How to update my profile?
**A:** Use `PATCH /users/me` with the fields you want to update.

### Q: How to delete a review?
**A:** Use `DELETE /reviews/{id}` - you can only delete your own reviews.

---

## 📚 Additional Resources

### Files in this folder:
```
docs/api/
├── openapi.yaml          ← Complete API specification
└── README.md             ← This file
```

### Related Documentation:
- **Backend Code:** `src/app.js` - Express app configuration
- **Environment Variables:** `.env.example` - Required configurations
- **Error Handling:** `src/shared/middleware/errorHandler.js`

### External Links:
- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)
- [JWT Authentication](https://jwt.io/)

---

## 🆘 Support

**Need help?**
- 📧 Email: support@resumeletterai.com
- 💬 GitHub Issues: [Create an issue](https://github.com/yourrepo/issues)
- 📖 Swagger UI: `http://localhost:3000/api-docs`

---

## 📝 Updates

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-10-07 | Initial API release |

---

**Happy Coding! 🚀**

---

> **Note:** This API is under active development. Features and endpoints may change.