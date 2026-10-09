/**
 * User Business Service
 * Encapsulates core user management domain logic, validation constraints,
 * and entity lifecycle management.
 */

import { userRepository, type User, type CreateUserInput, type UpdateUserInput, type UserQueryOptions } from '../models/user.model';
import { ApiError } from '../utils/apiError';
import { logger } from '../utils/logger';

export class UserService {
  async getUserById(id: string): Promise<User> {
    logger.info('SERVICE', `UserService.getUserById invoked for user ID: ${id}`);
    const user = await userRepository.findById(id);
    if (!user) {
      throw ApiError.notFound('User', id);
    }
    return user;
  }

  async listUsers(options: UserQueryOptions = {}): Promise<{ users: User[]; total: number }> {
    logger.info('SERVICE', 'UserService.listUsers evaluating query criteria', options);
    return userRepository.findAll(options);
  }

  async createUser(input: CreateUserInput): Promise<User> {
    logger.info('SERVICE', `UserService.createUser evaluating uniqueness for: ${input.email}`);

    // Business rule: Email uniqueness
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw ApiError.conflict(`User with email '${input.email}' already exists`);
    }

    // Business rule: Role authorization defaults
    const allowedRoles = ['admin', 'developer', 'manager', 'viewer'];
    if (input.role && !allowedRoles.includes(input.role)) {
      throw ApiError.badRequest(`Invalid user role. Allowed: ${allowedRoles.join(', ')}`);
    }

    const created = await userRepository.create(input);
    logger.info('SERVICE', `UserService: Successfully provisioned user '${created.id}'`);
    return created;
  }

  async updateUser(id: string, updates: UpdateUserInput): Promise<User> {
    logger.info('SERVICE', `UserService.updateUser mutating profile for ID: ${id}`);
    
    // Verify existence
    const existing = await userRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound('User', id);
    }

    // If updating email, ensure it's not taken by another user
    if (updates.email && updates.email.toLowerCase() !== existing.email.toLowerCase()) {
      const emailCollision = await userRepository.findByEmail(updates.email);
      if (emailCollision && emailCollision.id !== id) {
        throw ApiError.conflict(`Email '${updates.email}' is already taken by another account`);
      }
    }

    const updated = await userRepository.update(id, updates);
    if (!updated) {
      throw ApiError.internal('Failed to persist user updates');
    }

    return updated;
  }

  async deleteUser(id: string): Promise<{ deletedId: string }> {
    logger.info('SERVICE', `UserService.deleteUser checking constraints for user ID: ${id}`);
    
    const existing = await userRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound('User', id);
    }

    const success = await userRepository.delete(id);
    if (!success) {
      throw ApiError.internal('Unable to delete user record');
    }

    logger.info('SERVICE', `UserService: User ${id} record successfully deleted`);
    return { deletedId: id };
  }
}

export const userService = new UserService();
