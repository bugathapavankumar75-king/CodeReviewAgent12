/**
 * Dataset 3: Architecture Rules
 * Explicit layering boundaries: Controller -> Service -> Repository -> Database.
 */

import type { ArchitectureRuleItem } from './knowledge.types';

export const ARCHITECTURE_RULES_DATA: ArchitectureRuleItem[] = [
  {
    id: 'ARCH-001',
    name: 'Strict 3-Tier Layering Inversion',
    type: 'architecture_rules',
    boundary: 'Controller -> Service -> Repository',
    rule: 'Controllers must strictly delegate business logic to Services and must NEVER directly access or import Repositories or Models.',
    rationale:
      'Direct controller-to-repository calls bypass domain validation, auditing, permission checks, and transaction boundaries, making business logic untestable without mock HTTP environments.',
    priority: 95,
    severity: 'HIGH',
    prohibitedImports: ['src/models/*', 'src/repositories/*', 'pg', 'slonik'],
    allowedCallers: ['src/routes/*'],
    allowedCallees: ['src/services/*', 'src/utils/*'],
    source: 'adr/ADR-003-clean-layering.md',
    status: 'active',
    metadata: {
      layerOrder: ['routes', 'controllers', 'services', 'repositories', 'database'],
      strictEnforcement: true,
    },
    createdAt: '2026-01-20T10:00:00Z',
    updatedAt: '2026-08-10T14:00:00Z',
  },
  {
    id: 'ARCH-002',
    name: 'Service Layer Framework Decoupling',
    type: 'architecture_rules',
    boundary: 'Service Framework Boundary',
    rule: 'Services must remain completely framework-agnostic. Services must NEVER import "express", "Request", "Response", or set HTTP headers/cookies.',
    rationale:
      'Domain services must be executable across background cron jobs, CLI commands, WebSocket handlers, and tests without instantiating mock Express objects.',
    priority: 90,
    severity: 'HIGH',
    prohibitedImports: ['express', '@types/express', 'supertest'],
    allowedCallers: ['src/controllers/*', 'src/jobs/*', 'src/workers/*'],
    allowedCallees: ['src/models/*', 'src/repositories/*', 'src/utils/*'],
    source: 'adr/ADR-003-clean-layering.md',
    status: 'active',
    createdAt: '2026-01-20T10:00:00Z',
    updatedAt: '2026-08-10T14:00:00Z',
  },
  {
    id: 'ARCH-003',
    name: 'Standardized Response Envelope',
    type: 'architecture_rules',
    boundary: 'HTTP Presentation Boundary',
    rule: 'All controller responses must be formatted through "ApiResponse.success", "ApiResponse.created", or "ApiResponse.paginated" rather than ad-hoc res.json().',
    rationale:
      'Uniform response envelopes ensure frontend client predictability, standardized pagination contracts, and consistent telemetry tracing.',
    priority: 75,
    severity: 'MEDIUM',
    prohibitedImports: [],
    allowedCallers: ['src/controllers/*'],
    allowedCallees: ['src/utils/apiResponse.ts'],
    source: 'wiki/standards/api-contract.md',
    status: 'active',
    createdAt: '2026-02-15T09:00:00Z',
    updatedAt: '2026-08-01T16:00:00Z',
  },
  {
    id: 'ARCH-004',
    name: 'Repository SQL Encapsulation',
    type: 'architecture_rules',
    boundary: 'Persistence Boundary',
    rule: 'SQL query construction and database driver calls must reside solely inside Repositories. Raw SQL strings must never appear in Services or Controllers.',
    rationale:
      'Isolates database dialect specifics, enables schema migration refactoring, and ensures parameterized queries are enforced in one audited location.',
    priority: 85,
    severity: 'HIGH',
    prohibitedImports: [],
    allowedCallers: ['src/services/*'],
    allowedCallees: ['database connection pool'],
    source: 'adr/ADR-004-repository-pattern.md',
    status: 'active',
    createdAt: '2026-02-20T11:00:00Z',
    updatedAt: '2026-07-15T10:00:00Z',
  },
];
