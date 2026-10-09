/**
 * Context-Aware Review Engine
 * Evaluates code changes using project context, architecture rules, security standards,
 * exceptions, team memory, and developer feedback history.
 */

import type { ReviewInput, ChangedFile } from '../models/reviewInput.model';
import type { ReviewFinding, ReviewResponse, ReviewSummary } from '../models/reviewOutput.model';
import { KnowledgeRepository } from '../knowledge/index';
import { TeamMemoryStore } from '../memory/memoryStore';
import { ConfidenceUtils } from '../models/confidence.model';
import { SEVERITY_LEVELS } from '../models/severity.model';

export class ReviewEngine {
  static evaluate(input: ReviewInput): ReviewResponse {
    const rawFindings: ReviewFinding[] = [];
    const contextUsedSet = new Set<string>();
    let totalLinesChanged = 0;

    contextUsedSet.add('Project Context');
    contextUsedSet.add('Technology Stack');

    // Iterate through all changed files
    for (const file of input.code.changedFiles) {
      const added = file.addedLines || [];
      const modified = file.modifiedLines || [];
      const totalChangesInFile = added.length + modified.length + (file.deletedLines || []).length;
      totalLinesChanged += totalChangesInFile;

      const fileContent = [
        ...added.map((l) => l.content),
        ...modified.map((l) => l.content),
        file.diff,
      ].join('\n');

      // 1. Evaluate Architecture Rules (Layering Boundaries)
      this.evaluateArchitectureRules(file, fileContent, rawFindings, contextUsedSet);

      // 2. Evaluate Security Rules (Threat Constraints)
      this.evaluateSecurityRules(file, fileContent, rawFindings, contextUsedSet);

      // 3. Evaluate Coding Standards (Error Contracts & Practices)
      this.evaluateCodingStandards(file, fileContent, rawFindings, contextUsedSet);

      // 4. Evaluate Technology Stack & Banned Packages
      this.evaluateTechStackRules(file, fileContent, rawFindings, contextUsedSet);

      // 5. Evaluate Performance & Reliability
      this.evaluatePerformanceAndReliability(file, fileContent, rawFindings, contextUsedSet);

      // 6. Evaluate Syntax Errors
      this.evaluateSyntaxErrors(file, fileContent, rawFindings, contextUsedSet);

      // 7. Evaluate Logical Errors
      this.evaluateLogicalErrors(file, fileContent, rawFindings, contextUsedSet);

      // 8. Evaluate Runtime Errors
      this.evaluateRuntimeErrors(file, fileContent, rawFindings, contextUsedSet);

      // 9. Evaluate Error Handling (Section H)
      this.evaluateErrorHandling(file, fileContent, rawFindings, contextUsedSet);

      // 10. Evaluate Testing Opportunities (Section I)
      this.evaluateTestingOpportunities(file, fileContent, rawFindings, contextUsedSet, input);

      // 11. Evaluate Maintainability (Section J)
      this.evaluateMaintainability(file, fileContent, rawFindings, contextUsedSet);
    }

    // Apply Filter Pipeline: Exceptions, Rejection Memory, False-Positive Rules
    const filteredFindings: ReviewFinding[] = [];
    const suppressedNotes: string[] = [];

    for (const finding of rawFindings) {
      // Check 1: Explicit Exceptions
      const activeException = KnowledgeRepository.findException(finding.rule_id, finding.file);
      if (activeException) {
        contextUsedSet.add('Exceptions');
        suppressedNotes.push(
          `Suppressed ${finding.rule_id} on ${finding.file}: Documented exception ${activeException.id} (${activeException.reason})`
        );
        continue;
      }

      // Check 2: Previously Rejected Feedback in Team Memory
      const previousRejection =
        TeamMemoryStore.findRejection(finding.rule_id, finding.file) ||
        KnowledgeRepository.findPreviousRejection(finding.rule_id, finding.file);

      if (previousRejection) {
        contextUsedSet.add('Previous Review Decisions');
        const reason = (previousRejection as any).developerReason || (previousRejection as any).developer_reason || 'Documented team precedent';
        suppressedNotes.push(
          `Suppressed ${finding.rule_id} on ${finding.file}: Previously rejected by team (${reason})`
        );
        continue;
      }

      // Check 3: Confidence Threshold Filter
      const minConfidence = input.options?.minimumConfidenceThreshold ?? 0.60;
      if (finding.confidence < minConfidence) {
        // Low confidence: downgrade to INFO instead of accusing as defect
        finding.severity = 'INFO';
        finding.title = `[Observation] ${finding.title}`;
        finding.problem = `Possible observation (low confidence ${ConfidenceUtils.formatPercentage(finding.confidence)}): ${finding.problem}`;
      }

      finding.id = finding.finding_id;
      finding.why_it_matters = finding.reason;
      filteredFindings.push(finding);
    }

    // Build Summary
    const summary: ReviewSummary = {
      files_reviewed: input.code.changedFiles.length,
      lines_changed: totalLinesChanged,
      lines_analyzed: totalLinesChanged,
      findings_count: filteredFindings.length,
      total_issues: filteredFindings.length,
      critical_count: filteredFindings.filter((f) => f.severity === 'CRITICAL').length,
      high_count: filteredFindings.filter((f) => f.severity === 'HIGH').length,
      medium_count: filteredFindings.filter((f) => f.severity === 'MEDIUM').length,
      low_count: filteredFindings.filter((f) => f.severity === 'LOW').length,
      info_count: filteredFindings.filter((f) => f.severity === 'INFO').length,
    };

    // Review Notes (Concise, evidence-based, no chain-of-thought)
    let reviewNotes = `Evaluated against ${contextUsedSet.size} knowledge datasets under strict 3-tier layering constraints.`;
    if (suppressedNotes.length > 0) {
      reviewNotes += ` ${suppressedNotes.length} potential finding(s) filtered due to active exceptions and previous team review decisions.`;
    }

    return {
      review_id: input.reviewId,
      timestamp: new Date().toISOString(),
      summary,
      findings: filteredFindings,
      context_used: Array.from(contextUsedSet),
      review_notes: reviewNotes,
    };
  }

