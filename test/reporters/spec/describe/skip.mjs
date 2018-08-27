setOptions({ concurrency: 1 });
describe.skip("foo", it => {
  it("bar", () => 1);
  it("baz", () => 2);
});
it("bar", () => 3);
describe("baz");

export const pass = true;
export const stdout = `
  -  foo
  ✓  bar (ELAPSED ms)
  -  baz

  1 passing (ELAPSED ms)
  2 pending
`;
