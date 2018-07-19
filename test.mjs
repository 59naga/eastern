import mkdirp from 'mkdirp';
import Promise from 'bluebird';
import { writeFileSync } from 'fs';
import { spawn } from 'child_process';
import assert from 'assert';
import chalk from 'chalk';
import stripAnsi from 'strip-ansi';
import { EASTERN_MESSAGES } from './index.mjs';

global.EASTERN_NOHOOK = true;

const specs = [
  [
    'should exit 1 if spec undefined',
    `import '../../index.mjs'`,
    1,
    EASTERN_MESSAGES.MISSING,
  ],
  [
    'should exit 0 if spec defined',
    `
      import spec from "../../index.mjs";
      spec("1", () => {});
    `,
    0,
  ],
  [
    'should exit 1 if spec failing',
    `
      import spec from "../../index.mjs";
      spec("", () => {
        throw new Error();
      });
    `,
    1,
    EASTERN_MESSAGES.FAIL,
  ],
  [
    'should exit 1 if exists hiding spec using spec.only',
    `
      import spec from "../../index.mjs";
      spec("", () => {});
      spec.only("", () => {});
    `,
    1,
    EASTERN_MESSAGES.UNMATCH,
  ],
  [
    'should skip a spec if spec.skip defined',
    `
      import spec from "../../index.mjs";
      spec.skip("", () => {});
    `,
    1,
    EASTERN_MESSAGES.MISSING,
  ],
];

const fixtureDir = './node_modules/~';
mkdirp.sync(fixtureDir);
const evaluteExperimentalModule = (
  title,
  code,
  expectExitCode,
  expectedError = ''
) => {
  return new Promise((resolve, reject) => {
    const file = `${fixtureDir}/test.mjs`;
    writeFileSync(file, code);

    let actualError = '';
    const child = spawn('node', ['--experimental-modules', file]);
    child.stderr.on('data', data => {
      const stderr = stripAnsi(data.toString()).trim();
      if (stderr.match(/^Eastern: /)) {
        actualError += stderr.trim();
      }
    });
    child.on('exit', code => {
      try {
        assert.equal(code, expectExitCode);
        assert.equal(actualError, expectedError);
      } catch (error) {
        reject(`${title}:\n  ${error}`);
      }
      resolve();
    });
  });
};

Promise.reduce(
  specs,
  async (noop, spec) => {
    await evaluteExperimentalModule(...spec);
    console.log(chalk.green(`pass: ${spec[0]}`));
  },
  'noop'
).catch(error => {
  console.error(chalk.red(`fail: ${error}`));
  process.exit(1);
});