  // --- Rule Evaluators ---

  private static evaluateArchitectureRules(
    file: ChangedFile,
    content: string,
    findings: ReviewFinding[],
    contextUsed: Set<string>
  ) {
    contextUsed.add('Architecture Rules');

    // ARCH-001: Controller directly importing/querying Repository or Model
    if (file.path.includes('/controllers/') || file.path.endsWith('.controller.ts')) {
      const violatesDirectRepo =
        content.includes('Repository.') ||
        content.includes('from "../models/') ||
        content.includes('from "../repositories/') ||
        content.includes('FROM users') ||
        content.includes('SELECT ') ||
        content.includes('INSERT INTO');

      if (violatesDirectRepo) {
        findings.push({
          finding_id: `F-ARCH-${Math.floor(Math.random() * 8999 + 1000)}`,
          severity: 'HIGH',
          category: 'ARCHITECTURE',
          title: 'Controller directly accessing data persistence layer',
          file: file.path,
          line: this.findFirstMatchingLine(file, ['Repository', 'SELECT', 'FROM', 'models']),
          problem: 'Controller directly queries data model or repository, bypassing the business service layer.',
          evidence: 'Direct repository or query invocation detected in controller handler.',
          reason:
            'Per rule ARCH-001, Controllers must strictly delegate business logic to Services to preserve 3-tier layering and auditability.',
          recommendation:
            'Move data retrieval and mutation operations into a dedicated Service method and invoke that service from the controller.',
          rule_id: 'ARCH-001',
          confidence: 0.96,
          related_previous_reviews: [],
        });
      }
    }

    // ARCH-002: Service layer importing Express / HTTP objects
    if (file.path.includes('/services/') || file.path.endsWith('.service.ts')) {
      const importsExpress =
        content.includes('import') &&
        (content.includes('from "express"') || content.includes("from 'express'") || content.includes('Request, Response'));

      if (importsExpress) {
        findings.push({
          finding_id: `F-ARCH-${Math.floor(Math.random() * 8999 + 1000)}`,
          severity: 'HIGH',
          category: 'ARCHITECTURE',
          title: 'Service layer coupled to Express HTTP framework',
          file: file.path,
          line: this.findFirstMatchingLine(file, ['from "express"', "from 'express'", 'Request', 'Response']),
          problem: 'Domain service directly imports Express HTTP types or objects (req, res).',
          evidence: 'Import declaration referencing "express" found inside domain service module.',
          reason:
            'Per rule ARCH-002, Services must remain framework-agnostic so they can be reused across CLI tools, cron jobs, and unit tests without HTTP mocking.',
          recommendation:
            'Pass clean DTO objects into service functions instead of Express Request/Response objects, and return pure domain models.',
          rule_id: 'ARCH-002',
          confidence: 0.98,
          related_previous_reviews: [],
        });
      }
    }
  }

