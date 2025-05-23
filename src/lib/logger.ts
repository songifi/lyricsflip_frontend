/*
Simple logger utility. Usage:
import { log } from '@/lib/logger';
log.debug('message', data);
*/

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isDebugEnabled = (): boolean => {
  if (typeof window !== 'undefined') {
    // Browser context – check localStorage override first
    const localOverride = window.localStorage.getItem('DEBUG_LOG');
    if (localOverride !== null) return localOverride === 'true';
  }
  return process.env.NODE_ENV !== 'production';
};

class Logger {
  private enabled: boolean;
  constructor() {
    this.enabled = isDebugEnabled();
  }
  private log(level: LogLevel, ...args: any[]) {
    if (level === 'debug' && !this.enabled) return;
    // eslint-disable-next-line no-console
    console[level === 'debug' ? 'log' : level](...args);
  }
  debug = (...args: any[]) => this.log('debug', ...args);
  info = (...args: any[]) => this.log('info', ...args);
  warn = (...args: any[]) => this.log('warn', ...args);
  error = (...args: any[]) => this.log('error', ...args);
}

export const log = new Logger(); 