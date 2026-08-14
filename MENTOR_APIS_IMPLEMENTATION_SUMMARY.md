# Mentor APIs - Complete Implementation Summary

## Overview
This document provides a complete overview of all mentor-related APIs that have been implemented for the fitness app backend. These APIs enable mentors to:
1. ✅ Login to the system
2. ✅ View assigned performance trainers (PTs)
3. ✅ Communicate with assigned trainers via messaging

---

## Table of Contents
- [Mentor Login API](#mentor-login-api)
- [Assigned PTs API](#assigned-pts-api)
- [Mentor Messaging API](#mentor-messaging-api)
- [Test Credentials](#test-credentials)
- [File Structure](#file-structure)
- [Implementation Status](#implementation-status)

---

## Mentor Login API

### Endpoint: POST /api/auth/mentor/login

**Purpose:** Authenticate a mentor and receive JWT tokens for subsequent requests.

**Request:**
```json
{
  "email": "mentor@fitness.com",
  "password": "Mentor123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "id": "6a7da152ad0097c14e1a4d77",
      "firstName": "John",
      "lastName": "Doe",
      "email": "mentor@fitness.com",
      "phone": "+1234567890",
      "roleId": "6a34db054db690cbe364d139",
      "isActive": true,
      "phoneVerified": true,
      "gender": null,
      "createdAt": "2026-08-13T10:49:54.004Z",
      "provider": "LOCAL"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Token Details:**
- **Access Token:** 24-hour expiration
- **Refresh Token:** 30-day expiration
- Use Access Token for all subsequent API calls in `Authorization: Bearer` header

**Files:**
- Controller: `src/controllers/auth.controller.js` (mentorLogin function)
- Service: `src/services/auth.service.js` (loginUser function)
- Routes: `src/routes/auth.routes.js` (POST /mentor/login)

---

## Assigned PTs API

### Endpoints Overview

#### 1. GET /api/mentor/assigned-pts
**Get all assigned Performance Trainers**

**Query Parameters:**
- `page` (default: 1) - Pagination page number
- `limit` (default: 10) - Results per page
- `status` - Filter by: "active", "inactive", "pending"
- `sort` - Sort by: "name", "rating", "clients"

**Response (200 OK):**
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
      }
    ],
    "total": 1,
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

#### 2. GET /api/mentor/assigned-pts/:ptId
**Get detailed information about a specific PT**

**Response (200 OK):**
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

**Files:**
- Controllers: `src/controllers/mentor.controller.js`
  - `getAssignedPTsHandler`
  - `getAssignedPTByIdHandler`
- Service: `src/services/mentor.service.js`
  - `getAssignedPTs`
  - `getAssignedPTById`
  - `sortPTs` (helper)
- Routes: `src/routes/mentor.routes.js`
  - `GET /mentor/assigned-pts`
  - `GET /mentor/assigned-pts/:ptId`

---

## Mentor Messaging API

### Endpoints Overview

#### 1. GET /api/mentor/messages/conversations
**Get all conversations between mentor and assigned PTs**

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Conversations fetched successfully",
  "data": {
    "conversations": [
      {
        "id": "mentor_123_trainer_456",
        "ptId": "456",
        "ptName": "John Smith",
        "ptAvatar": "https://i.pravatar.cc/150?img=12",
        "lastMessage": "Looking forward to the next session",
        "lastMessageTime": "2026-08-13T10:30:00Z",
        "unreadCount": 2,
        "status": "online"
      }
    ],
    "total": 1
  }
}
```

#### 2. GET /api/mentor/messages/conversations/{conversationId}
**Get messages in a specific conversation**

**Query Parameters:**
- `page` (default: 1) - Page number
- `limit` (default: 20) - Messages per page

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Messages fetched successfully",
  "data": {
    "conversationId": "mentor_123_trainer_456",
    "ptId": "456",
    "ptName": "John Smith",
    "ptAvatar": "https://i.pravatar.cc/150?img=12",
    "messages": [
      {
        "id": "msg_001",
        "senderId": "mentor_123",
        "senderName": "David Anderson",
        "senderType": "mentor",
        "message": "Hi John! How's your training going?",
        "timestamp": "2026-08-13T09:00:00Z",
        "read": true
      },
      {
        "id": "msg_002",
        "senderId": "456",
        "senderName": "John Smith",
        "senderType": "pt",
        "message": "Great! Feeling stronger each week",
        "timestamp": "2026-08-13T09:15:00Z",
        "read": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50
    }
  }
}
```

#### 3. POST /api/mentor/messages/send
**Send a message to a PT**

**Request:**
```json
{
  "conversationId": "mentor_123_trainer_456",
  "ptId": "456",
  "message": "That's awesome! Keep up the good work"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "messageId": "msg_004",
    "conversationId": "mentor_123_trainer_456",
    "senderId": "mentor_123",
    "senderType": "mentor",
    "message": "That's awesome! Keep up the good work",
    "timestamp": "2026-08-13T11:00:00Z",
    "read": true
  }
}
```

#### 4. PUT /api/mentor/messages/mark-read
**Mark messages as read**

**Request:**
```json
{
  "conversationId": "mentor_123_trainer_456",
  "messageIds": ["msg_002", "msg_003"]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Messages marked as read"
}
```

#### 5. GET /api/mentor/messages/unread-count
**Get unread message count**

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Unread count fetched successfully",
  "data": {
    "totalUnread": 5,
    "conversations": {
      "mentor_123_trainer_456": 2,
      "mentor_123_trainer_789": 3
    }
  }
}
```

**Files:**
- Controller: `src/controllers/mentor-messaging.controller.js`
- Service: `src/services/mentor-messaging.service.js`
- Routes: `src/routes/mentor-messaging.routes.js`
- App Integration: `src/app.js` (route registration)

---

## Test Credentials

```
Email: mentor@fitness.com
Password: Mentor123
```

### Quick Test Script

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/mentor/login \
  -H "Content-Type: application/json" \
  -d '{"email":"mentor@fitness.com","password":"Mentor123"}' \
  | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

# 2. Get assigned PTs
curl -X GET "http://localhost:3000/api/mentor/assigned-pts?sort=name" \
  -H "Authorization: Bearer $TOKEN"

# 3. Get conversations
curl -X GET "http://localhost:3000/api/mentor/messages/conversations" \
  -H "Authorization: Bearer $TOKEN"

# 4. Send a message
curl -X POST "http://localhost:3000/api/mentor/messages/send" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"conversationId":"...","ptId":"...","message":"Hello!"}'

# 5. Get unread count
curl -X GET "http://localhost:3000/api/mentor/messages/unread-count" \
  -H "Authorization: Bearer $TOKEN"
```

---

## File Structure

```
src/
├── controllers/
│   ├── auth.controller.js              (mentorLogin handler)
│   ├── mentor.controller.js            (getAssignedPTsHandler, getAssignedPTByIdHandler)
│   └── mentor-messaging.controller.js  (NEW - 5 message handlers)
│
├── services/
│   ├── auth.service.js                 (loginUser function)
│   ├── mentor.service.js               (getAssignedPTs, getAssignedPTById)
│   └── mentor-messaging.service.js     (NEW - 5 service functions)
│
├── routes/
│   ├── auth.routes.js                  (POST /auth/mentor/login)
│   ├── mentor.routes.js                (GET /mentor/assigned-pts*)
│   └── mentor-messaging.routes.js      (NEW - 5 message endpoints)
│
├── enums/
│   └── RoleEnum.js                     (UPDATED - added MENTOR)
│
└── app.js                              (UPDATED - route registration)

Documentation:
├── ASSIGNED_PTS_API.md                 (NEW - detailed PTs API doc)
├── MENTOR_MESSAGING_API.md             (NEW - detailed messaging API doc)
└── MENTOR_APIS_IMPLEMENTATION_SUMMARY.md (NEW - this file)

Seeders:
└── mentor-data.seeder.js               (NEW - creates test mentor)
```

---

## Implementation Status

### ✅ Completed Features

| Feature | Endpoint | Status |
|---------|----------|--------|
| Mentor Login | POST /api/auth/mentor/login | ✅ Complete |
| Assigned PTs List | GET /api/mentor/assigned-pts | ✅ Complete |
| PT Details | GET /api/mentor/assigned-pts/:ptId | ✅ Complete |
| Conversations List | GET /api/mentor/messages/conversations | ✅ Complete |
| Get Messages | GET /api/mentor/messages/conversations/:conversationId | ✅ Complete |
| Send Message | POST /api/mentor/messages/send | ✅ Complete |
| Mark Read | PUT /api/mentor/messages/mark-read | ✅ Complete |
| Unread Count | GET /api/mentor/messages/unread-count | ✅ Complete |
| Pagination Support | Query params on multiple endpoints | ✅ Complete |
| Sorting Support | sort param on assigned-pts | ✅ Complete |
| Filtering Support | status param on assigned-pts | ✅ Complete |
| Authentication | authMiddleware on all endpoints | ✅ Complete |
| Error Handling | 400, 403, 404 responses | ✅ Complete |
| Read Receipts | Message status tracking | ✅ Complete |
| API Documentation | Swagger-compatible comments | ✅ Complete |

### ✅ Data Models Used

- **User** - Mentor and Trainer profiles
- **Role** - MENTOR role added to enum
- **MentorProfile** - Mentor-specific details
- **MentorTrainerAssignment** - Mentor-PT relationships
- **ChatConversation** - Message conversations
- **ChatMessage** - Individual messages
- **Review** - For calculating PT ratings
- **AssignedCustomer** - For PT client counts

### ✅ Security Features

- ✅ JWT token authentication (24-hour expiration for mentors)
- ✅ Role-based access control (Mentor role required)
- ✅ Mentor-PT relationship validation
- ✅ Conversation access control
- ✅ Input validation and sanitization
- ✅ Error message sanitization

---

## Key Improvements Made to Old Code

✅ **No breaking changes** - All existing code remains functional
✅ **New role added** - MENTOR added to RoleEnum
✅ **New seeder** - Mentor account creation via seeder
✅ **Extended existing models** - Reused ChatConversation/ChatMessage
✅ **New middleware integration** - authMiddleware on all endpoints
✅ **Swagger documentation** - All endpoints documented

---

## Architecture Design

### Request Flow Example (Send Message)

```
User Request
    ↓
HTTP: POST /api/mentor/messages/send
    ↓
Express Router (mentor-messaging.routes.js)
    ↓
authMiddleware (validates JWT, extracts mentorId)
    ↓
sendMessageHandler (mentor-messaging.controller.js)
    ↓
sendMessage() service (mentor-messaging.service.js)
    ↓
Prisma Database
  - Validate mentor exists
  - Validate trainer exists
  - Validate relationship
  - Create/update conversation
  - Create message record
    ↓
HTTP Response (201 Created)
```

### Data Flow Example (Get Conversations)

```
Mentor → GET /conversations
    ↓
getConversationListHandler
    ↓
getConversationList(mentorId)
    ↓
Query MentorTrainerAssignments
    ↓
Fetch trainer details for each
    ↓
Fetch last message for each
    ↓
Format response with status/counts
    ↓
Return conversations array
```

---

## Database Queries Optimized

✅ Indexed queries on:
- `mentorTrainerAssignments.mentorId`
- `mentorTrainerAssignments.trainerId`
- `chatMessage.conversationId`
- `chatMessage.senderId`
- `chatMessage.receiverId`
- `chatMessage.createdAt`

---

## Future Enhancement Suggestions

- [ ] Real-time WebSocket messaging (Socket.io integration)
- [ ] Message attachments/file uploads
- [ ] Conversation search functionality
- [ ] Message reactions/emojis
- [ ] Typing indicators
- [ ] Message encryption
- [ ] Message deletion (soft delete)
- [ ] Conversation pinning/archiving
- [ ] Bulk message operations
- [ ] Message scheduling

---

## Support & Troubleshooting

### Common Issues

**Issue: "Mentor not found"**
- Ensure mentor is logged in with valid token
- Check JWT_SECRET matches production config

**Issue: "Trainer not assigned to this mentor"**
- Verify trainer is assigned using `/api/mentors/{mentorId}/assign-trainers`
- Check MentorTrainerAssignment exists in database

**Issue: "Conversation not found"**
- Conversation is created automatically on first message
- Verify conversationId format is correct

### Database Verification

```sql
// Check mentor exists
db.users.findOne({email: "mentor@fitness.com"})

// Check role is set to Mentor
db.roles.findOne({name: "Mentor"})

// Check mentor-trainer assignments
db.mentortrainerassignments.find({mentorId: "..."})

// Check messages exist
db.chatmessages.find({conversationId: "..."})
```

---

## Version History

**v1.0.0 - Initial Release (2026-08-14)**
- ✅ Mentor login API
- ✅ Assigned PTs API (list + detail)
- ✅ Mentor Messaging API (5 endpoints)
- ✅ Test mentor seeder
- ✅ Complete API documentation

---

## Conclusion

All mentor APIs have been successfully implemented with:
- ✅ Full authentication & authorization
- ✅ Complete error handling
- ✅ Comprehensive documentation
- ✅ No breaking changes to existing code
- ✅ Proper pagination, sorting, and filtering
- ✅ Real-time message support (foundation for WebSocket)
- ✅ Read receipts and unread tracking

The implementation is **production-ready** and can be deployed immediately.
