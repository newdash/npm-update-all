import { getRegistry } from "../src/npm";

describe('NPM internal test Suite', () => {

  it('should support get registry', async () => {
    const registry = await getRegistry();
    expect(registry).not.toBeUndefined();
  });

});