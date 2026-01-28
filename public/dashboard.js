const LATENCY_WARNING = 600;
const LATENCY_CRITICAL = 800;
const ERROR_WARNING = 10;
const ERROR_CRITICAL = 20;

async function updateMetrics() {
  try {
    const response = await fetch('/api/metrics');
    const metrics = await response.json();
    
    Object.keys(metrics).forEach(serviceName => {
      const serviceData = metrics[serviceName];
      updateServiceCard(serviceName, serviceData);
    });
    
    document.getElementById('last-update').textContent = new Date().toLocaleTimeString();
  } catch (error) {
    console.error('Failed to update metrics:', error);
  }
}

function updateServiceCard(serviceKey, data) {
  const { avgLatency, errorRate, requestCount } = data;
  
  document.getElementById(`${serviceKey}-latency`).textContent = `${avgLatency} ms`;
  document.getElementById(`${serviceKey}-error`).textContent = `${errorRate}%`;
  document.getElementById(`${serviceKey}-count`).textContent = requestCount;
  
  const card = document.getElementById(`${serviceKey}-card`);
  const statusIndicator = document.getElementById(`${serviceKey}-status`);
  const latencyElement = document.getElementById(`${serviceKey}-latency`);
  const errorElement = document.getElementById(`${serviceKey}-error`);
  
  card.classList.remove('warning', 'critical');
  statusIndicator.classList.remove('warning', 'critical');
  latencyElement.classList.remove('warning', 'critical');
  errorElement.classList.remove('warning', 'critical');
  
  let isCritical = false;
  let isWarning = false;
  
  if (avgLatency >= LATENCY_CRITICAL || errorRate >= ERROR_CRITICAL) {
    isCritical = true;
  } else if (avgLatency >= LATENCY_WARNING || errorRate >= ERROR_WARNING) {
    isWarning = true;
  }
  
  if (isCritical) {
    card.classList.add('critical');
    statusIndicator.classList.add('critical');
    if (avgLatency >= LATENCY_CRITICAL) {
      latencyElement.classList.add('critical');
    }
    if (errorRate >= ERROR_CRITICAL) {
      errorElement.classList.add('critical');
    }
  } else if (isWarning) {
    card.classList.add('warning');
    statusIndicator.classList.add('warning');
    if (avgLatency >= LATENCY_WARNING) {
      latencyElement.classList.add('warning');
    }
    if (errorRate >= ERROR_WARNING) {
      errorElement.classList.add('warning');
    }
  }
}

document.getElementById('simulate-btn').addEventListener('click', async () => {
  const btn = document.getElementById('simulate-btn');
  btn.disabled = true;
  btn.textContent = 'Simulating...';
  
  try {
    await fetch('/api/simulate-traffic', { method: 'POST' });
    setTimeout(() => {
      updateMetrics();
    }, 500);
  } catch (error) {
    console.error('Failed to simulate traffic:', error);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Simulate Traffic (10 requests)';
  }
});

setInterval(updateMetrics, 2000);

updateMetrics();
