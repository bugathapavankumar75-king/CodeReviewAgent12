/**
 * Knowledge Base Repository
 * Central registry managing the 8 structured datasets for context-aware code reviews.
 */

import { PROJECT_CONTEXT_DATA } from './projectContext.data';
import { TECHNOLOGY_STACK_DATA } from './technologyStack.data';
import { CODING_STANDARDS_DATA } from './codingStandards.data';
import { ARCHITECTURE_RULES_DATA } from './architectureRules.data';
import { SECURITY_RULES_DATA } from './securityRules.data';
import { PROJECT_PATTERNS_DATA } from './projectPatterns.data';
import { REVIEW_HISTORY_DATA } from './reviewHistory.data';
import { REVIEW_EXCEPTIONS_DATA } from './reviewExceptions.data';
import type { BaseKnowledgeItem, ReviewExceptionItem, ReviewHistoryItem } from './knowledge.types';

export class KnowledgeRepository {
  static getProjectContext() {
    return PROJECT_CONTEXT_DATA;
  }

  static getTechnologyStack() {
    return TECHNOLOGY_STACK_DATA;
  }

  static getCodingStandards() {
    return CODING_STANDARDS_DATA;
  }

  static getArchitectureRules() {
    return ARCHITECTURE_RULES_DATA;
  }

  static getSecurityRules() {
    return SECURITY_RULES_DATA;
  }

  static getProjectPatterns() {
    return PROJECT_PATTERNS_DATA;
  }

  static getReviewHistory() {
    return REVIEW_HISTORY_DATA;
  }

  static getReviewExceptions() {
    return REVIEW_EXCEPTIONS_DATA;
  }

  static getAllDatasets(): Record<string, BaseKnowledgeItem[]> {
    return {
      project_context: PROJECT_CONTEXT_DATA,
      technology_stack: TECHNOLOGY_STACK_DATA,
      coding_standards: CODING_STANDARDS_DATA,
      architecture_rules: ARCHITECTURE_RULES_DATA,
      security_rules: SECURITY_RULES_DATA,
      project_patterns: PROJECT_PATTERNS_DATA,
      review_history: REVIEW_HISTORY_DATA,
      review_exceptions: REVIEW_EXCEPTIONS_DATA,
    };
  }

  static findException(ruleId: string, filePath: string): ReviewExceptionItem | null {
    const activeExceptions = REVIEW_EXCEPTIONS_DATA.filter((e) => e.status === 'active' && e.ruleId === ruleId);

    for (const ex of activeExceptions) {
      if (ex.scope.endsWith('/*') || ex.scope.endsWith('/**/*')) {
        const prefix = ex.scope.replace(/\/\*.*$/, '');
        if (filePath.startsWith(prefix)) return ex;
      } else if (ex.scope === filePath) {
        return ex;
      }
    }
    return null;
  }

  static findPreviousRejection(ruleId: string, filePath: string): ReviewHistoryItem | null {
    const rejections = REVIEW_HISTORY_DATA.filter(
      (h) => h.status === 'active' && h.ruleId === ruleId && h.developerDecision === 'REJECT'
    );

    for (const rej of rejections) {
      if (rej.filePattern.endsWith('/*') || rej.filePattern.endsWith('*.ts')) {
        const prefix = rej.filePattern.replace(/\/\*.*$/, '');
        if (filePath.startsWith(prefix) || filePath.includes(prefix)) return rej;
      } else if (rej.filePattern === filePath || filePath.endsWith(rej.filePattern)) {
        return rej;
      }
    }
    return null;
  }
}
