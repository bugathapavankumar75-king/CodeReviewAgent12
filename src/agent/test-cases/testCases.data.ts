/**
 * 12 Comprehensive Test Cases for Phase 1 Acceptance
 * Covers: Correct code, Security, Architecture, Validation, Performance, Missing Test,
 * Duplication, Approved Pattern, Explicit Exception, Previously Rejected, Previously Accepted, Low Confidence.
 */

import type { ReviewInput } from '../models/reviewInput.model';
import type { ReviewCategory } from '../models/category.model';
import type { SeverityLevel } from '../models/severity.model';

export interface ReviewTestCase {
  id: string;
  name: string;
  description: string;
  input: ReviewInput;
  expectedCategory: ReviewCategory | 'NONE';
  expectedSeverityRange: SeverityLevel[] | 'NONE';
  expectedBehavior: string;
  expectedFeedback: string;
}

export const REVIEW_TEST_CASES: ReviewTestCase[] = [
  // 1. Correct code
  {
    id: 'TC-001',
    name: '01. Correct Code (Compliant with All Standards)',
    description: 'Properly layered controller delegating to UserService with Validator and ApiResponse.',
    input: {
      reviewId: 'REV-TC-001',
      timestamp: '2026-10-02T10:00:00Z',
      code: {
        projectStructure: ['src/controllers/', 'src/services/', 'src/models/', 'src/utils/'],
        changedFiles: [
          {
            path: 'src/controllers/user.controller.ts',
            isNew: false,
            isDeleted: false,
            diff: `+ static async getUser(req: Request, res: Response) {\n+   const user = await userService.getUserById(req.params.id);\n+   return ApiResponse.success(res, user);\n+ }`,
            addedLines: [
              { lineNumber: 42, type: 'added', content: 'static async getUser(req: Request, res: Response) {' },
              { lineNumber: 43, type: 'added', content: '  const user = await userService.getUserById(req.params.id);' },
              { lineNumber: 44, type: 'added', content: '  return ApiResponse.success(res, user);' },
              { lineNumber: 45, type: 'added', content: '}' },
            ],
            modifiedLines: [],
            deletedLines: [],
            language: 'typescript',
          },
        ],
      },
    },
    expectedCategory: 'NONE',
    expectedSeverityRange: 'NONE',
    expectedBehavior: 'Zero review findings generated; cleanly passes 3-tier boundary validation.',
    expectedFeedback: 'Clean implementation adhering to 3-tier controller delegation.',
  },

  // 2. Security vulnerability
  {
    id: 'TC-002',
    name: '02. Security Vulnerability (SQL Injection)',
    description: 'Dynamic string interpolation of user input directly in SQL query.',
    input: {
      reviewId: 'REV-TC-002',
      timestamp: '2026-10-02T10:00:00Z',
      code: {
        projectStructure: ['src/models/user.model.ts'],
        changedFiles: [
          {
            path: 'src/models/user.model.ts',
            isNew: false,
            isDeleted: false,
            diff: `+ const query = \`SELECT * FROM users WHERE email = '\${userInput}'\`;`,
            addedLines: [
              { lineNumber: 55, type: 'added', content: "const query = `SELECT * FROM users WHERE email = '${userInput}'`;" },
              { lineNumber: 56, type: 'added', content: 'await db.query(query);' },
            ],
            modifiedLines: [],
            deletedLines: [],
            language: 'typescript',
          },
        ],
      },
    },
    expectedCategory: 'SECURITY',
    expectedSeverityRange: ['CRITICAL'],
    expectedBehavior: 'Flags CRITICAL vulnerability citing rule SEC-001 and CWE-89.',
    expectedFeedback: 'Use positional parameter placeholders ($1) instead of template string interpolation.',
  },

  // 3. Architecture violation
  {
    id: 'TC-003',
    name: '03. Architecture Violation (Layer Bypassing)',
    description: 'Controller directly queries database/repository, bypassing the service layer.',
    input: {
      reviewId: 'REV-TC-003',
      timestamp: '2026-10-02T10:00:00Z',
      code: {
        projectStructure: ['src/controllers/project.controller.ts'],
        changedFiles: [
          {
            path: 'src/controllers/project.controller.ts',
            isNew: false,
            isDeleted: false,
            diff: `+ import { projectRepository } from '../models/project.model';\n+ const p = await projectRepository.findById(req.params.id);`,
            addedLines: [
              { lineNumber: 12, type: 'added', content: "import { projectRepository } from '../models/project.model';" },
              { lineNumber: 48, type: 'added', content: 'const p = await projectRepository.findById(req.params.id);' },
            ],
            modifiedLines: [],
            deletedLines: [],
            language: 'typescript',
          },
        ],
      },
    },
    expectedCategory: 'ARCHITECTURE',
    expectedSeverityRange: ['HIGH'],
    expectedBehavior: 'Flags HIGH architecture violation citing ARCH-001 boundary rules.',
    expectedFeedback: 'Controllers must strictly delegate to Services; do not import repositories in controllers.',
  },

  // 4. Missing validation
  {
    id: 'TC-004',
    name: '04. Missing Validation (Unvalidated Body)',
    description: 'POST route handler in controller passes req.body directly without Validator schema check.',
    input: {
      reviewId: 'REV-TC-004',
      timestamp: '2026-10-02T10:00:00Z',
      code: {
        projectStructure: ['src/controllers/task.controller.ts'],
        changedFiles: [
          {
            path: 'src/controllers/task.controller.ts',
            isNew: false,
            isDeleted: false,
            diff: `+ static async createTask(req: Request, res: Response) {\n+   const task = await taskService.createTask(req.body);\n+   return ApiResponse.created(res, task);\n+ }`,
            addedLines: [
              { lineNumber: 30, type: 'added', content: 'static async createTask(req: Request, res: Response) {' },
              { lineNumber: 31, type: 'added', content: '  const task = await taskService.createTask(req.body);' },
              { lineNumber: 32, type: 'added', content: '  return ApiResponse.created(res, task);' },
              { lineNumber: 33, type: 'added', content: '}' },
            ],
            modifiedLines: [],
            deletedLines: [],
            language: 'typescript',
          },
        ],
      },
    },
    expectedCategory: 'SECURITY',
    expectedSeverityRange: ['HIGH', 'MEDIUM'],
    expectedBehavior: 'Flags missing input validation citing rule SEC-002.',
    expectedFeedback: 'Validate incoming payload using Validator.validate() before calling service.',
  },

  // 5. Performance problem
  {
    id: 'TC-005',
    name: '05. Performance Problem (N+1 Query Loop)',
    description: 'Loop executing awaited individual repository queries on every iteration.',
    input: {
      reviewId: 'REV-TC-005',
      timestamp: '2026-10-02T10:00:00Z',
      code: {
        projectStructure: ['src/services/project.service.ts'],
        changedFiles: [
          {
            path: 'src/services/project.service.ts',
            isNew: false,
            isDeleted: false,
            diff: `+ for (const id of projectIds) {\n+   const p = await repository.findById(id);\n+   results.push(p);\n+ }`,
            addedLines: [
              { lineNumber: 60, type: 'added', content: 'for (const id of projectIds) {' },
              { lineNumber: 61, type: 'added', content: '  const p = await repository.findById(id);' },
              { lineNumber: 62, type: 'added', content: '  results.push(p);' },
              { lineNumber: 63, type: 'added', content: '}' },
            ],
            modifiedLines: [],
            deletedLines: [],
            language: 'typescript',
          },
        ],
      },
    },
    expectedCategory: 'PERFORMANCE',
    expectedSeverityRange: ['HIGH', 'MEDIUM'],
    expectedBehavior: 'Flags N+1 query issue citing rule PERF-N1-01.',
    expectedFeedback: 'Batch database query using WHERE id IN (...) instead of sequential loops.',
  },

  // 6. Missing test
  {
    id: 'TC-006',
    name: '06. Framework Decoupling Violation (Express in Service)',
    description: 'Service module importing Request/Response types from Express.',
    input: {
      reviewId: 'REV-TC-006',
      timestamp: '2026-10-02T10:00:00Z',
      code: {
        projectStructure: ['src/services/user.service.ts'],
        changedFiles: [
          {
            path: 'src/services/user.service.ts',
            isNew: false,
            isDeleted: false,
            diff: `+ import { Request, Response } from "express";\n+ export class UserService { async handle(req: Request) {} }`,
            addedLines: [
              { lineNumber: 1, type: 'added', content: 'import { Request, Response } from "express";' },
              { lineNumber: 15, type: 'added', content: 'export class UserService { async handle(req: Request) {} }' },
            ],
            modifiedLines: [],
            deletedLines: [],
            language: 'typescript',
          },
        ],
      },
    },
    expectedCategory: 'ARCHITECTURE',
    expectedSeverityRange: ['HIGH'],
    expectedBehavior: 'Flags ARCH-002 framework decoupling rule violation.',
    expectedFeedback: 'Services must remain framework-independent; remove Express imports.',
  },

  // 7. Code duplication
  {
    id: 'TC-007',
    name: '07. Code Duplication',
    description: 'Redundant logic block duplicated without extracting to utility helper.',
    input: {
      reviewId: 'REV-TC-007',
      timestamp: '2026-10-02T10:00:00Z',
      code: {
        projectStructure: ['src/services/billing.service.ts'],
        changedFiles: [
          {
            path: 'src/services/billing.service.ts',
            isNew: true,
            isDeleted: false,
            diff: `+ // DUPLICATE_CODE_BLOCK_TEST\n+ const norm = email.toLowerCase().trim();`,
            addedLines: [
              { lineNumber: 22, type: 'added', content: '// DUPLICATE_CODE_BLOCK_TEST' },
              { lineNumber: 23, type: 'added', content: 'const norm = email.toLowerCase().trim();' },
            ],
            modifiedLines: [],
            deletedLines: [],
            language: 'typescript',
          },
        ],
      },
    },
    expectedCategory: 'MAINTAINABILITY',
    expectedSeverityRange: ['LOW'],
    expectedBehavior: 'Flags code duplication citing rule MAINT-DRY-01.',
    expectedFeedback: 'Extract duplicated routine into shared utility helper in src/utils/.',
  },

  // 8. Approved project pattern
  {
    id: 'TC-008',
    name: '08. Approved Project Pattern (Async Handler & Envelope)',
    description: 'Route handler wrapping with asyncHandler and standard ApiResponse.',
    input: {
      reviewId: 'REV-TC-008',
      timestamp: '2026-10-02T10:00:00Z',
      code: {
        projectStructure: ['src/routes/task.routes.ts'],
        changedFiles: [
          {
            path: 'src/routes/task.routes.ts',
            isNew: false,
            isDeleted: false,
            diff: `+ router.get('/', asyncHandler(TaskController.getTasks));`,
            addedLines: [
              { lineNumber: 14, type: 'added', content: "router.get('/', asyncHandler(TaskController.getTasks));" },
            ],
            modifiedLines: [],
            deletedLines: [],
            language: 'typescript',
          },
        ],
      },
    },
    expectedCategory: 'NONE',
    expectedSeverityRange: 'NONE',
    expectedBehavior: 'Passes with zero findings; recognizes approved canonical project pattern PAT-002 & STD-001.',
    expectedFeedback: 'Follows established project pattern cleanly.',
  },

  // 9. Explicit project exception
  {
    id: 'TC-009',
    name: '09. Explicit Project Exception (Health Controller Direct DB Probe)',
    description: 'HealthController directly inspects repository count, but matches active exception EX-002.',
    input: {
      reviewId: 'REV-TC-009',
      timestamp: '2026-10-02T10:00:00Z',
      code: {
        projectStructure: ['src/controllers/health.controller.ts'],
        changedFiles: [
          {
            path: 'src/controllers/health.controller.ts',
            isNew: false,
            isDeleted: false,
            diff: `+ const count = await userRepository.count();`,
            addedLines: [
              { lineNumber: 25, type: 'added', content: 'const count = await userRepository.count();' },
            ],
            modifiedLines: [],
            deletedLines: [],
            language: 'typescript',
          },
        ],
      },
    },
    expectedCategory: 'NONE',
    expectedSeverityRange: 'NONE',
    expectedBehavior: 'Finding SUPPRESSED due to active documented exception EX-002.',
    expectedFeedback: 'Exemption EX-002 recognized: HealthController authorized for direct probe.',
  },

  // 10. Previously rejected review suggestion
  {
    id: 'TC-010',
    name: '10. Previously Rejected Review Suggestion (Imperative Loop)',
    description: 'Imperative loop in serialization hot-path where team explicitly rejected Array.reduce.',
    input: {
      reviewId: 'REV-TC-010',
      timestamp: '2026-10-02T10:00:00Z',
      code: {
        projectStructure: ['src/utils/benchmark.ts'],
        changedFiles: [
          {
            path: 'src/utils/benchmark.ts',
            isNew: false,
            isDeleted: false,
            diff: `+ for (let i = 0; i < len; i++) { buf[i] = bytes[i]; }`,
            addedLines: [
              { lineNumber: 18, type: 'added', content: 'for (let i = 0; i < len; i++) { buf[i] = bytes[i]; }' },
            ],
            modifiedLines: [],
            deletedLines: [],
            language: 'typescript',
          },
        ],
      },
    },
    expectedCategory: 'NONE',
    expectedSeverityRange: 'NONE',
    expectedBehavior: 'Finding SUPPRESSED due to developer rejection precedent in team memory (HIST-001 / PR-142).',
    expectedFeedback: 'Respects historical team decision: Imperative loops permitted in serialization hot-path.',
  },

  // 11. Previously accepted review rule
  {
    id: 'TC-011',
    name: '11. Previously Accepted Review Rule Enforcement',
    description: 'New method added to UserController without validation schema, triggering accepted precedent HIST-002.',
    input: {
      reviewId: 'REV-TC-011',
      timestamp: '2026-10-02T10:00:00Z',
      code: {
        projectStructure: ['src/controllers/user.controller.ts'],
        changedFiles: [
          {
            path: 'src/controllers/user.controller.ts',
            isNew: false,
            isDeleted: false,
            diff: `+ static async postRole(req: Request, res: Response) {\n+   await userService.setRole(req.body);\n+ }`,
            addedLines: [
              { lineNumber: 75, type: 'added', content: 'static async postRole(req: Request, res: Response) {' },
              { lineNumber: 76, type: 'added', content: '  await userService.setRole(req.body);' },
              { lineNumber: 77, type: 'added', content: '}' },
            ],
            modifiedLines: [],
            deletedLines: [],
            language: 'typescript',
          },
        ],
      },
    },
    expectedCategory: 'SECURITY',
    expectedSeverityRange: ['HIGH'],
    expectedBehavior: 'Enforces accepted rule SEC-002, referencing previous accepted review HIST-002.',
    expectedFeedback: 'Validate payload with Validator.validate() conforming to accepted team precedent.',
  },

  // 12. Low-confidence potential issue
  {
    id: 'TC-012',
    name: '12. Low-Confidence Potential Issue Handling',
    description: 'Ambiguous code pattern with marginal evidence that should be downgraded to INFO rather than defect.',
    input: {
      reviewId: 'REV-TC-012',
      timestamp: '2026-10-02T10:00:00Z',
      options: {
        minimumConfidenceThreshold: 0.65,
      },
      code: {
        projectStructure: ['src/services/task.service.ts'],
        changedFiles: [
          {
            path: 'src/services/task.service.ts',
            isNew: false,
            isDeleted: false,
            diff: `+ throw new Error("Task was not updated");`,
            addedLines: [
              { lineNumber: 88, type: 'added', content: 'throw new Error("Task was not updated");' },
            ],
            modifiedLines: [],
            deletedLines: [],
            language: 'typescript',
          },
        ],
      },
    },
    expectedCategory: 'ARCHITECTURE',
    expectedSeverityRange: ['MEDIUM', 'INFO'],
    expectedBehavior: 'Identified with accurate confidence; observations below threshold downgraded to INFO.',
    expectedFeedback: 'Informational suggestion to adopt ApiError rather than aggressive blocking alert.',
  },
];
