import { concurrency } from "@newdash/newdash/concurrency";
import { retry } from "@newdash/newdash/retry";
import fetch from "node-fetch";
import semver from "semver";
import { DEFAULT_REGISTRY } from "../utils";

export interface PackageQueryResult {
  name: string;
  "dist-tags": DistTags;
  versions: Versions;
  time: Time;
  maintainers: Maintainer[];
  description: string;
  contributors: Contributor[];
  license: string;
  readme: string;
  readmeFilename: string;
  homepage: string;
  repository: Repository;
  bugs: Bugs;
  keywords: string[];
}

export interface Bugs {
  url: string;
}

export interface Contributor {
  name: string;
  email?: string;
  url: string;
}


export interface DistTags {
  latest: string;
}

export interface Maintainer {
  name: string;
  email: string;
}


export interface Repository {
  type: string;
  url: URL;
}

export interface Time {
  [key: string]: string
}

export interface Versions {
  [key: string]: VersionInfo
}

export interface VersionInfo {
  name: string;
  version?: string;
  license?: string;
  main?: string;
  engines?: any;
  contributors?: Contributor[];
  scripts?: any;
  devDependencies?: any;
  dependencies?: any;
  jest?: any;
  gitHead?: string;
  description: string;
  dist?: any;
  maintainers?: Maintainer[];
  directories?: any;
  repository?: Repository;
  keywords?: string[];
  bugs?: Bugs;
  homepage?: string;
}

export const isPackageExistOnRegistry = concurrency.limit(
  async (packageName: string, registry = DEFAULT_REGISTRY) => {
    const res = await fetch(`${registry}/${packageName}`);
    const body = await res.json();
    if (res.status == 200) {
      return true;
    }
    if (res.status === 404) {
      return false;
    }
    throw new Error(body.error);
  },
  5
);


export async function queryPackage(packageName: string, registry = DEFAULT_REGISTRY): Promise<PackageQueryResult> {
  const { res, body } = await retry(async () => {
    const res = await fetch(`${registry}/${packageName}`);
    return { res, body: await res.json() };
  }, 3)(); // retry 3 times

  if (res.status != 200) {
    throw new Error(body.error);
  }
  return body;
}

export const queryVersions = concurrency.limit(async (packageName: string, registry = DEFAULT_REGISTRY): Promise<Array<string>> => {
  const packageInfo = await queryPackage(packageName, registry);
  return semver.sort(Object.keys(packageInfo.versions).filter(version => semver.prerelease(version) === null));
}, 5);