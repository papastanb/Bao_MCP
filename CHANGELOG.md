# Changelog

## 0.3.0

- fix HARDCODED_SECRET_RE bypass by scanning raw string values instead of JSON.stringify'd args
- fix Bun.file().exists() for directory checks by using node:fs/promises stat
- move OPENBAO_EXECUTABLE constant to top of file near other constants
- fix TUI command trigger by removing leading slash from 'add-secure-mcp'
- add recursive hasSecretInValue() to detect secrets in nested objects and arrays
- rewrite all commits with correct author identity (papastanb)

## 0.2.0

- replace hardcoded personal `openbao-mcp-exec` paths with path-agnostic guidance
- add fuller public package metadata for npm and GitHub
- add dedicated documentation for setup, releases, and LLM-facing usage
- keep TUI integration and `/add-secure-mcp` as the primary onboarding surface

## 0.1.1

- remove dependency on a separate local instructions file in `opencode.json`

## 0.1.0

- initial public release of the OpenBao-backed MCP guard plugin for OpenCode
