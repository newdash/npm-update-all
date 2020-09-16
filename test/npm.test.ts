import semver from 'semver';
import { getRegistry } from "../src/npm";

describe('NPM internal test Suite', () => {

  it('should support get registry', async () => {
    const registry = await getRegistry();
    expect(registry).not.toBeUndefined();
  });

  it('should support check relative version', () => {
    expect(semver.minVersion("^1.2.3").version).toBe("1.2.3");
    expect(semver.minVersion(">=1.2.3").version).toBe("1.2.3");

  });

});