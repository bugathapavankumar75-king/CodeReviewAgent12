/**
 * Request Validation Helper
 * Provides lightweight schema validation and guards for controller input.
 */

import { ApiError } from './apiError';

export type ValidatorRule<T> = (value: unknown, fieldName: string, allData: T) => string | null;

export class Validator {
  static string(options?: { min?: number; max?: number; pattern?: RegExp }): ValidatorRule<unknown> {
    return (val, field) => {
      if (typeof val !== 'string') return `${field} must be a string`;
      if (options?.min && val.trim().length < options.min) {
        return `${field} must be at least ${options.min} characters`;
      }
      if (options?.max && val.length > options.max) {
        return `${field} must not exceed ${options.max} characters`;
      }
      if (options?.pattern && !options.pattern.test(val)) {
        return `${field} format is invalid`;
      }
      return null;
    };
  }

  static email(): ValidatorRule<unknown> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return (val, field) => {
      if (typeof val !== 'string' || !emailRegex.test(val)) {
        return `${field} must be a valid email address`;
      }
      return null;
    };
  }

  static number(options?: { min?: number; max?: number }): ValidatorRule<unknown> {
    return (val, field) => {
      const num = Number(val);
      if (isNaN(num)) return `${field} must be a valid number`;
      if (options?.min !== undefined && num < options.min) {
        return `${field} must be at least ${options.min}`;
      }
      if (options?.max !== undefined && num > options.max) {
        return `${field} must not exceed ${options.max}`;
      }
      return null;
    };
  }

  static enum<E extends string>(allowed: E[]): ValidatorRule<unknown> {
    return (val, field) => {
      if (!allowed.includes(val as E)) {
        return `${field} must be one of: ${allowed.join(', ')}`;
      }
      return null;
    };
  }

  static required(): ValidatorRule<unknown> {
    return (val, field) => {
      if (val === undefined || val === null || val === '') {
        return `${field} is required`;
      }
      return null;
    };
  }

  static validate<T extends object>(
    data: unknown,
    schema: Record<string, Array<ValidatorRule<T>>>
  ): T {
    if (!data || typeof data !== 'object') {
      throw ApiError.badRequest('Request payload must be a JSON object');
    }

    const typedData = data as any;
    const errors: Record<string, string[]> = {};

    for (const [field, rules] of Object.entries(schema)) {
      const val = typedData[field];
      for (const rule of rules) {
        const error = rule(val, field, typedData);
        if (error) {
          if (!errors[field]) errors[field] = [];
          errors[field].push(error);
          break; // move to next field
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      throw ApiError.unprocessable('Validation failed on one or more fields', errors);
    }

    return typedData as T;
  }
}
