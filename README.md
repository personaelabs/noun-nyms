<div align="center">
    <h1>Noun Nyms</h1>
    <strong>Noun Nyms is a protocol and webapp for using nounish pseudonyms.</strong>
</div>
<br>
<div align="center">
	<a href="https://github.com/personaelabs/nym/actions/workflows/ci.yml">
		<img src="https://github.com/personaelabs/nym/actions/workflows/ci.yml/badge.svg">
	</a>    
	<a href="https://twitter.com/PersonaeLabs">
        <img src="https://img.shields.io/twitter/follow/personae_labs?label=personae_labs&style=flat&logo=twitter&color=1DA1F2" alt="Twitter">
    </a>
</div>

<div align="center">
    <br>
    <a href="https://nouns.nymz.xyz/"><b>nouns.nymz.xyz »</b></a>
    <a href="https://nouns.nymz.xyz/api-doc"><b>Public API Docs »</b></a>
    <a href="https://discord.gg/3NQm99v3Vp"><b>Support »</b></a>
</div>


## Packages

| Name  | Description |
| ------------- | ------------- |
| [circuits/](./packages/circuits)  | spartan circuit definitions |
| [nymjs/](./packages/nymjs)  | frontend lib for creating and using nyms |
| [frontend/](./packages/frontend)  | noun nyms webapp |
| [merkle_tree/](./packages/merkle_tree)  | merkle tree indexing service |
| [db/](./packages/db)  | postgres db schema |
| [test_data/](./packages/test_data)  | test data population for development builds |


## Running commands

To run a specifc command in a workspace from the root folder:

1. Make sure the package exists in the [package.json](./package.json) `dependencies` with `<package_name>: "workspace:*"`
   - Ex: `"frontend": "workspace:*"`
2. Run `pnpm -F <package_name> run <command>`
   - Ex: `pnpm -F frontend run dev:all`