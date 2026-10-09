/**
 * Project File Repository & Layer Metadata
 * Contains files, contents, and architectural explanations for the Clean Architecture Studio.
 */

export interface ProjectFileNode {
  path: string;
  name: string;
  type: 'file' | 'directory';
  layer: 'config' | 'routes' | 'controllers' | 'services' | 'models' | 'utils' | 'tests' | 'root';
  description: string;
  bestPractices: string[];
  content?: string;
  children?: ProjectFileNode[];
}

export const LAYER_DEFINITIONS = {
  routes: {
    title: 'Routing Layer',
    badge: 'src/routes/',
    color: 'text-sky-400 bg-sky-950/40 border-sky-800/60',
    description: 'Binds HTTP methods and URLs to controller handlers. Applies rate limiters, route guards, and layer tracing.',
    rules: [
      'Never contain business logic or database queries.',
      'Group routes cleanly by resource (e.g. /users, /projects).',
      'Use asyncHandler wrapper to ensure unhandled promise rejections reach global error middleware.',
    ],
  },
  controllers: {
    title: 'Controller Layer',
    badge: 'src/controllers/',
    color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60',
    description: 'Extracts request parameters (params, query, body), invokes validator schemas, delegates to services, and formats standard JSON responses.',
    rules: [
      'Controllers only handle HTTP-specific operations (status codes, headers, cookie setting).',
      'Always delegate domain calculations and transactions to Services.',
      'Never query databases directly inside controllers.',
      'Format all responses using standard ApiResponse helpers.',
    ],
  },
  services: {
    title: 'Service Layer',
    badge: 'src/services/',
    color: 'text-amber-400 bg-amber-950/40 border-amber-800/60',
    description: 'The core heart of the application containing pure business logic, validation rules, data transformations, and domain orchestrations.',
    rules: [
      'Completely decoupled from HTTP framework (zero import of express, req, or res).',
      'Throw domain ApiError instances (e.g. ApiError.notFound, ApiError.conflict).',
      'Enforce cross-entity validations (e.g., verifying user exists before project assignment).',
      'Can be reused across CLI commands, background workers, or WebSockets without alteration.',
    ],
  },
  models: {
    title: 'Model & Repository Layer',
    badge: 'src/models/',
    color: 'text-purple-400 bg-purple-950/40 border-purple-800/60',
    description: 'Defines entity schemas, database queries, in-memory repositories, and persistence operations.',
    rules: [
      'Encapsulates database access details behind clear Repository interfaces.',
      'Returns clean TypeScript entities rather than raw query artifacts.',
      'Handles indexing, query filtering, pagination, and data consistency.',
    ],
  },
  utils: {
    title: 'Utilities & Cross-Cutting Layer',
    badge: 'src/utils/',
    color: 'text-indigo-400 bg-indigo-950/40 border-indigo-800/60',
    description: 'Shared helpers: standardized ApiResponse, custom ApiError hierarchy, asyncHandler, logger, and request validators.',
    rules: [
      'Keep utilities pure, stateless, and reusable across all layers.',
      'Do not mix domain business rules into generic utility functions.',
    ],
  },
  config: {
    title: 'Configuration Layer',
    badge: 'config/',
    color: 'text-rose-400 bg-rose-950/40 border-rose-800/60',
    description: 'Centralized environment variables, database connections, and runtime flags.',
    rules: [
      'Single source of truth for runtime configurations.',
      'Fail fast during server startup if mandatory environment variables are missing.',
    ],
  },
  tests: {
    title: 'Test Suite Layer',
    badge: 'tests/',
    color: 'text-teal-400 bg-teal-950/40 border-teal-800/60',
    description: 'Isolated unit tests for services & models, and end-to-end integration tests for HTTP routes.',
    rules: [
      'Unit test business services independently of HTTP server.',
      'Integration test complete HTTP cycles using mock request/response contexts.',
    ],
  },
};