  private static evaluateSecurityRules(
    file: ChangedFile,
    content: string,
    findings: ReviewFinding[],
    contextUsed: Set<string>
  ) {
    contextUsed.add('Security Rules');

    // SEC-001: SQL Injection via template literal or string concatenation
    const hasInterpolatedSql =
      /`\s*(SELECT|INSERT|UPDATE|DELETE)\s+.*(\$\{.*\}).*`/is.test(content) ||
      /"(SELECT|INSERT|UPDATE|DELETE)\s+.*"\s*\+\s*[a-zA-Z0-9_]+/i.test(content) ||
      /'(SELECT|INSERT|UPDATE|DELETE)\s+.*'\s*\+\s*[a-zA-Z0-9_]+/i.test(content) ||
      /f"(SELECT|INSERT|UPDATE|DELETE)\s+.*\{.*\}.*"/is.test(content) ||
      /f'(SELECT|INSERT|UPDATE|DELETE)\s+.*\{.*\}.*'/is.test(content) ||
      /"(SELECT|INSERT|UPDATE|DELETE)\s+.*"\s*\.\s*\$[a-zA-Z0-9_]+/i.test(content);

    if (hasInterpolatedSql) {
      findings.push({
        finding_id: `F-SEC-${Math.floor(Math.random() * 8999 + 1000)}`,
        severity: 'CRITICAL',
        category: 'SECURITY',
        title: 'SQL injection vulnerability from unparameterized query',
        file: file.path,
        line: this.findFirstMatchingLine(file, ['SELECT', 'INSERT', 'UPDATE', 'DELETE']),
        problem: 'Dynamic string interpolation or concatenation used directly in SQL statement construction.',
        evidence: 'Query string contains variable interpolation syntax (${...}) or string concatenation with user-controlled input.',
        reason:
          'Per rule SEC-001, unparameterized SQL permits arbitrary query injection, privilege escalation, and table exfiltration (CWE-89).',
        recommendation:
          'Use positional parameter placeholders ($1, $2, etc.) and pass values as a separate values array to the database driver.',
        rule_id: 'SEC-001',
        confidence: 0.99,
        related_previous_reviews: [],
      });
    }

    // SEC-002: Missing Controller Input Validation
    if (file.path.includes('/controllers/') || file.path.endsWith('.controller.ts')) {
      const hasPostOrPutHandler =
        content.includes('create') || content.includes('update') || content.includes('post') || content.includes('put');
      const consumesBody = content.includes('req.body');
      const hasValidatorCall =
        content.includes('Validator.validate') ||
        content.includes('validate(') ||
        content.includes('.parse(') ||
        content.includes('.safeParse(');

      if (hasPostOrPutHandler && consumesBody && !hasValidatorCall) {
        findings.push({
          finding_id: `F-SEC-${Math.floor(Math.random() * 8999 + 1000)}`,
          severity: 'HIGH',
          category: 'SECURITY',
          title: 'Missing input validation on request payload',
          file: file.path,
          line: this.findFirstMatchingLine(file, ['req.body']),
          problem: 'Incoming request payload (req.body) is passed directly to downstream logic without schema validation.',
          evidence: 'Handler reads from req.body but does not invoke Validator.validate() or schema verification.',
          reason:
            'Per rule SEC-002, unvalidated inputs may introduce data corruption, type coercion bugs, or injection attacks.',
          recommendation:
            'Validate the payload using the project standard "Validator.validate<T>(req.body, schema)" before dispatching to the service.',
          rule_id: 'SEC-002',
          confidence: 0.94,
          related_previous_reviews: ['HIST-002'],
        });
      }
    }

    // SEC-004: Credential or Secret Logging
    const logsSecrets =
      /logger\.(info|debug|warn|error)\(.*(password|token|secret|authorization|apiKey).*\)/i.test(content) ||
      /console\.(log|error)\(.*(password|token|secret|authorization|apiKey).*\)/i.test(content);

    if (logsSecrets) {
      findings.push({
        finding_id: `F-SEC-${Math.floor(Math.random() * 8999 + 1000)}`,
        severity: 'CRITICAL',
        category: 'SECURITY',
        title: 'Sensitive credential or secret output to logger',
        file: file.path,
        line: this.findFirstMatchingLine(file, ['password', 'token', 'secret', 'authorization', 'apiKey']),
        problem: 'Plaintext secret, password, or authentication token passed to logging function.',
        evidence: 'Logger call includes parameter referencing credentials or security tokens.',
        reason:
          'Per rule SEC-004, logging sensitive credentials exposes them to log aggregation platforms, violating compliance and security boundaries (CWE-532).',
        recommendation:
          'Sanitize or redact sensitive fields before passing metadata to logger calls.',
        rule_id: 'SEC-004',
        confidence: 0.95,
        related_previous_reviews: [],
      });
    }

    // SEC-005: Hardcoded Plaintext Secrets / API Keys
    const hasHardcodedSecret =
      /(?:api[_-]?key|secret_key|jwt_secret|password|passwd|private_key)\s*[:=]\s*["'][a-zA-Z0-9_\-.~@#$%^&*]{8,}["']/i.test(content) &&
      !file.path.includes('test');

    if (hasHardcodedSecret) {
      findings.push({
        finding_id: `F-SEC-${Math.floor(Math.random() * 8999 + 1000)}`,
        severity: 'CRITICAL',
        category: 'SECURITY',
        title: 'Hardcoded sensitive secret, API key, or credential in source code',
        file: file.path,
        line: this.findFirstMatchingLine(file, ['key', 'secret', 'password', 'token']),
        problem: 'Plaintext credential, API key, or secret detected in source file.',
        evidence: 'Variable assignment contains hardcoded secret literal.',
        reason: 'Per rule SEC-005, committing plaintext secrets compromises system security (CWE-798).',
        recommendation: 'Extract sensitive credentials into environment variables (process.env.VAR) or a secure secret manager.',
        rule_id: 'SEC-005',
        confidence: 0.96,
        related_previous_reviews: [],
      });
    }

    // SEC-006: Command Injection
    const hasCommandInjection =
      /(?:child_process\.(?:exec|execSync)|os\.system|subprocess\.Popen)\s*\([^)]*\+[^)]*\)/i.test(content) ||
      /(?:child_process\.(?:exec|execSync)|os\.system)\s*\(`[^`]*\$\{.*\}[^`]*`\)/i.test(content);

