# Mentor Dashboard API Documentation

## Overview

The Mentor Dashboard API provides real-time KPI statistics and performance analytics for mentors to track their assigned trainers' performance, client management, and operational metrics.

---

## 📋 Endpoints

### 1. Get Dashboard Overview

**Endpoint:** `GET /api/mentor/dashboard/overview`

**Authentication:** Required (Bearer Token)

**Request Example:**
```bash
curl -X GET "http://localhost:3000/api/mentor/dashboard/overview" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Dashboard overview fetched successfully",
  "data": {
    "stats": {
      "totalAssignedPTs": 24,
      "activePTs": 18,
      "atRiskPTs": 3,
      "clientsManaged": 482,
      "avgFeedbackScore": 4.8,
      "upcomingCheckIns": 12,
      "monthlyOperationalHours": 1240
    }
  }
}
```

**Response Fields:**
| Field | Type | Description |
|-------|------|-------------|
| totalAssignedPTs | number | Total trainers assigned to mentor |
| activePTs | number | Trainers with activity in last 30 days |
| atRiskPTs | number | Trainers with rating < 3.5 |
| clientsManaged | number | Total unique clients across all trainers |
| avgFeedbackScore | number | Average rating (0-5 scale) |
| upcomingCheckIns | number | Scheduled sessions in future |
| monthlyOperationalHours | number | Total scheduled hours this month |

---

### 2. Get Performance Trajectory (Chart Data)

**Endpoint:** `GET /api/mentor/dashboard/performance-trajectory`

**Authentication:** Required (Bearer Token)

**Query Parameters:**
- `period` (optional, default: "7D") - "7D" or "30D"

**Request Example:**
```bash
curl -X GET "http://localhost:3000/api/mentor/dashboard/performance-trajectory?period=7D" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Performance trajectory fetched successfully",
  "data": {
    "period": "7D",
    "chartData": [
      {
        "date": "2026-08-08",
        "score": 4.2,
        "trend": "up"
      },
      {
        "date": "2026-08-09",
        "score": 4.4,
        "trend": "up"
      },
      {
        "date": "2026-08-10",
        "score": 4.6,
        "trend": "up"
      },
      {
        "date": "2026-08-11",
        "score": 4.5,
        "trend": "down"
      },
      {
        "date": "2026-08-12",
        "score": 4.7,
        "trend": "up"
      }
    ],
    "labels": ["08/08", "08/09", "08/10", "08/11", "08/12"],
    "summary": {
      "avgScore": 4.5,
      "trend": "upward",
      "percentChange": "+12%"
    }
  }
}
```

**Response Fields:**

**Chart Data:**
| Field | Type | Description |
|-------|------|-------------|
| date | string | Date (YYYY-MM-DD) |
| score | number | Average performance score for day |
| trend | string | Trend vs previous day: "up", "down", "flat" |

**Summary:**
| Field | Type | Description |
|-------|------|-------------|
| avgScore | number | Average score for period |
| trend | string | Overall trend: "upward", "downward", "flat" |
| percentChange | string | % change from start to end of period |

---

### 3. Get Dashboard Summary

**Endpoint:** `GET /api/mentor/dashboard/summary`

**Authentication:** Required (Bearer Token)

**Request Example:**
```bash
curl -X GET "http://localhost:3000/api/mentor/dashboard/summary" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Dashboard summary fetched successfully",
  "data": {
    "summary": {
      "totalAssignedPTs": 24,
      "activePTs": 18,
      "atRiskPTs": 3,
      "avgFeedbackScore": 4.8,
      "upcomingEvents": 12,
      "totalClientsManaged": 482
    }
  }
}
```

---

## 🎯 KPI Cards

| Card | Metric | Data Source | Clickable | Default |
|------|--------|-------------|-----------|---------|
| Total Assigned PTs | totalAssignedPTs | mentorTrainerAssignments count | Yes → /pt-dashboard | 24 |
| Active PTs | activePTs | Trainers with bookings in 30d | No | 18 |
| At-Risk PTs | atRiskPTs | Trainers with rating < 3.5 | No | 3 |
| Clients Managed | clientsManaged | Distinct customers | No | 482 |
| Avg Feedback Score | avgFeedbackScore | Average of all trainer ratings | Yes → /trainer-review | 4.8 |
| Upcoming Check-ins | upcomingCheckIns | Future confirmed sessions | No | 12 |
| Monthly Op Hours | monthlyOperationalHours | Sum of session durations | No | 1,240 |

