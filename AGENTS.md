<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Cloudflare Deploy (OpenNext on Windows)

**Known issue:** The `opennextjs-cloudflare build` command fails on Windows with `EPERM: Permission denied` when trying to delete `.open-next/` because it contains symlinks.

**Fix (run before every deploy):**
```powershell
# Kill any node processes that may hold locks on .open-next
taskkill /F /IM node.exe 2>$null; Start-Sleep -Seconds 3
# Remove the .open-next directory using cmd (handles symlinks better)
cmd /c "rmdir /s /q D:\web\form-builder\.open-next" 2>$null
# Then deploy
npm run deploy
```

**Alternative (if above fails):** Open an **admin PowerShell** and run `npm run deploy` from there.

**Do NOT** run `npm run build` separately before `npm run deploy` — the deploy script runs build internally. Running build separately can leave stale files in `.next/` that cause `ENOENT: middleware-manifest.json` errors during the OpenNext bundle step.
