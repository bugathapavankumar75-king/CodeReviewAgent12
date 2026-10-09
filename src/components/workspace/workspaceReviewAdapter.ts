/**
 * Workspace Review Adapter
 * Bridges Code Workspace files with the Phase 1 ReviewEngine contract.
 * Generates single-file and whole-project review inputs with context assembly and diff comparison.
 */

import type { WorkspaceFile, WorkspaceProjectConfig, ReReviewDiff } from './types';
import type { ReviewInput, ChangedFile, CodeChangeLine } from '../../agent/models/reviewInput.model';
import type { ReviewFinding, ReviewResponse } from '../../agent/models/reviewOutput.model';
import { ReviewEngine } from '../../agent/review/reviewEngine';

export class WorkspaceReviewAdapter {
  /**
   * Constructs ReviewInput and runs ReviewEngine for a single file with surrounding workspace context.
   */
  static reviewSingleFile(
    targetFile: WorkspaceFile,
    allFiles: WorkspaceFile[],
    projectConfig: WorkspaceProjectConfig
  ): ReviewResponse {
    const lines = targetFile.content.split('\n');
    const addedLines: CodeChangeLine[] = lines.map((text, idx) => ({
      lineNumber: idx + 1,
      type: 'added',
      content: text,
    }));

    const changedFile: ChangedFile = {
      path: targetFile.file_path,
      isNew: false,
      isDeleted: false,
      diff: lines.map((l) => `+ ${l}`).join('\n'),
      addedLines,
      modifiedLines: [],
      deletedLines: [],
      language: targetFile.language,
      surroundingContext: `Language: ${targetFile.language}\nProject: ${projectConfig.projectName}\nArchitecture: ${projectConfig.architecture}`,
    };

    // Surrounding context snippets from other workspace files
    const otherSnippets = allFiles
      .filter((f) => f.file_id !== targetFile.file_id)
      .map((f) => ({
        filePath: f.file_path,
        startLine: 1,
        endLine: Math.min(25, f.content.split('\n').length),
        snippet: f.content.slice(0, 1000),
      }));

    const reviewInput: ReviewInput = {
      reviewId: `REV-${Date.now().toString(36).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      code: {
        projectStructure: allFiles.map((f) => f.file_path),
        changedFiles: [changedFile],
        surroundingCodeSnippets: otherSnippets,
      },
      projectKnowledge: {
        projectDescription: projectConfig.description,
        customConventions: {
          framework: projectConfig.framework,
          database: projectConfig.database,
          architecture: projectConfig.architecture,
          primaryLanguage: projectConfig.primaryLanguage,
        },
      },
      options: {
        minimumConfidenceThreshold: 0.60,
        suppressFormattingIssues: true,
        respectExceptions: true,
      },
      metadata: {
        scope: 'single_file',
        targetLanguage: targetFile.language,
        targetFileName: targetFile.file_name,
      },
    };

    return ReviewEngine.evaluate(reviewInput);
  }

  /**
   * Constructs ReviewInput and runs ReviewEngine across all project workspace files.
   */
  static reviewFullProject(
    allFiles: WorkspaceFile[],
    projectConfig: WorkspaceProjectConfig
  ): ReviewResponse {
    const changedFiles: ChangedFile[] = allFiles.map((file) => {
      const lines = file.content.split('\n');
      return {
        path: file.file_path,
        isNew: false,
        isDeleted: false,
        diff: lines.map((l) => `+ ${l}`).join('\n'),
        addedLines: lines.map((text, idx) => ({
          lineNumber: idx + 1,
          type: 'added',
          content: text,
        })),
        modifiedLines: [],
        deletedLines: [],
        language: file.language,
        surroundingContext: `Project: ${projectConfig.projectName} (${projectConfig.framework})`,
      };
    });

    const reviewInput: ReviewInput = {
      reviewId: `REV-PROJ-${Date.now().toString(36).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      code: {
        projectStructure: allFiles.map((f) => f.file_path),
        changedFiles,
      },
      projectKnowledge: {
        projectDescription: projectConfig.description,
        customConventions: {
          framework: projectConfig.framework,
          database: projectConfig.database,
          architecture: projectConfig.architecture,
        },
      },
      options: {
        minimumConfidenceThreshold: 0.60,
        suppressFormattingIssues: true,
        respectExceptions: true,
      },
      metadata: {
        scope: 'full_project',
        totalFiles: allFiles.length,
      },
    };

    return ReviewEngine.evaluate(reviewInput);
  }

  /**
   * Section 10: Fix and Re-Review Workflow
   * Compares subsequent review findings with previous findings.
   * Identifies: Resolved, Still Present, New Findings.
   */
  static computeReReviewDiff(
    previousFindings: ReviewFinding[],
    currentFindings: ReviewFinding[]
  ): ReReviewDiff {
    const findMatch = (finding: ReviewFinding, list: ReviewFinding[]): ReviewFinding | undefined => {
      return list.find(
        (item) => item.rule_id === finding.rule_id && item.file === finding.file
      );
    };

    const resolved = previousFindings.filter((prev) => !findMatch(prev, currentFindings));
    const stillPresent = currentFindings.filter((curr) => Boolean(findMatch(curr, previousFindings)));
    const newFindings = currentFindings.filter((curr) => !findMatch(curr, previousFindings));

    return {
      resolved,
      stillPresent,
      newFindings,
      previousTotal: previousFindings.length,
      currentTotal: currentFindings.length,
    };
  }
}
