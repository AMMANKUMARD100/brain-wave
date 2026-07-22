export const logger = {
  info: (message: string, metadata?: Record<string, any>) =>
    console.info(JSON.stringify({ level: 'INFO', timestamp: new Date().toISOString(), message, ...(metadata || {}) })),
  error: (message: string, metadata?: Record<string, any>) =>
    console.error(JSON.stringify({ level: 'ERROR', timestamp: new Date().toISOString(), message, ...(metadata || {}) })),
  warn: (message: string, metadata?: Record<string, any>) =>
    console.warn(JSON.stringify({ level: 'WARN', timestamp: new Date().toISOString(), message, ...(metadata || {}) })),
};
