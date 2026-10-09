/**
 * Dataset 7: Review History
 * Previous review decisions, developer feedback, and established precedents.
 */

import type { ReviewHistoryItem } from './knowledge.types';

export const REVIEW_HISTORY_DATA: ReviewHistoryItem[] = [
  {
    id: 'HIST-001',
    name: 'Loop Optimization vs Array Reduce Precedent',
    type: 'review_history',
    findingId: 'F-HIST-881',
    ruleId: 'STYLE-REDUCE-01',
    filePattern: 'src/utils/benchmark.ts',
    developerDecision: 'REJECT',
    developerReason:
      'V8 engine hot-path optimization: Profiling in PR #142 demonstrated that imperative for-loops are 3.2x faster than Array.prototype.reduce() in sub-millisecond serialization routines. The team decided to retain imperative loops in performance-critical serialization utilities.',
    reviewerNotes: 'Team agreed: Do not flag imperative loops in serialization hot-paths.',
    establishedTeamRule: true,
    source: 'github/pull/142#discussion_r98231',
    status: 'active',
    metadata: {
      prNumber: 142,
      benchmarkUri: 'benchmarks/serialization-report.json',
    },
    createdAt: '2026-03-10T15:20:00Z',
    updatedAt: '2026-03-11T09:00:00Z',
  },
  {
    id: 'HIST-002',
    name: 'Mandatory Validation for User Endpoints',
    type: 'review_history',
    findingId: 'F-HIST-912',
    ruleId: 'SEC-002',
    filePattern: 'src/controllers/user.controller.ts',
    developerDecision: 'ACCEPT',
    developerReason:
      'Agreed with reviewer. Added Validator.validate() call in UserController.createUser() to catch malformed emails before invoking the service layer.',
    reviewerNotes: 'Adopted across all UserController methods.',
    establishedTeamRule: true,
    source: 'github/pull/156#discussion_r10124',
    status: 'active',
    metadata: {
      prNumber: 156,
    },
    createdAt: '2026-04-02T11:00:00Z',
    updatedAt: '2026-04-02T14:30:00Z',
  },
  {
    id: 'HIST-003',
    name: 'Dependency Injection Framework Introduction Rejection',
    type: 'review_history',
    findingId: 'F-HIST-944',
    ruleId: 'ARCH-DI-01',
    filePattern: 'src/services/*.ts',
    developerDecision: 'REJECT',
    developerReason:
      'The architecture board explicitly decided against heavy InversifyJS/TypeDI decorators. We use straightforward module singleton exports (e.g. export const userService = new UserService()) to keep bundle sizes lean and debugging simple.',
    reviewerNotes: 'Do not recommend introducing third-party IoC container libraries.',
    establishedTeamRule: true,
    source: 'github/pull/178#discussion_r11490',
    status: 'active',
    metadata: {
      prNumber: 178,
    },
    createdAt: '2026-05-18T16:00:00Z',
    updatedAt: '2026-05-19T10:00:00Z',
  },
];
