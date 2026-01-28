/**
 * Advanced Metrics Collector
 * Tracks comprehensive metrics including latency, errors, packet loss, crashes, and throughput
 */

class AdvancedMetricsCollector {
  constructor() {
    this.metrics = new Map();
    this.errors = [];
    this.anomalies = [];
    this.performanceHistory = [];
    this.maxHistorySize = 1000;
  }

  recordMetric(serviceName, data) {
    const {
      latency,
      statusCode,
      timestamp = Date.now(),
      endpoint = '/api/request',
      method = 'GET',
      packetLoss = 0,
      crashed = false,
      throughput = 1,
      cpuUsage = 0,
      memoryUsage = 0,
      requestSize = 0,
      responseSize = 0,
      cacheHit = false,
      dbQueryTime = 0,
      traceId = null,
      region = null,
      dnsLookupTime = 0,
      tcpConnectionTime = 0,
      tlsHandshakeTime = 0,
      timeToFirstByte = 0,
      retryCount = 0,
      failureType = null
    } = data;

    if (!this.metrics.has(serviceName)) {
      this.metrics.set(serviceName, {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        totalErrors: 0,
        crashes: 0,
        packetLosses: 0,
        timeouts: 0,
        networkErrors: 0,
        latencies: [],
        errors: [],
        statusCodes: {},
        throughputHistory: [],
        cpuHistory: [],
        memoryHistory: [],
        dbQueryTimes: [],
        dnsLookupTimes: [],
        tcpConnectionTimes: [],
        tlsHandshakeTimes: [],
        ttfbTimes: [],
        cacheHitRate: 0,
        lastUpdate: timestamp,
        endpoints: {},
        peakLatency: 0,
        minLatency: Infinity,
        uptime: timestamp,
        region: region,
        traces: [],
        consecutiveFailures: 0,
        maxConsecutiveFailures: 0,
        totalRetries: 0,
        availabilityWindows: []
      });
    }

    const serviceMetrics = this.metrics.get(serviceName);
    const isError = statusCode >= 400 || statusCode === 0;
    const isCritical = statusCode >= 500 || statusCode === 0;

    // Update basic metrics
    serviceMetrics.totalRequests++;
    if (!isError) {
      serviceMetrics.successfulRequests++;
      serviceMetrics.consecutiveFailures = 0;
    } else {
      serviceMetrics.failedRequests++;
      serviceMetrics.consecutiveFailures++;
      if (serviceMetrics.consecutiveFailures > serviceMetrics.maxConsecutiveFailures) {
        serviceMetrics.maxConsecutiveFailures = serviceMetrics.consecutiveFailures;
      }
    }

    // Track availability in 1-minute windows
    serviceMetrics.availabilityWindows.push({
      timestamp,
      success: !isError
    });
    if (serviceMetrics.availabilityWindows.length > 60) {
      serviceMetrics.availabilityWindows.shift();
    }

    // Track retries
    if (retryCount > 0) {
      serviceMetrics.totalRetries += retryCount;
    }

    // Track failure types
    if (failureType === 'timeout') {
      serviceMetrics.timeouts++;
    } else if (failureType === 'network_error' || failureType === 'unknown_error') {
      serviceMetrics.networkErrors++;
    }

    // Track trace IDs
    if (traceId) {
      serviceMetrics.traces.push({
        traceId,
        timestamp,
        statusCode,
        latency,
        endpoint
      });
      if (serviceMetrics.traces.length > 100) {
        serviceMetrics.traces.shift();
      }
    }

    // Track detailed timing metrics
    if (dnsLookupTime > 0) {
      serviceMetrics.dnsLookupTimes.push(dnsLookupTime);
      if (serviceMetrics.dnsLookupTimes.length > 100) {
        serviceMetrics.dnsLookupTimes.shift();
      }
    }

    if (tcpConnectionTime > 0) {
      serviceMetrics.tcpConnectionTimes.push(tcpConnectionTime);
      if (serviceMetrics.tcpConnectionTimes.length > 100) {
        serviceMetrics.tcpConnectionTimes.shift();
      }
    }

    if (tlsHandshakeTime > 0) {
      serviceMetrics.tlsHandshakeTimes.push(tlsHandshakeTime);
      if (serviceMetrics.tlsHandshakeTimes.length > 100) {
        serviceMetrics.tlsHandshakeTimes.shift();
      }
    }

    if (timeToFirstByte > 0) {
      serviceMetrics.ttfbTimes.push(timeToFirstByte);
      if (serviceMetrics.ttfbTimes.length > 100) {
        serviceMetrics.ttfbTimes.shift();
      }
    }

    // Track latency
    serviceMetrics.latencies.push(latency);
    if (latency > serviceMetrics.peakLatency) {
      serviceMetrics.peakLatency = latency;
    }
    if (latency < serviceMetrics.minLatency) {
      serviceMetrics.minLatency = latency;
    }

    // Keep latency history limited
    if (serviceMetrics.latencies.length > this.maxHistorySize) {
      serviceMetrics.latencies.shift();
    }

    // Track status codes
    serviceMetrics.statusCodes[statusCode] = (serviceMetrics.statusCodes[statusCode] || 0) + 1;

    // Track crashes
    if (crashed) {
      serviceMetrics.crashes++;
      this.recordAnomaly(serviceName, 'CRASH', `Service crashed`, timestamp);
    }

    // Detect service crash (consecutive failures)
    if (serviceMetrics.consecutiveFailures >= 5) {
      this.recordAnomaly(serviceName, 'SERVICE_DOWN', `${serviceMetrics.consecutiveFailures} consecutive failures detected`, timestamp);
    }

    // Track packet loss
    if (packetLoss > 0) {
      serviceMetrics.packetLosses++;
      if (packetLoss > 5) {
        this.recordAnomaly(serviceName, 'HIGH_PACKET_LOSS', `Packet loss: ${packetLoss}%`, timestamp);
      }
    }

    // Track errors
    if (isError) {
      serviceMetrics.totalErrors++;
      serviceMetrics.errors.push({
        statusCode,
        timestamp,
        endpoint,
        method,
        latency,
        traceId,
        failureType
      });
      
      if (isCritical) {
        this.recordAnomaly(serviceName, 'CRITICAL_ERROR', `${statusCode} error on ${endpoint}`, timestamp);
      }

      if (serviceMetrics.errors.length > this.maxHistorySize) {
        serviceMetrics.errors.shift();
      }
    }

    // Track throughput
    serviceMetrics.throughputHistory.push({
      timestamp,
      value: throughput
    });
    if (serviceMetrics.throughputHistory.length > 100) {
      serviceMetrics.throughputHistory.shift();
    }

    // Track resource usage
    serviceMetrics.cpuHistory.push({ timestamp, value: cpuUsage });
    serviceMetrics.memoryHistory.push({ timestamp, value: memoryUsage });
    if (serviceMetrics.cpuHistory.length > 100) serviceMetrics.cpuHistory.shift();
    if (serviceMetrics.memoryHistory.length > 100) serviceMetrics.memoryHistory.shift();

    // Track database query times
    if (dbQueryTime > 0) {
      serviceMetrics.dbQueryTimes.push(dbQueryTime);
      if (serviceMetrics.dbQueryTimes.length > 100) {
        serviceMetrics.dbQueryTimes.shift();
      }
      if (dbQueryTime > 1000) {
        this.recordAnomaly(serviceName, 'SLOW_QUERY', `DB query took ${dbQueryTime}ms`, timestamp);
      }
    }

    // Track cache hit rate
    if (cacheHit) {
      serviceMetrics.cacheHitRate = (serviceMetrics.cacheHitRate * (serviceMetrics.totalRequests - 1) + 1) / serviceMetrics.totalRequests;
    }

    // Track endpoint-specific metrics
    if (!serviceMetrics.endpoints[endpoint]) {
      serviceMetrics.endpoints[endpoint] = {
        totalRequests: 0,
        errors: 0,
        latencies: []
      };
    }
    serviceMetrics.endpoints[endpoint].totalRequests++;
    if (isError) serviceMetrics.endpoints[endpoint].errors++;
    serviceMetrics.endpoints[endpoint].latencies.push(latency);

    // Detect anomalies
    this.detectAnomalies(serviceName, latency, statusCode);

    serviceMetrics.lastUpdate = timestamp;
    this.performanceHistory.push({
      serviceName,
      timestamp,
      latency,
      statusCode,
      cpuUsage,
      memoryUsage
    });

    if (this.performanceHistory.length > this.maxHistorySize) {
      this.performanceHistory.shift();
    }
  }

