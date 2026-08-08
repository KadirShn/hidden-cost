# Contributing

- Read `docs/PRODUCT_SPEC.md` before changing behavior.
- Keep domain calculations independent of UI and infrastructure.
- Add tests for every behavior change.
- Do not commit secrets or production service credentials.
- Keep Turkish and English translations aligned.

Before a pull request:

```bash
npm run typecheck
npm run lint
npm test
```
