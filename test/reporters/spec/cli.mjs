import SpecReporter from "../../../src/reporters/spec";
import { Process } from "../../helpers";
import root from "../../../src/register";
import { deepEqual } from "assert-diff";

process.on("unhandledRejection", function(error) {
  console.error(error.stack);
  process.exit(1);
});

(async () => {
  const mockProcess = new Process();
  const reporter = new SpecReporter(mockProcess);

  const glob = process.argv.slice(2)[0];
  const url = new URL(glob, new URL(`file://${process.cwd()}/`));
  const { pass = false, stdout = "", stderr = "" } = await import(url);
  await root.evaluate(reporter);
  deepEqual(
    { pass: reporter.isComplete(), ...mockProcess.data },
    { pass, stdout, stderr },
    url
  );
})();