  detectAnomalies(serviceName, latency, statusCode) {
    const serviceMetrics = this.metrics.get(serviceName);
    
    // Detect latency spikes
    if (serviceMetrics.latencies.length > 10) {
      const recentLatencies = serviceMetrics.latencies.slice(-10);
      const avgRecent = recentLatencies.reduce((a, b) => a + b) / recentLatencies.length;
      const avgHistorical = serviceMetrics.latencies.reduce((a, b) => a + b) / serviceMetrics.latencies.length;
      
      if (avgRecent > avgHistorical * 1.5) {
        this.recordAnomaly(serviceName, 'LATENCY_SPIKE', `Latency spiked to ${latency}ms`, Date.now());
      }
    }

    // Detect high error rates
    const errorRate = (serviceMetrics.failedRequests / serviceMetrics.totalRequests) * 100;
    if (errorRate > 30) {
      this.recordAnomaly(serviceName, 'HIGH_ERROR_RATE', `Error rate: ${errorRate.toFixed(2)}%`, Date.now());
    }
  }

  recordAnomaly(serviceName, type, description, timestamp) {
    this.anomalies.push({
      serviceName,
      type,
      description,
      timestamp,
      severity: this.getAnomalySeverity(type)
    });

    if (this.anomalies.length > 500) {
      this.anomalies.shift();
    }
  }

