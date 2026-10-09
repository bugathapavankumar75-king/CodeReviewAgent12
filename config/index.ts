/**
 * Application Configuration Module
 * Centrally manages environment variables, defaults, and runtime flags.
 */

export interface AppConfig {
  env: 'development' | 'production' | 'test';
  port: number;
  apiPrefix: string;
  corsOrigins: string[];
  pagination: {
    defaultLimit: number;
    maxLimit: number;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    enableTimestamps: boolean;
  };
  features: {
    auditTrail: boolean;
    layerTracing: boolean;
    seedInitialData: boolean;
  };
}

export const config: AppConfig = {
  env: (process.env.NODE_ENV as AppConfig['env']) || 'development',
  port: Number(process.env.PORT) || 3000,
  apiPrefix: '/api/v1',
  corsOrigins: ['*'],
  pagination: {
    defaultLimit: 10,
    maxLimit: 100,
  },
  logging: {
    level: 'debug',
    enableTimestamps: true,
  },
  features: {
    auditTrail: true,
    layerTracing: true,
    seedInitialData: true,
  },
};

export default config;
