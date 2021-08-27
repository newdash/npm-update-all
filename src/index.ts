#!/usr/bin/env node
import "colors";
import { program } from "commander";
import path from "path";
import process from "process";
import { updateDependencyForPackage } from "./update";

const pkgInfo = require("../package.json");

program.version(pkgInfo.version);
program.option('-d, --debug', 'debug information');
program.option('-y, --yes', 'skip confirm');
program.option('-p, --package <location>', 'package json location', "package.json");


if (module == require.main) {

  (async () => {
    try {

      program.parse(process.argv);
      const pkgJsonLocation = path.join(process.cwd(), program.opts().package);
      await updateDependencyForPackage(pkgJsonLocation);

    } catch (error) {
      console.error(error);
    }

  })();

}


