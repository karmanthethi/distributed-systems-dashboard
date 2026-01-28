# Distributed Systems Observability Dashboard

A desktop application built with Electron to monitor multiple backend services and display real-time observability metrics.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     ELECTRON APPLICATION                         │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    MAIN PROCESS                           │   │
│  │                      (main.js)                            │   │
│  │                                                            │   │
│  │  • Manages application window lifecycle                   │   │
│  │  • Starts backend services on app launch                  │   │
│  │  • Handles IPC communication with renderer                │   │
│  └───────────────┬──────────────────────────┬────────────────┘   │
│                  │                          │                     │
│      ┌───────────▼──────────┐    ┌──────────▼───────────┐        │
│      │  BACKEND SERVICES    │    │  OBSERVABILITY       │        │
│      │   (services/)        │    │    (observer/)       │        │
│      │                      │    │                      │        │
│      │  ┌────────────────┐ │    │  ┌────────────────┐ │        │
│      │  │  Service A     │─┼────┼─►│ Metrics        │ │        │
│      │  │  • Latency:    │ │    │  │ Collector      │ │        │
│      │  │    0-1000ms    │ │    │  │                │ │        │
│      │  │  • Error: 15%  │ │    │  │ • Records all  │ │        │
│      │  └────────────────┘ │    │  │   metrics      │ │        │
│      │                      │    │  │ • In-memory    │ │        │
│      │  ┌────────────────┐ │    │  │   storage      │ │        │
│      │  │  Service B     │─┼────┼─►│                │ │        │
│      │  │  • Latency:    │ │    │  └────────┬───────┘ │        │
│      │  │    0-1000ms    │ │    │           │         │        │
│      │  │  • Error: 10%  │ │    │  ┌────────▼───────┐ │        │
│      │  └────────────────┘ │    │  │ Metrics        │ │        │
│      │                      │    │  │ Aggregator     │ │        │
│      │  ┌────────────────┐ │    │  │                │ │        │
│      │  │  Service C     │─┼────┼─►│ • Calculates   │ │        │
│      │  │  • Latency:    │ │    │  │   avg latency  │ │        │
│      │  │    0-1000ms    │ │    │  │ • Computes     │ │        │
│      │  │  • Error: 20%  │ │    │  │   error rate   │ │        │
│      │  └────────────────┘ │    │  │ • Counts reqs  │ │        │
│      │                      │    │  └────────────────┘ │        │
│      └──────────────────────┘    └──────────────────────┘        │
│                                           │                       │
│                                           │ IPC                   │
│      ┌────────────────────────────────────▼─────────────┐        │
│      │            RENDERER PROCESS                       │        │
│      │              (renderer/)                          │        │
│      │                                                    │        │
│      │  ┌──────────────────────────────────────────┐    │        │
│      │  │          DASHBOARD UI                     │    │        │
│      │  │                                            │    │        │
│      │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐  │    │        │
│      │  │  │Service A │ │Service B │ │Service C │  │    │        │
│      │  │  │  Card    │ │  Card    │ │  Card    │  │    │        │
│      │  │  │          │ │          │ │          │  │    │        │
│      │  │  │ Avg Lat  │ │ Avg Lat  │ │ Avg Lat  │  │    │        │
│      │  │  │ Error %  │ │ Error %  │ │ Error %  │  │    │        │
│      │  │  │ Req Cnt  │ │ Req Cnt  │ │ Req Cnt  │  │    │        │
│      │  │  └──────────┘ └──────────┘ └──────────┘  │    │        │
│      │  │                                            │    │        │
│      │  │  [Simulate Traffic Button]                │    │        │
│      │  │  Auto-refresh: Every 2 seconds            │    │        │
│      │  └──────────────────────────────────────────┘    │        │
│      └────────────────────────────────────────────────────┘        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## 📊 Metrics Flow

### 1. Service Request Simulation
Each service (`service-a`, `service-b`, `service-c`) runs continuously and:
- Generates requests at random intervals (2-5 seconds)
- Simulates random latency between **0-1000 milliseconds**
- Randomly generates HTTP status codes:
  - **200** (Success) - majority of requests
  - **500** (Error) - random percentage per service

### 2. Metrics Collection
When a request completes:
```javascript
{
  serviceName: "service-a",
  timestamp: 1640000000000,
  latency: 450,        // milliseconds
  statusCode: 200      // or 500
}
```

The metrics collector:
- Stores each metric in an in-memory array
- Maintains a rolling window of last 1000 metrics
- No persistence (resets on app restart)

### 3. Metrics Aggregation
The aggregator processes all stored metrics per service:

#### Average Latency
```
avgLatency = SUM(all latencies) / COUNT(requests)
```

#### Error Rate
```
errorRate = (COUNT(status >= 500) / COUNT(total requests)) × 100
```

#### Request Count
```
requestCount = COUNT(total requests for service)
```

### 4. Dashboard Display
- **Auto-refresh**: Every 2 seconds
- **Visual alerts**: 
  - 🟢 Green (Normal): Latency < 600ms AND Error rate < 10%
  - 🟡 Yellow (Warning): Latency >= 600ms OR Error rate >= 10%
  - 🔴 Red (Critical): Latency >= 800ms OR Error rate >= 20%

