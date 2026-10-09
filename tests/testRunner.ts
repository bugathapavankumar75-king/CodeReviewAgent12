/**
 * Test Runner Orchestrator
 * Executes unit and integration test suites, aggregating pass/fail metrics.
 */

import { runServiceUnitTests, type TestResult } from './unit/services.test';
import { runModelUnitTests } from './unit/models.test';
import { runIntegrationTests } from './integration/routes.test';
import { logger } from '../src/utils/logger';

export interface TestSuiteSummary {
  timestamp: string;
  totalTests: number;
  passedCount: number;
  failedCount: number;
  totalDurationMs: number;
  results: TestResult[];
}

export async function runAllTests(): Promise<TestSuiteSummary> {
  const start = performance.now();
  logger.info('TEST', 'Initiating full architecture test suite execution');

  const [serviceResults, modelResults, integrationResults] = await Promise.all([
    runServiceUnitTests(),
    runModelUnitTests(),
    runIntegrationTests(),
  ]);

  const allResults = [...serviceResults, ...modelResults, ...integrationResults];
  const passedCount = allResults.filter((r) => r.passed).length;
  const failedCount = allResults.filter((r) => !r.passed).length;
  const totalDurationMs = Math.round((performance.now() - start) * 100) / 100;

  logger.info(
    'TEST',
    `Test run completed: ${passedCount}/${allResults.length} passed (${totalDurationMs}ms)`
  );

  return {
    timestamp: new Date().toISOString(),
    totalTests: allResults.length,
    passedCount,
    failedCount,
    totalDurationMs,
    results: allResults,
  };
}
