export interface DebugInfo {
  component: string;
  action: string;
  data?: any;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
}

export class DebugLogger {
  private static instance: DebugLogger;
  private logs: DebugInfo[] = [];
  private maxLogs = 100;
  private isEnabled = true;

  static getInstance(): DebugLogger {
    if (!DebugLogger.instance) {
      DebugLogger.instance = new DebugLogger();
    }
    return DebugLogger.instance;
  }

  enable(): void {
    this.isEnabled = true;
  }

  disable(): void {
    this.isEnabled = false;
  }

  log(component: string, action: string, data?: any, level: DebugInfo['level'] = 'info'): void {
    if (!this.isEnabled) return;

    const log: DebugInfo = {
      component,
      action,
      data,
      timestamp: new Date().toISOString(),
      level,
    };

    this.logs.unshift(log);
    
    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    const logMessage = `[${component}] ${action}`;
    const logData = data ? { data } : {};

    switch (level) {
      case 'error':
        console.error(logMessage, logData);
        break;
      case 'warn':
        console.warn(logMessage, logData);
        break;
      case 'debug':
        console.debug(logMessage, logData);
        break;
      default:
        console.log(logMessage, logData);
    }
  }

  getLogs(): DebugInfo[] {
    return [...this.logs];
  }

  getLogsByComponent(component: string): DebugInfo[] {
    return this.logs.filter(log => log.component === component);
  }

  getLogsByLevel(level: DebugInfo['level']): DebugInfo[] {
    return this.logs.filter(log => log.level === level);
  }

  clearLogs(): void {
    this.logs = [];
  }

  getLastLog(): DebugInfo | null {
    return this.logs[0] || null;
  }
}

export const debugLogger = DebugLogger.getInstance();
