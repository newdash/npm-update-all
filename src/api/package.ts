import { concurrency } from "@newdash/newdash/concurrency";
import { retry } from "@newdash/newdash/retry";
import debug from "debug";
import fetch from "node-fetch";
import semver from "semver";
import { DEFAULT_REGISTRY } from "../utils";
import { PackageQueryResult } from "./types";
const logger = debug("@newdash/npm-update-all:npm");

const RETRY_TIMES = 5;
const API_CONCURRENCY = 50;
const TIMEOUT = 30 * 1000;

export const isPackageExistOnRegistry = concurrency.limit(
  async (packageName: string, registry = DEFAULT_REGISTRY) => {
    const res = await retry(async () => {
      logger("check package exist or not: %o at %o", packageName, registry);
      return await fetch(`${registry}/${packageName}/latest`, { method: "HEAD", timeout: TIMEOUT });
    }, RETRY_TIMES)();

    if (res.status == 200) {
      return true;
    }
    if (res.status === 404) {
      return false;
    }
    return false;
  },
  API_CONCURRENCY
);


export async function queryPackage(packageName: string, registry = DEFAULT_REGISTRY): Promise<PackageQueryResult> {
  const { res, body } = await retry(async () => {
    logger("query package information started: %o at %o", packageName, registry);
    const res = await fetch(`${registry}/${packageName}`, {
      headers: {
        Accept: "application/vnd.npm.install-v1+json"
      },
      timeout: TIMEOUT
    });
    return { res, body: await res.json() };
  }, RETRY_TIMES)();

  if (res.status != 200) {
    throw new Error(body.error);
  }
  return body;
}

export const queryVersions = concurrency.limit(
  async (packageName: string, registry = DEFAULT_REGISTRY): Promise<Array<string>> => {
    const packageInfo = await queryPackage(packageName, registry);
    return semver.sort(Object.keys(packageInfo.versions).filter(version => semver.prerelease(version) === null));
  }, 
  API_CONCURRENCY
);