export const PROJECT_TREE: ProjectFileNode = {
  path: 'project',
  name: 'project',
  type: 'directory',
  layer: 'root',
  description: 'Clean 3-Tier Layered Node.js / Express Architecture',
  bestPractices: ['Maintain strict one-way dependency flow: Route -> Controller -> Service -> Model'],
  children: [
    {
      path: 'src',
      name: 'src',
      type: 'directory',
      layer: 'root',
      description: 'Source code root',
      bestPractices: ['Organized by architectural responsibility'],
      children: [
        {
          path: 'src/controllers',
          name: 'controllers',
          type: 'directory',
          layer: 'controllers',
          description: 'Request orchestration and HTTP response adapters',
          bestPractices: ['Keep thin; delegate to services'],
          children: [
            {
              path: 'src/controllers/user.controller.ts',
              name: 'user.controller.ts',
              type: 'file',
              layer: 'controllers',
              description: 'Handles user registration, queries, profile updates, and deletions.',
              bestPractices: ['Validates payload before service dispatch', 'Formats JSON with ApiResponse'],
            },
            {
              path: 'src/controllers/project.controller.ts',
              name: 'project.controller.ts',
              type: 'file',
              layer: 'controllers',
              description: 'Coordinates project management and aggregated metrics calculation.',
              bestPractices: ['Handles query pagination params', 'Provides detailed project metrics'],
            },
            {
              path: 'src/controllers/task.controller.ts',
              name: 'task.controller.ts',
              type: 'file',
              layer: 'controllers',
              description: 'Work item actions, assignments, and status transitions.',
              bestPractices: ['Validates enum statuses before processing'],
            },
            {
              path: 'src/controllers/health.controller.ts',
              name: 'health.controller.ts',
              type: 'file',
              layer: 'controllers',
              description: 'Runtime health checks, architecture introspection, and diagnostics.',
              bestPractices: ['Useful for load balancers and system monitoring'],
            },
          ],
        },
        {
          path: 'src/services',
          name: 'services',
          type: 'directory',
          layer: 'services',
          description: 'Pure domain business logic, invariant checks, and entity operations',
          bestPractices: ['Framework-independent', 'Throws domain ApiError instances'],
          children: [
            {
              path: 'src/services/user.service.ts',
              name: 'user.service.ts',
              type: 'file',
              layer: 'services',
              description: 'User registration invariants, email uniqueness, role constraints.',
              bestPractices: ['Enforces unique constraints', 'Has zero express dependencies'],
            },
            {
              path: 'src/services/project.service.ts',
              name: 'project.service.ts',
              type: 'file',
              layer: 'services',
              description: 'Project code uniqueness, owner verification, and metric aggregation.',
              bestPractices: ['Performs cross-repository verification with users and tasks'],
            },
            {
              path: 'src/services/task.service.ts',
              name: 'task.service.ts',
              type: 'file',
              layer: 'services',
              description: 'Task state transitions, assignee checks, and project binding.',
              bestPractices: ['Validates parent project existence before creation'],
            },
          ],
        },
        {
          path: 'src/models',
          name: 'models',
          type: 'directory',
          layer: 'models',
          description: 'Database entities, schemas, and repository data access contracts',
          bestPractices: ['Encapsulate query filters and persistence mechanisms'],
          children: [
            {
              path: 'src/models/user.model.ts',
              name: 'user.model.ts',
              type: 'file',
              layer: 'models',
              description: 'User interface definition and in-memory repository store.',
              bestPractices: ['Implements repository pattern', 'Provides query pagination'],
            },
            {
              path: 'src/models/project.model.ts',
              name: 'project.model.ts',
              type: 'file',
              layer: 'models',
              description: 'Project entity definition, indexes, and persistence methods.',
              bestPractices: ['Maintains search indices across name, code, description'],
            },
            {
              path: 'src/models/task.model.ts',
              name: 'task.model.ts',
              type: 'file',
              layer: 'models',
              description: 'Task entity definition, status tracking, and query methods.',
              bestPractices: ['Automatically handles completedAt timestamp transitions'],
            },
          ],
        },
        {
          path: 'src/routes',
          name: 'routes',
          type: 'directory',
          layer: 'routes',
          description: 'Endpoint definitions, URL mapping, and middleware bindings',
          bestPractices: ['Organize by resource', 'Keep route handlers declarative'],
          children: [
            {
              path: 'src/routes/index.ts',
              name: 'index.ts',
              type: 'file',
              layer: 'routes',
              description: 'Central express router aggregating all sub-routes with error middleware.',
              bestPractices: ['Includes centralized 404 and global error handlers'],
            },
            {
              path: 'src/routes/user.routes.ts',
              name: 'user.routes.ts',
              type: 'file',
              layer: 'routes',
              description: 'REST routes for /api/v1/users (GET, POST, PUT, DELETE).',
              bestPractices: ['Uses express Router() with chained methods'],
            },
            {
              path: 'src/routes/project.routes.ts',
              name: 'project.routes.ts',
              type: 'file',
              layer: 'routes',
              description: 'REST routes for /api/v1/projects and /api/v1/projects/:id/metrics.',
              bestPractices: ['Clean RESTful hierarchy'],
            },
            {
              path: 'src/routes/task.routes.ts',
              name: 'task.routes.ts',
              type: 'file',
              layer: 'routes',
              description: 'REST routes for /api/v1/tasks and status transitions.',
              bestPractices: ['Uses PATCH for granular state transitions'],
            },
            {
              path: 'src/routes/health.routes.ts',
              name: 'health.routes.ts',
              type: 'file',
              layer: 'routes',
              description: 'Endpoints for system health, introspection, and log streaming.',
              bestPractices: ['Essential for uptime checks and monitoring consoles'],
            },
          ],
        },
        {
          path: 'src/utils',
          name: 'utils',
          type: 'directory',
          layer: 'utils',
          description: 'Shared cross-cutting primitives: errors, responses, logging, validation',
          bestPractices: ['Pure, reusable functions with zero domain assumptions'],
          children: [
            {
              path: 'src/utils/apiResponse.ts',
              name: 'apiResponse.ts',
              type: 'file',
              layer: 'utils',
              description: 'Uniform JSON response envelope (success, statusCode, message, data, meta).',
              bestPractices: ['Consistent frontend payload consumption contract'],
            },
            {
              path: 'src/utils/apiError.ts',
              name: 'apiError.ts',
              type: 'file',
              layer: 'utils',
              description: 'Custom ApiError class with HTTP status codes and factory helpers.',
              bestPractices: ['Differentiates operational errors from unhandled crashes'],
            },
            {
              path: 'src/utils/asyncHandler.ts',
              name: 'asyncHandler.ts',
              type: 'file',
              layer: 'utils',
              description: 'Higher-order wrapper catching async errors and delegating to next().',
              bestPractices: ['Eliminates repetitive try/catch boilerplate in controllers'],
            },
            {
              path: 'src/utils/logger.ts',
              name: 'logger.ts',
              type: 'file',
              layer: 'utils',
              description: 'Layer-attributed structured logger with in-memory trace buffer.',
              bestPractices: ['Tags logs by layer [ROUTE], [SERVICE], [MODEL]'],
            },
            {
              path: 'src/utils/validator.ts',
              name: 'validator.ts',
              type: 'file',
              layer: 'utils',
              description: 'Lightweight schema and data validation helper.',
              bestPractices: ['Throws 422 Unprocessable Entity with error breakdown'],
            },
          ],
        },
      ],
    },
    {
      path: 'tests',
      name: 'tests',
      type: 'directory',
      layer: 'tests',
      description: 'Automated test suites verifying layer isolation and integration',
      bestPractices: ['Unit tests for services; Integration tests for routes'],
      children: [
        {
          path: 'tests/unit/services.test.ts',
          name: 'services.test.ts',
          type: 'file',
          layer: 'tests',
          description: 'Unit tests verifying business services and domain invariants.',
          bestPractices: ['Tests business logic without starting an HTTP server'],
        },
        {
          path: 'tests/unit/models.test.ts',
          name: 'models.test.ts',
          type: 'file',
          layer: 'tests',
          description: 'Unit tests verifying repository data persistence and query filters.',
          bestPractices: ['Tests data contracts and indexing'],
        },
        {
          path: 'tests/integration/routes.test.ts',
          name: 'routes.test.ts',
          type: 'file',
          layer: 'tests',
          description: 'Integration tests simulating complete HTTP requests through all layers.',
          bestPractices: ['Validates response format and status code compliance'],
        },
        {
          path: 'tests/testRunner.ts',
          name: 'testRunner.ts',
          type: 'file',
          layer: 'tests',
          description: 'Test orchestrator executing all suites and aggregating metrics.',
          bestPractices: ['Provides structured test summary and timing in ms'],
        },
      ],
    },
    {
      path: 'config',
      name: 'config',
      type: 'directory',
      layer: 'config',
      description: 'Environment variables and system configurations',
      bestPractices: ['Single configuration source of truth'],
      children: [
        {
          path: 'config/index.ts',
          name: 'index.ts',
          type: 'file',
          layer: 'config',
          description: 'Central typed config module managing port, environment, logging, and limits.',
          bestPractices: ['Parses and validates environment variables upfront'],
        },
      ],
    },
    {
      path: 'package.json',
      name: 'package.json',
      type: 'file',
      layer: 'root',
      description: 'Project manifest, dependencies, and npm scripts (dev, build, start, test).',
      bestPractices: ['Clear build and testing script entry points'],
    },
  ],
};
