/**
 * Code Workspace Data Models & State Contracts
 */

import type { ReviewFinding, ReviewResponse, ReviewSummary } from '../../agent/models/reviewOutput.model';
import type { SeverityLevel } from '../../agent/models/severity.model';
import type { ReviewCategory } from '../../agent/models/category.model';

export type SupportedLanguage =
  | 'python'
  | 'javascript'
  | 'typescript'
  | 'java'
  | 'c'
  | 'cpp'
  | 'csharp'
  | 'html'
  | 'css'
  | 'sql'
  | 'go'
  | 'rust'
  | 'php';

export interface WorkspaceFile {
  file_id: string;
  file_name: string;
  file_path: string;
  language: SupportedLanguage;
  content: string; // Current in-memory working code
  savedContent: string; // Last persisted content
  isDirty?: boolean; // content !== savedContent
  created_at: string;
  updated_at: string;
}

export interface WorkspaceProjectConfig {
  projectName: string;
  description: string;
  primaryLanguage: SupportedLanguage;
  framework: string;
  database: string;
  architecture: string;
}

export interface WorkspaceState {
  workspace_id: string;
  project_name: string;
  config: WorkspaceProjectConfig;
  files: WorkspaceFile[];
  active_file_id: string;
  created_at: string;
  updated_at: string;
}

export interface ReviewHistoryEntry {
  review_id: string;
  timestamp: string;
  workspace_id: string;
  scope: 'file' | 'project';
  target_file?: string;
  language: SupportedLanguage;
  files_reviewed: number;
  findings: ReviewFinding[];
  summary: ReviewSummary;
}

export interface ReReviewDiff {
  resolved: ReviewFinding[];
  stillPresent: ReviewFinding[];
  newFindings: ReviewFinding[];
  previousTotal: number;
  currentTotal: number;
}
