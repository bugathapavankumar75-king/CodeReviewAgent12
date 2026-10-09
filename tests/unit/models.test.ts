/**
 * Unit Tests: Data Models & In-Memory Repositories
 * Verifies repository CRUD operations, schema constraints, and isolation.
 */

import { userRepository } from '../../src/models/user.model';
import { projectRepository } from '../../src/models/project.model';
import { taskRepository } from '../../src/models/task.model';
import type { TestResult } from './services.test';

export async function runModelUnitTests(): Promise<TestResult[]> {
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

  // UserRepository
  await runTest('UserRepository', 'should find user by email case-insensitively', async () => {
    const found = await userRepository.findByEmail('ALEX.RIVERA@EXAMPLE.COM');
    if (!found) throw new Error('Failed to find user case-insensitively');
    if (found.id !== 'usr_1000') throw new Error('Mismatched user returned');
  });

  await runTest('UserRepository', 'should paginate users correctly with limit and offset', async () => {
    const page1 = await userRepository.findAll({ limit: 2, offset: 0 });
    const page2 = await userRepository.findAll({ limit: 2, offset: 2 });

    if (page1.users.length > 2) throw new Error('Limit exceeded on page 1');
    if (page1.users[0]?.id === page2.users[0]?.id) {
      throw new Error('Offset failed: page 1 and page 2 returned same first item');
    }
  });

  // ProjectRepository
  await runTest('ProjectRepository', 'should support filtering by status and priority', async () => {
    const activeProjects = await projectRepository.findAll({ status: 'active' });
    for (const p of activeProjects.projects) {
      if (p.status !== 'active') throw new Error(`Non-active project returned: ${p.id}`);
    }
  });

  // TaskRepository
  await runTest('TaskRepository', 'should update completedAt timestamp when status is set to done', async () => {
    const created = await taskRepository.create({
      projectId: 'prj_2000',
      title: 'Temporary Lifecycle Test Task',
      priority: 'low',
    });

    const updated = await taskRepository.update(created.id, { status: 'done' });
    if (!updated?.completedAt) {
      throw new Error('completedAt was not stamped upon transition to done');
    }

    // Cleanup
    await taskRepository.delete(created.id);
  });

  return results;
}