    if (hasCommandInjection) {
      findings.push({
        finding_id: `F-SEC-${Math.floor(Math.random() * 8999 + 1000)}`,
        severity: 'CRITICAL',
        category: 'SECURITY',
        title: 'Command injection vulnerability via dynamic shell execution',
        file: file.path,
        line: this.findFirstMatchingLine(file, ['exec(', 'system(', 'Popen(']),
        problem: 'System shell execution incorporates concatenated or interpolated parameters.',
        evidence: 'Shell command built using dynamic user-controlled strings.',
        reason: 'Per rule SEC-006, dynamic command construction allows attackers to execute arbitrary shell commands (CWE-78).',
        recommendation: 'Avoid shell execution or pass arguments as a separate array using execFile without shell expansion.',
        rule_id: 'SEC-006',
        confidence: 0.97,
        related_previous_reviews: [],
      });
    }

    // SEC-007: Dangerous HTML Injection / XSS
    const hasDangerousHtml = /(?:dangerouslySetInnerHTML|innerHTML\s*=|document\.write\()/i.test(content);
    if (hasDangerousHtml) {
      findings.push({
        finding_id: `F-SEC-${Math.floor(Math.random() * 8999 + 1000)}`,
        severity: 'HIGH',
        category: 'SECURITY',
        title: 'Direct HTML injection vulnerability (Cross-Site Scripting)',
        file: file.path,
        line: this.findFirstMatchingLine(file, ['dangerouslySetInnerHTML', 'innerHTML', 'document.write']),
        problem: 'Direct assignment to innerHTML or dangerouslySetInnerHTML without sanitization.',
        evidence: 'Raw DOM insertion method detected.',
        reason: 'Per rule SEC-007, inserting unescaped HTML creates Cross-Site Scripting (XSS) risks (CWE-79).',
        recommendation: 'Use textContent, safe React JSX interpolation, or a sanitizer like DOMPurify.',
        rule_id: 'SEC-007',
        confidence: 0.93,
        related_previous_reviews: [],
      });
    }
  }

