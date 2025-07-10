// Monitoring and Observability Integration
export interface MetricData {
  name: string;
  value: number;
  timestamp: Date;
  tags: Record<string, string>;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  severity: "low" | "medium" | "high" | "critical";
  channels: string[];
}

// Datadog Integration
export class DatadogAgent {
  private apiKey: string;
  private appKey: string;
  private baseUrl = "https://api.datadoghq.com/api/v1";

  constructor() {
    this.apiKey = process.env.DATADOG_API_KEY!;
    this.appKey = process.env.DATADOG_APP_KEY!;
  }

  async sendMetric(metric: MetricData): Promise<void> {
    try {
      const payload = {
        series: [{
          metric: metric.name,
          points: [[Math.floor(metric.timestamp.getTime() / 1000), metric.value]],
          tags: Object.entries(metric.tags).map(([k, v]) => `${k}:${v}`)
        }]
      };

      await fetch(`${this.baseUrl}/series`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'DD-API-KEY': this.apiKey,
          'DD-APPLICATION-KEY': this.appKey
        },
        body: JSON.stringify(payload)
      });

      console.log(`[Datadog] Sent metric: ${metric.name} = ${metric.value}`);
    } catch (error) {
      console.error('[Datadog] Failed to send metric:', error);
    }
  }

  async createAlert(rule: AlertRule): Promise<void> {
    try {
      const payload = {
        name: rule.name,
        message: `Alert: ${rule.name} triggered`,
        query: rule.condition,
        tags: [`severity:${rule.severity}`],
        options: {
          thresholds: {
            critical: rule.threshold
          },
          notify_audit: false,
          require_full_window: false,
          new_host_delay: 300,
          include_tags: true,
          escalation_message: "",
          timeout_h: 0,
          renotify_interval: 0
        }
      };

      await fetch(`${this.baseUrl}/monitor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'DD-API-KEY': this.apiKey,
          'DD-APPLICATION-KEY': this.appKey
        },
        body: JSON.stringify(payload)
      });

      console.log(`[Datadog] Created alert: ${rule.name}`);
    } catch (error) {
      console.error('[Datadog] Failed to create alert:', error);
    }
  }
}

// Prometheus Integration
export class PrometheusAgent {
  private pushgatewayUrl: string;

  constructor() {
    this.pushgatewayUrl = process.env.PROMETHEUS_PUSHGATEWAY_URL || 'http://localhost:9091';
  }

  async pushMetric(metric: MetricData): Promise<void> {
    try {
      const metricText = this.formatMetricForPrometheus(metric);
      
      await fetch(`${this.pushgatewayUrl}/metrics/job/careerate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: metricText
      });

      console.log(`[Prometheus] Pushed metric: ${metric.name}`);
    } catch (error) {
      console.error('[Prometheus] Failed to push metric:', error);
    }
  }

  private formatMetricForPrometheus(metric: MetricData): string {
    const labels = Object.entries(metric.tags)
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
    
    return `${metric.name}{${labels}} ${metric.value} ${metric.timestamp.getTime()}\n`;
  }

  async queryMetrics(query: string): Promise<any> {
    try {
      const prometheusUrl = process.env.PROMETHEUS_URL || 'http://localhost:9090';
      const response = await fetch(`${prometheusUrl}/api/v1/query?query=${encodeURIComponent(query)}`);
      return await response.json();
    } catch (error) {
      console.error('[Prometheus] Failed to query metrics:', error);
      return null;
    }
  }
}

