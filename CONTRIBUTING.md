# Contributing to @tapizlabs/identity

Thanks for your interest in improving `@tapizlabs/identity`. This package is part of the
[Tapiz](https://tapiz.site) ecosystem.

## Development

```bash
npm install
npm run build      # compile to dist/
npm run typecheck  # tsc --noEmit
```

## Pull requests

1. Branch from `main` (`feat/...`, `fix/...`, `docs/...`).
2. Keep changes small and focused; one concern per PR.
3. Run `npm run build && npm run typecheck` before opening the PR.
4. Follow [Conventional Commits](https://www.conventionalcommits.org/) for messages.
5. Avoid `any`; prefer named types / `z.infer` for external input.

## Reporting issues

Open a GitHub issue with a minimal reproduction, expected vs. actual behavior,
and the package version (`npm ls @tapizlabs/identity`).

## License

By contributing you agree your contributions are licensed under the [MIT License](./LICENSE).
