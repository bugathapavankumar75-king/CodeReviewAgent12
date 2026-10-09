/**
 * Supported Programming Languages Configuration
 * Extensible catalog for the 13 initial languages and file extension associations.
 */

import type { SupportedLanguage } from './types';

export interface LanguageInfo {
  id: SupportedLanguage;
  name: string;
  extensions: string[];
  defaultExtension: string;
  commentPrefix: string;
  sampleCode: string;
}

export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, LanguageInfo> = {
  python: {
    id: 'python',
    name: 'Python',
    extensions: ['.py', '.pyw'],
    defaultExtension: '.py',
    commentPrefix: '#',
    sampleCode: `"""
Task Management Service - Python
Controller and Data Access Pattern
"""

from typing import Dict, Any, List

def calculate_priority_score(task: Dict[str, Any]) -> float:
    # Business logic for task weight
    base_weight = 1.0
    if task.get("priority") == "urgent":
        base_weight = 3.5
    elif task.get("priority") == "high":
        base_weight = 2.0
    return base_weight * float(task.get("estimate_hours", 1))

def get_tasks_by_project(project_id: str) -> List[Dict[str, Any]]:
    # Invariant: Project lookup must be validated
    if not project_id or len(project_id.strip()) == 0:
        raise ValueError("Invalid project identifier")
    return []
`,
  },
  typescript: {
    id: 'typescript',
    name: 'TypeScript',
    extensions: ['.ts', '.tsx'],
    defaultExtension: '.ts',
    commentPrefix: '//',
    sampleCode: `/**
 * User Controller - TypeScript
 * 3-Tier Layered Architecture Pattern
 */

import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { ApiResponse } from '../utils/apiResponse';
import { Validator } from '../utils/validator';

export class UserController {
  static async createUser(req: Request, res: Response) {
    const validated = Validator.validate(req.body, {
      name: [Validator.required(), Validator.string({ min: 2, max: 100 })],
      email: [Validator.required(), Validator.email()],
      role: [Validator.enum(['admin', 'developer', 'manager'])],
    });

    const user = await userService.createUser(validated as any);
    return ApiResponse.created(res, user, 'User successfully provisioned');
  }
}
`,
  },
  javascript: {
    id: 'javascript',
    name: 'JavaScript',
    extensions: ['.js', '.jsx', '.mjs', '.cjs'],
    defaultExtension: '.js',
    commentPrefix: '//',
    sampleCode: `/**
 * Authentication Helper - JavaScript (ES2022)
 */

export function verifyUserSession(token, secretKey) {
  if (!token || typeof token !== 'string') {
    throw new Error('Invalid authentication token provided');
  }
  // Validate token payload
  return { valid: true, userId: 'usr_1000' };
}
`,
  },
  java: {
    id: 'java',
    name: 'Java',
    extensions: ['.java'],
    defaultExtension: '.java',
    commentPrefix: '//',
    sampleCode: `package com.example.taskapi.service;

import java.util.Optional;

public class TaskService {
    public Optional<TaskDto> getTaskById(String taskId) {
        if (taskId == null || taskId.isBlank()) {
            throw new IllegalArgumentException("Task ID cannot be empty");
        }
        return Optional.empty();
    }
}
`,
  },
  c: {
    id: 'c',
    name: 'C',
    extensions: ['.c', '.h'],
    defaultExtension: '.c',
    commentPrefix: '//',
    sampleCode: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int process_task_buffer(const char *input_buffer, size_t len) {
    if (input_buffer == NULL || len == 0) {
        return -1;
    }
    printf("Processing buffer of size: %zu\\n", len);
    return 0;
}
`,
  },
  cpp: {
    id: 'cpp',
    name: 'C++',
    extensions: ['.cpp', '.hpp', '.cc', '.cxx', '.h'],
    defaultExtension: '.cpp',
    commentPrefix: '//',
    sampleCode: `#include <iostream>
#include <string>
#include <memory>

class TaskWorkflowEngine {
public:
    explicit TaskWorkflowEngine(std::string name) : engine_name(std::move(name)) {}
    
    bool validate_state_transition(const std::string& from_state, const std::string& to_state) const {
        return !from_state.empty() && !to_state.empty();
    }

private:
    std::string engine_name;
};
`,
  },
  csharp: {
    id: 'csharp',
    name: 'C#',
    extensions: ['.cs'],
    defaultExtension: '.cs',
    commentPrefix: '//',
    sampleCode: `namespace TaskApi.Controllers
{
    using System;
    using System.Threading.Tasks;

    public class TaskController
    {
        public async Task<string> GetTaskStatusAsync(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                throw new ArgumentException("ID is required", nameof(id));
            }
            await Task.Delay(10);
            return "Active";
        }
    }
}
`,
  },
  html: {
    id: 'html',
    name: 'HTML',
    extensions: ['.html', '.htm'],
    defaultExtension: '.html',
    commentPrefix: '<!--',
    sampleCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Task Dashboard</title>
</head>
<body>
  <main class="container">
    <h1>Project Tasks</h1>
    <section id="task-list"></section>
  </main>
</body>
</html>
`,
  },
  css: {
    id: 'css',
    name: 'CSS',
    extensions: ['.css'],
    defaultExtension: '.css',
    commentPrefix: '/*',
    sampleCode: `/* Task Management Studio Styles */
:root {
  --primary-accent: #38bdf8;
  --bg-slate: #0b0f17;
  --text-main: #f8fafc;
}

.task-card {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  border-radius: 0.5rem;
  background-color: var(--bg-slate);
}
`,
  },
  sql: {
    id: 'sql',
    name: 'SQL',
    extensions: ['.sql'],
    defaultExtension: '.sql',
    commentPrefix: '--',
    sampleCode: `-- PostgreSQL Migration Schema
CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(32) DEFAULT 'todo' NOT NULL,
    priority VARCHAR(32) DEFAULT 'medium' NOT NULL,
    estimate_hours NUMERIC(5,2) DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
`,
  },
  go: {
    id: 'go',
    name: 'Go',
    extensions: ['.go'],
    defaultExtension: '.go',
    commentPrefix: '//',
    sampleCode: `package main

import (
	"errors"
	"fmt"
)

type Task struct {
	ID     string
	Title  string
	Status string
}

func ValidateTask(t Task) error {
	if len(t.Title) < 3 {
		return errors.New("task title must be at least 3 characters")
	}
	return nil
}

func main() {
	fmt.Println("Task Engine initialized")
}
`,
  },
  rust: {
    id: 'rust',
    name: 'Rust',
    extensions: ['.rs'],
    defaultExtension: '.rs',
    commentPrefix: '//',
    sampleCode: `/// Task Entity and Validation in Rust
#[derive(Debug, Clone)]
pub struct Task {
    pub id: String,
    pub title: String,
    pub estimate_hours: f32,
}

impl Task {
    pub fn new(id: String, title: String, estimate_hours: f32) -> Result<Self, &'static str> {
        if title.trim().is_empty() {
            return Err("Title cannot be empty");
        }
        Ok(Self { id, title, estimate_hours })
    }
}
`,
  },
  php: {
    id: 'php',
    name: 'PHP',
    extensions: ['.php'],
    defaultExtension: '.php',
    commentPrefix: '//',
    sampleCode: `<?php

namespace App\\Controllers;

class TaskController
{
    public function getTask(string $id): array
    {
        if (empty(trim($id))) {
            throw new \\InvalidArgumentException("Task ID is required");
        }
        return ["id" => $id, "status" => "active"];
    }
}
`,
  },
};

export function detectLanguageFromFilename(fileName: string): SupportedLanguage {
  const lower = fileName.toLowerCase();
  for (const lang of Object.values(SUPPORTED_LANGUAGES)) {
    for (const ext of lang.extensions) {
      if (lower.endsWith(ext)) {
        return lang.id;
      }
    }
  }
  return 'typescript';
}
