const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const serviceA = require('./services/service-a');
const serviceB = require('./services/service-b');
const serviceC = require('./services/service-c');
const externalAPIMonitor = require('./services/external-api-monitor');
const advancedMetricsCollector = require('./observer/advanced-metrics-collector');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Start services
serviceA.start();
serviceB.start();
serviceC.start();
externalAPIMonitor.start();

// ==================== METRICS API ====================

/**
 * GET /api/metrics - Get aggregated metrics for all services
 */
app.get('/api/metrics', (req, res) => {
  try {
    const metrics = advancedMetricsCollector.getAggregatedMetrics();
    res.json({
      success: true,
      timestamp: Date.now(),
      data: metrics
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Failed to get metrics',
      message: error.message 
    });
  }
});

/**
 * GET /api/metrics/:serviceName - Get metrics for specific service
 */
app.get('/api/metrics/:serviceName', (req, res) => {
  try {
    const metrics = advancedMetricsCollector.getAggregatedMetrics();
    const serviceMetrics = metrics[req.params.serviceName];
    
    if (!serviceMetrics) {
      return res.status(404).json({ 
        success: false,
        error: 'Service not found' 
      });
    }

    res.json({
      success: true,
      timestamp: Date.now(),
      service: req.params.serviceName,
      data: serviceMetrics
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Failed to get service metrics',
      message: error.message 
    });
  }
});

// ==================== ANOMALIES API ====================

/**
 * GET /api/anomalies - Get recent anomalies
 */
app.get('/api/anomalies', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const serviceName = req.query.service || null;
    const anomalies = advancedMetricsCollector.getAnomalies(serviceName, limit);
    
    res.json({
      success: true,
      timestamp: Date.now(),
      count: anomalies.length,
      data: anomalies
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Failed to get anomalies',
      message: error.message 
    });
  }
});

/**
 * GET /api/external-apis - Get list of external APIs being monitored
 */
app.get('/api/external-apis', (req, res) => {
  try {
    const apis = externalAPIMonitor.getAPIs();
    res.json({
      success: true,
      timestamp: Date.now(),
      count: apis.length,
      data: apis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get external APIs',
      message: error.message
    });
  }
});

/**
 * GET /api/regions - Get metrics grouped by region
 */
app.get('/api/regions', (req, res) => {
  try {
    const metrics = advancedMetricsCollector.getAggregatedMetrics();
    const byRegion = {};

    Object.entries(metrics).forEach(([serviceName, data]) => {
      const region = data.region || 'Unknown';
      if (!byRegion[region]) {
        byRegion[region] = {
          services: [],
          totalRequests: 0,
          avgLatency: 0,
          avgErrorRate: 0,
          availability: 0
        };
      }

      byRegion[region].services.push({
        name: serviceName,
        ...data
      });
      byRegion[region].totalRequests += data.totalRequests;
    });

    // Calculate averages per region
    Object.keys(byRegion).forEach(region => {
      const services = byRegion[region].services;
      byRegion[region].avgLatency = Math.round(
        services.reduce((sum, s) => sum + s.avgLatency, 0) / services.length
      );
      byRegion[region].avgErrorRate = (
        services.reduce((sum, s) => sum + parseFloat(s.errorRate), 0) / services.length
      ).toFixed(2);
      byRegion[region].availability = (
        services.reduce((sum, s) => sum + parseFloat(s.availability), 0) / services.length
      ).toFixed(2);
    });

    res.json({
      success: true,
      timestamp: Date.now(),
      data: byRegion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get regional metrics',
      message: error.message
    });
  }
});

/**
 * GET /api/anomalies/:severity - Get anomalies by severity
 */
app.get('/api/anomalies/severity/:severity', (req, res) => {
  try {
    const severity = req.params.severity.toLowerCase();
    const anomalies = advancedMetricsCollector.getAnomalies(null, 100);
    const filtered = anomalies.filter(a => a.severity === severity);
    
    res.json({
      success: true,
      timestamp: Date.now(),
      severity,
      count: filtered.length,
      data: filtered
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Failed to get anomalies by severity',
      message: error.message 
    });
  }
});

// ==================== PERFORMANCE HISTORY API ====================

/**
 * GET /api/performance-history - Get performance history
 */
app.get('/api/performance-history', (req, res) => {
  try {
    const serviceName = req.query.service || null;
    const limit = parseInt(req.query.limit) || 100;
    const history = advancedMetricsCollector.getPerformanceHistory(serviceName);
    const limited = history.slice(-limit);
    
    res.json({
      success: true,
      timestamp: Date.now(),
      count: limited.length,
      data: limited
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Failed to get performance history',
      message: error.message 
    });
  }
});

// ==================== SYSTEM STATS API ====================

/**
 * GET /api/system-stats - Get overall system statistics
 */
app.get('/api/system-stats', (req, res) => {
  try {
    const stats = advancedMetricsCollector.getSystemStats();
    res.json({
      success: true,
      timestamp: Date.now(),
      data: stats
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Failed to get system stats',
      message: error.message 
    });
  }
});

// ==================== SIMULATION API ====================

/**
 * POST /api/simulate-traffic - Simulate traffic on services
 */
