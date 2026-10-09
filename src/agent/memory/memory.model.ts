/**
 * Team Memory Model
 * Distinguishes AI Suggestions, Developer Decisions, and Established Team Rules.
 */

export type MemoryKnowledgeType =
  | 'ACCEPTED_FEEDBACK'
  | 'REJECTED_FEEDBACK'
  | 'MODIFIED_FEEDBACK'
  | 'TEAM_DECISION'
  | 'EXCEPTION'
  | 'RECURRING_ISSUE';

export type AuthorityLevel =
  | 'AI_SUGGESTION'       // Transient observation from model; not authoritative
  | 'DEVELOPER_DECISION'  // Human engineer action with recorded rationale
  | 'ESTABLISHED_TEAM_RULE'; // Validated consensus binding future reviews

export interface MemoryRecord {
  memory_id: string;
  type: MemoryKnowledgeType;
  authority_level: AuthorityLevel;
  rule_id: string;
  file_pattern: string;
  content: string;
  developer_id?: string;
  developer_reason?: string;
  review_id?: string;
  finding_id?: string;
  occurrence_count: number;
  is_permanent_rule: boolean;
  timestamp: string;
  last_applied_at?: string;
  metadata?: Record<string, unknown>;
}

export class MemoryModelValidator {
  /**
   * Enforces Rule 9: Never treat an AI suggestion alone as an established team rule.
   */
  static validateAuthority(record: MemoryRecord): boolean {
    if (record.authority_level === 'AI_SUGGESTION' && record.is_permanent_rule) {
      throw new Error(
        'Authority Violation: AI Suggestions alone cannot be promoted to permanent team rules without explicit developer or team consensus.'
      );
    }
    return true;
  }
}
