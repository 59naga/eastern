import Promise from "bluebird";
import { deepEqual } from "assert-diff";
import chalk from "chalk";
import { easternRegister, getLabelsAndFixtures, runAsync } from "./helpers";

easternRegister();
process.env.EASTERN_ENV = "test";

const labels = getLabelsAndFixtures([
  "./test/**/index.mjs",
  "!./test/index.mjs"
]);
const passes = [];
const fails = [];

Promise.each(Object.entries(labels), ([label, fixtures]) => {
  console.log(label);
  return Promise.map(fixtures, async ({ title, fixture, expected }) => {
    try {
      deepEqual(await runAsync(fixture), await import(expected));
      console.log("  " + chalk.green.underline(`✓ ${title}`));
      passes.push([label, title]);
    } catch (error) {
      console.log("  " + chalk.red.underline(`☓ ${title}`));
      fails.push([label, title, error]);
    }
  });
})
  .then(() => {
    if (fails.length) {
      console.warn();
      fails.map(([label, title, error]) => {
        console.log(label, chalk.red.underline(`☓ ${title}`));
        console.warn(`${chalk.red(error.message)}`);
      });
      process.exit(1);
    } else {
      console.log();
      console.log(chalk.green.underline(`${passes.length} specs all passed.`));
    }
  })
  .catch(error => {
    console.warn(error);
    process.exit(1);
  });
