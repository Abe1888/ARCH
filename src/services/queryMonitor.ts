import { type SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { monitoringService } from './monitoringService';

/**
 * Database Query Monitor
 *
 * Wraps Supabase client methods to automatically track query performance metrics.
 * This service intercepts database operations and records timing, success rates,
 * and row counts without modifying application behavior.
 *
 * Features:
 * - Transparent query performance tracking
 * - Automatic span creation for distributed tracing
 * - Query statistics aggregation
 * - Zero impact on application logic
 *
 * Implementation:
 * The monitor wraps Supabase client methods using the Proxy pattern, recording
 * metrics before and after each database operation. All original functionality
 * is preserved while gaining observability.
 */

export interface QueryStats {
  query: string;
  table: string;
  operation: string;
  duration: number;
  timestamp: number;
  success: boolean;
  rowCount?: number;
  error?: string;
}

class QueryMonitor {
  private queryLog: QueryStats[] = [];
  private maxLogSize = 1000;
  private isEnabled = true;

  /**
   * Wraps a Supabase client with query monitoring
   *
   * Intercepts all database operations to record performance metrics.
   * This method modifies the client's `from` and `rpc` methods to add
   * monitoring capabilities while preserving all original functionality.
   *
   * The wrapping process:
   * 1. Captures the original method
   * 2. Creates a wrapper that starts a monitoring span
   * 3. Executes the original operation
   * 4. Records timing and result metrics
   * 5. Ends the span and returns the result
   *
   * @param client - The Supabase client to wrap
   * @returns The same client instance with monitoring enabled
   *
   * @example
   * const monitoredClient = queryMonitor.wrapSupabaseClient(supabase);
   * // All queries now automatically tracked
   * const { data } = await monitoredClient.from('documents').select('*');
   */
  wrapSupabaseClient(client: SupabaseClient): SupabaseClient {
    const originalFrom = client.from.bind(client);

    client.from = (table: string) => {
      const builder = originalFrom(table);

      const wrapMethod = (method: string, originalMethod: (...args: any[]) => Promise<any>) => {
        return async (...args: any[]) => {
          const spanId = monitoringService.startSpan(`db.${method}`, {
            table,
            operation: method,
          });

          const startTime = performance.now();
          let success = true;
          let error: string | undefined;
          let rowCount: number | undefined;

          try {
            const result = await originalMethod.apply(builder, args);

            if (result.error) {
              success = false;
              error = result.error.message;
            } else if (result.data) {
              rowCount = Array.isArray(result.data) ? result.data.length : 1;
            }

            const duration = performance.now() - startTime;

            if (this.isEnabled) {
              this.logQuery({
                query: `${method} on ${table}`,
                table,
                operation: method,
                duration,
                timestamp: Date.now(),
                success,
                rowCount,
                error,
              });
            }

            monitoringService.recordQueryPerformance(
              `${table}.${method}`,
              duration,
              success,
              rowCount
            );

            monitoringService.endSpan(spanId, success ? 'success' : 'error');

            return result;
          } catch (err: any) {
            const duration = performance.now() - startTime;
            error = err.message;

            if (this.isEnabled) {
              this.logQuery({
                query: `${method} on ${table}`,
                table,
                operation: method,
                duration,
                timestamp: Date.now(),
                success: false,
                error,
              });
            }

            monitoringService.endSpan(spanId, 'error', err);
            throw err;
          }
        };
      };

      const methods = ['select', 'insert', 'update', 'delete', 'upsert'];
      methods.forEach((method) => {
        const original = (builder as any)[method];
        if (original) {
          (builder as any)[method] = wrapMethod(method, original.bind(builder));
        }
      });

      return builder;
    };

    const originalRpc = client.rpc.bind(client);
    (client as any).rpc = (fn: string, params?: any, options?: any) => {
      const spanId = monitoringService.startSpan('db.rpc', {
        function: fn,
        params,
      });

      const startTime = performance.now();

      const resultBuilder = originalRpc(fn, params, options);

      const originalThen = resultBuilder.then?.bind(resultBuilder);
      if (originalThen) {
        resultBuilder.then = (onFulfilled?: any, onRejected?: any) => {
          return originalThen(
            (result: any) => {
              const duration = performance.now() - startTime;
              const success = !result.error;

              if (this.isEnabled) {
                this.logQuery({
                  query: `RPC: ${fn}`,
                  table: 'rpc',
                  operation: fn,
                  duration,
                  timestamp: Date.now(),
                  success,
                  error: result.error?.message,
                });
              }

              monitoringService.recordQueryPerformance(`rpc.${fn}`, duration, success);
              monitoringService.endSpan(spanId, success ? 'success' : 'error');

              return onFulfilled ? onFulfilled(result) : result;
            },
            (err: any) => {
              const duration = performance.now() - startTime;

              if (this.isEnabled) {
                this.logQuery({
                  query: `RPC: ${fn}`,
                  table: 'rpc',
                  operation: fn,
                  duration,
                  timestamp: Date.now(),
                  success: false,
                  error: err.message,
                });
              }

              monitoringService.endSpan(spanId, 'error', err);
              return onRejected ? onRejected(err) : Promise.reject(err);
            }
          );
        };
      }

      return resultBuilder;
    };

    return client;
  }

  private logQuery(stats: QueryStats): void {
    this.queryLog.push(stats);

    if (this.queryLog.length > this.maxLogSize) {
      this.queryLog.shift();
    }
  }

  getQueryLog(): QueryStats[] {
    return [...this.queryLog];
  }

  getSlowQueries(threshold: number = 1000): QueryStats[] {
    return this.queryLog.filter((q) => q.duration > threshold);
  }

  getFailedQueries(): QueryStats[] {
    return this.queryLog.filter((q) => !q.success);
  }

  getQueryStatsByTable(): Record<string, {
    count: number;
    averageDuration: number;
    successRate: number;
  }> {
    const statsByTable: Record<string, {
      queries: QueryStats[];
    }> = {};

    this.queryLog.forEach((query) => {
      if (!statsByTable[query.table]) {
        statsByTable[query.table] = { queries: [] };
      }
      statsByTable[query.table].queries.push(query);
    });

    const result: Record<string, {
      count: number;
      averageDuration: number;
      successRate: number;
    }> = {};

    Object.entries(statsByTable).forEach(([table, { queries }]) => {
      const totalDuration = queries.reduce((sum, q) => sum + q.duration, 0);
      const successCount = queries.filter((q) => q.success).length;

      result[table] = {
        count: queries.length,
        averageDuration: totalDuration / queries.length,
        successRate: (successCount / queries.length) * 100,
      };
    });

    return result;
  }

  getQueryStatsByOperation(): Record<string, {
    count: number;
    averageDuration: number;
    successRate: number;
  }> {
    const statsByOperation: Record<string, {
      queries: QueryStats[];
    }> = {};

    this.queryLog.forEach((query) => {
      if (!statsByOperation[query.operation]) {
        statsByOperation[query.operation] = { queries: [] };
      }
      statsByOperation[query.operation].queries.push(query);
    });

    const result: Record<string, {
      count: number;
      averageDuration: number;
      successRate: number;
    }> = {};

    Object.entries(statsByOperation).forEach(([operation, { queries }]) => {
      const totalDuration = queries.reduce((sum, q) => sum + q.duration, 0);
      const successCount = queries.filter((q) => q.success).length;

      result[operation] = {
        count: queries.length,
        averageDuration: totalDuration / queries.length,
        successRate: (successCount / queries.length) * 100,
      };
    });

    return result;
  }

  clearLog(): void {
    this.queryLog = [];
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  exportLog(): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      queryLog: this.queryLog,
      slowQueries: this.getSlowQueries(),
      failedQueries: this.getFailedQueries(),
      statsByTable: this.getQueryStatsByTable(),
      statsByOperation: this.getQueryStatsByOperation(),
    }, null, 2);
  }

  generateReport(): string {
    const statsByTable = this.getQueryStatsByTable();
    const statsByOperation = this.getQueryStatsByOperation();
    const slowQueries = this.getSlowQueries();
    const failedQueries = this.getFailedQueries();

    const lines: string[] = [];
    lines.push('Database Query Performance Report');
    lines.push('═'.repeat(50));
    lines.push('');
    lines.push(`Total Queries: ${this.queryLog.length}`);
    lines.push(`Slow Queries (>1s): ${slowQueries.length}`);
    lines.push(`Failed Queries: ${failedQueries.length}`);
    lines.push('');

    lines.push('Performance by Table:');
    lines.push('─'.repeat(50));
    Object.entries(statsByTable).forEach(([table, stats]) => {
      lines.push(`${table}:`);
      lines.push(`  Count: ${stats.count}`);
      lines.push(`  Avg Duration: ${stats.averageDuration.toFixed(2)}ms`);
      lines.push(`  Success Rate: ${stats.successRate.toFixed(2)}%`);
      lines.push('');
    });

    lines.push('Performance by Operation:');
    lines.push('─'.repeat(50));
    Object.entries(statsByOperation).forEach(([operation, stats]) => {
      lines.push(`${operation}:`);
      lines.push(`  Count: ${stats.count}`);
      lines.push(`  Avg Duration: ${stats.averageDuration.toFixed(2)}ms`);
      lines.push(`  Success Rate: ${stats.successRate.toFixed(2)}%`);
      lines.push('');
    });

    if (slowQueries.length > 0) {
      lines.push('Top 5 Slowest Queries:');
      lines.push('─'.repeat(50));
      slowQueries
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 5)
        .forEach((query, i) => {
          lines.push(`${i + 1}. ${query.query}`);
          lines.push(`   Duration: ${query.duration.toFixed(2)}ms`);
          lines.push(`   Table: ${query.table}`);
          lines.push('');
        });
    }

    return lines.join('\n');
  }
}

export const queryMonitor = new QueryMonitor();

export const monitoredSupabase = queryMonitor.wrapSupabaseClient(supabase);
