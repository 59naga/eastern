import exitHook from 'exit-hook';
import chalk from 'chalk';

// private

let specOnly = false;
let specCount = 0;
let specSuccess = 0;
let specFailure = 0;
const failures = [];

// utils

function log(...args) {
  console.log(...[' ', ...args]);
}
function logWarn(...args) {
  console.error(...[' ', ...args]);
}

async function run(title, fn, opts = {}) {
  const start = Date.now();
  try {
    await _run(fn, opts);
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
  // FIX: #1
  if (specCount === specSuccess + specFailure) {
    process.emit('exit');
  }
}

function _run(fn, opts = {}) {
  let timetId;
  const delay = opts.timeout || spec.TIMEOUT;
  return Promise.race([
    fn(),
    new Promise(
      (_, reject) =>
        (timetId = setTimeout(
          () => reject(new Error(`timeout of ${delay}ms`)),
          delay
        ))
    ),
  ]).then(() => clearTimeout(timetId));
}

// core

const spec = (...args) => {
  specCount++;

  setImmediate(() => {
    if (specOnly === false) {
      run(...args);
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
    run(...args);
  });
};
spec.TIMEOUT = 1000;
spec.MESSAGES = {
  PASS: 'Eastern: d+ passing',
  FAIL: 'Eastern: test failing',
  MISSING: "Eastern: was imported, but spec isn't passed",
  UNMATCH: "Eastern: number of spec doesn't equal the number of pass",
};

export default spec;

// process exit hooks using private

const begin = Date.now();
exitHook(() => {
  if (spec.NOHOOK) {
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

    logWarn(chalk.red.underline(spec.MESSAGES.FAIL));
    process.exit(1);
  }
  if (specCount === 0) {
    logWarn(chalk.red.underline(spec.MESSAGES.MISSING));
    process.exit(1);
  }
  if (specCount !== specSuccess) {
    logWarn(chalk.red.underline(spec.MESSAGES.UNMATCH));
    process.exit(1);
  }

  log(
    chalk.green.underline(`Eastern: ${specSuccess} passing`),
    chalk.grey(`(${Date.now() - begin} ms)`)
  );
});
