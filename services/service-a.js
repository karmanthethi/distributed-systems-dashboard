const advancedMetricsCollector = require('../observer/advanced-metrics-collector');

const SERVICE_NAME = 'Service A';
let intervalId = null;

function getRandomLatency() {
  // Normal distribution centered around 150ms
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return Math.max(10, Math.min(2000, 150 + z * 100));
}

function getRandomStatusCode() {
  const rand = Math.random();
  if (rand < 0.12) return 500;
  if (rand < 0.18) return 503;
  if (rand < 0.20) return 400;
  return 200;
}

function getRandomPacketLoss() {
  return Math.random() < 0.05 ? Math.random() * 10 : 0;
}

function getRandomCpuUsage() {
  return Math.random() * 75 + 5;
}

function getRandomMemoryUsage() {
  return Math.random() * 60 + 10;
}

async function simulateRequest() {
  const latency = Math.round(getRandomLatency());
  const statusCode = getRandomStatusCode();
  const packetLoss = getRandomPacketLoss();
  const crashed = Math.random() < 0.001;
  const cpuUsage = getRandomCpuUsage();
  const memoryUsage = getRandomMemoryUsage();
  const dbQueryTime = statusCode === 200 ? Math.random() * 500 : 0;
  const cacheHit = Math.random() < 0.4;
  
  await new Promise(resolve => setTimeout(resolve, latency));
  
  advancedMetricsCollector.recordMetric(SERVICE_NAME, {
    latency,
    statusCode,
    endpoint: `/api/users/${Math.floor(Math.random() * 100)}`,
    method: ['GET', 'POST', 'PUT', 'DELETE'][Math.floor(Math.random() * 4)],
    packetLoss,
    crashed,
    throughput: 1,
    cpuUsage,
    memoryUsage,
    requestSize: Math.floor(Math.random() * 10000),
    responseSize: statusCode === 200 ? Math.floor(Math.random() * 50000) : 0,
    cacheHit,
    dbQueryTime
  });
  
  return { latency, statusCode };
}

function start() {
  if (intervalId) return;
  
  intervalId = setInterval(() => {
    simulateRequest();
  }, 800 + Math.random() * 1200);
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
