# Contribution guidelines

Thanks for your interest in contributing to noun nyms! We're an early stage project and appreciate any flavor of contribution, no matter the size.

To get in touch with maintainers, join the [Personae Labs discord server](https://discord.gg/t6TscDSbBm).

## Opening an issue

For small one-off bug fixes and reports, post in the [support channel](https://discord.gg/3NQm99v3Vp).

If you have a larger change to report, feel free to open a github issue! For bugfixes, please share complete reproduction steps.

## Running commands

To run a specific command in a workspace from the root folder:

1. Make sure the package exists in the [package.json](./package.json) `dependencies` with `<package_name>: "workspace:*"`
   - Ex: `"frontend": "workspace:*"`
2. Run `pnpm -F <package_name> run <command>`
   - Ex: `pnpm -F frontend run dev:all`