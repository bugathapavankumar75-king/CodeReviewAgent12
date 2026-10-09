/**
 * Task Data Model & Repository
 * Encapsulates work items, assignments, state transitions, and relations.
 */

import { logger } from '../utils/logger';

export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assigneeId?: string;
  status: TaskStatus;
  priority: TaskPriority;
  estimateHours: number;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  projectId: string;
  title: string;
  description?: string;
  assigneeId?: string;
  priority?: TaskPriority;
  estimateHours?: number;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  assigneeId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  estimateHours?: number;
}

export interface TaskQueryOptions {
  projectId?: string;
  assigneeId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
  limit?: number;
  offset?: number;
}

class TaskRepository {
  private tasks: Map<string, Task> = new Map();

  constructor() {
    this.seedDefaultTasks();
  }

  private seedDefaultTasks() {
    const seed: Array<{
      projectId: string;
      title: string;
      description: string;
      assigneeId: string;
      status: TaskStatus;
      priority: TaskPriority;
      estimateHours: number;
    }> = [
      {
        projectId: 'prj_2000',
        title: 'Implement Raft state transition log replication',
        description: 'Implement heartbeats and majority quorum checks for log compaction.',
        assigneeId: 'usr_1001',
        status: 'in_progress',
        priority: 'urgent',
        estimateHours: 16,
      },
      {
        projectId: 'prj_2000',
        title: 'Benchmark snapshot serialization latency under 10k RPS',
        description: 'Use flatbuffers to evaluate throughput vs JSON serialization.',
        assigneeId: 'usr_1003',
        status: 'todo',
        priority: 'high',
        estimateHours: 8,
      },
      {
        projectId: 'prj_2001',
        title: 'Construct sliding window aggregation ring buffers',
        description: 'Zero-allocation ring buffers for 1-minute and 5-minute rolling p99 metrics.',
        assigneeId: 'usr_1001',
        status: 'in_review',
        priority: 'high',
        estimateHours: 12,
      },
      {
        projectId: 'prj_2002',
        title: 'Revoke and rotate legacy OAuth2 signing keys',
        description: 'Verify all downstream service tokens validate against the new JWKS endpoint.',
        assigneeId: 'usr_1000',
        status: 'done',
        priority: 'medium',
        estimateHours: 4,
      },
    ];

    seed.forEach((t, i) => {
      const id = `tsk_${3000 + i}`;
      const now = new Date(Date.now() - (5 - i) * 43200000).toISOString();
      this.tasks.set(id, {
        id,
        ...t,
        createdAt: now,
        updatedAt: now,
        completedAt: t.status === 'done' ? now : undefined,
      });
    });
  }

  async findById(id: string): Promise<Task | null> {
    logger.debug('MODEL', `TaskRepository.findById executing for: ${id}`);
    const task = this.tasks.get(id);
    return task ? { ...task } : null;
  }

  async findAll(options: TaskQueryOptions = {}): Promise<{ tasks: Task[]; total: number }> {
    logger.debug('MODEL', 'TaskRepository.findAll querying database', options);
    let results = Array.from(this.tasks.values());

    if (options.projectId) {
      results = results.filter((t) => t.projectId === options.projectId);
    }
    if (options.assigneeId) {
      results = results.filter((t) => t.assigneeId === options.assigneeId);
    }
    if (options.status) {
      results = results.filter((t) => t.status === options.status);
    }
    if (options.priority) {
      results = results.filter((t) => t.priority === options.priority);
    }
    if (options.search) {
      const q = options.search.toLowerCase();
      results = results.filter(
        (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
      );
    }

    const total = results.length;
    const offset = options.offset || 0;
    const limit = options.limit || 50;

    return {
      tasks: results.slice(offset, offset + limit).map((t) => ({ ...t })),
      total,
    };
  }

  async create(input: CreateTaskInput): Promise<Task> {
    logger.debug('MODEL', `TaskRepository.create inserting task: ${input.title}`);
    const id = `tsk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const newTask: Task = {
      id,
      projectId: input.projectId,
      title: input.title.trim(),
      description: input.description?.trim() || '',
      assigneeId: input.assigneeId,
      status: 'todo',
      priority: input.priority || 'medium',
      estimateHours: input.estimateHours || 1,
      createdAt: now,
      updatedAt: now,
    };

    this.tasks.set(id, newTask);
    return { ...newTask };
  }

  async update(id: string, updates: UpdateTaskInput): Promise<Task | null> {
    logger.debug('MODEL', `TaskRepository.update modifying task ID: ${id}`);
    const existing = this.tasks.get(id);
    if (!existing) return null;

    const isMarkingDone = updates.status === 'done' && existing.status !== 'done';
    const now = new Date().toISOString();

    const updated: Task = {
      ...existing,
      ...updates,
      completedAt: isMarkingDone ? now : updates.status && updates.status !== 'done' ? undefined : existing.completedAt,
      updatedAt: now,
    };

    this.tasks.set(id, updated);
    return { ...updated };
  }

  async delete(id: string): Promise<boolean> {
    logger.debug('MODEL', `TaskRepository.delete removing task ID: ${id}`);
    return this.tasks.delete(id);
  }

  async count(): Promise<number> {
    return this.tasks.size;
  }
}

export const taskRepository = new TaskRepository();
