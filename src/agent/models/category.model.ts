/**
 * Review Categories Definition & Metadata
 * Defines the extensible domain categories for code review findings.
 */

export type ReviewCategory =
  | 'CORRECTNESS'
  | 'SECURITY'
  | 'ARCHITECTURE'
  | 'PERFORMANCE'
  | 'RELIABILITY'
  | 'MAINTAINABILITY'
  | 'CODE_QUALITY'
  | 'TESTING'
  | 'API_DESIGN'
  | 'DATABASE'
  | 'CODING_STANDARDS'
  | 'DOCUMENTATION'
  | string; // Extensible for custom organizational categories

export interface CategoryDefinition {
  id: string;
  name: string;
  description: string;
  defaultSeverity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  icon: string;
}

export const REVIEW_CATEGORIES: Record<string, CategoryDefinition> = {
  CORRECTNESS: {
    id: 'CORRECTNESS',
    name: 'Correctness',
    description: 'Logic flaws, off-by-one errors, null/undefined safety, unmet requirements, and algorithmic defects.',
    defaultSeverity: 'HIGH',
    icon: 'CheckCircle2',
  },
  SECURITY: {
    id: 'SECURITY',
    name: 'Security',
    description: 'Injection risks, broken authentication, insecure direct object references, secret leakage, and unauthorized access.',
    defaultSeverity: 'CRITICAL',
    icon: 'ShieldAlert',
  },
  ARCHITECTURE: {
    id: 'ARCHITECTURE',
    name: 'Architecture',
    description: 'Violations of 3-tier/hexagonal boundaries, circular dependencies, layering bypasses, and framework leaks.',
    defaultSeverity: 'HIGH',
    icon: 'Layers',
  },
  PERFORMANCE: {
    id: 'PERFORMANCE',
    name: 'Performance',
    description: 'N+1 query cascades, unindexed queries, synchronous I/O on event loop, memory leaks, and excessive allocations.',
    defaultSeverity: 'MEDIUM',
    icon: 'Zap',
  },
  RELIABILITY: {
    id: 'RELIABILITY',
    name: 'Reliability',
    description: 'Unhandled promise rejections, missing circuit breakers, race conditions, and improper error propagation.',
    defaultSeverity: 'HIGH',
    icon: 'AlertTriangle',
  },
  MAINTAINABILITY: {
    id: 'MAINTAINABILITY',
    name: 'Maintainability',
    description: 'Tight coupling, high cyclomatic complexity, dead code, rigid coupling, and excessive function length.',
    defaultSeverity: 'MEDIUM',
    icon: 'Tool',
  },
  CODE_QUALITY: {
    id: 'CODE_QUALITY',
    name: 'Code Quality',
    description: 'Code smells, inconsistent idiomatic patterns, confusing naming, and anti-patterns.',
    defaultSeverity: 'LOW',
    icon: 'Code',
  },
  TESTING: {
    id: 'TESTING',
    name: 'Testing',
    description: 'Untested edge cases, missing test files, brittle assertions, and inadequate coverage of changed logic.',
    defaultSeverity: 'MEDIUM',
    icon: 'Beaker',
  },
  API_DESIGN: {
    id: 'API_DESIGN',
    name: 'API Design',
    description: 'Inconsistent REST contracts, breaking API changes, non-standard HTTP status codes, and leaky responses.',
    defaultSeverity: 'MEDIUM',
    icon: 'Send',
  },
  DATABASE: {
    id: 'DATABASE',
    name: 'Database',
    description: 'Missing transactions, dangerous schema migrations, non-idempotent operations, and unoptimized schema design.',
    defaultSeverity: 'HIGH',
    icon: 'Database',
  },
  CODING_STANDARDS: {
    id: 'CODING_STANDARDS',
    name: 'Coding Standards',
    description: 'Violations of explicit team conventions, file naming rules, and directory structures.',
    defaultSeverity: 'LOW',
    icon: 'Bookmark',
  },
  DOCUMENTATION: {
    id: 'DOCUMENTATION',
    name: 'Documentation',
    description: 'Outdated inline JSDoc, missing API schemas, undocumented configuration parameters, and missing architectural context.',
    defaultSeverity: 'INFO',
    icon: 'FileText',
  },
};
