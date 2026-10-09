/**
 * Developer Feedback Action Model
 * Supports: ACCEPT, REJECT, MODIFY, IGNORE, NOT_APPLICABLE, ALREADY_FIXED.
 */

export type FeedbackAction =
  | 'ACCEPT'
  | 'REJECT'
  | 'MODIFY'
  | 'IGNORE'
  | 'NOT_APPLICABLE'
  | 'ALREADY_FIXED';

export interface DeveloperFeedback {
  feedback_id: string;
  developer_id: string;
  review_id: string;
  finding_id: string;
  rule_id: string;
  file: string;
  decision: FeedbackAction;
  reason: string;
  modified_recommendation?: string;
  mark_as_team_decision?: boolean; // If true, promotes decision to permanent team rule
  timestamp: string;
}

export interface FeedbackProcessingResult {
  feedback_id: string;
  action_recorded: boolean;
  promoted_to_memory: boolean;
  memory_id?: string;
  authority_assigned: 'DEVELOPER_DECISION' | 'ESTABLISHED_TEAM_RULE' | 'TRANSIENT_LOG';
  message: string;
}
