/**
 * Structured Architecture Logger
 * Captures events with layer attribution (Route, Controller, Service, Model)
 * and maintains an in-memory buffer for real-time visualization.
 */

export type LayerTag = 'CONFIG' | 'ROUTE' | 'CONTROLLER' | 'SERVICE' | 'MODEL' | 'MIDDLEWARE' | 'TEST';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  layer: LayerTag;
  message: string;
  meta?: any;
}

class ArchitectureLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 200;
  private listeners: Array<(log: LogEntry) => void> = [];

  private createLog(level: LogLevel, layer: LayerTag, message: string, meta?: any): LogEntry {
    const entry: LogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      level,
      layer,
      message,
      meta,
    };

    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    // Console logging with clean formatting
    const prefix = `[${entry.layer}]`;
    if (level === 'error') {
      console.error(prefix, message, meta || '');
    } else if (level === 'warn') {
      console.warn(prefix, message, meta || '');
    } else {
      console.log(prefix, message, meta || '');
    }

    this.notify(entry);
    return entry;
  }

  debug(layer: LayerTag, message: string, meta?: any) {
    return this.createLog('debug', layer, message, meta);
  }

  info(layer: LayerTag, message: string, meta?: any) {
    return this.createLog('info', layer, message, meta);
  }

  warn(layer: LayerTag, message: string, meta?: any) {
    return this.createLog('warn', layer, message, meta);
  }

  error(layer: LayerTag, message: string, meta?: any) {
    return this.createLog('error', layer, message, meta);
  }

  getRecentLogs(limit = 50): LogEntry[] {
    return this.logs.slice(0, limit);
  }

  clearLogs(): void {
    this.logs = [];
  }

  subscribe(listener: (log: LogEntry) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(entry: LogEntry) {
    this.listeners.forEach((listener) => {
      try {
        listener(entry);
      } catch {
        // Ignore subscriber errors
      }
    });
  }
}

export const logger = new ArchitectureLogger();
export default logger;
