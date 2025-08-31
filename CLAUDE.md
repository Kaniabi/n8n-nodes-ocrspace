# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an n8n community node package for creating custom integrations. The project follows the n8n node development pattern with TypeScript compilation and includes example nodes and credentials.

## Development Commands

### Build and Development
- `bun run build` - Full build: clean dist, compile TypeScript, copy icons
- `bun run dev` - Watch mode for TypeScript compilation
- `tsc` - Direct TypeScript compilation

### Code Quality
- `bun run lint` - Run ESLint on nodes, credentials, and package.json
- `bun run lintfix` - Auto-fix ESLint issues
- `bun run format` - Format code with Prettier

### Publishing
- `bun run prepublishOnly` - Pre-publish checks (build + lint with stricter rules)

## Architecture

### Core Structure
- `/nodes/` - Node implementations (main functionality)
- `/credentials/` - Authentication/credential definitions
- `/dist/` - Compiled output (created by build process)

### Node Development Pattern
Each n8n node consists of:
1. **Node class** implementing `INodeType` with:
   - `description: INodeTypeDescription` - UI configuration, properties, operations
   - `execute()` method - Main business logic
2. **Properties definition** - UI form fields, operations, and resources
3. **Routing configuration** - HTTP request configuration within properties

### Key Files
- `nodes/*/**.node.ts` - Main node implementations
- `credentials/**.credentials.ts` - Credential type definitions  
- `nodes/**/HttpVerbDescription.ts` - Property definitions separated for readability
- `gulpfile.js` - Icon copying during build
- `tsconfig.json` - Strict TypeScript configuration

### n8n-Specific Patterns
- Use `this.getNodeParameter()` to access user inputs
- Use `this.getInputData()` to get workflow data
- Handle errors with `NodeOperationError` and `continueOnFail()` support
- Use `routing` property in node properties for HTTP requests
- Icons must be copied to dist via gulp task

### Build Process
1. TypeScript compilation to `/dist/`
2. Icon copying via gulp
3. ESLint validation with n8n-specific rules

## Configuration Notes
- Requires Node.js >= 20.15
- Uses strict TypeScript configuration
- ESLint includes n8n-specific rules via `eslint-plugin-n8n-nodes-base`
- Icons (PNG/SVG) are automatically copied during build