/**
 * Phase 2 Centralized Mock Data Layer
 * Provides data models and sample entities for:
 * - User Profiles
 * - Repositories
 * - Pull Requests
 * - Dashboard Analytics
 * - Recent Review Activity
 */

export interface MockUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: string;
  team: string;
}

export interface MockRepository {
  id: string;
  name: string;
  description: string;
  language: string;
  defaultBranch: string;
  openPRCount: number;
  totalReviews: number;
  lastUpdated: string;
  status: 'passing' | 'issues_detected' | 'pending';
  criticalIssuesCount: number;
  stars: number;
}

export interface MockPullRequest {
  id: string;
  number: number;
  title: string;
  repoId: string;
  repoName: string;
  author: string;
  authorAvatar?: string;
  sourceBranch: string;
  targetBranch: string;
  status: 'open' | 'merged' | 'closed';
  reviewStatus: 'pending' | 'changes_requested' | 'approved' | 'issues_found';
  issuesCount: number;
  criticalCount: number;
  createdAt: string;
  updatedAt: string;
  diffSummary: {
    filesChanged: number;
    additions: number;
    deletions: number;
  };
}

export interface RecentReviewActivity {
  id: string;
  repoName: string;
  prNumber?: number;
  prTitle?: string;
  file?: string;
  reviewer: string;
  status: 'PASSED' | 'CHANGES_REQUESTED' | 'WARNINGS';
  issuesFound: number;
  criticalIssues: number;
  timestamp: string;
}

export interface DashboardMetrics {
  totalRepositories: number;
  activePullRequests: number;
  totalReviews: number;
  totalIssuesFound: number;
  criticalIssuesOpen: number;
  reviewPassRate: number; // percentage
  avgReviewTimeSeconds: number;
}

export const CURRENT_USER: MockUser = {
  id: 'usr_01',
  name: 'Pavan Kumar',
  email: 'pavan@example.com',
  role: 'Staff Software Engineer',
  team: 'Platform Architecture',
};

export const MOCK_REPOSITORIES: MockRepository[] = [
  {
    id: 'repo-001',
    name: 'task-management-api',
    description: 'Enterprise task workflow, assignment, and auditing REST microservices.',
    language: 'TypeScript',
    defaultBranch: 'main',
    openPRCount: 3,
    totalReviews: 48,
    lastUpdated: '12 minutes ago',
    status: 'issues_detected',
    criticalIssuesCount: 1,
    stars: 24,
  },
  {
    id: 'repo-002',
    name: 'auth-gateway-service',
    description: 'OAuth2 / OpenID Connect token broker and rate-limiting proxy.',
    language: 'Python',
    defaultBranch: 'main',
    openPRCount: 1,
    totalReviews: 32,
    lastUpdated: '2 hours ago',
    status: 'passing',
    criticalIssuesCount: 0,
    stars: 45,
  },
  {
    id: 'repo-003',
    name: 'payment-ledger-engine',
    description: 'Double-entry accounting transaction engine and reconciliation pipeline.',
    language: 'Go',
    defaultBranch: 'main',
    openPRCount: 2,
    totalReviews: 64,
    lastUpdated: 'Yesterday',
    status: 'issues_detected',
    criticalIssuesCount: 2,
    stars: 88,
  },
  {
    id: 'repo-004',
    name: 'analytics-event-consumer',
    description: 'High-throughput Kafka streaming consumer and parquet archival job.',
    language: 'Java',
    defaultBranch: 'master',
    openPRCount: 0,
    totalReviews: 19,
    lastUpdated: '3 days ago',
    status: 'passing',
    criticalIssuesCount: 0,
    stars: 12,
  },
];

