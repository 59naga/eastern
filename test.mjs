import mkdirp from 'mkdirp';
import Promise from 'bluebird';
import { writeFileSync } from 'fs';
import { spawn } from 'child_process';
import assert from 'assert';
import chalk from 'chalk';

const specs = [
  [
    'should exit 1 if spec undefined',
    `import '../../index.mjs'`,
    1,
    'was imported, but spec is not defined',
  ],
  [
    'should exit 0 if spec defined',
    `
      import spec from "../../index.mjs";
      spec("", () => {});
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
    'test failing',
  ],
  [
    'should exit 1 if exists hiding spec using spec.only',
    `
      import spec from "../../index.mjs";
      spec("", () => {});
      spec.only("", () => {});
    `,
    1,
    "number of spec doesn't match the success number",
  ],
  [
    'should skip a spec if spec.x/spec.disable defined',
    `
      import spec from "../../index.mjs";
      spec.x("", () => {});
      spec.disable("", () => {});
    `,
    1,
    'was imported, but spec is not defined',
  ],
];

mkdirp.sync('./node_modules/~');
const evaluteExperimentalModule = (
  title,
  code,
  expectExitCode,
  expectedError = ''
) => {
  return new Promise((resolve, reject) => {
    const file = './node_modules/~/test.mjs';
    writeFileSync(file, code);

    let actualError = '';
    const child = spawn('node', ['--experimental-modules', file]);
    child.stderr.on('data', data => {
      const stderr = data.toString();
      if (stderr.match(/^Eastern: /)) {
        actualError += stderr.replace(/^Eastern: /, '').trim();
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