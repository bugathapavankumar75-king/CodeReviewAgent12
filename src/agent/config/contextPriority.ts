/**
 * Context Priority Hierarchy
 * Defines explicit ordering: Project-specific rules strictly take precedence over generic recommendations.
 */

export type ContextPriorityLevel =
  | 'EXPLICIT_ARCHITECTURE_RULES'
  | 'EXPLICIT_SECURITY_RULES'
  | 'EXPLICIT_TEAM_STANDARDS'
  | 'ESTABLISHED_PROJECT_PATTERNS'
  | 'VALIDATED_TEAM_DECISIONS'
  | 'PREVIOUS_REVIEW_HISTORY'
  | 'GENERIC_BEST_PRACTICES';

export interface PriorityTier {
  id: ContextPriorityLevel;
  rank: number; // Higher overrides lower
  title: string;
  description: string;
  sourceDataset: string;
}

export const CONTEXT_PRIORITY_HIERARCHY: PriorityTier[] = [
  {
    id: 'EXPLICIT_ARCHITECTURE_RULES',
    rank: 100,
    title: 'Explicit Project Architecture Rules',
    description: 'Documented architectural boundaries, 3-tier layering constraints, and package isolation rules.',
    sourceDataset: 'architecture_rules',
  },
  {
    id: 'EXPLICIT_SECURITY_RULES',
    rank: 90,
    title: 'Explicit Security Rules',
    description: 'Project threat models, parameterization mandates, tenant boundaries, and credential safeguards.',
    sourceDataset: 'security_rules',
  },
  {
    id: 'EXPLICIT_TEAM_STANDARDS',
    rank: 80,
    title: 'Explicit Team Standards',
    description: 'Agreed async error handling, ApiError usage, and unhandled promise prohibitions.',
    sourceDataset: 'coding_standards',
  },
  {
    id: 'ESTABLISHED_PROJECT_PATTERNS',
    rank: 70,
    title: 'Established Project Patterns',
    description: 'Canonical implementations in the codebase (e.g. repository singletons, paginated envelopes).',
    sourceDataset: 'project_patterns',
  },
  {
    id: 'VALIDATED_TEAM_DECISIONS',
    rank: 60,
    title: 'Validated Team Decisions',
    description: 'Explicit architectural decision records and documented consensus from team discussions.',
    sourceDataset: 'review_history / ADRs',
  },
  {
    id: 'PREVIOUS_REVIEW_HISTORY',
    rank: 50,
    title: 'Previous Review History',
    description: 'Prior accepted or rejected review feedback on identical or similar code patterns.',
    sourceDataset: 'review_history',
  },
  {
    id: 'GENERIC_BEST_PRACTICES',
    rank: 30,
    title: 'Generic Best Practices',
    description: 'Broad textbook software engineering advice; ALWAYS overridden by project context when conflicting.',
    sourceDataset: 'generic_heuristics',
  },
];

export class ContextPriorityResolver {
  static getRank(level: ContextPriorityLevel): number {
    const tier = CONTEXT_PRIORITY_HIERARCHY.find((t) => t.id === level);
    return tier ? tier.rank : 0;
  }

  static shouldOverride(higherPriority: ContextPriorityLevel, lowerPriority: ContextPriorityLevel): boolean {
    return this.getRank(higherPriority) > this.getRank(lowerPriority);
  }
}
