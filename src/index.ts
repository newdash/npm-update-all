#!/usr/bin/env node
import { trimPrefix } from "@newdash/newdash";
import "colors";
import { program } from "commander";
import fs from "fs";
import inquirer from "inquirer";
import path from "path";
import process from "process";
import { queryPackage } from "./api";
import { getLatestVersion } from "./utils";

const pkgInfo = require("../package.json");

program.version(pkgInfo.version);
program.option('-d, --debug', 'debug information');
program.option('-y, --yes', 'skip confirm');
program.option('-p, --package <location>', 'package json location', "package.json");


if (module == require.main) {

  (async () => {
    try {

      program.parse(process.argv);
      const pkgJsonLocation = path.join(process.cwd(), program.package);
      if (fs.existsSync(pkgJsonLocation)) {
        const targetPkgJson = require(pkgJsonLocation);
        const deps = Object.keys(targetPkgJson.dependencies);
        const devDeps = Object.keys(targetPkgJson.devDependencies);

        const depsInfo = await Promise.all(deps.map(async dep => {
          const info = await queryPackage(dep);
          const version = getLatestVersion(info);
          return { name: info.name, version };
        }));

        for (const dep of depsInfo) {
          const currentVersion = trimPrefix(targetPkgJson.dependencies[dep.name], "^");
          if (currentVersion !== dep.version) {
            const { update } = await inquirer.prompt([{
              name: "update",
              message: `update ${dep.name.green} from ${currentVersion.gray} to ${dep.version.blue} ?`,
              type: "confirm",
              default: true,
            }]);

            if (update) {
              targetPkgJson.dependencies[dep.name] = `^${dep.version}`;
            }

          }
        }

        fs.writeFileSync(pkgJsonLocation, JSON.stringify(targetPkgJson, undefined, 2), { encoding: "utf8" });

      }
      else {
        console.error(`file: ${pkgJsonLocation} not exist.`);
      }

    } catch (error) {
      console.error(error);
    }

  })();

}


