const metricsCollector = require('../observer/metrics-collector');

const SERVICE_NAME = 'service-b';
let intervalId = null;

function getRandomLatency() {
  return Math.floor(Math.random() * 1000);
}

function getRandomStatusCode() {
  return Math.random() < 0.10 ? 500 : 200;
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
  }, 2500 + Math.random() * 1500);
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
