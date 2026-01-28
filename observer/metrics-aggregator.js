const metricsCollector = require('./metrics-collector');

function calculateServiceMetrics(serviceName, allMetrics) {
  const serviceMetrics = allMetrics.filter(m => m.serviceName === serviceName);
  
  if (serviceMetrics.length === 0) {
    return {
      avgLatency: 0,
      errorRate: 0,
      requestCount: 0
    };
  }
  
  const totalLatency = serviceMetrics.reduce((sum, m) => sum + m.latency, 0);
  const avgLatency = totalLatency / serviceMetrics.length;
  
  const errorCount = serviceMetrics.filter(m => m.statusCode >= 500).length;
  const errorRate = (errorCount / serviceMetrics.length) * 100;
  
  return {
    avgLatency: Math.round(avgLatency),
    errorRate: Math.round(errorRate * 100) / 100,
    requestCount: serviceMetrics.length
  };
}

function getAggregatedMetrics() {
  const allMetrics = metricsCollector.getMetrics();
  const services = ['service-a', 'service-b', 'service-c'];
  
  const aggregated = {};
  
  services.forEach(serviceName => {
    aggregated[serviceName] = calculateServiceMetrics(serviceName, allMetrics);
  });
  
  return aggregated;
}

module.exports = {
  getAggregatedMetrics
};
