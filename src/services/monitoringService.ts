import { supabase } from '../lib/supabase';

/**
 * Performance Monitoring Service
 *
 * Tracks application performance metrics, database queries, and distributed tracing.
 * Automatically batches and persists metrics to the database.
 *
 * Features:
 * - Web Vitals monitoring (FCP, LCP, FID, CLS)
 * - Database query performance tracking
 * - Distributed tracing with spans
 * - Automatic metric batching and persistence
 * - Session-based metric grouping
 */

export interface PerformanceMetric {
  id?: string;
  metric_name: string;
  metric_value: number;
  metric_unit: string;
  metadata?: Record<string, any>;
  user_id?: string;
  created_at?: string;
}

export interface PerformanceSnapshot {
  timestamp: number;
  metrics: {
    pageLoadTime: number;
    ttfb: number;
    fcp: number;
    lcp: number;
    fid: number;
    cls: number;
    memoryUsage?: number;
    connectionType?: string;
  };
}

export interface QueryPerformanceMetric {
  query: string;
  duration: number;
  timestamp: number;
  success: boolean;
  rowCount?: number;
}

export interface Span {
  id: string;
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  attributes: Record<string, any>;
  status: 'success' | 'error' | 'pending';
  parentId?: string;
  children: Span[];
}

export interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
}

class MonitoringService {
  private metrics: PerformanceMetric[] = [];
  private queryMetrics: QueryPerformanceMetric[] = [];
  private sessionId: string;
  private isEnabled: boolean = true;
  private activeSpans: Map<string, Span> = new Map();
  private completedTraces: Map<string, Span[]> = new Map();
  private traceId: string = '';

  constructor() {
    this.sessionId = this.generateSessionId();
    this.traceId = this.generateTraceId();
    this.initializePerformanceObserver();
  }

