#!/usr/bin/env node
import "colors";
import { program } from "commander";
import debug from "debug";
import path from "path";
import process from "process";
import { updateDependencyForPackage } from "./update";

const logger = debug("@newdash/npm-update-all:main");

const pkgInfo = require("../package.json");

program.version(pkgInfo.version);
program.option("-d, --debug", "debug information");
program.option("-y, --yes", "skip confirm");
program.option("-p, --package <location>", "package json location", "package.json");


if (module == require.main) {

  (async () => {
    try {

      program.parse(process.argv);
      logger("cli option: %o", program.opts());
      const pkgJsonLocation = path.join(process.cwd(), program.opts().package);
      await updateDependencyForPackage(pkgJsonLocation);
      process.exit(0);
    } catch (error) {
      console.error(error);
    }

  })();

}