---

## 📊 Performance Trajectory Chart

### Chart Configuration

**Type:** Line chart with gradient fill

**X-Axis:** Date labels
- Format: MM/DD (e.g., "08/08")
- Shows every other day for clarity
- 7 data points for 7D view
- 15 data points for 30D view

**Y-Axis:** Performance score (0.0 - 5.0)

**Data Points:** Daily average performance scores

**Trend Indicators:**
- Up arrow/green: Score improved vs previous day
- Down arrow/red: Score decreased vs previous day
- Flat: No change

### Metrics Provided

| Metric | Calculation | Example |
|--------|-------------|---------|
| avgScore | Sum of daily scores ÷ number of days | 4.5 |
| trend | Compare first half vs second half average | "upward" |
| percentChange | ((latest - first) ÷ first) × 100 | "+12%" |

---

## 🔐 Security & Permissions

✅ **Authentication Required**
- All endpoints require valid JWT token in `Authorization: Bearer` header
- 24-hour token expiration

✅ **Access Control**
- Mentors can only view stats for their assigned trainers
- Data automatically filtered by mentor-trainer relationships

✅ **Real-Time Data**
- All metrics calculated from current database state
- No caching - fresh data on each request

---

## 📈 Calculations

### Active PTs
```
WHERE trainerId IN (assigned trainers)
AND createdAt >= (30 days ago)
COUNT DISTINCT trainerId
```

### At-Risk PTs
```
Average Rating = SUM(review.rating) / COUNT(reviews)
WHERE Average Rating < 3.5
```

### Clients Managed
```
WHERE trainerId IN (assigned trainers)
SELECT DISTINCT customerId FROM trainerBooking
```

### Avg Feedback Score
```
SUM(average rating per trainer) / COUNT(trainers with reviews)
```

### Upcoming Check-ins
```
WHERE trainerId IN (assigned trainers)
AND timeSlot.date >= TODAY
AND bookingStatus IN ['PENDING', 'CONFIRMED']
```

### Monthly Operational Hours
```
WHERE trainerId IN (assigned trainers)
AND timeSlot.date BETWEEN month_start AND month_end
SUM(timeSlot.durationMinutes) / 60
```

### Performance Score
```
For each day:
  avgScore = SUM(trainer.rating for all reviews that day) / COUNT(reviews)
```

---

## ❌ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Period must be either '7D' or '30D'",
  "error": "INVALID_PERIOD"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized or token expired",
  "error": "UNAUTHORIZED"
}
```

---

## 🧪 Testing

### Test Queries

**Get overview:**
```bash
curl -X GET "http://localhost:3000/api/mentor/dashboard/overview" \
  -H "Authorization: Bearer $TOKEN"
```

**Get 7-day performance:**
```bash
curl -X GET "http://localhost:3000/api/mentor/dashboard/performance-trajectory?period=7D" \
  -H "Authorization: Bearer $TOKEN"
```

**Get 30-day performance:**
```bash
curl -X GET "http://localhost:3000/api/mentor/dashboard/performance-trajectory?period=30D" \
  -H "Authorization: Bearer $TOKEN"
```

**Get summary:**
```bash
curl -X GET "http://localhost:3000/api/mentor/dashboard/summary" \
  -H "Authorization: Bearer $TOKEN"
```

---

## ✅ Features

✅ **Real-Time KPI Metrics**
- Live calculation from database
- No stale data

✅ **Performance Analytics**
- Daily trend tracking
- Period comparison (7D vs 30D)
- Percentage change calculation

✅ **Risk Identification**
- At-risk trainer detection (rating < 3.5)
- Actionable insights

✅ **Operational Visibility**
- Hours tracking
- Client management metrics
- Check-in scheduling

✅ **Chart-Ready Data**
- Pre-formatted for frontend charts
- Labels included
- Trend data included

---

## 📝 Notes

- All timestamps in ISO 8601 format (UTC)
- Scores rounded to 1 decimal place
- Period-based lookback (not rolling 24h)
- "Active" defined as activity within last 30 days
- At-risk threshold: rating < 3.5

---

## 🚀 Production Ready

✅ Performance optimized queries
✅ Efficient data filtering
✅ Error handling
✅ Input validation
✅ Security features
✅ Fully documented
✅ Real-time calculations
