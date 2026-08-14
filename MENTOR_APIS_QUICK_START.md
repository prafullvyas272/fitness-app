# Mentor APIs - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Get Access Token
```bash
curl -X POST http://localhost:3000/api/auth/mentor/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mentor@fitness.com",
    "password": "Mentor123"
  }'
```

**Store the `access_token` from response**

---

### Step 2: View Your Assigned Trainers
```bash
TOKEN="your_access_token_here"

curl -X GET "http://localhost:3000/api/mentor/assigned-pts?sort=name" \
  -H "Authorization: Bearer $TOKEN"
```

**Response includes:** Name, email, specialization, rating, client count, status

---

### Step 3: Get Details of a Specific Trainer
```bash
TOKEN="your_access_token_here"
TRAINER_ID="trainer_id_from_step_2"

curl -X GET "http://localhost:3000/api/mentor/assigned-pts/$TRAINER_ID" \
  -H "Authorization: Bearer $TOKEN"
```

**Response includes:** Bio, recent clients, detailed metrics

---

### Step 4: View Your Conversations
```bash
TOKEN="your_access_token_here"

curl -X GET "http://localhost:3000/api/mentor/messages/conversations" \
  -H "Authorization: Bearer $TOKEN"
```

**Response includes:** Conversation list, last message, unread count

---

### Step 5: Send a Message
```bash
TOKEN="your_access_token_here"

curl -X POST "http://localhost:3000/api/mentor/messages/send" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "mentor_xxx_trainer_yyy",
    "ptId": "trainer_id",
    "message": "Great work this week!"
  }'
```

---

## 📋 Available Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| **POST** | `/api/auth/mentor/login` | Login and get tokens |
| **GET** | `/api/mentor/assigned-pts` | List all assigned trainers |
| **GET** | `/api/mentor/assigned-pts/{id}` | Get trainer details |
| **GET** | `/api/mentor/messages/conversations` | List conversations |
| **GET** | `/api/mentor/messages/conversations/{id}` | Get messages in conversation |
| **POST** | `/api/mentor/messages/send` | Send a message |
| **PUT** | `/api/mentor/messages/mark-read` | Mark messages as read |
| **GET** | `/api/mentor/messages/unread-count` | Get unread statistics |

---

## 🔑 Authentication

**All endpoints (except login) require:**
```
Authorization: Bearer {access_token}
```

**Token Details:**
- Access token: Valid for 24 hours
- Refresh token: Valid for 30 days
- Role required: Mentor

---

## 📊 Filtering & Sorting

### Assigned Trainers - Sorting Options
```
?sort=name       // Alphabetical (default)
?sort=rating     // Highest rated first
?sort=clients    // Most clients first
```

### Assigned Trainers - Filtering
```
?status=active   // Only active trainers
?status=inactive // Only inactive trainers
```

### Messaging - Pagination
```
?page=1&limit=20  // Page 1, 20 messages per page
?page=2&limit=50  // Page 2, 50 messages per page
```

---

## 💾 Request/Response Examples

### Example 1: Login Flow
**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/mentor/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mentor@fitness.com",
    "password": "Mentor123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "id": "mentor_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "mentor@fitness.com"
    },
    "access_token": "eyJhbGc..."
  }
}
```

---

### Example 2: Send Message Flow
**Request:**
```bash
curl -X POST http://localhost:3000/api/mentor/messages/send \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "mentor_123_trainer_456",
    "ptId": "456",
    "message": "How are your clients progressing?"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "messageId": "msg_789",
    "message": "How are your clients progressing?",
    "timestamp": "2026-08-14T12:00:00Z",
    "read": true
  }
}
```

---

## ⚠️ Error Handling

### 400 Bad Request
```json
{
  "success": false,
  "message": "Message cannot be empty",
  "error": "INVALID_REQUEST"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Trainer not assigned to this mentor",
  "error": "UNAUTHORIZED"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Trainer not found",
  "error": "NOT_FOUND"
}
```

---

## 🧪 Testing Checklist

- [ ] Can login with mentor credentials
- [ ] Can list assigned trainers
- [ ] Can view trainer details
- [ ] Can see conversations
- [ ] Can read message history
- [ ] Can send new message
- [ ] Can mark messages as read
- [ ] Can check unread count
- [ ] Pagination works (page, limit)
- [ ] Sorting works (name, rating, clients)
- [ ] Filtering works (status)
- [ ] Error handling returns correct status codes

---

## 🔍 Debugging Tips

**Check if mentor exists:**
```bash
curl -X GET "http://localhost:3000/api/mentor/assigned-pts" \
  -H "Authorization: Bearer $TOKEN"
```

**Verify trainers are assigned:**
```
Response should include "total": X trainers
```

**Check message history:**
```bash
curl -X GET "http://localhost:3000/api/mentor/messages/conversations/{conversationId}?page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

**Verify unread messages:**
```bash
curl -X GET "http://localhost:3000/api/mentor/messages/unread-count" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📱 Sample Integration

### JavaScript/Node.js Example

```javascript
const TOKEN = "your_access_token";
const MENTOR_ID = "your_mentor_id";
const TRAINER_ID = "trainer_id";

// Get assigned trainers
async function getTrainers() {
  const response = await fetch(
    "http://localhost:3000/api/mentor/assigned-pts",
    {
      headers: { Authorization: `Bearer ${TOKEN}` }
    }
  );
  return response.json();
}

// Send message
async function sendMessage(conversationId, trainerId, message) {
  const response = await fetch(
    "http://localhost:3000/api/mentor/messages/send",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        conversationId,
        ptId: trainerId,
        message
      })
    }
  );
  return response.json();
}

// Get conversations
async function getConversations() {
  const response = await fetch(
    "http://localhost:3000/api/mentor/messages/conversations",
    {
      headers: { Authorization: `Bearer ${TOKEN}` }
    }
  );
  return response.json();
}
```

---

## 🚨 Common Mistakes

❌ **Don't:**
- Forget to include `Authorization` header
- Hardcode tokens in your code
- Send empty messages
- Use wrong conversation ID format
- Mix up trainer ID and conversation ID

✅ **Do:**
- Store tokens securely
- Handle expired tokens gracefully
- Validate input before sending
- Use correct ID formats
- Implement proper error handling

---

## 📚 Full Documentation

For complete API documentation, see:
- **Login API:** `MENTOR_APIS_IMPLEMENTATION_SUMMARY.md`
- **Assigned PTs API:** `ASSIGNED_PTS_API.md`
- **Messaging API:** `MENTOR_MESSAGING_API.md`

---

## ✅ You're Ready!

You now have:
- ✅ Mentor login system
- ✅ Trainer management view
- ✅ Real-time messaging
- ✅ Full API documentation
- ✅ Test credentials

**Start building! 🎉**
