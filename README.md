# npm update all

![node-test](https://github.com/newdash/npm-update-all/workflows/node-test/badge.svg)
[![npm (scoped)](https://img.shields.io/npm/v/@newdash/npm-update-all?label=@newdash/npm-update-all)](https://www.npmjs.com/package/@newdash/npm-update-all)

Update **all** dependencies to the latest version.

Currently, you can use [`npm update`](https://docs.npmjs.com/cli/v8/commands/npm-update) command as alternative

## Usage

```bash
npm i -g @newdash/npm-update-all # install
npm-update-all # in current project
npm-update-all -p ./subject/package.json # in a relative project
```

## Example

```bash
npx @newdash/npm-update-all
Using package.json /Users/TheoSun/repos/odata-v4-parser/package.json
Pulling package information from https://registry.npmjs.org
 ████████████████████████████████████████ 100% | ETA: 0s | 12/12
? Update @newdash/newdash from 5.12.0 to 5.13.0 ? Yes
? Update @types/jest from 26.0.10 to 26.0.13 ? Yes
? Update @types/node from 14.6.0 to 14.10.2 ? Yes
? Update @typescript-eslint/eslint-plugin from 3.10.1 to 4.1.1 ? Yes
? Update @typescript-eslint/parser from 3.10.1 to 4.1.1 ? Yes
? Update eslint from 7.7.0 to 7.9.0 ? Yes
? Update typescript from 3.9.7 to 4.0.2 ? Yes
? Confirm write to /Users/TheoSun/repos/odata-v4-parser/package.json ? Yes
```

## [CHANGELOG](./CHANGELOG.md)

## [LICENSE](./LICENSE)
