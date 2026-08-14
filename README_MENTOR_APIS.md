# Fitness App - Mentor APIs Documentation Index

## 🎯 Overview

This document serves as the main index for all mentor-related APIs implemented in the fitness app backend. The implementation includes three major API modules with a total of 9 endpoints for mentor authentication, trainer management, and real-time messaging.

---

## 📚 Documentation Files

### 1. **MENTOR_APIS_QUICK_START.md** ⭐ START HERE
- **Purpose:** Get up and running in 5 minutes
- **Contains:** 
  - Copy-paste curl commands
  - Step-by-step examples
  - Quick reference table
  - Testing checklist
  - Common mistakes

**When to use:** First time using the APIs or need quick examples

---

### 2. **MENTOR_APIS_IMPLEMENTATION_SUMMARY.md** 📋 COMPLETE REFERENCE
- **Purpose:** Comprehensive implementation overview
- **Contains:**
  - Complete endpoint documentation
  - Request/response examples
  - Architecture design
  - File structure
  - Implementation status
  - Future enhancements

**When to use:** Understanding the full system architecture

---

### 3. **ASSIGNED_PTS_API.md** 👥 TRAINER MANAGEMENT
- **Purpose:** Detailed documentation for assigned trainers endpoints
- **Contains:**
  - Endpoint specifications
  - Query parameters (page, limit, sort, filter)
  - Response structures
  - Data field explanations
  - Error responses
  - Testing examples

**When to use:** Working with trainer listing and details

---

### 4. **MENTOR_MESSAGING_API.md** 💬 MESSAGING SYSTEM
- **Purpose:** Complete messaging API reference
- **Contains:**
  - All 5 messaging endpoints
  - Conversation management
  - Message sending and reading
  - Pagination support
  - Read receipt system
  - Unread count tracking

**When to use:** Implementing messaging features

---

## 🚀 Quick Navigation

### I want to...

**...get started immediately** → Read [MENTOR_APIS_QUICK_START.md](MENTOR_APIS_QUICK_START.md)

**...understand the full architecture** → Read [MENTOR_APIS_IMPLEMENTATION_SUMMARY.md](MENTOR_APIS_IMPLEMENTATION_SUMMARY.md)

**...work with trainers** → Read [ASSIGNED_PTS_API.md](ASSIGNED_PTS_API.md)

**...implement messaging** → Read [MENTOR_MESSAGING_API.md](MENTOR_MESSAGING_API.md)

**...deploy to production** → Follow deployment checklist in [MENTOR_APIS_IMPLEMENTATION_SUMMARY.md](MENTOR_APIS_IMPLEMENTATION_SUMMARY.md)

---

## 📊 API Modules at a Glance

### Module 1: Authentication
```
POST /api/auth/mentor/login
├─ Purpose: Authenticate mentor
├─ Returns: User data + JWT tokens
├─ Token Expiry: 24 hours (access), 30 days (refresh)
└─ Test Credentials: mentor@fitness.com / Mentor123
```

### Module 2: Trainer Management
```
GET /api/mentor/assigned-pts
├─ Purpose: List all assigned trainers
├─ Features: Pagination, Sorting, Filtering
└─ Response: Trainer list with metrics

GET /api/mentor/assigned-pts/{ptId}
├─ Purpose: Get trainer details
├─ Features: Full profile, recent clients
└─ Response: Complete trainer profile
```

### Module 3: Messaging
```
GET /api/mentor/messages/conversations
├─ Purpose: List conversations
└─ Response: Conversation list with unread count

GET /api/mentor/messages/conversations/{conversationId}
├─ Purpose: Get messages in conversation
├─ Features: Pagination
└─ Response: Message history

POST /api/mentor/messages/send
├─ Purpose: Send message
├─ Features: Auto-create conversation
└─ Response: Message confirmation

PUT /api/mentor/messages/mark-read
├─ Purpose: Mark as read
└─ Response: Status confirmation

GET /api/mentor/messages/unread-count
├─ Purpose: Get unread statistics
└─ Response: Unread count breakdown
```

---

## 🔑 Key Features

✅ **Authentication**
- JWT token-based (24-hour expiration)
- Mentor role required
- Secure password hashing

✅ **Trainer Management**
- Dynamic client counting
- Rating calculations from reviews
- Status indication
- Pagination & sorting

✅ **Messaging**
- Real-time conversation tracking
- Message pagination
- Read receipts
- Unread counting
- Auto-conversation creation

✅ **Data Quality**
- ISO 8601 timestamps
- Proper HTTP status codes
- Consistent error responses
- Input validation

---

## 🧪 Testing

### Test Account
```
Email: mentor@fitness.com
Password: Mentor123
```

