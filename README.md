# Nym

![Tests](https://github.com/personaelabs/nym/actions/workflows/ci.yml/badge.svg)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Coming soon...

## Running commands

To run a specifc command in a workspace from the root folder:

1. Make sure the package exists in the [package.json](./package.json) `dependencies` with `<package_name>: "workspace:*"`
   - Ex: `"frontend": "workspace:*"`
2. Run `pnpm -F <package_name> run <command>`
   - Ex: `pnpm -F frontend run dev:all`

# Dev branch

Just for using prod frontend with staging db.

testing
