/**
 * False-Positive Prevention Policies
 * Codifies negative constraints to ensure high-signal, noise-free code reviews.
 */

export interface FalsePositiveRule {
  id: string;
  name: string;
  description: string;
  filterAction: 'SUPPRESS' | 'DOWNGRADE_TO_INFO' | 'DROP';
}

export const FALSE_POSITIVE_POLICIES: FalsePositiveRule[] = [
  {
    id: 'FP-001',
    name: 'Explicit Exception Suppression',
    description: 'Do not flag code that matches an active, documented project exception in review_exceptions.',
    filterAction: 'SUPPRESS',
  },
  {
    id: 'FP-002',
    name: 'Tool-Handled Formatting Suppression',
    description: 'Do not flag indentation, quotes, semicolon, or whitespace formatting if automated tooling (Prettier/ESLint) exists.',
    filterAction: 'SUPPRESS',
  },
  {
    id: 'FP-003',
    name: 'Previously Rejected Precedent Respect',
    description: 'Do not repeatedly raise recommendations that the team explicitly rejected with recorded rationale.',
    filterAction: 'SUPPRESS',
  },
  {
    id: 'FP-004',
    name: 'Unproven Theoretical Defect Prohibition',
    description: 'Do not report theoretical problems without concrete evidence in changed lines or surrounding context.',
    filterAction: 'DROP',
  },
  {
    id: 'FP-005',
    name: 'Low-Confidence Finding Downgrade',
    description: 'Observations with confidence below 0.65 must not be presented as definite defects (must be downgraded to INFO or dropped).',
    filterAction: 'DOWNGRADE_TO_INFO',
  },
  {
    id: 'FP-006',
    name: 'Established Architecture Protection',
    description: 'Do not recommend re-architecting established patterns (e.g. suggesting Redux, TypeDI) unless a concrete flaw is demonstrated.',
    filterAction: 'SUPPRESS',
  },
];