### Quick Test
```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/mentor/login \
  -H "Content-Type: application/json" \
  -d '{"email":"mentor@fitness.com","password":"Mentor123"}' \
  | jq -r '.data.access_token')

# 2. Test trainer endpoint
curl -X GET "http://localhost:3000/api/mentor/assigned-pts" \
  -H "Authorization: Bearer $TOKEN"

# 3. Test messaging endpoint
curl -X GET "http://localhost:3000/api/mentor/messages/conversations" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📁 File Structure

```
fitness-app/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.js              ✏️ mentorLogin added
│   │   ├── mentor.controller.js            ✏️ PT handlers added
│   │   └── mentor-messaging.controller.js  ✨ NEW
│   │
│   ├── services/
│   │   ├── auth.service.js                 (no changes)
│   │   ├── mentor.service.js               ✏️ PT services added
│   │   └── mentor-messaging.service.js     ✨ NEW
│   │
│   ├── routes/
│   │   ├── auth.routes.js                  ✏️ mentor login route
│   │   ├── mentor.routes.js                ✏️ PT routes added
│   │   └── mentor-messaging.routes.js      ✨ NEW
│   │
│   ├── enums/
│   │   └── RoleEnum.js                     ✏️ MENTOR role added
│   │
│   ├── seeders/
│   │   └── mentor-data.seeder.js           ✨ NEW
│   │
│   └── app.js                              ✏️ routes registered
│
└── Documentation/
    ├── README_MENTOR_APIS.md               ✨ This file
    ├── MENTOR_APIS_QUICK_START.md          ✨ Quick reference
    ├── MENTOR_APIS_IMPLEMENTATION_SUMMARY.md ✨ Full overview
    ├── ASSIGNED_PTS_API.md                 ✨ Trainer management
    └── MENTOR_MESSAGING_API.md             ✨ Messaging system

✨ = New   ✏️ = Modified   (no changes) = Untouched
```

---

## ⚡ Performance & Optimization

✅ **Database Indexes**
- mentorTrainerAssignments.mentorId
- mentorTrainerAssignments.trainerId
- chatMessage.conversationId
- chatMessage.senderId/receiverId
- chatMessage.createdAt

✅ **Query Optimization**
- Efficient pagination
- Selective field selection
- Relationship pre-loading
- Index usage for filtering

---

## 🔒 Security Features

✅ **Authentication**
- JWT token validation
- 24-hour token expiration
- Refresh token support

✅ **Authorization**
- Role-based access (Mentor only)
- Mentor-PT relationship validation
- Conversation access control

✅ **Input Validation**
- Required field checking
- Type validation
- Length validation
- SQL injection prevention

✅ **Error Handling**
- No sensitive data in errors
- Proper status codes
- Consistent error format

---

## 📈 Scalability Considerations

✅ **Ready for scaling:**
- Pagination prevents large result sets
- Indexed queries for quick lookup
- Efficient relationship validation
- Stateless authentication (JWT)

**Future optimizations:**
- Redis caching for conversation lists
- Message compression
- Bulk operations support
- Connection pooling

---

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Check JWT token is valid and not expired |
| 403 Forbidden | Verify trainer is assigned to mentor |
| 404 Not Found | Verify IDs are correct |
| Message not sending | Check conversationId format |
| Unread count wrong | Verify message status in database |

See [MENTOR_APIS_QUICK_START.md](MENTOR_APIS_QUICK_START.md) for detailed debugging tips.

---

## 🚀 Deployment Checklist

- [ ] Run `npm install` (if new packages added)
- [ ] Run mentor-data.seeder.js to create test account
- [ ] Update .env with production values
- [ ] Test all 9 endpoints with curl
- [ ] Verify database indexes created
- [ ] Check JWT_SECRET is set correctly
- [ ] Test error cases
- [ ] Monitor logs for issues
- [ ] Set up alerts for failed logins
- [ ] Document any customizations

---

## 📞 Support

### Getting Help

1. **Quick question?** → Check [MENTOR_APIS_QUICK_START.md](MENTOR_APIS_QUICK_START.md)
2. **Need details?** → Check relevant API documentation file
3. **Something broken?** → Check troubleshooting section
4. **Want to contribute?** → Follow existing code patterns

---

## 🎓 Learning Path

**New to the APIs?**
1. Start: [MENTOR_APIS_QUICK_START.md](MENTOR_APIS_QUICK_START.md)
2. Run the examples
3. Test with curl
4. Read relevant detailed docs as needed

**Building a feature?**
1. Identify which API module you need
2. Read the specific API documentation
3. Copy example requests
4. Adapt to your needs
5. Refer to architecture for design questions

**Contributing code?**
1. Follow existing patterns
2. Add proper error handling
3. Write Swagger comments
4. Test thoroughly
5. Update documentation

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-08-14 | Initial release: Login, Trainer Management, Messaging |

---

## 🎉 Summary

You now have a complete, production-ready mentor API system with:

✅ 9 well-documented endpoints
✅ Zero breaking changes
✅ Comprehensive documentation
✅ Test credentials provided
✅ Error handling & validation
✅ Security features
✅ Performance optimizations
✅ Deployment ready

**Start with:** [MENTOR_APIS_QUICK_START.md](MENTOR_APIS_QUICK_START.md)

**Happy coding!** 🚀
