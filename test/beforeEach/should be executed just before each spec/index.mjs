import spec from "eastern";
import delay from "delay";

spec.setOptions({ concurrency: 1 });
spec.beforeEach(async () => {
  await delay(5);
  console.log("foo");
});
spec("bar", () => {});
spec("bar", () => {});
spec("bar", () => {});
