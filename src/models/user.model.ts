/**
 * User Data Model & Repository Interface
 * Defines entity schema, query criteria, and persistence contracts.
 */

import { logger } from '../utils/logger';

export type UserRole = 'admin' | 'developer' | 'manager' | 'viewer';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  department: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  role?: UserRole;
  department?: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
  department?: string;
}

export interface UserQueryOptions {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
  limit?: number;
  offset?: number;
}

// In-Memory Repository implementation adhering to standard repository pattern
class UserRepository {
  private users: Map<string, User> = new Map();

  constructor() {
    this.seedDefaultUsers();
  }

  private seedDefaultUsers() {
    const seedData: CreateUserInput[] = [
      { name: 'Alex Rivera', email: 'alex.rivera@example.com', role: 'admin', department: 'Platform Engineering' },
      { name: 'Sarah Chen', email: 'sarah.chen@example.com', role: 'developer', department: 'Core Services' },
      { name: 'Marcus Vance', email: 'marcus.vance@example.com', role: 'manager', department: 'Product Architecture' },
      { name: 'Elena Rostova', email: 'elena.rostova@example.com', role: 'developer', department: 'Data Infrastructure' },
    ];

    seedData.forEach((input, index) => {
      const id = `usr_${1000 + index}`;
      const now = new Date(Date.now() - (4 - index) * 86400000).toISOString();
      this.users.set(id, {
        id,
        name: input.name,
        email: input.email,
        role: input.role || 'developer',
        status: 'active',
        department: input.department || 'Engineering',
        createdAt: now,
        updatedAt: now,
      });
    });
  }

  async findById(id: string): Promise<User | null> {
    logger.debug('MODEL', `UserRepository.findById executing for ID: ${id}`);
    const user = this.users.get(id);
    return user ? { ...user } : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    logger.debug('MODEL', `UserRepository.findByEmail executing for: ${email}`);
    const normalized = email.toLowerCase().trim();
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === normalized) {
        return { ...user };
      }
    }
    return null;
  }

  async findAll(options: UserQueryOptions = {}): Promise<{ users: User[]; total: number }> {
    logger.debug('MODEL', 'UserRepository.findAll querying user records', options);
    let results = Array.from(this.users.values());

    if (options.role) {
      results = results.filter((u) => u.role === options.role);
    }

    if (options.status) {
      results = results.filter((u) => u.status === options.status);
    }

    if (options.search) {
      const q = options.search.toLowerCase();
      results = results.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }

    const total = results.length;
    const offset = options.offset || 0;
    const limit = options.limit || 50;

    const paginated = results.slice(offset, offset + limit);
    return { users: paginated.map((u) => ({ ...u })), total };
  }

  async create(data: CreateUserInput): Promise<User> {
    logger.debug('MODEL', `UserRepository.create inserting new user: ${data.email}`);
    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const newUser: User = {
      id,
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      role: data.role || 'developer',
      status: 'active',
      department: data.department || 'General',
      createdAt: now,
      updatedAt: now,
    };

    this.users.set(id, newUser);
    return { ...newUser };
  }

  async update(id: string, updates: UpdateUserInput): Promise<User | null> {
    logger.debug('MODEL', `UserRepository.update modifying user ID: ${id}`);
    const existing = this.users.get(id);
    if (!existing) return null;

    const updated: User = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.users.set(id, updated);
    return { ...updated };
  }

  async delete(id: string): Promise<boolean> {
    logger.debug('MODEL', `UserRepository.delete removing user ID: ${id}`);
    return this.users.delete(id);
  }

  async count(): Promise<number> {
    return this.users.size;
  }
}

export const userRepository = new UserRepository();
