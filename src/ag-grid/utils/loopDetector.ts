export interface LoopDetectionInfo {
  component: string;
  hook: string;
  callCount: number;
  timestamp: number;
  dependencies: any[];
  previousDependencies: any[];
}

export class LoopDetector {
  private static instance: LoopDetector;
  private callCounts: Map<string, number> = new Map();
  private lastDependencies: Map<string, any[]> = new Map();
  private callHistory: LoopDetectionInfo[] = [];
  private maxHistory = 100;
  private threshold = 10; // Alert after 10 calls

  static getInstance(): LoopDetector {
    if (!LoopDetector.instance) {
      LoopDetector.instance = new LoopDetector();
    }
    return LoopDetector.instance;
  }

  trackCall(component: string, hook: string, dependencies: any[] = []): void {
    const key = `${component}:${hook}`;
    const currentCount = this.callCounts.get(key) || 0;
    const newCount = currentCount + 1;
    this.callCounts.set(key, newCount);

    const previousDeps = this.lastDependencies.get(key) || [];
    const timestamp = Date.now();

    const info: LoopDetectionInfo = {
      component,
      hook,
      callCount: newCount,
      timestamp,
      dependencies: [...dependencies],
      previousDependencies: [...previousDeps],
    };

    this.callHistory.unshift(info);
    if (this.callHistory.length > this.maxHistory) {
      this.callHistory = this.callHistory.slice(0, this.maxHistory);
    }

    // Check for potential infinite loop
    if (newCount >= this.threshold) {
      this.reportPotentialLoop(key, info);
    }

    // Check for dependency changes that might cause loops
    if (this.hasDependencyChanged(previousDeps, dependencies)) {
      console.log(`🔄 ${component}:${hook} - Dependencies changed:`, {
        previous: previousDeps,
        current: dependencies,
        callCount: newCount
      });
    }

    this.lastDependencies.set(key, [...dependencies]);
  }

  private hasDependencyChanged(prev: any[], current: any[]): boolean {
    if (prev.length !== current.length) return true;
    
    return prev.some((dep, index) => {
      const currentDep = current[index];
      if (dep !== currentDep) {
        // Check if it's a reference change (object/array)
        if (typeof dep === 'object' && typeof currentDep === 'object') {
          return JSON.stringify(dep) !== JSON.stringify(currentDep);
        }
        return true;
      }
      return false;
    });
  }

  private reportPotentialLoop(key: string, info: LoopDetectionInfo): void {
    console.error(`🚨 INFINITE LOOP DETECTED: ${key}`);
    console.error(`Call count: ${info.callCount}`);
    console.error(`Dependencies:`, info.dependencies);
    console.error(`Previous dependencies:`, info.previousDependencies);
    
    // Show recent call history for this key
    const recentCalls = this.callHistory
      .filter(call => call.component === info.component && call.hook === info.hook)
      .slice(0, 5);
    
    console.error(`Recent calls:`, recentCalls);
  }

  getCallCount(component: string, hook: string): number {
    const key = `${component}:${hook}`;
    return this.callCounts.get(key) || 0;
  }

  getCallHistory(component?: string, hook?: string): LoopDetectionInfo[] {
    if (component && hook) {
      return this.callHistory.filter(call => 
        call.component === component && call.hook === hook
      );
    }
    if (component) {
      return this.callHistory.filter(call => call.component === component);
    }
    return [...this.callHistory];
  }

  reset(): void {
    this.callCounts.clear();
    this.lastDependencies.clear();
    this.callHistory = [];
  }

  getSummary(): { [key: string]: number } {
    const summary: { [key: string]: number } = {};
    this.callCounts.forEach((count, key) => {
      summary[key] = count;
    });
    return summary;
  }
}

export const loopDetector = LoopDetector.getInstance();
