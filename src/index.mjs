import exitHook from "exit-hook";
import Reporter from "./reporter";
import Describe from "./describe";

const reporter = new Reporter();
const root = new Describe(null, { reporter });

console.log("");
exitHook(() => {
  if (!reporter.isComplete(root.count())) {
    reporter.outputResult();
    reporter.outputFailures();
    process.exit(1);
  }
  reporter.outputResult();
});

export default root.block;
export const describe = root.block.describe;
