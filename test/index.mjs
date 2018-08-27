import Promise from "bluebird";
import throat from "throat";
import { deepEqual } from "assert-diff";
import chalk from "chalk";
import { getFixtures, runAsync } from "./helpers";
import { dirname } from "path";
import findUp from "find-up";

process.env.EASTERN_ENV = "test";

const globs = [
  "./test/**/*.mjs"
  //
  // "!./test/evaluate/**"
];
const passes = [];
const fails = [];

Promise.map(getFixtures(...globs), async ({ title, fixture }) => {
  const cli = findUp.sync(["cli.mjs"], { cwd: dirname(fixture) });
  try {
    await runAsync(cli, fixture);
    passes.push([title]);

    process.stdout.write(chalk.green("."));
  } catch (error) {
    fails.push([title, error]);

    process.stderr.write(chalk.red("."));
    process.exit(1);
  }
})
  .then(() => {
    if (fails.length || passes.length === 0) {
      console.log();
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