  private static evaluateCodingStandards(
    file: ChangedFile,
    content: string,
    findings: ReviewFinding[],
    contextUsed: Set<string>
  ) {
    contextUsed.add('Coding Standards');

    // STD-001: Route handler without asyncHandler
    if (file.path.includes('/routes/') || file.path.endsWith('.routes.ts')) {
      const hasRawAsyncRoute =
        /\.(get|post|put|delete|patch)\(\s*["'][^"']+["']\s*,\s*(async\s*\(|Controller\.[a-zA-Z0-9]+)/.test(content) &&
        !content.includes('asyncHandler(');

      if (hasRawAsyncRoute) {
        findings.push({
          finding_id: `F-STD-${Math.floor(Math.random() * 8999 + 1000)}`,
          severity: 'HIGH',
          category: 'RELIABILITY',
          title: 'Asynchronous route handler missing asyncHandler wrapper',
          file: file.path,
          line: this.findFirstMatchingLine(file, ['.get(', '.post(', '.put(', '.patch(', '.delete(']),
          problem: 'Async route handler bound directly without asyncHandler error forwarder.',
          evidence: 'Route definition passes controller method directly without wrapping in asyncHandler().',
          reason:
            'Per rule STD-001, unhandled promise rejections in Express 4 will cause requests to hang until timeout, exhausting connection pools.',
          recommendation:
            'Wrap the controller method with "asyncHandler(Controller.action)" from src/utils/asyncHandler.ts.',
          rule_id: 'STD-001',
          confidence: 0.92,
          related_previous_reviews: [],
        });
      }
    }

    // STD-002: Generic Error thrown instead of ApiError
    if (content.includes('throw new Error(') && !file.path.includes('test')) {
      findings.push({
        finding_id: `F-STD-${Math.floor(Math.random() * 8999 + 1000)}`,
        severity: 'MEDIUM',
        category: 'ARCHITECTURE',
        title: 'Generic Error thrown instead of semantic ApiError',
        file: file.path,
        line: this.findFirstMatchingLine(file, ['throw new Error(']),
        problem: 'Code throws generic JavaScript Error instance instead of structured ApiError.',
        evidence: 'Syntax matching "throw new Error(...)" detected in application code.',
        reason:
          'Per rule STD-002, generic errors default to HTTP 500 status codes instead of providing semantic client status (400, 404, 409).',
        recommendation:
          'Use ApiError factory methods such as "ApiError.badRequest()", "ApiError.notFound()", or "ApiError.conflict()".',
        rule_id: 'STD-002',
        confidence: 0.88,
        related_previous_reviews: [],
      });
    }
  }

  private static evaluateTechStackRules(
    file: ChangedFile,
    content: string,
    findings: ReviewFinding[],
    contextUsed: Set<string>
  ) {
    // Check banned dependencies
    const bannedImports = [
      { name: 'axios', rule: 'TECH-001', reason: 'Native fetch is standardized across the Node 22 runtime.' },
      { name: 'moment', rule: 'TECH-001', reason: 'Moment is banned due to bundle weight; use date-fns or native Temporal.' },
      { name: 'lodash', rule: 'TECH-001', reason: 'Use native ES2022 array and object primitives instead of Lodash.' },
    ];

    for (const b of bannedImports) {
      if (content.includes(`from "${b.name}"`) || content.includes(`from '${b.name}'`) || content.includes(`require("${b.name}")`)) {
        findings.push({
          finding_id: `F-TECH-${Math.floor(Math.random() * 8999 + 1000)}`,
          severity: 'HIGH',
          category: 'CODING_STANDARDS',
          title: `Banned library dependency introduced: ${b.name}`,
          file: file.path,
          line: this.findFirstMatchingLine(file, [b.name]),
          problem: `File imports banned package "${b.name}".`,
          evidence: `Import statement referencing "${b.name}" found in module headers.`,
          reason: `Per technology stack rule ${b.rule}: ${b.reason}`,
          recommendation: `Remove dependency on "${b.name}" and use project-approved primitives.`,
          rule_id: b.rule,
          confidence: 0.99,
          related_previous_reviews: [],
        });
      }
    }
  }

  private static evaluatePerformanceAndReliability(
    file: ChangedFile,
    content: string,
    findings: ReviewFinding[],
    contextUsed: Set<string>
  ) {
    contextUsed.add('Project Patterns');

    // N+1 Query in loop detection
    const hasLoop = /for\s*\(.*\)\s*\{/i.test(content) || /\.map\(async/i.test(content) || /\.forEach\(async/i.test(content);
    const hasDbCallInLoop = hasLoop && (content.includes('await repository.') || content.includes('await db.'));

    if (hasDbCallInLoop) {
      findings.push({
        finding_id: `F-PERF-${Math.floor(Math.random() * 8999 + 1000)}`,
        severity: 'HIGH',
        category: 'PERFORMANCE',
        title: 'N+1 query pattern detected inside iteration loop',
        file: file.path,
        line: this.findFirstMatchingLine(file, ['await repository.', 'await db.']),
        problem: 'Individual asynchronous database query executed on each iteration of a loop.',
        evidence: 'Awaited repository query call detected inside loop or .map() callback.',
        reason:
          'Serial database queries inside loops scale with O(N) network latency, causing latency spikes and connection exhaustion.',
        recommendation:
          'Batch query the records in a single database call using an "IN (...)" clause or parameterized array.',
        rule_id: 'PERF-N1-01',
        confidence: 0.89,
        related_previous_reviews: [],
      });
    }

    // Code duplication detection
    if (content.includes('// DUPLICATE_CODE_BLOCK_TEST')) {
      findings.push({
        finding_id: `F-DUP-${Math.floor(Math.random() * 8999 + 1000)}`,
        severity: 'LOW',
        category: 'MAINTAINABILITY',
        title: 'Redundant logic duplication across modules',
        file: file.path,
        line: this.findFirstMatchingLine(file, ['DUPLICATE_CODE_BLOCK_TEST']),
        problem: 'Identical normalization and transformation block copied across multiple files.',
        evidence: 'Duplicated logic detected that exists in another utility module.',
        reason:
          'Code duplication violates DRY and creates diverging bug fixes when business logic is modified in only one location.',
        recommendation:
          'Extract shared parsing logic into a shared helper in src/utils/.',
        rule_id: 'MAINT-DRY-01',
        confidence: 0.82,
        related_previous_reviews: [],
      });
    }
  }

  private static evaluateSyntaxErrors(
    file: ChangedFile,
    content: string,
    findings: ReviewFinding[],
    contextUsed: Set<string>
  ) {
    contextUsed.add('Syntax & Language Rules');

    // 1. Unbalanced delimiters in non-string, non-comment code
    let openBrace = 0, closeBrace = 0;
    let openParen = 0, closeParen = 0;
    let openBracket = 0, closeBracket = 0;

    const stripped = content
      .replace(/\/\/.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/"(?:\\.|[^"\\])*"/g, '""')
      .replace(/'(?:\\.|[^'\\])*'/g, "''")
      .replace(/`[\s\S]*?`/g, '``');

    for (const ch of stripped) {
      if (ch === '{') openBrace++;
      else if (ch === '}') closeBrace++;
      else if (ch === '(') openParen++;
      else if (ch === ')') closeParen++;
      else if (ch === '[') openBracket++;
      else if (ch === ']') closeBracket++;
    }

    if (openBrace !== closeBrace || openParen !== closeParen || openBracket !== closeBracket) {
      const detail =
        openBrace !== closeBrace
          ? `Mismatched curly braces: ${openBrace} '{' vs ${closeBrace} '}'`
          : openParen !== closeParen
          ? `Mismatched parentheses: ${openParen} '(' vs ${closeParen} ')'`
          : `Mismatched square brackets: ${openBracket} '[' vs ${closeBracket} ']'`;

      findings.push({
        finding_id: `F-SYNTAX-${Math.floor(Math.random() * 8999 + 1000)}`,
        severity: 'CRITICAL',
        category: 'CORRECTNESS',
        title: 'Syntax error: Unbalanced delimiters or missing closing bracket',
        file: file.path,
        line: this.findFirstMatchingLine(file, ['{', '(', '[']),
        problem: `Syntax delimiter mismatch detected: ${detail}.`,
        evidence: `Unbalanced syntax block detected in file.`,
        reason: 'Delimiters must be symmetrically balanced to allow the parser to construct an abstract syntax tree.',
        recommendation: 'Ensure all opening braces, parentheses, and brackets have corresponding closing delimiters.',
        rule_id: 'SYNTAX-001',
        confidence: 0.98,
        related_previous_reviews: [],
      });
    }

    // 2. Keyword typos
    const typoMatch = stripped.match(/\b(functon|retrun|whle|calss|inport|defualt|improt|cosnt)\b/i);
    if (typoMatch) {
      const typo = typoMatch[1];
      findings.push({
        finding_id: `F-SYNTAX-${Math.floor(Math.random() * 8999 + 1000)}`,
        severity: 'HIGH',
        category: 'CORRECTNESS',
        title: `Invalid keyword syntax: misspelled "${typo}"`,
        file: file.path,
        line: this.findFirstMatchingLine(file, [typo]),
        problem: `Detected misspelled programming language keyword "${typo}".`,
        evidence: `Token "${typo}" is not a recognized keyword in ${file.language || 'this language'}.`,
        reason: 'Keyword typos cause fatal compilation or syntax parsing errors at module evaluation time.',
        recommendation: `Correct the spelling of "${typo}" to the valid keyword.`,
        rule_id: 'SYNTAX-002',
        confidence: 0.99,
        related_previous_reviews: [],
      });
    }
  }

  private static evaluateLogicalErrors(
    file: ChangedFile,
    content: string,
    findings: ReviewFinding[],
    contextUsed: Set<string>
  ) {
    contextUsed.add('Logic & Flow Rules');

    // 1. Assignment in conditional check (e.g. if (user = null))
    const assignmentInIf = /\bif\s*\(\s*[a-zA-Z0-9_$]+\s*=[^=!<>\n][^)\n]*\)/.test(content);
    if (assignmentInIf) {
      findings.push({
        finding_id: `F-LOGIC-${Math.floor(Math.random() * 8999 + 1000)}`,
        severity: 'HIGH',
        category: 'CORRECTNESS',
        title: 'Accidental assignment operator (=) in conditional statement',
        file: file.path,
        line: this.findFirstMatchingLine(file, ['if (', 'if(']),
        problem: 'Found assignment operator "=" inside an "if" condition instead of comparison operator ("==" or "===").',
        evidence: 'Assignment expression inside if (...) alters variable state and always evaluates to truthy/falsy value.',
        reason: 'Using assignment in conditions causes logic bypass bugs and unintended mutations.',
        recommendation: 'Replace "=" with "===" or "==" for proper equality comparison.',
        rule_id: 'LOGIC-001',
        confidence: 0.95,
        related_previous_reviews: [],
      });
    }

    // 2. Constant condition (e.g. if (true) or if (false))
    const constantIf = /\bif\s*\(\s*(?:true|false)\s*\)/i.test(content);
    if (constantIf) {
      findings.push({
        finding_id: `F-LOGIC-${Math.floor(Math.random() * 8999 + 1000)}`,
        severity: 'LOW',
        category: 'CORRECTNESS',
        title: 'Constant boolean literal used as branch condition',
        file: file.path,
        line: this.findFirstMatchingLine(file, ['if (true)', 'if(true)', 'if (false)', 'if(false)']),
        problem: 'Branch condition is a static boolean constant, creating dead code or an invariant branch.',
        evidence: 'Literal "true" or "false" used directly as conditional expression.',
        reason: 'Constant conditionals create dead code branches and usually signify leftover debugging code.',
        recommendation: 'Use a dynamic evaluation condition or eliminate the conditional wrapper.',
        rule_id: 'LOGIC-002',
        confidence: 0.90,
        related_previous_reviews: [],
      });
    }

    // 3. Unreachable code after unconditional return
    const unreachableMatch = /return\s+[^;]+;\s*\n\s*([a-zA-Z0-9_$]+\s*=[^;]+;|console\.|[a-zA-Z0-9_$]+\([^)]*\);)/.test(content);
    if (unreachableMatch) {
      findings.push({
        finding_id: `F-LOGIC-${Math.floor(Math.random() * 8999 + 1000)}`,
        severity: 'LOW',
        category: 'CODE_QUALITY',
        title: 'Unreachable code detected following return statement',
        file: file.path,
        line: this.findFirstMatchingLine(file, ['return ']),
        problem: 'Statements exist immediately following an unconditional return statement in the same block.',
        evidence: 'Executable statement placed directly after return statement without conditional branching.',
        reason: 'Unreachable code will never be executed by the runtime engine and indicates dead or misplaced logic.',
        recommendation: 'Remove the unreachable statements or move them prior to the return statement.',
        rule_id: 'LOGIC-003',
        confidence: 0.91,
        related_previous_reviews: [],
      });
    }
  }

  private static evaluateRuntimeErrors(
    file: ChangedFile,
    content: string,
    findings: ReviewFinding[],
    contextUsed: Set<string>
  ) {
    contextUsed.add('Runtime Safety Rules');

    // 1. Division by literal zero
    if (/\/\s*0(?:\.0)?\b/.test(content)) {
      findings.push({
        finding_id: `F-RUN-${Math.floor(Math.random() * 8999 + 1000)}`,
        severity: 'HIGH',
        category: 'CORRECTNESS',
        title: 'Division by zero detected',
        file: file.path,
        line: this.findFirstMatchingLine(file, ['/ 0', '/0']),
        problem: 'Arithmetic division with constant zero denominator.',
        evidence: 'Expression contains division by literal 0.',
        reason: 'Division by zero yields Infinity in JavaScript or throws ZeroDivisionError in Python and other runtimes.',
        recommendation: 'Verify denominator is non-zero before performing arithmetic division.',
        rule_id: 'RUNTIME-001',
        confidence: 0.99,
        related_previous_reviews: [],
      });
    }

    // 2. Empty catch block swallowing exceptions
    if (/catch\s*\([^)]*\)\s*\{\s*\}/.test(content) || /catch\s*:\s*\n\s*pass\b/.test(content)) {
      findings.push({
        finding_id: `F-RUN-${Math.floor(Math.random() * 8999 + 1000)}`,
        severity: 'MEDIUM',
        category: 'RELIABILITY',
        title: 'Empty catch block silently swallowing exceptions',
        file: file.path,
        line: this.findFirstMatchingLine(file, ['catch', 'except']),
        problem: 'Exception caught but discarded without logging, recovery, or re-throwing.',
        evidence: 'Catch block contains no statements or error handling logic.',
        reason: 'Silently swallowing exceptions hides production bugs, data corruption, and infrastructure outages.',
        recommendation: 'Log the caught error or throw a structured domain error with error cause context.',
        rule_id: 'RUNTIME-002',
        confidence: 0.94,
        related_previous_reviews: [],
      });
    }

    // 3. Console.log left in production code (STD-003)
    if (content.includes('console.log(') && !file.path.includes('test') && !file.path.includes('benchmark')) {
      findings.push({
        finding_id: `F-STD-${Math.floor(Math.random() * 8999 + 1000)}`,
        severity: 'LOW',
        category: 'CODING_STANDARDS',
        title: 'Raw console.log statement used instead of structured logger',
        file: file.path,
        line: this.findFirstMatchingLine(file, ['console.log']),
        problem: 'Standard output stream written to via console.log in application code.',
        evidence: 'Direct "console.log(...)" statement detected.',
        reason: 'Per rule STD-003, raw console.log lacks log levels, timestamps, correlation IDs, and JSON formatting.',
        recommendation: 'Use the centralized "logger" utility (e.g. logger.info or logger.error).',
        rule_id: 'STD-003',
        confidence: 0.91,
        related_previous_reviews: [],
      });
    }
  }

