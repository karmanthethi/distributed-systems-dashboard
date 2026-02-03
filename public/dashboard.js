/**
 * SystemFlow Dashboard - Premium UI Controller
 * Real-time monitoring with smooth background data updates
 */

class Dashboard {
  constructor() {
    this.metrics = {};
    this.anomalies = [];
    this.refreshInterval = 2000;
    this.charts = {};
    this.isFirstLoad = true;
    this.serviceCardCache = new Map(); // Cache DOM references for smooth updates
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupSectionNavigation();
    this.loadMetrics(true); // First load with loading indicator
    this.startAutoRefresh();
  }

  initAnimations() {
    // Only animate on first load, not during updates
    if (!this.isFirstLoad) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, index * 80);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.stat-card, .service-card, .chart-card').forEach((el, i) => {
      if (el.dataset.animated) return; // Skip already animated elements
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = `all 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${i * 0.05}s`;
      el.dataset.animated = 'true';
      observer.observe(el);
    });

    this.setupCounterAnimations();
  }

  setupCounterAnimations() {
    document.querySelectorAll('.stat-value').forEach(element => {
      if (element.dataset.hasHoverAnim) return;
      element.dataset.hasHoverAnim = 'true';

      element.addEventListener('mouseenter', () => {
        const text = element.textContent;
        const value = parseFloat(text.replace(/[^0-9.-]/g, '')) || 0;
        const suffix = text.includes('%') ? '%' : '';
        if (value > 0) {
          this.animateValue(element, 0, value, 600, suffix);
        }
      });
    });
  }

  animateValue(element, start, end, duration, suffix = '') {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
        current = end;
        clearInterval(timer);
      }

      if (suffix === '%') {
        element.textContent = `${Math.round(current)}%`;
      } else {
        element.textContent = Math.round(current).toLocaleString();
      }
    }, 16);
  }

  // Smooth value update with CSS transition
  smoothUpdateValue(element, newValue, addClass = null) {
    if (!element) return;

    const currentValue = element.textContent;
    if (currentValue !== newValue) {
      element.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
      element.style.opacity = '0.5';
      element.style.transform = 'scale(0.95)';

      setTimeout(() => {
        element.textContent = newValue;
        element.style.opacity = '1';
        element.style.transform = 'scale(1)';

        // Flash effect for changed values
        element.classList.add('value-updated');
        setTimeout(() => element.classList.remove('value-updated'), 500);
      }, 100);
    }

    // Update classes
    if (addClass !== null) {
      element.className = element.className.replace(/\b(warning|error)\b/g, '').trim();
      if (addClass) {
        element.classList.add(addClass);
      }
    }
  }

  setupEventListeners() {
    document.getElementById('simulate-traffic-btn')?.addEventListener('click', () => this.simulateTraffic());
    document.getElementById('stress-test-btn')?.addEventListener('click', () => this.runStressTest());
    document.getElementById('reset-btn')?.addEventListener('click', () => this.resetMetrics());
    document.getElementById('refresh-btn')?.addEventListener('click', () => {
      this.showToast('Refreshing metrics...', 'info');
      this.loadMetrics(true);
    });

    document.getElementById('anomaly-severity-filter')?.addEventListener('change', (e) => {
      this.filterAnomalies(e.target.value);
    });

    document.getElementById('search-input')?.addEventListener('input', (e) => {
      this.filterServices(e.target.value);
    });
  }

  setupSectionNavigation() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const section = item.getAttribute('data-section');

        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');

        this.switchSection(section);
        this.updatePageTitle(section);
      });
    });
  }

  switchSection(section) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));

    const selectedSection = document.getElementById(`${section}-section`);
    if (selectedSection) {
      selectedSection.classList.add('active');

      if (section === 'performance') {
        setTimeout(() => this.initializeCharts(), 100);
      }
    }
  }

  updatePageTitle(section) {
    const titles = {
      dashboard: { title: 'System Overview', subtitle: 'Real-time monitoring of your distributed infrastructure' },
      services: { title: 'Service Analysis', subtitle: 'In-depth metrics and performance data' },
      anomalies: { title: 'System Anomalies', subtitle: 'Active alerts and issues requiring attention' },
      performance: { title: 'Performance Analytics', subtitle: 'Historical trends and detailed insights' }
    };

    const titleEl = document.querySelector('.page-title h1');
    const subtitleEl = document.querySelector('.page-subtitle');

    if (titles[section]) {
      titleEl.textContent = titles[section].title;
      subtitleEl.textContent = titles[section].subtitle;
    }
  }

  filterServices(query) {
    const cards = document.querySelectorAll('.service-card');
    const lowerQuery = query.toLowerCase();

    cards.forEach(card => {
      const serviceName = card.querySelector('h2')?.textContent.toLowerCase() || '';
      if (serviceName.includes(lowerQuery) || query === '') {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  }

  // Load metrics - only show loading on manual refresh or first load
  async loadMetrics(showLoading = false) {
    try {
      if (showLoading) {
        this.showLoading(true);
      }

      const [metricsRes, statsRes, anomaliesRes] = await Promise.all([
        fetch('/api/metrics'),
        fetch('/api/system-stats'),
        fetch('/api/anomalies?limit=20')
      ]);

      const metricsData = await metricsRes.json();
      const statsData = await statsRes.json();
      const anomaliesData = await anomaliesRes.json();

      if (metricsData.success) {
        const previousMetrics = this.metrics;
        this.metrics = metricsData.data;

        if (this.isFirstLoad) {
          this.buildDashboard();
          this.isFirstLoad = false;
          this.initAnimations();
        } else {
          this.updateDashboardSmooth(previousMetrics);
        }
      }

      if (statsData.success) {
        this.updateSystemStatsSmooth(statsData.data);
      }

      if (anomaliesData.success) {
        const prevAnomaliesCount = this.anomalies.length;
        this.anomalies = anomaliesData.data;

        // Only rebuild anomalies if count changed significantly
        if (Math.abs(this.anomalies.length - prevAnomaliesCount) > 0 || this.isFirstLoad) {
          this.updateAnomaliesSmooth();
        }
      }

      this.updateLastUpdate();
    } catch (error) {
      console.error('Error loading metrics:', error);
      // Only show error on first load
      if (this.isFirstLoad) {
        this.showToast('Failed to load metrics', 'error');
      }
    } finally {
      if (showLoading) {
        this.showLoading(false);
      }
    }
  }

  // Build dashboard on first load
  buildDashboard() {
    const servicesGrid = document.getElementById('services-grid');
    servicesGrid.innerHTML = '';
    this.serviceCardCache.clear();

    Object.entries(this.metrics).forEach(([serviceName, metrics], index) => {
      const card = this.createServiceCard(serviceName, metrics, index);
      servicesGrid.appendChild(card);
      this.serviceCardCache.set(serviceName, card);
    });

    this.updateServicesDetail();
  }

  // Smooth update without rebuilding DOM
  updateDashboardSmooth(previousMetrics) {
    const servicesGrid = document.getElementById('services-grid');

    Object.entries(this.metrics).forEach(([serviceName, metrics], index) => {
      let card = this.serviceCardCache.get(serviceName);

      // If new service appeared, create card
      if (!card) {
        card = this.createServiceCard(serviceName, metrics, index);
        servicesGrid.appendChild(card);
        this.serviceCardCache.set(serviceName, card);
        card.style.animation = 'fadeIn 0.3s ease-out';
        return;
      }

      // Update existing card values smoothly
      this.updateServiceCardValues(card, serviceName, metrics);
    });

    // Remove cards for services that no longer exist
    this.serviceCardCache.forEach((card, serviceName) => {
      if (!this.metrics[serviceName]) {
        card.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
          card.remove();
          this.serviceCardCache.delete(serviceName);
        }, 300);
      }
    });

    // Update services detail section smoothly
    this.updateServicesDetailSmooth();
  }

  updateServiceCardValues(card, serviceName, metrics) {
    const errorRate = parseFloat(metrics.errorRate) || 0;
    const healthScore = metrics.healthScore || 100;
    const availability = parseFloat(metrics.availability) || 99;

    // Update status indicator
    let statusClass = 'success';
    if (healthScore < 50 || errorRate > 20) {
      statusClass = 'error';
    } else if (healthScore < 80 || errorRate > 10) {
      statusClass = 'warning';
    }

    const statusIndicator = card.querySelector('.status-indicator');
    if (statusIndicator) {
      statusIndicator.className = `status-indicator ${statusClass}`;
    }

    // Update metric values
    const metricValues = card.querySelectorAll('.metric');
    const metricsData = [
      { value: `${healthScore}%`, warning: healthScore < 80 },
      { value: `${availability}%`, warning: availability < 95 },
      { value: `${metrics.avgLatency || 0} ms` },
      { value: `${metrics.p95Latency || 0} ms` },
      { value: `${errorRate.toFixed(2)}%`, warning: errorRate > 10, error: errorRate > 20 },
      { value: (metrics.totalRequests || 0).toLocaleString() },
      { value: `${(metrics.cpuUsage || 0).toFixed(1)}%` },
      { value: `${(metrics.memoryUsage || 0).toFixed(1)}%` }
    ];

    metricValues.forEach((metric, i) => {
      if (metricsData[i]) {
        const valueEl = metric.querySelector('.metric-value');
        if (valueEl) {
          const addClass = metricsData[i].error ? 'error' : (metricsData[i].warning ? 'warning' : '');
          this.smoothUpdateValue(valueEl, metricsData[i].value, addClass);
        }
      }
    });
  }

  createServiceCard(serviceName, metrics, index) {
    const card = document.createElement('div');
    card.className = 'service-card';
    card.dataset.serviceName = serviceName;

    const errorRate = parseFloat(metrics.errorRate) || 0;
    const healthScore = metrics.healthScore || 100;
    const availability = parseFloat(metrics.availability) || 99;

    let statusClass = 'success';
    if (healthScore < 50 || errorRate > 20) {
      statusClass = 'error';
    } else if (healthScore < 80 || errorRate > 10) {
      statusClass = 'warning';
    }

    card.innerHTML = `
      <div class="service-header">
        <h2>${this.formatServiceName(serviceName)}</h2>
        <div class="status-indicator ${statusClass}"></div>
      </div>
      <div class="metrics">
        <div class="metric">
          <span class="metric-label">Health</span>
          <span class="metric-value ${healthScore < 80 ? 'warning' : ''}">${healthScore}%</span>
        </div>
        <div class="metric">
          <span class="metric-label">Availability</span>
          <span class="metric-value ${availability < 95 ? 'warning' : ''}">${availability}%</span>
        </div>
        <div class="metric">
          <span class="metric-label">Avg Latency</span>
          <span class="metric-value">${metrics.avgLatency || 0} ms</span>
        </div>
        <div class="metric">
          <span class="metric-label">P95 Latency</span>
          <span class="metric-value">${metrics.p95Latency || 0} ms</span>
        </div>
        <div class="metric">
          <span class="metric-label">Error Rate</span>
          <span class="metric-value ${errorRate > 20 ? 'error' : errorRate > 10 ? 'warning' : ''}">${errorRate.toFixed(2)}%</span>
        </div>
        <div class="metric">
          <span class="metric-label">Requests</span>
          <span class="metric-value">${(metrics.totalRequests || 0).toLocaleString()}</span>
        </div>
        <div class="metric">
          <span class="metric-label">CPU</span>
          <span class="metric-value">${(metrics.cpuUsage || 0).toFixed(1)}%</span>
        </div>
        <div class="metric">
          <span class="metric-label">Memory</span>
          <span class="metric-value">${(metrics.memoryUsage || 0).toFixed(1)}%</span>
        </div>
      </div>
    `;

    return card;
  }

  formatServiceName(name) {
    return name.replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  updateServicesDetail() {
    const detailContainer = document.getElementById('services-detail');
    detailContainer.innerHTML = '';

    Object.entries(this.metrics).forEach(([serviceName, metrics]) => {
      const detailCard = this.createServiceDetailCard(serviceName, metrics);
      detailContainer.appendChild(detailCard);
    });
  }

  updateServicesDetailSmooth() {
    // For services detail, we can do a simple check and rebuild if actively viewing
    const servicesSection = document.getElementById('services-section');
    if (servicesSection?.classList.contains('active')) {
      this.updateServicesDetail();
    }
  }

  createServiceDetailCard(serviceName, metrics) {
    const detailCard = document.createElement('div');
    detailCard.className = 'service-detail-card';

    detailCard.innerHTML = `
      <div class="service-detail-header">
        <div class="service-detail-title">${this.formatServiceName(serviceName)}</div>
        <div style="font-size: 0.85rem; color: var(--text-secondary);">
          Health: ${metrics.healthScore}% | Availability: ${metrics.availability}%
        </div>
      </div>
      
      <h4 style="color: var(--primary-light); margin: 1rem 0 0.75rem 0; font-size: 0.9rem; font-weight: 600;">Request Metrics</h4>
      <div class="service-detail-body">
        <div class="detail-metric">
          <div class="detail-metric-label">Total</div>
          <div class="detail-metric-value">${(metrics.totalRequests || 0).toLocaleString()}</div>
        </div>
        <div class="detail-metric">
          <div class="detail-metric-label">Successful</div>
          <div class="detail-metric-value" style="color: var(--success);">${(metrics.successfulRequests || 0).toLocaleString()}</div>
        </div>
        <div class="detail-metric">
          <div class="detail-metric-label">Failed</div>
          <div class="detail-metric-value" style="color: var(--danger);">${(metrics.failedRequests || 0).toLocaleString()}</div>
        </div>
        <div class="detail-metric">
          <div class="detail-metric-label">Error Rate</div>
          <div class="detail-metric-value" style="color: var(--warning);">${metrics.errorRate}%</div>
        </div>
      </div>
      
      <h4 style="color: var(--primary-light); margin: 1rem 0 0.75rem 0; font-size: 0.9rem; font-weight: 600;">Performance</h4>
      <div class="service-detail-body">
        <div class="detail-metric">
          <div class="detail-metric-label">Avg Latency</div>
          <div class="detail-metric-value">${metrics.avgLatency} ms</div>
        </div>
        <div class="detail-metric">
          <div class="detail-metric-label">P95</div>
          <div class="detail-metric-value">${metrics.p95Latency} ms</div>
        </div>
        <div class="detail-metric">
          <div class="detail-metric-label">P99</div>
          <div class="detail-metric-value">${metrics.p99Latency} ms</div>
        </div>
        <div class="detail-metric">
          <div class="detail-metric-label">Throughput</div>
          <div class="detail-metric-value">${metrics.throughput} req/s</div>
        </div>
      </div>
      
      <h4 style="color: var(--primary-light); margin: 1rem 0 0.75rem 0; font-size: 0.9rem; font-weight: 600;">Resource Usage</h4>
      <div class="service-detail-body">
        <div class="detail-metric">
          <div class="detail-metric-label">CPU</div>
          <div class="detail-metric-value">${metrics.cpuUsage}%</div>
        </div>
        <div class="detail-metric">
          <div class="detail-metric-label">Memory</div>
          <div class="detail-metric-value">${metrics.memoryUsage}%</div>
        </div>
        <div class="detail-metric">
          <div class="detail-metric-label">Crashes</div>
          <div class="detail-metric-value" style="color: var(--danger);">${metrics.crashes || 0}</div>
        </div>
        <div class="detail-metric">
          <div class="detail-metric-label">Timeouts</div>
          <div class="detail-metric-value" style="color: var(--warning);">${metrics.timeouts || 0}</div>
        </div>
      </div>
    `;

    return detailCard;
  }

  // Smooth update system stats without flickering
  updateSystemStatsSmooth(stats) {
    this.smoothUpdateValue(document.getElementById('health-score'), `${stats.highestHealthScore || 0}%`);
    this.smoothUpdateValue(document.getElementById('total-requests'), (stats.totalRequests || 0).toLocaleString());
    this.smoothUpdateValue(document.getElementById('error-rate'), `${stats.averageErrorRate || 0}%`);
    this.smoothUpdateValue(document.getElementById('anomalies-count'), String(stats.anomaliesCount || 0));

    // Footer updates without animation
    const footerServices = document.getElementById('footer-services');
    const footerUptime = document.getElementById('footer-uptime');
    if (footerServices) footerServices.textContent = stats.totalServices || 0;
    if (footerUptime) footerUptime.textContent = this.formatUptime(stats.totalServices > 0 ? 3600000 : 0);
  }

  updateAnomaliesSmooth() {
    const container = document.getElementById('anomalies-list');

    if (this.anomalies.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: var(--text-muted);">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="48" height="48" style="margin-bottom: 1rem; opacity: 0.5;">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <p>No anomalies detected</p>
          <p style="font-size: 0.85rem; margin-top: 0.5rem;">All systems are operating normally</p>
        </div>
      `;
      return;
    }

    // Build new content
    const fragment = document.createDocumentFragment();

    this.anomalies.forEach(anomaly => {
      const item = document.createElement('div');
      item.className = `anomaly-item ${anomaly.severity}`;

      const time = new Date(anomaly.timestamp);
      const timeStr = time.toLocaleTimeString();

      item.innerHTML = `
        <div class="anomaly-header">
          <div class="anomaly-title">
            <span class="anomaly-service">${this.formatServiceName(anomaly.serviceName)}</span>
            <span class="anomaly-type ${anomaly.severity}">${anomaly.type}</span>
          </div>
          <span class="anomaly-time">${timeStr}</span>
        </div>
        <div class="anomaly-description">${anomaly.description}</div>
      `;

      fragment.appendChild(item);
    });

    // Smooth transition
    container.style.opacity = '0.5';
    setTimeout(() => {
      container.innerHTML = '';
      container.appendChild(fragment);
      container.style.opacity = '1';
    }, 150);
  }

  filterAnomalies(severity) {
    const container = document.getElementById('anomalies-list');

    const filtered = severity
      ? this.anomalies.filter(a => a.severity === severity)
      : this.anomalies;

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: var(--text-muted);">
          <p>No anomalies found matching the selected filter</p>
        </div>
      `;
      return;
    }

    container.innerHTML = '';
    filtered.forEach(anomaly => {
      const item = document.createElement('div');
      item.className = `anomaly-item ${anomaly.severity}`;

      const time = new Date(anomaly.timestamp);
      const timeStr = time.toLocaleTimeString();

      item.innerHTML = `
        <div class="anomaly-header">
          <div class="anomaly-title">
            <span class="anomaly-service">${this.formatServiceName(anomaly.serviceName)}</span>
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
    if (Object.keys(this.charts).length > 0) {
      // Update existing charts instead of recreating
      this.updateCharts();
      return;
    }

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 500 // Smooth chart animations
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: '#9ca3af',
            font: { size: 11, family: 'Inter' },
            padding: 15
          }
        }
      },
      scales: {
        y: {
          grid: { color: 'rgba(99, 102, 241, 0.1)' },
          ticks: { color: '#6b7280', font: { size: 11 } }
        },
        x: {
          grid: { color: 'rgba(99, 102, 241, 0.1)' },
          ticks: { color: '#6b7280', font: { size: 11 } }
        }
      }
    };

    const chartConfigs = {
      latency: {
        canvas: 'latency-chart',
        label: 'Latency (ms)',
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)'
      },
      error: {
        canvas: 'error-chart',
        label: 'Error Rate (%)',
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)'
      },
      resource: {
        canvas: 'resource-chart',
        label: 'Usage (%)',
        borderColor: '#22d3ee',
        backgroundColor: 'rgba(34, 211, 238, 0.1)'
      }
    };

    Object.entries(chartConfigs).forEach(([key, config]) => {
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
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: config.borderColor
          }]
        },
        options: chartOptions
      });
    });

    const statusCanvas = document.getElementById('status-chart');
    if (statusCanvas) {
      this.charts.status = new Chart(statusCanvas, {
        type: 'doughnut',
        data: {
          labels: ['2xx Success', '4xx Client Error', '5xx Server Error'],
          datasets: [{
            data: [85, 10, 5],
            backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 500 },
          plugins: {
            legend: {
              position: 'right',
              labels: { color: '#9ca3af', font: { size: 11 } }
            }
          }
        }
      });
    }
  }

  updateCharts() {
    ['latency', 'error', 'resource'].forEach(key => {
      if (this.charts[key]) {
        this.charts[key].data.labels = this.getServiceNames();
        this.charts[key].data.datasets[0].data = this.getChartData(key);
        this.charts[key].update('none'); // Update without animation for smooth feel
      }
    });
  }

  getServiceNames() {
    return Object.keys(this.metrics);
  }

  getChartData(type) {
    return this.getServiceNames().map(serviceName => {
      const metrics = this.metrics[serviceName];
      switch (type) {
        case 'latency': return metrics.avgLatency || 0;
        case 'error': return parseFloat(metrics.errorRate) || 0;
        case 'resource': return ((metrics.cpuUsage || 0) + (metrics.memoryUsage || 0)) / 2;
        default: return 0;
      }
    });
  }

  updateLastUpdate() {
    const now = new Date();
    const el = document.getElementById('last-update');
    if (el) {
      el.textContent = now.toLocaleTimeString();
    }
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
        setTimeout(() => this.loadMetrics(false), 1000);
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
      }
    } catch (error) {
      this.showToast('Failed to start stress test', 'error');
    } finally {
      this.showLoading(false);
    }
  }

  async resetMetrics() {
    if (!confirm('Reset all metrics? This action cannot be undone.')) return;

    try {
      this.showLoading(true);
      const response = await fetch('/api/reset', { method: 'POST' });
      const data = await response.json();

      if (data.success) {
        this.showToast('Metrics reset successfully', 'success');
        this.isFirstLoad = true;
        this.serviceCardCache.clear();
        this.loadMetrics(true);
      }
    } catch (error) {
      this.showToast('Failed to reset metrics', 'error');
    } finally {
      this.showLoading(false);
    }
  }

  startAutoRefresh() {
    setInterval(() => {
      // Background refresh - no loading indicator
      this.loadMetrics(false);
    }, this.refreshInterval);
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

    setTimeout(() => {
      toast.style.animation = 'toast-out 0.3s ease-in forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  formatUptime(ms) {
    const hours = Math.floor(ms / 3600000);
    return `${hours}h`;
  }
}

// Add required CSS for smooth updates
const style = document.createElement('style');
style.textContent = `
  @keyframes toast-out {
    from { opacity: 1; transform: translateX(0); }
    to { opacity: 0; transform: translateX(100px); }
  }
  
  @keyframes fadeOut {
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(-10px); }
  }
  
  .value-updated {
    animation: value-flash 0.5s ease-out;
  }
  
  @keyframes value-flash {
    0% { background: rgba(99, 102, 241, 0.3); }
    100% { background: transparent; }
  }
  
  .metric-value, .stat-value, .detail-metric-value {
    transition: opacity 0.2s ease, transform 0.2s ease, color 0.3s ease;
  }
  
  .service-card, .stat-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  }
  
  .anomalies-list {
    transition: opacity 0.15s ease;
  }
`;
document.head.appendChild(style);

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new Dashboard();
});
