import { describe } from "eastern";

describe(
  "foo",
  it => {
    it("bar");
    it("bar", () => {
      console.log("baz");
    });
  },
  { immediate: false }
);
