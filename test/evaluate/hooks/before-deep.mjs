setOptions({ concurrency: 1 });
it("foo", () => 2);
it("bar", () => 3);
before(() => 1);
describe("baz", (it, describe) => {
  it.before(() => 4);

  describe("beep", (it, describe) => {
    it.before(() => 5);
  });
});

export const expects = [1, 2, 3, 4, 5];