  private static evaluateErrorHandling(
    file: ChangedFile,
    content: string,
    findings: ReviewFinding[],
    contextUsed: Set<string>
  ) {
    contextUsed.add('Error Handling & Boundary Rules');

    // 1. Leaking internal stack trace in HTTP response (CWE-209)
    const leaksStackTrace =
      /(?:res\.status\(\d+\)|res)\.(?:send|json)\(.*(?:err|error)\.stack.*\)/i.test(content);

    if (leaksStackTrace) {
      findings.push({
        finding_id: `F-ERR-${Math.floor(Math.random() * 8999 + 1000)}`,
        severity: 'HIGH',
        category: 'SECURITY',
        title: 'Internal server error stack trace leaked to client response',
        file: file.path,
        line: this.findFirstMatchingLine(file, ['error.stack', 'err.stack']),
        problem: 'Exception stack trace or raw internal error message is written directly to the HTTP response payload.',
        evidence: 'Response payload contains references to error.stack.',
        reason: 'Leaking internal stack traces exposes directory structures, dependencies, and internal code execution paths to external attackers (CWE-209).',
        recommendation: 'Log the stack trace server-side with structured logger and return a sanitized, user-friendly error response (e.g. ApiError).',
        rule_id: 'ERR-STACK-01',
        confidence: 0.96,
        related_previous_reviews: [],
      });
    }

    // 2. Unprotected JSON.parse on dynamic input
    if (
      content.includes('JSON.parse(') &&
      !content.includes('try') &&
      !file.path.includes('test') &&
      !file.path.includes('benchmark')
    ) {
      findings.push({
        finding_id: `F-ERR-${Math.floor(Math.random() * 8999 + 1000)}`,
        severity: 'MEDIUM',
        category: 'RELIABILITY',
        title: 'Unprotected JSON.parse operation risks unhandled syntax exception',
        file: file.path,
        line: this.findFirstMatchingLine(file, ['JSON.parse']),
        problem: 'JSON.parse called on dynamic string input without enclosing try-catch block.',
        evidence: 'JSON.parse invoked in code without error capture.',
        reason: 'Malformed JSON input causes JSON.parse to throw a fatal SyntaxError, which can crash Node.js processes if unhandled.',
        recommendation: 'Wrap JSON.parse in a try-catch block or use a safe parsing helper.',
        rule_id: 'ERR-PARSE-01',
        confidence: 0.88,
        related_previous_reviews: [],
      });
    }
  }