// Grafana Integration
export class GrafanaAgent {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = process.env.GRAFANA_URL || 'http://localhost:3000';
    this.apiKey = process.env.GRAFANA_API_KEY!;
  }

  async createDashboard(dashboardConfig: any): Promise<void> {
    try {
      await fetch(`${this.apiUrl}/api/dashboards/db`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          dashboard: dashboardConfig,
          overwrite: true
        })
      });

      console.log(`[Grafana] Created dashboard: ${dashboardConfig.title}`);
    } catch (error) {
      console.error('[Grafana] Failed to create dashboard:', error);
    }
  }

  async createAlert(alertConfig: any): Promise<void> {
    try {
      await fetch(`${this.apiUrl}/api/alerts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(alertConfig)
      });

      console.log(`[Grafana] Created alert: ${alertConfig.name}`);
    } catch (error) {
      console.error('[Grafana] Failed to create alert:', error);
    }
  }
}

// Unified Observability Service
export class ObservabilityService {
  private datadog: DatadogAgent;
  private prometheus: PrometheusAgent;
  private grafana: GrafanaAgent;

  constructor() {
    this.datadog = new DatadogAgent();
    this.prometheus = new PrometheusAgent();
    this.grafana = new GrafanaAgent();
  }

  async sendMetrics(metrics: MetricData[]): Promise<void> {
    for (const metric of metrics) {
      // Send to all monitoring systems
      await Promise.all([
        this.datadog.sendMetric(metric),
        this.prometheus.pushMetric(metric)
      ]);
    }
  }

  async setupDashboards(): Promise<void> {
    const agentDashboard = {
      title: "Careerate Agent Performance",
      panels: [
        {
          title: "Agent Task Processing Rate",
          type: "graph",
          targets: [
            {
              expr: "rate(agent_tasks_total[5m])",
              legendFormat: "{{agent_type}}"
            }
          ]
        },
        {
          title: "Agent Response Time",
          type: "graph", 
          targets: [
            {
              expr: "histogram_quantile(0.95, agent_response_time_seconds)",
              legendFormat: "95th percentile"
            }
          ]
        }
      ]
    };

    const infrastructureDashboard = {
      title: "Multi-Cloud Infrastructure",
      panels: [
        {
          title: "Cloud Resource Status",
          type: "stat",
          targets: [
            {
              expr: "sum by(provider) (cloud_resources_active)",
              legendFormat: "{{provider}}"
            }
          ]
        },
        {
          title: "Cost by Provider",
          type: "piechart",
          targets: [
            {
              expr: "sum by(provider) (cloud_cost_dollars)",
              legendFormat: "{{provider}}"
            }
          ]
        }
      ]
    };

    await Promise.all([
      this.grafana.createDashboard(agentDashboard),
      this.grafana.createDashboard(infrastructureDashboard)
    ]);
  }

  async setupAlerts(): Promise<void> {
    const alerts: AlertRule[] = [
      {
        id: "agent-failure-rate",
        name: "High Agent Failure Rate",
        condition: "avg(rate(agent_failures_total[5m])) > 0.1",
        threshold: 0.1,
        severity: "high",
        channels: ["slack", "email"]
      },
      {
        id: "infrastructure-down",
        name: "Infrastructure Provider Down",
        condition: "up{job=\"cloud-providers\"} == 0",
        threshold: 0,
        severity: "critical",
        channels: ["pagerduty", "slack"]
      },
      {
        id: "high-cost",
        name: "High Cloud Costs",
        condition: "sum(cloud_cost_dollars) > 1000",
        threshold: 1000,
        severity: "medium",
        channels: ["email"]
      }
    ];

    for (const alert of alerts) {
      await this.datadog.createAlert(alert);
    }
  }

  // Real-time health monitoring
  async getHealthMetrics(): Promise<any> {
    const agentMetrics = await this.prometheus.queryMetrics('up{job="agents"}');
    const infraMetrics = await this.prometheus.queryMetrics('up{job="cloud-providers"}');
    
    return {
      agents: {
        healthy: agentMetrics?.data?.result?.length || 0,
        total: 5,
        responseTime: Math.random() * 50 + 100 // Simulated
      },
      infrastructure: {
        providers: infraMetrics?.data?.result?.length || 0,
        totalCost: Math.random() * 100000 + 50000, // Simulated
        healthScore: Math.random() * 20 + 80 // Simulated
      }
    };
  }
}

export const observabilityService = new ObservabilityService();