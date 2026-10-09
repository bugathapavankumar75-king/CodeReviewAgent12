/**
 * Agent Phase 1 Test Runner
 * Executes the 12 comprehensive review test cases against the ReviewEngine
 * and validates semantic accuracy, category matching, and suppression logic.
 */

import { ReviewEngine } from '../review/reviewEngine';
import { REVIEW_TEST_CASES, type ReviewTestCase } from './testCases.data';
import type { ReviewResponse } from '../models/reviewOutput.model';

export interface TestCaseExecutionResult {
  testId: string;
  name: string;
  passed: boolean;
  expectedCategory: string;
  actualCategories: string[];
  expectedSeverityRange: string;
  actualSeverities: string[];
  suppressionObserved: boolean;
  durationMs: number;
  response: ReviewResponse;
  failureReason?: string;
}

export interface AgentTestSuiteSummary {
  timestamp: string;
  totalTests: number;
  passedCount: number;
  failedCount: number;
  totalDurationMs: number;
  results: TestCaseExecutionResult[];
}

export class AgentTestRunner {
  static runAll(): AgentTestSuiteSummary {
    const start = performance.now();
    const results: TestCaseExecutionResult[] = [];

    for (const testCase of REVIEW_TEST_CASES) {
      const testStart = performance.now();
      const response = ReviewEngine.evaluate(testCase.input);
      const testDuration = Math.round((performance.now() - testStart) * 100) / 100;

      const actualCategories = response.findings.map((f) => f.category);
      const actualSeverities = response.findings.map((f) => f.severity);

      let passed = true;
      let failureReason: string | undefined;

      // Verification Logic
      if (testCase.expectedCategory === 'NONE') {
        // Expecting zero findings (either clean code, or successfully suppressed by exception/memory)
        if (response.findings.length > 0) {
          passed = false;
          failureReason = `Expected 0 findings (clean/suppressed), but received ${response.findings.length} finding(s): ${response.findings.map((f) => f.title).join(', ')}`;
        }
      } else {
        // Expecting at least one finding matching expectedCategory
        const matchedCategory = response.findings.some((f) => f.category === testCase.expectedCategory);
        if (!matchedCategory) {
          passed = false;
          failureReason = `Expected finding category '${testCase.expectedCategory}', but received categories: [${actualCategories.join(', ')}]`;
        }

        // Verify severity range if specified
        if (Array.isArray(testCase.expectedSeverityRange) && testCase.expectedSeverityRange.length > 0) {
          const matchedSeverity = response.findings.some((f) =>
            (testCase.expectedSeverityRange as string[]).includes(f.severity)
          );
          if (!matchedSeverity) {
            passed = false;
            failureReason = `Expected severity in [${testCase.expectedSeverityRange.join(', ')}], but got [${actualSeverities.join(', ')}]`;
          }
        }
      }

      const suppressionObserved = response.review_notes.includes('filtered') || response.context_used.includes('Exceptions') || response.context_used.includes('Previous Review Decisions');

      results.push({
        testId: testCase.id,
        name: testCase.name,
        passed,
        expectedCategory: testCase.expectedCategory,
        actualCategories,
        expectedSeverityRange: Array.isArray(testCase.expectedSeverityRange)
          ? testCase.expectedSeverityRange.join(' | ')
          : testCase.expectedSeverityRange,
        actualSeverities,
        suppressionObserved,
        durationMs: testDuration,
        response,
        failureReason,
      });
    }

    const totalDurationMs = Math.round((performance.now() - start) * 100) / 100;
    const passedCount = results.filter((r) => r.passed).length;
    const failedCount = results.filter((r) => !r.passed).length;

    return {
      timestamp: new Date().toISOString(),
      totalTests: results.length,
      passedCount,
      failedCount,
      totalDurationMs,
      results,
    };
  }
}
