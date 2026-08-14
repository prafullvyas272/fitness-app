# Mentor Messaging API Documentation

## Overview
This document describes the Messaging API for mentor-PT (Performance Trainer) real-time communication. This allows mentors to send and receive messages with their assigned trainers.

## Authentication
All endpoints require a valid JWT token with Mentor role. Use the mentor login endpoint to obtain a token:

```bash
POST /api/auth/mentor/login
{
  "email": "mentor@fitness.com",
  "password": "Mentor123"
}
```

## API Endpoints

### 1. Get Conversation List

**Endpoint:** `GET /api/mentor/messages/conversations`

**Authentication:** Required (Bearer Token)

**Description:** Retrieve all conversations between the mentor and their assigned PTs.

**Request Example:**
```bash
curl -X GET "http://localhost:3000/api/mentor/messages/conversations" \
  -H "Authorization: Bearer YOUR_MENTOR_TOKEN"
```

**Success Response (200 OK):**
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
      },
      {
        "id": "mentor_123_trainer_789",
        "ptId": "789",
        "ptName": "Sarah Johnson",
        "ptAvatar": "https://i.pravatar.cc/150?img=45",
        "lastMessage": "Thanks for the feedback!",
        "lastMessageTime": "2026-08-12T14:20:00Z",
        "unreadCount": 0,
        "status": "offline"
      }
    ],
    "total": 2
  }
}
```

---

### 2. Get Messages in Conversation

**Endpoint:** `GET /api/mentor/messages/conversations/{conversationId}`

**Authentication:** Required (Bearer Token)

**Query Parameters:**
- `page` (integer, optional, default: 1) - Page number for pagination
- `limit` (integer, optional, default: 20) - Number of messages per page

**Description:** Retrieve all messages within a specific conversation with pagination support.

**Request Example:**
```bash
curl -X GET "http://localhost:3000/api/mentor/messages/conversations/mentor_123_trainer_456?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_MENTOR_TOKEN"
```

**Success Response (200 OK):**
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
        "read": true
      },
      {
        "id": "msg_003",
        "senderId": "456",
        "senderName": "John Smith",
        "senderType": "pt",
        "message": "Looking forward to the next session",
        "timestamp": "2026-08-13T10:30:00Z",
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

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "PT not found or not assigned to this mentor",
  "error": "NOT_FOUND"
}
```

---

### 3. Send Message

**Endpoint:** `POST /api/mentor/messages/send`

**Authentication:** Required (Bearer Token)

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "conversationId": "mentor_123_trainer_456",
  "ptId": "456",
  "message": "That's awesome! Keep up the good work"
}
```

**Description:** Send a new message to a PT in an existing or new conversation.

**Request Example:**
```bash
curl -X POST "http://localhost:3000/api/mentor/messages/send" \
  -H "Authorization: Bearer YOUR_MENTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "mentor_123_trainer_456",
    "ptId": "456",
    "message": "That's awesome! Keep up the good work"
  }'
```

**Success Response (201 Created):**
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

**Error Responses:**

400 Bad Request:
```json
{
  "success": false,
  "message": "conversationId, ptId, and message are required",
  "error": "INVALID_REQUEST"
}
```

404 Not Found:
```json
{
  "success": false,
  "message": "Trainer not found",
  "error": "NOT_FOUND"
}
```

403 Unauthorized:
```json
{
  "success": false,
  "message": "Trainer not assigned to this mentor",
  "error": "UNAUTHORIZED"
}
```

---

### 4. Mark Messages as Read

**Endpoint:** `PUT /api/mentor/messages/mark-read`

**Authentication:** Required (Bearer Token)

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "conversationId": "mentor_123_trainer_456",
  "messageIds": ["msg_002", "msg_003"]
}
```

**Description:** Mark one or multiple messages as read to update read receipts.

**Request Example:**
```bash
curl -X PUT "http://localhost:3000/api/mentor/messages/mark-read" \
  -H "Authorization: Bearer YOUR_MENTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "mentor_123_trainer_456",
    "messageIds": ["msg_002", "msg_003"]
  }'
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Messages marked as read"
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "conversationId and messageIds array are required",
  "error": "INVALID_REQUEST"
}
```

---

### 5. Get Unread Count

**Endpoint:** `GET /api/mentor/messages/unread-count`