export const MOCK_PULL_REQUESTS: MockPullRequest[] = [
  {
    id: 'pr-024',
    number: 24,
    title: 'Add authentication middleware & secure session headers',
    repoId: 'repo-001',
    repoName: 'task-management-api',
    author: 'Pavan Kumar',
    sourceBranch: 'feature/auth-middleware',
    targetBranch: 'main',
    status: 'open',
    reviewStatus: 'issues_found',
    issuesCount: 3,
    criticalCount: 1,
    createdAt: '2026-10-02T08:30:00Z',
    updatedAt: '2026-10-02T10:15:00Z',
    diffSummary: {
      filesChanged: 4,
      additions: 142,
      deletions: 28,
    },
  },
  {
    id: 'pr-025',
    number: 25,
    title: 'Migrate raw SQL queries to parameterized repository statements',
    repoId: 'repo-001',
    repoName: 'task-management-api',
    author: 'Sarah Chen',
    sourceBranch: 'refactor/parameterized-queries',
    targetBranch: 'main',
    status: 'open',
    reviewStatus: 'approved',
    issuesCount: 0,
    criticalCount: 0,
    createdAt: '2026-10-01T14:20:00Z',
    updatedAt: '2026-10-02T09:00:00Z',
    diffSummary: {
      filesChanged: 6,
      additions: 89,
      deletions: 114,
    },
  },
  {
    id: 'pr-088',
    number: 88,
    title: 'Implement token bucket rate limiter with Redis backend',
    repoId: 'repo-002',
    repoName: 'auth-gateway-service',
    author: 'Alex Rivera',
    sourceBranch: 'feature/redis-rate-limit',
    targetBranch: 'main',
    status: 'open',
    reviewStatus: 'pending',
    issuesCount: 0,
    criticalCount: 0,
    createdAt: '2026-10-02T06:00:00Z',
    updatedAt: '2026-10-02T06:45:00Z',
    diffSummary: {
      filesChanged: 3,
      additions: 210,
      deletions: 12,
    },
  },
  {
    id: 'pr-112',
    number: 112,
    title: 'Prevent double-spend race condition during ledger reconciliation',
    repoId: 'repo-003',
    repoName: 'payment-ledger-engine',
    author: 'David Kim',
    sourceBranch: 'fix/concurrency-lock',
    targetBranch: 'main',
    status: 'open',
    reviewStatus: 'changes_requested',
    issuesCount: 2,
    criticalCount: 2,
    createdAt: '2026-09-30T11:00:00Z',
    updatedAt: '2026-10-01T16:30:00Z',
    diffSummary: {
      filesChanged: 2,
      additions: 64,
      deletions: 18,
    },
  },
  {
    id: 'pr-019',
    number: 19,
    title: 'Batch write telemetry spans to ClickHouse',
    repoId: 'repo-004',
    repoName: 'analytics-event-consumer',
    author: 'Elena Rostova',
    sourceBranch: 'perf/batch-telemetry',
    targetBranch: 'master',
    status: 'merged',
    reviewStatus: 'approved',
    issuesCount: 0,
    criticalCount: 0,
    createdAt: '2026-09-28T09:15:00Z',
    updatedAt: '2026-09-29T17:00:00Z',
    diffSummary: {
      filesChanged: 5,
      additions: 185,
      deletions: 92,
    },
  },
];

export const MOCK_RECENT_ACTIVITY: RecentReviewActivity[] = [
  {
    id: 'act-001',
    repoName: 'task-management-api',
    prNumber: 24,
    prTitle: 'Add authentication middleware & secure session headers',
    file: 'src/controllers/user.controller.ts',
    reviewer: 'AI Review Agent',
    status: 'CHANGES_REQUESTED',
    issuesFound: 3,
    criticalIssues: 1,
    timestamp: '15 minutes ago',
  },
  {
    id: 'act-002',
    repoName: 'auth-gateway-service',
    prNumber: 88,
    prTitle: 'Implement token bucket rate limiter with Redis backend',
    file: 'middleware/limiter.py',
    reviewer: 'AI Review Agent',
    status: 'PASSED',
    issuesFound: 0,
    criticalIssues: 0,
    timestamp: '1 hour ago',
  },
  {
    id: 'act-003',
    repoName: 'payment-ledger-engine',
    prNumber: 112,
    prTitle: 'Prevent double-spend race condition during ledger reconciliation',
    file: 'services/reconcile.go',
    reviewer: 'AI Review Agent',
    status: 'CHANGES_REQUESTED',
    issuesFound: 2,
    criticalIssues: 2,
    timestamp: '3 hours ago',
  },
  {
    id: 'act-004',
    repoName: 'task-management-api',
    prNumber: 25,
    prTitle: 'Migrate raw SQL queries to parameterized repository statements',
    file: 'src/models/user.model.ts',
    reviewer: 'AI Review Agent',
    status: 'PASSED',
    issuesFound: 0,
    criticalIssues: 0,
    timestamp: 'Yesterday',
  },
];

export const MOCK_DASHBOARD_METRICS: DashboardMetrics = {
  totalRepositories: 4,
  activePullRequests: 4,
  totalReviews: 163,
  totalIssuesFound: 142,
  criticalIssuesOpen: 3,
  reviewPassRate: 84.6,
  avgReviewTimeSeconds: 1.8,
};
