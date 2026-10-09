/**
 * Review Input Model
 * Encapsulates code diffs, surrounding context, project knowledge, and historical decisions.
 * Extensible for future Git providers, AST analyzers, and semantic indexers.
 */

export interface CodeChangeLine {
  lineNumber: number;
  type: 'added' | 'modified' | 'deleted' | 'context';
  content: string;
}

export interface ChangedFile {
  path: string;
  previousPath?: string;
  isNew: boolean;
  isDeleted: boolean;
  diff: string;
  addedLines: CodeChangeLine[];
  modifiedLines: CodeChangeLine[];
  deletedLines: CodeChangeLine[];
  surroundingContext?: string;
  language: string;
}

export interface CodeInputs {
  repositoryId?: string;
  branch?: string;
  baseBranch?: string;
  commitSha?: string;
  projectStructure: string[];
  changedFiles: ChangedFile[];
  relatedTests?: Array<{
    testFilePath: string;
    targetFilePath: string;
    testContent?: string;
  }>;
  surroundingCodeSnippets?: Array<{
    filePath: string;
    startLine: number;
    endLine: number;
    snippet: string;
  }>;
}

export interface ProjectKnowledgeReference {
  projectDescription?: string;
  technologyStackIds?: string[];
  codingStandardIds?: string[];
  architectureRuleIds?: string[];
  securityRuleIds?: string[];
  projectPatternIds?: string[];
  knownExceptionIds?: string[];
  customConventions?: Record<string, string>;
}

export interface HistoricalKnowledgeReference {
  previousReviewIds?: string[];
  acceptedReviewFindingIds?: string[];
  rejectedReviewFindingIds?: string[];
  modifiedReviewFindingIds?: string[];
  developerExplanations?: Array<{
    findingId: string;
    explanation: string;
    author: string;
    timestamp: string;
  }>;
  architecturalDecisionRecords?: Array<{
    adrId: string;
    title: string;
    status: 'accepted' | 'deprecated' | 'superseded';
    decision: string;
  }>;
  recurringIssueSignatures?: string[];
}

export interface ReviewInput {
  reviewId: string;
  timestamp: string;
  author?: {
    id: string;
    username: string;
    role?: string;
  };
  code: CodeInputs;
  projectKnowledge?: ProjectKnowledgeReference;
  historicalKnowledge?: HistoricalKnowledgeReference;
  options?: {
    strictArchitecture?: boolean;
    minimumConfidenceThreshold?: number; // default 0.65
    suppressFormattingIssues?: boolean;  // default true
    respectExceptions?: boolean;         // default true
    customRules?: string[];
  };
  metadata?: Record<string, unknown>; // Extensible property bag
}
