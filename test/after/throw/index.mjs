import spec from "eastern";

spec.after(() => {
  throw new Error("bar");
});

spec("foo", () => {});
