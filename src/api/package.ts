import fetch from "node-fetch";

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


export async function queryPackage(packageName: string): Promise<PackageQueryResult> {
  const res = await fetch(`https://registry.npmjs.org/${packageName}`);
  const body = await res.json();
  if (res.status != 200) {
    throw new Error(body.error);
  }
  return body;
}