setOptions({ concurrency: 1 });
it("foo", () => 1);
it("bar", () => 2);
after(() => 5);
describe("baz", (it, describe) => {
  it.after(() => 4);

  describe("beep", (it, describe) => {
    it.after(() => 3);
  });
});

export const expects = [1, 2, 3, 4, 5];
