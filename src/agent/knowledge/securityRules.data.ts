/**
 * Dataset 4: Security Rules
 * Explicit security guidelines, threat models, and verification constraints.
 */

import type { SecurityRuleItem } from './knowledge.types';

export const SECURITY_RULES_DATA: SecurityRuleItem[] = [
  {
    id: 'SEC-001',
    name: 'Mandatory Parameterized SQL Queries',
    type: 'security_rules',
    threatCategory: 'SQL Injection',
    rule: 'All SQL queries must strictly use driver positional parameters ($1, $2) or tagged template literals. String concatenation or template literal interpolation into SQL strings is forbidden.',
    rationale:
      'Direct interpolation of user-supplied variables into SQL syntax exposes the database to arbitrary SQL injection, unauthorized data exfiltration, or table truncation.',
    priority: 100,
    severity: 'CRITICAL',
    cwe: 'CWE-89',
    owaspCategory: 'A03:2021-Injection',
    verificationPattern: '`SELECT .*\\$\\{.*\\}` or query string concatenation',
    source: 'security/handbook/sql-injection-policy.md',
    status: 'active',
    metadata: {
      blocking: true,
      pciDssRelevant: true,
    },
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-08-01T09:00:00Z',
  },
  {
    id: 'SEC-002',
    name: 'Mandatory Request Payload Validation',
    type: 'security_rules',
    threatCategory: 'Improper Input Validation',
    rule: 'Controllers must validate all incoming req.body, req.query, and req.params through schema validation (e.g. Validator.validate) before passing parameters to services.',
    rationale:
      'Unvalidated parameters may cause buffer overflows, type confusion, injection attacks, or logical integrity failures in business workflows.',
    priority: 95,
    severity: 'HIGH',
    cwe: 'CWE-20',
    owaspCategory: 'A04:2021-Insecure Design',
    verificationPattern: 'Controller action consuming req.body without Validator.validate()',
    source: 'security/handbook/input-validation.md',
    status: 'active',
    createdAt: '2026-01-15T09:00:00Z',
    updatedAt: '2026-08-01T09:00:00Z',
  },
  {
    id: 'SEC-003',
    name: 'Tenant Boundary & IDOR Prevention',
    type: 'security_rules',
    threatCategory: 'Insecure Direct Object Reference (IDOR)',
    rule: 'Resource lookup queries by ID must always scope results to the requesting user organization or explicitly verify ownership permissions in the service layer.',
    rationale:
      'Querying records solely by arbitrary primary key ID allows attackers to view or modify resources belonging to other tenants by guessing numerical or UUID values.',
    priority: 98,
    severity: 'CRITICAL',
    cwe: 'CWE-639',
    owaspCategory: 'A01:2021-Broken Access Control',
    verificationPattern: 'Repository query by ID without tenantId or ownerId check',
    source: 'security/handbook/multi-tenancy-isolation.md',
    status: 'active',
    createdAt: '2026-01-15T09:00:00Z',
    updatedAt: '2026-08-01T09:00:00Z',
  },
  {
    id: 'SEC-004',
    name: 'Prohibition of Secret and Credential Logging',
    type: 'security_rules',
    threatCategory: 'Sensitive Data Exposure',
    rule: 'Tokens, passwords, secret keys, Authorization headers, and credit card numbers must NEVER be passed to logger functions or written to persistent files.',
    rationale:
      'Log aggregators and telemetry pipelines are frequently accessible to wider teams; raw credentials in logs compromise production security boundaries.',
    priority: 99,
    severity: 'CRITICAL',
    cwe: 'CWE-532',
    owaspCategory: 'A09:2021-Security Logging and Monitoring Failures',
    verificationPattern: 'logger.*(password|token|secret|authorization|apiKey)',
    source: 'security/handbook/logging-sanitization.md',
    status: 'active',
    createdAt: '2026-01-15T09:00:00Z',
    updatedAt: '2026-08-01T09:00:00Z',
  },
];
