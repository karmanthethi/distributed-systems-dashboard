# 🎨 Visual Feature Guide

## Quick Access to All New Features

### 1. Start the Server
```powershell
# Method 1: PowerShell Script
.\start-server.ps1

# Method 2: Direct Node
node server.js

# Method 3: npm
npm start
```

**Expected Output:**
```
🌍 Starting External API Monitoring...

╔════════════════════════════════════════════════════════════════════╗
║     🚀 ENTERPRISE DISTRIBUTED SYSTEMS MONITORING DASHBOARD 🚀      ║
║                         Version 3.0.0                              ║
╚════════════════════════════════════════════════════════════════════╝

📊 Dashboard: http://localhost:3000
```

---

### 2. View Dashboard (Main View)

**URL:** http://localhost:3000

**What You'll See:**
```
┌─────────────────────────────────────────────────────────────┐
│  DISTRIBUTED SYSTEMS MONITOR                     [≡] Menu   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Health   │ │ Total    │ │ Error    │ │ Anomalies│       │
│  │ Score    │ │ Requests │ │ Rate     │ │          │       │
│  │   94%    │ │  15,234  │ │  8.5%    │ │    3     │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Service A - API Gateway               🟢 HEALTHY     │   │
│  │ ────────────────────────────────────────────────     │   │
│  │ Health: 92% | Latency: 145ms | Availability: 98.5%  │   │
│  │ Region: US-East | Errors: 12% | Requests: 1,523     │   │
│  │ Timeouts: 3 | Crashes: 0                            │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ GitHub API                            🟢 HEALTHY     │   │
│  │ ────────────────────────────────────────────────     │   │
│  │ Health: 98% | Latency: 125ms | Availability: 99.8%  │   │
│  │ Region: US-East | Errors: 0.5% | Requests: 234      │   │
│  │ Timeouts: 0 | Crashes: 0                            │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  [...more services...]                                       │
│                                                               │
│  [Simulate Traffic] [Stress Test] [Reset Metrics]           │
└─────────────────────────────────────────────────────────────┘
```

**Key Elements:**
- **Top Stats Cards**: Overall system health at a glance
- **Service Cards**: Each service with real-time metrics
- **Status Indicators**: 🟢 Green (healthy), 🟡 Yellow (degraded), 🔴 Red (critical)
- **Action Buttons**: Generate load or reset data

---

### 3. View Service Details (Click Any Service Card)

**What You'll See:**
```
┌─────────────────────────────────────────────────────────────┐
│  GitHub API                       Health: 98% | Avail: 99.8%│
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  REQUEST METRICS                                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ Total: 234   │ │ Success: 233 │ │ Failed: 1    │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                               │
│  TIMING BREAKDOWN                                            │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ DNS: 15ms    │ │ TCP: 25ms    │ │ TLS: 45ms    │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ TTFB: 85ms   │ │ Avg: 125ms   │ │ P99: 280ms   │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                               │
│  FAILURE ANALYSIS                                            │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ Crashes: 0   │ │ Timeouts: 0  │ │ Network: 1   │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│  ┌──────────────┐ ┌──────────────┐                         │
│  │ Retries: 2   │ │ Consec: 0    │                         │
│  └──────────────┘ └──────────────┘                         │
│                                                               │
│  RECENT TRACES                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ trace-kx2m3n4-abcd1234-0042                          │   │
│  │ /users/github | 200 | 125ms | 10:23:45 AM           │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ trace-kx2m3n5-efgh5678-0043                          │   │
│  │ /users/github | 200 | 132ms | 10:23:50 AM           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Key Metrics:**
- **Request Metrics**: Success/failure counts
- **Timing Breakdown**: DNS → TCP → TLS → TTFB → Total
- **Failure Analysis**: Crashes, timeouts, network errors
- **Recent Traces**: Last 100 requests with trace IDs

---

### 4. Test API Endpoints

#### Get All Metrics
```powershell
curl http://localhost:3000/api/metrics
```

**Example Response:**
```json
{
  "success": true,
  "timestamp": 1704124800000,
  "data": {
    "Service A": {
      "healthScore": 92,
      "availability": "98.50",
      "avgLatency": 145,
      "avgDnsLookupTime": 15,
      "avgTcpConnectionTime": 25,
      "avgTlsHandshakeTime": 45,
      "avgTimeToFirstByte": 85,
      "timeouts": 3,
      "consecutiveFailures": 0,
      "region": "US-East",
      "recentTraces": [...]
    },
    "GitHub API": {...},
    "OpenWeather API": {...}
  }
}
```

#### Get External APIs List
```powershell
curl http://localhost:3000/api/external-apis
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "GitHub API",
      "url": "https://api.github.com/users/github",
      "region": "US-East",
      "method": "GET"
    },
    {...}
  ]
}
```

#### Get Regional Comparison
```powershell
curl http://localhost:3000/api/regions
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "US-East": {
      "services": ["GitHub API", "Service A", "JSONPlaceholder"],
      "totalRequests": 3250,
      "avgLatency": 125,
      "avgErrorRate": 8.5,
      "availability": 97.8
    },
    "EU-West": {...},
    "US-Central": {...},
    "US-West": {...}
  }
}
```

#### Get Anomalies
```powershell
curl http://localhost:3000/api/anomalies
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "type": "HIGH_LATENCY",
      "service": "Service C",
      "value": 850,
      "threshold": 500,
      "timestamp": 1704124750000
    },
    {
      "type": "SERVICE_DOWN",
      "service": "OpenWeather API",
      "consecutiveFailures": 5,
      "timestamp": 1704124755000
    }
  ]
}
```

---

### 5. Simulate Traffic

**Method 1: UI Button**
1. Click "Simulate Traffic" button on dashboard
2. Watch metrics update in real-time
3. Duration: 60 seconds

**Method 2: API Call**
```powershell
curl -X POST http://localhost:3000/api/simulate-traffic `
  -H "Content-Type: application/json" `
  -d '{"duration": 60, "intensity": 100}'
```

