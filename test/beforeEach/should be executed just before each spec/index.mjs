import spec from "eastern";
import delay from "delay";

spec.beforeEach(async () => {
  await delay(5);
  console.log("foo");
});
spec("bar", () => {});
spec("bar", () => {});
spec("bar", () => {});
