import { concurrency } from "@newdash/newdash/concurrency";
import fetch from "node-fetch";

export interface PackageDistQueryResult {
  latest: string;
  [key: string]: string;
}

export const queryPackageDistTag = concurrency.limit(async (
  packageName: string,
  registry = 'https://registry.npmjs.org/'
): Promise<PackageDistQueryResult> => {
  const res = await fetch(`${registry}-/package/${packageName}/dist-tags`);
  if (res.status != 200) {
    throw new Error(await res.text());
  } else {
    return await res.json();
  }
}, 5);