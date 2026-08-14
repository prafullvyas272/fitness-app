# Mentor Reports API Documentation

## Overview

The Mentor Reports API allows mentors to view, filter, and manage reports/tickets for their assigned trainers. Mentors can view reports, update status/priority, add resolution notes, and track activity.

---

## 📋 Endpoints

### 1. Get All Reports

**Endpoint:** `GET /api/mentor/reports`

**Authentication:** Required (Bearer Token)

**Query Parameters:**
- `status` (optional) - Filter by status: "OPEN", "IN_REVIEW", "RESOLVED"
- `priority` (optional) - Filter by priority: "CRITICAL", "HIGH", "ROUTINE"
- `category` (optional) - Filter by category: "CONDUCT", "TECHNICAL", "PERFORMANCE"
- `trainerId` (optional) - Filter by specific trainer
- `search` (optional) - Search by report ID or trainer name
- `page` (optional, default: 1) - Page number for pagination
- `limit` (optional, default: 20) - Results per page

**Request Example:**
```bash
curl -X GET "http://localhost:3000/api/mentor/reports?status=OPEN&priority=CRITICAL&category=CONDUCT&search=TR-4029&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Reports fetched successfully",
  "data": {
    "reports": [
      {
        "id": "TR-4029",
        "trainerName": "Marcus Thorne",
        "trainerAvatar": "https://i.pravatar.cc/150?img=15",
        "trainerId": "pt_001",
        "reporterName": "L. Kensington",
        "category": "CONDUCT",
        "priority": "CRITICAL",
        "status": "OPEN",
        "date": "2026-08-14T10:30:00Z",
        "description": "Trainer conduct complaint from client",
        "clientName": "John Doe",
        "resolutionNotes": null,
        "createdAt": "2026-08-14T10:30:00Z",
        "updatedAt": "2026-08-14T10:30:00Z"
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

### 2. Get Single Report Details

**Endpoint:** `GET /api/mentor/reports/{reportId}`

**Authentication:** Required (Bearer Token)

**Parameters:**
- `reportId` (path, required) - Report ID (e.g., "TR-4029")

**Request Example:**
```bash
curl -X GET "http://localhost:3000/api/mentor/reports/TR-4029" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Report fetched successfully",
  "data": {
    "report": {
      "id": "TR-4029",
      "trainerName": "Marcus Thorne",
      "trainerAvatar": "https://i.pravatar.cc/150?img=15",
      "trainerId": "pt_001",
      "reporterName": "L. Kensington",
      "category": "CONDUCT",
      "priority": "CRITICAL",
      "status": "OPEN",
      "date": "2026-08-14T10:30:00Z",
      "description": "Detailed description of the report/incident",
      "clientName": "John Doe",
      "clientEmail": "john@fitness.com",
      "incidentDate": "2026-08-13",
      "incidentLocation": "Nexus Central Hub",
      "resolutionNotes": null,
      "assignedTo": "Admin Name",
      "attachments": [
        {
          "id": "att_001",
          "fileName": "evidence.pdf",
          "url": "https://...",
          "uploadedAt": "2026-08-14T10:30:00Z"
        }
      ],
      "timeline": [
        {
          "action": "created",
          "by": "L. Kensington",
          "timestamp": "2026-08-14T10:30:00Z",
          "note": "Report submitted"
        },
        {
          "action": "assigned",
          "by": "Admin",
          "timestamp": "2026-08-14T11:00:00Z",
          "note": "Assigned to admin for review"
        }
      ],
      "createdAt": "2026-08-14T10:30:00Z",
      "updatedAt": "2026-08-14T11:00:00Z"
    }
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Report not found",
  "error": "NOT_FOUND"
}
```

---

### 3. Update Report Status

**Endpoint:** `PUT /api/mentor/reports/{reportId}`

**Authentication:** Required (Bearer Token)

**Request Body:**
```json
{
  "status": "RESOLVED",
  "priority": "HIGH",
  "resolutionNotes": "Issue has been resolved with trainer",
  "action": "status_update"
}
```

**Request Example:**
```bash
curl -X PUT "http://localhost:3000/api/mentor/reports/TR-4029" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "RESOLVED",
    "priority": "HIGH",
    "resolutionNotes": "Issue has been resolved with trainer",
    "action": "status_update"
  }'
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Report updated successfully",
  "data": {
    "reportId": "TR-4029",
    "status": "RESOLVED",
    "updatedAt": "2026-08-14T12:00:00Z"
  }
}
```

**Error Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "You do not have access to this report",
  "error": "FORBIDDEN"
}
```

