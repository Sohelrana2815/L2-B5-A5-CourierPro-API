# Parcel Module - API Documentation

## Overview
This module handles parcel creation and management for senders in the CourierPro API.

## Files Created
1. **parcel.service.ts** - Business logic for parcel operations
2. **parcel.controller.ts** - Request handlers
3. **parcel.route.ts** - API route definitions

## Features Implemented

### 1. Create Parcel (Sender Only)
- **Endpoint**: `POST /api/parcel/create`
- **Auth**: Required (SENDER role)
- **Validation**: Uses `createParcelZodSchema`
- **Functionality**:
  - Automatically calculates delivery fee based on weight
  - Generates unique tracking ID (format: TRK-YYYYMMDD-XXXXXX)
  - Creates initial status log with REQUESTED status
  - Associates parcel with authenticated sender

**Fee Calculation Logic**:
- Base price: 50 BDT
- ≤ 1kg: Base price only
- > 1kg: Base price + 20 BDT per additional kg

**Request Body**:
```json
{
  "receiverInfo": {
    "name": "John Doe",
    "phone": "01712345678",
    "address": "123 Main Street, Dhaka",
    "city": "Dhaka"
  },
  "parcelDetails": {
    "type": "Electronics",
    "weightKg": 2.5,
    "description": "Mobile phone and accessories"
  },
  "expectedDeliveryDate": "2025-10-10T10:00:00.000Z" // Optional
}
```

**Response**:
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Parcel created successfully✅",
  "data": {
    "_id": "...",
    "trackingId": "TRK-20251004-123456",
    "senderId": "...",
    "receiverInfo": {...},
    "parcelDetails": {...},
    "fee": 90,
    "currentStatus": "REQUESTED",
    "statusHistory": [...],
    "createdAt": "2025-10-04T15:44:38.000Z"
  }
}
```

### 2. Get My Parcels (Sender Only)
- **Endpoint**: `GET /api/parcel/my-parcels`
- **Auth**: Required (SENDER role)
- **Functionality**: Returns all parcels created by the authenticated sender, sorted by creation date (newest first)

### 3. Get Parcel by ID (Sender Only)
- **Endpoint**: `GET /api/parcel/:id`
- **Auth**: Required (SENDER role)
- **Functionality**: Returns a specific parcel. Only the sender who created it can view it.

### 4. Track Parcel by Tracking ID (Public)
- **Endpoint**: `GET /api/parcel/track/:trackingId`
- **Auth**: Not required (public)
- **Functionality**: Anyone can track a parcel using the tracking ID

## Security Features
- Role-based access control (only SENDER can create parcels)
- Authorization checks ensure senders can only view their own parcels
- JWT authentication for protected routes

## Database Schema
The parcel model includes:
- Auto-generated tracking ID
- Sender and receiver information
- Parcel details (type, weight, description)
- Calculated delivery fee
- Status tracking with history
- Timestamps (createdAt, updatedAt)

## Next Steps for Extension
To complete the system, you can add:
1. Admin/Manager routes for updating parcel status
2. Receiver routes for viewing received parcels
3. Pagination and filtering for parcel lists
4. Parcel cancellation functionality
5. Delivery confirmation features
