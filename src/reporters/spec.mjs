import EventEmitter from "events";
import chalk from "chalk";

const isTest = process.env.EASTERN_ENV === "test";

export default class Reporter extends EventEmitter {
  constructor({ stdout, stderr }) {
    super();

    this.testCount = 0;
    this.passCount = 0;
    this.failCount = 0;
    this.skipCount = 0;
    this.failures = [];

    this.on("start", () => {
      this.begin = Date.now();
      stdout.write("\n");
    });
    this.on("end", () => {
      const elapsed = isTest ? "ELAPSED" : Date.now() - this.begin;

      stdout.write("\n");
      stdout.write(
        chalk.green(
          `${this.indent() + this.passCount} passing (${elapsed} ms)\n`
        )
      );
      if (this.skipCount) {
        stdout.write(chalk.cyan(`${this.indent() + this.skipCount} pending\n`));
      }
      if (this.failCount) {
        stdout.write(chalk.red(`${this.indent() + this.failCount} failing\n`));
      }

      this.failures.map(([num, { title }, stack = "No stacktrace"]) => {
        stderr.write("\n");
        stderr.write(`  ${num})  ${title}\n  ${chalk.red(stack)}\n`);
      });
    });

    this.level = 0;
    this.on("suite", ({ title }) => {
      stdout.write(this.indent() + `${title}\n`);
      this.level++;
    });
    this.on("suite end", () => {
      this.level--;
    });

    this.on("test", () => {
      this.testCount++;
    });
    this.on("passed", test => {
      this.passCount++;

      const elapsed =
        isTest && typeof test.elapsed === "number" ? "ELAPSED" : test.elapsed;
      let line = this.indent() + chalk.green("✓");
      line += `  ${chalk.gray(`${test.title} (${elapsed} ms)`)}`;
      line += "\n";
      stdout.write(line);
    });
    this.on("failed", (test, error) => {
      this.failCount++;

      const elapsed =
        isTest && typeof test.elapsed === "number" ? "ELAPSED" : test.elapsed;
      let line = this.indent() + chalk.red(this.failCount + ")");
      if (elapsed || typeof elapsed === "number") {
        line += `  ${chalk.red(`${test.title} (${elapsed} ms)`)}`;
      } else {
        line += `  ${chalk.red(`${test.title}`)}`;
      }
      line += "\n";
      stdout.write(line);

      this.failures.push([
        this.failCount,
        test,
        isTest ? error.stack.split("\n")[0] : error.stack
      ]);
    });
    this.on("pending", ({ title }) => {
      this.skipCount++;

      let line = this.indent();
      line += `${chalk.cyan(`-  ${title}`)}`;
      line += "\n";
      stdout.write(line);
    });
  }
  indent() {
    return Array(this.level + 2).join("  ");
  }
  isComplete() {
    return (
      this.testCount > 0 &&
      this.testCount === this.passCount &&
      this.failCount === 0
    );
  }
}
