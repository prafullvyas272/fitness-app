# Mentor Schedules API Documentation (READ-ONLY)

## Overview

The Mentor Schedules API provides READ-ONLY access to view schedules, date ranges, and alerts. Mentors **cannot** create, update, or delete schedules - all schedule management is handled by PTs and admins. Mentors can only acknowledge/resolve alerts.

---

## 📋 Endpoints

### 1. Get All Schedules

**Endpoint:** `GET /api/mentor/schedules`

**Authentication:** Required (Bearer Token)

**Query Parameters:**
- `date` (optional) - Filter by specific date (YYYY-MM-DD format)
- `status` (optional) - Filter by status: "scheduled", "confirmed", "rescheduled", "cancelled", "completed"
- `page` (optional, default: 1) - Page number for pagination
- `limit` (optional, default: 20) - Results per page

**Request Example:**
```bash
curl -X GET "http://localhost:3000/api/mentor/schedules?date=2026-08-14&status=confirmed&limit=20&page=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Schedules fetched successfully",
  "data": {
    "schedules": [
      {
        "id": "sch_001",
        "ptId": "pt_001",
        "ptName": "John Doe",
        "ptAvatar": "https://i.pravatar.cc/150?img=12",
        "clientId": "client_001",
        "clientName": "Alex Johnson",
        "sessionType": "Strength Training",
        "date": "2026-08-14",
        "startTime": "09:00",
        "endTime": "10:00",
        "duration": 60,
        "status": "scheduled",
        "location": "Nexus Central Hub",
        "notes": "Focus on upper body",
        "confirmed": true,
        "reminderSent": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

---

### 2. Get Schedules by Date Range

**Endpoint:** `GET /api/mentor/schedules/range`

**Authentication:** Required (Bearer Token)

**Query Parameters (Required):**
- `startDate` (required) - Start date in YYYY-MM-DD format
- `endDate` (required) - End date in YYYY-MM-DD format

**Request Example:**
```bash
curl -X GET "http://localhost:3000/api/mentor/schedules/range?startDate=2026-08-14&endDate=2026-08-20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Schedules fetched successfully",
  "data": {
    "schedulesByDate": {
      "2026-08-14": [
        {
          "id": "sch_001",
          "ptName": "John Doe",
          "startTime": "09:00",
          "endTime": "10:00",
          "clientName": "Alex Johnson",
          "status": "scheduled"
        }
      ],
      "2026-08-15": [
        {
          "id": "sch_002",
          "ptName": "Sarah Johnson",
          "startTime": "14:00",
          "endTime": "15:00",
          "clientName": "Emma Wilson",
          "status": "scheduled"
        }
      ]
    }
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Start date must be before end date",
  "error": "INVALID_DATE_RANGE"
}
```

---

### 3. Get Schedule Alerts

**Endpoint:** `GET /api/mentor/schedules/alerts`

**Authentication:** Required (Bearer Token)

**Query Parameters:**
- `urgency` (optional) - Filter by urgency: "high", "medium", "low"
- `limit` (optional, default: 10) - Number of alerts to return

**Request Example:**
```bash
curl -X GET "http://localhost:3000/api/mentor/schedules/alerts?urgency=high&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Alerts fetched successfully",
  "data": {
    "alerts": [
      {
        "id": "alert_001",
        "type": "no_confirmation",
        "urgency": "high",
        "scheduleId": "sch_001",
        "ptName": "John Doe",
        "message": "Schedule confirmation pending for tomorrow at 09:00",
        "createdAt": "2026-08-13T18:00:00Z",
        "resolved": false
      },
      {
        "id": "alert_002",
        "type": "client_cancellation",
        "urgency": "medium",
        "scheduleId": "sch_002",
        "clientName": "Alex Johnson",
        "message": "Client cancelled session scheduled for 14:00",
        "createdAt": "2026-08-13T17:30:00Z",
        "resolved": false
      },
      {
        "id": "alert_003",
        "type": "no_show",
        "urgency": "high",
        "scheduleId": "sch_003",
        "ptName": "Sarah Johnson",
        "clientName": "Emma Wilson",
        "message": "PT did not show for session at 14:00",
        "createdAt": "2026-08-13T14:15:00Z",
        "resolved": false
      }
    ],
    "totalAlerts": 3,
    "unresolvedCount": 3
  }
}
```

---

### 4. Acknowledge Alert

**Endpoint:** `PUT /api/mentor/schedules/alerts/{alertId}`

**Authentication:** Required (Bearer Token)

**Description:** Mentors can ONLY acknowledge alerts by setting `resolved: true` and `action: "acknowledged"`. No other modifications are allowed.

**Request Body:**
```json
{
  "resolved": true,
  "action": "acknowledged"
}
```

**Request Example:**
```bash
curl -X PUT "http://localhost:3000/api/mentor/schedules/alerts/alert_001" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resolved": true,
    "action": "acknowledged"
  }'
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Alert acknowledged successfully",
  "data": {
    "alertId": "alert_001",
    "resolved": true
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Only acknowledgement (resolved: true, action: 'acknowledged') is allowed",
  "error": "INVALID_ACTION"
}
```

**Error Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "You do not have access to this alert",
  "error": "FORBIDDEN"
}
```

