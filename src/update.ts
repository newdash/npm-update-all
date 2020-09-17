import cliProgress from 'cli-progress';
import "colors";
import { program } from "commander";
import fs from "fs";
import semver from 'semver';
import { queryPackageDistTag } from "./api";
import { getRegistry } from "./npm";
import { DependencyType } from "./types";
import { confirm } from "./utils";

export async function updateDependencyForPackage(pkgJsonLocation: string) {
  if (fs.existsSync(pkgJsonLocation)) {
    const targetPkgJson = require(pkgJsonLocation);
    const { dependencies, devDependencies } = targetPkgJson;
    const deps = Object.keys(targetPkgJson.dependencies ?? {});
    const devDeps = Object.keys(targetPkgJson.devDependencies ?? {});
    const registry = await getRegistry();

    console.log(`Using package.json ${pkgJsonLocation.green}`);
    console.log(`Pulling package information from ${registry.green}`);

    const progress = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    progress.start(deps.length + devDeps.length, 0);

    const depsInfo = await Promise.all(deps.map(async dep => {
      const { latest } = await queryPackageDistTag(dep, registry);
      progress.increment();
      return { name: dep, version: latest, type: DependencyType.dep, parentNode: dependencies };
    }));

    const devDepsInfo = await Promise.all(devDeps.map(async dep => {
      const { latest } = await queryPackageDistTag(dep, registry);
      progress.increment();
      return { name: dep, version: latest, type: DependencyType.devDep, parentNode: devDependencies };
    }));

    progress.stop();

    let updateCount = 0;

    for (const dep of [...depsInfo, ...devDepsInfo]) {
      const { parentNode } = dep;
      const currentVersion = semver.minVersion(parentNode[dep.name]).version;

      if (currentVersion !== dep.version) {
        const confirmMessage = `Update ${dep.type.yellow} ${dep.name.green} from ${currentVersion.gray} to ${dep.version.blue} ?`;
        if (await confirm(confirmMessage, program.yes)) {
          updateCount++;
          // write back
          parentNode[dep.name] = `^${dep.version}`;
        }
      }
    }

    if (updateCount > 0) {
      const confirmMessage = `Confirm write to ${pkgJsonLocation.red} ?`;
      if (await confirm(confirmMessage, program.yes)) {
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