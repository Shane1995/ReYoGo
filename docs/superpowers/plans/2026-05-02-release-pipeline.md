# Release Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing GitHub Releases pipeline with S3/CloudFront distribution — manual staging trigger, promotion to production, electron auto-updater, and a version bar in the UI.

**Architecture:** Three workflows (CI unchanged + reusable, release-staging manually triggered, release-prod tag-triggered). `electron-builder.config.js` handles dynamic `productName` and `publish.url` via env vars. `electron-updater` reads `app-update.yml` baked in at build time. Version bar uses the existing 4-layer IPC pattern.

**Tech Stack:** GitHub Actions, AWS CLI (S3 sync), electron-builder, electron-updater, React, Tailwind CSS, existing IPC/handler/service pattern.

---

### Task 1: Add github-actions-reyogo IAM role (terraform-aws-infra repo)

**Files:**
- Modify: `/Users/shane/Dev/terraform-aws-infra/bootstrap/main.tf`

- [ ] **Step 1: Add role and policy**

Append to `/Users/shane/Dev/terraform-aws-infra/bootstrap/main.tf`:

```hcl
resource "aws_iam_role" "github_actions_reyogo" {
  name = "github-actions-reyogo"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Action    = "sts:AssumeRoleWithWebIdentity"
      Principal = {
        Federated = aws_iam_openid_connect_provider.github.arn
      }
      Condition = {
        StringEquals = {
          "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
        }
        StringLike = {
          "token.actions.githubusercontent.com:sub" = "repo:Shane1995/ReYoGo:*"
        }
      }
    }]
  })
}

resource "aws_iam_role_policy" "github_actions_reyogo" {
  name = "reyogo-releases-upload"
  role = aws_iam_role.github_actions_reyogo.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = ["s3:PutObject", "s3:GetObject", "s3:DeleteObject", "s3:ListBucket"]
      Resource = [
        "arn:aws:s3:::reyogo-desktop-releases",
        "arn:aws:s3:::reyogo-desktop-releases/*"
      ]
    }]
  })
}
```

- [ ] **Step 2: Apply**

```bash
cd /Users/shane/Dev/terraform-aws-infra/bootstrap
eval $(aws configure export-credentials --format env)
terraform apply -auto-approve
```

Expected: `Apply complete! Resources: 2 added, 0 changed, 0 destroyed.`

- [ ] **Step 3: Commit and push**

```bash
cd /Users/shane/Dev/terraform-aws-infra
git add bootstrap/main.tf
git commit -m "feat: add github-actions-reyogo IAM role for ReYoGo CI uploads"
git push
```

---

### Task 2: GitHub Environments, variables, and secrets (manual — ReYoGo repo)

No files — done in the GitHub UI at https://github.com/Shane1995/ReYoGo/settings.

- [ ] **Step 1: Create three environments**

Settings → Environments → New environment (repeat for each):
- `staging` → Required reviewers → add `Shane1995`
- `promote` → Required reviewers → add `Shane1995`
- `production` → Required reviewers → add `Shane1995`

- [ ] **Step 2: Add Actions variables**

Settings → Secrets and variables → Actions → **Variables** tab → New repository variable:
- Name: `STAGING_UPDATE_FEED_URL` / Value: `https://d3alout98qzknu.cloudfront.net`
- Name: `PROD_UPDATE_FEED_URL` / Value: `https://dg4nfk4fmm8qa.cloudfront.net`

- [ ] **Step 3: Add AWS_ROLE_ARN secret**

Settings → Secrets and variables → Actions → **Secrets** tab → New repository secret:
- Name: `AWS_ROLE_ARN` / Value: `arn:aws:iam::145736415422:role/github-actions-reyogo`

---

### Task 3: Migrate electron-builder config and add macOS entitlements

**Files:**
- Create: `electron-builder.config.js`
- Create: `build/entitlements.mac.plist`
- Modify: `package.json` (remove `build` section)

- [ ] **Step 1: Create electron-builder.config.js**