---

### 4. Get Activity Feed

**Endpoint:** `GET /api/mentor/reports/activity/feed`

**Authentication:** Required (Bearer Token)

**Query Parameters:**
- `limit` (optional, default: 20) - Number of activities to return

**Request Example:**
```bash
curl -X GET "http://localhost:3000/api/mentor/reports/activity/feed?limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Activity feed fetched successfully",
  "data": {
    "activities": [
      {
        "id": "act_001",
        "action": "report_created",
        "text": "New report submitted for Trainer Marcus Thorne",
        "relatedReportId": "TR-4029",
        "severity": "high",
        "timestamp": "2026-08-14T10:30:00Z"
      },
      {
        "id": "act_002",
        "action": "status_updated",
        "text": "TR-3960 closed after resolution confirmed",
        "relatedReportId": "TR-3960",
        "severity": "low",
        "timestamp": "2026-08-14T09:00:00Z"
      }
    ],
    "total": 20
  }
}
```

---

### 5. Get Report Statistics

**Endpoint:** `GET /api/mentor/reports/stats`

**Authentication:** Required (Bearer Token)

**Query Parameters:**
- `period` (optional, default: "month") - Statistics period: "week", "month", "quarter", "year"

**Request Example:**
```bash
curl -X GET "http://localhost:3000/api/mentor/reports/stats?period=month" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Statistics fetched successfully",
  "data": {
    "stats": {
      "totalReports": 45,
      "openReports": 12,
      "pendingReports": 8,
      "resolvedReports": 25,
      "byPriority": {
        "CRITICAL": 3,
        "HIGH": 8,
        "ROUTINE": 34
      },
      "byCategory": {
        "CONDUCT": 15,
        "TECHNICAL": 18,
        "PERFORMANCE": 12
      },
      "byTrainer": {
        "Marcus Thorne": 8,
        "Elena Vance": 12,
        "Alistair Sterling": 9,
        "Evelyn Cross": 16
      },
      "avgResolutionTime": "48 hours",
      "unresolvedPercentage": 45
    }
  }
}
```

---

### 6. Get Reports Summary (Dashboard)

**Endpoint:** `GET /api/mentor/reports/summary`

**Authentication:** Required (Bearer Token)

**Request Example:**
```bash
curl -X GET "http://localhost:3000/api/mentor/reports/summary" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Summary fetched successfully",
  "data": {
    "summary": {
      "criticalCount": 3,
      "highCount": 8,
      "openCount": 12,
      "pendingCount": 8,
      "recentReports": [
        {
          "id": "TR-4029",
          "trainerName": "Marcus Thorne",
          "priority": "CRITICAL",
          "status": "OPEN",
          "date": "2026-08-14T10:30:00Z"
        }
      ]
    }
  }
}
```

---

## 🔐 Security & Permissions

✅ **Authentication Required**
- All endpoints require valid JWT token in `Authorization: Bearer` header
- 24-hour token expiration

✅ **Access Control**
- Mentors can ONLY view reports for their assigned trainers
- Cannot access reports from trainers not in their supervision list

✅ **Mentor-Trainer Relationship Validation**
- Reports are filtered to only show trainers assigned to the mentor
- Attempting to access a report from an unassigned trainer returns 403 Forbidden

❌ **Cannot Delete Reports**
- Mentors can view and update status only
- Cannot delete or remove reports
- Report data is immutable once created

---

## 📊 Data Fields

### Report Object
| Field | Type | Description |
|-------|------|-------------|
| id | string | Report ID (e.g., "TR-4029") |
| trainerName | string | Trainer full name |
| trainerAvatar | string | Trainer avatar URL |
| trainerId | string | Trainer user ID |
| reporterName | string | Name of person who submitted report |
| category | string | Report category (see categories below) |
| priority | string | Report priority level |
| status | string | Report status |
| date | string | Report creation date (ISO 8601) |
| description | string | Report description |
| clientName | string | Client/customer name |
| clientEmail | string | Client email |
| incidentDate | string | When incident occurred |
| incidentLocation | string | Where incident occurred |
| resolutionNotes | string | Notes from mentor's resolution |
| assignedTo | string | Admin assigned to review |
| attachments | array | Evidence files |
| timeline | array | Activity timeline |
| createdAt | string | ISO timestamp |
| updatedAt | string | ISO timestamp |

