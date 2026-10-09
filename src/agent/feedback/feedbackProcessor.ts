/**
 * Feedback Processor & Memory Promotion Pipeline
 * Implements Section 11 Memory Update Flow:
 * AI Finding -> Developer Review -> Decision Recorded -> Knowledge Evaluation -> Validated Context
 */

import type { DeveloperFeedback, FeedbackProcessingResult } from './feedback.model';
import { TeamMemoryStore } from '../memory/memoryStore';
import type { MemoryRecord, MemoryKnowledgeType, AuthorityLevel } from '../memory/memory.model';

export class FeedbackProcessor {
  private static feedbackLog: DeveloperFeedback[] = [];

  static recordFeedback(feedback: DeveloperFeedback): FeedbackProcessingResult {
    this.feedbackLog.push({ ...feedback });

    // Step 5: Knowledge / memory evaluation
    // Rule: Do not automatically learn permanent rules from a single rejected or accepted
    // suggestion unless explicitly marked as a team decision or repeated across multiple PRs.
    let shouldPromoteToMemory = false;
    let memoryType: MemoryKnowledgeType = 'ACCEPTED_FEEDBACK';
    let authority: AuthorityLevel = 'DEVELOPER_DECISION';
    const isPermanent = Boolean(feedback.mark_as_team_decision);

    switch (feedback.decision) {
      case 'ACCEPT':
        memoryType = 'ACCEPTED_FEEDBACK';
        shouldPromoteToMemory = isPermanent;
        break;

      case 'REJECT':
        memoryType = 'REJECTED_FEEDBACK';
        // Rejections with substantial reasons or team marking are promoted to memory
        // to prevent nagging the developer repeatedly on the same pattern.
        shouldPromoteToMemory = isPermanent || feedback.reason.trim().length > 15;
        break;

      case 'MODIFY':
        memoryType = 'MODIFIED_FEEDBACK';
        shouldPromoteToMemory = Boolean(feedback.modified_recommendation);
        break;

      case 'NOT_APPLICABLE':
        memoryType = 'EXCEPTION';
        shouldPromoteToMemory = isPermanent;
        break;

      case 'ALREADY_FIXED':
      case 'IGNORE':
      default:
        shouldPromoteToMemory = false;
        break;
    }

    if (isPermanent) {
      authority = 'ESTABLISHED_TEAM_RULE';
    }

    let memoryId: string | undefined;

    if (shouldPromoteToMemory) {
      memoryId = `MEM-${Date.now().toString(36).toUpperCase()}`;
      const record: MemoryRecord = {
        memory_id: memoryId,
        type: memoryType,
        authority_level: authority,
        rule_id: feedback.rule_id,
        file_pattern: feedback.file,
        content: feedback.modified_recommendation || feedback.reason,
        developer_id: feedback.developer_id,
        developer_reason: feedback.reason,
        review_id: feedback.review_id,
        finding_id: feedback.finding_id,
        occurrence_count: 1,
        is_permanent_rule: isPermanent,
        timestamp: feedback.timestamp || new Date().toISOString(),
      };

      TeamMemoryStore.addRecord(record);
    }

    return {
      feedback_id: feedback.feedback_id,
      action_recorded: true,
      promoted_to_memory: shouldPromoteToMemory,
      memory_id: memoryId,
      authority_assigned: authority,
      message: shouldPromoteToMemory
        ? `Feedback recorded and promoted to Team Memory (${authority})`
        : 'Feedback recorded into audit log (not promoted to permanent rule without team validation)',
    };
  }

  static getFeedbackHistory(): DeveloperFeedback[] {
    return [...this.feedbackLog];
  }
}
