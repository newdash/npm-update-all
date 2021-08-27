// @ts-nocheck
import * as uuid from "uuid";
import { queryPackage, queryPackageDistTag } from "../src/api";
import { queryVersions } from "../src/api/package";

describe('API Test Suite', () => {

  it('should query package for @newdash/newdash', async () => {
    const pkg = "@newdash/newdash";
    const info = await queryPackage(pkg);
    expect(info.name).toBe(pkg);
  });

  it('should raise error when not found', async () => {

    await expect(() => queryPackage("@newdash/not-exist-package")).rejects.toThrow("Not found");

  });

  it('should query package dist tags for debug', async () => {
    const distTags = await queryPackageDistTag("debug");
    expect(distTags.latest).not.toBeUndefined();
    expect(distTags.beta).not.toBeUndefined();
  });


  it('should raise error when not found', async () => {
    await expect(() => queryPackageDistTag(uuid.v4())).rejects.toThrow(`"Not Found"`);
  });

  it('should support query versions with sort', async () => {
    const versions = await queryVersions("typescript");
    expect(versions.length).toBeGreaterThan(0);
  });


});