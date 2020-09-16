import inquirer from "inquirer";

export async function confirm(message: string, value: boolean) {
  if (value != undefined) {
    return value;
  }
  const { confirm } = await inquirer.prompt([{
    name: "confirm",
    message,
    type: "confirm",
    default: true,
  }]);

  return confirm;
}
