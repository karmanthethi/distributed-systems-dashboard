# Quick Start Guide - Enterprise Dashboard

## 🚀 Start the Dashboard (Already Running!)

The dashboard is now running at **http://localhost:3000**

## 📊 What You Can Do

### 1. View Real-Time Metrics
- **Dashboard**: See all services and their health in one place
- **Services**: Detailed breakdown of each service's performance
- **Anomalies**: Track detected system issues and events
- **Performance**: Visual charts showing trends

### 2. Test the System
Click the buttons at the bottom of the dashboard:
- **Simulate Traffic**: Generates 20 requests to test metrics collection
- **Run Stress Test**: Runs a 30-second stress test with 100 req/s
- **Reset Metrics**: Clears all collected data (use for fresh start)

### 3. Interact with APIs
Test the REST API directly:

```bash
# Get current metrics
curl http://localhost:3000/api/metrics

# Get system health status
curl http://localhost:3000/api/health

# Get recent anomalies
curl http://localhost:3000/api/anomalies

# Simulate traffic
curl -X POST http://localhost:3000/api/simulate-traffic \
  -H "Content-Type: application/json" \
  -d '{"count": 50}'

# Run stress test
curl -X POST http://localhost:3000/api/stress-test \
  -H "Content-Type: application/json" \
  -d '{"duration": 30, "requestsPerSecond": 100}'
```

## 🎨 UI Features to Explore

### Dashboard Section (Default)
- **Top Stats Cards**: Health score, total requests, error rate, anomalies
- **Service Cards**: Real-time metrics for each service
- **Action Buttons**: Simulate, stress test, reset

### Services Section
- Detailed analysis for each service
- 8 key metrics per service
- Health score and status

### Anomalies Section
- List of detected issues
- Filter by severity (Critical, High, Medium, Low)
- Timestamps and descriptions

### Performance Section
- **Latency Trends**: How latency changes over time
- **Error Rate Trends**: Error rate patterns
- **Resource Usage**: CPU and memory usage
- **Status Distribution**: HTTP status codes

## 📊 Key Metrics Explained

- **Health Score**: 0-100 composite score (lower = worse)
- **Avg Latency**: Average response time in milliseconds
- **P95/P99 Latency**: 95th/99th percentile latency
- **Error Rate**: Percentage of failed requests
- **Packet Loss**: Network packet loss percentage
- **CPU/Memory**: Resource utilization percentage
- **Total Requests**: Cumulative request count

## 🎯 Try These Scenarios

### 1. Generate Load
1. Click "Simulate Traffic" button
2. Watch metrics update in real-time
3. See error rates and latencies change

### 2. Run Stress Test
1. Click "Run Stress Test"
2. Watch the dashboard for 30 seconds
3. See how services handle high load
4. Check anomalies for detected issues

### 3. Monitor Anomalies
1. Go to "Anomalies" section
2. Run a stress test or simulate traffic
3. Watch anomalies appear as issues are detected
4. Filter by severity level

### 4. Analyze Performance
1. Generate some traffic first
2. Go to "Performance" section
3. View charts showing metrics trends

## 📱 Mobile Access

The dashboard is responsive:
- **Desktop**: Full layout with 3-column grid
- **Tablet**: 2-column responsive design
- **Mobile**: Single column, optimized for touch

On mobile, use the hamburger menu (if available) or swipe to navigate sections.

## 🔄 Auto-Refresh

The dashboard automatically refreshes every **2 seconds** to show latest metrics.

Click the 🔄 button in the top-right to manually refresh.

## 💾 Data Storage

Currently, data is stored **in-memory** (not persisted). When you:
- Refresh the page: Metrics persist during current session
- Restart the server: All metrics reset to zero
- Click "Reset Metrics": All data clears

## 🛠️ Configuration

### Change Port
```bash
PORT=3001 node server.js
```

### Change Refresh Interval
Edit `public/dashboard.js` and change `refreshInterval` (currently 2000ms)

### Change Service Error Rates
Edit `services/service-*.js` and adjust `getRandomStatusCode()` function

## 📈 Understanding Service Metrics

### Service A (API Gateway)
- Medium load: ~150ms avg latency
- 12% baseline error rate
- Typical gateway patterns

### Service B (Data Processing)
- Higher load: ~200ms avg latency
- 10% baseline error rate
- Processing-heavy operations

### Service C (Analytics)
- Heavy load: ~300ms avg latency
- 18% baseline error rate
- Analytics computation

## 🎓 Learning Resources

### For Developers
- Explore `/api/metrics` response to understand data structure
- Check `server.js` for API endpoint implementation
- Review `observer/advanced-metrics-collector.js` for metrics logic
- Study `public/dashboard.js` for UI logic

### For System Administrators
- Use health scores to determine service health
- Monitor anomalies for proactive alerting
- Track CPU/Memory for capacity planning
- Analyze error rates for SLA compliance

## 🆘 Need Help?

### Dashboard Not Loading?
1. Check server is running: http://localhost:3000/api/health
2. Clear browser cache (Ctrl+Shift+Delete)
3. Try different browser
4. Check console for errors (F12)

### Metrics Not Updating?
1. Click refresh button 🔄
2. Simulate traffic to generate data
3. Check API: http://localhost:3000/api/metrics
4. Check browser console for errors

### Server Issues?
1. Check port is available
2. Verify Node.js is installed: `node --version`
3. Verify dependencies: `npm list`
4. Check error logs in terminal

---

**Enjoy exploring your enterprise-grade monitoring dashboard! 🚀**

Questions? Check ENTERPRISE_README.md for detailed documentation.
