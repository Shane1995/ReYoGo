<p align="center">
  <img src="src/renderer/public/logo.png" alt="ReYoGo logo" width="120" />
</p>

# ReYoGo

An Electron application built with React, TypeScript, and Vite.

## Features

- ⚡️ Vite for fast development and building
- ⚛️ React 18 with TypeScript
- 🧪 Vitest for testing
- 🪟 Windows build support
- 🔄 GitHub Actions for CI/CD

## Prerequisites

- Node.js v25.5.0 (recommended: use nvm)
- pnpm package manager

### Installing Node.js with nvm

If you have nvm installed, you can automatically use the correct Node.js version:

```bash
nvm use
```

Or install Node.js v25.5.0:

```bash
nvm install 25.5.0
nvm use 25.5.0
```

### Installing pnpm

Use Corepack (recommended, included with Node.js 16.10+):

```bash
corepack enable
corepack prepare pnpm@9.15.0 --activate
```

Or install globally with npm:

```bash
npm install -g pnpm
```

Verify pnpm is installed:

```bash
pnpm --version
```

## Installation

Install project dependencies:

```bash
pnpm install
```

## Development

Start the development server:

```bash
pnpm run dev
```

Run Electron in development mode:

```bash
pnpm run electron:dev
```

## Building

Build for Windows:

```bash
pnpm run build:win
```

The built application will be in the `release` directory.

## Testing

Run tests:

```bash
pnpm test
```

Run tests with UI:

```bash
pnpm run test:ui
```

Run tests with coverage:

```bash
pnpm run test:coverage
```

## Linting

```bash
pnpm run lint
```

## Project Structure

```
├── electron/              # Electron main process files
│   ├── main.ts           # Main process entry point
│   └── preload.ts        # Preload script
├── src/                  # React application source
│   ├── components/       # React components
│   │   └── componentName/
│   │       ├── index.tsx      # Component implementation
│   │       ├── index.test.tsx # Component tests
│   │       └── index.css      # Component styles (optional)
│   ├── hooks/            # Custom React hooks
│   │   └── hookName/
│   │       ├── index.ts      # Hook implementation
│   │       └── index.test.ts # Hook tests
│   ├── utils/            # Utility functions
│   │   └── utilName/
│   │       ├── index.ts      # Utility implementation
│   │       └── index.test.ts # Utility tests
│   ├── pages/            # Page-level components
│   │   └── pageName/
│   │       ├── index.tsx     # Page implementation
│   │       └── index.test.tsx # Page tests
│   ├── main.tsx          # React entry point
│   └── test/              # Test setup and utilities
├── .github/              # GitHub Actions workflows
└── dist/                 # Built React app (generated)
```

## License

MIT
