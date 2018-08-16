import spec from "eastern";
import delay from "delay";

spec.setOptions({ concurrency: 1 });
spec.afterEach(async () => {
  await delay(5);
  console.log("bar");
});
spec("foo", () => {});
spec("foo", () => {});
spec("foo", () => {});
