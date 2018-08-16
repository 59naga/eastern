import spec from "eastern";
import delay from "delay";

spec.before(() => {
  console.log("foo");
});

spec.before(async () => {
  await delay(15);
  console.log("bar");
});

spec.before(() => {
  console.log("baz");
});

spec("beep", () => {});
spec("beep", () => {});
spec("beep", () => {});
