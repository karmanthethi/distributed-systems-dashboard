const advancedMetricsCollector = require('../observer/advanced-metrics-collector');

const SERVICE_NAME = 'Service C';
let intervalId = null;

function getRandomLatency() {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return Math.max(20, Math.min(2500, 300 + z * 150));
}

function getRandomStatusCode() {
  const rand = Math.random();
  if (rand < 0.18) return 500;
  if (rand < 0.25) return 503;
  if (rand < 0.30) return 429;
  if (rand < 0.35) return 400;
  return 200;
}

function getRandomPacketLoss() {
  return Math.random() < 0.12 ? Math.random() * 12 : 0;
}

function getRandomCpuUsage() {
  return Math.random() * 85 + 15;
}

function getRandomMemoryUsage() {
  return Math.random() * 75 + 20;
}

async function simulateRequest() {
  const latency = Math.round(getRandomLatency());
  const statusCode = getRandomStatusCode();
  const packetLoss = getRandomPacketLoss();
  const crashed = Math.random() < 0.002;
  const cpuUsage = getRandomCpuUsage();
  const memoryUsage = getRandomMemoryUsage();
  const dbQueryTime = statusCode === 200 ? Math.random() * 1200 : 0;
  const cacheHit = Math.random() < 0.3;
  
  await new Promise(resolve => setTimeout(resolve, latency));
  
  advancedMetricsCollector.recordMetric(SERVICE_NAME, {
    latency,
    statusCode,
    endpoint: `/api/analytics/${Math.floor(Math.random() * 50)}`,
    method: ['GET', 'POST'][Math.floor(Math.random() * 2)],
    packetLoss,
    crashed,
    throughput: 1,
    cpuUsage,
    memoryUsage,
    requestSize: Math.floor(Math.random() * 20000),
    responseSize: statusCode === 200 ? Math.floor(Math.random() * 100000) : 0,
    cacheHit,
    dbQueryTime
  });
  
  return { latency, statusCode };
}

function start() {
  if (intervalId) return;
  
  intervalId = setInterval(() => {
    simulateRequest();
  }, 1500 + Math.random() * 2000);
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
