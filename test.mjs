import mkdirp from 'mkdirp';
import Promise from 'bluebird';
import { writeFileSync } from 'fs';
import { spawn } from 'child_process';
import assert from 'assert';
import chalk from 'chalk';
import stripAnsi from 'strip-ansi';
import EASTERN from './index.mjs';

EASTERN.NOHOOK = true;

const specs = [
  [
    'should exit 1 if spec undefined',
    `
      import "../../index.mjs";
      // noop
    `,
    1,
    '',
    EASTERN.MESSAGES.MISSING,
  ],
  [
    'should exit 0 if spec defined',
    `
      import spec from "../../index.mjs";
      spec("", () => {});
    `,
    0,
    'Eastern: 1 passing',
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
    '',
    EASTERN.MESSAGES.FAIL,
  ],
  [
    'should exit 1 if exists hiding spec using spec.only',
    `
      import spec from "../../index.mjs";
      spec("", () => {});
      spec.only("", () => {});
    `,
    1,
    '',
    EASTERN.MESSAGES.UNMATCH,
  ],
  [
    'should skip a spec if spec.skip defined',
    `
      import spec from "../../index.mjs";
      spec.skip("", () => {});
    `,
    1,
    '',
    EASTERN.MESSAGES.MISSING,
  ],
  [
    'should timeout a spec if over 100ms',
    `
      import spec from "../../index.mjs";
      spec(
        "",
        async () => {
          await new Promise(resolve => {
            setTimeout(resolve, 500);
          });
        },
        { timeout: 100 }
      );
    `,
    1,
    '',
    EASTERN.MESSAGES.FAIL,
  ],
  [
    '#1: should exit the process immediately when all the tests are completed',
    `
      import spec from '../../index.mjs';
      import { strictEqual } from 'assert';
      import { createServer } from 'http';

      spec('continuous process', () => {
        const server = createServer();
        server.listen(() => {});
        strictEqual(true, false); // hang
        server.close(); // because connection will continue remaining
      });
    `,
    1,
    '',
    EASTERN.MESSAGES.FAIL,
  ],
  [
    'should handle before/after hooks if spec defined',
    `
      import spec from "../../index.mjs";
      import { strictEqual } from "assert";

      let i = 0;
      spec.before(() => {
        strictEqual(i++, 0);
      });
      spec("", () => {i++});
      spec("", () => {i++});
      spec("", () => {i++});
      spec.after(() => {
        strictEqual(i, 4);
      });
    `,
    0,
    'Eastern: 3 passing',
  ],
];

const fixtureDir = './node_modules/~';
mkdirp.sync(fixtureDir);
const evaluteExperimentalModule = (
  title,
  code,
  expectExitCode,
  expectedPass = '',
  expectedError = ''
) => {
  return new Promise((resolve, reject) => {
    const file = `${fixtureDir}/test.mjs`;
    writeFileSync(file, code);

    let actualPass = '';
    let actualError = '';
    const child = spawn('node', [
      '--experimental-modules',
      '--no-warnings',
      file,
    ]);
    child.stdout.on('data', data => {
      const stdout = stripAnsi(data.toString()).trim();
      if (stdout.match(/^Eastern: /)) {
        actualPass += stdout.replace(/\(\d+ ms\)/, '').trim();
      }
    });
    child.stderr.on('data', data => {
      const stderr = stripAnsi(data.toString()).trim();
      if (stderr.match(/^Eastern: /)) {
        actualError += stderr.trim();
      }
    });
    child.on('exit', code => {
      try {
        assert.equal(code, expectExitCode);
        assert.equal(actualPass, expectedPass);
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
