
import { queryPackage } from "../src/api";
describe('API Test Suite', () => {

  it('should query package for @newdash/newdash', async () => {
    const pkg = "@newdash/newdash";
    const info = await queryPackage(pkg);
    expect(info.name).toBe(pkg);
  });

  it('should raise error when not found', async () => {

    await expect(() => queryPackage("@newdash/not-exist-package")).rejects.toThrow("Not found");

  });

});