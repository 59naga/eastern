import spec from "eastern";
import delay from "delay";

spec.before(() => {
  throw new Error("foo");
});

spec("baz", () => {
  console.log("bar");
});
