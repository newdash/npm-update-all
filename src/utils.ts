import inquirer from "inquirer";

let id = 0;

export async function confirm(message: string, value: boolean) {
  if (value != undefined) {
    return value;
  }
  const key = `confirm_${id++}`;
  const result = await inquirer.prompt([{
    name: key,
    message,
    type: "confirm",
    default: true,
  }]);

  return result[key];
}