  getAnomalySeverity(type) {
    const severityMap = {
      'CRASH': 'critical',
      'CRITICAL_ERROR': 'critical',
      'HIGH_PACKET_LOSS': 'high',
      'LATENCY_SPIKE': 'high',
      'HIGH_ERROR_RATE': 'high',
      'SLOW_QUERY': 'medium',
      'MEMORY_WARNING': 'medium'
    };
    return severityMap[type] || 'low';
  }

  getAggregatedMetrics() {
    const aggregated = {};

    for (const [serviceName, metrics] of this.metrics.entries()) {
      const avgLatency = metrics.latencies.length > 0 
        ? Math.round(metrics.latencies.reduce((a, b) => a + b) / metrics.latencies.length)
        : 0;

      const errorRate = metrics.totalRequests > 0
        ? ((metrics.failedRequests / metrics.totalRequests) * 100).toFixed(2)
        : 0;

      const packetLossRate = metrics.totalRequests > 0
        ? ((metrics.packetLosses / metrics.totalRequests) * 100).toFixed(2)
        : 0;

      const avgCpuUsage = metrics.cpuHistory.length > 0
        ? (metrics.cpuHistory.reduce((a, b) => a + b.value, 0) / metrics.cpuHistory.length).toFixed(2)
        : 0;

      const avgMemoryUsage = metrics.memoryHistory.length > 0
        ? (metrics.memoryHistory.reduce((a, b) => a + b.value, 0) / metrics.memoryHistory.length).toFixed(2)
        : 0;

      const p95Latency = this.calculatePercentile(metrics.latencies, 95);
      const p99Latency = this.calculatePercentile(metrics.latencies, 99);

      // Calculate availability %
      const availability = metrics.totalRequests > 0
        ? ((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(2)
        : 100;

      // Calculate average timing metrics
      const avgDnsLookup = this.calculateAverage(metrics.dnsLookupTimes);
      const avgTcpConnection = this.calculateAverage(metrics.tcpConnectionTimes);
      const avgTlsHandshake = this.calculateAverage(metrics.tlsHandshakeTimes);
      const avgTTFB = this.calculateAverage(metrics.ttfbTimes);

      aggregated[serviceName] = {
        totalRequests: metrics.totalRequests,
        successfulRequests: metrics.successfulRequests,
        failedRequests: metrics.failedRequests,
        errorRate: parseFloat(errorRate),
        crashes: metrics.crashes,
        packetLossRate: parseFloat(packetLossRate),
        avgLatency,
        peakLatency: metrics.peakLatency,
        minLatency: metrics.minLatency === Infinity ? 0 : metrics.minLatency,
        p95Latency,
        p99Latency,
        cpuUsage: parseFloat(avgCpuUsage),
        memoryUsage: parseFloat(avgMemoryUsage),
        cacheHitRate: (parseFloat(metrics.cacheHitRate) * 100).toFixed(2),
        throughput: metrics.throughputHistory.length > 0 
          ? metrics.throughputHistory[metrics.throughputHistory.length - 1].value
          : 0,
        lastUpdate: metrics.lastUpdate,
        uptime: Date.now() - metrics.uptime,
        endpoints: metrics.endpoints,
        statusCodes: metrics.statusCodes,
        recentErrors: metrics.errors.slice(-10),
        healthScore: this.calculateHealthScore(metrics),
        region: metrics.region,
        availability: parseFloat(availability),
        timeouts: metrics.timeouts || 0,
        networkErrors: metrics.networkErrors || 0,
        totalRetries: metrics.totalRetries || 0,
        consecutiveFailures: metrics.consecutiveFailures || 0,
        maxConsecutiveFailures: metrics.maxConsecutiveFailures || 0,
        avgDnsLookupTime: avgDnsLookup,
        avgTcpConnectionTime: avgTcpConnection,
        avgTlsHandshakeTime: avgTlsHandshake,
        avgTimeToFirstByte: avgTTFB,
        recentTraces: metrics.traces.slice(-5)
      };
    }

    return aggregated;
  }

  calculateAverage(values) {
    if (!values || values.length === 0) return 0;
    const sum = values.reduce((a, b) => a + b, 0);
    return Math.round(sum / values.length);
  }

  calculatePercentile(values, percentile) {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  calculateHealthScore(metrics) {
    let score = 100;

    // Deduct for errors
    const errorRate = metrics.totalRequests > 0 
      ? (metrics.failedRequests / metrics.totalRequests) * 100 
      : 0;
    score -= Math.min(30, errorRate);

    // Deduct for crashes
    score -= Math.min(20, metrics.crashes * 5);

    // Deduct for packet loss
    const packetLossRate = metrics.totalRequests > 0
      ? (metrics.packetLosses / metrics.totalRequests) * 100
      : 0;
    score -= Math.min(20, packetLossRate * 2);

    // Deduct for high latency
    const avgLatency = metrics.latencies.length > 0
      ? metrics.latencies.reduce((a, b) => a + b) / metrics.latencies.length
      : 0;
    if (avgLatency > 500) {
      score -= Math.min(20, (avgLatency - 500) / 50);
    }

    return Math.max(0, Math.round(score));
  }

  getAnomalies(serviceName = null, limit = 50) {
    const filtered = serviceName
      ? this.anomalies.filter(a => a.serviceName === serviceName)
      : this.anomalies;

    return filtered.slice(-limit).reverse();
  }

  getPerformanceHistory(serviceName = null) {
    const filtered = serviceName
      ? this.performanceHistory.filter(p => p.serviceName === serviceName)
      : this.performanceHistory;

    return filtered;
  }

  reset() {
    this.metrics.clear();
    this.errors = [];
    this.anomalies = [];
    this.performanceHistory = [];
  }

  getSystemStats() {
    const allMetrics = Array.from(this.metrics.values());

    if (allMetrics.length === 0) {
      return {
        totalServices: 0,
        totalRequests: 0,
        averageErrorRate: 0,
        totalCrashes: 0,
        averageLatency: 0,
        highestHealthScore: 0,
        lowestHealthScore: 100
      };
    }

    const totalRequests = allMetrics.reduce((sum, m) => sum + m.totalRequests, 0);
    const totalErrors = allMetrics.reduce((sum, m) => sum + m.failedRequests, 0);
    const totalCrashes = allMetrics.reduce((sum, m) => sum + m.crashes, 0);
    const allLatencies = allMetrics.flatMap(m => m.latencies);
    const avgLatency = allLatencies.length > 0
      ? Math.round(allLatencies.reduce((a, b) => a + b) / allLatencies.length)
      : 0;

    const healthScores = allMetrics.map(m => this.calculateHealthScore(m));

    return {
      totalServices: allMetrics.length,
      totalRequests,
      averageErrorRate: totalRequests > 0 ? ((totalErrors / totalRequests) * 100).toFixed(2) : 0,
      totalCrashes,
      averageLatency: avgLatency,
      highestHealthScore: Math.max(...healthScores),
      lowestHealthScore: Math.min(...healthScores),
      anomaliesCount: this.anomalies.length
    };
  }
}

module.exports = new AdvancedMetricsCollector();
