# Contributing to NagrikLens AI

Thank you for your interest in contributing to **NagrikLens AI: Multilingual Citizen Development Intelligence Platform**! We welcome contributions from developers, civic researchers, and open-source enthusiasts.

---

## Code of Conduct

We are committed to providing a friendly, safe, and welcoming environment for everyone, regardless of background or experience level. Please treat all contributors with respect and constructive collaboration.

---

## Getting Started

1. **Fork and Clone the Repository:**
   ```bash
   git clone https://github.com/Patelprincekumar2007/jan-setu-ai.git
   cd jan-setu-ai
   ```

2. **Set Up Local Environments:**
   - **Backend:** Follow the backend virtualenv and dependencies setup in the [README.md](README.md#6-quick-start--local-setup-guide).
   - **Frontend:** Follow the Vite/React setup in `frontend/`.

3. **Create a Topic Branch:**
   ```bash
   git checkout -b feat/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

---

## Development & Testing Standards

Before submitting changes, ensure all verification checks pass:

- **Backend Pytest Test Suite:**
  ```bash
  pytest tests/ -v
  ```
- **Frontend TypeScript Verification:**
  ```bash
  cd frontend
  npm run lint
  ```

---

## Commit Message Conventions

We adhere to the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat(module): ...` for new features
- `fix(module): ...` for bug fixes
- `docs(readme): ...` for documentation updates
- `refactor(module): ...` for code refactoring
- `test(module): ...` for adding or updating tests
- `chore: ...` for maintenance or repository configuration

---

## Pull Request Guidelines

1. **Keep PRs Focused:** Submit small, targeted PRs with clear descriptions of the problem and proposed solution.
2. **Preserve Determinism:** Never bypass tests or disable validation schemas.
3. **Link Issues:** Reference any related issues or discussions in your PR description.
4. **Security & Guardrails:** Adhere strictly to the anti-prompt injection and evidence-grounding guardrails when proposing AI or RAG updates.

---

## License

By contributing to NagrikLens AI, you agree that your contributions will be licensed under the [MIT License](LICENSE).
