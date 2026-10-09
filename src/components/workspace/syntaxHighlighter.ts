/**
 * Lightweight Multi-Language Syntax Tokenizer
 * Provides token classification and styling for all 13 supported languages.
 */

import type { SupportedLanguage } from './types';

export interface Token {
  type: 'keyword' | 'string' | 'comment' | 'number' | 'function' | 'type' | 'operator' | 'punctuation' | 'text';
  text: string;
}

const COMMON_KEYWORDS = new Set([
  // JS/TS
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'import', 'from',
  'export', 'default', 'class', 'extends', 'implements', 'interface', 'type', 'async', 'await',
  'new', 'try', 'catch', 'finally', 'throw', 'typeof', 'instanceof', 'super', 'this', 'switch',
  'case', 'break', 'continue', 'yield',
  // Python
  'def', 'elif', 'pass', 'lambda', 'with', 'as', 'in', 'is', 'not', 'and', 'or', 'None', 'True',
  'False', 'self', 'cls', 'raise', 'except',
  // Java / C# / C / C++
  'public', 'private', 'protected', 'static', 'final', 'void', 'int', 'float', 'double', 'char',
  'boolean', 'bool', 'string', 'namespace', 'using', 'package', 'struct', 'enum', 'virtual', 'override',
  'include', 'define',
  // Go
  'func', 'package', 'import', 'go', 'chan', 'select', 'defer', 'range', 'map', 'make', 'nil',
  // Rust
  'fn', 'pub', 'mut', 'impl', 'trait', 'match', 'use', 'mod', 'crate', 'Some', 'None', 'Ok', 'Err',
  // PHP
  'echo', 'global',
  // SQL
  'SELECT', 'FROM', 'WHERE', 'INSERT', 'INTO', 'UPDATE', 'DELETE', 'CREATE', 'TABLE', 'ALTER',
  'DROP', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON', 'GROUP', 'BY', 'ORDER', 'ASC', 'DESC',
  'LIMIT', 'OFFSET', 'VALUES', 'AND', 'OR', 'NOT', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES',
  'select', 'from', 'where', 'insert', 'into', 'update', 'delete', 'create', 'table', 'join',
]);

const TYPE_KEYWORDS = new Set([
  'string', 'number', 'boolean', 'any', 'void', 'unknown', 'never', 'object', 'Record', 'Array',
  'Promise', 'Dict', 'List', 'Optional', 'Tuple', 'Set', 'Map', 'Int', 'Float', 'String', 'Boolean',
  'size_t', 'uint32_t', 'int64_t', 'auto', 'i32', 'i64', 'u32', 'u64', 'f32', 'f64', 'usize',
]);

export function tokenizeCode(code: string, language: SupportedLanguage): Token[] {
  const tokens: Token[] = [];
  let index = 0;
  const len = code.length;

  while (index < len) {
    const char = code[index];

    // Single-line Comments
    if (
      (char === '/' && code[index + 1] === '/') ||
      (language === 'python' && char === '#') ||
      (language === 'sql' && char === '-' && code[index + 1] === '-')
    ) {
      let end = code.indexOf('\n', index);
      if (end === -1) end = len;
      tokens.push({ type: 'comment', text: code.slice(index, end) });
      index = end;
      continue;
    }

    // Multi-line Comments (/* ... */ or HTML <!-- ... -->)
    if (char === '/' && code[index + 1] === '*') {
      const end = code.indexOf('*/', index + 2);
      if (end !== -1) {
        tokens.push({ type: 'comment', text: code.slice(index, end + 2) });
        index = end + 2;
        continue;
      }
    }
    if (language === 'html' && code.startsWith('<!--', index)) {
      const end = code.indexOf('-->', index + 4);
      if (end !== -1) {
        tokens.push({ type: 'comment', text: code.slice(index, end + 3) });
        index = end + 3;
        continue;
      }
    }

    // Triple-quoted Strings (Python)
    if (language === 'python' && (code.startsWith('"""', index) || code.startsWith("'''", index))) {
      const quote = code.slice(index, index + 3);
      const end = code.indexOf(quote, index + 3);
      if (end !== -1) {
        tokens.push({ type: 'string', text: code.slice(index, end + 3) });
        index = end + 3;
        continue;
      }
    }

    // Strings: single, double, backtick
    if (char === '"' || char === "'" || char === '`') {
      const quote = char;
      let end = index + 1;
      let escaped = false;
      while (end < len) {
        if (code[end] === '\\') {
          escaped = !escaped;
        } else if (code[end] === quote && !escaped) {
          end++;
          break;
        } else {
          escaped = false;
        }
        end++;
      }
      tokens.push({ type: 'string', text: code.slice(index, end) });
      index = end;
      continue;
    }

    // Numbers
    if (/[0-9]/.test(char)) {
      let end = index;
      while (end < len && /[0-9a-fA-FxX._]/.test(code[end])) {
        end++;
      }
      tokens.push({ type: 'number', text: code.slice(index, end) });
      index = end;
      continue;
    }

    // Identifiers & Keywords
    if (/[a-zA-Z_$]/.test(char)) {
      let end = index;
      while (end < len && /[a-zA-Z0-9_$]/.test(code[end])) {
        end++;
      }
      const word = code.slice(index, end);

      // Check if followed by '(' -> function
      let isFunc = false;
      let peek = end;
      while (peek < len && (code[peek] === ' ' || code[peek] === '\t')) {
        peek++;
      }
      if (peek < len && code[peek] === '(' && !COMMON_KEYWORDS.has(word)) {
        isFunc = true;
      }

      if (COMMON_KEYWORDS.has(word)) {
        tokens.push({ type: 'keyword', text: word });
      } else if (TYPE_KEYWORDS.has(word) || /^[A-Z][a-zA-Z0-9]*$/.test(word)) {
        tokens.push({ type: 'type', text: word });
      } else if (isFunc) {
        tokens.push({ type: 'function', text: word });
      } else {
        tokens.push({ type: 'text', text: word });
      }
      index = end;
      continue;
    }

    // Operators and Punctuation
    if (/[+\-*/%=<>!&|^~?:]/.test(char)) {
      tokens.push({ type: 'operator', text: char });
      index++;
      continue;
    }

    if (/[{}()[\];,.]/.test(char)) {
      tokens.push({ type: 'punctuation', text: char });
      index++;
      continue;
    }

    // Whitespace and other characters
    tokens.push({ type: 'text', text: char });
    index++;
  }

  return tokens;
}

export function getTokenClass(type: Token['type']): string {
  switch (type) {
    case 'keyword':
      return 'text-sky-400 font-semibold';
    case 'type':
      return 'text-teal-300';
    case 'string':
      return 'text-emerald-300';
    case 'comment':
      return 'text-slate-500 italic';
    case 'number':
      return 'text-amber-400 font-mono';
    case 'function':
      return 'text-purple-300';
    case 'operator':
      return 'text-rose-400';
    case 'punctuation':
      return 'text-slate-400';
    case 'text':
    default:
      return 'text-slate-200';
  }
}
