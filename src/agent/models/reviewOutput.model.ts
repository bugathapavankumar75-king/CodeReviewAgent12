/**
 * Review Output Contract & Finding Schema
 * Defines the strict structured response contract for review findings and aggregate summaries.
 */

import type { SeverityLevel } from './severity.model';
import type { ReviewCategory } from './category.model';

export interface ReviewFinding {
  finding_id: string;
  id?: string;
  severity: SeverityLevel;
  category: ReviewCategory;
  title: string;
  file: string;
  line: number;
  problem: string;
  evidence: string;
  reason: string;
  why_it_matters?: string;
  recommendation: string;
  rule_id: string;
  confidence: number; // 0.0 - 1.0
  related_previous_reviews: string[];
}

export interface ReviewSummary {
  files_reviewed: number;
  lines_changed: number;
  lines_analyzed?: number;
  findings_count: number;
  total_issues?: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  info_count: number;
}

export interface ReviewResponse {
  review_id: string;
  timestamp: string;
  summary: ReviewSummary;
  findings: ReviewFinding[];
  context_used: string[];
  review_notes: string;
  metadata?: Record<string, unknown>;
}
