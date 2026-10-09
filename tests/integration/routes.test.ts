/**
 * Integration Tests: Route & Controller Pipeline
 * Simulates complete HTTP lifecycle from request parsing to response serialization.
 */

import { UserController } from '../../src/controllers/user.controller';
import { ProjectController } from '../../src/controllers/project.controller';
import { TaskController } from '../../src/controllers/task.controller';
import { HealthController } from '../../src/controllers/health.controller';
import type { TestResult } from '../unit/services.test';

// Mock Express Request and Response objects for hermetic integration testing
function createMockContext(overrides?: {
  params?: Record<string, string>;
  query?: Record<string, string>;
  body?: unknown;
}) {
  const req = {
    params: overrides?.params || {},
    query: overrides?.query || {},
    body: overrides?.body || {},
    headers: {},
  };

  let capturedStatus = 200;
  let capturedData: any = null;

  const res = {
    status(code: number) {
      capturedStatus = code;
      return this;
    },
    json(payload: unknown) {
      capturedData = payload;
      return this;
    },
    send(payload?: unknown) {
      capturedData = payload;
      return this;
    },
  };

  return {
    req: req as any,
    res: res as any,
    getStatus: () => capturedStatus,
    getData: () => capturedData,
  };
}

export async function runIntegrationTests(): Promise<TestResult[]> {
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

  // Health Controller Integration
  await runTest('Integration: Health API', 'GET /api/v1/health returns 200 with architecture status', async () => {
    const ctx = createMockContext();
    await HealthController.getHealth(ctx.req, ctx.res);

    if (ctx.getStatus() !== 200) throw new Error(`Expected 200, got ${ctx.getStatus()}`);
    const body = ctx.getData();
    if (!body?.data?.architecture?.layers) throw new Error('Architecture layers missing from payload');
  });

  // User Pipeline Integration
  await runTest('Integration: User API', 'GET /api/v1/users returns paginated user collection', async () => {
    const ctx = createMockContext({ query: { limit: '5', page: '1' } });
    await UserController.getUsers(ctx.req, ctx.res);

    if (ctx.getStatus() !== 200) throw new Error(`Expected status 200, got ${ctx.getStatus()}`);
    const body = ctx.getData();
    if (!Array.isArray(body?.data)) throw new Error('Expected array in data payload');
    if (!body?.meta?.total) throw new Error('Missing pagination metadata');
  });

  await runTest('Integration: User API', 'POST /api/v1/users enforces payload schema validation', async () => {
    const ctx = createMockContext({
      body: {
        name: 'T', // Too short (min 2)
        email: 'invalid-email',
      },
    });

    let validationFailed = false;
    try {
      await UserController.createUser(ctx.req, ctx.res);
    } catch (err) {
      validationFailed = true;
    }
    if (!validationFailed) throw new Error('Controller failed to throw validation error on malformed input');
  });

  // Project Pipeline Integration
  await runTest('Integration: Project API', 'GET /api/v1/projects/:id/metrics computes live project status', async () => {
    const ctx = createMockContext({ params: { id: 'prj_2000' } });
    await ProjectController.getProjectMetrics(ctx.req, ctx.res);

    if (ctx.getStatus() !== 200) throw new Error(`Expected status 200, got ${ctx.getStatus()}`);
    const body = ctx.getData();
    if (typeof body?.data?.metrics?.totalTasks !== 'number') {
      throw new Error('Metrics totalTasks calculation missing');
    }
  });

  // Task Pipeline Integration
  await runTest('Integration: Task API', 'PATCH /api/v1/tasks/:id/status updates workflow state', async () => {
    const ctx = createMockContext({
      params: { id: 'tsk_3000' },
      body: { status: 'in_progress' },
    });
    await TaskController.changeStatus(ctx.req, ctx.res);

    if (ctx.getStatus() !== 200) throw new Error(`Expected 200, got ${ctx.getStatus()}`);
    const body = ctx.getData();
    if (body?.data?.status !== 'in_progress') throw new Error('Status was not updated in payload');
  });

  return results;
}
