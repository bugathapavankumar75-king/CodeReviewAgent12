/**
 * Dataset 1: Project Context
 * Captures project overview, operational constraints, domain boundaries.
 */

import type { ProjectContextItem } from './knowledge.types';

export const PROJECT_CONTEXT_DATA: ProjectContextItem[] = [
  {
    id: 'CTX-001',
    name: 'Task Management Enterprise API',
    type: 'project_context',
    description: 'B2B enterprise project workflow, task assignments, and time-tracking REST API.',
    domain: 'Enterprise Project Management & Audited Collaboration',
    overview:
      'High-throughput multi-tenant SaaS API serving web and mobile clients with fine-grained role-based access control, distributed audit trails, and strict 3-tier decoupling.',
    businessGoals: [
      'Sub-50ms p95 latency for task status queries',
      'Strict multi-tenant organization data isolation',
      'Immutable audit history for all task and assignment transitions',
      'Zero downtime rolling deployments',
    ],
    operationalConstraints: [
      'Stateless Node.js services scaled across container clusters',
      'PostgreSQL connection pooling via PgBouncer (max 20 connections per node)',
      'All writes must participate in transaction rollbacks upon partial failure',
    ],
    keyStakeholders: ['Platform Architecture Board', 'Security & Compliance Guild', 'Core API Team'],
    source: 'wiki/projects/task-management-api/charter.md',
    status: 'active',
    metadata: {
      compliance: ['SOC2-Type-II', 'GDPR'],
      criticality: 'Tier-1-Core-Service',
    },
    createdAt: '2026-01-15T09:00:00Z',
    updatedAt: '2026-09-20T14:30:00Z',
  },
];
