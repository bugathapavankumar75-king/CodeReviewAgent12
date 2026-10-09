/**
 * Workspace Local Storage & State Manager
 * Handles local persistence, project configuration, and per-file state management.
 */

import type {
  WorkspaceState,
  WorkspaceFile,
  WorkspaceProjectConfig,
  ReviewHistoryEntry,
  SupportedLanguage,
} from './types';
import { SUPPORTED_LANGUAGES, detectLanguageFromFilename } from './languageConfig';

const STORAGE_KEY = 'context_aware_code_workspace_v1';
const HISTORY_STORAGE_KEY = 'context_aware_review_history_v1';

export const DEFAULT_PROJECT_CONFIG: WorkspaceProjectConfig = {
  projectName: 'Task Management API',
  description: 'B2B enterprise task workflow, assignment, and auditing REST API.',
  primaryLanguage: 'typescript',
  framework: 'Express (Node.js)',
  database: 'PostgreSQL',
  architecture: 'Controller → Service → Repository → Database',
};

const SAMPLE_USER_CONTROLLER = `/**
 * User Controller - Task Management API
 * Boundary: Extracts HTTP params, validates DTOs, delegates to UserService.
 */

import type { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { ApiResponse } from '../utils/apiResponse';
import { Validator } from '../utils/validator';

export class UserController {
  static async createUser(req: Request, res: Response) {
    // 1. Schema Validation (SEC-002)
    const validated = Validator.validate(req.body, {
      name: [Validator.required(), Validator.string({ min: 2, max: 100 })],
      email: [Validator.required(), Validator.email()],
      role: [Validator.enum(['admin', 'developer', 'manager'])],
    });

    // 2. Delegate to Business Service (ARCH-001)
    const user = await userService.createUser(validated as any);
    return ApiResponse.created(res, user, 'User provisioned successfully');
  }

  static async getUserById(req: Request, res: Response) {
    const user = await userService.getUserById(req.params.id);
    return ApiResponse.success(res, user);
  }
}
`;

const SAMPLE_USER_SERVICE = `/**
 * User Business Service
 * Boundary: Framework-independent domain rules & invariants.
 */

import { userRepository } from '../models/user.model';
import { ApiError } from '../utils/apiError';
import { logger } from '../utils/logger';

export class UserService {
  async getUserById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw ApiError.notFound('User', id);
    }
    return user;
  }

  async createUser(input: { name: string; email: string; role?: string }) {
    // Domain rule: Email uniqueness check
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw ApiError.conflict(\`User with email '\${input.email}' already exists\`);
    }

    const created = await userRepository.create(input);
    logger.info('SERVICE', \`Created user account: \${created.id}\`);
    return created;
  }
}

export const userService = new UserService();
`;

const SAMPLE_BENCHMARK_PY = `"""
Serialization Latency Benchmark - Python
Compares serialization throughput across data sizes.
"""

import time
import json
from typing import List, Dict, Any

def run_benchmark(iterations: int = 1000) -> Dict[str, Any]:
    dataset = [{"id": f"task_{i}", "priority": "high", "hours": i % 8} for i in range(100)]
    
    start_time = time.perf_counter()
    for _ in range(iterations):
        serialized = json.dumps(dataset)
        _ = json.loads(serialized)
    duration_ms = (time.perf_counter() - start_time) * 1000
    
    return {
        "iterations": iterations,
        "total_ms": round(duration_ms, 2),
        "ops_per_second": round((iterations / (duration_ms / 1000)), 2)
    }

if __name__ == "__main__":
    print(run_benchmark())
`;

