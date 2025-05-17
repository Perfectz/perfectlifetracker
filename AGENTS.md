# Agent Instructions

This repository uses a mono‑repo structure with **frontend**, **backend**, **infra**, and **k8s** folders. When modifying files within this repository you must:

1. **Run Lint and Tests**
   - `cd frontend && npm run lint && npm test`
   - `cd backend && npm run lint && npm test`
2. **Validate Infrastructure**
   - `cd infra && terraform validate`
3. **Commit Style**
   - Use concise commit messages in the imperative mood.
   - Explain why the change is needed if it is not obvious.

Additional instructions can be added here in the future.
