const express = require('express');
const path = require('path');

const serviceA = require('./services/service-a');
const serviceB = require('./services/service-b');
const serviceC = require('./services/service-c');
const metricsAggregator = require('./observer/metrics-aggregator');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

serviceA.start();
serviceB.start();
serviceC.start();

app.get('/api/metrics', (req, res) => {
  try {
    const metrics = metricsAggregator.getAggregatedMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get metrics' });
  }
});

app.post('/api/simulate-traffic', async (req, res) => {
  try {
    const services = [serviceA, serviceB, serviceC];
    const promises = [];
    
    for (let i = 0; i < 10; i++) {
      const service = services[Math.floor(Math.random() * services.length)];
      promises.push(service.simulateRequest());
    }
    
    await Promise.all(promises);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to simulate traffic' });
  }
});

app.listen(PORT, () => {
  console.log(`╔══════════════════════════════════════════════════════════════════╗`);
  console.log(`║  Distributed Systems Observability Dashboard - Web Version      ║`);
  console.log(`╚══════════════════════════════════════════════════════════════════╝`);
  console.log();
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📊 Dashboard available at http://localhost:${PORT}`);
  console.log();
  console.log(`Services started:`);
  console.log(`  • Service A (15% error rate)`);
  console.log(`  • Service B (10% error rate)`);
  console.log(`  • Service C (20% error rate)`);
  console.log();
  console.log(`Press Ctrl+C to stop`);
});