const DEFAULT_SAMPLE_FILES: WorkspaceFile[] = [
  {
    file_id: 'file-001',
    file_name: 'user.controller.ts',
    file_path: 'src/controllers/user.controller.ts',
    language: 'typescript',
    content: SAMPLE_USER_CONTROLLER,
    savedContent: SAMPLE_USER_CONTROLLER,
    isDirty: false,
    created_at: '2026-10-01T08:00:00Z',
    updated_at: '2026-10-01T08:00:00Z',
  },
  {
    file_id: 'file-002',
    file_name: 'user.service.ts',
    file_path: 'src/services/user.service.ts',
    language: 'typescript',
    content: SAMPLE_USER_SERVICE,
    savedContent: SAMPLE_USER_SERVICE,
    isDirty: false,
    created_at: '2026-10-01T08:15:00Z',
    updated_at: '2026-10-01T08:15:00Z',
  },
  {
    file_id: 'file-003',
    file_name: 'benchmark.py',
    file_path: 'scripts/benchmark.py',
    language: 'python',
    content: SAMPLE_BENCHMARK_PY,
    savedContent: SAMPLE_BENCHMARK_PY,
    isDirty: false,
    created_at: '2026-10-01T09:00:00Z',
    updated_at: '2026-10-01T09:00:00Z',
  },
];

