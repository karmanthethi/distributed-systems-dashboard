# Application Flow Diagram

## Startup Sequence

```
1. User runs: npm start
        ↓
2. Electron launches
        ↓
3. Main Process (main.js) starts
        ↓
4. Creates BrowserWindow (1200x800)
        ↓
5. Loads renderer/index.html
        ↓
6. Starts 3 services:
   • service-a.start()
   • service-b.start()
   • service-c.start()
        ↓
7. Services begin auto-generating requests
```

## Request Flow

```
┌─────────────┐
│  Service A  │ ──┐
│ (15% error) │   │
└─────────────┘   │
                  │
┌─────────────┐   │     ┌──────────────────┐
│  Service B  │ ──┼────▶│ Metrics          │
│ (10% error) │   │     │ Collector        │
└─────────────┘   │     │ (recordMetric)   │
                  │     └─────────┬────────┘
┌─────────────┐   │               │
│  Service C  │ ──┘               │ Store in
│ (20% error) │                   │ memory array
└─────────────┘                   ▼
                          ┌──────────────────┐
                          │ Metrics Array    │
                          │ [{service, ts,   │
                          │   latency, code}]│
                          └─────────┬────────┘
                                    │
                                    │ On request
                                    ▼
                          ┌──────────────────┐
                          │ Metrics          │
                          │ Aggregator       │
                          │ (calculate)      │
                          └─────────┬────────┘
                                    │
                                    │ Returns
                                    ▼
                          ┌──────────────────┐
                          │ {                │
                          │   service-a: {   │
                          │     avgLatency,  │
                          │     errorRate,   │
                          │     requestCount │
                          │   },             │
                          │   service-b: ... │
                          │   service-c: ... │
                          │ }                │
                          └──────────────────┘
```

## IPC Communication Flow

```
┌─────────────────────────────┐
│  Renderer Process           │
│  (renderer/dashboard.js)    │
└──────────┬──────────────────┘
           │
           │ (1) Every 2 seconds
           │     ipcRenderer.invoke('get-metrics')
           ▼
┌─────────────────────────────┐
│  Main Process (main.js)     │
│  ipcMain.handle(...)        │
└──────────┬──────────────────┘
           │
           │ (2) Call aggregator
           │     metricsAggregator.getAggregatedMetrics()
           ▼
┌─────────────────────────────┐
│  Returns aggregated data    │
└──────────┬──────────────────┘
           │
           │ (3) Send back to renderer
           ▼
┌─────────────────────────────┐
│  Dashboard updates UI       │
│  • Update metric values     │
│  • Change card colors       │
│  • Update status indicators │
└─────────────────────────────┘
```

## User Interaction: Simulate Traffic

```
User clicks "Simulate Traffic" button
           ↓
Renderer: ipcRenderer.invoke('simulate-traffic')
           ↓
Main: ipcMain.handle('simulate-traffic', ...)
           ↓
Generate 10 random service requests:
  • Pick random service (A, B, or C)
  • Call service.simulateRequest()
  • Service generates latency & status
  • Records metric automatically
           ↓
Return success to renderer
           ↓
Renderer: Wait 500ms
           ↓
Renderer: Update metrics display
           ↓
Dashboard shows new values
```

## Metrics Calculation Details

### Average Latency
```javascript
Input:  [450ms, 650ms, 850ms]
Calculation:
  sum = 450 + 650 + 850 = 1950
  count = 3
  avg = 1950 / 3 = 650ms
Output: 650 ms
```

### Error Rate
```javascript
Input:  [200, 200, 500, 200, 500]
Calculation:
  errors = count(status >= 500) = 2
  total = 5
  rate = (2 / 5) × 100 = 40%
Output: 40.00%
```

### Request Count
```javascript
Input:  Array of metrics
Calculation:
  count = metrics.filter(m => m.serviceName === 'service-a').length
Output: Integer count
```

## Alert State Determination

```
For each service:
  ┌─ Check latency and error rate
  │
  ├─ If latency >= 800ms OR errorRate >= 20%
  │  └─▶ State = CRITICAL (��)
  │       • Card border: red
  │       • Status dot: red
  │       • Metrics highlighted: red
  │
  ├─ Else if latency >= 600ms OR errorRate >= 10%
  │  └─▶ State = WARNING (🟡)
  │       • Card border: orange
  │       • Status dot: orange
  │       • Metrics highlighted: orange
  │
  └─ Else
     └─▶ State = NORMAL (🟢)
          • Card: white
          • Status dot: green
          • Metrics: default color
```

## Service Generation Pattern

```
Service A:
  setInterval(() => {
    latency = random(0-1000ms)
    status = random() < 0.15 ? 500 : 200
    wait(latency)
    recordMetric('service-a', latency, status)
  }, 2000-3000ms)

Service B:
  setInterval(() => {
    latency = random(0-1000ms)
    status = random() < 0.10 ? 500 : 200
    wait(latency)
    recordMetric('service-b', latency, status)
  }, 2500-4000ms)

Service C:
  setInterval(() => {
    latency = random(0-1000ms)
    status = random() < 0.20 ? 500 : 200
    wait(latency)
    recordMetric('service-c', latency, status)
  }, 3000-5000ms)
```

## Memory Management

```
Metrics Array:
  • Add new metric → push to array
  • If array.length > 1000
    └─▶ Remove oldest metric (shift)
  • Prevents memory growth
  • Rolling window of last 1000 metrics
```

## UI Update Cycle

```
Page Load
    ↓
Initialize
    ↓
Set interval (2000ms)
    ↓
    ┌──────────────┐
    │ Fetch metrics│◀─────┐
    └──────┬───────┘      │
           │              │
           ▼              │
    ┌──────────────┐      │
    │ Update UI    │      │
    │ • Values     │      │
    │ • Colors     │      │
    │ • Status     │      │
    └──────┬───────┘      │
           │              │
           ▼              │
    ┌──────────────┐      │
    │ Wait 2 secs  │      │
    └──────┬───────┘      │
           │              │
           └──────────────┘
```

## Error Simulation Logic

```
When service generates request:

random_value = Math.random()  // 0.0 to 1.0

If random_value < error_threshold:
    status = 500  // Internal Server Error
Else:
    status = 200  // OK

Example (Service A with 15% error rate):
    if (Math.random() < 0.15) {
        status = 500;  // ~15% of time
    } else {
        status = 200;  // ~85% of time
    }
```

## Complete Request Lifecycle

```
1. Service timer triggers
      ↓
2. Generate random latency (0-1000ms)
      ↓
3. Generate random status (200 or 500)
      ↓
4. Simulate delay (wait for latency duration)
      ↓
5. Call metricsCollector.recordMetric()
      ↓
6. Metric stored in memory array
      ↓
7. (2 seconds later) Dashboard requests metrics
      ↓
8. Aggregator calculates statistics
      ↓
9. Dashboard receives and displays
      ↓
10. User sees updated metrics
```

## Technology Stack Flow

```
User Interface
    ↕ HTML/CSS/JavaScript
Renderer Process
    ↕ IPC (Electron)
Main Process
    ↕ require()
Node.js Modules
    • Services
    • Observer
    ↕ In-Memory
JavaScript Objects
```

---

This flow diagram shows the complete architecture and data flow of the Distributed Systems Observability Dashboard application.
