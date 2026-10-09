/**
 * Unit Tests: Business Logic Services
 * Validates business rules, constraints, edge cases, and calculations in isolation.
 */

import { userService } from '../../src/services/user.service';
import { projectService } from '../../src/services/project.service';
import { taskService } from '../../src/services/task.service';
import { ApiError } from '../../src/utils/apiError';

export interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  durationMs: number;
  error?: string;
}

export async function runServiceUnitTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  const runTest = async (suite: string, name: string, fn: () => Promise<void>) => {
    const start = performance.now();
    try {
      await fn();
      results.push({
        suite,
        name,
        passed: true,
        durationMs: Math.round((performance.now() - start) * 100) / 100,
      });
    } catch (err: unknown) {
      results.push({
        suite,
        name,
        passed: false,
        durationMs: Math.round((performance.now() - start) * 100) / 100,
        error: (err as Error).message || String(err),
      });
    }
  };

  // UserService tests
  await runTest('UserService', 'should retrieve existing user by ID with correct schema', async () => {
    const user = await userService.getUserById('usr_1000');
    if (!user || user.id !== 'usr_1000') throw new Error('User usr_1000 not found or ID mismatch');
    if (!user.email.includes('@')) throw new Error('Invalid email format on retrieved user');
  });

  await runTest('UserService', 'should reject creating a user with a duplicate email', async () => {
    let threw = false;
    try {
      await userService.createUser({
        name: 'Duplicate Test',
        email: 'alex.rivera@example.com',
      });
    } catch (err) {
      threw = true;
      if (!(err instanceof ApiError) || err.statusCode !== 409) {
        throw new Error(`Expected ApiError 409 Conflict, received ${(err as Error).message}`);
      }
    }
    if (!threw) throw new Error('Expected duplicate user creation to throw Conflict');
  });

  await runTest('UserService', 'should reject non-existent user query with 404', async () => {
    let threw = false;
    try {
      await userService.getUserById('usr_non_existent_9999');
    } catch (err) {
      threw = true;
      if (!(err instanceof ApiError) || err.statusCode !== 404) {
        throw new Error(`Expected 404 Not Found error, received ${(err as Error).message}`);
      }
    }
    if (!threw) throw new Error('Expected query for unknown user to throw 404');
  });

  // ProjectService tests
  await runTest('ProjectService', 'should create project and prevent duplicate project codes', async () => {
    const testCode = `TST-${Math.floor(Math.random() * 9000 + 1000)}`;
    const created = await projectService.createProject({
      name: 'Unit Test Project',
      code: testCode,
      ownerId: 'usr_1000',
      priority: 'high',
      budget: 50000,
    });

    if (created.code !== testCode) throw new Error('Project code mismatch');

    // Attempt duplicate
    let dupFailed = false;
    try {
      await projectService.createProject({
        name: 'Duplicate Project',
        code: testCode,
        ownerId: 'usr_1000',
      });
    } catch (e) {
      dupFailed = true;
      if (!(e instanceof ApiError) || e.statusCode !== 409) {
        throw new Error('Expected 409 Conflict on duplicate project code');
      }
    }
    if (!dupFailed) throw new Error('Duplicate project code was not rejected');
  });

  await runTest('ProjectService', 'should correctly aggregate project completion metrics', async () => {
    const metricsResult = await projectService.getProjectMetrics('prj_2000');
    if (!metricsResult.metrics) throw new Error('Metrics object missing');
    if (typeof metricsResult.metrics.completionRate !== 'number') {
      throw new Error('completionRate must be a numerical percentage');
    }
  });

  // TaskService tests
  await runTest('TaskService', 'should reject task creation with non-existent project ID', async () => {
    let threw = false;
    try {
      await taskService.createTask({
        projectId: 'prj_invalid_project_9999',
        title: 'Orphan Task',
      });
    } catch (err) {
      threw = true;
      if (!(err instanceof ApiError) || err.statusCode !== 400) {
        throw new Error(`Expected 400 Bad Request, got ${(err as Error).message}`);
      }
    }
    if (!threw) throw new Error('Expected task with invalid project ID to throw');
  });

  await runTest('TaskService', 'should transition task status through workflow stages', async () => {
    const task = await taskService.getTaskById('tsk_3000');
    const originalStatus = task.status;

    const updated = await taskService.changeStatus('tsk_3000', 'in_review');
    if (updated.status !== 'in_review') throw new Error('Failed to update status to in_review');

    // Revert back
    await taskService.changeStatus('tsk_3000', originalStatus);
  });

  return results;
}
