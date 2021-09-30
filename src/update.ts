import { find } from "@newdash/newdash/find";
import cliProgress from 'cli-progress';
import "colors";
import { program } from "commander";
import debug from "debug";
import fs from "fs";
import semver from 'semver';
import { isPackageExistOnRegistry, queryVersions } from './api/package';
import { getRegistry } from "./npm";
import { DependencyType } from "./types";
import { confirm } from "./utils";

const logger = debug("@newdash/npm-update-all:update");

export async function updateDependencyForPackage(pkgJsonLocation: string) {

  if (fs.existsSync(pkgJsonLocation)) {
    const targetPkgJson = require(pkgJsonLocation);
    const { dependencies, devDependencies } = targetPkgJson;

    const registry = await getRegistry();
    
    logger("registry: %o", registry);
    
    const deps = Object.keys(targetPkgJson.dependencies ?? {});
    const devDeps = Object.keys(targetPkgJson.devDependencies ?? {});

    console.log(`Using package.json ${pkgJsonLocation.green}`);
    console.log(`Pulling package information from ${registry.green}`);

    const progress = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    progress.start(deps.length + devDeps.length, 0);

    const allDeps = [
      ...deps.map(dep => ({
        name: dep,
        version: undefined,
        type: DependencyType.dep,
        parentNode: dependencies,
        existOnRegistry: true,
      })),
      ...devDeps.map(dep => ({
        name: dep,
        version: undefined,
        type: DependencyType.devDep,
        parentNode: devDependencies,
        existOnRegistry: true,
      }))
    ];

    const allDepsInfo: { [version: string]: string[] } = (
      await Promise.all([...deps, ...devDeps].map(async depName => {

        try {

          if (await isPackageExistOnRegistry(depName, registry)) {
            const versions = await queryVersions(depName, registry);
            return { depName, versions };
          }

        } catch (error) {
          console.error([
            depName.yellow,
            "is not existed on registry".red
          ].join(" "));
          return { depName, versions: [] };
        } finally {
          progress.increment();
        }

      }))
    ).reduce((pre, cur) => {
      pre[cur.depName] = cur.versions;
      return pre;
    }, {});

    progress.stop();

    let updateCount = 0;

    for (const dep of allDeps) {

      const { parentNode } = dep;
      const currentVersion = parentNode[dep.name];
      const remoteVersions = allDepsInfo[dep.name];

      const toBeUpdatedVersion = find(remoteVersions.reverse(), remoteVersion => { return semver.gt(remoteVersion, semver.minVersion(currentVersion)) && semver.satisfies(remoteVersion, currentVersion); });

      if (toBeUpdatedVersion) {
        const confirmMessage = [
          "?".yellow,
          "Update",
          dep.type.yellow,
          dep.name.green,
          "from",
          currentVersion.gray,
          "to",
          `^${toBeUpdatedVersion}`.blue,
        ];
        if (await confirm(confirmMessage.join(" "), program.opts().yes)) {
          updateCount++;
          parentNode[dep.name] = `^${toBeUpdatedVersion}`; // write updated version
        }
      }

    }

    if (updateCount > 0) {
      const confirmMessage = `Confirm write to ${pkgJsonLocation.red} ?`;
      if (await confirm(confirmMessage, program.opts().yes, true)) {
        // sync
        fs.writeFileSync(
          pkgJsonLocation,
          JSON.stringify(targetPkgJson, undefined, 2), { encoding: "utf8" }
        );
        console.log(`File ${pkgJsonLocation.green} ${"Updated".green}`);
      } else {
        console.log('Update Skipped.'.grey);
      }
    } else {
      console.log('Nothing to update.'.grey);
    }


  }
  else {
    console.error(`file: ${pkgJsonLocation} not exist.`);
  }
}