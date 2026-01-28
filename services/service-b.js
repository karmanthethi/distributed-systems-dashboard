const advancedMetricsCollector = require('../observer/advanced-metrics-collector');

const SERVICE_NAME = 'Service B';
let intervalId = null;

function getRandomLatency() {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return Math.max(10, Math.min(2000, 200 + z * 120));
}

function getRandomStatusCode() {
  const rand = Math.random();
  if (rand < 0.10) return 500;
  if (rand < 0.15) return 502;
  if (rand < 0.18) return 400;
  return 200;
}

function getRandomPacketLoss() {
  return Math.random() < 0.08 ? Math.random() * 8 : 0;
}

function getRandomCpuUsage() {
  return Math.random() * 80 + 10;
}

function getRandomMemoryUsage() {
  return Math.random() * 70 + 15;
}

async function simulateRequest() {
  const latency = Math.round(getRandomLatency());
  const statusCode = getRandomStatusCode();
  const packetLoss = getRandomPacketLoss();
  const crashed = Math.random() < 0.0015;
  const cpuUsage = getRandomCpuUsage();
  const memoryUsage = getRandomMemoryUsage();
  const dbQueryTime = statusCode === 200 ? Math.random() * 800 : 0;
  const cacheHit = Math.random() < 0.35;
  
  await new Promise(resolve => setTimeout(resolve, latency));
  
  advancedMetricsCollector.recordMetric(SERVICE_NAME, {
    latency,
    statusCode,
    endpoint: `/api/data/${Math.floor(Math.random() * 100)}`,
    method: ['GET', 'POST', 'PUT'][Math.floor(Math.random() * 3)],
    packetLoss,
    crashed,
    throughput: 1,
    cpuUsage,
    memoryUsage,
    requestSize: Math.floor(Math.random() * 15000),
    responseSize: statusCode === 200 ? Math.floor(Math.random() * 60000) : 0,
    cacheHit,
    dbQueryTime
  });
  
  return { latency, statusCode };
}

function start() {
  if (intervalId) return;
  
  intervalId = setInterval(() => {
    simulateRequest();
  }, 1000 + Math.random() * 1500);
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
