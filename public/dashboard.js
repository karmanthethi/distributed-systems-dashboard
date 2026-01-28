/**
 * Enterprise Dashboard - Main JavaScript
 * Real-time monitoring and visualization of distributed systems
 */

class Dashboard {
  constructor() {
    this.metrics = {};
    this.anomalies = [];
    this.refreshInterval = 2000;
    this.charts = {};
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupSectionNavigation();
    this.startAutoRefresh();
    this.loadMetrics();
  }

  setupEventListeners() {
    // Button listeners
    document.getElementById('simulate-traffic-btn')?.addEventListener('click', () => this.simulateTraffic());
    document.getElementById('stress-test-btn')?.addEventListener('click', () => this.runStressTest());
    document.getElementById('reset-btn')?.addEventListener('click', () => this.resetMetrics());
    document.getElementById('refresh-btn')?.addEventListener('click', () => this.loadMetrics());
    
    // Anomaly filter
    document.getElementById('anomaly-severity-filter')?.addEventListener('change', (e) => this.filterAnomalies(e.target.value));
  }

  setupSectionNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.getAttribute('data-section');
        this.switchSection(section);
        
        // Update active nav link
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      });
    });
  }

  switchSection(section) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    
    // Show selected section
    const selectedSection = document.getElementById(`${section}-section`);
    if (selectedSection) {
      selectedSection.classList.add('active');
      
      // Initialize charts if needed
      if (section === 'performance') {
        setTimeout(() => this.initializeCharts(), 100);
      }
    }
  }

  async loadMetrics() {
    try {
      this.showLoading(true);
      
      const [metricsRes, statsRes, anomaliesRes] = await Promise.all([
        fetch('/api/metrics'),
        fetch('/api/system-stats'),
        fetch('/api/anomalies?limit=20')
      ]);

      const metricsData = await metricsRes.json();
      const statsData = await statsRes.json();
      const anomaliesData = await anomaliesRes.json();

      if (metricsData.success) {
        this.metrics = metricsData.data;
        this.updateDashboard();
      }

      if (statsData.success) {
        this.updateSystemStats(statsData.data);
      }

      if (anomaliesData.success) {
        this.anomalies = anomaliesData.data;
        this.updateAnomalies();
      }

      this.updateLastUpdate();
    } catch (error) {
      console.error('Error loading metrics:', error);
      this.showToast('Failed to load metrics', 'error');
    } finally {
      this.showLoading(false);
    }
  }

  updateDashboard() {
    // Update services grid
    const servicesGrid = document.getElementById('services-grid');
    servicesGrid.innerHTML = '';

    Object.entries(this.metrics).forEach(([serviceName, metrics]) => {
      const card = this.createServiceCard(serviceName, metrics);
      servicesGrid.appendChild(card);
    });

    // Update services detail section
    this.updateServicesDetail();
  }

  createServiceCard(serviceName, metrics) {
    const card = document.createElement('div');
    card.className = 'service-card';
    
    const errorRate = parseFloat(metrics.errorRate);
    const healthScore = metrics.healthScore || 100;
    const availability = parseFloat(metrics.availability) || 0;
    const statusClass = healthScore > 80 ? 'success' : healthScore > 50 ? 'warning' : 'error';

    card.innerHTML = `
      <div class="service-header">
        <h2>${serviceName}</h2>
        <div class="status-indicator ${statusClass}"></div>
      </div>
      <div class="metrics">
        <div class="metric">
          <span class="metric-label">Health Score</span>
          <span class="metric-value">${healthScore}%</span>
        </div>
        <div class="metric">
          <span class="metric-label">Availability</span>
          <span class="metric-value ${availability < 95 ? 'warning' : ''}">${availability}%</span>
        </div>
        <div class="metric">
          <span class="metric-label">Region</span>
          <span class="metric-value" style="font-size: 0.9rem;">${metrics.region || 'N/A'}</span>
        </div>
        <div class="metric">
          <span class="metric-label">Avg Latency</span>
          <span class="metric-value">${metrics.avgLatency} ms</span>
        </div>
        <div class="metric">
          <span class="metric-label">P95 Latency</span>
          <span class="metric-value">${metrics.p95Latency} ms</span>
        </div>
        <div class="metric">
          <span class="metric-label">Error Rate</span>
          <span class="metric-value ${errorRate > 20 ? 'error' : errorRate > 10 ? 'warning' : ''}">
            ${errorRate.toFixed(2)}%
          </span>
        </div>
        <div class="metric">
          <span class="metric-label">Total Requests</span>
          <span class="metric-value">${metrics.totalRequests.toLocaleString()}</span>
        </div>
        <div class="metric">
          <span class="metric-label">Timeouts</span>
          <span class="metric-value ${metrics.timeouts > 0 ? 'warning' : ''}">${metrics.timeouts || 0}</span>
        </div>
        <div class="metric">
          <span class="metric-label">Crashes</span>
          <span class="metric-value ${metrics.crashes > 0 ? 'error' : ''}">${metrics.crashes}</span>
        </div>
        <div class="metric">
          <span class="metric-label">CPU Usage</span>
          <span class="metric-value">${metrics.cpuUsage.toFixed(1)}%</span>
        </div>
        <div class="metric">
          <span class="metric-label">Memory Usage</span>
          <span class="metric-value">${metrics.memoryUsage.toFixed(1)}%</span>
        </div>
      </div>
    `;

    return card;
  }

  updateServicesDetail() {
    const detailContainer = document.getElementById('services-detail');
    detailContainer.innerHTML = '';

    Object.entries(this.metrics).forEach(([serviceName, metrics]) => {
      const detailCard = document.createElement('div');
      detailCard.className = 'service-detail-card';
      
      detailCard.innerHTML = `
        <div class="service-detail-header">
          <div class="service-detail-title">${serviceName}</div>
          <div>Health: ${metrics.healthScore}% | Availability: ${metrics.availability}%</div>
        </div>
        <h4 style="color: var(--primary); margin: 1rem 0 0.5rem 0;">Request Metrics</h4>
        <div class="service-detail-body">
          <div class="detail-metric">
            <div class="detail-metric-label">Total Requests</div>
            <div class="detail-metric-value">${metrics.totalRequests.toLocaleString()}</div>
          </div>
          <div class="detail-metric">
            <div class="detail-metric-label">Successful</div>
            <div class="detail-metric-value">${metrics.successfulRequests.toLocaleString()}</div>
          </div>
          <div class="detail-metric">
            <div class="detail-metric-label">Failed</div>
            <div class="detail-metric-value" style="color: var(--danger);">${metrics.failedRequests.toLocaleString()}</div>
          </div>
          <div class="detail-metric">
            <div class="detail-metric-label">Error Rate</div>
            <div class="detail-metric-value" style="color: var(--warning);">${metrics.errorRate}%</div>
          </div>
        </div>
        
        <h4 style="color: var(--primary); margin: 1rem 0 0.5rem 0;">Timing Breakdown</h4>
        <div class="service-detail-body">
          <div class="detail-metric">
            <div class="detail-metric-label">DNS Lookup</div>
            <div class="detail-metric-value">${metrics.avgDnsLookupTime || 0} ms</div>
          </div>
          <div class="detail-metric">
            <div class="detail-metric-label">TCP Connection</div>
            <div class="detail-metric-value">${metrics.avgTcpConnectionTime || 0} ms</div>
          </div>
          <div class="detail-metric">
            <div class="detail-metric-label">TLS Handshake</div>
            <div class="detail-metric-value">${metrics.avgTlsHandshakeTime || 0} ms</div>
          </div>
          <div class="detail-metric">
            <div class="detail-metric-label">Time to First Byte</div>
            <div class="detail-metric-value">${metrics.avgTimeToFirstByte || 0} ms</div>
          </div>
          <div class="detail-metric">
            <div class="detail-metric-label">Avg Latency</div>
            <div class="detail-metric-value">${metrics.avgLatency} ms</div>
          </div>
          <div class="detail-metric">
            <div class="detail-metric-label">P99 Latency</div>
            <div class="detail-metric-value">${metrics.p99Latency} ms</div>
          </div>
        </div>

        <h4 style="color: var(--primary); margin: 1rem 0 0.5rem 0;">Failure Analysis</h4>
        <div class="service-detail-body">
          <div class="detail-metric">
            <div class="detail-metric-label">Crashes</div>
            <div class="detail-metric-value" style="color: var(--critical);">${metrics.crashes}</div>
          </div>
          <div class="detail-metric">
            <div class="detail-metric-label">Timeouts</div>
            <div class="detail-metric-value" style="color: var(--warning);">${metrics.timeouts || 0}</div>
          </div>
          <div class="detail-metric">
            <div class="detail-metric-label">Network Errors</div>
            <div class="detail-metric-value" style="color: var(--danger);">${metrics.networkErrors || 0}</div>
          </div>
          <div class="detail-metric">
            <div class="detail-metric-label">Total Retries</div>
            <div class="detail-metric-value">${metrics.totalRetries || 0}</div>
          </div>
          <div class="detail-metric">
            <div class="detail-metric-label">Consecutive Failures</div>
            <div class="detail-metric-value" style="color: ${metrics.consecutiveFailures > 3 ? 'var(--danger)' : 'var(--text-primary)'};">${metrics.consecutiveFailures || 0}</div>
          </div>
          <div class="detail-metric">
            <div class="detail-metric-label">Max Consecutive</div>
            <div class="detail-metric-value">${metrics.maxConsecutiveFailures || 0}</div>
          </div>
        </div>

        <h4 style="color: var(--primary); margin: 1rem 0 0.5rem 0;">Performance</h4>
        <div class="service-detail-body">
          <div class="detail-metric">
            <div class="detail-metric-label">Cache Hit Rate</div>
            <div class="detail-metric-value">${metrics.cacheHitRate}%</div>
          </div>
          <div class="detail-metric">
            <div class="detail-metric-label">Throughput</div>
            <div class="detail-metric-value">${metrics.throughput} req/s</div>
          </div>
          <div class="detail-metric">
            <div class="detail-metric-label">CPU Usage</div>
            <div class="detail-metric-value">${metrics.cpuUsage}%</div>
          </div>
          <div class="detail-metric">
            <div class="detail-metric-label">Memory Usage</div>
            <div class="detail-metric-value">${metrics.memoryUsage}%</div>
          </div>
        </div>

        ${metrics.recentTraces && metrics.recentTraces.length > 0 ? `
          <h4 style="color: var(--primary); margin: 1rem 0 0.5rem 0;">Recent Traces</h4>
          <div style="background: rgba(0,0,0,0.2); padding: 0.75rem; border-radius: 8px; font-family: monospace; font-size: 0.85rem;">
            ${metrics.recentTraces.map(trace => `
              <div style="padding: 0.5rem; border-left: 2px solid var(--primary); margin: 0.5rem 0; padding-left: 0.75rem;">
                <div style="color: var(--primary);">${trace.traceId}</div>
                <div style="color: var(--text-secondary); font-size: 0.8rem;">
                  ${trace.endpoint} | ${trace.statusCode} | ${trace.latency}ms | ${new Date(trace.timestamp).toLocaleTimeString()}
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      `;

      detailContainer.appendChild(detailCard);
    });
  }

  updateSystemStats(stats) {
    document.getElementById('health-score').textContent = `${stats.highestHealthScore}%`;
    document.getElementById('total-requests').textContent = stats.totalRequests.toLocaleString();
    document.getElementById('error-rate').textContent = `${stats.averageErrorRate}%`;
    document.getElementById('anomalies-count').textContent = stats.anomaliesCount;
    document.getElementById('footer-services').textContent = stats.totalServices;
    document.getElementById('footer-uptime').textContent = this.formatUptime(stats.totalServices > 0 ? 3600000 : 0);
  }

  updateAnomalies() {
    const container = document.getElementById('anomalies-list');
    container.innerHTML = '';

    if (this.anomalies.length === 0) {
      container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">No anomalies detected</p>';
      return;
    }

    this.anomalies.forEach(anomaly => {
      const item = document.createElement('div');
      item.className = `anomaly-item ${anomaly.severity}`;
      
      const time = new Date(anomaly.timestamp);
      const timeStr = time.toLocaleTimeString();

      item.innerHTML = `
        <div class="anomaly-header">
          <div class="anomaly-title">
            <span class="anomaly-service">${anomaly.serviceName}</span>
            <span class="anomaly-type ${anomaly.severity}">${anomaly.type}</span>
          </div>
          <span class="anomaly-time">${timeStr}</span>
        </div>
        <div class="anomaly-description">${anomaly.description}</div>
      `;

      container.appendChild(item);
    });
  }

  filterAnomalies(severity) {
    const container = document.getElementById('anomalies-list');
    container.innerHTML = '';

    const filtered = severity 
      ? this.anomalies.filter(a => a.severity === severity)
      : this.anomalies;

    if (filtered.length === 0) {
      container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">No anomalies found</p>';
      return;
    }

    filtered.forEach(anomaly => {
      const item = document.createElement('div');
      item.className = `anomaly-item ${anomaly.severity}`;
      
      const time = new Date(anomaly.timestamp);
      const timeStr = time.toLocaleTimeString();

      item.innerHTML = `
        <div class="anomaly-header">
          <div class="anomaly-title">
            <span class="anomaly-service">${anomaly.serviceName}</span>
            <span class="anomaly-type ${anomaly.severity}">${anomaly.type}</span>
          </div>
          <span class="anomaly-time">${timeStr}</span>
        </div>
        <div class="anomaly-description">${anomaly.description}</div>
      `;

      container.appendChild(item);
    });
  }

  initializeCharts() {
    if (Object.keys(this.charts).length > 0) return;

    const chartConfig = {
      latency: {
        canvas: 'latency-chart',
        label: 'Average Latency (ms)',
        borderColor: 'rgb(0, 217, 255)',
        backgroundColor: 'rgba(0, 217, 255, 0.1)'
      },
      error: {
        canvas: 'error-chart',
        label: 'Error Rate (%)',
        borderColor: 'rgb(255, 0, 110)',
        backgroundColor: 'rgba(255, 0, 110, 0.1)'
      },
      resource: {
        canvas: 'resource-chart',
        label: 'Resource Usage (%)',
        borderColor: 'rgb(255, 183, 3)',
        backgroundColor: 'rgba(255, 183, 3, 0.1)'
      }
    };

    Object.entries(chartConfig).forEach(([key, config]) => {
      const canvas = document.getElementById(config.canvas);
      if (!canvas) return;

      this.charts[key] = new Chart(canvas, {
        type: 'line',
        data: {
          labels: this.getServiceNames(),
          datasets: [{
            label: config.label,
            data: this.getChartData(key),
            borderColor: config.borderColor,
            backgroundColor: config.backgroundColor,
            borderWidth: 2,
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              labels: {
                color: 'rgb(224, 231, 255)',
                font: { size: 12 }
              }
            }
          },
          scales: {
            y: {
              grid: { color: 'rgba(45, 55, 72, 0.2)' },
              ticks: { color: 'rgb(155, 163, 175)' }
            },
            x: {
              grid: { color: 'rgba(45, 55, 72, 0.2)' },
              ticks: { color: 'rgb(155, 163, 175)' }
            }
          }
        }
      });
    });
  }

  getServiceNames() {
    return Object.keys(this.metrics);
  }

  getChartData(type) {
    return this.getServiceNames().map(serviceName => {
      const metrics = this.metrics[serviceName];
      switch(type) {
        case 'latency':
          return metrics.avgLatency;
        case 'error':
          return metrics.errorRate;
        case 'resource':
          return (metrics.cpuUsage + metrics.memoryUsage) / 2;
        default:
          return 0;
      }
    });
  }

  updateLastUpdate() {
    const now = new Date();
    document.getElementById('last-update').textContent = now.toLocaleTimeString();
  }

  async simulateTraffic() {
    try {
      this.showLoading(true);
      const response = await fetch('/api/simulate-traffic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 20 })
      });

      const data = await response.json();
      if (data.success) {
        this.showToast('Traffic simulation started', 'success');
        setTimeout(() => this.loadMetrics(), 1000);
      }
    } catch (error) {
      this.showToast('Failed to simulate traffic', 'error');
    } finally {
      this.showLoading(false);
    }
  }

  async runStressTest() {
    try {
      this.showLoading(true);
      const response = await fetch('/api/stress-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration: 30, requestsPerSecond: 100 })
      });

      const data = await response.json();
      if (data.success) {
        this.showToast('Stress test running for 30 seconds', 'success');
        setTimeout(() => this.loadMetrics(), 5000);
      }
    } catch (error) {
      this.showToast('Failed to run stress test', 'error');
    } finally {
      this.showLoading(false);
    }
  }

  async resetMetrics() {
    if (!confirm('Are you sure you want to reset all metrics? This cannot be undone.')) return;

    try {
      this.showLoading(true);
      const response = await fetch('/api/reset', { method: 'POST' });
      const data = await response.json();

      if (data.success) {
        this.showToast('Metrics reset successfully', 'success');
        this.loadMetrics();
      }
    } catch (error) {
      this.showToast('Failed to reset metrics', 'error');
    } finally {
      this.showLoading(false);
    }
  }

  startAutoRefresh() {
    setInterval(() => this.loadMetrics(), this.refreshInterval);
  }

  showLoading(show) {
    const spinner = document.getElementById('loading-spinner');
    if (show) {
      spinner?.classList.add('active');
    } else {
      spinner?.classList.remove('active');
    }
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    container?.appendChild(toast);
    
    setTimeout(() => toast.remove(), 3000);
  }

  formatUptime(ms) {
    const hours = Math.floor(ms / 3600000);
    return `${hours}h`;
  }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new Dashboard();
});
