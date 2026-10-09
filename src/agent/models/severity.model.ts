/**
 * Severity Levels Specification
 * Standard 5-tier severity classification for review findings based on impact and evidence.
 */

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export interface SeverityDefinition {
  level: SeverityLevel;
  rank: number; // Higher is more severe
  label: string;
  description: string;
  requiresBlockingMerge: boolean;
  color: string;
  badgeStyle: string;
}

export const SEVERITY_LEVELS: Record<SeverityLevel, SeverityDefinition> = {
  CRITICAL: {
    level: 'CRITICAL',
    rank: 5,
    label: 'Critical',
    description: 'Severe security, data-loss, system-integrity, or production-impacting issue.',
    requiresBlockingMerge: true,
    color: '#ef4444',
    badgeStyle: 'bg-rose-950/60 text-rose-400 border border-rose-800',
  },
  HIGH: {
    level: 'HIGH',
    rank: 4,
    label: 'High',
    description: 'Important issue that should normally be addressed before merging.',
    requiresBlockingMerge: true,
    color: '#f97316',
    badgeStyle: 'bg-orange-950/60 text-orange-400 border border-orange-800',
  },
  MEDIUM: {
    level: 'MEDIUM',
    rank: 3,
    label: 'Medium',
    description: 'Meaningful issue that could cause maintainability, reliability, correctness, or architectural problems.',
    requiresBlockingMerge: false,
    color: '#eab308',
    badgeStyle: 'bg-amber-950/60 text-amber-400 border border-amber-800',
  },
  LOW: {
    level: 'LOW',
    rank: 2,
    label: 'Low',
    description: 'Minor issue or improvement.',
    requiresBlockingMerge: false,
    color: '#38bdf8',
    badgeStyle: 'bg-sky-950/60 text-sky-400 border border-sky-800',
  },
  INFO: {
    level: 'INFO',
    rank: 1,
    label: 'Info',
    description: 'Optional suggestion or informational observation.',
    requiresBlockingMerge: false,
    color: '#94a3b8',
    badgeStyle: 'bg-slate-800/60 text-slate-300 border border-slate-700',
  },
};
