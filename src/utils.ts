import compareVersions from "compare-versions";
import { PackageQueryResult } from "./api/package";

export function getLatestVersion(info: PackageQueryResult) {
  const versions = Object.keys(info.versions);
  return versions.sort(compareVersions).reverse()[0];
}