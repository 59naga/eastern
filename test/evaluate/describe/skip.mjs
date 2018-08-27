setOptions({ concurrency: 1 });
describe.skip("foo", it => {
  it("bar", () => 1);
  it("baz", () => 2);
});
it("bar", () => 3);
describe("baz");

export const expects = [3];
