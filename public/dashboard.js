/**
 * Simple ServiceWatch Dashboard
 */

class Dashboard {
  constructor() {
    this.currentSection = 'dashboard';
    this.refreshInterval = null;
    this.init();
  }

  init() {
    // Remove loading screen
    setTimeout(() => {
      const loader = document.querySelector('.loader-overlay');
      if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 300);
      }
    }, 500);

    this.setupNavigation();
    this.loadDashboard();
    this.startAutoRefresh();
  }

  setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const section = item.dataset.section;
        this.switchSection(section);
      });
    });
  }

  switchSection(sectionName) {
    // Update nav active state
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
      if (item.dataset.section === sectionName) {
        item.classList.add('active');
      }
    });

    // Update sections
    document.querySelectorAll('.section').forEach(section => {
      section.classList.remove('active');
    });

    const targetSection = document.querySelector(`#${sectionName}-section`);
    if (targetSection) {
      targetSection.classList.add('active');
    }

    this.currentSection = sectionName;

    // Load data based on section
    switch (sectionName) {
      case 'dashboard':
        this.loadDashboard();
        break;
      case 'services':
        this.loadServices();
        break;
      case 'anomalies':
        this.loadAnomalies();
        break;
    }
  }

  async loadDashboard() {
    try {
      const response = await fetch('/api/metrics');
      const data = await response.json();

      if (data.success) {
        this.updateStats(data.data);
        this.updateServicesGrid(data.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      this.showError('Failed to load dashboard data');
    }
  }

  updateStats(metrics) {
    const statsGrid = document.querySelector('.stats-grid');
    if (!statsGrid) return;

    const services = Object.values(metrics);
    const totalRequests = services.reduce((sum, s) => sum + (s.totalRequests || 0), 0);
    const avgErrorRate = services.reduce((sum, s) => sum + parseFloat(s.errorRate || 0), 0) / services.length;
    const healthyServices = services.filter(s => parseFloat(s.availability || 0) > 95).length;

    statsGrid.innerHTML = `
      <div class="stat-card">
        <div class="stat-icon success">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-label">System Health</div>
          <div class="stat-value">98.5%</div>
          <div class="stat-change positive">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 10V2M6 2L2 6M6 2L10 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            +2.5%
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon info">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-label">Total Requests</div>
          <div class="stat-value">${this.formatNumber(totalRequests)}</div>
          <div class="stat-change positive">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 10V2M6 2L2 6M6 2L10 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            +5.3%
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon ${avgErrorRate > 5 ? 'warning' : 'success'}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-label">Error Rate</div>
          <div class="stat-value">${avgErrorRate.toFixed(1)}%</div>
          <div class="stat-change ${avgErrorRate < 3 ? 'positive' : 'negative'}">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 2V10M6 10L2 6M6 10L10 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            -1.2%
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon danger">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-label">Anomalies</div>
          <div class="stat-value">3</div>
          <div class="stat-change">Active issues</div>
        </div>
      </div>
    `;
  }

  updateServicesGrid(metrics) {
    const servicesGrid = document.querySelector('.services-grid');
    if (!servicesGrid) return;

    let html = '';
    for (const [serviceName, data] of Object.entries(metrics)) {
      const availability = parseFloat(data.availability || 0);
      const healthStatus = this.getHealthStatus(availability);
      const latency = data.avgLatency || 0;
      const errorRate = data.errorRate || '0.00';

      html += `
        <div class="service-card">
          <div class="service-header">
            <div>
              <div class="service-title">${serviceName}</div>
              <div class="service-region">${data.region || 'Global'}</div>
            </div>
            <span class="health-badge ${healthStatus.class}">${healthStatus.label}</span>
          </div>

          <div class="metrics-grid">
            <div class="metric">
              <div class="metric-label">Latency</div>
              <div class="metric-value ${latency > 200 ? 'warning' : 'success'}">${latency}ms</div>
            </div>
            <div class="metric">
              <div class="metric-label">Requests</div>
              <div class="metric-value">${this.formatNumber(data.totalRequests || 0)}</div>
            </div>
            <div class="metric">
              <div class="metric-label">Availability</div>
              <div class="metric-value success">${availability.to Fixed(1)
    }%</div >
            </div >
      <div class="metric">
        <div class="metric-label">Error Rate</div>
        <div class="metric-value ${parseFloat(errorRate) > 5 ? 'danger' : 'success'}">${errorRate}%</div>
      </div>
          </div >
        </div >
      `;
    }

    servicesGrid.innerHTML = html;
  }

  async loadServices() {
    await this.loadDashboard(); // Reuse dashboard data
  }

  async loadAnomalies() {
    try {
      const response = await fetch('/api/anomalies');
      const data = await response.json();
      
      // TODO: Display anomalies
      console.log('Anomalies:', data);
    } catch (error) {
      console.error('Failed to load anomalies:', error);
    }
  }

  getHealthStatus(availability) {
    if (availability >= 99) return { class: 'excellent', label: 'Excellent' };
    if (availability >= 95) return { class: 'good', label: 'Good' };
    if (availability >= 90) return { class: 'warning', label: 'Warning' };
    return { class: 'critical', label: 'Critical' };
  }

  formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }

  showError(message) {
    // Simple error toast
    const toast = document.createElement('div');
    toast.className = 'toast error';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  startAutoRefresh() {
    // Refresh every 5 seconds
    this.refreshInterval = setInterval(() => {
      if (this.currentSection === 'dashboard' || this.currentSection === 'services') {
        this.loadDashboard();
      }
    }, 5000);
  }

  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.dashboard = new Dashboard();
});
