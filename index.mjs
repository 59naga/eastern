import exitHook from 'exit-hook';
import chalk from 'chalk';

let itOnly = false;
let itCount = 0;
let itSuccess = 0;
let itFailure = 0;

const it = (...args) => {
  itCount++;
  setImmediate(() => {
    if (itOnly === false) {
      _it(...args);
    }
  });
};
it.x = () => {};
it.disable = () => {};
it.only = (...args) => {
  itCount++;
  itOnly = true;

  setImmediate(() => {
    _it(...args);
  });
};

const _it = async (title, fn) => {
  try {
    await fn();
    itSuccess++;
  } catch (e) {
    console.error(chalk.red(`"${title}":\n  ${e.stack}`));
    itFailure++;
  }
};

export default it;

exitHook(() => {
  if (itFailure) {
    console.error(chalk.red.underline('Eastern: test failing'));
    process.exit(1);
  }
  if (itCount === 0) {
    console.error(
      chalk.red.underline('Eastern: was imported, but spec is not defined')
    );
    process.exit(1);
  }
  if (itCount !== itSuccess) {
    console.error(
      chalk.red.underline(
        "Eastern: number of spec doesn't match the success number"
      )
    );
    process.exit(1);
  }
});
