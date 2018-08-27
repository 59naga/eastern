setOptions({ concurrency: 1 });
describe("foo", it => {
  it("bar", () => 1);
  it("baz", () => 2);
});
it("bar", () => 3);

export const expects = [1, 2, 3];