app.post('/api/simulate-traffic', async (req, res) => {
  try {
    const { count = 10 } = req.body;
    const services = [serviceA, serviceB, serviceC];
    const promises = [];
    
    for (let i = 0; i < count; i++) {
      const service = services[Math.floor(Math.random() * services.length)];
      promises.push(service.simulateRequest());
    }
    
    await Promise.all(promises);
    res.json({ 
      success: true,
      message: `Simulated ${count} requests`,
      timestamp: Date.now()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Failed to simulate traffic',
      message: error.message 
    });
  }
});

/**
 * POST /api/simulate-traffic/:serviceName - Simulate traffic on specific service
 */
app.post('/api/simulate-traffic/:serviceName', async (req, res) => {
  try {
    const { count = 5 } = req.body;
    const serviceName = req.params.serviceName.toLowerCase();
    
    let service;
    if (serviceName.includes('a')) service = serviceA;
    else if (serviceName.includes('b')) service = serviceB;
    else if (serviceName.includes('c')) service = serviceC;
    else {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid service name. Use: service-a, service-b, or service-c' 
      });
    }

    const promises = [];
    for (let i = 0; i < count; i++) {
      promises.push(service.simulateRequest());
    }
    
    await Promise.all(promises);
    res.json({ 
      success: true,
      message: `Simulated ${count} requests on ${serviceName}`,
      timestamp: Date.now()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Failed to simulate traffic',
      message: error.message 
    });
  }
});

// ==================== STRESS TEST API ====================

/**
 * POST /api/stress-test - Run stress test
 */
app.post('/api/stress-test', async (req, res) => {
  try {
    const { duration = 10, requestsPerSecond = 50 } = req.body;
    const services = [serviceA, serviceB, serviceC];
    const startTime = Date.now();
    const endTime = startTime + (duration * 1000);
    const interval = 1000 / requestsPerSecond;
    
    res.json({
      success: true,
      message: `Stress test started for ${duration} seconds`,
      timestamp: Date.now(),
      testId: Math.random().toString(36).substr(2, 9)
    });

    // Run stress test asynchronously
    (async () => {
      while (Date.now() < endTime) {
        const service = services[Math.floor(Math.random() * services.length)];
        service.simulateRequest().catch(() => {});
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    })();
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Failed to start stress test',
      message: error.message 
    });
  }
});

// ==================== HEALTH CHECK API ====================

/**
 * GET /api/health - Health check endpoint
 */
app.get('/api/health', (req, res) => {
  try {
    const metrics = advancedMetricsCollector.getAggregatedMetrics();
    const stats = advancedMetricsCollector.getSystemStats();
    
    res.json({
      success: true,
      status: 'healthy',
      timestamp: Date.now(),
      uptime: process.uptime(),
      services: Object.keys(metrics).length,
      stats
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      status: 'unhealthy',
      error: error.message 
    });
  }
});

// ==================== RESET API ====================

/**
 * POST /api/reset - Reset all metrics
 */
app.post('/api/reset', (req, res) => {
  try {
    advancedMetricsCollector.reset();
    res.json({
      success: true,
      message: 'All metrics have been reset',
      timestamp: Date.now()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Failed to reset metrics',
      message: error.message 
    });
  }
});

// ==================== ERROR HANDLING ====================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    path: req.path,
    method: req.method
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err.message
  });
});

// ==================== SERVER STARTUP ====================

app.listen(PORT, () => {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║     🚀 ENTERPRISE DISTRIBUTED SYSTEMS MONITORING DASHBOARD 🚀      ║');
  console.log('║                         Version 3.0.0                              ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝');
  console.log('\n');
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🔍 API Docs:  http://localhost:${PORT}/api-docs`);
  console.log(`💚 Health:    http://localhost:${PORT}/api/health`);
  console.log('\n');
  console.log('📡 Services Started:');
  console.log('   • Service A (API Gateway)     - Baseline Error Rate: 12%');
  console.log('   • Service B (Data Processing) - Baseline Error Rate: 10%');
  console.log('   • Service C (Analytics)       - Baseline Error Rate: 18%');
  console.log('\n');
  console.log('🎯 Metrics Tracked:');
  console.log('   ✓ Latency (P50, P95, P99)    ✓ Packet Loss Rate');
  console.log('   ✓ Error Rates & Status Codes ✓ Service Crashes');
  console.log('   ✓ CPU & Memory Usage         ✓ Cache Hit Rate');
  console.log('   ✓ Throughput                 ✓ DB Query Performance');
  console.log('   ✓ Anomaly Detection          ✓ Health Scoring');
  console.log('\n');
  console.log('🔌 Key API Endpoints:');
  console.log('   GET  /api/metrics              - Get all service metrics');
  console.log('   GET  /api/anomalies            - Get system anomalies');
  console.log('   GET  /api/performance-history  - Get performance trends');
  console.log('   GET  /api/system-stats         - Get system overview');
  console.log('   POST /api/simulate-traffic     - Generate load');
  console.log('   POST /api/stress-test          - Run stress test');
  console.log('\n');
  console.log('Press Ctrl+C to stop the server\n');
});
