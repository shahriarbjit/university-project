# NSU Portal - Full Stack Student Management System
## Project Documentation

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Setup & Installation](#setup--installation)
5. [API Endpoints](#api-endpoints)
6. [Authentication & Session Management](#authentication--session-management)
7. [Database Schema](#database-schema)
8. [Features](#features)
9. [Testing](#testing)
10. [Deployment](#deployment)

---

## Project Overview

**NSU Portal** is a production-ready **full-stack** student management system for North South University. It combines a modern React frontend with a Node.js/Express backend and MongoDB Atlas database to provide secure authentication, user management, and student directory features.

### Key Objectives:
- ✅ Full-stack authentication with JWT tokens
- ✅ Secure password hashing with bcryptjs
- ✅ MongoDB Atlas database integration
- ✅ Protected API endpoints with middleware
- ✅ Session persistence across page refreshes
- ✅ Complete CRUD operations with self-protection rules
- ✅ Responsive React SPA with real-time search
- ✅ Production-ready security practices

### Core Capabilities:
- User registration and login with JWT-based sessions
- Student directory with search and filtering
- Admin user creation, update, and deletion (CRUD)
- Self-account protection (cannot delete/edit own account)
- Token refresh and session restoration on page reload
- Real-time database synchronization via REST API

---

## Architecture

### System Design

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser (Client)                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         React SPA (TypeScript)                       │   │
│  │  ├─ Pages: Login, Register, Users, Index            │   │
│  │  ├─ AuthContext: JWT + Session Management           │   │
│  │  └─ localStorage: JWT Token Persistence             │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────┬────────────────────────────────────┘
                       │
                  HTTP/REST + JWT Bearer Token
                       │
┌──────────────────────▼────────────────────────────────────┐
│            Node.js/Express Server                         │
│  ├─ POST   /api/auth/register    (Create user + JWT)     │
│  ├─ POST   /api/auth/login       (Generate JWT)          │
│  ├─ GET    /api/auth/me          (Restore session)       │
│  ├─ GET    /api/users            (List all users)        │
│  ├─ POST   /api/users            (Create user)           │
│  ├─ PUT    /api/users/:id        (Update user)           │
│  └─ DELETE /api/users/:id        (Delete user)           │
└──────────────────────┬────────────────────────────────────┘
                       │
                  MongoDB Driver
                       │
┌──────────────────────▼────────────────────────────────────┐
│         MongoDB Atlas (Cloud Database)                    │
│  Database: nsu_portal                                     │
│  Collection: users (email unique, passwordHash indexed)   │
└────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 18.3.1 | UI component library |
| **React Router** | 6.30.1 | Client-side routing |
| **TypeScript** | 5.9.2 | Type-safe JavaScript |
| **Vite** | 8.0.2 | Dev server & build tool |
| **Tailwind CSS** | 3.4.17 | Utility-first styling |
| **Lucide React** | 0.539.0 | Icon library |

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | 20+ | JavaScript runtime |
| **Express** | 5.1.0 | Web server framework |
| **TypeScript** | 5.9.2 | Type-safe backend code |
| **MongoDB** | 7.2.0 | Database driver |
| **bcryptjs** | 3.0.3 | Password hashing |
| **jsonwebtoken** | 9.0.3 | JWT token generation |
| **dotenv** | 17.2.1 | Environment variables |

### Database

| Service | Purpose |
|---------|---------|
| **MongoDB Atlas** | Cloud-hosted NoSQL database |
| **Database Name** | `nsu_portal` |
| **Authentication** | Username/password + IP whitelist |

---

## Technology Stack

### Frontend Framework & Libraries

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 18.3.1 | UI component library and state management |
| **React Router** | 6.30.1 | Client-side routing and navigation |
| **TypeScript** | 5.9.2 | Type-safe JavaScript |
| **Vite** | 8.0.2 | Fast build tool and dev server |

### Styling & UI Components

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Tailwind CSS** | 3.4.17 | Utility-first CSS framework |
| **Lucide React** | 0.539.0 | Beautiful icon library |
| **Radix UI** | Latest | Unstyled, accessible components |

### Development Tools

| Tool | Version | Purpose |
|------|---------|---------|
| **NPM** | 10+ | Package manager |
| **TypeScript** | 5.9.2 | Static type checking |
| **Vitest** | 4.1.0 | Unit testing framework |

---

## Features

### 1. Authentication System (API-Backed)

#### Registration with JWT
- **Endpoint**: `POST /api/auth/register`
- **Creates user in MongoDB** with bcrypt-hashed password
- **Returns JWT token** valid for 7 days
- **Email validation** & uniqueness check
- **Password minimum 6 characters**

#### Login with JWT
- **Endpoint**: `POST /api/auth/login`
- **Credentials validated** against bcrypt hash
- **Returns new JWT token** on success
- **Supports session restoration** via /api/auth/me

#### Session Management
- **localStorage persistence**: JWT stored in browser
- **Automatic session restore**: Called on page load
- **Token header**: All protected endpoints require `Authorization: Bearer <token>`
- **7-day expiration**: Tokens expire after 7 days

### 2. User Management (CRUD)

#### List Users
- **Endpoint**: `GET /api/users` (requires auth)
- **Returns**: Array of all users from MongoDB
- **Display**: Real-time student directory

#### Create User
- **Endpoint**: `POST /api/users` (requires auth)
- **By**: Any authenticated user
- **Validation**: Email unique, password min 6 chars
- **Stores**: Hashed password in database

#### Update User
- **Endpoint**: `PUT /api/users/:id` (requires auth)
- **Self-protection**: Cannot update own account
- **Updates**: Name, email, password
- **Returns**: Updated user object

#### Delete User
- **Endpoint**: `DELETE /api/users/:id` (requires auth)
- **Self-protection**: Cannot delete own account
- **Permanent**: User removed from database
- **Confirmation**: Frontend shows confirm dialog

### 3. Student Directory (Protected Page)

- **Search**: Real-time filter by name or email
- **Display**: Card-based grid layout
- **Statistics**: Total users, search results count
- **Self Badge**: "You" indicator for current user
- **Edit/Delete**: Available for all users except self
- **Protected**: Requires authentication to access

---

## Setup & Installation

### Prerequisites

- **Node.js**: 20.19.0 or higher
- **NPM**: 10.0.0 or higher
- **MongoDB Atlas Account**: Free tier available
- **Git**: For cloning repository

### Step 1: Clone & Install

```bash
git clone <repository-url>
cd project-react
npm install
```

### Step 2: Configure MongoDB Atlas

1. Create free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create database user in Security → Database Access
3. Add IP to Network Access (use 0.0.0.0/0 for dev)
4. Copy connection string from Cluster → Connect → Drivers
5. Get credentials: username & password

### Step 3: Create .env File

```bash
cp .env.example .env
```

Edit `.env` with your MongoDB credentials:

```env
# MongoDB Atlas Connection
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/?appName=Cluster0"
MONGODB_DB_NAME="nsu_portal"

# JWT Secret (change in production!)
JWT_SECRET="your-super-secret-jwt-key"
```

### Step 4: Start Dev Server

```bash
npm run dev
```

Server runs at http://localhost:8080 (or next available port)

### Step 5: Test Registration

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@nsu.edu","password":"Test1234","fullName":"Test User"}'
```

---

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/register
```
Request:
{
  "email": "student@nsu.edu",
  "password": "SecurePass123",
  "fullName": "John Doe"
}

Response: 201 Created
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "student@nsu.edu",
    "fullName": "John Doe",
    "createdAt": "2026-05-03"
  }
}
```

#### POST /api/auth/login
```
Request:
{
  "email": "student@nsu.edu",
  "password": "SecurePass123"
}

Response: 200 OK (Same as register)
```

#### GET /api/auth/me
```
Header: Authorization: Bearer <token>

Response: 200 OK
{
  "user": { ... }
}
```

### User Management Endpoints

#### GET /api/users
```
Header: Authorization: Bearer <token>

Response: 200 OK
{
  "users": [
    {
      "id": "507f1f77bcf86cd799439011",
      "email": "student@nsu.edu",
      "fullName": "John Doe",
      "createdAt": "2026-05-03"
    }
  ]
}
```

#### POST /api/users
```
Header: Authorization: Bearer <token>
Body: { "email": "...", "password": "...", "fullName": "..." }

Response: 201 Created
{ "user": { ... } }
```

#### PUT /api/users/:id
```
Header: Authorization: Bearer <token>
Body: { "fullName": "Updated", "password": "..." }

Response: 200 OK
{ "user": { ... } }

Error 403: Cannot update own account
```

#### DELETE /api/users/:id
```
Header: Authorization: Bearer <token>

Response: 200 OK
{ "ok": true }

Error 403: Cannot delete own account
```

---

## Authentication & Session Management

### JWT Token Flow

```
User Registration/Login
         ↓
Server validates credentials
         ↓
Server generates JWT with:
  - Payload: { userId, email }
  - Expires: 7 days
  - Secret: JWT_SECRET from .env
         ↓
Client stores token in localStorage
  - Key: "nsu_portal_auth_token"
         ↓
Client sends token in requests
  - Header: "Authorization: Bearer <token>"
         ↓
Server verifies token on every request
  - Valid: Process request
  - Invalid: Return 401 Unauthorized
         ↓
On page refresh:
  1. Client reads localStorage
  2. Client calls /api/auth/me
  3. Server validates token
  4. Session restored
```

### Session Persistence Implementation

**Frontend (React)**:
```typescript
// AuthContext hooks on mount
useEffect(() => {
  const token = localStorage.getItem("nsu_portal_auth_token");
  if (!token) return;
  
  // Fetch current user
  fetch("/api/auth/me", {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(res => res.json())
  .then(data => setCurrentUser(data.user));
}, []);
```

### Security Features

- ✅ **Password Hashing**: bcryptjs (10 salt rounds)
- ✅ **JWT Expiration**: 7 days
- ✅ **Token Verification**: Every protected endpoint
- ✅ **Self-Protection**: Cannot edit/delete own account
- ✅ **Email Uniqueness**: Enforced at database level
- ✅ **CORS Enabled**: Secure cross-origin requests
- ✅ **Environment Secrets**: JWT_SECRET from .env

---

## Database Schema

### MongoDB Collection: users

```
Document Structure:
{
  _id: ObjectId,                  // Auto-generated by MongoDB
  email: String,                  // Unique, lowercase, indexed
  fullName: String,               // User display name
  passwordHash: String,           // bcrypt hashed password
  createdAt: Date,                // Account creation timestamp
}

Indexes:
- email (unique)
- createdAt (ascending)
```

### Example Document

```javascript
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "email": "john.doe@nsu.edu",
  "fullName": "John Doe",
  "passwordHash": "$2a$10$dXJ3SW6G7P50eS3q...",
  "createdAt": ISODate("2026-05-03T08:30:00Z")
}
```

---

## Testing

### Manual Testing Checklist

#### Authentication
- [ ] Register new user with valid data
- [ ] Login returns JWT token
- [ ] Session persists on page refresh
- [ ] Token stored in localStorage
- [ ] Logout clears token
- [ ] Cannot access /users without auth
- [ ] Cannot login with wrong password

#### User Management (CRUD)
- [ ] List users shows all from database
- [ ] Create user adds to MongoDB
- [ ] Update other user works
- [ ] Cannot update own user (403 error)
- [ ] Delete other user removes from DB
- [ ] Cannot delete own user (403 error)
- [ ] Duplicate email rejected

#### UI/UX
- [ ] Search filters users in real-time
- [ ] Edit/Delete buttons only on other users
- [ ] "You" badge on own card
- [ ] Error messages clear and helpful
- [ ] Loading states visible
- [ ] Responsive on all screen sizes

### Testing with cURL

```bash
# Test health
curl http://localhost:8080/api/ping

# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@nsu.edu","password":"Test1234","fullName":"Test User"}'

# Login
RESPONSE=$(curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@nsu.edu","password":"Test1234"}')
TOKEN=$(echo $RESPONSE | jq -r '.token')

# Get current user (session restore)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/auth/me

# List users
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/users

# Create user
curl -X POST http://localhost:8080/api/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"new@nsu.edu","password":"Pass123","fullName":"New User"}'
```

---

## Deployment

### Build for Production

```bash
# Build frontend + backend
npm run build

# Output:
# - dist/spa/     (React SPA)
# - dist/server/  (Express server)
```

### Deployment Options

#### Option 1: Traditional Node.js Server

```bash
npm run build
npm start
# Runs on PORT=3000 (or environment PORT)
```

Set environment variables on server:
```env
NODE_ENV=production
MONGODB_URI=<your-production-uri>
JWT_SECRET=<strong-random-secret>
```

#### Option 2: Netlify Functions

```bash
npm run build
# Deploy dist/ folder to Netlify
# Server runs as serverless function
```

#### Option 3: Docker

```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --production

COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t nsu-portal .
docker run -p 3000:3000 \
  -e MONGODB_URI=<uri> \
  -e JWT_SECRET=<secret> \
  nsu-portal
```

### Production Checklist

- [ ] Change JWT_SECRET to strong random value
- [ ] Enable HTTPS
- [ ] Restrict MongoDB IP access (remove 0.0.0.0/0)
- [ ] Store sensitive vars in platform secrets
- [ ] Set NODE_ENV=production
- [ ] Enable CORS for production domains
- [ ] Implement rate limiting
- [ ] Add CSRF protection
- [ ] Setup monitoring/logging
- [ ] Configure automated backups

---

## Troubleshooting

### Common Issues

**MongoDB Connection Error: "querySrv EBADNAME"**
- Cause: Invalid connection string format
- Fix: Update MONGODB_URI in .env with real credentials
- Format: `mongodb+srv://username:password@cluster.mongodb.net/?appName=Cluster0`

**MongoDB Connection Error: "ECONNREFUSED"**
- Cause: IP not whitelisted in Atlas
- Fix: Go to Security → Network Access → Add 0.0.0.0/0 (dev only)

**"Cannot find module 'bcryptjs'"**
- Cause: Package not installed
- Fix: Run `npm install bcryptjs jsonwebtoken`

**"Token invalid or expired"**
- Cause: Token expired or corrupted
- Fix: Clear localStorage and login again
- Command: `localStorage.removeItem("nsu_portal_auth_token")`

**Port 8080 already in use**
- Cause: Another process using port
- Fix: Vite will try next port automatically (8081, 8082, etc.)
- Or: Kill process on port 8080

**CORS errors in console**
- Cause: Frontend and backend CORS mismatch
- Fix: Check Express CORS middleware in server/index.ts
- Verify: Frontend URL matches CORS allowedOrigins

**Users page shows empty list after login**
- Cause: API call failed or token not sent
- Fix: Check browser Console (F12) for errors
- Verify: Token in localStorage and sent in Authorization header

---

## Development Standards

### Code Organization

- **Functional Components**: All React components use hooks
- **Type Safety**: Full TypeScript across frontend and backend
- **Naming Conventions**: 
  - camelCase for variables/functions
  - PascalCase for components
  - UPPER_CASE for constants
- **File Structure**: Organized by feature (pages, components, context, routes)

### Best Practices

- ✅ Async/await for promises
- ✅ Error handling in API calls
- ✅ Validation on both client and server
- ✅ Responsive design (mobile-first)
- ✅ Secure password handling (bcrypt)
- ✅ JWT tokens in secure headers
- ✅ TypeScript strict mode enabled
- ✅ No credentials in version control

### Backend Route Pattern

```typescript
// File: server/routes/example.ts
import { RequestHandler } from "express";

export const handleExample: RequestHandler = async (req, res) => {
  try {
    // Your logic here
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
```

### Frontend Component Pattern

```typescript
// File: client/pages/Example.tsx
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function Example() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Component logic
  }, []);
  
  return (
    <div>
      {/* JSX here */}
    </div>
  );
}
```

---

## Project Statistics

- **Frontend Lines of Code**: ~2000 (React components)
- **Backend Lines of Code**: ~1500 (Express routes)
- **TypeScript Coverage**: 100%
- **Database Collections**: 1 (users)
- **API Endpoints**: 7
- **Authentication Methods**: JWT Bearer tokens
- **Password Hashing**: bcryptjs (10 rounds)
- **Token Expiration**: 7 days

---

## Performance Optimization

- ✅ **Vite HMR**: Hot module replacement for fast dev
- ✅ **Code Splitting**: Lazy loading of route components
- ✅ **MongoDB Indexing**: Email and createdAt indexed
- ✅ **TailwindCSS Purging**: Production build optimization
- ✅ **React Query Ready**: Optional for caching API responses
- ✅ **Token Caching**: localStorage for reduced API calls

---

## Security Checklist

- [x] **Password Hashing**: bcryptjs with 10 salt rounds
- [x] **JWT Tokens**: 7-day expiration
- [x] **Protected Routes**: Middleware verification
- [x] **Self-Protection**: Cannot CRUD own account
- [x] **Email Uniqueness**: Database constraint
- [x] **Environment Secrets**: JWT_SECRET from .env
- [ ] **Production JWT_SECRET**: Change from default
- [ ] **HTTPS**: Enable in production
- [ ] **MongoDB IP Whitelist**: Restrict access
- [ ] **Rate Limiting**: Implement in future
- [ ] **CSRF Protection**: Add in future
- [ ] **Refresh Tokens**: Implement in future

---

## Future Enhancements

### Short Term
- [ ] Email verification on registration
- [ ] Password reset functionality
- [ ] User profile pictures
- [ ] Edit profile page
- [ ] Dark mode toggle

### Medium Term
- [ ] Role-based access control (Admin/Student)
- [ ] Two-factor authentication (2FA)
- [ ] Activity logging and audit trail
- [ ] Admin dashboard with statistics
- [ ] User search filters (by year, major, etc.)
- [ ] Refresh tokens for better security

### Long Term
- [ ] Messaging system between students
- [ ] Study groups and communities
- [ ] Course management system
- [ ] Calendar and scheduling
- [ ] File upload and sharing
- [ ] Mobile app (React Native)
- [ ] API rate limiting
- [ ] Caching layer (Redis)
- [ ] Batch user import/export
- [ ] Email notifications

---

## Support & Resources

### Official Documentation
- [React Docs](https://react.dev)
- [Express Docs](https://expressjs.com)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com)
- [JWT.io](https://jwt.io) - JWT understanding

### Helpful Links
- [bcryptjs on npm](https://www.npmjs.com/package/bcryptjs)
- [jsonwebtoken on npm](https://www.npmjs.com/package/jsonwebtoken)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### Debugging
1. Check browser Console (F12 → Console)
2. Check Network tab for API errors
3. Check server terminal for logs
4. Use `console.log()` in React components
5. Verify .env file settings

---

**Last Updated**: May 3, 2026  
**Version**: 2.0 (Full Stack with MongoDB Atlas Backend)  
**Status**: ✅ Production Ready (with security hardening for production)

- Reinstall: `npm install`
- Restart dev server

---

## Assignment Checklist

### Requirements Met ✅

- [x] Login page with authentication
- [x] Registration page with validation
- [x] Dummy credentials for testing
- [x] User list display after login
- [x] Frontend-only implementation (no backend)
- [x] State management with React Context
- [x] Modern, responsive design
- [x] Search functionality
- [x] Logout functionality
- [x] Error handling and validation

### Deliverables

1. ✅ **Complete React Application**
   - Login system
   - Registration system
   - Student directory
   - Responsive design

2. ✅ **Documentation**
   - This comprehensive guide
   - Code comments and examples
   - Architecture explanation

3. ✅ **Source Code**
   - Clean, readable code
   - TypeScript for type safety
   - Modular component structure

---

## Credits & References

### Libraries & Frameworks
- React: https://react.dev
- React Router: https://reactrouter.com
- Tailwind CSS: https://tailwindcss.com
- Lucide Icons: https://lucide.dev

### Design Inspiration
- Modern SaaS applications
- University management systems
- Student portal interfaces

### Developer
- **Name**: [Your Name]
- **University**: [University Name]
- **Date**: 2024
- **Course**: Web Development (Lab 9 - Checkpoint 2)

---

## License

This project is created for educational purposes as part of a university course assignment.

---

## Support & Contact

For questions or issues regarding this project:

1. **Documentation**: Read this guide carefully
2. **Code Comments**: Check component comments for details
3. **Developer Console**: Use F12 to check for error messages
4. **Dependencies**: Check package.json for dependency versions

---

## Conclusion

UniPortal successfully demonstrates frontend development skills including:
- React component development
- State management
- Form handling and validation
- Responsive design
- Modern UI/UX practices
- TypeScript usage
- Tailwind CSS styling

The application is production-ready for a frontend-only demo and can be easily extended with backend services for persistent data storage.

---

*Last Updated: 2024*
*Version: 1.0.0*
