/**
 * Knowledge Base Schemas & Shared Types
 * Standard contract for the 8 core knowledge datasets.
 */

import type { SeverityLevel } from '../models/severity.model';
import type { ReviewCategory } from '../models/category.model';

export type KnowledgeStatus = 'active' | 'deprecated' | 'under_review' | 'archived';

export interface BaseKnowledgeItem {
  id: string;
  name: string;
  description?: string;
  source: string; // e.g. "team-wiki/architecture", "ADR-004", "security-handbook"
  status: KnowledgeStatus;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectContextItem extends BaseKnowledgeItem {
  type: 'project_context';
  domain: string;
  overview: string;
  businessGoals: string[];
  operationalConstraints: string[];
  keyStakeholders: string[];
}

export interface TechnologyStackItem extends BaseKnowledgeItem {
  type: 'technology_stack';
  layer: 'frontend' | 'backend' | 'database' | 'auth' | 'testing' | 'tooling';
  technology: string;
  version: string;
  purpose: string;
  approvedLibraries: string[];
  bannedLibraries: string[];
}

export interface CodingStandardItem extends BaseKnowledgeItem {
  type: 'coding_standards';
  category: ReviewCategory;
  rule: string;
  rationale: string;
  priority: number; // 1-100 (higher = stricter)
  severity: SeverityLevel;
  goodExample: string;
  badExample: string;
  autoFixable: boolean;
}

export interface ArchitectureRuleItem extends BaseKnowledgeItem {
  type: 'architecture_rules';
  boundary: string; // e.g. "Controller -> Service -> Repository"
  rule: string;
  rationale: string;
  priority: number;
  severity: SeverityLevel;
  prohibitedImports: string[];
  allowedCallers: string[];
  allowedCallees: string[];
}

export interface SecurityRuleItem extends BaseKnowledgeItem {
  type: 'security_rules';
  threatCategory: string; // e.g. "SQL Injection", "IDOR", "JWT Verification"
  rule: string;
  rationale: string;
  priority: number;
  severity: SeverityLevel;
  cwe?: string;
  owaspCategory?: string;
  verificationPattern: string;
}

export interface ProjectPatternItem extends BaseKnowledgeItem {
  type: 'project_patterns';
  patternName: string;
  problemSolved: string;
  solutionTemplate: string;
  referenceFile: string;
  applicability: string;
}

export interface ReviewHistoryItem extends BaseKnowledgeItem {
  type: 'review_history';
  findingId: string;
  ruleId: string;
  filePattern: string;
  developerDecision: 'ACCEPT' | 'REJECT' | 'MODIFY';
  developerReason: string;
  reviewerNotes?: string;
  establishedTeamRule: boolean;
}

export interface ReviewExceptionItem extends BaseKnowledgeItem {
  type: 'review_exceptions';
  ruleId: string;
  scope: string; // glob or path prefix, e.g. "src/db/migrations/*"
  reason: string;
  approvedBy: string;
  expiresAt?: string;
}
