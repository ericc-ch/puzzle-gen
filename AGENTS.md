# Agent Guidelines

## Build Commands

- **Run**: `bun start` or `bun src/main.ts`
- **Lint**: `bun run lint` (ESLint with `@echristian/eslint-config`)
- **Type check**: `bun run typecheck` (TypeScript)
- **Test**: `bun test` (single test: `bun test <file>`)

## Code Style

- **Runtime**: Bun (not Node.js) - use `bun` commands
- **Module system**: ESM (`type: "module"` in package.json)
- **Imports**: Use `import type` for types, regular imports for values
- **Types**: Strict TypeScript with `exactOptionalPropertyTypes`, snake_case for attribute names
- **Formatting**: Enforced by ESLint config, no manual comments unless needed
- **Error handling**: Use descriptive variable names, proper type annotations
- **Testing**: Bun test with `describe`/`test`/`expect`, use `/* eslint-disable */` for test-specific overrides

## Structure

- `src/`: Main application code (types, game logic, API routes)
- `test/`: Test files with `.test.ts` extension
- Entry point: `src/main.ts` (Hono server)
