// @ts-nocheck
import registryUrl from "registry-url";

const DEFAULT_REGISTRY = 'https://registry.npmjs.org/';

async function getRegistry(scope?: string): Promise<string> {
  return new Promise(resolve => {
    try {
      if (scope !== undefined) {
        resolve(registryUrl(scope));
      } else {
        resolve(registryUrl());
      }
    } catch (error) {
      console.log(`Get registry from local config failed, ${error.message}`.red);
      resolve(DEFAULT_REGISTRY);
    }

  });

}


export { getRegistry };