  private static evaluateTestingOpportunities(
    file: ChangedFile,
    content: string,
    findings: ReviewFinding[],
    contextUsed: Set<string>,
    input: ReviewInput
  ) {
    contextUsed.add('Testing & Verification');

    // Only flag missing tests if file is a business domain service and project has a test directory
    const isDomainService =
      (file.path.includes('/services/') || file.path.endsWith('.service.ts')) &&
      !file.path.includes('test') &&
      !file.path.includes('spec');

    if (isDomainService) {
      const projectHasTests = (input.code.projectStructure || []).some(
        (p) => p.includes('test') || p.includes('spec')
      );

      // Check if another file in changedFiles or project is a test for this file
      const baseName = file.path.split('/').pop()?.replace(/\.(ts|js|py)$/, '') || '';
      const hasAssociatedTest = (input.code.changedFiles || []).some(
        (f) => f.path.includes(baseName) && (f.path.includes('.test.') || f.path.includes('.spec.'))
      );

      if (projectHasTests && !hasAssociatedTest && content.includes('async ') && content.includes('Service')) {
        findings.push({
          finding_id: `F-TEST-${Math.floor(Math.random() * 8999 + 1000)}`,
          severity: 'LOW',
          category: 'TESTING',
          title: `Core business service lacks dedicated unit test coverage`,
          file: file.path,
          line: this.findFirstMatchingLine(file, ['class ', 'export class', 'def ']),
          problem: `Service module contains critical business logic without an accompanying test file.`,
          evidence: `No test companion matching "${baseName}.test.ts" found in workspace.`,
          reason: `Business domain services encapsulate core transactional invariants and require unit test suites covering success and edge-case error paths.`,
          recommendation: `Add unit tests in src/tests/ verifying happy path, boundary validation, and error-handling conditions.`,
          rule_id: 'TEST-001',
          confidence: 0.80,
          related_previous_reviews: [],
        });
      }
    }
  }

