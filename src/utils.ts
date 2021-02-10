import inquirer from "inquirer";

let id = 0;

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
