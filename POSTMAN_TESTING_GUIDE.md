# Postman Testing Guide - CourierPro API

## ✅ Updated: Cookie-Based Authentication Supported!

Your API now supports **BOTH** authentication methods:
1. **Cookie-based** (automatic after login)
2. **Bearer Token** (manual header setup)

---

## Method 1: Cookie-Based Authentication (Recommended)

### Step 1: Login
```
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

Body (raw JSON):
{
  "email": "sender@example.com",
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
      "name": "John Sender",
      "email": "sender@example.com",
      "role": "SENDER"
    }
  }
}
```

✅ **Cookies are automatically set!** Check Postman's **Cookies** tab (below Send button)

### Step 2: Create Parcel (Using Cookies - No Manual Token Needed!)

```
POST http://localhost:5000/api/v1/parcel/create
Content-Type: application/json

Body (raw JSON):
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

**✅ No Authorization header needed!** Cookies are sent automatically.

**Expected Response:**
```json
{
  "statusCode": 201,
  "success": true,
  "message": "Parcel created successfully✅",
  "data": {
    "_id": "67006bc4c9f0a2e3f8d1234a",
    "trackingId": "TRK-20251004-456789",
    "senderId": "67006bc4c9f0a2e3f8d1234a",
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
    "fee": 90,
    "currentStatus": "REQUESTED",
    "statusHistory": [
      {
        "status": "REQUESTED",
        "timestamp": "2025-10-04T17:30:00.000Z",
        "updatedBy": "67006bc4c9f0a2e3f8d1234a",
        "note": "Parcel request created by sender"
      }
    ],
    "isBlocked": false,
    "expectedDeliveryDate": "2025-10-10T10:00:00.000Z",
    "createdAt": "2025-10-04T17:30:00.000Z",
    "updatedAt": "2025-10-04T17:30:00.000Z"
  }
}
```

---

## Method 2: Bearer Token Authentication (Alternative)

If cookies don't work or you prefer headers:

### Step 1: Login (same as above)

### Step 2: Copy Access Token from Response

### Step 3: Set Authorization Header
- Go to **Authorization** tab in Postman
- Type: **Bearer Token**
- Token: Paste the `accessToken` from login response

### Step 4: Create Parcel (same request body as above)

---

## All Available Endpoints

### 1. User Registration
```
POST http://localhost:5000/api/v1/user/register
Content-Type: application/json

{
  "name": "John Sender",
  "email": "sender@example.com",
  "password": "password123",
  "phone": "01712345678"
}
```

### 2. User Login
```
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "email": "sender@example.com",
  "password": "password123"
}
```

### 3. Create Parcel (SENDER only)
```
POST http://localhost:5000/api/v1/parcel/create
[Requires Authentication]
```

### 4. Get My Parcels (SENDER only)
```
GET http://localhost:5000/api/v1/parcel/my-parcels
[Requires Authentication]
```

### 5. Get Parcel by ID (SENDER only)
```
GET http://localhost:5000/api/v1/parcel/67006bc4c9f0a2e3f8d1234a
[Requires Authentication]
```

### 6. Track Parcel (Public - No Auth)
```
GET http://localhost:5000/api/v1/parcel/track/TRK-20251004-456789
```

### 7. Logout
```
POST http://localhost:5000/api/v1/auth/logout
[Requires Authentication]
```

---

## Important Notes

### ✅ Receiver Does NOT Need to Be Registered
- **receiverInfo** is just contact information
- You can send parcels to anyone with a phone and address
- No need for receiver to have an account

### ✅ Default Role is SENDER
- All registered users automatically get `SENDER` role
- They can create parcels immediately after registration

### ✅ Fee Calculation (Automatic)
- **Base Price:** 50 BDT
- **Weight ≤ 1kg:** 50 BDT only
- **Weight > 1kg:** 50 BDT + (20 BDT × additional kg)

**Examples:**
- 0.5 kg → 50 BDT
- 1.0 kg → 50 BDT
- 2.5 kg → 50 + (2 × 20) = 90 BDT
- 5.0 kg → 50 + (4 × 20) = 130 BDT

### ✅ Tracking ID (Auto-generated)
- Format: `TRK-YYYYMMDD-XXXXXX`
- Example: `TRK-20251004-456789`
- Unique for every parcel

---

## Testing Workflow

1. **Register a user** → Gets SENDER role automatically
2. **Login** → Cookies are set automatically
3. **Create parcels** → No manual token setup needed
4. **Track parcels** → Use tracking ID (public access)

---

## Troubleshooting

### Error: "No Token received"
- Make sure you're logged in
- Check if cookies are enabled in Postman
- Alternative: Use Bearer Token method

### Error: "You are not authorized"
- Token might be expired
- Login again to get new token
- Check if your role is SENDER

### Error: Validation errors
- Check phone number format (must be Bangladeshi: 01XXXXXXXXX)
- Check weight is between 0.1 and 1000 kg
- Check all required fields are provided

---

## Postman Settings

### Enable Cookies
1. Go to **Settings** (gear icon)
2. Ensure **"Automatically follow redirects"** is ON
3. Ensure **"Send cookies"** is ON

### View Cookies
1. Click **Cookies** link (below Send button)
2. You'll see `accessToken` and `refreshToken` after login

---

Happy Testing! 🚀📦
