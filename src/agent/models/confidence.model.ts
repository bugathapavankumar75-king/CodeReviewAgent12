/**
 * Confidence Scoring Model
 * Represents how strongly available evidence supports a review finding (0.0 to 1.0).
 */

export interface ConfidenceAssessment {
  score: number; // 0.0 - 1.0
  band: 'HIGH' | 'MEDIUM' | 'LOW';
  evidenceStrength: 'STRONG' | 'MODERATE' | 'WEAK';
  notes?: string;
}

export class ConfidenceUtils {
  static sanitize(score: number): number {
    if (isNaN(score)) return 0.5;
    return Math.max(0.0, Math.min(1.0, Math.round(score * 100) / 100));
  }

  static getBand(score: number): 'HIGH' | 'MEDIUM' | 'LOW' {
    const s = this.sanitize(score);
    if (s >= 0.85) return 'HIGH';
    if (s >= 0.60) return 'MEDIUM';
    return 'LOW';
  }

  static formatPercentage(score: number): string {
    return `${Math.round(this.sanitize(score) * 100)}%`;
  }

  static isActionable(score: number, minThreshold = 0.65): boolean {
    return this.sanitize(score) >= minThreshold;
  }
}
