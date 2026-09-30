# Cyber Companion — Mandatory Agent Git Branching & Sync Rules

Whenever implementing any feature, module, bugfix, or update in this repository (`https://github.com/Anurag3215/Cyber-Companion-v2.git`), you **MUST** automatically execute the following Git branching workflow without waiting for the user to ask:

1. **Never work directly on `main` or `develop` for feature implementation.**
   - Checkout the appropriate `feature/<module-name>` branch (or create a new `feature/<name>` branch off `develop` using `.\scripts\git-sync.ps1 -Action new -Feature "feature/<name>"`).
   - Existing module branches:
     - `feature/wifi-risk-analyzer`
     - `feature/url-scanner`
     - `feature/qr-scanner`
     - `feature/permission-analyzer`
     - `feature/security-score`
     - `feature/cyber-awareness`

2. **Automatic Feature -> `develop` -> All `feature/*` Synchronization:**
   - Commit all changes on the target `feature/<name>` branch using strict Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`).
   - Immediately synchronize the feature update into `develop` and pull `develop` back into all other `feature/*` branches (handled automatically by the `.githooks/post-commit` hook or by running `.\scripts\git-sync.ps1 -Action sync -Feature "feature/<name>"`).
   - Ensure all branches (`develop` and all `feature/*` branches) are pushed to `origin` (`https://github.com/Anurag3215/Cyber-Companion-v2.git`).

3. **Release Promotion to `main`:**
   - Only merge `develop` into `main` (`.\scripts\git-sync.ps1 -Action release`) when a milestone/phase is verified or when requested.
