const { execFile } = require('child_process');

const DEFAULT_TIMEOUT_MS = 90000;
const DEFAULT_COMMAND = 'claude';

const RESPONSE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    text: { type: 'string' },
    needsMoreInfo: { type: 'boolean' },
    recommendedTeacherIds: {
      type: 'array',
      items: { type: 'integer' },
      maxItems: 3
    },
    recommendationReasons: {
      type: 'object',
      additionalProperties: { type: 'string' }
    },
    searchCriteria: {
      type: 'object',
      additionalProperties: true,
      properties: {
        subject: { type: ['string', 'null'] },
        grade: { type: ['string', 'null'] },
        minPrice: { type: ['number', 'null'] },
        maxPrice: { type: ['number', 'null'] },
        gender: { type: ['string', 'null'] },
        style: { type: ['string', 'null'] },
        bookingIntent: { type: 'boolean' }
      }
    }
  },
  required: [
    'text',
    'needsMoreInfo',
    'recommendedTeacherIds',
    'recommendationReasons',
    'searchCriteria'
  ]
};

class ClaudeCodeError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'ClaudeCodeError';
    this.statusCode = options.statusCode || 502;
    this.cause = options.cause;
  }
}

function zh(strings, ...values) {
  return strings.reduce((text, part, index) => {
    return text + part + (values[index] === undefined ? '' : values[index]);
  }, '');
}

function buildTeacherCatalogSection(teacherCandidates, includeTeacherCatalog) {
  if (includeTeacherCatalog) {
    return [
      zh`\u6559\u5e08\u5019\u9009\u5217\u8868\uff08\u8bf7\u5728\u672c Claude \u4f1a\u8bdd\u4e2d\u8bb0\u4f4f\u8fd9\u4efd\u76ee\u5f55\uff0c\u540e\u7eed\u8f6e\u6b21\u4f7f\u7528\u540c\u4e00\u4efd\u76ee\u5f55\uff09\uff1a`,
      JSON.stringify(teacherCandidates || [], null, 2)
    ].join('\n');
  }

  return zh`\u6559\u5e08\u5019\u9009\u5217\u8868\u5df2\u5728\u672c Claude \u4f1a\u8bdd\u9996\u8f6e\u63d0\u4f9b\u3002\u8bf7\u7ee7\u7eed\u53ea\u4ece\u8be5\u76ee\u5f55\u4e2d\u9009\u62e9\u6559\u5e08 userId\uff0c\u4e0d\u8981\u7f16\u9020\u65b0\u6559\u5e08\u3002`;
}

function buildPrompt({ message, history, studentContext, teacherCandidates, includeTeacherCatalog }) {
  return [
    zh`\u4f60\u662f\u5bb6\u6559\u4fe1\u606f\u5e73\u53f0\u7684 AI \u5bb6\u6559\u54a8\u8be2\u52a9\u624b\u3002`,
    zh`\u4f60\u7684\u4efb\u52a1\u662f\u7406\u89e3\u5b66\u751f/\u5bb6\u957f\u9700\u6c42\uff0c\u4ece\u5e73\u53f0\u63d0\u4f9b\u7684\u771f\u5b9e\u6559\u5e08\u5019\u9009\u5217\u8868\u4e2d\u63a8\u8350\u6700\u591a 3 \u4f4d\u6559\u5e08\uff0c\u6216\u5728\u4fe1\u606f\u4e0d\u8db3\u65f6\u8ffd\u95ee\u4e00\u4e2a\u6700\u5173\u952e\u95ee\u9898\u3002`,
    '',
    zh`\u91cd\u8981\u89c4\u5219\uff1a`,
    zh`1. \u5fc5\u987b\u4f7f\u7528\u7b80\u4f53\u4e2d\u6587\u56de\u590d\u3002`,
    zh`2. \u53ea\u80fd\u63a8\u8350\u5019\u9009\u5217\u8868\u4e2d\u5b58\u5728\u7684\u6559\u5e08 userId\uff0c\u4e0d\u80fd\u7f16\u9020\u6559\u5e08\u3001\u4ef7\u683c\u3001\u5b66\u5386\u6216\u8bc4\u4ef7\u3002`,
    zh`3. \u5982\u679c\u7528\u6237\u8868\u8fbe\u9884\u7ea6\u3001\u7ea6\u8bfe\u3001\u8054\u7cfb\u67d0\u4f4d\u8001\u5e08\u7684\u610f\u56fe\uff0c\u4e0d\u8981\u521b\u5efa\u9884\u7ea6\uff1b\u8bf7\u5f15\u5bfc\u7528\u6237\u70b9\u51fb\u6559\u5e08\u5361\u7247\u4e0a\u7684\u201c\u9884\u7ea6\u201d\u6309\u94ae\u3002`,
    zh`4. \u5982\u679c\u4fe1\u606f\u4e0d\u8db3\uff0c\u53ea\u95ee\u4e00\u4e2a\u6700\u5173\u952e\u7684\u6f84\u6e05\u95ee\u9898\uff0c\u4e0d\u8981\u4e00\u6b21\u5217\u51fa\u5f88\u591a\u95ee\u9898\u3002`,
    zh`5. \u5982\u679c\u6ca1\u6709\u5408\u9002\u6559\u5e08\uff0c\u8bf4\u660e\u539f\u56e0\uff0c\u5e76\u5efa\u8bae\u653e\u5bbd\u79d1\u76ee\u3001\u9884\u7b97\u3001\u65f6\u95f4\u6216\u6559\u5b66\u98ce\u683c\u6761\u4ef6\u3002`,
    zh`6. \u8f93\u51fa\u5fc5\u987b\u4e25\u683c\u5339\u914d JSON Schema\uff0c\u4e0d\u8981\u8f93\u51fa Markdown\u3001\u89e3\u91ca\u6216\u989d\u5916\u6587\u672c\u3002`,
    '',
    `${zh`\u5f53\u524d\u7528\u6237\u6d88\u606f\uff1a`}${message}`,
    '',
    `${zh`\u6700\u8fd1\u4f1a\u8bdd\uff1a`}${JSON.stringify(history || [], null, 2)}`,
    '',
    `${zh`\u767b\u5f55\u5b66\u751f\u8d44\u6599\uff1a`}${JSON.stringify(studentContext || null, null, 2)}`,
    '',
    buildTeacherCatalogSection(teacherCandidates, includeTeacherCatalog)
  ].join('\n');
}

