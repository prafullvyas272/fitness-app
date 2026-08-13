# Assigned PTs API Documentation

## Overview
This document describes the API endpoints for managing and viewing assigned Performance Trainers (PTs/Trainers) for mentors.

## Authentication
All endpoints require a valid JWT token with Mentor role. Use the mentor login endpoint to obtain a token:

```bash
POST /api/auth/mentor/login
{
  "email": "mentor@fitness.com",
  "password": "Mentor123"
}
```

## Endpoints

### 1. Get All Assigned PTs

**Endpoint:** `GET /api/mentor/assigned-pts`

**Authentication:** Required (Bearer Token)

**Query Parameters:**
- `page` (integer, optional, default: 1) - Page number for pagination
- `limit` (integer, optional, default: 10) - Number of results per page
- `status` (string, optional) - Filter by status: "active", "inactive", "pending"
- `sort` (string, optional, default: "name") - Sort by: "name", "rating", "clients"

**Request Example:**
```bash
curl -X GET "http://localhost:3000/api/mentor/assigned-pts?page=1&limit=10&sort=name" \
  -H "Authorization: Bearer YOUR_MENTOR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Assigned PTs fetched successfully",
  "data": {
    "pts": [
      {
        "id": "pt_001",
        "name": "John Doe",
        "email": "john@fitness.com",
        "phone": "+1234567890",
        "specialization": "Strength Training",
        "certification": "NASM-CPT",
        "experience": 5,
        "rating": 4.8,
        "totalClients": 24,
        "activeClients": 18,
        "joinDate": "2023-06-15",
        "status": "active",
        "avatar": "https://i.pravatar.cc/150?img=12"
      },
      {
        "id": "pt_002",
        "name": "Sarah Johnson",
        "email": "sarah@fitness.com",
        "phone": "+1234567890",
        "specialization": "Weight Loss",
        "certification": "ACE",
        "experience": 3,
        "rating": 4.6,
        "totalClients": 16,
        "activeClients": 14,
        "joinDate": "2024-01-20",
        "status": "active",
        "avatar": "https://i.pravatar.cc/150?img=45"
      }
    ],
    "total": 2,
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Mentor not found"
}
```

---

### 2. Get Single PT Details

**Endpoint:** `GET /api/mentor/assigned-pts/:ptId`

**Authentication:** Required (Bearer Token)

**Path Parameters:**
- `ptId` (string, required) - The ID of the PT/Trainer

**Request Example:**
```bash
curl -X GET "http://localhost:3000/api/mentor/assigned-pts/6a2fbe411c5184d87bc0d791" \
  -H "Authorization: Bearer YOUR_MENTOR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "PT details fetched successfully",
  "data": {
    "pt": {
      "id": "pt_001",
      "name": "John Doe",
      "email": "john@fitness.com",
      "phone": "+1234567890",
      "specialization": "Strength Training",
      "certification": "NASM-CPT",
      "experience": 5,
      "rating": 4.8,
      "totalClients": 24,
      "activeClients": 18,
      "joinDate": "2023-06-15",
      "status": "active",
      "avatar": "https://i.pravatar.cc/150?img=12",
      "bio": "Specialized in strength and conditioning programs",
      "recentClients": [
        {
          "id": "c1",
          "name": "Alex",
          "progress": "90%"
        },
        {
          "id": "c2",
          "name": "Emma",
          "progress": "75%"
        }
      ]
    }
  }
}
```

**Error Responses:**

404 Not Found:
```json
{
  "success": false,
  "message": "PT not found or not assigned to this mentor",
  "error": "NOT_FOUND"
}
```

400 Bad Request:
```json
{
  "success": false,
  "message": "Mentor not found"
}
```

---

## Data Fields Explanation

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier for the PT/Trainer |
| name | string | Full name (firstName + lastName) |
| email | string | Email address |
| phone | string | Phone number |
| specialization | string | Primary specialization/expertise |
| certification | string | Professional certification(s) |
| experience | integer | Years of experience |
| rating | number | Average rating (0-5 scale) calculated from reviews |
| totalClients | integer | Total number of clients assigned to this PT |
| activeClients | integer | Number of currently active clients |
| joinDate | string | Date when PT joined (ISO format: YYYY-MM-DD) |
| status | string | Account status: "active", "inactive", "pending" |
| avatar | string | Avatar/profile image URL |
| bio | string | Professional biography (single PT endpoint only) |
| recentClients | array | List of recent clients (single PT endpoint only) |

---

## Sorting Options

- **name** (default): Sort alphabetically by PT name (A-Z)
- **rating**: Sort by rating in descending order (highest first)
- **clients**: Sort by total number of clients in descending order (most clients first)

---

## Status Values

- **active**: PT account is active and available
- **inactive**: PT account is inactive
- **pending**: PT account is pending approval

---

## Features

✅ Pagination support with configurable page size
✅ Multiple sorting options (name, rating, clients)
✅ Real-time calculation of active/total clients
✅ Dynamic avatar URLs with fallback
✅ Rating calculated from PT reviews
✅ Recent clients list (single PT endpoint)
✅ Professional biography support
✅ Date information in ISO format

---

## Testing

### Test Mentor Credentials
- Email: `mentor@fitness.com`
- Password: `Mentor123`

### Example Requests

**Get all PTs sorted by rating:**
```bash
curl -X GET "http://localhost:3000/api/mentor/assigned-pts?sort=rating&limit=5"
```

**Get PTs with pagination:**
```bash
curl -X GET "http://localhost:3000/api/mentor/assigned-pts?page=2&limit=10"
```

**Get specific PT details:**
```bash
curl -X GET "http://localhost:3000/api/mentor/assigned-pts/6a2fbe411c5184d87bc0d791"
```

---

## Files Modified/Created

1. **Service Layer** (`src/services/mentor.service.js`)
   - `getAssignedPTs()` - Fetch all assigned trainers with pagination and sorting
   - `getAssignedPTById()` - Fetch single trainer details
   - `sortPTs()` - Helper function for sorting

2. **Controller Layer** (`src/controllers/mentor.controller.js`)
   - `getAssignedPTsHandler()` - Handler for list endpoint
   - `getAssignedPTByIdHandler()` - Handler for single endpoint

3. **Routes** (`src/routes/mentor.routes.js`)
   - `GET /mentor/assigned-pts` - List all assigned PTs
   - `GET /mentor/assigned-pts/:ptId` - Get single PT details

4. **Seeder** (`src/seeders/mentor-data.seeder.js`)
   - Creates test mentor account with MentorProfile

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Avatar URLs are generated from Pravatar (random avatar service) if not provided
- Ratings are rounded to 1 decimal place
- Active clients are determined by checking if `isActive` flag is true or end date is in the future
- Recent clients list shows up to 5 most recent clients assigned to the PT
- Progress percentages are calculated based on client goal progress tracking
