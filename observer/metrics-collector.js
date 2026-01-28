const metrics = [];

function recordMetric(serviceName, latency, statusCode) {
  const metric = {
    serviceName,
    timestamp: Date.now(),
    latency,
    statusCode
  };
  
  metrics.push(metric);
  
  if (metrics.length > 1000) {
    metrics.shift();
  }
}

function getMetrics() {
  return metrics;
}

function clearMetrics() {
  metrics.length = 0;
}

module.exports = {
  recordMetric,
  getMetrics,
  clearMetrics
};