function stripJsonFences(output) {
  const text = String(output || '').trim();
  const fenceMatch = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenceMatch ? fenceMatch[1].trim() : text;
}

function parseClaudeOutput(stdout) {
  const raw = stripJsonFences(stdout);

  try {
    const parsed = JSON.parse(raw);

    if (parsed && typeof parsed === 'object') {
      if (parsed.is_error) {
        const details = Array.isArray(parsed.errors) && parsed.errors.length > 0
          ? parsed.errors.join('; ')
          : (parsed.subtype || 'unknown error');
        throw new ClaudeCodeError(`Claude Code call failed: ${details}`);
      }

      if (parsed.structured_output && typeof parsed.structured_output === 'object') {
        return {
          ...parsed.structured_output,
          claudeSessionId: parsed.session_id || parsed.structured_output.claudeSessionId
        };
      }

      if (parsed.result && typeof parsed.result === 'object') {
        return {
          ...parsed.result,
          claudeSessionId: parsed.session_id || parsed.result.claudeSessionId
        };
      }

      if (typeof parsed.result === 'string') {
        return {
          ...JSON.parse(stripJsonFences(parsed.result)),
          claudeSessionId: parsed.session_id
        };
      }
    }

    return parsed;
  } catch (error) {
    if (error instanceof ClaudeCodeError) {
      throw error;
    }

    throw new ClaudeCodeError('Claude Code returned JSON that could not be parsed.', {
      cause: error
    });
  }
}

function normalizeResult(result) {
  return {
    text: typeof result.text === 'string' ? result.text.trim() : '',
    needsMoreInfo: Boolean(result.needsMoreInfo),
    recommendedTeacherIds: Array.isArray(result.recommendedTeacherIds)
      ? result.recommendedTeacherIds
      : [],
    recommendationReasons: result.recommendationReasons &&
      typeof result.recommendationReasons === 'object'
      ? result.recommendationReasons
      : {},
    searchCriteria: result.searchCriteria && typeof result.searchCriteria === 'object'
      ? result.searchCriteria
      : {},
    claudeSessionId: result.claudeSessionId || null
  };
}

function buildArgs(claudeSessionId, resumeClaudeSession) {
  const args = [
    '-p',
    '--output-format',
    'json',
    '--json-schema',
    JSON.stringify(RESPONSE_SCHEMA),
    '--permission-mode',
    'dontAsk',
    '--tools',
    ''
  ];

  if (claudeSessionId) {
    args.push(resumeClaudeSession ? '--resume' : '--session-id', claudeSessionId);
  }

  if (process.env.CLAUDE_CODE_MODEL) {
    args.push('--model', process.env.CLAUDE_CODE_MODEL);
  }

  if (process.env.CLAUDE_CODE_MAX_BUDGET_USD) {
    args.push('--max-budget-usd', process.env.CLAUDE_CODE_MAX_BUDGET_USD);
  }

  return args;
}

async function askClaudeForTutorAdvice(input) {
  const command = process.env.CLAUDE_CODE_COMMAND || DEFAULT_COMMAND;
  const timeout = Number(process.env.CLAUDE_CODE_TIMEOUT_MS || DEFAULT_TIMEOUT_MS);
  const prompt = buildPrompt(input);
  const args = buildArgs(input.claudeSessionId, input.resumeClaudeSession);

  return new Promise((resolve, reject) => {
    const child = execFile(
      command,
      args,
      {
        timeout,
        windowsHide: true,
        maxBuffer: 1024 * 1024 * 4,
        env: {
          ...process.env,
          NO_COLOR: '1'
        }
      },
      (error, stdout, stderr) => {
        let stdoutParseError = null;

        if (stdout) {
          try {
            resolve(normalizeResult(parseClaudeOutput(stdout)));
            return;
          } catch (parseError) {
            stdoutParseError = parseError;
          }
        }

        if (error) {
          if (stdoutParseError instanceof ClaudeCodeError) {
            reject(stdoutParseError);
            return;
          }

          if (error.code === 'ENOENT') {
            reject(new ClaudeCodeError('Claude Code CLI was not found. Install Claude Code or set CLAUDE_CODE_COMMAND.'));
            return;
          }

          if (error.killed || error.signal === 'SIGTERM') {
            reject(new ClaudeCodeError('Claude Code timed out. Try again or increase CLAUDE_CODE_TIMEOUT_MS.'));
            return;
          }

          const details = String(stderr || error.message || '').trim();
          reject(new ClaudeCodeError(
            details ? `Claude Code call failed: ${details}` : 'Claude Code call failed. Confirm that Claude Code is logged in and usable.',
            { cause: error }
          ));
          return;
        }

        try {
          resolve(normalizeResult(parseClaudeOutput(stdout)));
        } catch (parseError) {
          reject(parseError);
        }
      }
    );

    child.stdin.end(prompt);
  });
}

module.exports = {
  askClaudeForTutorAdvice,
  ClaudeCodeError
};
