# Complete Guide: Creating a Professional Node.js Library with TypeScript, pnpm, and Modern Best Practices (2025)

**A Phase-Based Approach: Start Simple, Build Incrementally**

## Table of Contents

1. [Phase 1: Foundation Setup](#phase-1-foundation-setup)
2. [Phase 2: Barebones Project Structure](#phase-2-barebones-project-structure)
3. [Phase 3: TypeScript Strict Configuration](#phase-3-typescript-strict-configuration)
4. [Phase 4: Build System with tsdown](#phase-4-build-system-with-tsdown)
5. [Phase 5: Package Configuration & Exports](#phase-5-package-configuration--exports)
6. [Phase 6: Code Quality Tools](#phase-6-code-quality-tools)
7. [Phase 7: Documentation & Examples](#phase-7-documentation--examples)
8. [Phase 8: Publishing to npm/JSR](#phase-8-publishing-to-npmjsr)
9. [Phase 9: CI/CD Pipeline](#phase-9-cicd-pipeline)

---

## Phase 1: Foundation Setup

**Goal**: Set up Node.js, pnpm, and basic Git initialization

### 1.1 System Requirements

- **Node.js**: v22.11.0 or higher (LTS recommended)
- **Package Manager**: pnpm v9.12.3 or higher
- **Git**: Latest version for version control
- **Operating System**: Linux, macOS, or Windows (WSL2 recommended for Windows)

### 1.2 Installing pnpm via Corepack

pnpm is the modern package manager with superior dependency resolution and disk efficiency:

```bash
# Enable pnpm using Corepack (built into Node.js v16.13+)
corepack enable

# Install latest pnpm
corepack prepare pnpm@latest --activate

# Verify installation
pnpm -v
```

**Why pnpm over npm/yarn?**
- Strict dependency resolution (catches errors npm/yarn miss)
- Significantly faster install times
- Disk-efficient via hardlink storage
- Native monorepo workspace support
- Better for library development with peer dependencies

### 1.3 Version Manager (Optional but Recommended)

For managing multiple Node.js versions:

```bash
# Using nvm (Linux/macOS)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 22
nvm use 22

# Or using fnm (cross-platform)
fnm install 22
fnm use 22
```

### 1.4 Create Project Directory and Initialize Git

```bash
mkdir my-awesome-library
cd my-awesome-library

# Initialize Git
git init

# Create a basic .gitignore for Node.js projects
cat > .gitignore << 'EOF'
node_modules/
dist/
.DS_Store
.env.local
pnpm-lock.yaml
EOF
```

### 1.5 Initialize pnpm Project

```bash
# Initialize package.json with strict defaults
pnpm init

# Set Node.js version constraint (matches your LTS version)
npm pkg set engines.node=">=22.11.0"

# Set as ES module project (modern standard)
npm pkg set type="module"

# Specify pnpm version for reproducibility
npm pkg set packageManager="pnpm@9.12.3"

# Add useful metadata
npm pkg set description="A performant, type-safe utility library"
npm pkg set keywords="['typescript','utilities','esm']"
npm pkg set author="Your Name"
npm pkg set license="MIT"
```

### 1.6 Verify Basic package.json

```json
{
  "name": "my-awesome-library",
  "version": "0.1.0",
  "description": "A performant, type-safe utility library",
  "type": "module",
  "engines": {
    "node": ">=22.11.0"
  },
  "packageManager": "pnpm@9.12.3",
  "keywords": ["typescript", "utilities", "esm"],
  "author": "Your Name",
  "license": "MIT"
}
```

### 1.7 First Git Commit

```bash
git add .gitignore package.json
git commit -m "chore: initialize project with pnpm"
```

---

## Phase 2: Barebones Project Structure

**Goal**: Create minimal, essential folder structure with core source files

### 2.1 Create Basic Directory Structure

```bash
# Create only essential directories
mkdir -p src

# Create main entry point
touch src/index.ts
```

**Barebones structure:**

```
my-awesome-library/
├── src/
│   └── index.ts              # Main entry point
├── .gitignore
├── package.json
└── pnpm-lock.yaml
```

### 2.2 Create a Simple Source File

```bash
cat > src/index.ts << 'EOF'
/**
 * A simple utility to add two numbers
 * @param a - First number
 * @param b - Second number
 * @returns Sum of a and b
 */
export function add(a: number, b: number): number {
  return a + b
}

/**
 * Multiply two numbers
 * @param a - First number
 * @param b - Second number
 * @returns Product of a and b
 */
export function multiply(a: number, b: number): number {
  return a * b
}

export default { add, multiply }
EOF
```

### 2.3 Install TypeScript and Essential Tools

```bash
pnpm add -D typescript @types/node
```

**Package explanations:**
- `typescript`: Core TypeScript compiler
- `@types/node`: Type definitions for Node.js APIs

### 2.4 Commit Phase 2

```bash
git add src/
git commit -m "feat: create barebones project structure"
```

---

## Phase 3: TypeScript Strict Configuration

**Goal**: Lock in strict type safety with a single, comprehensive tsconfig.json

### 3.1 Create Single tsconfig.json (Bundler + Library Optimized)

Create one unified tsconfig.json that works for both building and development:

```bash
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    // ES Module Configuration (2025 standard)
    "module": "ES2020",
    "target": "ES2020",
    "lib": ["ES2020"],
    "moduleResolution": "bundler",
    "resolveJsonModule": true,

    // Strict Type Checking (NON-NEGOTIABLE)
    "strict": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "useUnknownInCatchVariables": true,
    "allowUnusedLabels": false,
    "allowUnreachableCode": false,

    // Import/Export Handling
    "verbatimModuleSyntax": true,
    "allowImportingTsExtensions": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,

    // Output Configuration
    "outDir": "./dist",
    "rootDir": "./src",

    // Module and Path Configuration
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },

    // Emit and Interop
    "esModuleInterop": false,
    "allowSyntheticDefaultImports": true,
    "preserveConstEnums": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,

    // Incremental Compilation
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo",
    "pretty": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
EOF
```

### 3.2 Explanation of Key Strict Options

| Option | Purpose |
|--------|---------|
| `strict: true` | Enables all strict type checking flags at once |
| `exactOptionalPropertyTypes: true` | Prevents assigning `undefined` to optional properties |
| `noUncheckedIndexedAccess: true` | Prevents unsafe array access without bounds checking |
| `verbatimModuleSyntax: true` | Preserves import/export exactly as written (avoids subtle bugs) |
| `allowImportingTsExtensions: true` | Allows `.ts` extension imports (required for ESM) |
| `declaration: true` | Generates `.d.ts` declaration files |
| `declarationMap: true` | Generates `.d.ts.map` source maps for declarations |
| `noUnusedLocals: true` | Error on unused variables - catches dead code |
| `noUnusedParameters: true` | Error on unused function parameters |
| `useUnknownInCatchVariables: true` | Forces explicit typing in catch blocks |

### 3.3 Add Type Checking Script

```bash
npm pkg set scripts.type-check="tsc --noEmit"
```

### 3.4 Test Type Checking

```bash
pnpm type-check
```

Should output: `error TS2322` if there are type issues, or nothing if types are correct.

### 3.5 Commit Phase 3

```bash
git add tsconfig.json package.json
git commit -m "chore: enable strict TypeScript mode with unified tsconfig"
```

---

## Phase 4: Build System with tsdown

**Goal**: Set up tsdown (Rust-powered bundler) for production builds

### 4.1 Why tsdown Over tsup?

`tsdown` is the modern evolution of `tsup`:
- **Powered by Rolldown** (written in Rust) - significantly faster
- **Better tree-shaking** with more aggressive optimization
- **Multiple format support** - ESM, CJS, IIFE, UMD
- **Official Rolldown project** - future-proof and actively maintained
- **Production-ready** - used by major libraries

### 4.2 Install tsdown

```bash
pnpm add -D tsdown
```

### 4.3 Create tsdown.config.ts (ESM-Only - Recommended)

```bash
cat > tsdown.config.ts << 'EOF'
import { defineConfig } from 'tsdown'

export default defineConfig({
  // Entry point
  entry: 'src/index.ts',

  // Output formats: ESM-first approach (2025 standard)
  // ESM is natively tree-shakable and is the modern web standard
  format: ['esm'],

  // Generate TypeScript declaration files (.d.ts)
  // Use dts object with resolve: true for proper declaration generation
  dts: {
    resolve: true,
  },

  // Output directory
  outDir: 'dist',

  // Target modern environments
  target: 'es2020',

  // Minification in production only
  minify: process.env.NODE_ENV === 'production',

  // Generate source maps for debugging
  sourcemap: true,

  // Don't bundle dependencies - consumers install these themselves
  external: [],

  // Enable tree-shaking for smaller bundles
  shaking: true,

  // Preserve module structure
  splitting: false,
})
EOF
```

### 4.4 Alternative: Dual ESM/CJS Publishing (If Required)

If you need to support older Node.js versions or CommonJS consumers:

```bash
cat > tsdown.config.ts << 'EOF'
import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: 'src/index.ts',
  
  // Dual module support (ESM-first approach)
  format: ['esm', 'cjs'],
  
  // Generate TypeScript declaration files
  dts: {
    resolve: true,
  },
  
  outDir: 'dist',
  target: 'es2020',
  minify: process.env.NODE_ENV === 'production',
  sourcemap: true,
  shaking: true,
})
EOF
```

### 4.5 Add Build Scripts to package.json

```bash
npm pkg set scripts.build="tsdown"
npm pkg set scripts.dev="tsdown --watch"
npm pkg set scripts.build:prod="NODE_ENV=production tsdown"
```

Your `package.json` scripts section:

```json
{
  "scripts": {
    "build": "tsdown",
    "dev": "tsdown --watch",
    "build:prod": "NODE_ENV=production tsdown",
    "type-check": "tsc --noEmit"
  }
}
```

### 4.6 Test the Build Process

```bash
# Build the library
pnpm build

# Check the output
ls -la dist/

# You should see (ESM-only):
# - dist/index.mjs (ESM bundle)
# - dist/index.mjs.map (Source map)
# - dist/index.d.ts (TypeScript declarations)
# - dist/index.d.ts.map (Declaration map)

# For dual format (if using Phase 4.4 config), you'll also see:
# - dist/index.cjs (CommonJS bundle)
# - dist/index.cjs.map (CJS source map)
```

### 4.7 Commit Phase 4

```bash
git add tsdown.config.ts package.json dist/
git commit -m "feat: add tsdown build system"
```

---

## Phase 5: Package Configuration & Exports

**Goal**: Configure package.json for proper module resolution and npm distribution

### 5.1 Update package.json Export Configuration

**For ESM-only libraries (recommended for 2025):**

```bash
npm pkg set exports='{"import":"./dist/index.mjs","types":"./dist/index.d.ts"}'
npm pkg set types="./dist/index.d.ts"
npm pkg set files='["dist"]'
```

**For dual ESM/CJS libraries:**

```bash
npm pkg set exports='{"import":"./dist/index.mjs","require":"./dist/index.cjs","types":"./dist/index.d.ts"}'
npm pkg set main="./dist/index.cjs"
npm pkg set module="./dist/index.mjs"
npm pkg set types="./dist/index.d.ts"
npm pkg set files='["dist"]'
```

### 5.2 Add Repository and Homepage Information

```bash
npm pkg set repository.type="git"
npm pkg set repository.url="https://github.com/your-org/my-awesome-library.git"
npm pkg set bugs="https://github.com/your-org/my-awesome-library/issues"
npm pkg set homepage="https://github.com/your-org/my-awesome-library#readme"
```

### 5.3 Complete package.json Example (ESM-only)

```json
{
  "name": "@your-org/my-awesome-library",
  "version": "0.1.0",
  "description": "A performant, type-safe utility library",
  "type": "module",
  "engines": {
    "node": ">=22.11.0"
  },
  "packageManager": "pnpm@9.12.3",
  
  "exports": {
    "import": "./dist/index.mjs",
    "types": "./dist/index.d.ts"
  },
  "types": "./dist/index.d.ts",
  "files": ["dist"],
  
  "keywords": ["typescript", "utilities", "esm"],
  "author": "Your Name",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-org/my-awesome-library.git"
  },
  "bugs": "https://github.com/your-org/my-awesome-library/issues",
  "homepage": "https://github.com/your-org/my-awesome-library#readme",
  
  "scripts": {
    "build": "tsdown",
    "dev": "tsdown --watch",
    "build:prod": "NODE_ENV=production tsdown",
    "type-check": "tsc --noEmit",
    "lint": "eslint src",
    "lint:fix": "eslint src --fix",
    "format": "prettier --write src",
    "format:check": "prettier --check src"
  },
  
  "devDependencies": {
    "@types/node": "^latest",
    "tsdown": "^latest",
    "typescript": "^latest"
  }
}
```

### 5.4 Commit Phase 5

```bash
git add package.json
git commit -m "chore: configure package exports and metadata"
```

---

## Phase 6: Code Quality Tools

**Goal**: Add linting, formatting, and type checking

### 6.1 Install ESLint and Prettier

```bash
pnpm add -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser prettier
```

### 6.2 Create eslint.config.js (Flat Config - 2025 Standard)

```bash
cat > eslint.config.js << 'EOF'
import js from '@eslint/js'
import ts from 'typescript-eslint'

export default ts.config(
  {
    ignores: ['dist', 'node_modules'],
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  ...ts.configs.strict,
  {
    rules: {
      // Enforce explicit return types
      '@typescript-eslint/explicit-function-return-types': [
        'error',
        { allowExpressions: true },
      ],

      // Prevent unused variables (allow with _ prefix)
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],

      // Prevent any type usage
      '@typescript-eslint/no-explicit-any': 'error',

      // Enforce consistent type definitions
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],

      // Prevent unnecessary await
      '@typescript-eslint/await-thenable': 'error',

      // Enforce explicit return types on methods
      '@typescript-eslint/explicit-module-boundary-types': 'error',
    },
  }
)
EOF
```

### 6.3 Create .eslintignore

```bash
cat > .eslintignore << 'EOF'
dist/
node_modules/
.tsbuildinfo
EOF
```

### 6.4 Create Prettier Config

```bash
cat > prettier.config.json << 'EOF'
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "always"
}
EOF
```

### 6.5 Create .prettierignore

```bash
cat > .prettierignore << 'EOF'
dist/
node_modules/
.tsbuildinfo
EOF
```

### 6.6 Add Quality Scripts to package.json

```bash
npm pkg set scripts.lint="eslint src"
npm pkg set scripts.lint:fix="eslint src --fix"
npm pkg set scripts.format="prettier --write src"
npm pkg set scripts.format:check="prettier --check src"
```

### 6.7 Run Quality Checks

```bash
# Lint code
pnpm lint

# Fix linting issues
pnpm lint:fix

# Check formatting
pnpm format:check

# Apply formatting
pnpm format

# Type check
pnpm type-check
```

### 6.8 Add Pre-commit Hook (Optional)

```bash
# Install husky for git hooks
pnpm add -D husky

# Initialize husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "pnpm lint && pnpm type-check"
```

### 6.9 Update .gitignore

```bash
cat >> .gitignore << 'EOF'
.husky/
EOF
```

### 6.10 Commit Phase 6

```bash
git add eslint.config.js prettier.config.json .eslintignore .prettierignore package.json
git commit -m "feat: add ESLint and Prettier for code quality"
```

---

## Phase 7: Documentation & Examples

**Goal**: Add README, examples, and API documentation

### 7.1 Create README.md

```bash
cat > README.md << 'EOF'
# My Awesome Library

A performant, type-safe utility library for modern Node.js.

## Features

- ✅ **Fully typed with TypeScript** - Strict mode enabled
- ✅ **Tree-shakable** - ESM module format
- ✅ **Zero dependencies** - Lightweight and fast
- ✅ **Production-ready** - Thoroughly tested
- ✅ **Modern** - ES2020 target, native ESM

## Installation

```bash
npm install @your-org/my-awesome-library
# or
pnpm add @your-org/my-awesome-library
```

## Quick Start

```typescript
import { add, multiply } from '@your-org/my-awesome-library'

const result = add(5, 3)        // 8
const product = multiply(4, 2)  // 8
```

## API Documentation

### `add(a: number, b: number): number`

Adds two numbers together.

```typescript
add(2, 3) // returns 5
```

### `multiply(a: number, b: number): number`

Multiplies two numbers.

```typescript
multiply(2, 3) // returns 6
```

## TypeScript Support

This library is built with **strict TypeScript**:

- All types are fully inferred
- No `any` types allowed
- Strict null checks enabled
- Full JSDoc documentation

## Development

```bash
# Clone the repository
git clone https://github.com/your-org/my-awesome-library.git
cd my-awesome-library

# Install dependencies
pnpm install

# Development workflow
pnpm type-check    # Type check
pnpm build         # Build the library
pnpm lint          # Lint code
pnpm format        # Format code
```

## License

MIT
EOF
```

### 7.2 Create CHANGELOG.md

```bash
cat > CHANGELOG.md << 'EOF'
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-12-12

### Added

- Initial release
- `add()` function for adding two numbers
- `multiply()` function for multiplying two numbers
- Full TypeScript support with strict mode
EOF
```

### 7.3 Create Examples Directory

```bash
mkdir -p examples

cat > examples/basic-usage.ts << 'EOF'
import { add, multiply } from '../dist/index.mjs'

// Example 1: Simple addition
console.log('Basic Addition Example')
console.log('5 + 3 =', add(5, 3))
console.log('10 + 20 =', add(10, 20))

// Example 2: Multiplication
console.log('\nBasic Multiplication Example')
console.log('5 * 3 =', multiply(5, 3))
console.log('10 * 20 =', multiply(10, 20))

// Example 3: Type safety
console.log('\nType Safety')
console.log('All operations are fully typed!')

// Uncomment to see TypeScript errors:
// add("5", 3) // ❌ Error: Argument of type 'string' is not assignable to parameter of type 'number'
// multiply(true, 3) // ❌ Error: Argument of type 'boolean' is not assignable to parameter of type 'number'
EOF
```

### 7.4 Create API Documentation

```bash
mkdir -p docs

cat > docs/API.md << 'EOF'
# API Reference

## Functions

### `add(a: number, b: number): number`

Adds two numbers together.

**Parameters:**
- `a` - The first number to add
- `b` - The second number to add

**Returns:** The sum of `a` and `b`

**Example:**
```typescript
import { add } from '@your-org/my-awesome-library'

add(2, 3)    // returns 5
add(-2, 3)   // returns 1
add(0, 5)    // returns 5
```

### `multiply(a: number, b: number): number`

Multiplies two numbers together.

**Parameters:**
- `a` - The first number to multiply
- `b` - The second number to multiply

**Returns:** The product of `a` and `b`

**Example:**
```typescript
import { multiply } from '@your-org/my-awesome-library'

multiply(2, 3)   // returns 6
multiply(-2, 3)  // returns -6
multiply(0, 5)   // returns 0
```
EOF
```

### 7.5 Update .gitignore for Documentation

```bash
cat >> .gitignore << 'EOF'
/docs/.vuepress/dist/
EOF
```

### 7.6 Commit Phase 7

```bash
git add README.md CHANGELOG.md docs/ examples/
git commit -m "docs: add documentation and examples"
```

---

## Phase 8: Publishing to npm/JSR

**Goal**: Prepare and publish library to npm and optionally JSR

### 8.1 Create .npmignore

```bash
cat > .npmignore << 'EOF'
# Development files
.github/
.git/
.gitignore
.npmignore
.husky/

# Build and test files
src/
.tsbuildinfo
vitest.config.ts
coverage/
tsdown.config.ts

# Configuration
eslint.config.js
prettier.config.json
tsconfig.json

# Documentation
examples/
docs/

# Dependencies
node_modules/
pnpm-lock.yaml

# IDE
.vscode/
.idea/
*.swp
*.swo
.DS_Store
EOF
```

### 8.2 Create .npmrc for Publishing

```bash
cat > .npmrc << 'EOF'
# NPM registry
registry=https://registry.npmjs.org/

# Prevent accidentally publishing private packages
access=public

# Set automatic otp support
otp-prompt=true
EOF
```

### 8.3 Add Prepublish Scripts to package.json

```bash
npm pkg set scripts.prepublishOnly="pnpm build && pnpm lint && pnpm type-check"
```

### 8.4 Prepare for Publishing

Before publishing, ensure everything is ready:

```bash
# Run all checks
pnpm type-check
pnpm lint
pnpm build

# Verify dist contents
ls -la dist/

# Expected output:
# - dist/index.mjs
# - dist/index.d.ts
# - dist/index.d.ts.map
# - dist/index.mjs.map
```

### 8.5 Create npm Account and Publish

```bash
# Login to npm (visit https://www.npmjs.com/signup if you don't have an account)
npm login

# Verify package info before publishing
npm pkg get name
npm pkg get version
npm pkg get files

# Publish (dry run first - recommended)
npm publish --dry-run

# Publish for real
npm publish
```

### 8.6 Verify Published Package

```bash
# Check npm registry
npm view @your-org/my-awesome-library

# Install from npm to test in another directory
mkdir ~/test-install && cd ~/test-install
npm install @your-org/my-awesome-library
node -e "import('@your-org/my-awesome-library').then(m => console.log(m.add(2, 3)))"
```

### 8.7 Publishing to JSR (Modern Alternative)

JSR (JavaScriptRegistry.io) is the modern registry with native TypeScript support:

```bash
# Create JSR account at https://jsr.io

# Install JSR CLI
pnpm add -g jsr

# Login to JSR
jsr login

# Publish to JSR
jsr publish
```

### 8.8 Commit Phase 8

```bash
git add .npmignore .npmrc package.json
git commit -m "chore: configure npm publishing"

# Tag and push release
git tag v0.1.0
git push origin main --tags
```

---

## Phase 9: CI/CD Pipeline

**Goal**: Automate linting and publishing with GitHub Actions

### 9.1 Create GitHub Actions Workflow Directory

```bash
mkdir -p .github/workflows
```

### 9.2 Create Lint Workflow

```bash
cat > .github/workflows/lint.yml << 'EOF'
name: Lint & Type Check

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 9.12.3

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - name: Install dependencies
        run: pnpm install

      - name: Type check
        run: pnpm type-check

      - name: Lint
        run: pnpm lint

      - name: Build
        run: pnpm build
EOF
```

### 9.3 Create Release Workflow

```bash
cat > .github/workflows/release.yml << 'EOF'
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    
    permissions:
      contents: write
      packages: write
      id-token: write

    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 9.12.3

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
          registry-url: 'https://registry.npmjs.org'

      - name: Install dependencies
        run: pnpm install

      - name: Type check
        run: pnpm type-check

      - name: Lint
        run: pnpm lint

      - name: Build
        run: pnpm build

      - name: Publish to npm
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Create GitHub Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          draft: false
          prerelease: false
EOF
```

### 9.4 Set Up npm Token for Publishing

1. Go to https://www.npmjs.com/settings/~:form=apiToken
2. Create a new "Automation" token (expires after 365 days)
3. Copy the token
4. In your GitHub repository, go to Settings → Secrets and variables → Actions
5. Create a new secret named `NPM_TOKEN` and paste the token

### 9.5 Complete Development Workflow Example

```bash
# 1. Clone and setup
git clone https://github.com/your-org/my-awesome-library.git
cd my-awesome-library
pnpm install

# 2. Development loop
pnpm dev  # Watch mode for building

# In another terminal:
pnpm lint:fix  # Fix linting issues

# 3. Before committing
pnpm type-check
pnpm lint
pnpm format

# 4. Build and verify
pnpm build
pnpm build:prod  # Production build with minification

# 5. Create git commit
git add .
git commit -m "feat: add feature X"
git push origin feature/my-feature

# 6. Create pull request on GitHub
# CI/CD automatically runs linting and type checks

# 7. After review and merge
git checkout main
git pull origin main

# 8. Create version and push
npm version patch  # or minor, major
# This creates a git tag automatically

# 9. Push tags to trigger release workflow
git push origin main --tags

# GitHub Actions automatically publishes to npm
```

### 9.6 Commit Phase 9

```bash
git add .github/workflows/
git commit -m "ci: add GitHub Actions workflows"
git push origin main
```

---

## Complete Development Workflow Summary

### Quick Reference Commands

```bash
# Setup
pnpm install

# Development
pnpm dev              # Build in watch mode
pnpm type-check       # Type checking
pnpm lint:fix         # Fix linting issues
pnpm format           # Format code

# Pre-commit
pnpm type-check
pnpm lint
pnpm format

# Building
pnpm build            # Development build
pnpm build:prod       # Production build (minified)

# Publishing
npm version patch     # Bump patch version (creates tag)
git push origin main --tags  # Trigger CI/CD release
```

---

## Best Practices Checklist

### Code Organization
- ✅ Single entry point (`src/index.ts`)
- ✅ Clear separation of concerns
- ✅ Exports only public API from index
- ✅ Internal utilities prefixed with `_` or in private directory

### Type Safety
- ✅ Single `tsconfig.json` (no multiple config files)
- ✅ `strict: true` enabled in tsconfig
- ✅ No `any` types (use `unknown` instead)
- ✅ All exports have explicit return types
- ✅ JSDoc comments for public APIs
- ✅ `declaration: true` and `declarationMap: true` for .d.ts generation
- ✅ `exactOptionalPropertyTypes: true` enforced

### Documentation
- ✅ README with quick start
- ✅ API documentation
- ✅ Examples for common use cases
- ✅ CHANGELOG tracking changes

### Performance
- ✅ Tree-shakable ESM format
- ✅ No unnecessary dependencies
- ✅ Minified production builds
- ✅ Source maps for debugging

### Publishing
- ✅ Version bumps follow semantic versioning
- ✅ CHANGELOG updated before publish
- ✅ Code quality checks passing
- ✅ TypeScript declaration files included
- ✅ Source maps included for debugging

---

## Phase Migration Guide

### Moving Between Phases

Each phase builds on the previous. You can:

1. **Stay at a phase**: Many simple libraries only need up to Phase 5 (build system)
2. **Jump ahead**: Skip phases if you don't need them (e.g., skip Phase 8 if not publishing)
3. **Return later**: Add phases incrementally as your library grows

### Minimal Library (Phases 1-5)

Perfect for simple utilities or internal libraries:

```bash
# Just the essentials
pnpm install
pnpm build
pnpm type-check
```

### Production Library (Phases 1-9)

Complete setup for public npm packages:

```bash
# Full development experience
pnpm install
pnpm dev
pnpm lint:fix
pnpm format
# ... make changes ...
git push origin feature/branch
# ... create PR ...
# ... review and merge ...
npm version patch
git push origin main --tags
```

---

## Troubleshooting

### Issue: "Cannot find module" errors after build

```bash
# Ensure build output exists
ls -la dist/

# Clean rebuild
rm -rf dist/
pnpm build
```

### Issue: Missing .d.ts Declaration Files

```bash
# Verify tsdown config has dts settings
cat tsdown.config.ts | grep -A 2 "dts:"

# Should show:
# dts: {
#   resolve: true,
# },

# If missing, update tsdown.config.ts with correct dts config
# Then clean and rebuild:
rm -rf dist/ .tsbuildinfo
pnpm build
```

### Issue: TypeScript strict mode errors

```bash
# Check what's wrong
pnpm type-check

# Fix individual issues or use:
pnpm lint:fix
```

---

## 2025 Modern Stack Summary

| Tool | Purpose | Why This Choice |
|------|---------|-----------------|
| **TypeScript 5.8** | Type safety | Strict mode, single unified config |
| **pnpm 9.12** | Package manager | Fast, strict, efficient |
| **tsdown** | Bundler | Rust-powered (Rolldown), future-proof |
| **ESM only** | Module format | Tree-shakable, web standard |
| **ESLint** | Linting | Latest flat config, TS support |
| **Prettier** | Formatting | Consistent code style |
| **GitHub Actions** | CI/CD | Free, native GitHub integration |

---

## Key Improvements Over Previous Approaches

### Single tsconfig.json

Unlike traditional setups with multiple tsconfig files (one for build, one for tests), this guide uses:
- **One unified `tsconfig.json`** that covers all use cases
- tsdown reads from the same config
- ESM-first configuration optimized for modern libraries
- Based on `@total-typescript/tsconfig` best practices

**Benefits:**
- Simpler maintenance - changes propagate everywhere
- Consistent compiler settings across build
- No config file proliferation
- Clear, explicit configuration

### Correct tsdown Declaration Configuration

The guide uses the proper `dts` configuration for tsdown:
- **`dts: { resolve: true }`** generates proper `.d.ts` and `.d.ts.map` files
- Works seamlessly with the unified `tsconfig.json`
- Ensures TypeScript consumers get full type information
- Source maps allow developers to navigate to original source in IDEs

---

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org)
- [tsdown Documentation](https://tsdown.dev)
- [pnpm Documentation](https://pnpm.io)
- [ESLint Docs](https://eslint.org)
- [@total-typescript/tsconfig](https://github.com/total-typescript/tsconfig)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides)

---

**Last Updated:** December 2025 | Node.js v22+ | TypeScript 5.8+ | tsdown | Single tsconfig.json