export class WorkspaceStorage {
  static loadWorkspace(): WorkspaceState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.files)) {
          // Normalize files to ensure independent state and clean up any stale boilerplate in user files
          const normalizedFiles = parsed.files.map((f: any) => {
            let content = f.content ?? '';
            let savedContent = f.savedContent ?? content;

            // If a custom file like pavan.py previously got the template python boilerplate, reset it to empty
            if (f.file_name === 'pavan.py' && content.includes('Task Management Service - Python')) {
              content = '';
              savedContent = '';
            }

            return {
              file_id: f.file_id || f.id || `file-${Math.random().toString(36).slice(2, 8)}`,
              file_name: f.file_name || f.name || 'untitled',
              file_path: f.file_path || f.path || `src/${f.file_name || 'untitled'}`,
              language: (f.language as SupportedLanguage) || detectLanguageFromFilename(f.file_name || ''),
              content,
              savedContent,
              isDirty: content !== savedContent,
              created_at: f.created_at || new Date().toISOString(),
              updated_at: f.updated_at || new Date().toISOString(),
            };
          });

          // Ensure active_file_id is valid
          let activeId = parsed.active_file_id;
          if (!normalizedFiles.some((f: WorkspaceFile) => f.file_id === activeId) && normalizedFiles.length > 0) {
            activeId = normalizedFiles[0].file_id;
          }

          return {
            workspace_id: parsed.workspace_id || parsed.workspaceId || 'workspace-default',
            project_name: parsed.project_name || parsed.projectName || DEFAULT_PROJECT_CONFIG.projectName,
            config: parsed.config || DEFAULT_PROJECT_CONFIG,
            files: normalizedFiles,
            active_file_id: activeId,
            created_at: parsed.created_at || new Date().toISOString(),
            updated_at: parsed.updated_at || new Date().toISOString(),
          };
        }
      }
    } catch (e) {
      console.warn('Failed to load workspace from localStorage, using defaults', e);
    }

    // Default Initial Workspace
    const defaultState: WorkspaceState = {
      workspace_id: 'workspace-default',
      project_name: DEFAULT_PROJECT_CONFIG.projectName,
      config: DEFAULT_PROJECT_CONFIG,
      files: DEFAULT_SAMPLE_FILES,
      active_file_id: DEFAULT_SAMPLE_FILES[0].file_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.saveWorkspace(defaultState);
    return defaultState;
  }

  static saveWorkspace(state: WorkspaceState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save workspace state to localStorage', e);
    }
  }

  /**
   * Section 4 & 5: Save currently selected file
   */
  static saveFile(
    state: WorkspaceState,
    fileId: string
  ): { state: WorkspaceState; savedFile?: WorkspaceFile } {
    let savedFile: WorkspaceFile | undefined;
    const now = new Date().toISOString();

    const updatedFiles = state.files.map((f) => {
      if (f.file_id === fileId) {
        savedFile = {
          ...f,
          savedContent: f.content,
          isDirty: false,
          updated_at: now,
        };
        return savedFile;
      }
      return f;
    });

    const updatedState: WorkspaceState = {
      ...state,
      files: updatedFiles,
      updated_at: now,
    };

    this.saveWorkspace(updatedState);
    return { state: updatedState, savedFile };
  }

  /**
   * Section 2: Create New File (starts completely empty, with chosen language)
   */
  static createFile(
    state: WorkspaceState,
    fileName: string,
    languageOverride?: SupportedLanguage,
    initialContent = ''
  ): { state: WorkspaceState; newFile: WorkspaceFile } {
    const trimmed = fileName.trim();
    if (!trimmed) {
      throw new Error('File name cannot be empty');
    }

    // Check duplicate
    if (state.files.some((f) => f.file_name.toLowerCase() === trimmed.toLowerCase())) {
      throw new Error(`A file named "${trimmed}" already exists in the workspace`);
    }

    const language = languageOverride || detectLanguageFromFilename(trimmed);
    const newId = `file-${Date.now().toString(36)}`;
    const now = new Date().toISOString();

    // REQUIREMENT 2 & 11: Newly created files MUST start COMPLETELY EMPTY (NO boilerplate, NO sample code)
    const fileContent = initialContent;

    const newFile: WorkspaceFile = {
      file_id: newId,
      file_name: trimmed,
      file_path: trimmed.startsWith('/') ? trimmed : `src/${trimmed}`,
      language,
      content: fileContent,
      savedContent: fileContent,
      isDirty: false,
      created_at: now,
      updated_at: now,
    };

    const updatedState: WorkspaceState = {
      ...state,
      files: [...state.files, newFile],
      active_file_id: newId,
      updated_at: now,
    };

    this.saveWorkspace(updatedState);
    return { state: updatedState, newFile };
  }

  static renameFile(
    state: WorkspaceState,
    fileId: string,
    newFileName: string
  ): WorkspaceState {
    const trimmed = newFileName.trim();
    if (!trimmed) throw new Error('File name cannot be empty');

    const duplicate = state.files.some(
      (f) => f.file_id !== fileId && f.file_name.toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) throw new Error(`A file named "${trimmed}" already exists`);

    const newLang = detectLanguageFromFilename(trimmed);
    const updatedFiles = state.files.map((f) => {
      if (f.file_id === fileId) {
        return {
          ...f,
          file_name: trimmed,
          file_path: f.file_path.replace(/[^/]+$/, trimmed),
          language: newLang,
          updated_at: new Date().toISOString(),
        };
      }
      return f;
    });

    const updatedState: WorkspaceState = {
      ...state,
      files: updatedFiles,
      updated_at: new Date().toISOString(),
    };

    this.saveWorkspace(updatedState);
    return updatedState;
  }

  static deleteFile(state: WorkspaceState, fileId: string): WorkspaceState {
    const filtered = state.files.filter((f) => f.file_id !== fileId);
    let nextActiveId = state.active_file_id;

    if (state.active_file_id === fileId) {
      nextActiveId = filtered.length > 0 ? filtered[0].file_id : '';
    }

    const updatedState: WorkspaceState = {
      ...state,
      files: filtered,
      active_file_id: nextActiveId,
      updated_at: new Date().toISOString(),
    };

    this.saveWorkspace(updatedState);
    return updatedState;
  }

  /**
   * Section 5: Update in-memory file content and calculate dirty status
   */
  static updateFileContent(
    state: WorkspaceState,
    fileId: string,
    newContent: string
  ): WorkspaceState {
    const updatedFiles = state.files.map((f) => {
      if (f.file_id === fileId) {
        return {
          ...f,
          content: newContent,
          isDirty: newContent !== f.savedContent,
          updated_at: new Date().toISOString(),
        };
      }
      return f;
    });

    const updatedState: WorkspaceState = {
      ...state,
      files: updatedFiles,
      updated_at: new Date().toISOString(),
    };

    this.saveWorkspace(updatedState);
    return updatedState;
  }

  // --- Review History Local Persistence ---

  static saveReviewHistory(entry: ReviewHistoryEntry): void {
    try {
      const history = this.getReviewHistory();
      history.unshift(entry);
      // Keep recent 30 reviews
      const trimmed = history.slice(0, 30);
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(trimmed));
    } catch (e) {
      console.warn('Failed to save review history', e);
    }
  }

  static getReviewHistory(): ReviewHistoryEntry[] {
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse review history', e);
    }
    return [];
  }
}