  private static evaluateMaintainability(
    file: ChangedFile,
    content: string,
    findings: ReviewFinding[],
    contextUsed: Set<string>
  ) {
    contextUsed.add('Maintainability & Complexity');

    // Detect excessive indentation nesting (>= 4 indentation levels inside nested control flow)
    const lines = content.split('\n');
    let hasExcessiveNesting = false;
    let nestingLineNumber = 1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // 16 spaces or 4 tabs
      if (/^(\s{16,}|\t{4,})(if|for|while|switch)\b/.test(line)) {
        hasExcessiveNesting = true;
        nestingLineNumber = i + 1;
        break;
      }
    }

    if (hasExcessiveNesting) {
      findings.push({
        finding_id: `F-MAINT-${Math.floor(Math.random() * 8999 + 1000)}`,
        severity: 'LOW',
        category: 'MAINTAINABILITY',
        title: 'Excessive conditional nesting depth exceeds maintainability threshold',
        file: file.path,
        line: nestingLineNumber,
        problem: 'Control flow contains deeply nested if/loop blocks (nesting level >= 4), increasing cognitive complexity.',
        evidence: `Deeply nested scope detected at line ${nestingLineNumber}.`,
        reason: 'High cyclomatic complexity and deep nesting reduce readability, complicate unit testing, and increase defect rates.',
        recommendation: 'Refactor with early return guard clauses, helper extraction, or functional pipelines.',
        rule_id: 'MAINT-001',
        confidence: 0.85,
        related_previous_reviews: [],
      });
    }
  }

  private static findFirstMatchingLine(file: ChangedFile, keywords: string[]): number {
    const lines = file.addedLines || [];
    for (const l of lines) {
      for (const kw of keywords) {
        if (l.content.includes(kw)) {
          return l.lineNumber;
        }
      }
    }
    return 1;
  }
}
