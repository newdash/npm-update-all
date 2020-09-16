#!/usr/bin/env node
import { trimPrefix } from "@newdash/newdash";
import cliProgress from 'cli-progress';
import "colors";
import { program } from "commander";
import fs from "fs";
import path from "path";
import process from "process";
import { queryPackage } from "./api";
import { getRegistry } from "./npm";
import { DependencyType } from "./types";
import { confirm } from "./utils";

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
        const deps = Object.keys(targetPkgJson.dependencies ?? {});
        const devDeps = Object.keys(targetPkgJson.devDependencies ?? {});
        const registry = await getRegistry();

        console.log(`Using package.json ${pkgJsonLocation.green}`);
        console.log(`Pulling package information from ${registry.green}`);

        const progress = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
        progress.start(deps.length + devDeps.length, 0);

        const depsInfo = await Promise.all(deps.map(async dep => {
          const info = await queryPackage(dep, registry);
          progress.increment();
          const version = info["dist-tags"].latest;
          return { name: info.name, version, type: DependencyType.dep };
        }));

        const devDepsInfo = await Promise.all(devDeps.map(async dep => {
          const info = await queryPackage(dep, registry);
          progress.increment();
          const version = info["dist-tags"].latest;
          return { name: info.name, version, type: DependencyType.devDep };
        }));

        progress.stop();

        let updateCount = 0;

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
            const confirmMessage = `update ${dep.name.green} from ${currentVersion.gray} to ${dep.version.blue} ?`;
            if (await confirm(confirmMessage, program.yes)) {
              updateCount++;
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

        if (updateCount > 0) {
          const confirmMessage = `Confirm write to ${pkgJsonLocation.red} ?`;
          if (confirm(confirmMessage, program.yes)) {
            // sync
            fs.writeFileSync(
              pkgJsonLocation,
              JSON.stringify(targetPkgJson, undefined, 2), { encoding: "utf8" }
            );
            console.log("Updated".green);
          } else {
            console.log('Skip update.'.grey);
          }
        } else {
          console.log('Nothing to update.'.grey);
        }


      }
      else {
        console.error(`file: ${pkgJsonLocation} not exist.`);
      }

    } catch (error) {
      console.error(error);
    }

  })();

}


