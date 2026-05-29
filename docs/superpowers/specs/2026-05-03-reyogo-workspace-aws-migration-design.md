# ReYoGo Workspace — AWS Migration Design

**Date:** 2026-05-03  
**Status:** Approved

---

## Overview

Migrate ReYoGo from a local Electron desktop app to a cloud-hosted multi-user web application on AWS. A new repository `reyogo-workspace` will be created as a pnpm monorepo. The Electron app is not ported — this is a fresh start sharing no legacy code.

---

## Monorepo Structure

```
reyogo-workspace/
├── packages/
│   ├── shared/          # TypeScript types, Zod schemas, DynamoDB key patterns
│   ├── lambdas/         # AWS Lambda functions (TypeScript, per domain)
│   └── web/             # React 18 + Vite + TypeScript + Tailwind + shadcn/ui
├── .github/
│   └── workflows/       # CI/CD pipelines
├── pnpm-workspace.yaml
├── package.json         # Root devDependencies, shared scripts
└── tsconfig.base.json   # Shared TypeScript config

> Infrastructure (DynamoDB tables, Cognito, API Gateway, S3, CloudFront) lives in the separate `terraform-aws-infra` repo using Terraform.
```

---

## AWS Architecture

### Auth — AWS Cognito
- Cognito User Pool per environment (staging, prod)
- Email + password sign-in
- JWT tokens (ID token) passed as `Authorization: Bearer <token>` to API Gateway
- API Gateway HTTP API JWT authorizer validates tokens — no Lambda authorizer needed
- User Pool custom attribute: `custom:orgId` assigned at sign-up

### API — HTTP API Gateway + Lambda
- One HTTP API per environment
- Lambda functions per domain (inventory, invoices, stock, categories, units of measure, config, users)
- All routes require Cognito JWT authorizer except sign-up bootstrap
- Lambda runtime: Node.js 22.x, TypeScript compiled via esbuild

### Database — DynamoDB
- On-demand (pay-per-request) billing — scales to zero
- Multi-table design (one table per domain entity for clarity)
- All partition keys prefixed with `orgId#` to enforce tenant isolation
- Tables: `organisations`, `users`, `inventory_items`, `inventory_categories`, `invoices`, `invoice_lines`, `stock_movements`, `units_of_measure`, `app_config`

### Frontend Hosting — S3 + CloudFront
- Single S3 bucket `reyogo-web` with prefixed directories:
  ```
  reyogo-web/
  ├── staging/
  │   ├── v1.0.0/bundles/   ← versioned JS/CSS per build (permanent)
  │   ├── v1.0.1/bundles/
  │   └── index.html        ← updated to reference active version
  └── prod/
      ├── v1.0.0/bundles/
      └── index.html
  ```
- Two CloudFront distributions (staging, prod) with origin paths `/staging` and `/prod`
- **Versioning:** CI auto-bumps `package.json` patch version on every merge to `main`, commits back to repo
- **Deploy to staging:** automatic on merge to `main` — bump version → build → upload to `staging/v{version}/bundles/` → update `staging/index.html` → CloudFront invalidation on `/staging/index.html`
- **Deploy to prod:** manual GitHub Actions workflow dispatch — input: version (e.g. `v1.0.1`) → update `prod/index.html` to reference that version → CloudFront invalidation — no rebuild required
- **Rollback:** workflow dispatch — input: version + env → update `index.html` of target env → CloudFront invalidation — instant, no rebuild

### Environments
- **Staging:** CDK stack `reyogo-staging` — auto-deployed on merge to `main`
- **Prod:** CDK stack `reyogo-prod` — manually triggered deploy via GitHub Actions workflow dispatch

---

## Multi-Tenancy Model

- Each sign-up creates a new **Organisation** record in DynamoDB
- The signing-up user becomes the org **Owner**
- Org owners can invite additional users (email invite via Cognito admin API)
- All DynamoDB queries include `orgId` from the JWT `custom:orgId` claim — data is never shared across orgs
- User roles: `owner`, `member` (stored in DynamoDB user record; enforced in Lambda)

---

## Package Details

### `packages/shared`
- TypeScript entity types (mirroring DynamoDB records): `Organisation`, `User`, `InventoryItem`, `InventoryCategory`, `Invoice`, `InvoiceLine`, `StockMovement`, `UnitOfMeasure`, `AppConfig`
- Zod schemas for all request/response payloads (used in both Lambda validation and web form validation)
- DynamoDB key pattern helpers (pure functions, no AWS SDK dependency)
- No runtime AWS SDK imports — stays environment-agnostic

### `packages/lambdas`
- One handler file per domain (e.g. `inventory.ts`, `invoices.ts`)
- Shared Lambda middleware: JWT claim extraction, error formatting, CORS headers
- AWS SDK v3 (`@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb`)
- Built with esbuild (bundled per function for minimal cold start)

### `packages/web`
- React 18 + React Router v6 + Vite
- Tailwind CSS + shadcn/ui (same stack as Electron app)
- AWS Amplify JS v6 for Cognito auth (sign-in, sign-up, token refresh)
- Fetch-based API client (thin wrapper, no SDK)
- Feature pages: Inventory, Invoices, Stock Movements, Settings, User Management

### `terraform-aws-infra` (separate repo)
- Terraform modules per environment (`staging/`, `prod/`)
- Defines: DynamoDB tables, Cognito User Pool, HTTP API Gateway, Lambda functions, S3 bucket, CloudFront distribution
- Environment variables / ARNs output as Terraform outputs, consumed by CI/CD

---

## CI/CD — GitHub Actions

| Trigger | Workflow | Action |
|---|---|---|
| PR opened/updated | `ci.yml` | Lint, type-check, unit tests |
| Merge to `main` | `deploy-staging.yml` | Bump patch version → build → upload to `staging/v{version}/bundles/` → update `staging/index.html` → CloudFront invalidation |
| Manual (workflow_dispatch, input: `version`) | `deploy-prod.yml` | Update `prod/index.html` to reference chosen version → CloudFront invalidation |
| Manual (workflow_dispatch, input: `version` + `env`) | `rollback.yml` | Update `{env}/index.html` to reference chosen version → CloudFront invalidation |

---

## Domain Coverage (Feature Parity with Electron App)

| Domain | Lambda routes | Web pages |
|---|---|---|
| Inventory Items | CRUD | List, Add, Edit |
| Inventory Categories | CRUD | Inline management |
| Invoices | CRUD + line items | List, Create, View/Print |
| Stock Movements | Create, List | Log view |
| Units of Measure | CRUD | Settings page |
| App / Business Config | Get, Update | Settings page |
| Users | List, Invite, Remove | User management page |
| Dashboard | Summary aggregation | Dashboard home |

---

## Out of Scope (v1)

- Custom domain / Route 53 setup (can be added later)
- PDF export of invoices
- Email notifications
- Mobile app
- Data migration from Electron SQLite DB