## 🎲 Random Failures Explanation

### Why Random Failures?
In real distributed systems, failures occur unpredictably due to:
- Network issues
- Resource exhaustion
- Downstream service failures
- Race conditions

### Implementation
Each service has a configurable error probability:

**Service A** - 15% error rate
```javascript
function getRandomStatusCode() {
  return Math.random() < 0.15 ? 500 : 200;
}
```

**Service B** - 10% error rate
```javascript
function getRandomStatusCode() {
  return Math.random() < 0.10 ? 500 : 200;
}
```

**Service C** - 20% error rate (most unreliable)
```javascript
function getRandomStatusCode() {
  return Math.random() < 0.20 ? 500 : 200;
}
```

### Latency Simulation
```javascript
function getRandomLatency() {
  return Math.floor(Math.random() * 1000);
}
```
- Produces values between 0-999 milliseconds
- Uniform distribution
- Simulates variable network/processing time

## 🚀 Running the Application

### Prerequisites
- Node.js (v16 or higher)
- npm

### Installation

1. **Clone the repository**:
```bash
git clone https://github.com/karmanthethi/distributed-systems-dashboard.git
cd distributed-systems-dashboard
```

2. **Install dependencies**:
```bash
npm install
```

3. **Start the application**:
```bash
npm start
```

The dashboard window will open automatically showing real-time metrics from the three simulated services.

### Development Mode
```bash
npm run dev
```

## 📁 Project Structure

```
distributed-systems-dashboard/
│
├── main.js                    # Electron main process
├── package.json               # Project dependencies
│
├── services/                  # Simulated backend services
│   ├── service-a.js          # Service A (15% error rate)
│   ├── service-b.js          # Service B (10% error rate)
│   └── service-c.js          # Service C (20% error rate)
│
├── observer/                  # Observability logic
│   ├── metrics-collector.js  # Records all metrics
│   └── metrics-aggregator.js # Calculates aggregated stats
│
└── renderer/                  # Frontend dashboard
    ├── index.html            # Dashboard HTML structure
    ├── styles.css            # Dashboard styling
    └── dashboard.js          # Dashboard logic & IPC
```

## 🎯 Features

### Implemented Features
✅ Three simulated backend services with random latency/errors  
✅ In-memory metrics collection  
✅ Real-time metrics aggregation (avg latency, error rate, request count)  
✅ Auto-refreshing dashboard (2-second interval)  
✅ Visual health indicators (green/yellow/red)  
✅ Manual traffic simulation button  
✅ Responsive UI with gradient design  

### Metrics Displayed
- **Average Latency**: Response time in milliseconds
- **Error Rate**: Percentage of failed requests
- **Request Count**: Total number of requests processed

### Visual Indicators
- **Status Dot**: Pulses with color indicating service health
- **Card Highlighting**: Border changes color based on thresholds
- **Metric Values**: Text color changes for warning/critical values

## 🔧 Configuration

### Adjusting Error Rates
Edit the threshold in each service file (`services/service-*.js`):
```javascript
function getRandomStatusCode() {
  return Math.random() < 0.15 ? 500 : 200;  // 15% error rate
}
```

### Adjusting Alert Thresholds
Edit constants in `renderer/dashboard.js`:
```javascript
const LATENCY_WARNING = 600;   // Yellow at 600ms
const LATENCY_CRITICAL = 800;  // Red at 800ms
const ERROR_WARNING = 10;      // Yellow at 10%
const ERROR_CRITICAL = 20;     // Red at 20%
```

### Adjusting Refresh Rate
Edit the interval in `renderer/dashboard.js`:
```javascript
setInterval(updateMetrics, 2000);  // Refresh every 2 seconds
```

## 🧪 Testing the Application

1. **Launch the app** - Services start automatically
2. **Wait 10-15 seconds** - Let services generate baseline metrics
3. **Click "Simulate Traffic"** - Generates 10 random requests
4. **Observe the dashboard** - Metrics update in real-time
5. **Watch for alerts** - Cards turn yellow/red when thresholds exceeded

## 📝 Technical Notes

- **No external monitoring libraries**: Built from scratch using only Electron and Node.js
- **JavaScript only**: No TypeScript or other transpilers
- **In-memory storage**: Metrics cleared on app restart
- **Minimal comments**: Code is self-documenting with clear naming
- **Small function names**: Concise, readable code style

## 🎨 UI Design

- **Gradient background**: Purple gradient for modern look
- **Card-based layout**: Each service in its own card
- **Responsive grid**: Adapts to window size
- **Smooth animations**: Hover effects and transitions
- **Color-coded alerts**: Intuitive visual feedback

## 📊 Performance

- **Metrics retention**: Last 1000 metrics per service
- **Update frequency**: Dashboard refreshes every 2 seconds
- **Memory footprint**: Lightweight (~50MB with Electron overhead)
- **Startup time**: Instant (< 1 second)

## 🔮 Future Enhancements

Potential improvements (not implemented):
- Persistent metrics storage
- Historical graphs and trends
- Service dependency mapping
- Custom alert rules
- Export metrics to CSV/JSON
- Dark/light theme toggle

## 📄 License

MIT
