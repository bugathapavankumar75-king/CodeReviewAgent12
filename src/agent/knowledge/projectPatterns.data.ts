/**
 * Dataset 6: Project Patterns
 * Established canonical patterns and design idioms accepted by the team.
 */

import type { ProjectPatternItem } from './knowledge.types';

export const PROJECT_PATTERNS_DATA: ProjectPatternItem[] = [
  {
    id: 'PAT-001',
    name: 'Repository Singleton Pattern',
    type: 'project_patterns',
    patternName: 'Repository Singleton Export',
    problemSolved: 'Provides clean access to data persistence without requiring heavy dependency injection containers.',
    solutionTemplate: 'class TaskRepository { ... }\\nexport const taskRepository = new TaskRepository();',
    referenceFile: 'src/models/task.model.ts',
    applicability: 'All domain entities in src/models/*',
    source: 'wiki/patterns/repository-pattern.md',
    status: 'active',
    metadata: {
      concurrencySafe: true,
      testingMockStrategy: 'jest.mock("../models/task.model")',
    },
    createdAt: '2026-01-25T11:00:00Z',
    updatedAt: '2026-08-10T15:00:00Z',
  },
  {
    id: 'PAT-002',
    name: 'Offset-Based Pagination Envelope Pattern',
    type: 'project_patterns',
    patternName: 'Paginated Query & ApiResponse Helper',
    problemSolved: 'Ensures uniform pagination metadata (page, limit, total, totalPages) across all listing endpoints.',
    solutionTemplate: 'const { items, total } = await service.list({ offset, limit });\\nreturn ApiResponse.paginated(res, items, page, limit, total);',
    referenceFile: 'src/controllers/user.controller.ts',
    applicability: 'All GET collection routes',
    source: 'wiki/patterns/pagination.md',
    status: 'active',
    createdAt: '2026-02-05T09:00:00Z',
    updatedAt: '2026-08-10T15:00:00Z',
  },
  {
    id: 'PAT-003',
    name: 'Granular Workflow Status Transition via PATCH',
    type: 'project_patterns',
    patternName: 'Dedicated Status Transition Endpoint',
    problemSolved: 'Prevents side-effects of full entity PUT updates when merely advancing a workflow state machine.',
    solutionTemplate: 'router.patch("/:id/status", asyncHandler(TaskController.changeStatus));',
    referenceFile: 'src/routes/task.routes.ts',
    applicability: 'All entities with lifecycle state machines (Tasks, Projects, Invoices)',
    source: 'wiki/patterns/state-machine-routes.md',
    status: 'active',
    createdAt: '2026-02-15T14:00:00Z',
    updatedAt: '2026-08-10T15:00:00Z',
  },
];