  private generateTraceId(): string {
    return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSpanId(): string {
    return `span_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializePerformanceObserver(): void {
    if (typeof window === 'undefined') return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordWebVitals(entry);
        }
      });

      observer.observe({
        entryTypes: ['navigation', 'resource', 'paint', 'largest-contentful-paint', 'first-input', 'layout-shift']
      });
    } catch (error) {
      console.warn('PerformanceObserver not supported:', error);
    }
  }

  private recordWebVitals(entry: PerformanceEntry): void {
    if (!this.isEnabled) return;

    const metricMap: Record<string, string> = {
      'first-contentful-paint': 'FCP',
      'largest-contentful-paint': 'LCP',
      'first-input': 'FID',
      'layout-shift': 'CLS',
    };

    const metricName = metricMap[entry.entryType];
    if (metricName) {
      this.recordMetric(
        metricName,
        'value' in entry ? (entry as any).value : entry.startTime,
        'ms'
      );
    }
  }

  /**
   * Records a performance metric
   *
   * Metrics are batched and automatically flushed to the database when
   * the batch size reaches 10 items.
   *
   * @param name - The metric name (e.g., 'page_load', 'api_response')
   * @param value - The numeric value of the metric
   * @param unit - The unit of measurement (default: 'ms')
   * @param metadata - Additional context data for the metric
   *
   * @example
   * monitoringService.recordMetric('page_load', 1250, 'ms', { page: '/dashboard' });
   */
  recordMetric(
    name: string,
    value: number,
    unit: string = 'ms',
    metadata?: Record<string, any>
  ): void {
    if (!this.isEnabled) return;

    const metric: PerformanceMetric = {
      metric_name: name,
      metric_value: value,
      metric_unit: unit,
      metadata: {
        ...metadata,
        sessionId: this.sessionId,
        userAgent: navigator.userAgent,
        url: window.location.href,
      },
      created_at: new Date().toISOString(),
    };

    this.metrics.push(metric);

    if (this.metrics.length >= 10) {
      this.flushMetrics();
    }
  }

  async recordQueryPerformance(
    query: string,
    duration: number,
    success: boolean,
    rowCount?: number
  ): Promise<void> {
    const metric: QueryPerformanceMetric = {
      query,
      duration,
      timestamp: Date.now(),
      success,
      rowCount,
    };

    this.queryMetrics.push(metric);

    this.recordMetric('database_query', duration, 'ms', {
      query: query.substring(0, 100),
      success,
      rowCount,
    });
  }

  /**
   * Measures the execution time of an async operation
   *
   * Wraps an async operation, records its execution time, and automatically
   * tracks success/failure status.
   *
   * @param operationName - Descriptive name for the operation
   * @param operation - The async function to measure
   * @returns The result of the operation
   * @throws Re-throws any error from the operation after recording it
   *
   * @example
   * const data = await monitoringService.measureAsync('fetch_documents', async () => {
   *   return await fetchDocuments();
   * });
   */
  async measureAsync<T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    let success = true;
    let error: any = null;

    try {
      const result = await operation();
      return result;
    } catch (err) {
      success = false;
      error = err;
      throw err;
    } finally {
      const duration = performance.now() - startTime;
      this.recordMetric(operationName, duration, 'ms', {
        success,
        error: error?.message,
      });
    }
  }

  /**
   * Measures the execution time of a synchronous operation
   *
   * @param operationName - Descriptive name for the operation
   * @param operation - The sync function to measure
   * @returns The result of the operation
   */
  measureSync<T>(operationName: string, operation: () => T): T {
    const startTime = performance.now();
    let success = true;
    let error: any = null;

    try {
      const result = operation();
      return result;
    } catch (err) {
      success = false;
      error = err;
      throw err;
    } finally {
      const duration = performance.now() - startTime;
      this.recordMetric(operationName, duration, 'ms', {
        success,
        error: error?.message,
      });
    }
  }

  capturePageLoad(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

        if (navigation) {
          this.recordMetric('page_load_time', navigation.loadEventEnd - navigation.fetchStart, 'ms');
          this.recordMetric('ttfb', navigation.responseStart - navigation.requestStart, 'ms');
          this.recordMetric('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.fetchStart, 'ms');
          this.recordMetric('dom_interactive', navigation.domInteractive - navigation.fetchStart, 'ms');
        }

        if ('memory' in performance && (performance as any).memory) {
          const memory = (performance as any).memory;
          this.recordMetric('memory_used', memory.usedJSHeapSize / 1024 / 1024, 'MB');
          this.recordMetric('memory_total', memory.totalJSHeapSize / 1024 / 1024, 'MB');
        }

        if ('connection' in navigator) {
          const connection = (navigator as any).connection;
          this.recordMetric('network_downlink', connection.downlink, 'Mbps', {
            effectiveType: connection.effectiveType,
            rtt: connection.rtt,
          });
        }
      }, 0);
    });
  }

  getMetricsSummary(): {
    totalMetrics: number;
    averages: Record<string, number>;
    medians: Record<string, number>;
    p95: Record<string, number>;
  } {
    const metricsByName: Record<string, number[]> = {};

    this.metrics.forEach((metric) => {
      if (!metricsByName[metric.metric_name]) {
        metricsByName[metric.metric_name] = [];
      }
      metricsByName[metric.metric_name].push(metric.metric_value);
    });

    const averages: Record<string, number> = {};
    const medians: Record<string, number> = {};
    const p95: Record<string, number> = {};

    Object.entries(metricsByName).forEach(([name, values]) => {
      values.sort((a, b) => a - b);

      averages[name] = values.reduce((a, b) => a + b, 0) / values.length;
      medians[name] = values[Math.floor(values.length / 2)];
      p95[name] = values[Math.floor(values.length * 0.95)];
    });

    return {
      totalMetrics: this.metrics.length,
      averages,
      medians,
      p95,
    };
  }

  getQueryMetricsSummary(): {
    totalQueries: number;
    averageDuration: number;
    successRate: number;
    slowestQueries: QueryPerformanceMetric[];
  } {
    if (this.queryMetrics.length === 0) {
      return {
        totalQueries: 0,
        averageDuration: 0,
        successRate: 0,
        slowestQueries: [],
      };
    }

    const totalDuration = this.queryMetrics.reduce((sum, m) => sum + m.duration, 0);
    const successCount = this.queryMetrics.filter((m) => m.success).length;
    const slowest = [...this.queryMetrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    return {
      totalQueries: this.queryMetrics.length,
      averageDuration: totalDuration / this.queryMetrics.length,
      successRate: (successCount / this.queryMetrics.length) * 100,
      slowestQueries: slowest,
    };
  }

  private async flushMetrics(): Promise<void> {
    if (this.metrics.length === 0) return;

    const metricsToSend = [...this.metrics];
    this.metrics = [];

    try {
      const { error } = await supabase
        .from('performance_metrics')
        .insert(metricsToSend);

      if (error) {
        console.error('Failed to flush metrics:', error);
        this.metrics.push(...metricsToSend);
      }
    } catch (error) {
      console.error('Error flushing metrics:', error);
      this.metrics.push(...metricsToSend);
    }
  }

  async forceFlush(): Promise<void> {
    await this.flushMetrics();
  }

  clearMetrics(): void {
    this.metrics = [];
    this.queryMetrics = [];
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  exportMetrics(): string {
    return JSON.stringify({
      sessionId: this.sessionId,
      metrics: this.metrics,
      queryMetrics: this.queryMetrics,
      summary: this.getMetricsSummary(),
      querySummary: this.getQueryMetricsSummary(),
    }, null, 2);
  }

  startSpan(name: string, attributes: Record<string, any> = {}, parentSpanId?: string): string {
    const spanId = this.generateSpanId();
    const span: Span = {
      id: spanId,
      name,
      startTime: performance.now(),
      attributes: {
        ...attributes,
        traceId: this.traceId,
      },
      status: 'pending',
      parentId: parentSpanId,
      children: [],
    };

    this.activeSpans.set(spanId, span);

    if (parentSpanId && this.activeSpans.has(parentSpanId)) {
      const parent = this.activeSpans.get(parentSpanId)!;
      parent.children.push(span);
    }

    return spanId;
  }

  endSpan(spanId: string, status: 'success' | 'error' = 'success', error?: any): void {
    const span = this.activeSpans.get(spanId);
    if (!span) {
      console.warn(`Span ${spanId} not found`);
      return;
    }

    span.endTime = performance.now();
    span.duration = span.endTime - span.startTime;
    span.status = status;

    if (error) {
      span.attributes.error = {
        message: error.message,
        stack: error.stack,
      };
    }

    this.recordMetric(
      `span_${span.name}`,
      span.duration,
      'ms',
      {
        status,
        traceId: this.traceId,
        spanId,
        attributes: span.attributes,
      }
    );

    if (!span.parentId) {
      const traceSpans = this.collectTraceSpans(span);
      this.completedTraces.set(this.traceId, traceSpans);
      this.traceId = this.generateTraceId();
    }

    this.activeSpans.delete(spanId);
  }

  private collectTraceSpans(rootSpan: Span): Span[] {
    const spans: Span[] = [rootSpan];

    const collectChildren = (span: Span) => {
      span.children.forEach((child) => {
        spans.push(child);
        collectChildren(child);
      });
    };

    collectChildren(rootSpan);
    return spans;
  }

  async traceAsync<T>(
    name: string,
    operation: (spanId: string) => Promise<T>,
    attributes: Record<string, any> = {}
  ): Promise<T> {
    const spanId = this.startSpan(name, attributes);

    try {
      const result = await operation(spanId);
      this.endSpan(spanId, 'success');
      return result;
    } catch (error) {
      this.endSpan(spanId, 'error', error);
      throw error;
    }
  }

  traceSync<T>(
    name: string,
    operation: (spanId: string) => T,
    attributes: Record<string, any> = {}
  ): T {
    const spanId = this.startSpan(name, attributes);

    try {
      const result = operation(spanId);
      this.endSpan(spanId, 'success');
      return result;
    } catch (error) {
      this.endSpan(spanId, 'error', error);
      throw error;
    }
  }

  addSpanAttribute(spanId: string, key: string, value: any): void {
    const span = this.activeSpans.get(spanId);
    if (span) {
      span.attributes[key] = value;
    }
  }

  addSpanEvent(spanId: string, name: string, attributes?: Record<string, any>): void {
    const span = this.activeSpans.get(spanId);
    if (span) {
      if (!span.attributes.events) {
        span.attributes.events = [];
      }
      span.attributes.events.push({
        name,
        timestamp: performance.now(),
        attributes,
      });
    }
  }

  getActiveSpans(): Span[] {
    return Array.from(this.activeSpans.values());
  }

  getCompletedTraces(): Map<string, Span[]> {
    return this.completedTraces;
  }

  getTraceTree(traceId: string): Span | null {
    const spans = this.completedTraces.get(traceId);
    if (!spans || spans.length === 0) return null;
    return spans[0];
  }

  clearTraces(): void {
    this.completedTraces.clear();
  }

  exportTrace(traceId: string): string {
    const spans = this.completedTraces.get(traceId);
    if (!spans) return '{}';

    return JSON.stringify({
      traceId,
      spans: spans.map((span) => ({
        id: span.id,
        name: span.name,
        duration: span.duration,
        startTime: span.startTime,
        endTime: span.endTime,
        status: span.status,
        attributes: span.attributes,
        parentId: span.parentId,
      })),
    }, null, 2);
  }

  visualizeTrace(traceId: string): string {
    const rootSpan = this.getTraceTree(traceId);
    if (!rootSpan) return 'Trace not found';

    const lines: string[] = [];

    const visualizeSpan = (span: Span, depth: number) => {
      const indent = '  '.repeat(depth);
      const duration = span.duration?.toFixed(2) || '?';
      const status = span.status === 'success' ? '✓' : span.status === 'error' ? '✗' : '⋯';
      lines.push(`${indent}${status} ${span.name} (${duration}ms)`);

      span.children.forEach((child) => visualizeSpan(child, depth + 1));
    };

    visualizeSpan(rootSpan, 0);
    return lines.join('\n');
  }
}

export const monitoringService = new MonitoringService();

export function withMonitoring<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  operationName: string
): T {
  return (async (...args: any[]) => {
    return await monitoringService.measureAsync(operationName, () => fn(...args));
  }) as T;
}

export function withTracing<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  operationName: string,
  getAttributes?: (...args: any[]) => Record<string, any>
): T {
  return (async (...args: any[]) => {
    const attributes = getAttributes ? getAttributes(...args) : {};
    return await monitoringService.traceAsync(
      operationName,
      () => fn(...args),
      attributes
    );
  }) as T;
}

export { monitoringService as observabilityService };
