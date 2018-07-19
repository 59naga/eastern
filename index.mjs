import exitHook from 'exit-hook';
import chalk from 'chalk';

const log = (...args) => {
  console.log(...[' ', ...args]);
};
const logWarn = (...args) => {
  console.error(...[' ', ...args]);
};
export const EASTERN_MESSAGES = {
  PASS: 'Eastern: d+ passing',
  FAIL: 'Eastern: test failing',
  MISSING: "Eastern: was imported, but spec isn't passed",
  UNMATCH: "Eastern: number of spec doesn't match the number of passed",
};

let specOnly = false;
let specCount = 0;
let specSuccess = 0;
let specFailure = 0;
const failures = [];

const spec = (...args) => {
  specCount++;

  setImmediate(() => {
    if (specOnly === false) {
      _spec(...args);
    } else {
      log(chalk.cyan(`- ${args[0]}`));
    }
  });
};
spec.skip = title => {
  setImmediate(() => {
    log(chalk.cyan(`- ${title}`));
  });
};
spec.only = (...args) => {
  specCount++;
  specOnly = true;

  setImmediate(() => {
    _spec(...args);
  });
};

const _spec = async (title, fn) => {
  const start = Date.now();
  try {
    await fn();
    log(
      chalk.green('✓'),
      ` ${chalk.gray(title)}`,
      chalk.grey(`(${Date.now() - start} ms)`)
    );
    specSuccess++;
  } catch (e) {
    specFailure++;
    logWarn(chalk.red(`${specFailure}) ${title}`));
    failures.push([specFailure, title, e.stack]);
  }
};

export default spec;

const begin = Date.now();
exitHook(() => {
  if (global.EASTERN_NOHOOK) {
    return;
  }

  log();

  if (specFailure) {
    log(
      chalk.green(`${specSuccess} passing`),
      chalk.grey(`(${Date.now() - begin} ms)`)
    );
    log(chalk.red(`${specFailure} failing`));

    log();
    failures.map(([num, title, stack = 'No stacktrace']) => {
      logWarn(`${num}) ${title}\n  ${chalk.red(stack)}`);
    });
    log();

    logWarn(chalk.red.underline(EASTERN_MESSAGES.FAIL));
    process.exit(1);
  }
  if (specCount === 0) {
    logWarn(chalk.red.underline(EASTERN_MESSAGES.MISSING));
    process.exit(1);
  }
  if (specCount !== specSuccess) {
    logWarn(chalk.red.underline(EASTERN_MESSAGES.UNMATCH));
    process.exit(1);
  }

  log(
    chalk.green.underline(`Eastern: ${specSuccess} passing`),
    chalk.grey(`(${Date.now() - begin} ms)`)
  );
});