### Attachment Object
| Field | Type | Description |
|-------|------|-------------|
| id | string | Attachment ID |
| fileName | string | File name |
| url | string | File URL |
| uploadedAt | string | ISO timestamp |

### Timeline Event Object
| Field | Type | Description |
|-------|------|-------------|
| action | string | Action type (see timeline actions) |
| by | string | User who performed action |
| timestamp | string | ISO timestamp |
| note | string | Description of action |

### Activity Object
| Field | Type | Description |
|-------|------|-------------|
| id | string | Activity ID |
| action | string | Activity type |
| text | string | Activity description |
| relatedReportId | string | Associated report ID |
| severity | string | Activity severity |
| timestamp | string | ISO timestamp |

---

## 📌 Report Status

| Status | Description |
|--------|-------------|
| `OPEN` | New report, awaiting review |
| `IN_REVIEW` | Under investigation |
| `RESOLVED` | Issue resolved |

---

## ⚡ Report Priority

| Priority | Description |
|----------|-------------|
| `CRITICAL` | Immediate action required |
| `HIGH` | Urgent attention needed |
| `ROUTINE` | Standard priority |

---

## 📋 Report Category

| Category | Description |
|----------|-------------|
| `CONDUCT` | Trainer behavior/ethics |
| `TECHNICAL` | Training method or system issues |
| `PERFORMANCE` | Performance-related concerns |
| `ATTENDANCE` | Attendance/punctuality issues |
| `PAYMENT` | Payment-related issues |
| `ACCOUNT` | Account-related issues |
| `OTHER` | Other issues |

---

## 📅 Timeline Actions

| Action | Description |
|--------|-------------|
| `created` | Report was created |
| `assigned` | Report assigned to admin |
| `status_changed` | Status was updated |
| `priority_changed` | Priority was updated |
| `note_added` | Resolution note added |
| `resolved` | Report marked as resolved |

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
  "message": "You do not have access to this report",
  "error": "FORBIDDEN"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Report not found",
  "error": "NOT_FOUND"
}
```

---

## 🧪 Testing

### Test Queries

**Get critical reports:**
```bash
curl -X GET "http://localhost:3000/api/mentor/reports?priority=CRITICAL" \
  -H "Authorization: Bearer $TOKEN"
```

**Get open conduct reports:**
```bash
curl -X GET "http://localhost:3000/api/mentor/reports?status=OPEN&category=CONDUCT" \
  -H "Authorization: Bearer $TOKEN"
```

**Get monthly statistics:**
```bash
curl -X GET "http://localhost:3000/api/mentor/reports/stats?period=month" \
  -H "Authorization: Bearer $TOKEN"
```

**Get activity feed:**
```bash
curl -X GET "http://localhost:3000/api/mentor/reports/activity/feed?limit=50" \
  -H "Authorization: Bearer $TOKEN"
```

**Update report status:**
```bash
curl -X PUT "http://localhost:3000/api/mentor/reports/TR-4029" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "RESOLVED",
    "resolutionNotes": "Addressed with trainer"
  }'
```

---

## ✅ Key Features

✅ **Comprehensive Filtering**
- Filter by status, priority, category, trainer
- Search by report ID or trainer name
- Pagination support

✅ **Report Management**
- View all reports for assigned trainers
- Update status and priority
- Add resolution notes
- Track timeline of actions

✅ **Analytics**
- Statistics by period (week/month/quarter/year)
- Breakdown by priority and category
- Per-trainer report counts
- Unresolved percentage tracking

✅ **Activity Tracking**
- Activity feed for recent actions
- Timestamp for all activities
- Severity indicators

✅ **Security**
- Mentor-trainer relationship validation
- Read-only access controls
- No deletion capabilities

---

## 📝 Notes

- All timestamps are in ISO 8601 format (UTC)
- Report IDs are human-readable (e.g., TR-4029)
- Mentors can only manage reports for their assigned trainers
- All activities are automatically logged
- Resolution timeline tracks all status changes

---

## 🚀 Production Ready

✅ Error handling
✅ Input validation
✅ Security features
✅ Relationship validation
✅ Performance optimized
✅ Fully documented
✅ Activity logging
