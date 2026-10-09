/**
 * Project Data Model & Repository
 * Encapsulates project entities, lifecycle states, and queries.
 */

import { logger } from '../utils/logger';

export type ProjectStatus = 'planning' | 'active' | 'completed' | 'archived';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Project {
  id: string;
  name: string;
  code: string;
  description: string;
  ownerId: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  budget: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  name: string;
  code: string;
  description?: string;
  ownerId: string;
  priority?: ProjectPriority;
  budget?: number;
  tags?: string[];
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  budget?: number;
  tags?: string[];
}

export interface ProjectQueryOptions {
  status?: ProjectStatus;
  priority?: ProjectPriority;
  ownerId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

class ProjectRepository {
  private projects: Map<string, Project> = new Map();

  constructor() {
    this.seedDefaultProjects();
  }

  private seedDefaultProjects() {
    const defaultData: CreateProjectInput[] = [
      {
        name: 'Distributed Ledger Sync Engine',
        code: 'PROJ-LGR',
        description: 'Fault-tolerant consensus and state sync pipeline for distributed clusters.',
        ownerId: 'usr_1000',
        priority: 'critical',
        budget: 145000,
        tags: ['infrastructure', 'distributed-systems', 'grpc'],
      },
      {
        name: 'Telemetry Processing Pipeline',
        code: 'PROJ-TLM',
        description: 'Sub-millisecond metric ingestion pipeline with windowed aggregation.',
        ownerId: 'usr_1001',
        priority: 'high',
        budget: 92000,
        tags: ['telemetry', 'kafka', 'timeseries'],
      },
      {
        name: 'Identity & Access Gateway',
        code: 'PROJ-IAM',
        description: 'Zero-trust edge authorization gateway with fine-grained RBAC.',
        ownerId: 'usr_1002',
        priority: 'medium',
        budget: 68000,
        tags: ['security', 'auth', 'oauth'],
      },
    ];

    defaultData.forEach((input, idx) => {
      const id = `prj_${2000 + idx}`;
      const now = new Date(Date.now() - (6 - idx * 2) * 86400000).toISOString();
      this.projects.set(id, {
        id,
        name: input.name,
        code: input.code,
        description: input.description || '',
        ownerId: input.ownerId,
        status: idx === 2 ? 'completed' : 'active',
        priority: input.priority || 'medium',
        budget: input.budget || 0,
        tags: input.tags || [],
        createdAt: now,
        updatedAt: now,
      });
    });
  }

  async findById(id: string): Promise<Project | null> {
    logger.debug('MODEL', `ProjectRepository.findById executing for: ${id}`);
    const proj = this.projects.get(id);
    return proj ? { ...proj } : null;
  }

  async findByCode(code: string): Promise<Project | null> {
    logger.debug('MODEL', `ProjectRepository.findByCode executing for: ${code}`);
    const normalized = code.toUpperCase().trim();
    for (const proj of this.projects.values()) {
      if (proj.code.toUpperCase() === normalized) {
        return { ...proj };
      }
    }
    return null;
  }

  async findAll(options: ProjectQueryOptions = {}): Promise<{ projects: Project[]; total: number }> {
    logger.debug('MODEL', 'ProjectRepository.findAll querying database', options);
    let results = Array.from(this.projects.values());

    if (options.status) {
      results = results.filter((p) => p.status === options.status);
    }
    if (options.priority) {
      results = results.filter((p) => p.priority === options.priority);
    }
    if (options.ownerId) {
      results = results.filter((p) => p.ownerId === options.ownerId);
    }
    if (options.search) {
      const q = options.search.toLowerCase();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    const total = results.length;
    const offset = options.offset || 0;
    const limit = options.limit || 50;

    return {
      projects: results.slice(offset, offset + limit).map((p) => ({ ...p })),
      total,
    };
  }

  async create(input: CreateProjectInput): Promise<Project> {
    logger.debug('MODEL', `ProjectRepository.create inserting project: ${input.name}`);
    const id = `prj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const newProject: Project = {
      id,
      name: input.name.trim(),
      code: input.code.toUpperCase().trim(),
      description: input.description?.trim() || '',
      ownerId: input.ownerId,
      status: 'planning',
      priority: input.priority || 'medium',
      budget: input.budget || 0,
      tags: input.tags || [],
      createdAt: now,
      updatedAt: now,
    };

    this.projects.set(id, newProject);
    return { ...newProject };
  }

  async update(id: string, updates: UpdateProjectInput): Promise<Project | null> {
    logger.debug('MODEL', `ProjectRepository.update modifying project ID: ${id}`);
    const existing = this.projects.get(id);
    if (!existing) return null;

    const updated: Project = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.projects.set(id, updated);
    return { ...updated };
  }

  async delete(id: string): Promise<boolean> {
    logger.debug('MODEL', `ProjectRepository.delete removing project ID: ${id}`);
    return this.projects.delete(id);
  }

  async count(): Promise<number> {
    return this.projects.size;
  }
}

export const projectRepository = new ProjectRepository();
