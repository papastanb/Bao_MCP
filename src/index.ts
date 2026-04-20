import type { Config, Plugin } from '@opencode-ai/plugin';
import type { Part } from '@opencode-ai/sdk';
import path from 'node:path';
import fs from 'node:fs/promises';

type CommandFrontmatter = {
  description?: string;
  agent?: string;
  model?: string;
  subtask?: boolean;
};

type ParsedCommand = {
  name: string;
  frontmatter: CommandFrontmatter;
  template: string;
};

const CONFIG_FILE_RE = /(^|\/)opencode\.jsonc?$/i;
const MCP_PROMPT_RE =
  /\b(mcp|model context protocol|context7|chrome-devtools|api key|token|secret)\b/i;
const HARDCODED_SECRET_RE =
  /(?:ctx7sk-[A-Za-z0-9-]+|ghp_[A-Za-z0-9]+|xox[baprs]-[A-Za-z0-9-]+|AIza[0-9A-Za-z\-_]{20,}|AKIA[0-9A-Z]{16}|(?:api[_-]?key|token|secret)\s*[=:]\s*["'][^"'{][^"']*["'])/i;
const OPENBAO_EXECUTABLE = 'openbao-mcp-exec';

function parseFrontmatter(content: string): {
  frontmatter: CommandFrontmatter;
  body: string;
} {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { frontmatter: {}, body: content.trim() };
  }

  const [, yamlContent, body] = match;
  const frontmatter: CommandFrontmatter = {};

  for (const line of yamlContent.split('\n')) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();

    if (key === 'description') frontmatter.description = value;
    if (key === 'agent') frontmatter.agent = value;
    if (key === 'model') frontmatter.model = value;
    if (key === 'subtask') frontmatter.subtask = value === 'true';
  }

  return { frontmatter, body: body.trim() };
}

async function resolveCommandDirectory(): Promise<string | null> {
  const candidateDirs = [
    path.join(import.meta.dir, 'commands'),
    path.join(import.meta.dir, '../src/commands'),
  ];

  for (const candidate of candidateDirs) {
    try {
      const stat = await fs.stat(candidate);
      if (stat.isDirectory()) {
        return candidate;
      }
    } catch {
      // directory does not exist
    }
  }

  return null;
}

async function loadCommands(): Promise<ParsedCommand[]> {
  const commandDir = await resolveCommandDirectory();
  if (!commandDir) {
    return [];
  }

  const commands: ParsedCommand[] = [];
  const glob = new Bun.Glob('**/*.md');

  for await (const file of glob.scan({ cwd: commandDir, absolute: true })) {
    const content = await Bun.file(file).text();
    const { frontmatter, body } = parseFrontmatter(content);
    const relativePath = path.relative(commandDir, file);
    const name = relativePath.replace(/\.md$/, '').replace(/\//g, '-');

    commands.push({
      name,
      frontmatter,
      template: body,
    });
  }

  return commands;
}

function getFilePath(args: Record<string, unknown>): string {
  const filePath = args.filePath;
  return typeof filePath === 'string' ? filePath : '';
}

function getWritablePayload(args: Record<string, unknown>): string {
  return JSON.stringify(args);
}

function targetsOpencodeConfig(args: Record<string, unknown>): boolean {
  const filePath = getFilePath(args);
  if (CONFIG_FILE_RE.test(filePath)) return true;

  const payload = getWritablePayload(args);
  return /opencode\.jsonc?/i.test(payload);
}

function getPromptText(parts: Part[]): string {
  return parts
    .filter((part): part is Extract<Part, { type: 'text' }> => part.type === 'text')
    .map((part) => part.text)
    .join('\n');
}

export const OpenBaoMcpGuardPlugin: Plugin = async () => {
  const commands = await loadCommands();

  return {
    async config(config: Config) {
      config.command = config.command ?? {};

      for (const command of commands) {
        config.command[command.name] = {
          template: command.template,
          description: command.frontmatter.description,
          agent: command.frontmatter.agent,
          model: command.frontmatter.model,
          subtask: command.frontmatter.subtask,
        };
      }
    },

    'chat.message': async (_input, output) => {
      const promptText = getPromptText(output.parts);
      if (!MCP_PROMPT_RE.test(promptText)) return;

      output.parts.push({
        type: 'text',
        synthetic: true,
        text: [
          '[Secure MCP reminder] For MCPs that need an API key, do not hardcode secrets in opencode.json.',
          'Store the key in OpenBao first:',
          'bao kv put -address=http://127.0.0.1:8200 -tls-skip-verify -mount=secret <mcp>/api_key key=TA_CLE_API',
          `Then wire the MCP through ${OPENBAO_EXECUTABLE} (or your preferred absolute path).`,
          'Use /add-secure-mcp for the guided secure setup flow.',
        ].join(' '),
      } as unknown as Part);
    },

    'tool.execute.before': async (input, output) => {
      if (input.tool !== 'write' && input.tool !== 'edit' && input.tool !== 'apply_patch') {
        return;
      }

      if (!targetsOpencodeConfig(output.args)) return;

      const rawValues = Object.values(output.args).filter(
        (v): v is string => typeof v === 'string'
      );
      const hasSecret = rawValues.some((v) => HARDCODED_SECRET_RE.test(v));
      if (!hasSecret) return;

      throw new Error(
        [
          'Do not hardcode MCP secrets in opencode config.',
          'Store the secret in OpenBao instead:',
          'bao kv put -address=http://127.0.0.1:8200 -tls-skip-verify -mount=secret <mcp>/api_key key=TA_CLE_API',
          `Then configure the MCP through ${OPENBAO_EXECUTABLE} (or your preferred absolute path).`,
        ].join(' ')
      );
    },
  };
};

export default {
  id: 'openbao-mcp-guard',
  server: OpenBaoMcpGuardPlugin,
};
