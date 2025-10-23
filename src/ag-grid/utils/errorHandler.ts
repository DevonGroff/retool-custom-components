export interface ErrorInfo {
  message: string;
  type: 'data' | 'grid' | 'selection' | 'rendering' | 'unknown';
  timestamp: string;
  context?: any;
}

export class GridErrorHandler {
  private static instance: GridErrorHandler;
  private errors: ErrorInfo[] = [];
  private maxErrors = 50;

  static getInstance(): GridErrorHandler {
    if (!GridErrorHandler.instance) {
      GridErrorHandler.instance = new GridErrorHandler();
    }
    return GridErrorHandler.instance;
  }

  logError(message: string, type: ErrorInfo['type'], context?: any): void {
    const error: ErrorInfo = {
      message,
      type,
      timestamp: new Date().toISOString(),
      context,
    };

    this.errors.unshift(error);
    
    // Keep only the most recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    console.error(`[AG Grid ${type.toUpperCase()}] ${message}`, context);
  }

  getErrors(): ErrorInfo[] {
    return [...this.errors];
  }

  getErrorsByType(type: ErrorInfo['type']): ErrorInfo[] {
    return this.errors.filter(error => error.type === type);
  }

  clearErrors(): void {
    this.errors = [];
  }

  getLastError(): ErrorInfo | null {
    return this.errors[0] || null;
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  hasErrorType(type: ErrorInfo['type']): boolean {
    return this.errors.some(error => error.type === type);
  }
}

export const errorHandler = GridErrorHandler.getInstance();
