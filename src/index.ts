#!/usr/bin/env node
import { trimPrefix } from "@newdash/newdash";
import cliProgress from 'cli-progress';
import "colors";
import { program } from "commander";
import fs from "fs";
import inquirer from "inquirer";
import path from "path";
import process from "process";
import { queryPackage } from "./api";
import { DependencyType } from "./types";

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

        console.log(`use package.json ${pkgJsonLocation.green}`);
        console.log(`pulling package information from ${'https://registry.npmjs.org'.green}`);

        const progress = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
        progress.start(deps.length + devDeps.length, 0);

        const depsInfo = await Promise.all(deps.map(async dep => {
          const info = await queryPackage(dep);
          progress.increment();
          const version = info["dist-tags"].latest;
          return { name: info.name, version, type: DependencyType.dep };
        }));

        const devDepsInfo = await Promise.all(devDeps.map(async dep => {
          const info = await queryPackage(dep);
          progress.increment();
          const version = info["dist-tags"].latest;
          return { name: info.name, version, type: DependencyType.devDep };
        }));

        progress.stop();

        for (const dep of [...depsInfo, ...devDepsInfo]) {
          let currentVersion = '';
          switch (dep.type) {
            case DependencyType.dep:
              currentVersion = trimPrefix(targetPkgJson.dependencies[dep.name], "^");
              break;
            case DependencyType.devDep:
              currentVersion = trimPrefix(targetPkgJson.devDependencies[dep.name], "^");
              break;
          }

          if (currentVersion !== dep.version) {

            const { update } = await inquirer.prompt([{
              name: "update",
              message: `update ${dep.name.green} from ${currentVersion.gray} to ${dep.version.blue} ?`,
              type: "confirm",
              default: true,
            }]);

            if (update) {
              // write back
              switch (dep.type) {
                case DependencyType.dep:
                  targetPkgJson.dependencies[dep.name] = `^${dep.version}`;
                  break;
                case DependencyType.devDep:
                  targetPkgJson.devDependencies[dep.name] = `^${dep.version}`;
                  break;
              }
            }

          }
        }

        // sync
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


