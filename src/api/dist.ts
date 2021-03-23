import { concurrency } from "@newdash/newdash/concurrency";
import fetch from "node-fetch";
import { DEFAULT_REGISTRY } from "../utils";

export interface PackageDistQueryResult {
  latest: string;
  [key: string]: string;
}


export const queryPackageDistTag = concurrency.limit(
  async (packageName: string, registry = DEFAULT_REGISTRY): Promise<PackageDistQueryResult> => {
    const url = `${registry}-/package/${packageName}/dist-tags`;
    const res = await fetch(url);
    if (res.status != 200) {
      throw new Error(`fetch ${url} failed: ${await res.text()}`);
    } else {
      return await res.json();
    }
  },
  2
);