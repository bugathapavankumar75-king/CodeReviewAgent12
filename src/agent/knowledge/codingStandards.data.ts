/**
 * Dataset 2: Coding Standards
 * Explicit team conventions, error handling contracts, and style rules.
 */

import type { CodingStandardItem } from './knowledge.types';

export const CODING_STANDARDS_DATA: CodingStandardItem[] = [
  {
    id: 'STD-001',
    name: 'Async Route Handler Error Wrapping',
    type: 'coding_standards',
    category: 'RELIABILITY',
    rule: 'Every asynchronous Express route handler must be wrapped with "asyncHandler" to guarantee unhandled promise rejections are forwarded to the centralized error middleware.',
    rationale:
      'Unwrapped async handlers in Express 4 will hang client requests indefinitely upon unhandled promise rejection, resulting in connection pool leaks.',
    priority: 88,
    severity: 'HIGH',
    goodExample: 'router.get("/users", asyncHandler(UserController.getUsers));',
    badExample: 'router.get("/users", UserController.getUsers);',
    autoFixable: true,
    source: 'wiki/standards/error-handling.md',
    status: 'active',
    metadata: {
      frameworkVersion: 'express-4',
    },
    createdAt: '2026-01-20T10:00:00Z',
    updatedAt: '2026-08-01T10:00:00Z',
  },
  {
    id: 'STD-002',
    name: 'Domain Specific ApiError Usage',
    type: 'coding_standards',
    category: 'ARCHITECTURE',
    rule: 'Business logic must raise semantic domain errors using the "ApiError" factory (ApiError.notFound, ApiError.conflict, ApiError.badRequest) instead of generic "new Error()".',
    rationale:
      'Generic JavaScript errors default to 500 Internal Server Error in the global error middleware, obscuring client operational errors (such as 404 Not Found or 409 Conflict).',
    priority: 80,
    severity: 'MEDIUM',
    goodExample: 'throw ApiError.notFound("User", id);',
    badExample: 'throw new Error("User with id " + id + " does not exist");',
    autoFixable: false,
    source: 'wiki/standards/error-handling.md',
    status: 'active',
    createdAt: '2026-01-20T10:00:00Z',
    updatedAt: '2026-08-01T10:00:00Z',
  },
  {
    id: 'STD-003',
    name: 'Floating Promise Prohibition',
    type: 'coding_standards',
    category: 'CORRECTNESS',
    rule: 'All asynchronous function calls returning a Promise must either be explicitly awaited or handled with .catch(). Floating promises are prohibited.',
    rationale:
      'Floating promises cause silent background errors that do not trigger alerts and can cause data corruption when dependent operations execute out-of-order.',
    priority: 85,
    severity: 'HIGH',
    goodExample: 'await taskRepository.delete(id);',
    badExample: 'taskRepository.delete(id); // unawaited floating promise',
    autoFixable: false,
    source: 'wiki/standards/typescript-rules.md',
    status: 'active',
    createdAt: '2026-02-10T12:00:00Z',
    updatedAt: '2026-08-05T09:00:00Z',
  },
  {
    id: 'STD-004',
    name: 'Automated Formatting Non-Interference',
    type: 'coding_standards',
    category: 'CODE_QUALITY',
    rule: 'Do not raise manual review comments for indentation, single vs double quotes, or trailing commas; these are handled automatically by project Prettier/ESLint hooks.',
    rationale:
      'Reviewer nitpicking on automated style details drains developer velocity and distracts from architectural and correctness issues.',
    priority: 50,
    severity: 'INFO',
    goodExample: 'Rely on npm run lint / git pre-commit hook',
    badExample: 'Please change double quotes to single quotes here.',
    autoFixable: true,
    source: 'wiki/standards/review-philosophy.md',
    status: 'active',
    createdAt: '2026-01-10T14:00:00Z',
    updatedAt: '2026-07-20T10:00:00Z',
  },
];
