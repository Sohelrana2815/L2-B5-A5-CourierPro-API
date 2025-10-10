# 🚚 CourierPro API

A comprehensive **Express.js** and **TypeScript** backend API for a courier delivery management system with JWT authentication, role-based access control, and real-time parcel tracking.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)]()
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)]()
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)]()
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white)]()

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🏗️ Tech Stack](#️-tech-stack)
- [🚀 Quick Start](#-quick-start)
- [⚙️ Environment Setup](#️-environment-setup)
- [📚 API Documentation](#-api-documentation)
- [👥 User Roles & Permissions](#-user-roles--permissions)
- [🔐 Authentication Flow](#-authentication-flow)
- [📦 Database Models](#-database-models)
- [🧪 Testing Guide](#-testing-guide)
- [🏗️ Project Structure](#️-project-structure)
- [🔧 Development](#-development)

---

## ✨ Features

### 🔐 **Authentication & Authorization**
- **JWT-based authentication** with access and refresh tokens
- **Google OAuth 2.0** integration using Passport.js
- **Cookie-based authentication** (automatic token management)
- **Bearer token authentication** (manual header setup)
- **Password reset** functionality with old password verification
- **Secure password hashing** using bcrypt

### 👤 **User Management**
- **Three user roles**: Admin, Sender, Receiver
- **Role-based route protection**
- **User registration** with different requirements per role
- **Admin user management**: Block, unblock, soft delete, restore users
- **User promotion** to admin role
- **Bulk user operations**

### 📦 **Parcel Management**
- **Complete parcel lifecycle** tracking
- **Multiple parcel statuses**: Requested, Approved, Picked Up, In Transit, Delivered, On Hold, Returned
- **Automatic fee calculation** based on weight
- **Unique tracking IDs** (TRK-YYYYMMDD-XXXXXX format)
- **Status history** logging with timestamps

### 🎯 **Dual Receiver System**
- **Registered Receivers**: JWT-authenticated users with full access
- **Guest Receivers**: Phone number-based access (no registration required)
- **Guest parcel operations**: Track, approve, cancel by phone + tracking ID

### 🛡️ **Admin Controls**
- **Complete system oversight**
- **User and parcel management**
- **Status transition control**
- **Bulk operations support**

---

## 🏗️ Tech Stack

| **Technology** | **Purpose** | **Version** |
|---|---|---|
| **TypeScript** | Type-safe JavaScript | `^5.9.2` |
| **Express.js** | Web framework | `^5.1.0` |
| **MongoDB** | Database | `^8.18.2` |
| **Mongoose** | ODM | `^8.18.2` |
| **JWT** | Authentication | `^9.0.2` |
| **bcryptjs** | Password hashing | `^3.0.2` |
| **Passport.js** | Google OAuth | `^0.7.0` |
| **Zod** | Schema validation | `^4.1.11` |
| **CORS** | Cross-origin requests | `^2.8.5` |
| **Cookie Parser** | Cookie handling | `^1.4.7` |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (local or cloud instance)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sohelrana2815/L2-B5-A5-CourierPro-API
   cd courierpro-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Start the server**
   ```bash
   npm run dev
   ```

The API will be running at `http://localhost:5000`

---

## ⚙️ Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# Database
DB_URL=mongodb://localhost:27017/courierpro

# Server
PORT=5000

# JWT Secrets
ACCESS_TOKEN_SECRET=your-super-secret-access-token-key
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Session Secret
SESSION_SECRET=your-session-secret

# Node Environment
NODE_ENV=development
```

### Google OAuth Setup (Optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:5000/api/v1/auth/google/callback`
6. Copy Client ID and Client Secret to `.env`

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### 🔐 Authentication Endpoints

#### **User Registration**
```http
POST /user/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "01712345678",
  "role": "SENDER" // Optional, defaults to SENDER
}
```

#### **User Login**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User Logged In Successfully✅",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "SENDER"
    }
  }
}
```

#### **Google OAuth Login**
```http
GET /auth/google?role=SENDER
```

#### **Token Refresh**
```http
POST /auth/refresh-token
Cookie: refreshToken=your-refresh-token
```

#### **Password Reset**
```http
POST /auth/reset-password
Authorization: Bearer <access_token>

{
  "oldPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

#### **Logout**
```http
POST /auth/logout
Authorization: Bearer <access_token>
```

---

### 📦 Parcel Management Endpoints

#### **Create Parcel** (Sender Only)
```http
POST /parcel/create
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "receiverInfo": {
    "name": "Jane Receiver",
    "phone": "01812345678",
    "address": "123 Main Street, Mirpur, Dhaka",
    "city": "Dhaka"
  },
  "parcelDetails": {
    "type": "Electronics",
    "weightKg": 2.5,
    "description": "Mobile phone and accessories"
  },
  "expectedDeliveryDate": "2025-10-10T10:00:00.000Z"
}
```

#### **Get My Parcels** (Sender Only)
```http
GET /parcel/sender/my-parcels
Authorization: Bearer <access_token>
```

#### **Get Parcel by ID** (Sender Only)
```http
GET /parcel/:id
Authorization: Bearer <access_token>
```

#### **Cancel Parcel** (Sender Only)
```http
PATCH /parcel/:id/cancel
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "reason": "Changed my mind"
}
```

#### **Track Parcel** (Public)
```http
GET /parcel/track/:trackingId
```

#### **Verify Parcel with Phone** (Guest)
```http
POST /parcel/track/:trackingId/verify
Content-Type: application/json

{
  "phone": "01812345678"
}
```

#### **Get Incoming Parcels by Phone** (Guest)
```http
POST /parcel/incoming
Content-Type: application/json

{
  "phone": "01812345678"
}
```

---

### 👤 Admin Endpoints

#### **Get All Users**
```http
GET /user/all-users
Authorization: Bearer <admin_access_token>
```

#### **Promote User to Admin**
```http
PATCH /user/:id/promote-to-admin
Authorization: Bearer <admin_access_token>
```

#### **Block User**
```http
PATCH /user/:id/block
Authorization: Bearer <admin_access_token>
```

#### **Get All Parcels**
```http
GET /parcel/admin/all
Authorization: Bearer <admin_access_token>
```

#### **Update Parcel Status** (Admin Only)
```http
PATCH /parcel/admin/:id/pickup
Authorization: Bearer <admin_access_token>
```

Available status transitions:
- `pickup` - REQUESTED → PICKED_UP
- `start-transit` - PICKED_UP → IN_TRANSIT
- `deliver` - IN_TRANSIT → DELIVERED
- `hold` - Any status → ON_HOLD
- `return` - Any status → RETURNED

#### **Block/Unblock Parcel**
```http
PATCH /parcel/admin/:id/block
PATCH /parcel/admin/:id/unblock
Authorization: Bearer <admin_access_token>
```

---

### 🎯 Receiver Endpoints

#### **Get My Parcels** (Registered Receiver)
```http
GET /parcel/my-parcels
Authorization: Bearer <receiver_access_token>
```

#### **Approve Parcel** (Registered Receiver)
```http
PATCH /parcel/receiver/:id/approve
Authorization: Bearer <receiver_access_token>
```

#### **Cancel Parcel** (Registered Receiver)
```http
PATCH /parcel/receiver/:id/cancel
Authorization: Bearer <receiver_access_token>
Content-Type: application/json

{
  "reason": "Not expecting this delivery"
}
```

#### **Approve Parcel** (Guest)
```http
PATCH /parcel/guest/:id/approve
Content-Type: application/json

{
  "phone": "01812345678"
}
```

---

## 👥 User Roles & Permissions

### 🔴 **Admin**
- **Complete system access**
- **User management**: Block, unblock, delete, restore, promote users
- **Parcel management**: View all, update status, block/unblock parcels
- **Bulk operations** support

### 🟡 **Sender**
- **Create parcels** with receiver information
- **View own parcels** and status history
- **Cancel parcels** (if not dispatched)
- **Track own parcels**

### 🟢 **Receiver**
- **View incoming parcels** (registered users)
- **Approve/cancel parcels** (registered users)
- **Guest access**: Track by phone + tracking ID

---

## 🔐 Authentication Flow

### **JWT Token System**
1. **Access Token**: Short-lived (15 minutes) for API access
2. **Refresh Token**: Long-lived (7 days) for obtaining new access tokens
3. **Automatic token refresh** via cookies

### **Cookie vs Bearer Token**
- **Cookies**: Automatic token management (recommended)
- **Bearer Token**: Manual header setup (alternative method)

### **Password Security**
- **bcrypt hashing** with salt rounds
- **Old password verification** for resets
- **Secure token storage** in HTTP-only cookies

---

## 📦 Database Models

### **User Model**
```typescript
{
  _id: ObjectId,
  name: string,
  email: string,
  password?: string, // Hashed
  phone?: string,
  role: 'SENDER' | 'RECEIVER' | 'ADMIN',
  address?: string,
  city?: string,
  picture?: string,
  accountStatus: 'ACTIVE' | 'INACTIVE' | 'BLOCKED',
  isDeleted: boolean,
  isVerified: boolean,
  auths: AuthProvider[],
  createdParcels?: ObjectId[]
}
```

### **Parcel Model**
```typescript
{
  _id: ObjectId,
  trackingId: string, // Auto-generated: TRK-YYYYMMDD-XXXXXX
  senderId: ObjectId,
  receiverInfo: {
    name: string,
    phone: string,
    address: string,
    city: string
  },
  parcelDetails: {
    type: string,
    weightKg: number,
    description: string
  },
  fee: number, // Auto-calculated
  currentStatus: 'REQUESTED' | 'APPROVED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'ON_HOLD' | 'RETURNED',
  statusHistory: [{
    status: string,
    timestamp: Date,
    updatedBy: ObjectId,
    note?: string
  }],
  isBlocked: boolean,
  expectedDeliveryDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### **Fee Calculation**
- **Base Price**: 50 BDT
- **Weight ≤ 1kg**: 50 BDT only
- **Weight > 1kg**: 50 BDT + (20 BDT × additional kg)

**Examples:**
- 0.5 kg → 50 BDT
- 1.0 kg → 50 BDT
- 2.5 kg → 50 + (2 × 20) = 90 BDT
- 5.0 kg → 50 + (4 × 20) = 130 BDT

---

## 🧪 Testing Guide

### **Using Postman**

1. **Import the collection** or manually create requests
2. **Enable cookies** in Postman settings
3. **Login first** to get authentication tokens
4. **Use cookie authentication** (recommended) or Bearer tokens

### **Testing Workflow**

#### **1. User Registration & Login**
```bash
# Register a sender
POST http://localhost:5000/api/v1/user/register
{
  "name": "John Sender",
  "email": "sender@example.com",
  "password": "password123",
  "phone": "01712345678"
}

# Login
POST http://localhost:5000/api/v1/auth/login
{
  "email": "sender@example.com",
  "password": "password123"
}
```

#### **2. Create & Track Parcels**
```bash
# Create parcel
POST http://localhost:5000/api/v1/parcel/create
{
  "receiverInfo": {
    "name": "Jane Receiver",
    "phone": "01812345678",
    "address": "123 Main Street, Mirpur, Dhaka",
    "city": "Dhaka"
  },
  "parcelDetails": {
    "type": "Electronics",
    "weightKg": 2.5,
    "description": "Mobile phone and accessories"
  },
  "expectedDeliveryDate": "2025-10-10T10:00:00.000Z"
}

# Track parcel (public)
GET http://localhost:5000/api/v1/parcel/track/TRK-20251004-456789

# Guest verify parcel
POST http://localhost:5000/api/v1/parcel/track/TRK-20251004-456789/verify
{
  "phone": "01812345678"
}
```

#### **3. Admin Operations**
```bash
# Get all users (admin only)
GET http://localhost:5000/api/v1/user/all-users

# Update parcel status (admin only)
PATCH http://localhost:5000/api/v1/parcel/admin/{parcelId}/pickup
```

### **Sample Test Data**

#### **Users**
```json
// Admin User (created automatically on first run)
{
  "name": "Super Admin",
  "email": "admin@courierpro.com",
  "role": "ADMIN"
}

// Test Sender
{
  "name": "John Sender",
  "email": "sender@example.com",
  "role": "SENDER"
}

// Test Receiver
{
  "name": "Jane Receiver",
  "email": "receiver@example.com",
  "role": "RECEIVER"
}
```

---

## 🏗️ Project Structure

```
courierpro-api/
├── src/
│   ├── app/
│   │   ├── config/          # Database & environment config
│   │   ├── errorHelpers/    # Error handling utilities
│   │   ├── helpers/         # Helper functions
│   │   ├── interfaces/      # TypeScript interfaces
│   │   ├── middlewares/     # Authentication & validation
│   │   ├── modules/         # Feature modules
│   │   │   ├── auth/        # Authentication logic
│   │   │   ├── parcel/      # Parcel management
│   │   │   └── user/        # User management
│   │   ├── routes/          # Route definitions
│   │   └── utils/           # Utility functions
│   ├── server.ts            # Server entry point
│   └── app.ts               # Express app setup
├── dist/                    # Compiled JavaScript
├── package.json
├── tsconfig.json
├── .env                     # Environment variables
└── README.md
```

---

## 🔧 Development

### **Available Scripts**

```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Run tests
npm test
```

### **Code Quality**
- **ESLint** for code linting
- **TypeScript** for type safety
- **Zod** for runtime validation
- **Prettier** recommended for formatting

### **Database**
- **MongoDB** with Mongoose ODM
- **Connection pooling**
- **Error handling** for connection failures

### **Security Features**
- **Helmet** integration ready
- **CORS** configured
- **Rate limiting** ready for implementation
- **Input validation** with Zod schemas

---

## 📞 Support

For support and questions:
- 📧 Email: sohel152302@gamil.com

---

## 📄 License

This project is licensed under the ISC License.

---

**🎉 Happy Coding! May your parcels always find their way! 🚚💨**