---

### 5. Get Schedule Statistics

**Endpoint:** `GET /api/mentor/schedules/stats`

**Authentication:** Required (Bearer Token)

**Query Parameters:**
- `period` (optional, default: "week") - Statistics period: "week", "month", "year"

**Request Example:**
```bash
curl -X GET "http://localhost:3000/api/mentor/schedules/stats?period=week" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Statistics fetched successfully",
  "data": {
    "stats": {
      "totalSchedules": 24,
      "confirmedSchedules": 22,
      "pendingConfirmation": 2,
      "cancelledSchedules": 1,
      "completedSessions": 18,
      "totalDuration": 1440,
      "averageSessionDuration": 60,
      "noShowRate": 2.5,
      "clientRetentionRate": 94.5
    }
  }
}
```

---

### 6. Get Alerts Summary

**Endpoint:** `GET /api/mentor/schedules/alerts/summary`

**Authentication:** Required (Bearer Token)

**Description:** Get a summary of all alerts organized by urgency and type.

**Request Example:**
```bash
curl -X GET "http://localhost:3000/api/mentor/schedules/alerts/summary" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Alerts summary fetched successfully",
  "data": {
    "summary": {
      "total": 5,
      "byUrgency": {
        "high": 2,
        "medium": 2,
        "low": 1
      },
      "byType": {
        "no_confirmation": 2,
        "client_cancellation": 1,
        "no_show": 1,
        "reschedule_request": 1
      }
    }
  }
}
```

---

## 🔐 Security & Permissions

✅ **Authentication Required**
- All endpoints require valid JWT token in `Authorization: Bearer` header
- 24-hour token expiration

✅ **READ-ONLY Access**
- Mentors can ONLY VIEW schedules
- Mentors can ONLY VIEW alerts
- Mentors can ONLY ACKNOWLEDGE alerts

❌ **Cannot Modify Schedules**
- No create, update, or delete schedule endpoints
- Schedule management is PT/admin only

❌ **Cannot Modify Alerts**
- Cannot delete alerts
- Cannot change alert urgency or type
- Can only mark as resolved (acknowledged)

✅ **Mentor-PT Relationship Validation**
- Schedules are filtered to only show trainers assigned to the mentor
- Alerts are filtered to only show assigned trainer schedules

---

## 📊 Data Fields

### Schedule Object
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique schedule identifier |
| ptId | string | Trainer/PT user ID |
| ptName | string | Trainer full name |
| ptAvatar | string | Trainer avatar URL |
| clientId | string | Client/customer user ID |
| clientName | string | Client full name |
| sessionType | string | Type of session (e.g., "Strength Training") |
| date | string | Session date (YYYY-MM-DD) |
| startTime | string | Session start time (HH:MM) |
| endTime | string | Session end time (HH:MM) |
| duration | number | Session duration in minutes |
| status | string | Schedule status |
| location | string | Session location |
| notes | string | Additional notes |
| confirmed | boolean | Whether PT confirmed |
| reminderSent | boolean | Whether reminder was sent |

