import { Reporter } from "../helpers";
import EventEmitter from "events";
import root from "../../src/register";
import { deepEqual } from "assert-diff";

process.on("unhandledRejection", function(error) {
  console.error(error.stack);
  process.exit(1);
});

(async () => {
  const mockReporter = new Reporter();

  const glob = process.argv.slice(2)[0];
  const url = new URL(glob, new URL(`file://${process.cwd()}/`));
  const { expects = [], fails = [] } = await import(url);
  deepEqual(expects, await root.evaluate(mockReporter));
  deepEqual(fails, mockReporter.failures, url);
})();
