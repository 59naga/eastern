import chalk from "chalk";

const isTest = process.env.EASTERN_ENV === "test";

export default class Reporter {
  constructor(parent = {}, title = "") {
    this.parent = parent;
    this.children = [];

    this.title = title;
    this.begin = Date.now();
    this.space = parent.space ? parent.space + "  " : "  ";
    this.passCount = 0;
    this.failCount = 0;
    this.skipCount = 0;
    this.failures = [];
  }
  isRoot() {
    return this.parent instanceof Reporter === false;
  }
  root() {
    return this.isRoot() ? this : this.parent.root();
  }
  child(title) {
    const child = new Reporter(this, title);
    this.children.push(child);
    return child;
  }
  count() {
    return this.children.reduce(
      (prev, child) => {
        const { pass, fail, skip } = child.count();
        return {
          pass: prev.pass + pass,
          fail: prev.fail + fail,
          skip: prev.skip + skip
        };
      },
      {
        pass: this.passCount,
        fail: this.failCount,
        skip: this.skipCount
      }
    );
  }
  isComplete(count) {
    const { pass, fail, skip } = this.count();
    return pass > 0 && count === pass + skip && fail === 0;
  }

  describe(title, fn) {
    if (fn) {
      console.log(this.space + title);
    } else {
      console.log(this.space + chalk.cyan(title));
    }
  }
  pass(title, start) {
    this.passCount++;

    const elapsed = isTest ? "ELAPSED" : Date.now() - start;
    let line = this.space + chalk.green("✓");
    if (start) {
      line += `  ${chalk.gray(`${title} (${elapsed} ms)`)}`;
    } else {
      line += `  ${chalk.gray(`${title}`)}`;
    }
    console.log(line);
  }
  fail(title, error, start) {
    this.failCount++;

    const elapsed = isTest ? "ELAPSED" : Date.now() - start;
    const failCount = this.root().count().fail;
    let line = this.space + chalk.red(failCount + ")");
    if (start) {
      line += `  ${chalk.red(`${title} (${elapsed} ms)`)}`;
    } else {
      line += `  ${chalk.red(`${title}`)}`;
    }
    console.log(line);

    this.failures.push([
      failCount,
      title,
      isTest ? error.stack.split("\n")[0] : error.stack
    ]);
  }
  skip(title) {
    this.skipCount++;

    console.log(this.space + chalk.cyan(`-  ${title}`));
  }
  outputResult() {
    const elapsed = isTest ? "ELAPSED" : Date.now() - this.begin;
    const { pass, fail, skip } = this.count();

    console.log();
    console.log(
      this.space + chalk.green(`${pass} passing`),
      chalk.grey(`(${elapsed} ms)`)
    );
    if (skip) {
      console.log("  " + chalk.cyan(`${skip} pending`));
    }
    if (fail) {
      console.log("  " + chalk.red(`${fail} failing`));
    }
  }
  outputFailures() {
    this.isRoot() && this.count().fail && console.error();
    this.failures.map(([num, title, stack = "No stacktrace"]) => {
      console.error(`  ${num})  ${title}\n  ${chalk.red(stack)}`);
    });
    this.children.forEach(child => {
      child.outputFailures();
    });
  }
}
