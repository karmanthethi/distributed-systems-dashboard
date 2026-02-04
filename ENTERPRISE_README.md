# 🚀 Enterprise Distributed Systems Monitoring Dashboard v3.0

A **production-grade, real-time monitoring platform** for distributed systems with advanced analytics, futuristic UI, and comprehensive telemetry collection.

## ✨ Key Features

### 📊 Advanced Metrics & Analytics
- **Latency Tracking**: P50, P95, P99 percentiles with detailed history
- **Error Analysis**: Real-time error rates, status code tracking, detailed error logs
- **Performance Monitoring**: CPU/Memory usage, throughput, cache hit rates
- **Network Health**: Packet loss detection, connection quality metrics
- **Service Reliability**: Crash detection, uptime tracking, health scoring
- **Database Performance**: Query time monitoring, slow query detection
- **Anomaly Detection**: Automatic identification of system anomalies with severity levels

### 🎨 Futuristic Modern UI
- **Cyberpunk-Inspired Design**: Dark theme with neon accents (cyan, magenta, amber)
- **Glassmorphism Effects**: Frosted glass UI elements with backdrop blur
- **Interactive Charts**: Real-time data visualization with Chart.js
- **Responsive Layout**: Mobile-first design, works on all devices
- **Smooth Animations**: Elegant transitions and micro-interactions
- **Multi-Section Navigation**: Dashboard, Services, Anomalies, Performance views

### 🔌 Comprehensive REST API
Over 15 endpoints for complete system monitoring and control:
- `/api/metrics` - Real-time service metrics
- `/api/anomalies` - System anomalies and events
- `/api/performance-history` - Historical performance data
- `/api/system-stats` - Overall system statistics
- `/api/simulate-traffic` - Load simulation
- `/api/stress-test` - Stress testing capabilities
- `/api/health` - System health check

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│         FUTURISTIC WEB DASHBOARD (Frontend)         │
│  • Real-time metrics visualization                  │
│  • Interactive charts & graphs                      │
│  • Multi-section navigation                         │
│  • WebSocket-ready infrastructure                   │
└────────────────────┬────────────────────────────────┘
                     │ HTTP REST API
┌────────────────────▼────────────────────────────────┐
│      EXPRESS.JS SERVER (Backend - Node.js)         │
│  • Request routing & handling                       │
│  • CORS, Helmet security, Compression              │
│  • Error handling & logging                        │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
┌───────▼────┐ ┌────▼─────┐ ┌──▼────────┐
│  Service A │ │ Service B │ │ Service C │
│ (Gateway)  │ │ (Data)    │ │(Analytics)│
└─────┬──────┘ └────┬─────┘ └──┬────────┘
      │             │           │
      └─────────────┼───────────┘
                    │
        ┌───────────▼──────────┐
        │  Advanced Metrics    │
        │    Collector         │
        │  • Records all data  │
        │  • Detects anomalies │
        │  • Calculates stats  │
        └──────────────────────┘
```

## 📊 Metrics Tracked

### Per Service:
- **Latency**: Min, Max, Avg, P95, P99
- **Errors**: Total count, by status code, error rate %
- **Throughput**: Requests per second
- **Resource Usage**: CPU %, Memory %
- **Network**: Packet loss %, connection quality
- **Reliability**: Crash count, uptime
- **Cache**: Hit rate percentage
- **Database**: Query times, slow query detection
- **Health Score**: Composite 0-100 score

### System-Wide:
- Total requests across all services
- Average error rate
- Total crashes detected
- Anomaly count and severity breakdown
- Service availability status

## 🚀 Getting Started

### Prerequisites
- Node.js 14+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/karmanthethi/distributed-systems-dashboard
cd distributed-systems-dashboard

# Install dependencies
npm install

# Start the server
node server.js
```

### Access the Dashboard
- **Dashboard**: http://localhost:3000
- **API Health**: http://localhost:3000/api/health
- **Metrics**: http://localhost:3000/api/metrics

## 🎮 Interactive Features

### Dashboard Section
- **System Health Overview**: 4-card quick stats
- **Service Cards**: Real-time metrics for each service
- **Action Buttons**:
  - 🎯 Simulate Traffic - Generate controlled load
  - 🔥 Run Stress Test - 30-second stress test
  - 🔄 Reset Metrics - Clear all data

### Services Section
- Detailed per-service analysis
- 8+ metrics per service displayed
- Visual status indicators

### Anomalies Section
- Real-time anomaly detection
- Severity filtering (Critical, High, Medium, Low)
- Timestamp and description for each event
- Anomaly types: CRASH, CRITICAL_ERROR, LATENCY_SPIKE, HIGH_ERROR_RATE, etc.

### Performance Section
- **Latency Trends**: Line chart showing latency progression
- **Error Rate Trends**: Error rate over time
- **Resource Usage**: CPU and memory usage patterns
- **Status Distribution**: HTTP status code breakdown

