setOptions({ concurrency: 1 });
describe.only("foo", it => {
  it("foo", () => 1);
  it("bar", () => 2);
});
it("bar", () => 3);
describe("baz", it => {
  it.only("foo", () => 4);
});

export const expects = [1, 2, 4];
