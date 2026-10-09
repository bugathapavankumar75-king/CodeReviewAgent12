/**
 * Dataset 5: Technology Stack
 * Approved libraries, runtimes, versions, banned packages.
 */

import type { TechnologyStackItem } from './knowledge.types';

export const TECHNOLOGY_STACK_DATA: TechnologyStackItem[] = [
  {
    id: 'TECH-001',
    name: 'Backend Runtime',
    type: 'technology_stack',
    layer: 'backend',
    technology: 'Node.js & Express (TypeScript)',
    version: '22.x LTS (ES2022)',
    purpose: 'Core REST API web server and async event processors.',
    approvedLibraries: ['express', 'zod', 'jsonwebtoken', 'pg', 'pino'],
    bannedLibraries: [
      'axios (prefer native fetch or undici)',
      'lodash (prefer native ES2022 methods)',
      'moment (banned due to bundle bloat; use date-fns or Temporal)',
      'request (deprecated)',
    ],
    source: 'adr/ADR-001-runtime-standardization.md',
    status: 'active',
    metadata: {
      strictMode: true,
      compilerTarget: 'ES2022',
    },
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-08-15T11:00:00Z',
  },
  {
    id: 'TECH-002',
    name: 'Relational Database',
    type: 'technology_stack',
    layer: 'database',
    technology: 'PostgreSQL',
    version: '16.4',
    purpose: 'ACID transactional persistent store with parameterized query drivers.',
    approvedLibraries: ['pg', 'slonik', 'drizzle-orm'],
    bannedLibraries: ['typeorm (banned due to monkey-patching and brittle migrations)'],
    source: 'adr/ADR-002-postgres-engine.md',
    status: 'active',
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-08-15T11:00:00Z',
  },
  {
    id: 'TECH-003',
    name: 'Authentication Layer',
    type: 'technology_stack',
    layer: 'auth',
    technology: 'JWT (RS256 asymmetric with JWKS rotation)',
    version: 'RFC-7519',
    purpose: 'Stateless bearer token authentication with tenant-scoped claims.',
    approvedLibraries: ['jsonwebtoken', 'jose'],
    bannedLibraries: ['session-cookies without sameSite=Strict'],
    source: 'security/handbook/auth-spec.md',
    status: 'active',
    createdAt: '2026-02-01T08:00:00Z',
    updatedAt: '2026-07-10T09:00:00Z',
  },
  {
    id: 'TECH-004',
    name: 'Automated Testing Framework',
    type: 'technology_stack',
    layer: 'testing',
    technology: 'Jest & Supertest',
    version: '29.x',
    purpose: 'Unit, service integration, and HTTP pipeline contract testing.',
    approvedLibraries: ['jest', 'supertest', 'msw'],
    bannedLibraries: ['mocha/chai (deprecated in favor of unified Jest runner)'],
    source: 'engineering/testing-manifesto.md',
    status: 'active',
    createdAt: '2026-01-15T12:00:00Z',
    updatedAt: '2026-09-01T10:00:00Z',
  },
];
