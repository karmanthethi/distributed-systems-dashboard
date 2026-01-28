const metricsCollector = require('../observer/metrics-collector');

const SERVICE_NAME = 'service-c';
let intervalId = null;

function getRandomLatency() {
  return Math.floor(Math.random() * 1000);
}

function getRandomStatusCode() {
  return Math.random() < 0.20 ? 500 : 200;
}

async function simulateRequest() {
  const latency = getRandomLatency();
  const statusCode = getRandomStatusCode();
  
  await new Promise(resolve => setTimeout(resolve, latency));
  
  metricsCollector.recordMetric(SERVICE_NAME, latency, statusCode);
  
  return { latency, statusCode };
}

function start() {
  if (intervalId) return;
  
  intervalId = setInterval(() => {
    simulateRequest();
  }, 3000 + Math.random() * 2000);
}

function stop() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

module.exports = {
  start,
  stop,
  simulateRequest
};