```js
/** @type {import('electron-builder').Configuration} */
module.exports = {
  appId: 'com.reyogo.app',
  productName: process.env.PRODUCT_NAME || 'ReYoGo',
  npmRebuild: false,
  directories: { output: 'release' },
  files: ['dist/**/*', 'dist-electron/**/*', 'package.json'],
  asarUnpack: ['dist-electron/main/db/migrations/**'],
  win: {
    target: [
      { target: 'nsis', arch: ['x64'] },
      { target: 'zip', arch: ['x64'] },
    ],
    icon: 'build/icon.png',
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
  },
  mac: {
    target: ['dmg', 'zip'],
    icon: 'build/icon.icns',
    category: 'public.app-category.business',
    hardenedRuntime: true,
    gatekeeperAssess: false,
    entitlements: 'build/entitlements.mac.plist',
    entitlementsInherit: 'build/entitlements.mac.plist',
  },
  ...(process.env.UPDATE_FEED_URL && {
    publish: {
      provider: 'generic',
      url: process.env.UPDATE_FEED_URL,
    },
  }),
}
```

- [ ] **Step 2: Create build/entitlements.mac.plist**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>com.apple.security.cs.allow-jit</key>
    <true/>
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>
    <key>com.apple.security.cs.allow-dyld-environment-variables</key>
    <true/>
  </dict>
