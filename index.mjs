import exitHook from 'exit-hook';
import chalk from 'chalk';

const report = (...args) => {
  console.log(...[' ', ...args]);
};
const warn = (...args) => {
  console.error(...[' ', ...args]);
};
const elapsed = start => Date.now() - start;
export const EASTERN_MESSAGES = {
  FAIL: 'Eastern: test failing',
  MISSING: "Eastern: was imported, but spec isn't passed",
  UNMATCH: "Eastern: number of spec doesn't match the number of passed",
};

let itOnly = false;
let itCount = 0;
let itSuccess = 0;
let itFailure = 0;
const errors = [];

const it = (...args) => {
  itCount++;
  setImmediate(() => {
    if (itOnly === false) {
      _it(...args);
    } else {
      report(chalk.cyan(`- ${title}`));
    }
  });
};
it.x = title => {
  report(chalk.cyan(`- ${title}`));
};
it.disable = title => {
  report(chalk.cyan(`- ${title}`));
};
it.only = (...args) => {
  itCount++;
  itOnly = true;

  setImmediate(() => {
    _it(...args);
  });
};

const _it = async (title, fn) => {
  const start = Date.now();
  try {
    await fn();
    report(
      chalk.green('✓'),
      ` ${chalk.gray(title)}`,
      chalk.grey(`(${elapsed(start)} ms)`)
    );
    itSuccess++;
  } catch (e) {
    itFailure++;
    warn(chalk.red(`${itFailure}) ${title}`));
    errors.push([itFailure, title, e.stack]);
  }
};

export default it;

const begin = Date.now();
exitHook(() => {
  if (global.EASTERN_NOHOOK) {
    return;
  }

  report();
  if (itFailure) {
    report(
      chalk.green(`${itSuccess} passing`),
      chalk.grey(`(${elapsed(begin)} ms)`)
    );
    report(chalk.red(`${itFailure} failing`));
    report();
    errors.map(([num, title, stack]) => {
      warn(`${num}) ${title}\n  ${chalk.red(stack)}`);
    });
    report();

    warn(chalk.red.underline(EASTERN_MESSAGES.FAIL));
    process.exit(1);
  }
  if (itCount === 0) {
    warn(chalk.red.underline(EASTERN_MESSAGES.MISSING));
    process.exit(1);
  }
  if (itCount !== itSuccess) {
    warn(chalk.red.underline(EASTERN_MESSAGES.UNMATCH));
    process.exit(1);
  }
  report(
    chalk.green(`${itSuccess} passing`),
    chalk.grey(`(${elapsed(begin)} ms)`)
  );
});
