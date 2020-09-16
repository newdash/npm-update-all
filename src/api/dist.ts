import fetch from "node-fetch";

export interface PackageDistQueryResult {
  latest: string;
  [key: string]: string;
}


export async function queryPackageDistTag(
  packageName: string,
  registry = 'https://registry.npmjs.org/'
): Promise<PackageDistQueryResult> {
  const res = await fetch(`${registry}-/package/${packageName}/dist-tags`);
  if (res.status != 200) {
    throw new Error(await res.text());
  } else {
    return await res.json();
  }
}