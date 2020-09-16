// @ts-nocheck
import * as npm from "npm";

const DEFAULT_REGISTRY = 'https://registry.npmjs.org/';

async function getRegistry(): Promise<string> {
  return new Promise(resolve => {
    npm.load(() => {
      try {
        const registry: string = npm.config.get("registry") || DEFAULT_REGISTRY;
        if (registry.endsWith("/")) {
          resolve(registry);
        } else {
          resolve(`${registry}/`);
        }
      } catch (error) {
        console.log(`Get registry from local config failed, ${error.message}`.red);
        resolve(DEFAULT_REGISTRY);
      }
    });
  });

}


export { getRegistry };
