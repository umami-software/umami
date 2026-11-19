# Contributing to Umami

Thanks for your interest in contributing to Umami! This document outlines the process for contributing code.

## Branching

Umami uses the following long-lived branches:

- `master` — stable, released code. **Do not open PRs against `master`.**
- `dev` — active development. **All pull requests should target `dev`.**

Feature branches and fixes are merged into `dev`, and `dev` is periodically merged into `master` for releases.

## Submitting a Pull Request

1. Fork the repository and create your branch from `dev`:
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b my-feature
   ```
2. Make your changes. Keep PRs focused — one logical change per PR.
3. Ensure the project builds and lints cleanly:
   ```bash
   pnpm install
   pnpm build
   pnpm lint
   ```
4. Push your branch and open a pull request **against the `dev` branch**.
5. Fill in the PR description with what changed and why. Link any related issues.

PRs opened against `master` will be asked to retarget `dev`.

## Reporting Issues

- Search [existing issues](https://github.com/umami-software/umami/issues) before opening a new one.
- For bugs, include reproduction steps, expected vs. actual behavior, and your environment (Umami version, database, browser).
- For feature requests, describe the use case before the proposed solution.

## Development Setup

See the [README](./README.md) for instructions on installing dependencies, configuring the database, and running Umami locally.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