**Authentication:** Required (Bearer Token)

**Description:** Retrieve the total count of unread messages grouped by conversation.

**Request Example:**
```bash
curl -X GET "http://localhost:3000/api/mentor/messages/unread-count" \
  -H "Authorization: Bearer YOUR_MENTOR_TOKEN"
```

**Success Response (200 OK):**
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

---

## Data Fields Explanation

| Field | Type | Description |
|-------|------|-------------|
| conversationId | string | Unique conversation identifier (format: `mentor_{mentorId}_trainer_{trainerId}`) |
| ptId | string | Trainer/PT user ID |
| ptName | string | Full name of the trainer |
| ptAvatar | string | Avatar/profile image URL |
| lastMessage | string | The text of the last message in the conversation |
| lastMessageTime | string | ISO 8601 timestamp of the last message |
| unreadCount | integer | Number of unread messages in the conversation |
| status | string | Current online/offline status: "online" or "offline" |
| messageId | string | Unique message identifier |
| senderId | string | ID of the user who sent the message |
| senderName | string | Name of the sender |
| senderType | string | Type of sender: "mentor" or "pt" |
| message | string | The message content |
| timestamp | string | ISO 8601 timestamp when message was sent |
| read | boolean | Whether the message has been read |

---

## Conversation ID Format

Conversation IDs are automatically generated in the format:
```
mentor_{mentorId}_trainer_{trainerId}
```

Example:
```
mentor_6a7da152ad0097c14e1a4d77_trainer_6a2fbe411c5184d87bc0d791
```

---

## Features

✅ Real-time messaging between mentors and PTs
✅ Automatic conversation creation
✅ Message pagination support
✅ Read receipts (mark messages as read)
✅ Unread message count tracking
✅ Last message preview in conversation list
✅ Online/offline status indication
✅ Timestamp in ISO 8601 format
✅ Error handling and validation

---

## Implementation Details

### Database Models Used:
- **ChatConversation** - Stores conversation metadata
- **ChatMessage** - Stores individual messages
- **MentorTrainerAssignment** - Validates mentor-PT relationship
- **User** - Stores user information

### Service Layer:
- `getConversationList()` - Fetch all conversations for a mentor
- `getConversationMessages()` - Fetch paginated messages in a conversation
- `sendMessage()` - Create and send a new message
- `markMessagesAsRead()` - Update message read status
- `getUnreadCount()` - Get unread message statistics

### Authorization:
- All endpoints require Mentor authentication
- Messages can only be sent to assigned trainers
- Conversation access is restricted to the mentor who owns it

---

## Testing

### Test Mentor Credentials:
- Email: `mentor@fitness.com`
- Password: `Mentor123`

### Example Test Flow:

1. **Login as mentor:**
```bash
curl -X POST http://localhost:3000/api/auth/mentor/login \
  -H "Content-Type: application/json" \
  -d '{"email":"mentor@fitness.com","password":"Mentor123"}'
```

2. **Get conversations:**
```bash
curl -X GET http://localhost:3000/api/mentor/messages/conversations \
  -H "Authorization: Bearer {token}"
```

3. **Send a message:**
```bash
curl -X POST http://localhost:3000/api/mentor/messages/send \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"conversationId":"...","ptId":"...","message":"Hello!"}'
```

4. **Get unread count:**
```bash
curl -X GET http://localhost:3000/api/mentor/messages/unread-count \
  -H "Authorization: Bearer {token}"
```

---

## Files Created/Modified

1. **`src/services/mentor-messaging.service.js`** - Business logic for messaging
2. **`src/controllers/mentor-messaging.controller.js`** - Request handlers
3. **`src/routes/mentor-messaging.routes.js`** - API route definitions
4. **`src/app.js`** - Added route registration (modified)

---

## Notes

- Messages are stored in the existing `ChatMessage` model
- Conversations are created automatically on first message
- All timestamps are in ISO 8601 UTC format
- Message status values: SENT, DELIVERED, READ
- Mentor-PT relationship is validated for each request
- Pagination defaults to 20 messages per page
- Unread count is calculated from message status field

---

## Future Enhancements

- File/image attachment support
- Message search functionality
- Conversation archiving
- Message reactions/emojis
- Typing indicators
- Message encryption
- Message deletion
- Conversation pinning
