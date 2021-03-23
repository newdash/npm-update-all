import cliProgress from 'cli-progress';
import "colors";
import { program } from "commander";
import fs from "fs";
import semver from 'semver';
import { queryPackageDistTag } from "./api";
import { isPackageExistOnRegistry } from './api/package';
import { getRegistry } from "./npm";
import { DependencyType } from "./types";
import { confirm } from "./utils";

export async function updateDependencyForPackage(pkgJsonLocation: string) {
  if (fs.existsSync(pkgJsonLocation)) {
    const targetPkgJson = require(pkgJsonLocation);
    const { dependencies, devDependencies } = targetPkgJson;

    const registry = await getRegistry();
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
        existOnRegistry: true
      })),
      ...devDeps.map(dep => ({
        name: dep,
        version: undefined,
        type: DependencyType.devDep,
        parentNode: devDependencies,
        existOnRegistry: true
      }))
    ];

    const allDepsInfo = await Promise.all(allDeps.map(async dep => {

      try {

        if (await isPackageExistOnRegistry(dep.name, registry)) {
          const { latest } = await queryPackageDistTag(dep.name, registry);
          return { ...dep, version: latest };
        }
        return { ...dep, existOnRegistry: false };

      } catch (error) {
        throw error;
      } finally {
        progress.increment();
      }

    }));

    progress.stop();

    let updateCount = 0;

    for (const dep of allDepsInfo) {
      const { parentNode } = dep;
      const currentVersion = parentNode[dep.name];

      if (dep.existOnRegistry) {

        if (semver.gt(dep.version, semver.minVersion(currentVersion))) {
          const matchCurrentVersion = semver.satisfies(dep.version, currentVersion);
          const confirmMessage = [
            "Update",
            dep.type.yellow,
            dep.name.green,
            "from",
            currentVersion.gray,
            "to",
            `^${dep.version}`.blue,
            matchCurrentVersion ? "?" : "(possible break upgrade)?".red
          ];

          if (await confirm(confirmMessage.join(" "), program.yes, matchCurrentVersion)) {
            updateCount++;
            parentNode[dep.name] = `^${dep.version}`; // write updated version
          }

        }
      } else {
        console.warn(`${"?".yellow} Update ${dep.type.yellow} ${dep.name.green} ${"skipped, not exist on registry".grey}`);
      }


    }

    if (updateCount > 0) {
      const confirmMessage = `Confirm write to ${pkgJsonLocation.red} ?`;
      if (await confirm(confirmMessage, program.yes, true)) {
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