---

### 6. Run Stress Test

**Method 1: UI Button**
1. Click "Stress Test" button on dashboard
2. Observe performance under load
3. Duration: 30 seconds, 50 concurrent requests

**Method 2: API Call**
```powershell
curl -X POST http://localhost:3000/api/stress-test `
  -H "Content-Type: application/json" `
  -d '{"duration": 30, "concurrency": 50}'
```

---

### 7. View Timing Breakdown (Detailed)

**Where to Find:**
1. Click any service card on dashboard
2. Scroll to "TIMING BREAKDOWN" section
3. View all timing phases:

```
DNS Lookup Time     →  15ms   (Domain resolution)
TCP Connection Time →  25ms   (Socket establishment)
TLS Handshake Time  →  45ms   (SSL negotiation)
Time to First Byte  →  85ms   (Server processing)
─────────────────────────────────────────────────
Total Latency       → 170ms   (End-to-end)
P99 Latency         → 280ms   (99th percentile)
```

---

### 8. Check Request Traces

**Where to Find:**
1. Click any service card
2. Scroll to "RECENT TRACES" section
3. Each trace shows:
   - Unique trace ID (e.g., `trace-kx2m3n4-abcd1234-0042`)
   - Endpoint path
   - HTTP status code
   - Response time
   - Timestamp

**Trace ID Format Explained:**
```
trace-kx2m3n4-abcd1234-0042
      │       │        └─ Counter (sequential)
      │       └────────── Random string (8 chars)
      └────────────────── Timestamp in base36
```

---

### 9. Compare Regions

**Where to Find:**
1. Access API: `/api/regions`
2. Or view region badges on service cards

**Regional Breakdown:**
```
US-East:    GitHub API, Service A, JSONPlaceholder
EU-West:    OpenWeather API
US-Central: DummyJSON API
US-West:    FakeStore API, Service B, Service C
```

---

### 10. Monitor Availability

**Where to Find:**
- Service cards show: "Availability: XX.XX%"
- Color coding:
  - 🟢 Green: ≥ 95%
  - 🟡 Yellow: 90-95%
  - 🔴 Red: < 90%

**Calculation:**
```
Last 60 Requests:
- Successful: 58
- Failed: 2
- Availability: (58/60) × 100 = 96.67%
```

---

### 11. Detect Crashes

**Crash Indicators:**
- "Crashes" count on service card
- Consecutive failures tracked
- SERVICE_DOWN anomaly if ≥ 5 consecutive failures

**How to Test:**
1. Stop an external API (network disconnect)
2. Wait 30 seconds (5-6 failed requests)
3. Check anomalies: `curl http://localhost:3000/api/anomalies`
4. Look for SERVICE_DOWN anomaly

---

### 12. View Performance Charts

**Where to Find:**
1. Click "Performance" in sidebar navigation
2. View charts:
   - Latency over time (line chart)
   - Error rate trend (area chart)
   - Service comparison (bar chart)
   - Regional performance (pie chart)

---

## 🎯 Quick Test Checklist

Run these commands to verify all features:

```powershell
# 1. Server is running
curl http://localhost:3000/api/health

# 2. External APIs monitored
curl http://localhost:3000/api/external-apis

# 3. Metrics include timing data
curl http://localhost:3000/api/metrics | Select-String "avgDnsLookupTime"

# 4. Trace IDs present
curl http://localhost:3000/api/metrics | Select-String "trace-"

# 5. Regional data available
curl http://localhost:3000/api/regions

# 6. Anomalies detected
curl http://localhost:3000/api/anomalies

# 7. System stats
curl http://localhost:3000/api/system-stats

# 8. Simulate traffic
curl -X POST http://localhost:3000/api/simulate-traffic `
  -H "Content-Type: application/json" `
  -d '{"duration":10,"intensity":50}'
```

---

## 📊 Expected Metrics After 30 Seconds

```
Service A:         500-800 requests,    92-95% health
Service B:         300-600 requests,    88-92% health
Service C:         200-400 requests,    82-88% health
GitHub API:        4-6 requests,        98-99% health
OpenWeather API:   4-6 requests,        95-98% health
DummyJSON API:     4-6 requests,        98-99% health
FakeStore API:     4-6 requests,        97-99% health
JSONPlaceholder:   4-6 requests,        98-99% health
```

---

## 🎨 UI Color Guide

```
Status Colors:
🟢 #6bcf7f - Healthy (> 95% availability)
🟡 #ffd93d - Degraded (90-95% availability)
🔴 #ff006e - Critical (< 90% availability)

Metric Colors:
🔵 #00d9ff - Primary (latency, normal metrics)
🟠 #ff9a3c - Warning (timeouts, high errors)
🔴 #ff006e - Danger (crashes, failures)
⚪ #e0e0e0 - Secondary (labels, borders)
```

---

## 🚀 Pro Tips

1. **Best Time to View:** Wait 15-20 seconds after server start for external APIs to populate
2. **Refresh Rate:** Dashboard auto-refreshes every 2 seconds
3. **Trace IDs:** Click service details to see full trace history
4. **Regional View:** Check `/api/regions` for geographic performance
5. **Stress Testing:** Use stress test to see crash detection in action
6. **Mobile View:** Dashboard is fully responsive

---

**🎉 All features are now accessible and ready to demo!**
