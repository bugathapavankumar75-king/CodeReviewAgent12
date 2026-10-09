/**
 * Entity Architecture Scaffolder Modal
 * Generates 5-tier boilerplate (Model, Service, Controller, Route, Unit Test) for custom resources.
 */

import React, { useState } from 'react';
import { X, Sparkles, Copy, Check, FileCode, CheckCircle2 } from 'lucide-react';

interface ScaffolderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScaffolderModal: React.FC<ScaffolderModalProps> = ({ isOpen, onClose }) => {
  const [entityName, setEntityName] = useState<string>('Product');
  const [activeFileTab, setActiveFileTab] = useState<'model' | 'service' | 'controller' | 'route' | 'test'>('service');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const lower = entityName.toLowerCase();
  const plural = `${lower}s`;
  const singular = entityName;

  const generatedFiles = {
    model: `/**
 * ${singular} Model & Repository
 * Layer: src/models/${lower}.model.ts
 */

export interface ${singular} {
  id: string;
  name: string;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface Create${singular}Input {
  name: string;
}

class ${singular}Repository {
  private items: Map<string, ${singular}> = new Map();

  async findById(id: string): Promise<${singular} | null> {
    const item = this.items.get(id);
    return item ? { ...item } : null;
  }

  async findAll(): Promise<${singular}[]> {
    return Array.from(this.items.values());
  }

  async create(data: Create${singular}Input): Promise<${singular}> {
    const id = \`${lower.slice(0, 3)}_\${Date.now()}\`;
    const now = new Date().toISOString();
    const item: ${singular} = { id, name: data.name, status: 'active', createdAt: now, updatedAt: now };
    this.items.set(id, item);
    return { ...item };
  }
}

export const ${lower}Repository = new ${singular}Repository();`,

    service: `/**
 * ${singular} Business Service
 * Layer: src/services/${lower}.service.ts
 * Strictly independent of Express req/res.
 */

import { ${lower}Repository, type ${singular}, type Create${singular}Input } from '../models/${lower}.model';
import { ApiError } from '../utils/apiError';
import { logger } from '../utils/logger';

export class ${singular}Service {
  async getById(id: string): Promise<${singular}> {
    logger.info('SERVICE', '${singular}Service.getById: ' + id);
    const item = await ${lower}Repository.findById(id);
    if (!item) throw ApiError.notFound('${singular}', id);
    return item;
  }

  async create(input: Create${singular}Input): Promise<${singular}> {
    logger.info('SERVICE', '${singular}Service.create executing business rules');
    if (!input.name || input.name.trim().length < 2) {
      throw ApiError.badRequest('Name must have at least 2 characters');
    }
    return ${lower}Repository.create(input);
  }

  async list(): Promise<${singular}[]> {
    return ${lower}Repository.findAll();
  }
}

export const ${lower}Service = new ${singular}Service();`,

    controller: `/**
 * ${singular} Controller
 * Layer: src/controllers/${lower}.controller.ts
 */

import type { Request, Response } from 'express';
import { ${lower}Service } from '../services/${lower}.service';
import { ApiResponse } from '../utils/apiResponse';
import { Validator } from '../utils/validator';

export class ${singular}Controller {
  static async getItems(req: Request, res: Response) {
    const items = await ${lower}Service.list();
    return ApiResponse.success(res, items, '${singular} collection retrieved');
  }

  static async getById(req: Request, res: Response) {
    const item = await ${lower}Service.getById(req.params.id);
    return ApiResponse.success(res, item);
  }

  static async create(req: Request, res: Response) {
    const validated = Validator.validate(req.body, {
      name: [Validator.required(), Validator.string({ min: 2, max: 100 })],
    });
    const created = await ${lower}Service.create(validated as any);
    return ApiResponse.created(res, created, '${singular} successfully created');
  }
}`,

    route: `/**
 * ${singular} Express Routes
 * Layer: src/routes/${lower}.routes.ts
 */

import { Router } from 'express';
import { ${singular}Controller } from '../controllers/${lower}.controller';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.route('/')
  .get(asyncHandler(${singular}Controller.getItems))
  .post(asyncHandler(${singular}Controller.create));

router.route('/:id')
  .get(asyncHandler(${singular}Controller.getById));

export default router;

// To mount, add to src/routes/index.ts:
// import ${lower}Routes from './${lower}.routes';
// router.use('/${plural}', ${lower}Routes);`,

    test: `/**
 * ${singular} Service Unit Tests
 * Layer: tests/unit/${lower}.service.test.ts
 */

import { ${lower}Service } from '../../src/services/${lower}.service';
import { ApiError } from '../../src/utils/apiError';

describe('${singular}Service', () => {
  it('should validate entity creation constraints', async () => {
    const item = await ${lower}Service.create({ name: 'Valid Item' });
    expect(item.id).toBeDefined();
    expect(item.name).toBe('Valid Item');
  });

  it('should reject invalid input', async () => {
    await expect(${lower}Service.create({ name: '' })).rejects.toThrow(ApiError);
  });
});`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedFiles[activeFileTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-4xl rounded-xl border border-slate-800 bg-[#0f172a] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-sky-400" />
            <span className="text-sm font-semibold text-white">
              3-Tier Layer Scaffolder Generator
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Entity Name (PascalCase):
            </label>
            <input
              type="text"
              value={entityName}
              onChange={(e) => setEntityName(e.target.value.replace(/[^a-zA-Z]/g, ''))}
              placeholder="e.g. Product, Invoice, Customer, Ticket"
              className="w-full max-w-xs bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-sky-300 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Generated Tabs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs">
                {(['model', 'service', 'controller', 'route', 'test'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveFileTab(tab)}
                    className={`px-3 py-1 rounded capitalize font-medium transition-colors ${
                      activeFileTab === tab
                        ? 'bg-slate-800 text-sky-400 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-[#0b0f17] border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto max-h-[380px] leading-relaxed">
              {generatedFiles[activeFileTab]}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/40 flex items-center justify-between text-xs text-slate-400">
          <span>Generates clean decoupled architecture conforming to SRP.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
