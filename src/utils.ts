import inquirer from "inquirer";

let id = 0;

export const asyncFilter = async <T = any>(arr: Array<T>, predicate: (value: T) => Promise<boolean>) => {
  const results = await Promise.all(arr.map(predicate));
  return arr.filter((_v, index) => results[index]);
};

export async function confirm(message: string, cliConfirmAll: boolean = false, defaultValue: boolean = true) {

  if (cliConfirmAll === true) {
    let msg = '?'.green + ' ' + message + ' ';
    if (defaultValue) {
      msg += 'Yes'.green;
    } else {
      msg += 'No'.blue;
    }
    console.log(msg);
    return defaultValue;
  }

  const key = `confirm_${id++}`;
  const result = await inquirer.prompt([{
    name: key,
    message,
    type: "confirm",
    default: defaultValue,
  }]);

  return result[key];
}

export const DEFAULT_REGISTRY = 'https://registry.npmjs.org';