</plist>
```

- [ ] **Step 3: Remove `build` section from package.json**

Delete the entire `"build": { ... }` block. electron-builder auto-discovers `electron-builder.config.js`.

- [ ] **Step 4: Verify local build still works**

```bash
pnpm run build:mac
```

Expected: completes without errors, `release/` contains `.dmg` and `.zip`. No `app-update.yml` inside the package (UPDATE_FEED_URL not set locally).

- [ ] **Step 5: Commit**

```bash
git add electron-builder.config.js build/entitlements.mac.plist package.json
git commit -m "feat: migrate electron-builder config to js, add mac entitlements"
```

---

### Task 4: Install electron-updater and add auto-update

**Files:**
- Modify: `src/main/main.ts`

- [ ] **Step 1: Install electron-updater**

```bash
pnpm add electron-updater
```

- [ ] **Step 2: Update src/main/main.ts**

Add import after existing imports:
```typescript
import { autoUpdater } from 'electron-updater';
```

Add inside `app.whenReady().then(() => {`, after `registerIPC();`:
```typescript
  if (app.isPackaged) {
    autoUpdater.checkForUpdatesAndNotify();
  }
```

- [ ] **Step 3: Commit**

```bash
git add src/main/main.ts package.json pnpm-lock.yaml
git commit -m "feat: add electron-updater auto-update check on launch"
```

---

### Task 5: Add AppIPC enum and version handler

**Files:**
- Create: `src/shared/types/ipc/app.ts`
- Modify: `src/shared/types/ipc/index.ts`
- Create: `src/main/handlers/app/index.ts`
- Modify: `src/main/ipc.ts`

- [ ] **Step 1: Create src/shared/types/ipc/app.ts**

```typescript
export enum AppIPC {
  GET_VERSION = 'app:get-version',
}
```

- [ ] **Step 2: Export from src/shared/types/ipc/index.ts**

Add to the existing exports:
```typescript
export { AppIPC } from './app';
```

- [ ] **Step 3: Create src/main/handlers/app/index.ts**

```typescript
import { app, ipcMain } from 'electron';
import { AppIPC } from '@shared/types/ipc';

interface AppVersionInfo {
  version: string;
  env: string;
}

function getVersion(): AppVersionInfo {
  return {
    version: app.getVersion(),
    env: process.env.VITE_APP_ENV ?? 'development',
  };
}

export function registerAppHandlers(): void {
  ipcMain.handle(AppIPC.GET_VERSION, getVersion);
}
```

- [ ] **Step 4: Register in src/main/ipc.ts**

```typescript
import { registerInventoryHandlers } from './handlers/inventory';
import { registerInvoicesHandlers } from './handlers/invoices';
import { registerSetupHandlers } from './handlers/setup';
import { registerStockMovementsHandlers } from './handlers/stockMovements';
import { registerAppHandlers } from './handlers/app';

export const registerIPC = () => {
  registerAppHandlers();
  registerInventoryHandlers();
  registerInvoicesHandlers();
  registerSetupHandlers();
  registerStockMovementsHandlers();
};
```

- [ ] **Step 5: Commit**

```bash
git add src/shared/types/ipc/app.ts src/shared/types/ipc/index.ts src/main/handlers/app/index.ts src/main/ipc.ts
git commit -m "feat: add AppIPC get-version handler"
```

---

### Task 6: Add app service and VersionBar component

**Files:**
- Create: `src/renderer/src/services/app/index.ts`
- Create: `src/renderer/src/components/VersionBar/index.tsx`
- Create: `src/renderer/src/components/VersionBar/VersionBar.test.tsx`
- Modify: `src/renderer/src/layouts/AppLayout/index.tsx`

- [ ] **Step 1: Create src/renderer/src/services/app/index.ts**

```typescript
import { AppIPC } from '@shared/types/ipc';

export interface AppVersionInfo {
  version: string;
  env: string;
}

export const appService = {
  getVersion: (): Promise<AppVersionInfo> =>
    window.electronAPI.ipcRenderer.invoke(AppIPC.GET_VERSION),
};
```

- [ ] **Step 2: Write failing test**

Create `src/renderer/src/components/VersionBar/VersionBar.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import VersionBar from './index';

vi.mock('../../services/app', () => ({
  appService: {
    getVersion: vi.fn().mockResolvedValue({ version: '1.0.0-beta.1', env: 'staging' }),
  },
}));

describe('VersionBar', () => {
  it('renders version and capitalised environment', async () => {
    render(<VersionBar />);
    expect(await screen.findByText('v1.0.0-beta.1 • Staging')).toBeInTheDocument();
  });

  it('renders nothing while loading', () => {
    render(<VersionBar />);
    expect(screen.queryByText(/v\d/)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
pnpm vitest run src/renderer/src/components/VersionBar/VersionBar.test.tsx
```

Expected: FAIL — cannot find module `./index`.

- [ ] **Step 4: Create src/renderer/src/components/VersionBar/index.tsx**

```typescript
import { useEffect, useState } from 'react';
import { appService, type AppVersionInfo } from '../../services/app';

export default function VersionBar() {
  const [info, setInfo] = useState<AppVersionInfo | null>(null);

  useEffect(() => {
    appService.getVersion().then(setInfo);
  }, []);

  if (!info) return null;

  const envLabel = info.env.charAt(0).toUpperCase() + info.env.slice(1);

  return (
    <div className="flex items-center justify-end border-t border-border bg-background px-4 py-1 text-xs text-muted-foreground">
      v{info.version} • {envLabel}
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
pnpm vitest run src/renderer/src/components/VersionBar/VersionBar.test.tsx
```

Expected: PASS

- [ ] **Step 6: Add VersionBar to AppLayout**

Replace `src/renderer/src/layouts/AppLayout/index.tsx` with:

```typescript
import { TopNav } from "@/components/TopNav";
import VersionBar from "@/components/VersionBar";
import { Outlet } from "react-router-dom";

const AppLayout = () => {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <TopNav />
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <Outlet />
      </main>
      <VersionBar />
    </div>
  );
};

export default AppLayout;
```

- [ ] **Step 7: Run all tests**

```bash
pnpm run test
```

Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add src/renderer/src/services/app/ src/renderer/src/components/VersionBar/ src/renderer/src/layouts/AppLayout/index.tsx
git commit -m "feat: add version bar showing app version and environment"
```

---

### Task 7: Replace pipeline workflows

**Files:**
- Modify: `.github/workflows/ci.yml` (add `workflow_call` trigger)
- Delete: `.github/workflows/version.yml`
- Delete: `.github/workflows/pipeline.yml`
- Create: `.github/workflows/release-staging.yml`
- Create: `.github/workflows/release-prod.yml`

- [ ] **Step 1: Make ci.yml reusable**

Add `workflow_call:` to the `on:` block in `.github/workflows/ci.yml`:

```yaml
on:
  pull_request:
    branches: [ main ]
  workflow_call:
```

No other changes needed.

- [ ] **Step 2: Delete old workflows**

```bash
rm .github/workflows/version.yml .github/workflows/pipeline.yml
```

- [ ] **Step 3: Create .github/workflows/release-staging.yml**

```yaml
name: Release to Staging

on:
  workflow_dispatch:
    inputs:
      bump:
        description: Version bump type
        required: true
        type: choice
        options: [patch, minor, major]

concurrency:
  group: release-staging
  cancel-in-progress: false

env:
  NODE_VERSION: "24"
  PNPM_VERSION: "9.15.0"

jobs:
  version:
    runs-on: ubuntu-latest
    outputs:
      beta_tag: ${{ steps.bump.outputs.beta_tag }}
      new_version: ${{ steps.bump.outputs.new_version }}
    steps:
      - name: Generate app token
        id: app-token
        uses: actions/create-github-app-token@v3
        with:
          app-id: ${{ secrets.APP_ID }}
          private-key: ${{ secrets.APP_PRIVATE_KEY }}

      - uses: actions/checkout@v6
        with:
          fetch-depth: 0
          token: ${{ steps.app-token.outputs.token }}

      - uses: actions/setup-node@v6
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Configure git
        run: |
          git config user.name "ReYoGo-bot[bot]"
          git config user.email "ReYoGo-bot[bot]@users.noreply.github.com"

      - id: bump
        name: Bump version and create beta tag
        run: |
          git fetch --tags

          CURRENT=$(node -p "require('./package.json').version")
          BASE=$(echo "$CURRENT" | sed 's/-beta\.[0-9]*//')

          BUMP="${{ inputs.bump }}"
          IFS='.' read -r MAJOR MINOR PATCH <<< "$BASE"
          case "$BUMP" in
            major) MAJOR=$((MAJOR + 1)); MINOR=0; PATCH=0 ;;
            minor) MINOR=$((MINOR + 1)); PATCH=0 ;;
            patch) PATCH=$((PATCH + 1)) ;;
          esac
          NEW_BASE="$MAJOR.$MINOR.$PATCH"

          EXISTING=$(git tag -l "v${NEW_BASE}-beta.*" | sort -V | tail -1)
          if [ -z "$EXISTING" ]; then
            BETA_N=1
          else
            LAST_N=$(echo "$EXISTING" | sed 's/.*-beta\.//')
            BETA_N=$((LAST_N + 1))
          fi

          NEW_VERSION="${NEW_BASE}-beta.${BETA_N}"
          BETA_TAG="v${NEW_VERSION}"

          npm version "$NEW_VERSION" --no-git-tag-version
          git add package.json
          git commit -m "chore: release ${BETA_TAG}"
          git tag "$BETA_TAG"
          git push origin HEAD:main "$BETA_TAG"

          echo "beta_tag=$BETA_TAG" >> $GITHUB_OUTPUT
          echo "new_version=$NEW_VERSION" >> $GITHUB_OUTPUT

  ci:
    needs: version
    uses: ./.github/workflows/ci.yml

  build-mac:
    needs: [version, ci]
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v6
        with:
          ref: ${{ needs.version.outputs.beta_tag }}
      - uses: pnpm/action-setup@v6
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v6
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: pnpm
      - run: pnpm install --frozen-lockfile --ignore-scripts
      - run: pnpm exec electron-builder install-app-deps
      - name: Build
        env:
          CSC_IDENTITY_AUTO_DISCOVERY: false
          PRODUCT_NAME: ReYoGo Staging
          UPDATE_FEED_URL: ${{ vars.STAGING_UPDATE_FEED_URL }}
          VITE_APP_ENV: staging
        run: |
          pnpm run clean
          pnpm run electron:build
          pnpm exec electron-builder --mac
      - uses: actions/upload-artifact@v7
        with:
          name: dist-mac
          path: release/
          retention-days: 7

  build-win:
    needs: [version, ci]
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v6
        with:
          ref: ${{ needs.version.outputs.beta_tag }}
      - uses: pnpm/action-setup@v6
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v6
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: pnpm
      - run: pnpm install --frozen-lockfile --ignore-scripts
      - run: pnpm exec electron-builder install-app-deps
      - name: Build
        env:
          PRODUCT_NAME: ReYoGo Staging
          UPDATE_FEED_URL: ${{ vars.STAGING_UPDATE_FEED_URL }}
          VITE_APP_ENV: staging
        run: |
          pnpm run clean
          pnpm run electron:build
          pnpm exec electron-builder --win
      - uses: actions/upload-artifact@v7
        with:
          name: dist-win
          path: release/
          retention-days: 7

  publish-staging:
    name: Approve — upload to staging
    needs: [version, build-mac, build-win]
    runs-on: ubuntu-latest
    environment: staging
    permissions:
      id-token: write
      contents: read
    steps:
      - uses: actions/download-artifact@v8
        with:
          name: dist-mac
          path: artifacts/
      - uses: actions/download-artifact@v8
        with:
          name: dist-win
          path: artifacts/
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: eu-west-2
      - name: Upload to S3 staging
        run: aws s3 sync artifacts/ s3://reyogo-desktop-releases/staging/

  promote:
    name: Approve — promote to production
    needs: [version, publish-staging]
    runs-on: ubuntu-latest
    environment: promote
    permissions:
      contents: write
    steps:
      - name: Generate app token
        id: app-token
        uses: actions/create-github-app-token@v3
        with:
          app-id: ${{ secrets.APP_ID }}
          private-key: ${{ secrets.APP_PRIVATE_KEY }}

      - uses: actions/checkout@v6
        with:
          fetch-depth: 0
          token: ${{ steps.app-token.outputs.token }}

      - name: Create production tag
        run: |
          BETA_TAG="${{ needs.version.outputs.beta_tag }}"
          PROD_VERSION=$(echo "$BETA_TAG" | sed 's/v//' | sed 's/-beta\.[0-9]*//')
          PROD_TAG="v${PROD_VERSION}"
          git config user.name "ReYoGo-bot[bot]"
          git config user.email "ReYoGo-bot[bot]@users.noreply.github.com"
          git fetch --tags
          git tag "$PROD_TAG"
          git push origin "$PROD_TAG"
```

- [ ] **Step 4: Create .github/workflows/release-prod.yml**

```yaml
name: Release to Production

on:
  push:
    tags: ['v*']

concurrency:
  group: release-prod
  cancel-in-progress: false

env:
  NODE_VERSION: "24"
  PNPM_VERSION: "9.15.0"

jobs:
  check:
    runs-on: ubuntu-latest
    outputs:
      is_release: ${{ steps.check.outputs.is_release }}
    steps:
      - id: check
        run: |
          if [[ "${{ github.ref_name }}" =~ -beta\. ]]; then
            echo "is_release=false" >> $GITHUB_OUTPUT
          else
            echo "is_release=true" >> $GITHUB_OUTPUT
          fi

  build-mac:
    needs: check
    if: needs.check.outputs.is_release == 'true'
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v6
      - uses: pnpm/action-setup@v6
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v6
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: pnpm
      - run: pnpm install --frozen-lockfile --ignore-scripts
      - run: pnpm exec electron-builder install-app-deps
      - name: Build
        env:
          CSC_IDENTITY_AUTO_DISCOVERY: false
          PRODUCT_NAME: ReYoGo
          UPDATE_FEED_URL: ${{ vars.PROD_UPDATE_FEED_URL }}
          VITE_APP_ENV: production
        run: |
          pnpm run clean
          pnpm run electron:build
          pnpm exec electron-builder --mac
      - uses: actions/upload-artifact@v7
        with:
          name: dist-mac
          path: release/
          retention-days: 7

  build-win:
    needs: check
    if: needs.check.outputs.is_release == 'true'
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v6
      - uses: pnpm/action-setup@v6
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v6
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: pnpm
      - run: pnpm install --frozen-lockfile --ignore-scripts
      - run: pnpm exec electron-builder install-app-deps
      - name: Build
        env:
          PRODUCT_NAME: ReYoGo
          UPDATE_FEED_URL: ${{ vars.PROD_UPDATE_FEED_URL }}
          VITE_APP_ENV: production
        run: |
          pnpm run clean
          pnpm run electron:build
          pnpm exec electron-builder --win
      - uses: actions/upload-artifact@v7
        with:
          name: dist-win
          path: release/
          retention-days: 7

  publish-production:
    name: Approve — upload to production
    needs: [build-mac, build-win]
    runs-on: ubuntu-latest
    environment: production
    permissions:
      id-token: write
      contents: write
    steps:
      - uses: actions/download-artifact@v8
        with:
          name: dist-mac
          path: artifacts/
      - uses: actions/download-artifact@v8
        with:
          name: dist-win
          path: artifacts/
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: eu-west-2
      - name: Upload to S3 production
        run: aws s3 sync artifacts/ s3://reyogo-desktop-releases/production/
      - name: Create GitHub Release
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          gh release create ${{ github.ref_name }} \
            --repo ${{ github.repository }} \
            --generate-notes \
            --title "${{ github.ref_name }}"
```

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/
git commit -m "feat: replace pipeline with staged release workflows"
git push
```

---

## Verification

1. **Local build:** `pnpm run build:mac` — completes, no `app-update.yml` in the packaged output (UPDATE_FEED_URL not set)
2. **Version bar in dev:** `pnpm run electron:dev` — bottom bar shows `v{version} • Development`
3. **Staging release:** Trigger `release-staging.yml` (patch bump) from GitHub Actions UI → approve staging gate → confirm files appear at `s3://reyogo-desktop-releases/staging/` via `aws s3 ls s3://reyogo-desktop-releases/staging/` → approve promote gate → confirm prod tag created
4. **Production release:** After promote, `release-prod.yml` triggers → approve production gate → confirm `s3://reyogo-desktop-releases/production/` updated → GitHub Release created at `https://github.com/Shane1995/ReYoGo/releases`
