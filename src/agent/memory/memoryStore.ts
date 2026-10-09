/**
 * Team Memory Store
 * Manages validated decisions, accepted/rejected precedents, and recurring issues.
 */

import type { MemoryRecord, MemoryKnowledgeType, AuthorityLevel } from './memory.model';
import { MemoryModelValidator } from './memory.model';

export class TeamMemoryStore {
  private static records: Map<string, MemoryRecord> = new Map();

  static {
    // Seed initial historical precedents
    this.addRecord({
      memory_id: 'MEM-001',
      type: 'REJECTED_FEEDBACK',
      authority_level: 'ESTABLISHED_TEAM_RULE',
      rule_id: 'STYLE-REDUCE-01',
      file_pattern: 'src/utils/benchmark.ts',
      content: 'Imperative loops in serialization hot-paths are preserved for V8 performance.',
      developer_id: 'usr_lead_architect',
      developer_reason: 'Benchmark in PR-142 showed 3.2x higher throughput than Array.reduce.',
      occurrence_count: 1,
      is_permanent_rule: true,
      timestamp: '2026-03-10T15:20:00Z',
    });

    this.addRecord({
      memory_id: 'MEM-002',
      type: 'TEAM_DECISION',
      authority_level: 'ESTABLISHED_TEAM_RULE',
      rule_id: 'ARCH-DI-01',
      file_pattern: 'src/services/*.ts',
      content: 'Module singleton exports used instead of third-party IoC container decorators.',
      developer_id: 'usr_architecture_guild',
      developer_reason: 'Keeps runtime lightweight and avoids reflection overhead.',
      occurrence_count: 2,
      is_permanent_rule: true,
      timestamp: '2026-05-18T16:00:00Z',
    });
  }

  static addRecord(record: MemoryRecord): MemoryRecord {
    MemoryModelValidator.validateAuthority(record);
    this.records.set(record.memory_id, { ...record });
    return record;
  }

  static getRecords(): MemoryRecord[] {
    return Array.from(this.records.values());
  }

  static findRejection(ruleId: string, filePath: string): MemoryRecord | null {
    for (const r of this.records.values()) {
      if (r.type === 'REJECTED_FEEDBACK' && r.rule_id === ruleId) {
        if (r.file_pattern.endsWith('/*') || r.file_pattern.endsWith('*.ts')) {
          const prefix = r.file_pattern.replace(/\/\*.*$/, '');
          if (filePath.startsWith(prefix) || filePath.includes(prefix)) return r;
        } else if (r.file_pattern === filePath || filePath.endsWith(r.file_pattern)) {
          return r;
        }
      }
    }
    return null;
  }

  static findMatchingPrecedent(ruleId: string, filePath: string): MemoryRecord | null {
    for (const r of this.records.values()) {
      if (r.rule_id === ruleId) {
        if (filePath.includes(r.file_pattern) || r.file_pattern === filePath) {
          return r;
        }
      }
    }
    return null;
  }

  static clear(): void {
    this.records.clear();
  }
}
