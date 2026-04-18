---
description: Clean up a component — remove comments, extract sub-components, abstract hooks, move utils
argument-hint: path to component file or folder
---

Clean up the component at $ARGUMENTS following these steps:

## Conventions
- Every component/hook lives in a folder named after it, with an `index.tsx` (or `index.ts`) entry point
- Sub-components extracted from a file go into their own `SubComponentName/index.tsx` inside the same parent folder
- Custom hooks go into a `hooks/` directory co-located with the component, each as `hooks/useHookName/index.ts`
- Utility functions go into a `utils/` directory co-located with the component, each as a descriptive `.ts` file
- Use absolute `@/` imports for cross-feature deps, relative `./` imports within the same folder
- Named exports preferred; default exports only at the `index` entry file

## Steps

1. **Read** the target file(s) in full
2. **Remove all comments** — inline, block, and JSDoc. Only keep a comment if removing it would lose a non-obvious constraint or workaround
3. **Extract sub-components** — any JSX-returning function inside the file that isn't the primary component moves to its own `SubComponentName/index.tsx` in the same folder
4. **Extract custom hooks** — any `use*` function or named block of stateful/effectful logic moves to `hooks/useHookName/index.ts` relative to the component
5. **Extract utilities** — pure functions with no React dependency move to a `utils/` file, co-located
6. **Update all imports** — fix paths in the original file and all new files; `@/` for absolute, `./` for relative
7. **Verify** — re-read each changed file to confirm correctness and that no imports are broken

## Output

Report what changed:
- Comments removed (count)
- Sub-components extracted → new paths
- Hooks extracted → new paths
- Utils extracted → new paths
- Import paths updated