### Alert Object
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique alert identifier |
| type | string | Alert type (see Alert Types below) |
| urgency | string | Alert urgency level |
| scheduleId | string | Related schedule ID |
| ptName | string | Trainer name (if applicable) |
| clientName | string | Client name (if applicable) |
| message | string | Alert message |
| createdAt | string | ISO timestamp when alert was created |
| resolved | boolean | Whether alert is resolved |

### Statistics Object
| Field | Type | Description |
|-------|------|-------------|
| totalSchedules | number | Total schedules in period |
| confirmedSchedules | number | Confirmed schedules |
| pendingConfirmation | number | Awaiting confirmation |
| cancelledSchedules | number | Cancelled schedules |
| completedSessions | number | Completed sessions |
| totalDuration | number | Total session time (minutes) |
| averageSessionDuration | number | Average session length |
| noShowRate | number | Percentage of no-show rate |
| clientRetentionRate | number | Percentage of client retention |

---

## 📌 Schedule Status

| Status | Description |
|--------|-------------|
| `scheduled` | Initial status, awaiting confirmation |
| `confirmed` | PT has confirmed the schedule |
| `rescheduled` | Schedule has been moved to different time/date |
| `cancelled` | Schedule has been cancelled |
| `completed` | Session has been completed |
| `no_show` | PT or client did not show up |

---

## ⚠️ Alert Types

| Type | Description |
|------|-------------|
| `no_confirmation` | PT hasn't confirmed schedule |
| `client_cancellation` | Client cancelled session |
| `no_show` | PT or client didn't show up |
| `reschedule_request` | Reschedule request pending |
| `schedule_conflict` | Schedule conflict detected |

---

## 🎯 Alert Urgency

| Level | Description |
|-------|-------------|
| `high` | Requires immediate attention |
| `medium` | Should be addressed soon |
| `low` | Informational, can address later |

---

## ❌ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Error message describing what went wrong",
  "error": "ERROR_CODE"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You do not have access to this resource",
  "error": "FORBIDDEN"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found",
  "error": "NOT_FOUND"
}
```

---

## 🔔 Auto-Notifications

When schedules change (create, update, cancel), alerts are automatically generated:
- Mentors receive notifications about schedule changes
- Alerts are sent to notification service
- Unread count is updated in real-time

---

## 🧪 Testing

### Test Queries

**Get today's schedules:**
```bash
curl -X GET "http://localhost:3000/api/mentor/schedules?date=2026-08-14" \
  -H "Authorization: Bearer $TOKEN"
```

**Get this week's schedules:**
```bash
curl -X GET "http://localhost:3000/api/mentor/schedules/range?startDate=2026-08-14&endDate=2026-08-20" \
  -H "Authorization: Bearer $TOKEN"
```

**Get high-urgency alerts:**
```bash
curl -X GET "http://localhost:3000/api/mentor/schedules/alerts?urgency=high" \
  -H "Authorization: Bearer $TOKEN"
```

**Get weekly statistics:**
```bash
curl -X GET "http://localhost:3000/api/mentor/schedules/stats?period=week" \
  -H "Authorization: Bearer $TOKEN"
```

---

## ✅ Key Features

✅ **READ-ONLY Access**
- View schedules without modification ability
- View alerts without creation/deletion

✅ **Flexible Filtering**
- Filter by date, status, urgency
- Pagination support
- Date range queries

✅ **Analytics**
- Schedule statistics by period
- Alert summaries
- No-show and retention rates

✅ **Alert Management**
- View all alert types
- Acknowledge resolved alerts
- Track alert resolution

✅ **Performance**
- Indexed queries for fast access
- Efficient pagination
- Relationship validation

---

## 📝 Notes

- All timestamps are in ISO 8601 format (UTC)
- Schedules are automatically created by PTs (not via this API)
- Alerts are auto-generated on schedule changes
- Mentors can only view schedules of their assigned trainers
- Read-only ensures data integrity

---

## 🚀 Production Ready

✅ Error handling
✅ Input validation
✅ Security features
✅ Performance optimized
✅ Fully documented
✅ Zero breaking changes