## 🔌 REST API Examples

### Get All Metrics
```bash
curl http://localhost:3000/api/metrics
```

### Get Service-Specific Metrics
```bash
curl http://localhost:3000/api/metrics/"Service%20A"
```

### Get Anomalies
```bash
curl http://localhost:3000/api/anomalies?limit=50&service=Service%20A
```

### Simulate Traffic
```bash
curl -X POST http://localhost:3000/api/simulate-traffic \
  -H "Content-Type: application/json" \
  -d '{"count": 50}'
```

### Run Stress Test
```bash
curl -X POST http://localhost:3000/api/stress-test \
  -H "Content-Type: application/json" \
  -d '{"duration": 60, "requestsPerSecond": 100}'
```

### Check Health
```bash
curl http://localhost:3000/api/health
```

## 📈 Metrics Collection Details

### Real-Time Data Simulation
Each service generates realistic metrics:

**Service A (API Gateway)**
- Base latency: ~150ms
- Error rate: 12%
- Packet loss: ~5%

**Service B (Data Processing)**
- Base latency: ~200ms
- Error rate: 10%
- Packet loss: ~8%

**Service C (Analytics)**
- Base latency: ~300ms
- Error rate: 18%
- Packet loss: ~12%

### Advanced Metrics
- **Latency Distribution**: Gaussian distribution for realistic patterns
- **Anomaly Detection**: Automatic detection of spikes and unusual patterns
- **Health Scoring**: Composite score accounting for errors, crashes, latency
- **Resource Monitoring**: Realistic CPU and memory usage patterns

## 🎨 UI Design Features

### Color Scheme
- **Primary**: Cyan (#00D9FF) - Modern, tech-forward
- **Secondary**: Magenta (#FF006E) - Vibrant accent
- **Success**: Green (#06FFA5) - Healthy status
- **Warning**: Amber (#FFB703) - Caution state
- **Danger**: Red (#FF006E) - Critical issues
- **Background**: Dark blue gradient - Professional look

### Components
- **Glassmorphic Cards**: Semi-transparent with blur effects
- **Neon Glows**: Glow effects on interactive elements
- **Smooth Animations**: All transitions use cubic-bezier curves
- **Status Indicators**: Pulsing dots for real-time status
- **Toast Notifications**: Non-intrusive success/error messages
- **Loading Spinner**: Animated loading indicator

## 📱 Responsive Design

- **Desktop**: Full 3-column grid layouts
- **Tablet**: 2-column responsive grid
- **Mobile**: Single column, optimized touch targets

## 🔒 Security Features

- **Helmet.js**: Security headers
- **CORS**: Configurable cross-origin access
- **Input Validation**: All inputs validated
- **Error Handling**: Comprehensive error catching and logging

## 📊 Performance Optimization

- **Compression**: gzip compression on all responses
- **Caching**: Smart data caching strategies
- **Lazy Loading**: Charts load on demand
- **Efficient Renders**: Minimal DOM updates

## 🔮 Future Enhancements

- [ ] WebSocket real-time updates
- [ ] Historical data export (CSV, JSON)
- [ ] Custom alert rules
- [ ] Machine learning anomaly prediction
- [ ] Multi-region monitoring
- [ ] Database integration for persistence
- [ ] User authentication & RBAC
- [ ] Dark/Light theme toggle
- [ ] Custom dashboards
- [ ] API rate limiting

## 📝 API Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "timestamp": 1234567890,
  "data": {
    // Response data
  },
  "error": null  // Error message if success is false
}
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change port
PORT=3001 node server.js
```

### Missing Dependencies
```bash
npm install cors helmet compression moment
```

### Metrics Not Updating
- Check browser console for errors
- Verify API endpoints are responding: http://localhost:3000/api/health
- Check server logs for issues

## 📄 License

MIT License - Feel free to use for personal and commercial projects

## 👨‍💻 Technology Stack

**Frontend:**
- HTML5, CSS3, Vanilla JavaScript
- Chart.js for data visualization
- CSS Grid & Flexbox for layouts
- CSS animations and transitions

**Backend:**
- Node.js
- Express.js
- CORS, Helmet, Compression middleware
- Real-time data simulation

## 🎯 Use Cases

1. **Microservices Monitoring**: Track health of distributed APIs
2. **Performance Testing**: Run stress tests and monitor results
3. **Error Tracking**: Real-time error rate monitoring
4. **Capacity Planning**: CPU/Memory usage analytics
5. **Incident Response**: Anomaly detection and alerting
6. **SLA Monitoring**: Health scores and uptime tracking
7. **Load Balancing**: Service performance comparison
8. **Debugging**: Detailed metrics for troubleshooting

---

**Built for teams who care about system reliability and real-time visibility.**

✨ **Transform your distributed systems monitoring into an art form.** ✨
