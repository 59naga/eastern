import spec from "eastern";

spec("foo", () => {
  throw new Error("only fail");
});
spec.only("bar", () => {});
