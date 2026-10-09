/**
 * Dataset 8: Review Exceptions
 * Documented exemptions where general rules do not apply in specific scopes.
 */

import type { ReviewExceptionItem } from './knowledge.types';

export const REVIEW_EXCEPTIONS_DATA: ReviewExceptionItem[] = [
  {
    id: 'EX-001',
    name: 'Sequential Migration Script Exemption',
    type: 'review_exceptions',
    ruleId: 'PERF-SYNC-01',
    scope: 'src/db/migrations/*',
    reason: 'Database migration files intentionally execute sequential DDL operations and synchronous lock acquisitions.',
    approvedBy: 'Lead Database Architect (Marcus Vance)',
    source: 'adr/ADR-005-migrations.md',
    status: 'active',
    metadata: {
      scopeType: 'glob',
      appliesToSubdirectories: true,
    },
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-08-01T10:00:00Z',
  },
  {
    id: 'EX-002',
    name: 'Health Check Controller Repository Inspection',
    type: 'review_exceptions',
    ruleId: 'ARCH-001',
    scope: 'src/controllers/health.controller.ts',
    reason: 'HealthController is explicitly authorized by Architecture Guild to inspect repository .count() methods directly to generate lightweight liveness & readiness probes for Kubernetes load balancers without service layer overhead.',
    approvedBy: 'Principal Architect (Alex Rivera)',
    source: 'wiki/architecture/health-probes.md',
    status: 'active',
    metadata: {
      scopeType: 'exact_file',
      exemptionType: 'direct_repo_access',
    },
    createdAt: '2026-02-15T11:00:00Z',
    updatedAt: '2026-08-01T10:00:00Z',
  },
  {
    id: 'EX-003',
    name: 'Test Mock Credentials Exemption',
    type: 'review_exceptions',
    ruleId: 'SEC-004',
    scope: 'tests/**/*',
    reason: 'Automated test fixtures and mock authentication suites contain hardcoded non-production test tokens (e.g. "mock-jwt-token-usr-1000") for test isolation.',
    approvedBy: 'Security Lead (Sarah Chen)',
    source: 'security/handbook/test-fixtures.md',
    status: 'active',
    metadata: {
      scopeType: 'glob',
      environment: 'test_only',
    },
    createdAt: '2026-02-20T14:00:00Z',
    updatedAt: '2026-08-01T10:00:00Z',
  },
];
